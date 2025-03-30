const { getCachedData } = require("../services/cacheService");
const { fetchCryptoNews } = require("../services/newsService");

// Handle GET /api/news requests

const getNews = async (req, res, next) => {
  try {
    // Try cache first, fallback to API if needed
    const data = await getCachedData("news", fetchCryptoNews, 600);
    res.json(data); // Send news data to client
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNews,
};
