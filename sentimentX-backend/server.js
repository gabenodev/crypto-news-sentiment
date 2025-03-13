const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 5000;

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
};

// Funcție generică pentru gestionarea cache-ului
const getCachedData = (cacheKey, fetchFunction, cacheId = null) => {
  const now = Date.now();
  let cacheEntry;

  if (cacheId) {
    // Dacă avem un cacheId (de exemplu, coinId), folosim cache-ul specific
    if (!cache[cacheKey][cacheId]) {
      cache[cacheKey][cacheId] = { data: null, lastUpdated: null };
    }
    cacheEntry = cache[cacheKey][cacheId];
  } else {
    // Altfel, folosim cache-ul global
    cacheEntry = cache[cacheKey];
  }

  // Verificăm dacă datele din cache sunt încă valide (1 minut)
  if (
    cacheEntry.data &&
    cacheEntry.lastUpdated &&
    now - cacheEntry.lastUpdated < 60000
  ) {
    return cacheEntry.data;
  }

  // Dacă cache-ul este expirat, facem o nouă cerere
  return fetchFunction().then((data) => {
    cacheEntry.data = data;
    cacheEntry.lastUpdated = now;
    return data;
  });
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

// Endpoint pentru altcoin season
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

// Endpoint pentru altcoin season chart
app.get("/api/altcoin-season-chart", async (req, res) => {
  const { coinId } = req.query;

  if (!coinId) {
    return res.status(400).json({ error: "coinId is required" });
  }

  try {
    const data = await getCachedData(
      "altcoinSeasonChart",
      () => fetchAltcoinSeasonChartData(coinId),
      coinId // Trecem coinId ca cacheId
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
