const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Configure CORS for production
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://imageuploader-pied.vercel.app', 'https://your-custom-domain.com', process.env.FRONTEND_URL] 
    : ['http://localhost:5173', 'http://localhost:3000'],
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
app.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // For now, we'll return the file data as base64
    // In production, you should upload to cloud storage
    const fileBuffer = req.file.buffer;
    const base64Data = fileBuffer.toString('base64');
    const mimeType = req.file.mimetype;
    
    // Create a data URL
    const dataUrl = `data:${mimeType};base64,${base64Data}`;
    
    res.json({
      message: 'File uploaded successfully',
      url: dataUrl,
      filename: req.file.originalname,
      size: req.file.size
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