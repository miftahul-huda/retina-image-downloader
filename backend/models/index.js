const Sequelize = require('sequelize');
const config = require('../config/database.js');
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: false
});

// Test the database connection
(async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();


const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.Store = require('./Store')(sequelize, Sequelize);
db.UploadFile = require('./UploadFile')(sequelize, Sequelize);
db.CityRegionArea = require('./CityRegionArea')(sequelize, Sequelize);
db.DownloadJob = require('./DownloadJob')(sequelize, Sequelize);
db.GoogleUser = require('./GoogleUser')(sequelize, Sequelize);
db.DownloadProgress = require('./DownloadProgress')(sequelize, Sequelize);

// Associations
db.Store.hasMany(db.UploadFile, { as: 'upload_files', foreignKey: 'store_id', sourceKey: 'storeid' });
db.UploadFile.belongsTo(db.Store, { as: 'store', foreignKey: 'store_id', targetKey: 'storeid' });

db.GoogleUser.hasMany(db.DownloadJob, { foreignKey: 'userId' });
db.DownloadJob.belongsTo(db.GoogleUser, { foreignKey: 'userId' });

db.DownloadJob.hasOne(db.DownloadProgress, { foreignKey: 'jobId' });
db.DownloadProgress.belongsTo(db.DownloadJob, { foreignKey: 'jobId' });

module.exports = db;
