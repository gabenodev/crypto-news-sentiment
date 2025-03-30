const express = require("express");
const router = express.Router();
const limiter = require("../middlewares/rateLimiter");
const { getNews } = require("../controllers/newsController");
const {
  getAllCryptos,
  getAltcoinSeasonChart,
  getCoinData,
  getTrendingCoins,
} = require("../controllers/cryptoController");

// API Routes with rate limiting:

router.get("/news", limiter, getNews);
router.get("/all-cryptos", limiter, getAllCryptos);
router.get("/altcoin-season-chart", limiter, getAltcoinSeasonChart);
router.get("/coin-data", limiter, getCoinData);
router.get("/trending", limiter, getTrendingCoins);

// Adaugă și health check aici dacă vrei
router.get("/health", (req, res) => {
  res.status(200).json({ status: "running" });
});

module.exports = router;
