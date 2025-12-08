const { CityRegionArea, Store, UploadFile, DownloadJob, DownloadProgress, GoogleUser } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const excel = require('exceljs');
const { storage } = require('../config/gcs');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
require('dotenv').config();
const bucketName = process.env.GCLOUD_BUCKET || 'retail-intelligence-bucket';

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

/**
 * Upload file to user's Google Drive
 * @param {string} filePath - Local path to the file
 * @param {string} fileName - Name for the file in Drive
 * @param {object} user - User object with OAuth tokens
 * @returns {Promise<{fileId: string, webViewLink: string}>}
 */
async function uploadToDrive(filePath, fileName, user) {
    console.log(`Attempting to upload ${fileName} to Google Drive for user ${user.email}`);

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );

    console.log('Setting OAuth credentials...');
    oauth2Client.setCredentials({
        access_token: user.accessToken,
        refresh_token: user.refreshToken
    });

    // Auto-refresh token if expired
    oauth2Client.on('tokens', async (tokens) => {
        console.log('Tokens event triggered - refreshing tokens');
        if (tokens.refresh_token) {
            console.log('Updating refresh token in database');
            await GoogleUser.update(
                { refreshToken: tokens.refresh_token },
                { where: { id: user.id } }
            );
        }
        if (tokens.access_token) {
            console.log('Updating access token in database');
            await GoogleUser.update(
                { accessToken: tokens.access_token },
                { where: { id: user.id } }
            );
            console.log('Access token refreshed successfully');
        }
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const fileMetadata = {
        name: fileName,
        mimeType: 'application/zip'
    };

    const media = {
        mimeType: 'application/zip',
        body: fs.createReadStream(filePath)
    };

    try {
        console.log('Creating file in Google Drive...');
        const file = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id, webViewLink, webContentLink'
        });

        console.log(`File created with ID: ${file.data.id}`);

        // Make the file accessible to anyone with the link
        console.log('Setting file permissions...');
        await drive.permissions.create({
            fileId: file.data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            }
        });

        console.log('Upload to Google Drive completed successfully');
        return {
            fileId: file.data.id,
            webViewLink: file.data.webViewLink,
            webContentLink: file.data.webContentLink
        };
    } catch (error) {
        console.error('Error uploading to Google Drive:', error.message);
        console.error('Error details:', {
            code: error.code,
            status: error.status,
            message: error.message
        });

        // If it's an auth error, provide more context
        if (error.code === 401 || error.status === 401) {
            console.error('Authentication failed - user may need to re-login');
            throw new Error('Google Drive authentication failed. Please logout and login again to refresh your credentials.');
        }

        throw error;
    }
}

/**
 * Process the next job in the queue
 */
async function processNextInQueue() {
    try {
        // Find the next queued job with the lowest queue position
        const nextJob = await DownloadJob.findOne({
            where: { status: 'queued' },
            order: [['queuePosition', 'ASC']],
            include: [{ model: GoogleUser, as: 'GoogleUser' }]
        });

        if (nextJob) {
            console.log(`Processing next job in queue: ${nextJob.id}`);

            // Update job status to processing
            await nextJob.update({
                status: 'processing',
                queuePosition: null
            });

            // Get the query from DownloadProgress
            const progress = await DownloadProgress.findOne({ where: { jobId: nextJob.id } });
            const query = progress ? JSON.parse(progress.query || '{}') : {};

            // Start processing
            processDownload(nextJob.id, query, nextJob.GoogleUser);

            // Update queue positions for remaining jobs
            await DownloadJob.decrement('queuePosition', {
                where: {
                    status: 'queued',
                    queuePosition: { [Op.gt]: 0 }
                }
            });
        } else {
            console.log('No more jobs in queue.');
        }
    } catch (error) {
        console.error('Error processing next in queue:', error);
    }
}

