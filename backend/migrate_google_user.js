/**
 * Database migration script to add OAuth token fields to GoogleUsers table
 * Run this script once to update the existing GoogleUsers table schema
 * 
 * Usage: node migrate_google_user.js
 */

const db = require('./models');

async function migrate() {
    try {
        console.log('Starting migration: Adding accessToken and refreshToken to GoogleUsers...');

        await db.sequelize.query(`
            ALTER TABLE "GoogleUsers" 
            ADD COLUMN IF NOT EXISTS "accessToken" TEXT,
            ADD COLUMN IF NOT EXISTS "refreshToken" TEXT;
        `);

        console.log('✓ Migration successful! Added accessToken and refreshToken columns.');
        console.log('Note: Existing users will need to re-login to grant Google Drive permissions.');

        process.exit(0);
    } catch (error) {
        console.error('✗ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
