const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const rateLimit = require('express-rate-limit');

// Configure Cloudinary
// Clean up potential whitespace in credentials
const cleanCredentials = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  api_key: process.env.CLOUDINARY_API_KEY?.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
  secure: true
};

cloudinary.config(cleanCredentials);

// Verify Cloudinary configuration on startup
const cloudinaryConfig = cloudinary.config();
console.log('Cloudinary Configuration:', {
  isConfigured: !!(cloudinaryConfig.cloud_name && cloudinaryConfig.api_key && cloudinaryConfig.api_secret),
  cloud_name: cloudinaryConfig.cloud_name ? 'Set' : 'Not set',
  api_key: cloudinaryConfig.api_key ? 'Set' : 'Not set',
  api_secret: cloudinaryConfig.api_secret ? 'Set' : 'Not set'
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
  origin: true, // Allow all origins temporarily
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // Upload to Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    
    // Log configuration before upload
    console.log('Attempting upload with config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key_length: process.env.CLOUDINARY_API_KEY ? process.env.CLOUDINARY_API_KEY.length : 0,
      api_secret_set: !!process.env.CLOUDINARY_API_SECRET
    });

    // Try a simpler upload first with explicit timestamp
    const timestamp = Math.round(new Date().getTime() / 1000);
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'auto',
      folder: 'imageuploader',
      timestamp: timestamp
    });
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'application/json');
    
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
    console.error('Upload error details:', {
      message: error.message,
      code: error.http_code,
      stack: error.stack,
      cloudinaryError: error.error || null
    });

    // Check Cloudinary configuration
    const cloudinaryConfig = cloudinary.config();
    console.log('Cloudinary Config:', {
      cloud_name: cloudinaryConfig.cloud_name ? 'Set' : 'Not set',
      api_key: cloudinaryConfig.api_key ? 'Set' : 'Not set',
      api_secret: cloudinaryConfig.api_secret ? 'Set' : 'Not set'
    });

    // More specific error messages
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ 
        error: 'Cloudinary configuration is missing',
        details: {
          cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
          api_key: !!process.env.CLOUDINARY_API_KEY,
          api_secret: !!process.env.CLOUDINARY_API_SECRET
        }
      });
    }
    if (error.http_code === 400) {
      return res.status(400).json({ 
        error: 'Invalid file format or corrupt image',
        details: error.message
      });
    }
    if (error.http_code === 401) {
      return res.status(401).json({ 
        error: 'Invalid Cloudinary credentials',
        details: 'Please check your Cloudinary credentials'
      });
    }
    res.status(500).json({ 
      error: 'An error occurred during upload.',
      details: error.message,
      errorCode: error.http_code || 'unknown'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test endpoint
app.get('/api/test', async (req, res) => {
  try {
    const config = cloudinary.config();
    const cloudinaryConfigured = !!(process.env.CLOUDINARY_CLOUD_NAME && 
                                  process.env.CLOUDINARY_API_KEY && 
                                  process.env.CLOUDINARY_API_SECRET);
    
    // Try a test upload with a tiny base64 image
    const testImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    let uploadTest = null;
    
    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      uploadTest = await cloudinary.uploader.upload(testImage, {
        folder: 'imageuploader/test',
        timestamp: timestamp
      });
    } catch (uploadError) {
      uploadTest = {
        error: uploadError.message,
        http_code: uploadError.http_code
      };
    }

    res.json({ 
      message: 'API is working!',
      environment: process.env.NODE_ENV || 'development',
      cloudinaryConfigured,
      cloudinaryDetails: {
        cloud_name: !!config.cloud_name,
        api_key: !!config.api_key,
        api_secret: !!config.api_secret
      },
      envVars: {
        cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
        api_key: !!process.env.CLOUDINARY_API_KEY,
        api_secret: !!process.env.CLOUDINARY_API_SECRET
      },
      uploadTest: uploadTest ? 'Success' : 'Failed',
      uploadError: uploadTest.error,
      corsOrigin: process.env.FRONTEND_URL || 'Not configured',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Test endpoint error',
      details: error.message
    });
  }
});

// Handle serverless environment
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

module.exports = app;