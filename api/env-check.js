// Environment variables check endpoint
module.exports = (req, res) => {
  try {
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Origin, Accept"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    // Check all required environment variables
    const requiredEnvVars = [
      "MONGODB_URI",
      "JWT_SECRET",
      "JWT_EXPIRES_IN",
      "NODE_ENV",
      "PORT",
      "RATE_LIMIT_WINDOW_MS",
      "RATE_LIMIT_MAX_REQUESTS",
    ];

    const envStatus = {};
    const missingVars = [];

    requiredEnvVars.forEach((varName) => {
      const value = process.env[varName];
      if (value) {
        envStatus[varName] = {
          exists: true,
          length: value.length,
          preview:
            varName === "MONGODB_URI" || varName === "JWT_SECRET"
              ? `${value.substring(0, 10)}...`
              : value,
        };
      } else {
        envStatus[varName] = { exists: false };
        missingVars.push(varName);
      }
    });

    const allVarsPresent = missingVars.length === 0;

    res.status(200).json({
      success: true,
      message: "Environment variables check",
      timestamp: new Date().toISOString(),
      allVarsPresent,
      missingVars,
      envStatus,
      nodeVersion: process.version,
      platform: process.platform,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
    });
  }
};
