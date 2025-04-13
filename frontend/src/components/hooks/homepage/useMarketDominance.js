import { useEffect, useState } from "react";
import { fetchMarketDominance } from "../../../utils/api";

function useMarketDominance() {
  const [dominance, setDominance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(false);

        const data = await fetchMarketDominance(); // Apelează funcția din api.js

        const marketData = data.data.market_cap_percentage; // Obține datele de care ai nevoie

        const btc = parseFloat(marketData.btc.toFixed(2));
        const eth = parseFloat(marketData.eth.toFixed(2));
        const usdt = parseFloat(marketData.usdt?.toFixed(2) || 0);
        const others = 100 - btc - eth - usdt;

        setDominance([
          { name: "BTC", value: btc },
          { name: "ETH", value: eth },
          { name: "USDT", value: usdt },
          { name: "OTHERS", value: parseFloat(others.toFixed(2)) },
        ]);
      } catch (err) {
        setError(true);
        console.error("Error fetching market dominance:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { dominance, loading, error };
}

export default useMarketDominance;
