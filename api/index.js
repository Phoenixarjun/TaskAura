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
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
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
      ];

      // Check if origin is in allowed list or matches Vercel pattern
      if (
        allowedOrigins.includes(origin) ||
        /^https:\/\/taskaura-.*\.vercel\.app$/.test(origin) ||
        /^https:\/\/taskaura-.*-naresh-b-as-projects\.vercel\.app$/.test(origin)
      ) {
        return callback(null, true);
      }

      // For development, allow all origins
      if (process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }

      // Temporarily allow all origins for debugging
      console.log("Allowing origin for debugging:", origin);
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Handle preflight requests explicitly
app.options("*", (req, res) => {
  const origin = req.headers.origin;

  if (
    origin &&
    (/^https:\/\/taskaura-.*\.vercel\.app$/.test(origin) ||
      /^https:\/\/taskaura-.*-naresh-b-as-projects\.vercel\.app$/.test(
        origin
      ) ||
      origin === "https://taskaura.vercel.app" ||
      origin.includes("localhost"))
  ) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours
  res.status(200).end();
});

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
app.get("/", (req, res) => {
  res.status(200).json({
    message: "TaskAura API Server",
    version: "1.0.0",
    status: "running",
    environment: process.env.NODE_ENV || "development",
    hasMongoUri: !!process.env.MONGODB_URI,
    hasJwtSecret: !!process.env.JWT_SECRET,
    endpoints: {
      health: "/health",
      test: "/test",
      testCors: "/test-cors",
      auth: "/auth or /api/auth",
      dailyTasks: "/daily-tasks or /api/daily-tasks",
      weeklyTasks: "/weekly-tasks or /api/weekly-tasks",
      learnTasks: "/learn-tasks or /api/learn-tasks",
    },
  });
});

// API routes - ensure database connection before handling requests
// Handle both /auth and /api/auth paths
app.use(
  ["/auth", "/api/auth"],
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
  ["/daily-tasks", "/api/daily-tasks"],
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
  ["/weekly-tasks", "/api/weekly-tasks"],
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
  ["/learn-tasks", "/api/learn-tasks"],
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
      "POST /api/auth/register",
      "POST /api/auth/login",
      "GET /api/auth/profile",
      "GET /daily-tasks",
      "POST /daily-tasks",
      "GET /api/daily-tasks",
      "POST /api/daily-tasks",
      "GET /weekly-tasks",
      "POST /weekly-tasks",
      "GET /api/weekly-tasks",
      "POST /api/weekly-tasks",
      "GET /learn-tasks",
      "POST /learn-tasks",
      "GET /api/learn-tasks",
      "POST /api/learn-tasks",
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
