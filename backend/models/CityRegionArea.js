module.exports = (sequelize, DataTypes) => {
    const CityRegionArea = sequelize.define('CityRegionArea', {
        city: DataTypes.STRING,
        region: DataTypes.STRING,
        area: DataTypes.STRING
    }, {
        tableName: 'cityregionarea',
        timestamps: false
    });
    CityRegionArea.removeAttribute('id');
    return CityRegionArea;
};
