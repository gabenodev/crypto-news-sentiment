const { fetchWithRetry } = require("./fetchUtils");
const { API_OPTIONS } = require("../config/env");
const { getCachedData, batchSetCache } = require("../services/cacheService");

/**
 * Smart API fetching strategy with:
 * - Caching
 * - Retry mechanism
 * - Timeout protection
 * - Fallback to cached data
 * - Batch operations support
 * @param {Object} params - Configuration object
 * @param {string} params.url - API endpoint URL
 * @param {string} params.cacheKey - Unique key for Redis caching
 * @param {Function} [params.processData] - Data processing function
 * @param {Object} [params.options] - Custom options to override defaults
 */

async function fetchApiWithStrategy({
  url,
  cacheKey,
  processData = (data) => data,
  options = {},
}) {
  const { retries, timeout, cacheTtl, fallbackEnabled } = {
    ...API_OPTIONS,
    ...options,
  };

  try {
    return await getCachedData(
      cacheKey,
      async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          const response = await fetchWithRetry(url, {
            retries,
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          const data = await response.json();
          return processData(data);
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      },
      cacheTtl
    );
  } catch (error) {
    console.error(`[API] Fetch failed for ${cacheKey}:`, error.message);

    if (fallbackEnabled) {
      // This will try to get stale data from cache
      return await getCachedData(
        cacheKey,
        () => {
          throw new Error(`No fallback data available for ${cacheKey}`);
        },
        cacheTtl
      );
    }

    throw error;
  }
}

/**
 * Batch fetch multiple API endpoints and cache them together
 * This reduces the number of Redis operations
 */
async function batchFetchApis(requests) {
  const results = [];
  const cacheUpdates = [];

  // Process each request
  for (const {
    url,
    cacheKey,
    processData = (data) => data,
    options = {},
  } of requests) {
    try {
      const { cacheTtl } = {
        ...API_OPTIONS,
        ...options,
      };

      // Try to get from cache first
      let result = await getCachedData(cacheKey, null, cacheTtl);

      // If not in cache, fetch it
      if (!result) {
        const response = await fetchWithRetry(url, {
          retries: options.retries || API_OPTIONS.retries,
        });
        const data = await response.json();
        result = processData(data);

        // Add to batch cache update
        cacheUpdates.push({
          key: cacheKey,
          data: result,
          expireTime: cacheTtl,
        });
      }

      results.push(result);
    } catch (error) {
      console.error(`[BATCH API] Failed for ${cacheKey}:`, error.message);
      results.push(null); // Push null for failed requests
    }
  }

  // Update cache in batch if we have items to update
  if (cacheUpdates.length > 0) {
    batchSetCache(cacheUpdates).catch((err) =>
      console.error("[BATCH API] Failed to update cache:", err.message)
    );
  }

  return results;
}

module.exports = {
  fetchApiWithStrategy,
  batchFetchApis,
};
