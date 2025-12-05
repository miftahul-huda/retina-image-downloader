const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { GoogleUser } = require('../models');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Verify Google token and return JWT
router.post('/google', async (req, res) => {
    try {
        const { credential } = req.body;

        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Find or create user
        let user = await GoogleUser.findOne({ where: { googleId } });

        if (!user) {
            user = await GoogleUser.create({
                googleId,
                email,
                displayName: name,
                photo: picture
            });
        } else {
            // Update user info
            await user.update({
                email,
                displayName: name,
                photo: picture
            });
        }

        // Generate JWT token
        const jwtToken = jwt.sign(
            {
                id: user.id,
                googleId: user.googleId,
                email: user.email,
                displayName: user.displayName,
                photo: user.photo
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            token: jwtToken,
            user: {
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                photo: user.photo
            }
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(401).json({ error: 'Invalid Google token' });
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