require("dotenv").config();
const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { PORT } = require("./config/env");
const { warmupCache } = require("./utils/warmup"); // Importează funcția warmup

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Call the warmup function before the server starts
warmupCache(); // Execută logica de warm-up pentru cache

// Basic test route to verify server is running
app.get("/", (req, res) => res.send("The backend is running!"));

// Mount all API routes under /api prefix
app.use("/api", routes);

// Error handling middleware - TREBUIE să fie ultimul!
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
