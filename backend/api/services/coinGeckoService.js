const { fetchApiWithStrategy } = require("../utils/apiUtils");

const fetchAllCryptosData = async () => {
  const pages = [1]; // 4 pages x 250 = 1000 coins

  const fetchPage = (page) =>
    fetchApiWithStrategy({
      url: `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=${page}&sparkline=false`,
      cacheKey: `coinsPage${page}`,
      options: {
        cacheTtl: 7200, // 2 hours for coin data
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
      cacheTtl: 900, // 15 minutes for charts
    },
  });
};

const fetchCoinData = async (coinId) => {
  return fetchApiWithStrategy({
    url: `https://api.coingecko.com/api/v3/coins/${coinId}`,
    cacheKey: `coin_${coinId}`,
    options: {
      cacheTtl: 3600, // 1 hour for individual coin data
    },
  });
};

const fetchTrendingCoins = async () => {
  return fetchApiWithStrategy({
    url: "https://api.coingecko.com/api/v3/search/trending?sparkline=false",
    cacheKey: "trendingCoins",
    options: {
      cacheTtl: 3600, // 1 oră
      fallbackEnabled: true, // Folosește cache-ul chiar dacă API-ul e down
    },
  });
};

const fetchSearchResults = async (query) => {
  return fetchApiWithStrategy({
    url: `https://api.coingecko.com/api/v3/search?query=${query}`,
    cacheKey: `search_${query.toLowerCase()}`,
    options: {
      cacheTtl: 1800, // 30 minutes for search results
    },
  });
};

module.exports = {
  fetchAllCryptosData,
  fetchAltcoinSeasonChartData,
  fetchCoinData,
  fetchTrendingCoins,
  fetchSearchResults,
};
