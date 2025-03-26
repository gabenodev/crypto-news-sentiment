import React, { useEffect, useState } from "react";
import CryptoTable from "./CryptoTable";
import TrendingCoins from "./TrendingCoins";

function Homepage() {
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
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchCryptoData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 py-8 w-full">
      {/* Titlu */}
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-green-600">
            Crypto Market Pulse
          </span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Real-time tracking of the cryptocurrency market
        </p>
      </div>

      {/* Trending Coins */}
      <div className="w-full max-w-6xl mb-10">
        <TrendingCoins />
      </div>

      {/* Crypto Table - Pe toată lățimea ecranului */}
      <div className="w-full">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          All Cryptocurrencies
        </h2>
        <div className="w-full overflow-x-auto">
          <CryptoTable cryptoData={cryptoData} />
        </div>
      </div>
    </div>
  );
}

export default Homepage;
