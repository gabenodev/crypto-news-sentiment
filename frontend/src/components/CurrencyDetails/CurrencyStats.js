import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaLink,
  FaReddit,
  FaComments,
  FaArrowUp,
  FaArrowDown,
  FaChartLine,
} from "react-icons/fa";
import { CgWebsite } from "react-icons/cg";
import { ClipLoader } from "react-spinners";
import { motion } from "framer-motion";

function CurrencyStats() {
  const { coinId } = useParams();
  const [coinData, setCoinData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(
          `https://sentimentx-backend.vercel.app/api/coin-data?coinId=${coinId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        setCoinData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching coin data:", error);
        setError(
          "There was an error fetching the coin data. Please try again."
        );
        setLoading(false);
      }
    }

    fetchData();
  }, [coinId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen dark:bg-gray-900">
        <ClipLoader size={50} color="#3B82F6" />
        <p className="text-center text-gray-700 dark:text-gray-300 ml-4">
          Loading cryptocurrency data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-md text-center">
          <p className="text-red-500 dark:text-red-400 text-lg font-medium">
            {error}
          </p>
        </div>
      </div>
    );
  }

  const formatPrice = (price) => {
    if (price < 0.0001) {
      return price.toFixed(8);
    }
    return price.toLocaleString();
  };

  const currentPrice = coinData.market_data.current_price.usd;
  const athPrice = coinData.market_data.ath.usd;
  const atlPrice = coinData.market_data.atl.usd;
  const high24h = coinData.market_data.high_24h.usd;
  const low24h = coinData.market_data.low_24h.usd;
  const athChangePercentage = coinData.market_data.ath_change_percentage.usd;
  const atlChangePercentage = coinData.market_data.atl_change_percentage.usd;
  const athDate = new Date(
    coinData.market_data.ath_date.usd
  ).toLocaleDateString();
  const atlDate = new Date(
    coinData.market_data.atl_date.usd
  ).toLocaleDateString();
  const progress = ((currentPrice - atlPrice) / (athPrice - atlPrice)) * 100;

  const priceChange24h = coinData.market_data.price_change_24h;
  const priceChangePercentage24h =
    coinData.market_data.price_change_percentage_24h;
  const marketCapChangePercentage24h =
    coinData.market_data.market_cap_change_percentage_24h;

  return (
    <div className="min-h-screen dark:bg-gray-900 p-4 md:p-8">
      {/* Header Section */}
      <motion.div
        className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <img
            src={coinData.image.large}
            alt={coinData.name}
            className="h-16 w-16 rounded-full border-4 border-white dark:border-gray-700 shadow-md"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {coinData.name}{" "}
              <span className="text-gray-500 dark:text-gray-400">
                ({coinData.symbol.toUpperCase()})
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              #{coinData.market_cap_rank} by Market Cap
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Current Price
          </p>
          <div className="flex items-end space-x-2">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              ${formatPrice(currentPrice)}
            </p>
            <span
              className={`flex items-center text-sm font-medium mb-1 ${
                priceChangePercentage24h >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {priceChangePercentage24h >= 0 ? (
                <FaArrowUp className="mr-1" />
              ) : (
                <FaArrowDown className="mr-1" />
              )}
              {Math.abs(priceChangePercentage24h).toFixed(2)}%
            </span>
          </div>
        </div>
      </motion.div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Market Data Card */}
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <FaChartLine className="mr-2 text-blue-500" />
              Market Data
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Market Cap
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  ${coinData.market_data.market_cap.usd.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  24h Volume
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  ${coinData.market_data.total_volume.usd.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Circulating Supply
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {coinData.market_data.circulating_supply.toLocaleString()}{" "}
                  {coinData.symbol.toUpperCase()}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Price Position Card */}
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Price Position
            </h2>
            <div className="space-y-4">
              <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div
                  className="absolute h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
                <div
                  className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-md"
                  style={{ left: `${progress}%`, top: "50%" }}
                ></div>
              </div>

              <div className="flex justify-between text-sm">
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-300">ATL</p>
                  <p className="font-medium text-blue-500">
                    ${formatPrice(atlPrice)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-300">Current</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    ${formatPrice(currentPrice)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-300">ATH</p>
                  <p className="font-medium text-orange-500">
                    ${formatPrice(athPrice)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ATH Change
                  </p>
                  <p
                    className={`text-lg font-semibold ${
                      athChangePercentage >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {athChangePercentage.toFixed(2)}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {athDate}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ATL Change
                  </p>
                  <p
                    className={`text-lg font-semibold ${
                      atlChangePercentage >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {atlChangePercentage.toFixed(2)}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {atlDate}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Middle Column - 24h Statistics */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
            24 Hour Statistics
          </h2>
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">High</span>
              <span className="font-medium text-green-500">
                ${formatPrice(high24h)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Low</span>
              <span className="font-medium text-red-500">
                ${formatPrice(low24h)}
              </span>
            </div>

            <div className="h-px bg-gray-200 dark:bg-gray-700 my-4"></div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">
                Price Change
              </span>
              <div className="flex items-center">
                <span
                  className={`font-medium ${
                    priceChange24h >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  ${formatPrice(Math.abs(priceChange24h))}
                </span>
                {priceChange24h >= 0 ? (
                  <FaArrowUp className="ml-2 text-green-500" />
                ) : (
                  <FaArrowDown className="ml-2 text-red-500" />
                )}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">
                Price Change %
              </span>
              <span
                className={`font-medium ${
                  priceChangePercentage24h >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {priceChangePercentage24h.toFixed(2)}%
              </span>
            </div>

            <div className="h-px bg-gray-200 dark:bg-gray-700 my-4"></div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">
                Market Cap Change %
              </span>
              <span
                className={`font-medium ${
                  marketCapChangePercentage24h >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {marketCapChangePercentage24h.toFixed(2)}%
              </span>
            </div>
          </div>
        </motion.div>

        {/* Right Column - Links */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
            Resources & Links
          </h2>
          <div className="space-y-4">
            <a
              href={coinData.links.homepage[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full mr-3">
                <CgWebsite className="text-blue-500 text-xl" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Official Website
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {coinData.links.homepage[0]}
                </p>
              </div>
            </a>

            <a
              href={coinData.links.blockchain_site[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-full mr-3">
                <FaLink className="text-purple-500 text-xl" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Blockchain Explorer
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {coinData.links.blockchain_site[0]}
                </p>
              </div>
            </a>

            <a
              href={coinData.links.whitepaper}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full mr-3">
                <FaComments className="text-green-500 text-xl" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Whitepaper
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  Technical Documentation
                </p>
              </div>
            </a>

            <a
              href={coinData.links.subreddit_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <div className="bg-orange-100 dark:bg-orange-900/50 p-2 rounded-full mr-3">
                <FaReddit className="text-orange-500 text-xl" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Subreddit
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  Community Discussion
                </p>
              </div>
            </a>
          </div>
        </motion.div>
      </div>

      {/* Description Section */}
      {coinData.description.en && (
        <motion.div
          className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            About {coinData.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {coinData.description.en.split(". ")[0]}.{" "}
            {coinData.description.en.split(". ")[1]}.
          </p>
          {coinData.description.en.split(". ").length > 2 && (
            <button className="mt-3 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
              Read more...
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default CurrencyStats;
