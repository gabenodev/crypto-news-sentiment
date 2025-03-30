const { fetchWithRetry } = require("./fetchUtils");
const { API_OPTIONS } = require("../config/env");
const { getCachedData } = require("../services/cacheService");

/**
 * Smart API fetching strategy with:
 * - Caching
 * - Retry mechanism
 * - Timeout protection
 * - Fallback to cached data
 * @param {Object} params - Configuration object
 * @param {string} params.url - API endpoint URL
 * @param {string} params.cacheKey - Unique key for Redis caching
 * @param {Function} [params.processData] - Data processing function
 * @param {Object} [params.options] - Custom options to override defaults
 */

async function fetchApiWithStrategy({
  url,
  cacheKey,
  processData = (data) => data, // Default processing (identity function)
  options = {},
}) {
  // Merge default options with custom options
  const { retries, timeout, cacheTtl, fallbackEnabled } = {
    ...API_OPTIONS, // Default values from config
    ...options, // Custom overrides
  };

  // 1. FIRST TRY CACHE
  try {
    // Check if valid data exists in cache
    const cachedData = await getCachedData(cacheKey, () => {}, cacheTtl);
    if (cachedData) {
      console.log(`[CACHE HIT] ${cacheKey}`);
      return cachedData;
    }
  } catch (cacheError) {
    console.error(`[CACHE ERROR] ${cacheKey}:`, cacheError.message);
  }

  // 2. FETCH FROM API
  try {
    console.log(`[API FETCH] Starting: ${url}`);

    // Race between API call and timeout
    const response = await Promise.race([
      fetchWithRetry(url, { retries }), // Fetch with retry attempts
      new Promise(
        (
          _,
          reject // Timeout promise
        ) =>
          setTimeout(
            () => reject(new Error(`Timeout after ${timeout}ms`)),
            timeout
          )
      ),
    ]);

    // Process the response data
    const data = await response.json();
    const processedData = processData(data);

    // 3. SAVE TO CACHE
    try {
      await getCachedData(cacheKey, () => processedData, cacheTtl);
      console.log(`[CACHE SET] ${cacheKey} for ${cacheTtl} seconds`);
    } catch (saveError) {
      console.error(`[CACHE SAVE ERROR] ${cacheKey}:`, saveError.message);
    }

    return processedData;
  } catch (error) {
    console.error(`[API ERROR] ${url}:`, error.message);

    // 4. FALLBACK TO CACHED DATA IF ENABLED
    if (fallbackEnabled) {
      try {
        const lastGoodData = await getCachedData(cacheKey, () => {}, cacheTtl);
        if (lastGoodData) {
          console.log(`[FALLBACK] Returning last valid data for ${cacheKey}`);
          return lastGoodData;
        }
      } catch (fallbackError) {
        console.error("[FALLBACK ERROR]", fallbackError.message);
      }
    }

    throw error;
  }
}

module.exports = {
  fetchApiWithStrategy,
};
