const express = require('express');
const router = express.Router();
const { GoogleUser } = require('../models');
const verifyToken = require('../middlewares/verifyToken');

// Get all users (admin only - for now just protected)
router.get('/users', verifyToken, async (req, res) => {
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

// Authorize user (admin only - for now just protected)
router.post('/users/:userId/authorize', verifyToken, async (req, res) => {
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
router.post('/users/:userId/revoke', verifyToken, async (req, res) => {
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
