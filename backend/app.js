const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const db = require('./models');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('./config/passport'); // Load passport configuration

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:3000'  // Allow backend to serve frontend
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());

app.use(
    session({
        secret: process.env.COOKIE_KEY,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            secure: true, // Required for sameSite: 'none'
            sameSite: 'none', // Allow cross-domain cookies
            httpOnly: true
        }
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);

// Serve static files from the frontend build directory
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));

    // Serve index.html for any other requests (SPA routing)
    app.get('/*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Trigger restart
