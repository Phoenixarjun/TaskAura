module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: 'vercel-serverless',
      uptime: process.uptime()
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}; 