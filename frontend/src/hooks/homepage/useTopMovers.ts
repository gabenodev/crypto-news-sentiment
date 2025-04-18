"use client";

import { useEffect, useState } from "react";
import { fetchTopMoversData } from "../../utils/API/CoinGeckoAPI"; // Importă funcția din api.ts
import type { Cryptocurrency } from "../../types";

function useTopMovers(page = 1) {
  const [topMovers, setTopMovers] = useState<Cryptocurrency[]>([]);
  const [topLosers, setTopLosers] = useState<Cryptocurrency[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { topMovers, topLosers } = await fetchTopMoversData(page); // Folosește funcția din api.ts
        setTopMovers(topMovers);
        setTopLosers(topLosers);
        setError(null);
      } catch (error) {
        console.error("Error fetching top movers:", error);
        setError("Failed to fetch top movers data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page]);

  return { topMovers, topLosers, loading, error };
}

export default useTopMovers;
