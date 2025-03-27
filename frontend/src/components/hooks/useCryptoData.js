import { useEffect, useState } from "react";

function useCryptoData() {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await fetch(
          "https://sentimentx-backend.vercel.app/api/all-cryptos"
        );
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        setCryptoData(
          data.sort((a, b) => a.market_cap_rank - b.market_cap_rank)
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoData();
  }, []);

  return { cryptoData, loading };
}

export default useCryptoData;
