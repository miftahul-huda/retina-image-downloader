const express = require('express');
const cors = require('cors');
const db = require('./models');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration - simplified for JWT
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:3000'
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
    }
}));
app.use(express.json());

app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);

// Serve static files from the frontend build directory (only for unified deployment)
// Commented out for separate services deployment
// const distPath = path.join(__dirname, 'dist');
// if (fs.existsSync(distPath)) {
//     app.use(express.static(distPath));
//     app.get('*', (req, res) => {
//         res.sendFile(path.join(distPath, 'index.html'));
//     });
// }

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Trigger restart
