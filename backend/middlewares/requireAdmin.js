const jwt = require('jsonwebtoken');
const { GoogleUser } = require('../models');

module.exports = async (req, res, next) => {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch full user to check admin status
        const user = await GoogleUser.findByPk(decoded.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        req.user = decoded;
        req.fullUser = user;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};
