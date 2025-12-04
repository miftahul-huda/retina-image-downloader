const db = require('./models');

const syncDb = async () => {
    try {
        await db.sequelize.sync();
        console.log('Database synchronized successfully.');
    } catch (error) {
        console.error('Unable to synchronize the database:', error);
    } finally {
        await db.sequelize.close();
    }
};

syncDb();