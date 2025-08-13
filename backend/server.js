const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Debug: Check if environment variables are loaded
console.log('Environment check:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());

// CORS configuration - works for both local and production
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

// Rate limiting (relaxed in development and skipped for lightweight endpoints)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development'
    ? 1000
    : (parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100),
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development' 
    || req.path === '/health' 
    || req.path === '/test'
    || req.path.startsWith('/api/demo')
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'TaskAura API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.status(200).json({
    message: 'Test endpoint is working!',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint for Vercel
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'TaskAura API Server',
    version: '1.0.0',
    status: 'running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
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

// Import routes
const authRoutes = require('./routes/auth');
const dailyTaskRoutes = require('./routes/dailyTasks');
const weeklyTaskRoutes = require('./routes/weeklyTasks');
const learnTaskRoutes = require('./routes/learnTasks');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/daily-tasks', dailyTaskRoutes);
app.use('/api/weekly-tasks', weeklyTaskRoutes);
app.use('/api/learn-tasks', learnTaskRoutes);

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
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/profile',
      'GET /api/daily-tasks',
      'POST /api/daily-tasks',
      'GET /api/weekly-tasks',
      'POST /api/weekly-tasks',
      'GET /api/learn-tasks',
      'POST /api/learn-tasks'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: error.message
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format',
      message: 'The provided ID is not valid'
    });
  }
  
  if (error.code === 11000) {
    return res.status(400).json({
      error: 'Duplicate Error',
      message: 'A record with this information already exists'
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// MongoDB connection with fallback
const connectDB = async () => {
  try {
    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      console.log('⚠️  MONGODB_URI not found in environment variables');
      console.log('📝 Please create a .env file in the backend directory with:');
      console.log('MONGODB_URI=mongodb+srv://NARESH:Jokerarjun@2374@cluster0.wkpgkoa.mongodb.net/taskaura');
      console.log('🔧 Using demo mode without database connection');
      return false;
    }
    
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('🔧 Using demo mode without database connection');
    return false;
  }
};

// Start server
const startServer = async () => {
  try {
    console.log('Starting TaskAura API server...');
    
    // Try to connect to MongoDB (optional for demo mode)
    const dbConnected = await connectDB();
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 TaskAura API server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 Test endpoint: http://localhost:${PORT}/test`);
      console.log(`🔗 API root: http://localhost:${PORT}/`);
      
      if (dbConnected) {
        console.log('✅ Database connected successfully');
        console.log('✅ All features are available');
      } else {
        console.log('⚠️  Running in demo mode (no database)');
        console.log('📝 Create .env file with MONGODB_URI to enable full features');
        console.log('✅ Demo endpoints are available');
      }
    }).on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.log(`🔧 Trying alternative port ${PORT + 1}...`);
        
        // Try alternative port
        const alternativePort = PORT + 1;
        const alternativeServer = app.listen(alternativePort, () => {
          console.log(`🚀 TaskAura API server running on port ${alternativePort}`);
          console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
          console.log(`🔗 Health check: http://localhost:${alternativePort}/health`);
          console.log(`🔗 Test endpoint: http://localhost:${alternativePort}/test`);
          console.log(`🔗 API root: http://localhost:${alternativePort}/`);
          
          if (dbConnected) {
            console.log('✅ Database connected successfully');
            console.log('✅ All features are available');
          } else {
            console.log('⚠️  Running in demo mode (no database)');
            console.log('✅ Demo endpoints are available');
          }
        }).on('error', (altError) => {
          console.error(`❌ Alternative port ${alternativePort} also in use`);
          console.log('🔧 Please stop existing processes or change PORT in .env file');
          process.exit(1);
        });
      } else {
        console.error('Failed to start server:', error);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Only start server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = app; 