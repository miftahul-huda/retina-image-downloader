const db = require('./models');

async function migrate() {
    try {
        await db.sequelize.authenticate();
        console.log('Database connection has been established successfully.');

        const queryInterface = db.sequelize.getQueryInterface();
        const tableDefinition = await queryInterface.describeTable('DownloadProgresses');

        if (!tableDefinition.uploadPercentage) {
            console.log('Adding uploadPercentage column to DownloadProgresses table...');
            await queryInterface.addColumn('DownloadProgresses', 'uploadPercentage', {
                type: db.Sequelize.INTEGER,
                allowNull: true,
                defaultValue: 0,
            });
            console.log('Column added successfully.');
        } else {
            console.log('Column uploadPercentage already exists.');
        }
    } catch (error) {
        console.error('Unable to connect to the database or run migration:', error);
    } finally {
        await db.sequelize.close();
    }
}

migrate();
