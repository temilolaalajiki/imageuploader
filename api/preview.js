export default async function handler(req, res) {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    return res.status(200).json({ 
      url: url,
      status: 'success' 
    });
  } catch (error) {
    return res.status(500).json({ 
      error: 'Preview failed',
      message: error.message 
    });
  }
}