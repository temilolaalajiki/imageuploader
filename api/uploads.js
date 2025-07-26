import multer from 'multer';
import nextConnect from 'next-connect';

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  }
});

const handler = nextConnect();

handler.use(upload.single('image'));

handler.post(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    return res.status(200).json({
      message: 'File uploaded successfully',
      file: req.file.originalname
    });
  } catch (error) {
    return res.status(500).json({ 
      error: 'Upload failed',
      message: error.message 
    });
  }
});

export const config = {
  api: {
    bodyParser: false
  },
};

export default handler;
