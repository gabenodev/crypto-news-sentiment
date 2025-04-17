// Import the caching service to use Redis
const { getCachedData, batchSetCache } = require("../services/cacheService");
const { batchFetchApis } = require("../utils/apiUtils");

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
    // Cache key: "allCryptos", expires after 1 hour (3600 seconds)
    const data = await getCachedData("allCryptos", fetchAllCryptosData, 3600);
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

    // Get data with caching (1 hour expiration)
    const data = await getCachedData(
      cacheKey,
      () => fetchAltcoinSeasonChartData(coinId, days),
      3600
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

    // Get data with caching (1 hour expiration)
    const data = await getCachedData(
      cacheKey,
      () => fetchCoinData(coinId),
      3600
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

    // Get data with caching (10 minutes expiration)
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
    // Use cache for top movers with expiration of 1 hour (3600 seconds)
    const allCryptos = await getCachedData(
      "allCryptos",
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
    // Use cache for top losers with expiration of 1 hour (3600 seconds)
    const allCryptos = await getCachedData(
      "allCryptos",
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

/**
 * Get market dominance data
 * Route: GET /api/market-dominance
 */
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

/**
 * Get multiple data endpoints in a single request
 * Route: GET /api/dashboard-data
 */
const getDashboardData = async (req, res, next) => {
  try {
    // Fetch multiple endpoints in parallel and cache them
    const [allCryptos, trending, marketDominance] = await batchFetchApis([
      {
        url: "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false",
        cacheKey: "allCryptos",
        options: { cacheTtl: 3600 },
      },
      {
        url: "https://api.coingecko.com/api/v3/search/trending?sparkline=false",
        cacheKey: "trendingCoins",
        options: { cacheTtl: 3600 },
      },
      {
        url: "https://api.coingecko.com/api/v3/global",
        cacheKey: "marketDominance",
        options: { cacheTtl: 3600 },
      },
    ]);

    // Process the data for top movers and losers
    let topMovers = [];
    let topLosers = [];

    if (allCryptos) {
      topMovers = [...allCryptos]
        .sort(
          (a, b) =>
            b.price_change_percentage_24h - a.price_change_percentage_24h
        )
        .slice(0, 5);

      topLosers = [...allCryptos]
        .sort(
          (a, b) =>
            a.price_change_percentage_24h - b.price_change_percentage_24h
        )
        .slice(0, 5);
    }

    // Return all data in a single response
    res.json({
      allCryptos: allCryptos?.slice(0, 50) || [], // Only return top 50 to reduce payload size
      trending: trending?.coins || [],
      marketDominance: marketDominance?.data?.market_cap_percentage || {},
      topMovers,
      topLosers,
    });
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
  getSearchResults,
  getTopMovers,
  getTopLosers,
  getMarketDominance,
  getDashboardData,
};
