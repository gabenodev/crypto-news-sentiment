// IMPORTS
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// API Keys
const NEWS_API_KEY = process.env.NEWS_API_KEY;

// Middleware for CORS
app.use(cors());

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Limit to 20 requests per minute
  message: "Too many requests, please try again later.",
});

// Apply rate limiting to all requests
app.use(limiter);

// Cache for CoinGecko data and other APIs
const cache = {
  altcoinSeason: {
    data: null,
    lastUpdated: null,
  },
  altcoinSeasonChart: {}, // Separate cache for each coinId and days combination
  news: {
    data: null,
    lastUpdated: null,
  },
};

// GENERIC FUNCTION TO GET CACHED DATA -> used in all endpoints -----------------

const getCachedData = (cacheKey, fetchFunction, cacheId = null) => {
  const now = Date.now();
  let cacheEntry;

  // Debugging: Show cache state before making the request
  console.log("Cache before:", JSON.stringify(cache, null, 2));

  // Make sure cache[cacheKey] exists
  if (!cache[cacheKey]) {
    cache[cacheKey] = {}; // Initialize cache[cacheKey] if it doesn't exist
  }

  // If there's a cacheId, make sure it's initialized and correct
  if (cacheId) {
    if (!cache[cacheKey][cacheId]) {
      cache[cacheKey][cacheId] = { data: null, lastUpdated: null }; // Initialize cache for cacheId
    }
    cacheEntry = cache[cacheKey][cacheId]; // Use specific cache for cacheId
  } else {
    cacheEntry = cache[cacheKey]; // Use general cache for cacheKey
  }

  // Check if the data is valid and hasn't expired
  if (
    cacheEntry.data && // Data exists in cache
    cacheEntry.lastUpdated && // There's a timestamp for the last update
    now - cacheEntry.lastUpdated < 60000 // Data hasn't expired (60 seconds)
  ) {
    console.log("Returning cached data for:", cacheKey, cacheId); // Debugging
    return cacheEntry.data; // Return cached data
  }

  // If data is not available or has expired, fetch it again
  console.log("Fetching new data for:", cacheKey, cacheId); // Debugging
  return fetchFunction().then((data) => {
    cacheEntry.data = data; // Store new data in cache
    cacheEntry.lastUpdated = now; // Update the timestamp
    console.log("Cache after:", JSON.stringify(cache, null, 2)); // Debugging
    return data; // Return the new data
  });
};

// FETCH DATA FUNCTIONS FROM API ----------------------------------------------------------------------------------------------------

// Function to fetch crypto news
const fetchCryptoNews = async () => {
  const response = await axios.get(
    `https://newsapi.org/v2/everything?q=crypto&apiKey=${NEWS_API_KEY}`
  );
  return response.data.articles || [];
};

// Function to fetch data from CoinGecko for /api/altcoin-season
const fetchAllCryptosData = async () => {
  const totalMonede = 1000;
  const itemsPerPage = 250; // CoinGecko permite maxim 250 pe pagină
  const totalPages = Math.ceil(totalMonede / itemsPerPage);

  let allCryptos = [];

  for (let page = 1; page <= totalPages; page++) {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${itemsPerPage}&page=${page}`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API returned status: ${response.status}`);
    }

    const data = await response.json();
    allCryptos = [...allCryptos, ...data]; // Adaugă datele la lista principală
  }

  return allCryptos;
};

// Function to fetch data from CoinGecko for /api/altcoin-season-chart
const fetchAltcoinSeasonChartData = async (coinId, days = 30) => {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
  );

  if (!response.ok) {
    throw new Error(`CoinGecko API returned status: ${response.status}`);
  }

  return response.json();
};

// Function to get data from CoinGecko for a specific coinId

const fetchCoinData = async (coinId) => {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/${coinId}`
  );

  if (!response.ok) {
    throw new Error(`CoinGecko API returned status: ${response.status}`);
  }

  return response.json();
};

const fetchTrendingCoins = async () => {
  const response = await fetch(
    "https://api.coingecko.com/api/v3/search/trending"
  );
  if (!response.ok) {
    throw new Error(`CoinGecko API returned status: ${response.status}`);
  }
  return response.json();
};

// ENDPOINTS ---------------------------------------------------------------------------------------------------- ENDPOINTS

/* API NEWS endpoint */
app.get("/api/news", async (req, res) => {
  try {
    const data = await getCachedData("news", fetchCryptoNews);
    res.json(data);
  } catch (error) {
    console.error("Error fetching crypto news:", error);
    res.status(500).json({
      error: "Failed to fetch news",
      details: error.message,
    });
  }
});

/* CRYPTO COMPARE HOMEPAGE endpoint */
app.get("/api/cryptos", async (req, res) => {
  try {
    const data = await getCachedData("cryptos", fetchCryptoDataPrice);
    res.json(data);
  } catch (error) {
    console.error("Error fetching crypto data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

/* API ALL CRYPTOS DATA endpoint */
app.get("/api/all-cryptos", async (req, res) => {
  try {
    const data = await getCachedData("altcoinSeason", fetchAllCryptosData);
    res.json(data);
  } catch (error) {
    console.error("Error fetching altcoin season data:", error);
    res.status(500).json({
      error: "Failed to fetch data",
      details: error.message,
    });
  }
});

/* API ALTCOIN SEASON CHART endpoint */
app.get("/api/altcoin-season-chart", async (req, res) => {
  const { coinId, days } = req.query;

  if (!coinId) {
    return res.status(400).json({ error: "coinId is required" });
  }

  try {
    const data = await getCachedData(
      "altcoinSeasonChart", // Cache key
      () => fetchAltcoinSeasonChartData(coinId, days), // Fetch function
      `${coinId}_${days}` // Cache ID for each coinId and days combination
    );
    res.json(data);
  } catch (error) {
    console.error("Error fetching altcoin season chart data:", error);
    res.status(500).json({
      error: "Failed to fetch data",
      details: error.message,
    });
  }
});

/* API COIN GECKO for a defined coinId endpoint */

app.get("/api/coin-data", async (req, res) => {
  const { coinId } = req.query;

  if (!coinId) {
    return res.status(400).json({ error: "coinId is required" });
  }

  try {
    const data = await getCachedData(
      "coinData", // Cache key
      () => fetchCoinData(coinId), // Fetch function
      coinId // Cache ID pentru fiecare coinId
    );
    res.json(data);
  } catch (error) {
    console.error("Error fetching coin data:", error);
    res.status(500).json({
      error: "Failed to fetch data",
      details: error.message,
    });
  }
});

app.get("/api/trending", async (req, res) => {
  try {
    const data = await getCachedData("trendingCoins", fetchTrendingCoins);
    res.json(data);
  } catch (error) {
    console.error("Error fetching trending coins:", error);
    res.status(500).json({
      error: "Failed to fetch trending coins",
      details: error.message,
    });
  }
});

/* Default endpoint in VERCEL to see if the backend is running! */
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

/* Start server only for local test purposes */
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
