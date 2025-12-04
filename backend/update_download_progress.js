const db = require('./models');

async function updateDownloadProgress() {
    try {
        console.log('Updating DownloadProgress model...');

        // Check if query column exists
        const [results] = await db.sequelize.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='DownloadProgresses' AND column_name='query'
        `);

        if (results.length === 0) {
            await db.sequelize.query(`
                ALTER TABLE "DownloadProgresses" 
                ADD COLUMN "query" TEXT
            `);
            console.log('Added query column to DownloadProgresses.');
        } else {
            console.log('query column already exists.');
        }

        await db.sequelize.close();
        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

updateDownloadProgress();
