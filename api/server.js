const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const rateLimit = require('express-rate-limit');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();

// Configure rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Apply rate limiting to all routes
app.use(limiter);

// Configure CORS for production
app.use(cors({
  origin: '*', // Allow all origins for now
  credentials: true
}));

// Use memory storage for Vercel (temporary solution)
// In production, you should use cloud storage like AWS S3, Cloudinary, etc.
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  }
});

// Route for file upload
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // Upload to Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'auto',
      folder: 'imageuploader',
      transformation: {
        quality: 'auto',
        fetch_format: 'auto'
      }
    });
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    return res.status(200).json({
      message: 'File uploaded successfully',
      url: result.secure_url,
      filename: req.file.originalname,
      size: req.file.size,
      cloudinary: {
        public_id: result.public_id,
        format: result.format
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'An error occurred during upload.' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Handle serverless environment
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

module.exports = app;