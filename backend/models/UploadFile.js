module.exports = (sequelize, DataTypes) => {
    const UploadFile = sequelize.define('UploadFile', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        store_id: DataTypes.STRING,
        uploaded_filename: DataTypes.STRING,
        uploaded_by_sfcode: DataTypes.STRING,
        uploaded_by_email: DataTypes.STRING,
        imageCategory: {
            type: DataTypes.STRING,
            field: 'imageCategory'
        },
        createdAt: DataTypes.DATE
    }, {
        tableName: 'uploadfile',
        timestamps: true,
        updatedAt: false
    });
    return UploadFile;
};
