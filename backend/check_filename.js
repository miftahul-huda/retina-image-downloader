const db = require('./models');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function check() {
    try {
        const upload = await db.UploadFile.findOne();
        if (upload) {
            console.log('Sample uploaded_filename:', upload.uploaded_filename);
        } else {
            console.log('No uploads found');
        }
    } catch (error) {
        console.error(error);
    } finally {
        await db.sequelize.close();
    }
}

check();
