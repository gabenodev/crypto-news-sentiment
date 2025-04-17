const express = require("express");
const router = express.Router();
const limiter = require("../middlewares/rateLimiter");
const { getNews } = require("../controllers/newsController");
const { warmupCache } = require("../utils/warmup");
const { getWhaleTransactions } = require("../controllers/whaleController");
const {
  getAllCryptos,
  getAltcoinSeasonChart,
  getCoinData,
  getTrendingCoins,
  getSearchResults,
  getTopLosers,
  getTopMovers,
  getMarketDominance,
  getDashboardData,
} = require("../controllers/cryptoController");

// API Routes with rate limiting:
router.get("/news", limiter, getNews);
router.get("/all-cryptos", limiter, getAllCryptos);
router.get("/altcoin-season-chart", limiter, getAltcoinSeasonChart);
router.get("/coin-data", limiter, getCoinData);
router.get("/trending", limiter, getTrendingCoins);
router.get("/search", limiter, getSearchResults);
router.get("/top-movers", limiter, getTopMovers);
router.get("/top-losers", limiter, getTopLosers);
router.get("/market-dominance", limiter, getMarketDominance);
router.get("/whale-transactions", getWhaleTransactions);

// New combined endpoint for dashboard data
router.get("/dashboard-data", limiter, getDashboardData);

// Route for warmup cache
router.get("/warmup", (req, res) => {
  warmupCache()
    .then((result) =>
      res.status(200).json({
        message: "Cache warmed up successfully!",
        details: result,
      })
    )
    .catch((err) =>
      res
        .status(500)
        .json({ error: "Error warming up cache", message: err.message })
    );
});

// Health check
router.get("/health", (req, res) => {
  res.status(200).json({ status: "running" });
});

module.exports = router;
