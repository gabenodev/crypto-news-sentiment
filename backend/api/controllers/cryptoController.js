// Import the caching service to use Redis
const { getCachedData } = require("../services/cacheService");

// Import all CoinGecko API service functions
const {
  fetchAllCryptosData,
  fetchAltcoinSeasonChartData,
  fetchCoinData,
  fetchTrendingCoins,
  fetchSearchResults,
  fetchMarketDominance,
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
    const data = await getCachedData("trendingCoins", fetchTrendingCoins, 3600);
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

/**
 * Get top movers (top 5 gainers) from all cryptocurrencies
 * Route: GET /api/top-movers
 */
const getTopMovers = async (req, res, next) => {
  try {
    // Folosim cache pentru top movers cu expirare de 1 oră (3600 secunde)
    const allCryptos = await getCachedData(
      "topMovers",
      fetchAllCryptosData,
      3600
    );

    // Sort by 24h price change percentage in descending order
    const topMovers = allCryptos
      .sort(
        (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
      )
      .slice(0, 5);

    res.json(topMovers);
  } catch (error) {
    next(error);
  }
};

/**
 * Get top losers (top 5 losers) from all cryptocurrencies
 * Route: GET /api/top-losers
 */
const getTopLosers = async (req, res, next) => {
  try {
    // Folosim cache pentru top losers cu expirare de 1 oră (3600 secunde)
    const allCryptos = await getCachedData(
      "topLosers",
      fetchAllCryptosData,
      3600
    );

    // Sort by 24h price change percentage in ascending order (losers)
    const topLosers = allCryptos
      .sort(
        (a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h
      )
      .slice(0, 5);

    res.json(topLosers);
  } catch (error) {
    next(error);
  }
};

const getMarketDominance = async (req, res, next) => {
  try {
    const data = await getCachedData(
      "marketDominance",
      fetchMarketDominance,
      3600 // 1 hour expiration
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
  getTopMovers,
  getTopLosers,
  getMarketDominance,
};
