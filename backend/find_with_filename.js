const db = require('./models');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function findWithFilename() {
    try {
        const upload = await db.UploadFile.findOne({
            where: {
                uploaded_filename: {
                    [db.Sequelize.Op.ne]: null,
                    [db.Sequelize.Op.ne]: ''
                }
            },
            include: [{ model: db.Store }]
        });

        if (upload) {
            console.log('Found upload with filename:');
            console.log('ID:', upload.id);
            console.log('Filename:', upload.uploaded_filename);
            console.log('Store:', upload.Store.store_name);
            console.log('Created:', upload.createdAt);
        } else {
            console.log('No uploads with filename found');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await db.sequelize.close();
    }
}

findWithFilename();
