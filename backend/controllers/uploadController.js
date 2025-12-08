const db = require('../models');
const { Op } = require('sequelize');
const { bucket } = require('../config/gcs');

exports.getUploads = async (req, res) => {
    try {
        const { startDate, endDate, area, region, city, page = 1, limit = 10, imageCategory } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (startDate && endDate) {
            whereClause.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }
        if (imageCategory) {
            whereClause.imageCategory = imageCategory;
        }

        const storeWhereClause = {};
        if (area) storeWhereClause.store_area = area;
        if (region) storeWhereClause.store_region = region;
        if (city) storeWhereClause.store_city = city;

        const { count, rows } = await db.UploadFile.findAndCountAll({
            where: whereClause,
            include: [{
                model: db.Store,
                as: 'store',
                where: storeWhereClause,
                required: true
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        console.log(`Found ${count} records. Processing rows...`);

        const data = rows.map((row) => {
            let url = '';
            if (row.uploaded_filename) {
                // Use relative path for unified deployment
                url = `/api/image?filename=${encodeURIComponent(row.uploaded_filename)}`;
            }

            return {
                id: row.id,
                UPLOADER_SFCODE: row.uploaded_by_sfcode,
                UPLOADER_EMAIL: row.uploaded_by_email,
                createdAt: row.createdAt,
                OUTLET_NAME: row.store.store_name,
                OUTLET_CITY: row.store.store_city,
                OUTLET_REGION: row.store.store_region,
                OUTLET_AREA: row.store.store_area,
                thumbnailUrl: url,
                originalFilename: row.uploaded_filename
            };
        });

        res.json({
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit),
            data
        });
    } catch (error) {
        console.error('Error fetching uploads:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
