require("dotenv").config();
const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { PORT } = require("./config/env");
const { warmupCache } = require("./utils/warmup");
const { localCache } = require("./services/cacheService");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize local cache on startup
console.log("Initializing cache...");

// Warmup cache with a delay to ensure server is ready
setTimeout(() => {
  warmupCache().catch((err) => console.error("Warmup failed:", err.message));
}, 2000);

// Set up periodic cache warmup (every 30 minutes)
setInterval(() => {
  warmupCache().catch((err) =>
    console.error("Periodic warmup failed:", err.message)
  );
}, 30 * 60 * 1000);

// Basic test route to verify server is running
app.get("/", (req, res) => res.send("The backend is running!"));

// Cache stats endpoint
app.get("/api/cache-stats", (req, res) => {
  const stats = localCache.getStats();
  res.json({
    hits: stats.hits,
    misses: stats.misses,
    keys: stats.keys,
    ksize: stats.ksize,
    vsize: stats.vsize,
    uptime: process.uptime(),
  });
});

// Mount all API routes under /api prefix
app.use("/api", routes);

// Error handling middleware - MUST be last!
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export for potential deployment platforms
module.exports = app;
