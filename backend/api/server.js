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

// === FETCH DATA FROM API WITH INTELLIGENT CACHING === //

const DEFAULT_API_OPTIONS = {
  retries: 3, // Număr de încercări
  timeout: 5000, // Timeout în ms
  cacheTtl: 3600, // Cache duration in secunde
  fallbackEnabled: true, // Dacă permite fallback la date mai vechi
};

async function fetchApiWithStrategy({
  url,
  cacheKey,
  processData = (data) => data,
  options = {},
}) {
  const { retries, timeout, cacheTtl, fallbackEnabled } = {
    ...DEFAULT_API_OPTIONS,
    ...options,
  };

  // 1. Verificare cache
  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`[CACHE HIT] ${cacheKey}`);
      return cachedData;
    }
  } catch (cacheError) {
    console.error(`[CACHE ERROR] ${cacheKey}:`, cacheError.message);
  }

  // 2. Fetch cu retry și timeout
  try {
    console.log(`[API FETCH] Începem: ${url}`);

    const response = await Promise.race([
      fetchWithRetry(url, { retries }),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`Timeout after ${timeout}ms`)),
          timeout
        )
      ),
    ]);

    const data = await response.json();
    const processedData = processData(data);

    // 3. Salvăm în cache
    try {
      await redis.setex(cacheKey, cacheTtl, processedData);
      console.log(`[CACHE SET] ${cacheKey} pentru ${cacheTtl} secunde`);
    } catch (saveError) {
      console.error(`[CACHE SAVE ERROR] ${cacheKey}:`, saveError.message);
    }

    return processedData;
  } catch (error) {
    console.error(`[API ERROR] ${url}:`, error.message);

    // 4. Fallback la ultimele date din cache dacă este permis
    if (fallbackEnabled) {
      try {
        const lastGoodData = await redis.get(cacheKey);
        if (lastGoodData) {
          console.log(
            `[FALLBACK] Returnăm ultimele date valide pentru ${cacheKey}`
          );
          return lastGoodData;
        }
      } catch (fallbackError) {
        console.error("[FALLBACK ERROR]", fallbackError.message);
      }
    }

    throw error;
  }
}

// === FETCH DATA FROM ALL APIS === //

const fetchCryptoNews = async () => {
  return fetchApiWithStrategy({
    url: `https://newsapi.org/v2/everything?q=crypto&apiKey=${NEWS_API_KEY}`,
    cacheKey: "cryptoNews",
    options: {
      cacheTtl: 1800, // 30 minute pentru știri
    },
  });
};

const fetchAllCryptosData = async () => {
  const pages = [1, 2, 3, 4]; // 4 pagini x 250 = 1000 monede

  const fetchPage = (page) =>
    fetchApiWithStrategy({
      url: `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=${page}&sparkline=false`,
      cacheKey: `coinsPage${page}`,
      options: {
        cacheTtl: 7200, // 2 ore pentru date despre monede
      },
    });

  const allPages = await Promise.all(pages.map(fetchPage));
  return allPages.flat();
};

const fetchAltcoinSeasonChartData = async (coinId, days = 30) => {
  return fetchApiWithStrategy({
    url: `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`,
    cacheKey: `chart_${coinId}_${days}`,
    options: {
      cacheTtl: 900, // 15 minute pentru grafice
    },
  });
};

const fetchCoinData = async (coinId) => {
  return fetchApiWithStrategy({
    url: `https://api.coingecko.com/api/v3/coins/${coinId}`,
    cacheKey: `coin_${coinId}`,
    options: {
      cacheTtl: 3600, // 1 oră pentru date individuale
    },
  });
};

const fetchTrendingCoins = async () => {
  return fetchApiWithStrategy({
    url: "https://api.coingecko.com/api/v3/search/trending",
    cacheKey: "trendingCoins",
    options: {
      cacheTtl: 1800, // 30 minute pentru trending
    },
  });
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
