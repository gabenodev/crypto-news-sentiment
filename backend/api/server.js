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

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Limit to 60 requests per minute
  message: "Too many requests, please try again later.",
});

// Apply rate limiting to all requests
app.use(limiter);

// Function to get cached data from Upstash Redis
const getCachedData = async (cacheKey, fetchFunction, expireTime = 60) => {
  try {
    // Check if data is in Redis cache
    const cachedDataResponse = await fetch(`${REDIS_URL}/get/${cacheKey}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
      },
    });

    const cachedData = await cachedDataResponse.json();
    if (cachedData.result) {
      console.log(`Returning cached data for: ${cacheKey}`);
      return JSON.parse(cachedData.result);
    }

    // Fetch new data if not found in cache
    console.log(`Fetching new data for: ${cacheKey}`);
    const freshData = await fetchFunction();

    // Store the new data in Redis cache
    await fetch(`${REDIS_URL}/set/${cacheKey}?EX=${expireTime}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(freshData),
    });

    return freshData;
  } catch (error) {
    console.error("Redis error:", error);
    return fetchFunction(); // If Redis fails, fetch fresh data
  }
};

// FETCH DATA FUNCTIONS FROM API
const fetchCryptoNews = async () => {
  const response = await axios.get(
    `https://newsapi.org/v2/everything?q=crypto&apiKey=${NEWS_API_KEY}`
  );
  return response.data.articles || [];
};

const fetchAllCryptosData = async () => {
  const totalMonede = 1000;
  const itemsPerPage = 250;
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
    allCryptos = [...allCryptos, ...data];
  }

  return allCryptos;
};

const fetchAltcoinSeasonChartData = async (coinId, days = 30) => {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
  );

  if (!response.ok) {
    throw new Error(`CoinGecko API returned status: ${response.status}`);
  }

  return response.json();
};

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

// ENDPOINTS
app.get("/api/news", async (req, res) => {
  try {
    const data = await getCachedData("news", fetchCryptoNews, 600);
    res.json(data);
  } catch (error) {
    console.error("Error fetching crypto news:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch news", details: error.message });
  }
});

app.get("/api/all-cryptos", async (req, res) => {
  try {
    const data = await getCachedData("altcoinSeason", fetchAllCryptosData, 600);
    res.json(data);
  } catch (error) {
    console.error("Error fetching altcoin season data:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch data", details: error.message });
  }
});

app.get("/api/altcoin-season-chart", async (req, res) => {
  const { coinId, days } = req.query;

  if (!coinId) {
    return res.status(400).json({ error: "coinId is required" });
  }

  try {
    const cacheKey = `altcoinSeasonChart_${coinId}_${days}`;
    const data = await getCachedData(
      cacheKey,
      () => fetchAltcoinSeasonChartData(coinId, days),
      600
    );
    res.json(data);
  } catch (error) {
    console.error("Error fetching altcoin season chart data:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch data", details: error.message });
  }
});

app.get("/api/coin-data", async (req, res) => {
  const { coinId } = req.query;

  if (!coinId) {
    return res.status(400).json({ error: "coinId is required" });
  }

  try {
    const cacheKey = `coinData_${coinId}`;
    const data = await getCachedData(
      cacheKey,
      () => fetchCoinData(coinId),
      600
    );
    res.json(data);
  } catch (error) {
    console.error("Error fetching coin data:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch data", details: error.message });
  }
});

app.get("/api/trending", async (req, res) => {
  try {
    const data = await getCachedData("trendingCoins", fetchTrendingCoins, 600);
    res.json(data);
  } catch (error) {
    console.error("Error fetching trending coins:", error);
    res.status(500).json({
      error: "Failed to fetch trending coins",
      details: error.message,
    });
  }
});

app.get("/", (req, res) => {
  res.send("Backend is running with Upstash Redis!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
