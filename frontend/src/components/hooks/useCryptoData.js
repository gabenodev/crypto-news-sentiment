import { useEffect, useState } from "react";

function useCryptoData(page = 1) {
  // ← Adăugăm "page" ca parametru
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);

  const excludedCoins = [
    "tether",
    "usd-coin",
    "wrapped-bitcoin",
    "staked-ether",
    "binance-usd",
    "dai",
    "trueusd",
    "wrapped-steth",
    "weth",
    "ethereum-classic",
    "coinbase-wrapped-btc",
    "wrapped-ethereum",
    "usds",
    "wrapped-eeth",
    "bitcoin-cash",
    "wrapped-ust",
    "susds",
    "ethena-usde",
    "first-digital-usd",
    "paypal-usd",
    "usual-usd",
    "binance-staked-sol",
    "solv-protocol-solvbtc-bbn",
    "lombard-staked-btc",
    "wrapped-avax",
    "solv-btc",
    "binance-peg-weth",
    "kelp-dao-restaked-eth",
    "mantle-staked-ether",
    "rocket-pool-eth",
  ];

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await fetch(
          `https://sentimentx-backend.vercel.app/api/all-cryptos?per_page=${
            page * 100
          }`
        );
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();

        const filteredData = data
          .filter((coin) => !excludedCoins.includes(coin.id)) // Excludem monedele
          .sort((a, b) => a.market_cap_rank - b.market_cap_rank); // Sortăm

        setCryptoData(filteredData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]); // ← Adăugăm "page" ca dependency

  return { cryptoData, loading };
}

export default useCryptoData;
