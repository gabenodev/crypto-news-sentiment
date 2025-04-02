const { fetchWithRetry } = require("../utils/fetchUtils");
const { REDIS } = require("../config/env");

const CACHE_PREFIX = "sentimentx:"; // Evită conflictul cu alte keys

const getCachedData = async (cacheKey, fetchFreshData, expireTime = 60) => {
  const fullKey = `${CACHE_PREFIX}${cacheKey}`;

  try {
    // 1. Verifică cache-ul (GET)
    const getResponse = await fetchWithRetry(
      `${REDIS.URL}/get/${encodeURIComponent(fullKey)}`,
      {
        headers: { Authorization: `Bearer ${REDIS.TOKEN}` },
        timeout: 2000, // Timeout scăzut pentru cache (nu folosi valoarea de la API extern)
      }
    );

    const { result } = await getResponse.json();
    if (result) {
      return JSON.parse(result);
    }

    // 2. Dacă nu există, obține date proaspete
    const freshData = await fetchFreshData();

    // 3. Setează cache cu EXPIRE (POST cu parametru EX)
    await fetchWithRetry(
      `${REDIS.URL}/set/${encodeURIComponent(fullKey)}?EX=${expireTime}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${REDIS.TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(freshData),
        timeout: 2000, // Timeout scăzut
      }
    );

    return freshData;
  } catch (error) {
    console.error(`[CACHE FAIL] Key ${fullKey}:`, error.message);
    return await fetchFreshData(); // Fallback la date proaspete
  }
};

module.exports = { getCachedData };