async function processDownload(jobId, query, user) {
    const job = await DownloadJob.findByPk(jobId);
    if (!job) {
        console.error(`Job with id ${jobId} not found.`);
        return;
    }

    let progress;

    try {
        console.log("Fetching files for download job:", jobId);
        const { startDate, endDate, area, region, city, imageCategory, sendEmail } = query;

        let whereClause = {};

        console.log("Dates: ", startDate, endDate);
        if (startDate && endDate) {
            whereClause.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)],
            };
        }
        if (imageCategory) {
            whereClause.imageCategory = imageCategory;
        }
        console.log("Store filters:", { area, region, city });
        let storeWhereClause = {};
        if (area) storeWhereClause.store_area = area;
        if (region) storeWhereClause.store_region = region;
        if (city) storeWhereClause.store_city = city;

        console.log("File where clause:", whereClause);

        const files = await UploadFile.findAll({
            where: whereClause,
            include: [{
                model: Store,
                as: 'store',
                where: storeWhereClause,
                required: true,
            }],
        });

        console.log(`Found ${files.length} files for download job ${jobId}`);


        if (files.length === 0) {
            await job.update({ status: 'failed', error: 'No files found for the selected criteria.' });
            return;
        }

        console.log("Updating download progress");
        progress = await DownloadProgress.findOne({ where: { jobId: job.id } });
        if (!progress) {
            // Fallback: create if not exists (shouldn't happen with queue system)
            progress = await DownloadProgress.create({
                jobId: job.id,
                totalFiles: files.length,
                downloadedFiles: 0,
                status: 'processing',
            });
        } else {
            await progress.update({
                totalFiles: files.length,
                status: 'processing',
            });
        }

        const zipFileName = `retina-images-${Date.now()}.zip`;
        const tempDir = path.join(__dirname, '..', 'temp');
        const jobDir = path.join(tempDir, `job-${jobId}`);

        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        if (!fs.existsSync(jobDir)) {
            fs.mkdirSync(jobDir, { recursive: true });
        }

        // 1. Generate Excel File
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Uploads');
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Uploader SF Code', key: 'uploader_sfcode', width: 20 },
            { header: 'Uploader Email', key: 'uploader_email', width: 30 },
            { header: 'Created At', key: 'createdAt', width: 20 },
            { header: 'Image Category', key: 'imageCategory', width: 20 },
            { header: 'Outlet Name', key: 'outlet_name', width: 30 },
            { header: 'Outlet City', key: 'outlet_city', width: 20 },
            { header: 'Outlet Region', key: 'outlet_region', width: 20 },
            { header: 'Outlet Area', key: 'outlet_area', width: 20 },
            { header: 'Uploaded Filename', key: 'uploaded_filename', width: 40 },
        ];

        files.forEach(file => {
            worksheet.addRow({
                id: file.id,
                uploader_sfcode: file.uploaded_by_sfcode,
                uploader_email: file.uploaded_by_email,
                createdAt: file.createdAt,
                imageCategory: file.imageCategory,
                outlet_name: file.store.store_name,
                outlet_city: file.store.store_city,
                outlet_region: file.store.store_region,
                outlet_area: file.store.store_area,
                uploaded_filename: file.uploaded_filename,
            });
        });

        const excelPath = path.join(jobDir, 'uploads.xlsx');
        await workbook.xlsx.writeFile(excelPath);

        // 2. Download Files in Parallel
        const BATCH_SIZE = 5; // Adjust concurrency here

        for (let i = 0; i < files.length; i += BATCH_SIZE) {
            const batch = files.slice(i, i + BATCH_SIZE);
            await Promise.all(batch.map(async (file) => {
                try {
                    const gcsFileName = file.uploaded_filename;
                    if (gcsFileName) {
                        const store = file.store;
                        const folderPath = path.join(jobDir, store.store_area, store.store_region, store.store_city);

                        if (!fs.existsSync(folderPath)) {
                            fs.mkdirSync(folderPath, { recursive: true });
                        }

                        const shortFileName = gcsFileName.replace(`gs://${bucketName}/`, '');
                        const localFilePath = path.join(folderPath, path.basename(shortFileName));

                        await storage.bucket(bucketName).file(shortFileName).download({ destination: localFilePath });
                    }
                } catch (err) {
                    console.error(`Error downloading file ${file.uploaded_filename}:`, err.message);
                    // Continue even if one file fails
                }
            }));

            // Calculate downloaded files based on current position in loop
            const downloadedFiles = Math.min(i + BATCH_SIZE, files.length);

            // Update progress after each batch
            await progress.update({ downloadedFiles: downloadedFiles });

            // Check for cancellation
            const currentJob = await DownloadJob.findByPk(jobId);
            if (currentJob.status === 'cancelled') {
                console.log(`Job ${jobId} was cancelled. Stopping process.`);
                // Cleanup
                if (fs.existsSync(jobDir)) {
                    fs.rmSync(jobDir, { recursive: true, force: true });
                }
                await progress.update({ status: 'cancelled' });
                return;
            }
        }

        // 3. Zip the directory
        await progress.update({ status: 'zipping' });
        const localZipPath = path.join(tempDir, zipFileName);
        const output = fs.createWriteStream(localZipPath);
        const archive = archiver('zip', {
            zlib: { level: 9 },
        });

        archive.pipe(output);
        archive.directory(jobDir, false); // Zip the contents of jobDir
        await archive.finalize();

        // Wait for zip to finish writing
        await new Promise((resolve, reject) => {
            output.on('close', resolve);
            output.on('error', reject);
        });

        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
        await progress.update({ status: 'zipping_completed' });

        // 4. Upload Zip and Cleanup
        try {
            // Upload to Google Drive
            console.log('Uploading to Google Drive...');
            await progress.update({ status: 'uploading_to_drive' });
            const driveResult = await uploadToDrive(localZipPath, zipFileName, user);
            console.log(`Uploaded to Google Drive with file ID: ${driveResult.fileId}`);
            await progress.update({ status: 'drive_upload_completed' });

            // Also upload to GCS for backup
            /*const gcsDest = `retina-image-downloads/${zipFileName}`;
            await storage.bucket(bucketName).upload(localZipPath, {
                destination: gcsDest,
            });
            console.log(`${localZipPath} uploaded to ${bucketName}/${gcsDest}`);
            */

            // Clean up local files
            fs.unlinkSync(localZipPath);
            fs.rmSync(jobDir, { recursive: true, force: true });

            await progress.update({
                status: 'completed',
                zipUrl: driveResult.webContentLink,
                downloadedFiles: files.length
            });
            await job.update({
                status: 'completed',
                zipFilePath: `drive://${driveResult.fileId}`
            });

            if (sendEmail === true) {
                // Send email with Google Drive link
                await progress.update({ status: 'sending_email' });
                const mailOptions = {
                    from: process.env.GMAIL_USER,
                    to: user.email,
                    subject: 'Your Retina Image Download is Ready',
                    html: `
                        <h2>Your Retina Image Download is Complete</h2>
                        <p>Hello ${user.name},</p>
                        <p>Your requested image download has been processed successfully.</p>
                        <p><strong>Download Details:</strong></p>
                        <ul>
                            <li>Total files: ${files.length}</li>
                            <li>ZIP file name: ${zipFileName}</li>
                        </ul>
                        <p>The file has been uploaded to your Google Drive and is ready for download.</p>
                        <p><a href="${driveResult.webViewLink}" style="background-color: #E60000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 16px 0;">Open in Google Drive</a></p>
                        <p>Or copy this link: <a href="${driveResult.webViewLink}">${driveResult.webViewLink}</a></p>
                        <p><em>This file will remain in your Google Drive until you delete it.</em></p>
                        <p>Thank you for using Retina Downloader!</p>
                    `,
                    text: `Your Retina Image Download is Complete\n\nHello ${user.name},\n\nYour requested image download has been processed successfully.\n\nTotal files: ${files.length}\nZIP file name: ${zipFileName}\n\nThe file has been uploaded to your Google Drive: ${driveResult.webViewLink}\n\nThank you for using Retina Downloader!`
                };

                transporter.sendMail(mailOptions, async (error, info) => {
                    if (error) {
                        console.error('Error sending email:', error);
                    } else {
                        console.log('Email sent: ' + info.response);
                        await progress.update({ status: 'email_sent' });
                        await progress.update({ status: 'completed' });
                    }
                });
            }
            else {
                console.log('Skipping email notification (user declined)');
                await progress.update({ status: 'completed' });
            }
        } catch (error) {
            console.error('Error in post-processing:', error);
            await job.update({ status: 'failed', error: error.message });
            if (progress) {
                await progress.update({ status: 'failed' });
            }
        }

    } catch (error) {
        console.error('Error processing download job:', error);
        await job.update({ status: 'failed', error: error.message });
        if (progress) {
            await progress.update({ status: 'failed' });
        }
    } finally {
        // Process next job in queue regardless of success or failure
        await processNextInQueue();
    }
}

