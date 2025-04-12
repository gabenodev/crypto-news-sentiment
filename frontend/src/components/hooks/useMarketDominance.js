import { useEffect, useState } from "react";
import axios from "axios";

function useMarketDominance() {
  const [dominance, setDominance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchMarketDominance = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await axios.get(
          "https://sentimentx-backend.vercel.app/api/market-dominance"
        );
        const data = res.data.data.market_cap_percentage;

        const btc = parseFloat(data.btc.toFixed(2));
        const eth = parseFloat(data.eth.toFixed(2));
        const usdt = parseFloat(data.usdt?.toFixed(2) || 0);
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

    fetchMarketDominance();
  }, []);

  return { dominance, loading, error };
}

export default useMarketDominance;
