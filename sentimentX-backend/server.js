// server.js
const express = require("express");
const cors = require("cors");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.get("/api/altcoin-season", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1"
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API returned status: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching altcoin season data:", error);
    res.status(500).json({
      error: "Failed to fetch data",
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
