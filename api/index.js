// Main API handler for Vercel serverless deployment
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Import routes
const authRoutes = require("../backend/routes/auth");
const dailyTaskRoutes = require("../backend/routes/dailyTasks");
const weeklyTaskRoutes = require("../backend/routes/weeklyTasks");
const learnTaskRoutes = require("../backend/routes/learnTasks");

const app = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for API
  })
);

// CORS configuration - works for both local and production
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3003",
      "http://localhost:3004",
      "http://localhost:5173",
      "http://127.0.0.1:3000",
      "https://taskaura.vercel.app",
      "https://taskaura-frontend.vercel.app",
      "https://taskaura-backend.vercel.app",
      // Allow all Vercel preview deployments
      /^https:\/\/taskaura-.*\.vercel\.app$/,
      // Allow all naresh-b-as-projects deployments
      /^https:\/\/taskaura-.*-naresh-b-as-projects\.vercel\.app$/,
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Rate limiting (relaxed for serverless)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased for serverless
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) =>
    req.path === "/health" ||
    req.path === "/test" ||
    req.path.startsWith("/demo"),
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// MongoDB connection
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error("MONGODB_URI not found in environment variables");
      throw new Error("Database configuration missing");
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = true;
    console.log("✅ MongoDB Connected for serverless function");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    throw error;
  }
};

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    await connectDB();
    res.status(200).json({
      status: "OK",
      message: "TaskAura API is running",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "production",
      version: "1.0.0",
      database:
        mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// Test endpoint
app.get("/test", (req, res) => {
  res.status(200).json({
    message: "Test endpoint is working!",
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get("/", async (req, res) => {
  try {
    await connectDB();
    res.status(200).json({
      message: "TaskAura API Server",
      version: "1.0.0",
      status: "running",
      database:
        mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      endpoints: {
        health: "/health",
        test: "/test",
        auth: "/auth",
        dailyTasks: "/daily-tasks",
        weeklyTasks: "/weekly-tasks",
        learnTasks: "/learn-tasks",
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "TaskAura API Server",
      status: "error",
      error: error.message,
    });
  }
});

// API routes - ensure database connection before handling requests
app.use(
  "/auth",
  async (req, res, next) => {
    try {
      await connectDB();
      next();
    } catch (error) {
      res
        .status(500)
        .json({ error: "Database connection failed", message: error.message });
    }
  },
  authRoutes
);

app.use(
  "/daily-tasks",
  async (req, res, next) => {
    try {
      await connectDB();
      next();
    } catch (error) {
      res
        .status(500)
        .json({ error: "Database connection failed", message: error.message });
    }
  },
  dailyTaskRoutes
);

app.use(
  "/weekly-tasks",
  async (req, res, next) => {
    try {
      await connectDB();
      next();
    } catch (error) {
      res
        .status(500)
        .json({ error: "Database connection failed", message: error.message });
    }
  },
  weeklyTaskRoutes
);

app.use(
  "/learn-tasks",
  async (req, res, next) => {
    try {
      await connectDB();
      next();
    } catch (error) {
      res
        .status(500)
        .json({ error: "Database connection failed", message: error.message });
    }
  },
  learnTaskRoutes
);

// Demo endpoints (no authentication required)
app.get("/demo/daily-tasks", (req, res) => {
  res.status(200).json({
    message: "Demo daily tasks",
    tasks: [],
  });
});

app.get("/demo/weekly-tasks", (req, res) => {
  res.status(200).json({
    message: "Demo weekly tasks",
    tasks: [],
  });
});

app.get("/demo/learn-tasks", (req, res) => {
  res.status(200).json({
    message: "Demo learn tasks",
    tasks: [],
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      "GET /",
      "GET /health",
      "GET /test",
      "POST /auth/register",
      "POST /auth/login",
      "GET /auth/profile",
      "GET /daily-tasks",
      "POST /daily-tasks",
      "GET /weekly-tasks",
      "POST /weekly-tasks",
      "GET /learn-tasks",
      "POST /learn-tasks",
    ],
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);

  if (error.name === "ValidationError") {
    const firstError = Object.values(error.errors)[0];
    return res.status(400).json({
      error: "Validation Error",
      message: firstError.message || error.message,
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({
      error: "Invalid ID format",
      message: "The provided ID is not valid",
    });
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    let message = "A record with this information already exists";

    if (field === "email") {
      message = "A user with this email already exists";
    }

    return res.status(400).json({
      error: "Duplicate Error",
      message: message,
    });
  }

  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  });
});

module.exports = app;
