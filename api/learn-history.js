const fs = require('fs');
const path = require('path');

// For Vercel, use /tmp directory
const dataDir = '/tmp';
const learnHistoryFile = path.join(dataDir, 'learnHistory.json');

// Initialize file if it doesn't exist
if (!fs.existsSync(learnHistoryFile)) {
  fs.writeFileSync(learnHistoryFile, JSON.stringify([], null, 2));
}

// Helper function to read JSON files safely
const readJsonFile = (filePath, defaultValue) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
  }
  return defaultValue;
};

// Helper function to write JSON files safely
const writeJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error.message);
    return false;
  }
};

module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const history = readJsonFile(learnHistoryFile, []);
      console.log(`GET /api/learn-history - Returning ${history.length} entries`);
      res.json(history);
    } catch (error) {
      console.error('Error getting learn history:', error);
      res.status(500).json({ error: 'Failed to get learn history' });
    }
  } else if (req.method === 'POST') {
    try {
      const history = req.body;
      if (!Array.isArray(history)) {
        return res.status(400).json({ error: 'History must be an array' });
      }
      
      const success = writeJsonFile(learnHistoryFile, history);
      if (success) {
        console.log(`POST /api/learn-history - Saved ${history.length} entries`);
        res.json({ message: 'Learn history saved successfully', count: history.length });
      } else {
        res.status(500).json({ error: 'Failed to save learn history' });
      }
    } catch (error) {
      console.error('Error saving learn history:', error);
      res.status(500).json({ error: 'Failed to save learn history' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}; 