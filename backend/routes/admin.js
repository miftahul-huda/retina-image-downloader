const express = require('express');
const router = express.Router();
const { GoogleUser } = require('../models');
const requireAdmin = require('../middlewares/requireAdmin');

// Get all users (admin only)
router.get('/users', requireAdmin, async (req, res) => {
    try {
        const users = await GoogleUser.findAll({
            attributes: ['id', 'email', 'name', 'photo', 'isAuthorized', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Register new user (admin only)
router.post('/users/register', requireAdmin, async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Check if user already exists
        const existingUser = await GoogleUser.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already registered' });
        }

        // Create user with placeholder googleId (will be updated on first login)
        const user = await GoogleUser.create({
            googleId: `pending_${Date.now()}`, // Temporary ID until first login
            email,
            name: email.split('@')[0], // Use email prefix as temporary name
            photo: null,
            accessToken: null,
            refreshToken: null,
            isAuthorized: true, // Auto-authorize when admin registers
            isAdmin: false
        });

        res.json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                email: user.email,
                isAuthorized: user.isAuthorized
            }
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});


// Authorize user (admin only - for now just protected)
router.post('/users/:userId/authorize', requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await GoogleUser.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await user.update({ isAuthorized: true });
        res.json({
            message: 'User authorized successfully',
            user: {
                id: user.id,
                email: user.email,
                isAuthorized: user.isAuthorized
            }
        });
    } catch (error) {
        console.error('Error authorizing user:', error);
        res.status(500).json({ error: 'Failed to authorize user' });
    }
});

// Revoke user authorization (admin only - for now just protected)
router.post('/users/:userId/revoke', requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await GoogleUser.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await user.update({ isAuthorized: false });
        res.json({
            message: 'User authorization revoked',
            user: {
                id: user.id,
                email: user.email,
                isAuthorized: user.isAuthorized
            }
        });
    } catch (error) {
        console.error('Error revoking authorization:', error);
        res.status(500).json({ error: 'Failed to revoke authorization' });
    }
});

module.exports = router;
