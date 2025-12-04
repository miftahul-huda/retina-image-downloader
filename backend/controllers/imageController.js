const { bucket } = require('../config/gcs');

exports.getImage = async (req, res) => {
    try {
        const { filename } = req.query;

        if (!filename) {
            return res.status(400).json({ error: 'Filename is required' });
        }

        // Extract the file path from gs:// URL
        const filePath = filename.replace(/^gs:\/\/[^\/]+\//, '');
        const file = bucket.file(filePath);

        // Check if file exists
        const [exists] = await file.exists();
        if (!exists) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Get file metadata to set proper content type
        const [metadata] = await file.getMetadata();

        // Set appropriate headers
        res.setHeader('Content-Type', metadata.contentType || 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

        // Stream the file
        file.createReadStream()
            .on('error', (err) => {
                console.error('Error streaming file:', err);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Error streaming file' });
                }
            })
            .pipe(res);

    } catch (error) {
        console.error('Error fetching image:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};
