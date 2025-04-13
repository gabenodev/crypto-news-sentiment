const axios = require("axios");

const warmupCache = async () => {
  try {
    // Exemplu de endpointuri care trebuie încărcate pentru warm-up
    const urls = [
      "https://sentimentx-backend.vercel.app/api/all-cryptos",
      "https://sentimentx-backend.vercel.app/api/trending",
      "https://sentimentx-backend.vercel.app/api/market-dominance",
    ];

    // Trimite cereri pentru a încărca cache-ul
    await Promise.all(
      urls.map((url) =>
        axios.get(url).then(() => console.log(`Warm-up completed for: ${url}`))
      )
    );
    console.log("Cache warmed up successfully!");
  } catch (error) {
    console.error("Error warming up the cache:", error);
  }
};

module.exports = { warmupCache };
