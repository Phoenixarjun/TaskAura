const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173', // Vite dev server
    'http://localhost:3000', // Alternative dev port
    'https://your-netlify-app.netlify.app', // Replace with your actual Netlify URL
    /\.netlify\.app$/, // Allow all Netlify subdomains
    /\.netlify\.com$/  // Allow all Netlify domains
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// File paths
const weeklyTasksFile = path.join(dataDir, 'weeklyTasks.json');
const learnHistoryFile = path.join(dataDir, 'learnHistory.json');
const dailyTasksFile = path.join(dataDir, 'dailyTasks.json');

// Initialize files if they don't exist
const initializeFile = (filePath, defaultValue) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
    console.log(`Initialized ${path.basename(filePath)}`);
  }
};

initializeFile(weeklyTasksFile, []);
initializeFile(learnHistoryFile, []);
initializeFile(dailyTasksFile, {});

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

// Weekly Tasks API
app.get('/api/weekly-tasks', (req, res) => {
  try {
    const tasks = readJsonFile(weeklyTasksFile, []);
    console.log(`GET /api/weekly-tasks - Returning ${tasks.length} tasks`);
    res.json(tasks);
  } catch (error) {
    console.error('Error getting weekly tasks:', error);
    res.status(500).json({ error: 'Failed to get weekly tasks' });
  }
});

app.post('/api/weekly-tasks', (req, res) => {
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
});

// Learn History API
app.get('/api/learn-history', (req, res) => {
  try {
    const history = readJsonFile(learnHistoryFile, []);
    console.log(`GET /api/learn-history - Returning ${history.length} entries`);
    res.json(history);
  } catch (error) {
    console.error('Error getting learn history:', error);
    res.status(500).json({ error: 'Failed to get learn history' });
  }
});

app.post('/api/learn-history', (req, res) => {
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
});

// Daily Tasks API
app.get('/api/daily-tasks', (req, res) => {
  try {
    const dailyTasks = readJsonFile(dailyTasksFile, {});
    console.log(`GET /api/daily-tasks - Returning ${Object.keys(dailyTasks).length} days`);
    res.json(dailyTasks);
  } catch (error) {
    console.error('Error getting daily tasks:', error);
    res.status(500).json({ error: 'Failed to get daily tasks' });
  }
});

app.post('/api/daily-tasks', (req, res) => {
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
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM. Shutting down gracefully...');
  process.exit(0);
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit immediately, let the server continue running
});

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit immediately, let the server continue running
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📁 Data directory: ${dataDir}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 API endpoints:`);
  console.log(`   GET/POST http://localhost:${PORT}/api/weekly-tasks`);
  console.log(`   GET/POST http://localhost:${PORT}/api/learn-history`);
  console.log(`   GET/POST http://localhost:${PORT}/api/daily-tasks`);
}); 