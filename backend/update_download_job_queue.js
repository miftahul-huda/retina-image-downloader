const db = require('./models');

async function updateDownloadJobModel() {
    try {
        console.log('Updating DownloadJob model...');

        // Add queuePosition column
        const [queuePosResults] = await db.sequelize.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='DownloadJobs' AND column_name='queuePosition'
        `);

        if (queuePosResults.length === 0) {
            await db.sequelize.query(`
                ALTER TABLE "DownloadJobs" 
                ADD COLUMN "queuePosition" INTEGER
            `);
            console.log('Added queuePosition column.');
        } else {
            console.log('queuePosition column already exists.');
        }

        // Add queuedAt column
        const [queuedAtResults] = await db.sequelize.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='DownloadJobs' AND column_name='queuedAt'
        `);

        if (queuedAtResults.length === 0) {
            await db.sequelize.query(`
                ALTER TABLE "DownloadJobs" 
                ADD COLUMN "queuedAt" TIMESTAMP WITH TIME ZONE
            `);
            console.log('Added queuedAt column.');
        } else {
            console.log('queuedAt column already exists.');
        }

        await db.sequelize.close();
        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

updateDownloadJobModel();
