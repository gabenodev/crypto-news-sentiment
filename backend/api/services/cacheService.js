const { fetchWithRetry } = require("../utils/fetchUtils");
const { REDIS } = require("../config/env");
const NodeCache = require("node-cache");

// Create an in-memory cache with a standard TTL of 5 minutes
const localCache = new NodeCache({
  stdTTL: 300,
  checkperiod: 60,
  useClones: false,
});

// Pending requests map to avoid duplicate Redis/API calls
const pendingRequests = new Map();

const CACHE_PREFIX = "sentimentx:"; // Avoid conflict with other keys

/**
 * Enhanced caching service with:
 * - Local in-memory cache layer
 * - Request deduplication
 * - Increased default TTL
 * - Stale-while-revalidate pattern
 * - Graceful fallback
 */
const getCachedData = async (cacheKey, fetchFreshData, expireTime = 3600) => {
  const fullKey = `${CACHE_PREFIX}${cacheKey}`;
  const localCacheKey = `local:${fullKey}`;

  try {
    // 1. Check local in-memory cache first (fastest)
    const localData = localCache.get(localCacheKey);
    if (localData) {
      // If we have local data, use it immediately
      console.log(`[CACHE HIT] Local cache for ${cacheKey}`);

      // Refresh cache in background if more than half the TTL has passed
      const ttl = localCache.getTtl(localCacheKey);
      const now = Date.now();
      if (ttl && ttl - now < expireTime * 500) {
        // Half the expireTime in ms
        refreshCacheInBackground(
          cacheKey,
          fetchFreshData,
          expireTime,
          localCacheKey
        );
      }

      return localData;
    }

    // 2. Check if there's already a pending request for this key
    if (pendingRequests.has(fullKey)) {
      console.log(`[CACHE] Using pending request for ${cacheKey}`);
      return pendingRequests.get(fullKey);
    }

    // 3. Check Redis cache
    const fetchPromise = fetchRedisOrFresh(
      fullKey,
      fetchFreshData,
      expireTime,
      localCacheKey
    );
    pendingRequests.set(fullKey, fetchPromise);

    const result = await fetchPromise;
    pendingRequests.delete(fullKey);
    return result;
  } catch (error) {
    console.error(`[CACHE FAIL] Key ${fullKey}:`, error.message);
    pendingRequests.delete(fullKey);

    // Try to get stale data from local cache even if expired
    const staleData = localCache.get(localCacheKey, true);
    if (staleData) {
      console.log(`[CACHE] Using stale data for ${cacheKey}`);
      return staleData;
    }

    // Last resort: fetch fresh data directly
    return await fetchFreshData();
  }
};

/**
 * Fetch data from Redis or from the original data source
 */
const fetchRedisOrFresh = async (
  fullKey,
  fetchFreshData,
  expireTime,
  localCacheKey
) => {
  try {
    // Try to get from Redis
    const getResponse = await fetchWithRetry(
      `${REDIS.URL}/get/${encodeURIComponent(fullKey)}`,
      {
        headers: { Authorization: `Bearer ${REDIS.TOKEN}` },
        timeout: 2000, // Lower timeout for Redis
      }
    );

    const { result } = await getResponse.json();
    if (result) {
      const parsedResult = JSON.parse(result);
      // Store in local cache
      localCache.set(localCacheKey, parsedResult, expireTime);
      return parsedResult;
    }

    // If not in Redis, fetch fresh data
    const freshData = await fetchFreshData();

    // Store in Redis with longer expiration
    await fetchWithRetry(
      `${REDIS.URL}/set/${encodeURIComponent(fullKey)}?EX=${expireTime}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${REDIS.TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(freshData),
        timeout: 2000,
      }
    );

    // Store in local cache
    localCache.set(localCacheKey, freshData, expireTime);
    return freshData;
  } catch (error) {
    throw error;
  }
};

/**
 * Refresh cache in background without blocking the response
 */
const refreshCacheInBackground = (
  cacheKey,
  fetchFreshData,
  expireTime,
  localCacheKey
) => {
  const fullKey = `${CACHE_PREFIX}${cacheKey}`;

  // Don't await this promise - let it run in the background
  setTimeout(async () => {
    try {
      if (pendingRequests.has(fullKey)) {
        return; // Another request is already refreshing this
      }

      console.log(`[CACHE] Background refresh for ${cacheKey}`);
      const freshData = await fetchFreshData();

      // Update local cache
      localCache.set(localCacheKey, freshData, expireTime);

      // Update Redis cache
      await fetchWithRetry(
        `${REDIS.URL}/set/${encodeURIComponent(fullKey)}?EX=${expireTime}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${REDIS.TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(freshData),
          timeout: 2000,
        }
      );
    } catch (error) {
      console.error(
        `[CACHE] Background refresh failed for ${cacheKey}:`,
        error.message
      );
    }
  }, 100);
};

/**
 * Batch set multiple keys in Redis at once
 * This reduces the number of Redis commands
 */
const batchSetCache = async (items) => {
  if (!items || items.length === 0) return;

  try {
    const pipeline = items.map(({ key, data, expireTime = 3600 }) => {
      const fullKey = `${CACHE_PREFIX}${key}`;
      const localCacheKey = `local:${fullKey}`;

      // Update local cache immediately
      localCache.set(localCacheKey, data, expireTime);

      // Prepare Redis command
      return {
        key: fullKey,
        value: JSON.stringify(data),
        expireTime,
      };
    });

    // Use Redis pipeline to set multiple keys at once
    const commands = pipeline
      .map(
        (item) =>
          `SET ${encodeURIComponent(item.key)} ${JSON.stringify(
            item.value
          )} EX ${item.expireTime}`
      )
      .join("\n");

    await fetchWithRetry(`${REDIS.URL}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REDIS.TOKEN}`,
        "Content-Type": "text/plain",
      },
      body: commands,
      timeout: 3000,
    });

    console.log(`[CACHE] Batch updated ${pipeline.length} keys`);
  } catch (error) {
    console.error(`[CACHE] Batch update failed:`, error.message);
  }
};

/**
 * Clear specific cache entries
 */
const invalidateCache = async (cacheKeys) => {
  if (!Array.isArray(cacheKeys) || cacheKeys.length === 0) return;

  try {
    // Clear from local cache
    cacheKeys.forEach((key) => {
      const localCacheKey = `local:${CACHE_PREFIX}${key}`;
      localCache.del(localCacheKey);
    });

    // Clear from Redis
    const pipeline = cacheKeys
      .map((key) => `DEL ${encodeURIComponent(CACHE_PREFIX + key)}`)
      .join("\n");

    await fetchWithRetry(`${REDIS.URL}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REDIS.TOKEN}`,
        "Content-Type": "text/plain",
      },
      body: pipeline,
      timeout: 2000,
    });

    console.log(`[CACHE] Invalidated ${cacheKeys.length} keys`);
  } catch (error) {
    console.error(`[CACHE] Invalidation failed:`, error.message);
  }
};

module.exports = {
  getCachedData,
  batchSetCache,
  invalidateCache,
  localCache, // Export for direct access in special cases
};
