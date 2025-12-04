const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { GoogleUser } = require('../models');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await GoogleUser.findByPk(id);
    done(null, user);
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/callback',
            proxy: true,
            accessType: 'offline',
            prompt: 'consent'
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const [user, created] = await GoogleUser.findOrCreate({
                    where: { googleId: profile.id },
                    defaults: {
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        photo: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
                        accessToken,
                        refreshToken
                    },
                });

                // Update tokens and photo if user already exists
                if (!created) {
                    await user.update({
                        photo: profile.photos && profile.photos[0] ? profile.photos[0].value : user.photo,
                        accessToken,
                        refreshToken: refreshToken || user.refreshToken // Keep old refresh token if new one not provided
                    });
                }

                done(null, user);
            } catch (err) {
                done(err, null);
            }
        }
    )
);
