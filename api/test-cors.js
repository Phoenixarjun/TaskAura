// Simple test endpoint to verify CORS is working
module.exports = async (req, res) => {
  // Set CORS headers explicitly
  const origin = req.headers.origin;

  console.log("Request origin:", origin);
  console.log("Request method:", req.method);
  console.log("Request headers:", req.headers);

  // Allow all origins for testing
  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Origin, Accept"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    console.log("Handling preflight request");
    return res.status(200).end();
  }

  try {
    res.status(200).json({
      success: true,
      message: "CORS test endpoint working",
      origin: origin,
      method: req.method,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    console.error("Test endpoint error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
