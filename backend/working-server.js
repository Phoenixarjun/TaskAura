const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://127.0.0.1:3000',
    'https://taskaura.vercel.app',
    'https://taskaura-frontend.vercel.app',
    'https://taskaura-backend.vercel.app'
  ],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'TaskAura API is running (Simple Server)',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.status(200).json({
    message: 'Test endpoint is working!',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'TaskAura API Server (Simple Version)',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      test: '/test',
      auth: '/api/auth',
      dailyTasks: '/api/daily-tasks',
      weeklyTasks: '/api/weekly-tasks',
      learnTasks: '/api/learn-tasks'
    }
  });
});

// Demo endpoints (no authentication required)
app.get('/api/demo/daily-tasks', (req, res) => {
  res.status(200).json({
    message: 'Demo daily tasks',
    tasks: []
  });
});

app.get('/api/demo/weekly-tasks', (req, res) => {
  res.status(200).json({
    message: 'Demo weekly tasks',
    tasks: []
  });
});

app.get('/api/demo/learn-tasks', (req, res) => {
  res.status(200).json({
    message: 'Demo learn tasks',
    tasks: []
  });
});

// Additional demo endpoints for POST requests
app.post('/api/demo/daily-tasks', (req, res) => {
  res.status(200).json({
    message: 'Demo daily task created',
    task: req.body
  });
});

app.post('/api/demo/weekly-tasks', (req, res) => {
  res.status(200).json({
    message: 'Demo weekly task created',
    task: req.body
  });
});

app.post('/api/demo/learn-tasks', (req, res) => {
  res.status(200).json({
    message: 'Demo learn task created',
    task: req.body
  });
});

// Demo endpoints for specific dates
app.get('/api/demo/daily-tasks/:date', (req, res) => {
  res.status(200).json({
    message: `Demo daily tasks for ${req.params.date}`,
    tasks: []
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /test',
      'GET /api/demo/daily-tasks',
      'GET /api/demo/weekly-tasks',
      'GET /api/demo/learn-tasks'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TaskAura Simple API server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Test endpoint: http://localhost:${PORT}/test`);
  console.log(`🔗 API root: http://localhost:${PORT}/`);
  console.log('✅ Simple server is ready for testing');
});

module.exports = app; 