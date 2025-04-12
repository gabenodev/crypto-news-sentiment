import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaLink,
  FaReddit,
  FaArrowUp,
  FaArrowDown,
  FaChartLine,
  FaDollarSign,
  FaExchangeAlt,
  FaCoins,
  FaChartBar,
  FaClock,
  FaChartPie,
  FaFileAlt,
  FaExternalLinkAlt,
  FaPercentage,
  FaInfoCircle,
  FaChevronUp,
  FaChevronDown,
} from "react-icons/fa";
import { CgWebsite } from "react-icons/cg";
import { ClipLoader } from "react-spinners";
import { motion } from "framer-motion";

function CurrencyStats() {
  const { coinId } = useParams();
  const [coinData, setCoinData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors duration-300">
      {/* Modern Header Section */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col space-y-4">
          {/* First Row - Coin Identity */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={coinData.image.large}
                alt={coinData.name}
                className="h-14 w-14 rounded-full border-[3px] border-white dark:border-gray-700 shadow-lg"
              />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center">
                {coinData.name}
                <span className="ml-2 text-xl font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                  {coinData.symbol.toUpperCase()}
                </span>
              </h1>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Rank #{coinData.market_cap_rank}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  •
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Market Cap: $
                  {(coinData.market_data.market_cap.usd / 1000000000).toFixed(
                    2
                  )}
                  B
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  •
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  24h Vol: $
                  {(coinData.market_data.total_volume.usd / 1000000000).toFixed(
                    2
                  )}
                  B
                </span>
              </div>
            </div>
          </div>

          {/* Second Row - Price Data */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-bold text-gray-900 dark:text-white">
                ${formatPrice(currentPrice)}
              </span>
              <span
                className={`flex items-center text-lg font-medium px-3 py-1 rounded-full ${
                  priceChangePercentage24h >= 0
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
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
        </div>
      </motion.div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Market Data Card */}
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg mr-3">
                <FaChartLine className="text-blue-500 text-xl" />
              </div>
              Market Data
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-300 flex items-center">
                  <FaDollarSign className="mr-2 text-gray-400" />
                  Market Cap
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  $
                  {(coinData.market_data.market_cap.usd / 1000000000).toFixed(
                    2
                  )}
                  B
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-300 flex items-center">
                  <FaExchangeAlt className="mr-2 text-gray-400" />
                  24h Volume
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  $
                  {(coinData.market_data.total_volume.usd / 1000000000).toFixed(
                    2
                  )}
                  B
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 dark:text-gray-300 flex items-center">
                  <FaCoins className="mr-2 text-gray-400" />
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
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg mr-3">
                <FaChartBar className="text-purple-500 text-xl" />
              </div>
              Price Position
            </h2>
            <div className="space-y-4">
              <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                {/* Background before current point - blue */}
                <div
                  className="absolute h-3 bg-blue-500 rounded-l-full"
                  style={{ width: `${progress}%` }}
                ></div>

                {/* Current point marker - now more visible */}
                <div
                  className="absolute w-2 h-2 bg-white border-3 border-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg z-10"
                  style={{
                    left: `${progress}%`,
                    top: "50%",
                    boxShadow: "0 0 0 2px rgba(255,255,255,0.8)",
                  }}
                ></div>

                {/* Background after current point - orange */}
                <div
                  className="absolute h-3 bg-orange-500 rounded-r-full"
                  style={{
                    left: `${progress}%`,
                    width: `${100 - progress}%`,
                  }}
                ></div>
              </div>

              <div className="flex justify-between text-sm mt-6">
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-300 mb-1">ATL</p>
                  <p className="font-medium text-blue-500 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    ${formatPrice(atlPrice)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {atlDate}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-300 mb-1">
                    Current
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white px-3 py-1 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    ${formatPrice(currentPrice)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Today
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-300 mb-1">ATH</p>
                  <p className="font-medium text-orange-500 px-3 py-1 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    ${formatPrice(athPrice)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {athDate}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    ATH Change
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      athChangePercentage >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {athChangePercentage >= 0 ? "+" : ""}
                    {athChangePercentage.toFixed(2)}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    From ATH
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    ATL Change
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      atlChangePercentage >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {atlChangePercentage >= 0 ? "+" : ""}
                    {atlChangePercentage.toFixed(2)}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    From ATL
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Middle Column - 24h Statistics */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg mr-3">
              <FaClock className="text-green-500 text-xl" />
            </div>
            24 Hour Statistics
          </h2>
          <div className="space-y-5">
            <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-300 flex items-center">
                <FaArrowUp className="mr-2 text-green-500" />
                High
              </span>
              <span className="font-medium text-green-500 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-lg">
                ${formatPrice(high24h)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-300 flex items-center">
                <FaArrowDown className="mr-2 text-red-500" />
                Low
              </span>
              <span className="font-medium text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-lg">
                ${formatPrice(low24h)}
              </span>
            </div>

            <div className="py-4">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-300 flex items-center">
                <FaDollarSign className="mr-2 text-gray-400" />
                Price Change
              </span>
              <div className="flex items-center">
                <span
                  className={`font-medium px-3 py-1 rounded-lg ${
                    priceChange24h >= 0
                      ? "text-green-500 bg-green-50 dark:bg-green-900/20"
                      : "text-red-500 bg-red-50 dark:bg-red-900/20"
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

            <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-300 flex items-center">
                <FaPercentage className="mr-2 text-gray-400" />
                Price Change %
              </span>
              <span
                className={`font-medium px-3 py-1 rounded-lg ${
                  priceChangePercentage24h >= 0
                    ? "text-green-500 bg-green-50 dark:bg-green-900/20"
                    : "text-red-500 bg-red-50 dark:bg-red-900/20"
                }`}
              >
                {priceChangePercentage24h >= 0 ? "+" : ""}
                {priceChangePercentage24h.toFixed(2)}%
              </span>
            </div>

            <div className="py-4">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>
            </div>

            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600 dark:text-gray-300 flex items-center">
                <FaChartPie className="mr-2 text-gray-400" />
                Market Cap Change %
              </span>
              <span
                className={`font-medium px-3 py-1 rounded-lg ${
                  marketCapChangePercentage24h >= 0
                    ? "text-green-500 bg-green-50 dark:bg-green-900/20"
                    : "text-red-500 bg-red-50 dark:bg-red-900/20"
                }`}
              >
                {marketCapChangePercentage24h >= 0 ? "+" : ""}
                {marketCapChangePercentage24h.toFixed(2)}%
              </span>
            </div>
          </div>
        </motion.div>

        {/* Right Column - Links */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg mr-3">
              <FaLink className="text-indigo-500 text-xl" />
            </div>
            Resources & Links
          </h2>
          <div className="space-y-4">
            <a
              href={coinData.links.homepage[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 border border-gray-100 dark:border-gray-700"
            >
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl mr-4">
                <CgWebsite className="text-blue-500 text-2xl" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Official Website
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {coinData.links.homepage[0]?.replace(/^https?:\/\//, "")}
                </p>
              </div>
              <FaExternalLinkAlt className="ml-auto text-gray-400" />
            </a>

            <a
              href={coinData.links.blockchain_site[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 border border-gray-100 dark:border-gray-700"
            >
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl mr-4">
                <FaLink className="text-purple-500 text-2xl" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Blockchain Explorer
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {coinData.links.blockchain_site[0]?.replace(
                    /^https?:\/\//,
                    ""
                  )}
                </p>
              </div>
              <FaExternalLinkAlt className="ml-auto text-gray-400" />
            </a>

            <a
              href={coinData.links.whitepaper}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 border border-gray-100 dark:border-gray-700"
            >
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl mr-4">
                <FaFileAlt className="text-green-500 text-2xl" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Whitepaper
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Technical Documentation
                </p>
              </div>
              <FaExternalLinkAlt className="ml-auto text-gray-400" />
            </a>

            <a
              href={coinData.links.subreddit_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 border border-gray-100 dark:border-gray-700"
            >
              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-xl mr-4">
                <FaReddit className="text-orange-500 text-2xl" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Subreddit
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {coinData.links.subreddit_url?.replace(/^https?:\/\//, "")}
                </p>
              </div>
              <FaExternalLinkAlt className="ml-auto text-gray-400" />
            </a>
          </div>
        </motion.div>
      </div>

      {/* Description Section with working Read More */}
      {coinData.description.en && (
        <motion.div
          className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg mr-3">
              <FaInfoCircle className="text-yellow-500 text-xl" />
            </div>
            About {coinData.name}
          </h2>
          <div className="relative">
            <div
              className={`prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 ${
                !expanded ? "line-clamp-3" : ""
              }`}
              dangerouslySetInnerHTML={{ __html: coinData.description.en }}
            />
            {coinData.description.en.length > 200 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-3 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center focus:outline-none"
              >
                {expanded ? (
                  <>
                    <FaChevronUp className="mr-1" /> Read less
                  </>
                ) : (
                  <>
                    <FaChevronDown className="mr-1" /> Read more
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default CurrencyStats;
