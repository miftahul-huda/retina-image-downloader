const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email', 'https://www.googleapis.com/auth/drive.file']
    })
);

router.get(
    '/google/callback',
    passport.authenticate('google'),
    (req, res) => {
        // Redirect to frontend URL (supports dev and production)
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/?login_success=true`);
    }
);

router.get('/logout', (req, res) => {
    req.logout(() => {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(frontendUrl);
    });
});

router.get('/current_user', (req, res) => {
    res.send(req.user);
});

module.exports = router;