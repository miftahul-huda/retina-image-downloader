const express = require('express');
const router = express.Router();
const masterDataController = require('../controllers/masterDataController');
const uploadController = require('../controllers/uploadController');
const downloadController = require('../controllers/downloadController');
const requireLogin = require('../middlewares/requireLogin');
const imageController = require('../controllers/imageController');

/**
 * @swagger
 * /master-data:
 *   get:
 *     summary: Retrieve master data (options for filters)
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Master data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 areas:
 *                   type: array
 *                   items:
 *                     type: string
 *                 regions:
 *                   type: array
 *                   items:
 *                     type: string
 *                 cities:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.get('/master-data', masterDataController.getMasterData);

/**
 * @swagger
 * /uploads:
 *   get:
 *     summary: Retrieve list of uploaded files with filters
 *     tags: [Uploads]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *       - in: query
 *         name: area
 *         schema:
 *           type: string
 *         description: Filter by area
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Filter by region
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: imageCategory
 *         schema:
 *           type: string
 *         description: Filter by image category
 *     responses:
 *       200:
 *         description: List of uploads
 */
router.get('/uploads', uploadController.getUploads);

/**
 * @swagger
 * /download/start:
 *   post:
 *     summary: Start a new bulk download job
 *     tags: [Downloads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               area:
 *                 type: string
 *               region:
 *                 type: string
 *               city:
 *                 type: string
 *               imageCategory:
 *                 type: string
 *               sendEmail:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Download job started successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/download/start', requireLogin, downloadController.startDownloadJob);

/**
 * @swagger
 * /download/active:
 *   get:
 *     summary: Get the current user's active or last download job
 *     tags: [Downloads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active job details
 *       401:
 *         description: Unauthorized
 */
router.get('/download/active', requireLogin, downloadController.getActiveJob);

/**
 * @swagger
 * /download/queue:
 *   get:
 *     summary: Get the current status of the download queue
 *     tags: [Downloads]
 *     responses:
 *       200:
 *         description: Queue status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 queuedJobs:
 *                   type: integer
 */
router.get('/download/queue', downloadController.getQueueStatus);

/**
 * @swagger
 * /download/cancel/{jobId}:
 *   post:
 *     summary: Cancel a running download job
 *     tags: [Downloads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Job cancelled successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/download/cancel/:jobId', requireLogin, downloadController.cancelDownloadJob);

/**
 * @swagger
 * /download/status/{jobId}:
 *   get:
 *     summary: Get status of a specific job
 *     tags: [Downloads]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Job status
 */
router.get('/download/status/:jobId', downloadController.getJobStatus);

/**
 * @swagger
 * /image:
 *   get:
 *     summary: Get a signed URL for an image
 *     tags: [General]
 *     parameters:
 *       - in: query
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: The GCS path of the image
 *     responses:
 *       200:
 *         description: Image URL retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imageUrl:
 *                   type: string
 */
router.get('/image', imageController.getImage);

module.exports = router;
