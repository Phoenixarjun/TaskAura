const fs = require('fs');
const path = require('path');

// For Vercel, use /tmp directory
const dataDir = '/tmp';
const weeklyTasksFile = path.join(dataDir, 'weeklyTasks.json');

// Initialize file if it doesn't exist
if (!fs.existsSync(weeklyTasksFile)) {
  fs.writeFileSync(weeklyTasksFile, JSON.stringify([], null, 2));
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
      const tasks = readJsonFile(weeklyTasksFile, []);
      console.log(`GET /api/weekly-tasks - Returning ${tasks.length} tasks`);
      res.json(tasks);
    } catch (error) {
      console.error('Error getting weekly tasks:', error);
      res.status(500).json({ error: 'Failed to get weekly tasks' });
    }
  } else if (req.method === 'POST') {
    try {
      const tasks = req.body;
      if (!Array.isArray(tasks)) {
        return res.status(400).json({ error: 'Tasks must be an array' });
      }
      
      const success = writeJsonFile(weeklyTasksFile, tasks);
      if (success) {
        console.log(`POST /api/weekly-tasks - Saved ${tasks.length} tasks`);
        res.json({ message: 'Weekly tasks saved successfully', count: tasks.length });
      } else {
        res.status(500).json({ error: 'Failed to save weekly tasks' });
      }
    } catch (error) {
      console.error('Error saving weekly tasks:', error);
      res.status(500).json({ error: 'Failed to save weekly tasks' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}; 