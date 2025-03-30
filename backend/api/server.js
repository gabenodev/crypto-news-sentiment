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

// Upstash Redis setup
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// Middleware for CORS
app.use(cors());

// Rate limiting configuration - optimizat cu mesaj mai friendly
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Limit to 60 requests per minute
  message: "Hei șefule, prea multe requesturi! Dă-i mai încet...",
});

// Apply rate limiting to all requests
app.use(limiter);

// Adăugat retry mechanism pentru API calls
const fetchWithRetry = async (url, options = {}, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      throw new Error(`Status: ${response.status}`);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

// Function to get cached data from Upstash Redis - optimizat cu try/catch mai robust
const getCachedData = async (cacheKey, fetchFunction, expireTime = 60) => {
  try {
    // Check if data is in Redis cache
    const cachedDataResponse = await fetchWithRetry(
      `${REDIS_URL}/get/${cacheKey}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${REDIS_TOKEN}`,
        },
      }
    );

    const cachedData = await cachedDataResponse.json();
    if (cachedData.result) {
      console.log(`[CACHE HIT] Returning cached data for: ${cacheKey}`);
      return JSON.parse(cachedData.result);
    }

    // Fetch new data if not found in cache
    console.log(`[CACHE MISS] Fetching new data for: ${cacheKey}`);
    const freshData = await fetchFunction();

    // Store the new data in Redis cache
    await fetchWithRetry(`${REDIS_URL}/set/${cacheKey}?EX=${expireTime}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(freshData),
    });

    return freshData;
  } catch (error) {
    console.error("Redis operation failed:", error);
    return await fetchFunction(); // If Redis fails, fetch fresh data
  }
};

// FETCH DATA FUNCTIONS FROM API - păstrate la fel dar cu retry logic
const fetchCryptoNews = async () => {
  const response = await axios.get(
    `https://newsapi.org/v2/everything?q=crypto&apiKey=${NEWS_API_KEY}`,
    { timeout: 5000 } // timeout adăugat
  );
  return response.data.articles || [];
};

const fetchAllCryptosData = async () => {
  const totalMonede = 1000;
  const itemsPerPage = 250;
  const totalPages = Math.ceil(totalMonede / itemsPerPage);
  let allCryptos = [];

  for (let page = 1; page <= totalPages; page++) {
    const response = await fetchWithRetry(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${itemsPerPage}&page=${page}`
    );

    const data = await response.json();
    allCryptos = [...allCryptos, ...data];
  }

  return allCryptos;
};

const fetchAltcoinSeasonChartData = async (coinId, days = 30) => {
  const response = await fetchWithRetry(
    `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
  );
  return response.json();
};

const fetchCoinData = async (coinId) => {
  const response = await fetchWithRetry(
    `https://api.coingecko.com/api/v3/coins/${coinId}`
  );
  return response.json();
};

const fetchTrendingCoins = async () => {
  const response = await fetchWithRetry(
    "https://api.coingecko.com/api/v3/search/trending"
  );
  return response.json();
};

// ENDPOINTS - structură păstrată dar cu error handling îmbunătățit
app.get("/api/news", async (req, res, next) => {
  try {
    const data = await getCachedData("news", fetchCryptoNews, 600);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

app.get("/api/all-cryptos", async (req, res, next) => {
  try {
    const data = await getCachedData("altcoinSeason", fetchAllCryptosData, 600);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

app.get("/api/altcoin-season-chart", async (req, res, next) => {
  try {
    const { coinId, days } = req.query;
    if (!coinId) return res.status(400).json({ error: "coinId is required" });

    const cacheKey = `altcoinSeasonChart_${coinId}_${days || 30}`;
    const data = await getCachedData(
      cacheKey,
      () => fetchAltcoinSeasonChartData(coinId, days),
      600
    );
    res.json(data);
  } catch (error) {
    next(error);
  }
});

app.get("/api/coin-data", async (req, res, next) => {
  try {
    const { coinId } = req.query;
    if (!coinId) return res.status(400).json({ error: "coinId is required" });

    const cacheKey = `coinData_${coinId}`;
    const data = await getCachedData(
      cacheKey,
      () => fetchCoinData(coinId),
      600
    );
    res.json(data);
  } catch (error) {
    next(error);
  }
});

app.get("/api/trending", async (req, res, next) => {
  try {
    const data = await getCachedData("trendingCoins", fetchTrendingCoins, 600);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Adăugat health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "running",
    redis: REDIS_URL ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.send("Backend is running with Upstash Redis!");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(500).json({
    error: "Something went wrong, boss!",
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
