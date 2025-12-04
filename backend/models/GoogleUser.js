'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GoogleUser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      GoogleUser.hasMany(models.DownloadJob, { foreignKey: 'userId' });
    }
  }
  GoogleUser.init({
    googleId: DataTypes.STRING,
    email: DataTypes.STRING,
    name: DataTypes.STRING,
    photo: DataTypes.STRING,
    accessToken: DataTypes.TEXT,
    refreshToken: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'GoogleUser',
    tableName: 'GoogleUsers'
  });
  return GoogleUser;
};
