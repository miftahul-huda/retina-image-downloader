module.exports = (sequelize, DataTypes) => {
  const DownloadProgress = sequelize.define('DownloadProgress', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    jobId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    totalFiles: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    downloadedFiles: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'processing', // processing, completed, failed
    },
    zipUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    query: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  return DownloadProgress;
};
