//IMPORTS
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
const CRYPTOCOMPARE_API_KEY = process.env.CRYPTOCOMPARE_API_KEY;

// Middleware pentru CORS
app.use(cors());

// Configurare rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minut
  max: 10, // Limitează la 10 cereri pe minut
  message: "Too many requests, please try again later.",
});

// Aplică rate limiting la toate cererile
app.use(limiter);

// Cache pentru datele de la CoinGecko
const cache = {
  altcoinSeason: {
    data: null,
    lastUpdated: null,
  },
  altcoinSeasonChart: {}, // Cache separat pentru fiecare coinId
  news: {
    data: null,
    lastUpdated: null,
  },
};

// GENERIC FUNCTION TO GET CACHED DATA -> used in all endpoints -----------------
const getCachedData = (cacheKey, fetchFunction, cacheId = null) => {
  const now = Date.now();
  let cacheEntry;

  // Asigură-te că cache[cacheKey] există
  if (!cache[cacheKey]) {
    cache[cacheKey] = {}; // Inițializează cache[cacheKey] dacă nu există
  }

  // Dacă există un cacheId, asigură-te că acesta este inițializat și corect
  if (cacheId) {
    if (!cache[cacheKey][cacheId]) {
      cache[cacheKey][cacheId] = { data: null, lastUpdated: null };
    }
    cacheEntry = cache[cacheKey][cacheId];
  } else {
    cacheEntry = cache[cacheKey];
  }

  // Verifică dacă datele sunt valabile și nu au expirat
  if (
    cacheEntry.data &&
    cacheEntry.lastUpdated &&
    now - cacheEntry.lastUpdated < 60000
  ) {
    return cacheEntry.data;
  }

  // Dacă datele nu sunt disponibile sau au expirat, le aduci din nou
  return fetchFunction().then((data) => {
    cacheEntry.data = data;
    cacheEntry.lastUpdated = now;
    return data;
  });
};

//  FETCH DATA FUNCTIONS FROM API ----------------------------------------------------------------------------------------------------
//Cryptocompare function to get data

const fetchCryptoData = async () => {
  const response = await axios.get(
    "https://min-api.cryptocompare.com/data/pricemulti",
    {
      params: {
        fsyms: "BTC,ETH,LTC", // Poți înlocui cu simbolurile monedelor dorite
        tsyms: "USD",
        api_key: CRYPTOCOMPARE_API_KEY,
      },
    }
  );

  console.log("Crypto Prices:", response.data); // Vezi prețurile returnate

  return response.data;
};

// Funcție pentru a obține știri crypto

const fetchCryptoNews = async () => {
  const response = await axios.get(
    `https://newsapi.org/v2/everything?q=crypto&apiKey=${NEWS_API_KEY}`
  );
  return response.data.articles || [];
};

// Funcție pentru a obține datele de la CoinGecko pentru /api/altcoin-season

const fetchAltcoinSeasonData = async () => {
  const response = await fetch(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1"
  );

  if (!response.ok) {
    throw new Error(`CoinGecko API returned status: ${response.status}`);
  }

  return response.json();
};

// Funcție pentru a obține datele de la CoinGecko pentru /api/altcoin-season-chart

const fetchAltcoinSeasonChartData = async (coinId) => {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=30`
  );

  if (!response.ok) {
    throw new Error(`CoinGecko API returned status: ${response.status}`);
  }

  return response.json();
};

//       ENDPOINTS ---------------------------------------------------------------------------------------------------- ENDPOINTS

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
    const data = await getCachedData("cryptos", fetchCryptoData);
    res.json(data);
  } catch (error) {
    console.error("Error fetching crypto data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

/* API ALTCOIN SEASON endpoint */
app.get("/api/altcoin-season", async (req, res) => {
  try {
    const data = await getCachedData("altcoinSeason", fetchAltcoinSeasonData);
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
  const { coinId } = req.query;

  if (!coinId) {
    return res.status(400).json({ error: "coinId is required" });
  }

  try {
    const data = await getCachedData(
      "altcoinSeasonChart",
      () => fetchAltcoinSeasonChartData(coinId),
      coinId
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

/* Default endpoint in VERCEL to see if the backend is running! */
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

/* Start server only for local test purposes*/
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
