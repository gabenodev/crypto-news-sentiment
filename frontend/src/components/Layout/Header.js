import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBitcoin, FaEthereum, FaChartLine, FaGlobe } from "react-icons/fa";
import NightToggle from "./NightToggle";
import { motion } from "framer-motion";

function Header() {
  const [cryptoData, setCryptoData] = useState({
    bitcoinDominance: 0,
    ethereumDominance: 0,
    totalVolume24h: 0,
    totalMarketCap: 0,
    marketCapChange24h: 0,
  });

  useEffect(() => {
    const fetchCoinGeckoData = async () => {
      try {
        const response = await fetch("https://api.coingecko.com/api/v3/global");
        const data = await response.json();
        const globalMetrics = data.data;
        setCryptoData({
          bitcoinDominance: globalMetrics.market_cap_percentage.btc,
          ethereumDominance: globalMetrics.market_cap_percentage.eth,
          totalVolume24h: globalMetrics.total_volume.usd,
          totalMarketCap: globalMetrics.total_market_cap.usd,
          marketCapChange24h:
            globalMetrics.market_cap_change_percentage_24h_usd,
        });
      } catch (error) {
        console.error("Error fetching CoinGecko data:", error);
      }
    };

    fetchCoinGeckoData();
  }, []);

  return (
    <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-6 shadow-sm w-full">
      <div className="w-full px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-10">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-3xl font-bold tracking-tight"
            >
              <Link
                to="/"
                className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-500 hover:opacity-80 transition-opacity duration-200"
              >
                SentimentX
              </Link>
            </motion.h1>

            {/* Navbar cu Link în loc de butoane */}
            <nav className="flex space-x-6 text-lg font-medium">
              <Link
                to="/news"
                className="text-gray-300 hover:text-teal-400 transition duration-300"
              >
                News
              </Link>
              <Link
                to="/altcoin-season-index"
                className="text-gray-300 hover:text-teal-400 transition duration-300"
              >
                Altcoin Season Index
              </Link>
              <Link
                to="/sentiment-trend"
                className="text-gray-300 hover:text-teal-400 transition duration-300"
              >
                Sentiment Trend
              </Link>
              <Link
                to="/whale-transactions"
                className="text-gray-300 hover:text-teal-400 transition duration-300"
              >
                Whale Transactions
              </Link>
            </nav>
          </div>

          <div className="flex items-center">
            <NightToggle />
          </div>
        </div>

        <div className="my-4 h-px bg-gradient-to-r from-teal-400 to-green-500"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex space-x-8 text-xs font-medium text-gray-300"
        >
          <div className="flex items-center space-x-2">
            <FaBitcoin className="text-yellow-400" />
            <span>
              BTC Dominance: {cryptoData.bitcoinDominance.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <FaEthereum className="text-purple-400" />
            <span>
              ETH Dominance: {cryptoData.ethereumDominance.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <FaChartLine className="text-green-400" />
            <span>Vol: ${cryptoData.totalVolume24h.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaGlobe className="text-blue-400" />
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
