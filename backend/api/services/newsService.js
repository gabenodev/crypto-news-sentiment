const { NEWS_API_KEY } = require("../config/env");
const { fetchApiWithStrategy } = require("../utils/apiUtils");

const fetchCryptoNews = async () => {
  return fetchApiWithStrategy({
    url: `https://newsapi.org/v2/everything?q=crypto&apiKey=${NEWS_API_KEY}`,
    cacheKey: "cryptoNews",
    options: {
      cacheTtl: 1800,
    },
  });
};

module.exports = {
  fetchCryptoNews,
};
