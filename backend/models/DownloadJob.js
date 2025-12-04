'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DownloadJob extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      DownloadJob.belongsTo(models.GoogleUser, { foreignKey: 'userId' });
    }
  }
  DownloadJob.init({
    userId: DataTypes.INTEGER, // This will be associated with the User model
    status: {
      type: DataTypes.STRING,
      defaultValue: 'queued',
    },
    totalFiles: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    processedFiles: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    currentFile: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    queuePosition: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    queuedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    zipFilePath: DataTypes.STRING,
    error: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'DownloadJob',
  });
  return DownloadJob;
};
