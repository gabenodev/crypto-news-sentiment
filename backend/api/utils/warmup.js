const axios = require("axios");
const { localCache } = require("../services/cacheService");

const warmupCache = async () => {
  try {
    // Check if warmup was recently performed (avoid redundant warmups)
    if (localCache.get("warmup:lastRun")) {
      console.log("Cache was recently warmed up, skipping...");
      return;
    }

    console.log("Starting cache warmup...");

    // Endpoints to warm up in parallel
    const urls = [
      "https://sentimentx-backend.vercel.app/api/all-cryptos",
      "https://sentimentx-backend.vercel.app/api/trending",
      "https://sentimentx-backend.vercel.app/api/market-dominance",
    ];

    // Fetch all endpoints in parallel with increased timeout
    const results = await Promise.allSettled(
      urls.map((url) =>
        axios
          .get(url, {
            timeout: 15000,
            headers: { "Cache-Control": "no-cache" },
          })
          .then(() => ({ url, success: true }))
          .catch((err) => ({ url, success: false, error: err.message }))
      )
    );

    // Log results
    const successful = results.filter(
      (r) => r.status === "fulfilled" && r.value.success
    ).length;
    const failed = results.length - successful;

    console.log(
      `Cache warmup completed: ${successful} successful, ${failed} failed`
    );

    // Set a flag to avoid redundant warmups (expires after 10 minutes)
    localCache.set("warmup:lastRun", true, 600);

    return {
      successful,
      failed,
      details: results.map((r) =>
        r.status === "fulfilled" ? r.value : { success: false, error: r.reason }
      ),
    };
  } catch (error) {
    console.error("Error warming up the cache:", error);
    throw error;
  }
};

module.exports = { warmupCache };
