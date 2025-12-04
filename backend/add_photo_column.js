const db = require('./models');

async function addPhotoColumn() {
    try {
        console.log('Checking database connection...');

        // Check if column already exists
        const [results] = await db.sequelize.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='GoogleUsers' AND column_name='photo'
        `);

        if (results.length > 0) {
            console.log('Column "photo" already exists in GoogleUsers table.');
        } else {
            // Add the column
            await db.sequelize.query(`
                ALTER TABLE "GoogleUsers" 
                ADD COLUMN "photo" VARCHAR(255)
            `);
            console.log('Successfully added "photo" column to GoogleUsers table.');
        }

        await db.sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

addPhotoColumn();
