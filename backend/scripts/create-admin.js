require('dotenv').config();
const { GoogleUser } = require('./models');

async function createAdminUser() {
    try {
        const adminEmail = 'miftahul.huda@devoteam.com';
        
        // Check if admin already exists
        const existingAdmin = await GoogleUser.findOne({ where: { email: adminEmail } });
        
        if (existingAdmin) {
            console.log('Admin user already exists:', adminEmail);
            process.exit(0);
        }
        
        // Create admin user
        const admin = await GoogleUser.create({
            googleId: `pending_admin_${Date.now()}`,
            email: adminEmail,
            name: 'Admin',
            photo: null,
            accessToken: null,
            refreshToken: null,
            isAuthorized: true,
            isAdmin: true
        });
        
        console.log('✅ Admin user created successfully!');
        console.log('Email:', admin.email);
        console.log('You can now login with this email.');
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
}

createAdminUser();
