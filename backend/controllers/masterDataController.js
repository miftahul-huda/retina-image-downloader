const db = require('../models');

exports.getMasterData = async (req, res) => {
    console.log('[masterDataController] Entered getMasterData function.');
    try {
        console.log('[masterDataController] Preparing to query CityRegionArea...');
        const data = await db.CityRegionArea.findAll({
            attributes: ['area', 'region', 'city'],
            group: ['area', 'region', 'city'],
            order: [['area', 'ASC'], ['region', 'ASC'], ['city', 'ASC']]
        });
        console.log('[masterDataController] Query finished. Sending response.');

        res.json(data);
    } catch (error) {
        console.error('Error fetching master data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
