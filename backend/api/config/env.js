module.exports = {
  PORT: process.env.PORT || 5000,
  NEWS_API_KEY: process.env.NEWS_API_KEY,
  REDIS: {
    URL: process.env.UPSTASH_REDIS_REST_URL,
    TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  },
  API_OPTIONS: {
    retries: 3,
    timeout: 5000,
    cacheTtl: 3600,
    fallbackEnabled: true,
  },
};
