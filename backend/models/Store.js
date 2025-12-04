module.exports = (sequelize, DataTypes) => {
    const Store = sequelize.define('Store', {
        storeid: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        store_name: DataTypes.STRING,
        store_city: DataTypes.STRING,
        store_region: DataTypes.STRING,
        store_area: DataTypes.STRING
    }, {
        tableName: 'store',
        timestamps: false
    });
    return Store;
};
