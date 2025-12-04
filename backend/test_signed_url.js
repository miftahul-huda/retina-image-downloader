const { bucket } = require('./config/gcs');
const db = require('./models');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function testSignedUrl() {
    try {
        const upload = await db.UploadFile.findOne();
        if (!upload) {
            console.log('No uploads found');
            return;
        }

        console.log('Testing with file:', upload.uploaded_filename);

        // Extract the file path from gs:// URL
        const filePath = upload.uploaded_filename.replace(/^gs:\/\/[^\/]+\//, '');
        console.log('Extracted file path:', filePath);

        const file = bucket.file(filePath);

        // Check if file exists
        const [exists] = await file.exists();
        console.log('File exists:', exists);

        if (exists) {
            // Generate a signed URL
            const [signedUrl] = await file.getSignedUrl({
                action: 'read',
                expires: Date.now() + 60 * 60 * 1000, // 1 hour
            });
            console.log('Signed URL generated successfully:');
            console.log(signedUrl.substring(0, 100) + '...');
        }
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await db.sequelize.close();
    }
}

testSignedUrl();
