import React, { useState, useEffect } from "react";
import { FaBitcoin, FaEthereum, FaChartLine, FaGlobe } from "react-icons/fa"; // Importă iconițele
import NightToggle from "./NightToggle"; // Importă componenta NightToggle
import { motion } from "framer-motion"; // Importă motion de la framer-motion

function Header({ setActiveTab }) {
  const [cryptoData, setCryptoData] = useState({
    bitcoinDominance: 0,
    ethereumDominance: 0,
    totalVolume24h: 0,
    totalMarketCap: 0,
    marketCapChange24h: 0,
  });

  useEffect(() => {
    // Funcție pentru a obține datele de la CoinGecko
    const fetchCoinGeckoData = async () => {
      try {
        const response = await fetch("https://api.coingecko.com/api/v3/global");
        const data = await response.json();
        console.log("API Response:", data); // Debugging: Afișează răspunsul API

        // Extrage datele necesare
        const globalMetrics = data.data;
        const bitcoinDominance = globalMetrics.market_cap_percentage.btc;
        const ethereumDominance = globalMetrics.market_cap_percentage.eth;
        const totalVolume24h = globalMetrics.total_volume.usd;
        const totalMarketCap = globalMetrics.total_market_cap.usd;
        const marketCapChange24h =
          globalMetrics.market_cap_change_percentage_24h_usd;

        // Actualizează state-ul cu noile date
        setCryptoData({
          bitcoinDominance,
          ethereumDominance,
          totalVolume24h,
          totalMarketCap,
          marketCapChange24h,
        });
      } catch (error) {
        console.error("Error fetching CoinGecko data:", error); // Debugging: Afișează erorile
      }
    };

    fetchCoinGeckoData();
  }, []);

  return (
    <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-6 shadow-sm w-full">
      {/* Elimină max-w-7xl și ajustează padding-ul */}
      <div className="w-full px-6 sm:px-8 lg:px-12">
        {/* Titlul site-ului, navbar-ul și NightToggle pe aceeași linie */}
        <div className="flex items-center justify-between">
          {/* Partea din stânga: Titlul și navbar-ul */}
          <div className="flex items-center space-x-10">
            {/* Titlul site-ului cu animație */}
            <motion.h1
              initial={{ opacity: 0, y: -20 }} // Starea inițială
              animate={{ opacity: 1, y: 0 }} // Starea finală
              transition={{ delay: 0.2, duration: 0.5 }} // Tranziția
              className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-500"
            >
              SentimentX
            </motion.h1>

            {/* Navbar */}
            <nav className="flex space-x-6 text-lg font-medium">
              <button
                className="text-gray-300 hover:text-teal-400 transition duration-300"
                onClick={() => setActiveTab("news")}
              >
                News
              </button>

              <button
                className="text-gray-300 hover:text-teal-400 transition duration-300"
                onClick={() => setActiveTab("altcoin")}
              >
                Altcoin Season Index
              </button>

              <button
                className="text-gray-300 hover:text-teal-400 transition duration-300"
                onClick={() => setActiveTab("sentiment")}
              >
                Sentiment Trend
              </button>

              <button
                className="text-gray-300 hover:text-teal-400 transition duration-300"
                onClick={() => setActiveTab("whaleTransactions")}
              >
                Whale Transactions
              </button>
            </nav>
          </div>

          {/* Partea din dreapta: NightToggle */}
          <div className="flex items-center">
            <NightToggle />
          </div>
        </div>

        {/* Linie de separare cu gradient */}
        <div className="my-4 h-px bg-gradient-to-r from-teal-400 to-green-500"></div>

        {/* Informații despre crypto cu animație */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} // Starea inițială
          animate={{ opacity: 1, y: 0 }} // Starea finală
          transition={{ delay: 0.4, duration: 0.5 }} // Tranziția
          className="flex space-x-8 text-sm font-medium text-gray-300"
        >
          {/* Bitcoin Dominance */}
          <div className="flex items-center space-x-2">
            <FaBitcoin className="text-yellow-400" /> {/* Iconița Bitcoin */}
            <span>
              BTC Dominance: {cryptoData.bitcoinDominance.toFixed(2)}%
            </span>
          </div>

          {/* Ethereum Dominance */}
          <div className="flex items-center space-x-2">
            <FaEthereum className="text-purple-400" /> {/* Iconița Ethereum */}
            <span>
              ETH Dominance: {cryptoData.ethereumDominance.toFixed(2)}%
            </span>
          </div>

          {/* 24h Volume */}
          <div className="flex items-center space-x-2">
            <FaChartLine className="text-green-400" /> {/* Iconița Volume */}
            <span>Vol: ${cryptoData.totalVolume24h.toLocaleString()}</span>
          </div>

          {/* Market Cap */}
          <div className="flex items-center space-x-2">
            <FaGlobe className="text-blue-400" /> {/* Iconița Market Cap */}
            <span>Cap: ${cryptoData.totalMarketCap.toLocaleString()}</span>
            <span
              className={
                cryptoData.marketCapChange24h >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }
            >
              {cryptoData.marketCapChange24h >= 0 ? "▲" : "▼"}{" "}
              {Math.abs(cryptoData.marketCapChange24h).toFixed(2)}%
            </span>
          </div>
        </motion.div>
      </div>
    </header>
  );
}

export default Header;
