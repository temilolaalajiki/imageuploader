// api/upload.js

import multer from 'multer';
import nextConnect from 'next-connect';
import fs from 'fs';
import path from 'path';

const upload = multer({ storage: multer.memoryStorage() });

const handler = nextConnect();

handler.use(upload.single('image'));

handler.post(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Temporary directory in Vercel
  const tempDir = '/tmp';
  const filename = `${Date.now()}-${req.file.originalname}`;
  const filepath = path.join(tempDir, filename);

  fs.writeFile(filepath, req.file.buffer, err => {
    if (err) return res.status(500).json({ error: 'Failed to save file' });

    // File saved, return URL (local path, not persistent)
    res.status(200).json({
      message: 'File uploaded successfully',
      url: `/api/preview?name=${filename}`,
    });
  });
});

export const config = {
  api: {
    bodyParser: false, // Disables the default body parser to use multer
  },
};

export default handler;
