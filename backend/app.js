const express = require('express');
const cors = require('cors');
const db = require('./models');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration - permissive for unified deployment
app.use(cors({
    origin: true, // Allow all origins for unified deployment
    credentials: true
}));
app.use(express.json());

app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Serve static files from the frontend build directory (for unified deployment)
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    console.log('Serving static files from:', distPath);
    app.use(express.static(distPath));
} else {
    console.log('Warning: dist directory not found at:', distPath);
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Serve index.html for any non-API routes (SPA support) - must be last
app.use((req, res, next) => {
    // Skip API routes and health check
    if (req.path.startsWith('/api') || req.path === '/health') {
        return next();
    }
    // Serve index.html for all other routes
    if (fs.existsSync(distPath)) {
        res.sendFile(path.join(distPath, 'index.html'));
    } else {
        res.status(404).send('Frontend not found');
    }
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Dist path exists: ${fs.existsSync(distPath)}`);
});

// Trigger restart
