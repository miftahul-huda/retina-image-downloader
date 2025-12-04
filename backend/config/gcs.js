const { Storage } = require('@google-cloud/storage');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const storage = new Storage({
    projectId: process.env.GCLOUD_PROJECT,
});

const bucketName = process.env.GCLOUD_BUCKET;
const bucket = storage.bucket(bucketName);

module.exports = { storage, bucket };
