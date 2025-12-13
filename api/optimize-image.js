export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const TINYPNG_KEY = process.env.VITE_TINYPNG_API_KEY;
  const { imageUrl } = req.body;

  try {
    // Compress image via TinyPNG
    const response = await fetch('https://api.tinify.com/shrink', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from('api:' + TINYPNG_KEY).toString('base64'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ source: { url: imageUrl } }),
    });

    const data = await response.json();
    
    if (data.output) {
      res.status(200).json({
        success: true,
        original: data.input,
        optimized: data.output,
      });
    } else {
      res.status(400).json({ error: data.error || 'Compression failed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
