module.exports = {
  PORT: process.env.PORT || 5000,
  NEWS_API_KEY: process.env.NEWS_API_KEY,
  API_KEY_ETH: process.env.API_KEY_ETH,
  REDIS: {
    URL: process.env.UPSTASH_REDIS_REST_URL,
    TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  },
  API_OPTIONS: {
    retries: 3,
    timeout: 5000,
    fallbackEnabled: true,
  },
  CACHE_CONFIG: {
    // Enable/disable internal periodic warmup (set to false if using GitHub Actions)
    enablePeriodicWarmup: false,

    // Default TTL values for different data types (in seconds)
    ttl: {
      // Static data that rarely changes
      static: 86400, // 1 day

      // Semi-static data that changes a few times per day
      semiStatic: 21600, // 6 hours

      // Dynamic data that changes frequently
      dynamic: 3600, // 1 hour

      // Highly dynamic data that changes very frequently
      highlyDynamic: 900, // 15 minutes

      // User-specific or search data
      userSpecific: 300, // 5 minutes
    },
  },
};
