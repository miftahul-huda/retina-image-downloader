const express = require('express');
const router = express.Router();
const masterDataController = require('../controllers/masterDataController');
const uploadController = require('../controllers/uploadController');
const downloadController = require('../controllers/downloadController');
const requireLogin = require('../middlewares/requireLogin');
const imageController = require('../controllers/imageController');

router.get('/master-data', masterDataController.getMasterData);
router.get('/uploads', uploadController.getUploads);
router.post('/download/start', requireLogin, downloadController.startDownloadJob);
router.get('/download/active', requireLogin, downloadController.getActiveJob);
router.get('/download/queue', downloadController.getQueueStatus);
router.post('/download/cancel/:jobId', requireLogin, downloadController.cancelDownloadJob);
router.get('/download/status/:jobId', downloadController.getJobStatus);
router.get('/image', imageController.getImage);

module.exports = router;
