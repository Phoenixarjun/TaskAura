const fs = require('fs');
const path = require('path');

// For Vercel, use /tmp directory
const dataDir = '/tmp';
const dailyTasksFile = path.join(dataDir, 'dailyTasks.json');

// Initialize file if it doesn't exist
if (!fs.existsSync(dailyTasksFile)) {
  fs.writeFileSync(dailyTasksFile, JSON.stringify({}, null, 2));
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
      const dailyTasks = readJsonFile(dailyTasksFile, {});
      console.log(`GET /api/daily-tasks - Returning ${Object.keys(dailyTasks).length} days`);
      res.json(dailyTasks);
    } catch (error) {
      console.error('Error getting daily tasks:', error);
      res.status(500).json({ error: 'Failed to get daily tasks' });
    }
  } else if (req.method === 'POST') {
    try {
      const { date, tasks } = req.body;
      if (!date || !Array.isArray(tasks)) {
        return res.status(400).json({ error: 'Date and tasks array are required' });
      }
      
      const dailyTasks = readJsonFile(dailyTasksFile, {});
      dailyTasks[date] = tasks;
      
      const success = writeJsonFile(dailyTasksFile, dailyTasks);
      if (success) {
        console.log(`POST /api/daily-tasks - Saved ${tasks.length} tasks for ${date}`);
        res.json({ message: 'Daily tasks saved successfully', date, count: tasks.length });
      } else {
        res.status(500).json({ error: 'Failed to save daily tasks' });
      }
    } catch (error) {
      console.error('Error saving daily tasks:', error);
      res.status(500).json({ error: 'Failed to save daily tasks' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}; 