exports.startDownloadJob = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch full user with tokens from database
        const user = await GoogleUser.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if user already has an active or queued job
        const existingUserJob = await DownloadJob.findOne({
            where: {
                userId,
                status: { [Op.in]: ['queued', 'processing'] }
            }
        });

        if (existingUserJob) {
            return res.status(400).json({
                error: 'You already have an active or queued download request',
                existingJobId: existingUserJob.id,
                status: existingUserJob.status,
                queuePosition: existingUserJob.queuePosition
            });
        }

        // Check if there's already a job processing
        const activeJob = await DownloadJob.findOne({
            where: { status: 'processing' }
        });

        let job;
        let queueInfo = {};

        if (activeJob) {
            // Get the highest queue position
            const maxQueuePosition = await DownloadJob.max('queuePosition', {
                where: { status: 'queued' }
            });
            const newQueuePosition = (maxQueuePosition || 0) + 1;

            // Create job with queued status
            job = await DownloadJob.create({
                userId,
                status: 'queued',
                queuePosition: newQueuePosition,
                queuedAt: new Date()
            });

            queueInfo = {
                queued: true,
                position: newQueuePosition
            };

            console.log(`Job ${job.id} queued at position ${newQueuePosition}`);
        } else {
            // No active job, start processing immediately
            job = await DownloadJob.create({
                userId,
                status: 'processing',
            });

            queueInfo = {
                queued: false,
                position: 0
            };

            console.log(`Job ${job.id} starting immediately`);
            processDownload(job.id, req.body, user);
        }

        // Create progress record with query
        await DownloadProgress.create({
            jobId: job.id,
            status: job.status === 'queued' ? 'queued' : 'starting',
            query: JSON.stringify(req.body),
            totalFiles: 0,
            downloadedFiles: 0
        });

        res.status(202).json({
            jobId: job.id,
            ...queueInfo
        });
    } catch (error) {
        console.error('Error starting download job:', error);
        res.status(500).send('Error starting download job.');
    }
};

