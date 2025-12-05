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
        // Send HTML page that redirects via JavaScript
        // This ensures cookies are set before redirect
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Login Successful</title>
            </head>
            <body>
                <script>
                    // Wait a moment for cookies to be set, then redirect
                    setTimeout(function() {
                        window.location.href = '${frontendUrl}/?login_success=true';
                    }, 100);
                </script>
                <p>Login successful! Redirecting...</p>
            </body>
            </html>
        `);
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