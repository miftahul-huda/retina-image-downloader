const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { GoogleUser } = require('../models');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Exchange authorization code for tokens
router.post('/google', async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ error: 'Authorization code required' });
        }

        // Exchange code for tokens
        const oauth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            'postmessage' // For authorization code flow
        );

        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Get user info
        const ticket = await oauth2Client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Find user by googleId first, then by email (for pre-registered users)
        let user = await GoogleUser.findOne({ where: { googleId } });

        if (!user) {
            // Check if user was pre-registered by email
            user = await GoogleUser.findOne({ where: { email } });

            if (user && user.googleId.startsWith('pending_')) {
                // Update pending user with actual googleId
                await user.update({
                    googleId,
                    name: name,
                    photo: picture,
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token
                });
            }
        }

        // If user still doesn't exist, return error (no auto-registration)
        if (!user) {
            return res.status(403).json({
                error: 'User not registered',
                message: 'Your email is not registered in the system. Please contact the administrator to register your account.',
                email: email
            });
        }

        // Update user's tokens and info (for existing users)
        if (!user.googleId.startsWith('pending_')) {
            await user.update({
                email,
                name: name,
                photo: picture,
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token || user.refreshToken
            });
        }

        // Check if user is authorized
        if (!user.isAuthorized) {
            return res.status(403).json({
                error: 'User not authorized',
                message: 'Your account is not authorized to access this application. Please contact the administrator.',
                email: email
            });
        }

        // Generate JWT token
        const jwtToken = jwt.sign(
            {
                id: user.id,
                googleId: user.googleId,
                email: user.email,
                displayName: user.name,
                photo: user.photo,
                isAdmin: user.isAdmin
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            token: jwtToken,
            user: {
                id: user.id,
                email: user.email,
                displayName: user.name,
                photo: user.photo,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(401).json({ error: 'Invalid authorization code' });
    }
});

// Get current user from JWT
router.get('/me', async (req, res) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        const user = await GoogleUser.findByPk(decoded.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            photo: user.photo
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(403).json({ error: 'Invalid token' });
    }
});

// Logout (client-side only, just for consistency)
router.post('/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;