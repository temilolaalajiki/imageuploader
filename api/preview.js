// api/preview.js

import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { name } = req.query;
  const filePath = path.join('/tmp', name);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  const fileStream = fs.createReadStream(filePath);
  res.setHeader('Content-Type', 'image/jpeg');
  fileStream.pipe(res);
}
