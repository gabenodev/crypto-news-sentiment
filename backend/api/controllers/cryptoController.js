// Import the caching service to use Redis
const { getCachedData } = require("../services/cacheService");

// Import all CoinGecko API service functions
const {
  fetchAllCryptosData,
  fetchAltcoinSeasonChartData,
  fetchCoinData,
  fetchTrendingCoins,
  fetchSearchResults, // Added the new import
} = require("../services/coinGeckoService");

/**
 * Get all cryptocurrencies data
 * Route: GET /api/all-cryptos
 */
const getAllCryptos = async (req, res, next) => {
  try {
    // Try to get data from cache first, otherwise fetch from API
    // Cache key: "allCryptos", expires after 600 seconds (10 minutes)
    const data = await getCachedData("allCryptos", fetchAllCryptosData, 600);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * Get altcoin season chart data for a specific coin
 * Route: GET /api/altcoin-season-chart?coinId=bitcoin&days=30
 */
const getAltcoinSeasonChart = async (req, res, next) => {
  try {
    const { coinId, days } = req.query;

    // Validate required parameter
    if (!coinId) return res.status(400).json({ error: "coinId is required" });

    // Create dynamic cache key based on coinId and days
    const cacheKey = `altcoinSeasonChart_${coinId}_${days || 30}`;

    // Get data with caching (600 seconds expiration)
    const data = await getCachedData(
      cacheKey,
      () => fetchAltcoinSeasonChartData(coinId, days),
      600
    );
    res.json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed data for a specific coin
 * Route: GET /api/coin-data?coinId=ethereum
 */
const getCoinData = async (req, res, next) => {
  try {
    const { coinId } = req.query;

    // Validate required parameter
    if (!coinId) return res.status(400).json({ error: "coinId is required" });

    // Create cache key specific to this coin
    const cacheKey = `coinData_${coinId}`;

    // Get data with caching
    const data = await getCachedData(
      cacheKey,
      () => fetchCoinData(coinId),
      600
    );
    res.json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * Get currently trending coins
 * Route: GET /api/trending
 */
const getTrendingCoins = async (req, res, next) => {
  try {
    const data = await getCachedData("trendingCoins", fetchTrendingCoins, 600);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * Get cryptocurrency search results
 * Route: GET /api/search?query=bitcoin
 */
const getSearchResults = async (req, res, next) => {
  try {
    const { query } = req.query;

    // Validate required parameter
    if (!query) return res.status(400).json({ error: "query is required" });

    // Create cache key specific to this search query
    const cacheKey = `searchResults_${query.toLowerCase()}`;

    // Get data with caching (600 seconds expiration)
    const data = await getCachedData(
      cacheKey,
      () => fetchSearchResults(query),
      600
    );
    res.json(data);
  } catch (error) {
    next(error);
  }
};

// Export all controller functions
module.exports = {
  getAllCryptos,
  getAltcoinSeasonChart,
  getCoinData,
  getTrendingCoins,
  getSearchResults, // Added the new controller function
};
