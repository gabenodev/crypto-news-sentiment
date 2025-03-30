const { REDIS } = require("../config/env");
const { fetchWithRetry } = require("../utils/fetchUtils");

/**
 * Smart caching function that:
 * 1. Checks Redis cache first
 * 2. Falls back to API if no cache
 * 3. Updates cache with fresh data
 */

const getCachedData = async (cacheKey, fetchFunction, expireTime = 60) => {
  try {
    const cachedDataResponse = await fetchWithRetry(
      `${REDIS.URL}/get/${cacheKey}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${REDIS.TOKEN}`,
        },
      }
    );

    const cachedData = await cachedDataResponse.json();
    if (cachedData.result) {
      console.log(`[CACHE HIT] Returning cached data for: ${cacheKey}`);
      return JSON.parse(cachedData.result);
    }

    console.log(`[CACHE MISS] Fetching new data for: ${cacheKey}`);
    const freshData = await fetchFunction();

    await fetchWithRetry(`${REDIS.URL}/set/${cacheKey}?EX=${expireTime}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REDIS.TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(freshData),
    });

    return freshData;
  } catch (error) {
    console.error("Redis operation failed:", error);
    return await fetchFunction();
  }
};

module.exports = {
  getCachedData,
};
