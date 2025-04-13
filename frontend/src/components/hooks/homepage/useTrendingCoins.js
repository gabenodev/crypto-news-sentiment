import { useEffect, useState } from "react";

function useTrendingCoins() {
  const [trendingCoins, setTrendingCoins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingCoins = async () => {
      try {
        const response = await fetch(
          "https://sentimentx-backend.vercel.app/api/trending"
        );
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        setTrendingCoins(data.coins.slice(0, 5));
      } catch (error) {
        console.error("Error fetching trending coins:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingCoins();
  }, []);

  return { trendingCoins, loading };
}

export default useTrendingCoins;
