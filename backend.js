require('dotenv').config();

const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');

const app = express();
const port = 3000;

// AWS Configuration
const s3 = new S3Client({
  region: 'eu-north-1',
  credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Set up Multer for file handling
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// File upload route
app.post('/upload', upload.single('file'), async (req, res) => {
    const { email, dob } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    // Construct the file name in "email-dob.extension" format
    const fileExtension = path.extname(file.originalname);
    const fileName = `${email}-${dob}${fileExtension}`;

    // Parameters for S3 upload
    const params = {
        Bucket: 'sayanawsbucket', 
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype
    };

    try {
        const command = new PutObjectCommand(params);
        const data = await s3.send(command);
        res.send(`File uploaded successfully! S3 URL: https://your-s3-bucket-name.s3.eu-north-1.amazonaws.com/${fileName}`);
    } catch (err) {
        console.error('Error uploading to S3:', err);
        res.status(500).send('Error uploading file.');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
