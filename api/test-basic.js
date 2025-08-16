// Ultra-simple test endpoint
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

    // Simple response without any dependencies
    res.status(200).json({
      success: true,
      message: "Basic test endpoint working",
      timestamp: new Date().toISOString(),
      env: {
        nodeEnv: process.env.NODE_ENV || "not-set",
        hasMongoUri: !!process.env.MONGODB_URI,
        hasJwtSecret: !!process.env.JWT_SECRET,
        mongoUriLength: process.env.MONGODB_URI
          ? process.env.MONGODB_URI.length
          : 0,
        jwtSecretLength: process.env.JWT_SECRET
          ? process.env.JWT_SECRET.length
          : 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
    });
  }
};
