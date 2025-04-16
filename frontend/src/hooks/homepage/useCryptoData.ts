"use client";

import { useEffect, useState } from "react";
import { excludedCoins } from "../../utils/excludedCoins";
import type { Cryptocurrency } from "../../types";

function useCryptoData(page = 1) {
  const [cryptoData, setCryptoData] = useState<Cryptocurrency[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://sentimentx-backend.vercel.app/api/all-cryptos?per_page=${
            page * 100
          }`
        );
        if (!response.ok) throw new Error("Network response was not ok");

        const data: Cryptocurrency[] = await response.json();

        const filteredData = data
          .filter((coin) => !excludedCoins.has(coin.id)) // Exclude coins
          .sort((a, b) => a.market_cap_rank - b.market_cap_rank); // Sort

        setCryptoData(filteredData);
        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch cryptocurrency data");
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoData();
  }, [page]);

  return { cryptoData, loading, error };
}

export default useCryptoData;