exports.getJobStatus = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const job = await DownloadJob.findByPk(jobId);
        const progress = await DownloadProgress.findOne({ where: { jobId } });

        if (!progress) {
            if (!job) {
                return res.status(404).json({ message: 'Job not found.' });
            }
            return res.status(200).json(job);
        }

        // Include queue position from job if it exists
        const response = {
            ...progress.toJSON(),
            queuePosition: job?.queuePosition || null
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error getting job status:', error);
        res.status(500).send('Error getting job status.');
    }
};

exports.getActiveJob = async (req, res) => {
    try {
        const userId = req.user.id;
        const job = await DownloadJob.findOne({
            where: {
                userId,
                status: { [Op.in]: ['queued', 'processing'] }
            },
            order: [['createdAt', 'DESC']]
        });

        if (!job) {
            return res.status(200).json({ active: false });
        }

        const progress = await DownloadProgress.findOne({ where: { jobId: job.id } });

        res.status(200).json({
            active: true,
            jobId: job.id,
            status: job.status,
            queuePosition: job.queuePosition,
            progress: progress || null
        });
    } catch (error) {
        console.error('Error getting active job:', error);
        res.status(500).send('Error getting active job.');
    }
};

exports.cancelDownloadJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await DownloadJob.findByPk(jobId);

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        // Prevent canceling already completed or failed jobs
        if (job.status === 'completed' || job.status === 'failed') {
            return res.status(400).json({ error: 'Cannot cancel a job that is already completed or failed' });
        }

        const wasQueued = job.status === 'queued';
        const cancelledQueuePosition = job.queuePosition;

        // Update job status
        await job.update({ status: 'cancelled' });

        // Update progress status
        const progress = await DownloadProgress.findOne({ where: { jobId } });
        if (progress) {
            await progress.update({ status: 'cancelled' });
        }

        // If the job was queued, update queue positions for jobs after it
        if (wasQueued && cancelledQueuePosition) {
            await DownloadJob.decrement('queuePosition', {
                where: {
                    status: 'queued',
                    queuePosition: { [Op.gt]: cancelledQueuePosition }
                }
            });
        }

        // If we cancelled a processing job, start the next one
        if (job.status === 'processing') {
            await processNextInQueue();
        }

        res.json({ message: 'Download job cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling download job:', error);
        res.status(500).json({ error: 'Error cancelling download job' });
    }
};

// Get queue status
exports.getQueueStatus = async (req, res) => {
    try {
        const queuedJobs = await DownloadJob.findAll({
            where: { status: 'queued' },
            order: [['queuePosition', 'ASC']],
            include: [{ model: GoogleUser, as: 'GoogleUser' }]
        });

        const processingJob = await DownloadJob.findOne({
            where: { status: 'processing' },
            include: [{ model: GoogleUser, as: 'GoogleUser' }]
        });

        res.json({
            processing: processingJob ? {
                jobId: processingJob.id,
                userId: processingJob.userId,
                userName: processingJob.GoogleUser?.name
            } : null,
            queue: queuedJobs.map(job => ({
                jobId: job.id,
                userId: job.userId,
                userName: job.GoogleUser?.name,
                position: job.queuePosition,
                queuedAt: job.queuedAt
            })),
            queueLength: queuedJobs.length
        });
    } catch (error) {
        console.error('Error getting queue status:', error);
        res.status(500).json({ error: 'Error getting queue status' });
    }
};