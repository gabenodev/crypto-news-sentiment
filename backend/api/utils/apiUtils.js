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
  processData = (data) => data,
  options = {},
}) {
  const { retries, timeout, cacheTtl, fallbackEnabled } = {
    ...API_OPTIONS,
    ...options,
  };

  // 1. Încearcă cache-ul (cu timeout scăzut)
  try {
    const cachedData = await Promise.race([
      getCachedData(cacheKey, () => {}, cacheTtl),
      new Promise(
        (_, reject) =>
          setTimeout(() => reject(new Error("Cache timeout")), 1000) // 1s pentru cache
      ),
    ]);
    if (cachedData) return cachedData;
  } catch (cacheError) {
    console.error(`[CACHE]`, cacheError.message);
  }

  // 2. Request la API extern (cu timeout mai lung)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetchWithRetry(url, {
      retries,
      signal: controller.signal, // Pentru abort
    });
    clearTimeout(timeoutId);

    const data = await response.json();
    const processedData = processData(data);

    // 3. Salvează în cache (fără a aștepta rezultatul)
    getCachedData(cacheKey, () => processedData, cacheTtl)
      .then(() => console.log(`[CACHE] Updated ${cacheKey}`))
      .catch((e) => console.error(`[CACHE] Save failed:`, e.message));

    return processedData;
  } catch (error) {
    clearTimeout(timeoutId);
    // 4. Fallback la cache (dacă e activat)
    if (fallbackEnabled) {
      const lastGoodData = await getCachedData(cacheKey, () => {}, cacheTtl);
      if (lastGoodData) return lastGoodData;
    }
    throw error;
  }
}

module.exports = {
  fetchApiWithStrategy,
};
