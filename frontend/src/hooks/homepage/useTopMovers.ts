"use client";

import { useEffect, useState } from "react";
import type { Cryptocurrency } from "../../types";

function useTopMovers(page = 1) {
  const [topMovers, setTopMovers] = useState<Cryptocurrency[]>([]);
  const [topLosers, setTopLosers] = useState<Cryptocurrency[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopMovers = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://sentimentx-backend.vercel.app/api/all-cryptos?per_page=${
            page * 100
          }`
        );
        if (!response.ok) throw new Error("Network response was not ok");

        const data: Cryptocurrency[] = await response.json();

        // Sort coins in descending order by 24h price change percentage for Top Movers
        const sortedTopMovers = [...data]
          .sort(
            (a, b) =>
              b.price_change_percentage_24h - a.price_change_percentage_24h
          )
          .slice(0, 5); // Take only the first 5 coins

        // Sort coins in ascending order by 24h price change percentage for Top Losers
        const sortedTopLosers = [...data]
          .sort(
            (a, b) =>
              a.price_change_percentage_24h - b.price_change_percentage_24h
          )
          .slice(0, 5); // Take only the first 5 coins

        setTopMovers(sortedTopMovers);
        setTopLosers(sortedTopLosers);
        setError(null);
      } catch (error) {
        console.error("Error fetching top movers:", error);
        setError("Failed to fetch top movers data");
      } finally {
        setLoading(false);
      }
    };

    fetchTopMovers();
  }, [page]);

  return { topMovers, topLosers, loading, error };
}

export default useTopMovers;
