"use client";

import { useEffect, useState } from "react";
import type { TrendingCoin } from "../../../types";

function useTrendingCoins() {
  const [trendingCoins, setTrendingCoins] = useState<TrendingCoin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendingCoins = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://sentimentx-backend.vercel.app/api/trending"
        );
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        setTrendingCoins(data.coins.slice(0, 5));
        setError(null);
      } catch (error) {
        console.error("Error fetching trending coins:", error);
        setError("Failed to fetch trending coins data");
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingCoins();
  }, []);

  return { trendingCoins, loading, error };
}

export default useTrendingCoins;
