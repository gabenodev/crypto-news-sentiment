import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { motion } from "framer-motion";
import useTopMovers from "../hooks/useTopMovers";

function TopMovers() {
  const { topMovers, topLosers, loading } = useTopMovers();
  const [showTopMovers, setShowTopMovers] = useState(true);

  const formatPrice = (price) => {
    if (!price) return "Loading...";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: price < 1 ? 6 : 2,
      maximumFractionDigits: price < 1 ? 8 : 2,
    }).format(price);
  };

  const toggleView = () => {
    setShowTopMovers(!showTopMovers);
  };

  const getPriceChangeColor = (percentage) => {
    return percentage >= 0 ? "text-green-500" : "text-red-500";
  };

  const getBgColor = (percentage) => {
    return percentage >= 0
      ? "from-teal-50/80 to-green-50/80 dark:from-teal-900/30 dark:to-green-900/30"
      : "from-red-50/80 to-orange-50/80 dark:from-red-900/30 dark:to-orange-900/30";
  };

  const getBorderColor = (percentage) => {
    return percentage >= 0
      ? "border-teal-200/70 dark:border-teal-700/50"
      : "border-red-200/70 dark:border-red-700/50";
  };

  const getHoverClass = (percentage) => {
    return percentage >= 0
      ? "hover:shadow-teal-100/50 dark:hover:shadow-teal-900/30"
      : "hover:shadow-red-100/50 dark:hover:shadow-red-900/30";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-center px-4">
        <div className="relative w-full max-w-lg">
          {/* Glow effect */}
          <div className="absolute -inset-3 bg-gradient-to-r from-teal-400/30 to-green-500/30 rounded-2xl blur-xl opacity-40 dark:opacity-30 animate-pulse-slow"></div>

          {/* Main card */}
          <div className="relative w-full bg-white/95 dark:bg-gray-800/95 p-6 rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 backdrop-blur-sm">
            {/* Header with gradient text and animated underline */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200/50 dark:border-gray-700/50 relative">
              <h3 className="text-2xl font-bold tracking-tight">
                <span className="mr-2">📊</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-500">
                  {showTopMovers ? "Top Gainers" : "Top Losers"}
                </span>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-1">
                  (24h)
                </span>
              </h3>

              <button
                onClick={toggleView}
                className="px-3 py-1.5 bg-gradient-to-r from-teal-500 to-green-500 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95"
              >
                {showTopMovers ? "Show Losers" : "Show Gainers"}
              </button>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <ClipLoader color="#10b981" size={45} />
                </div>
              ) : (
                (showTopMovers ? topMovers : topLosers).map((coin, index) => (
                  <motion.div
                    key={coin.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={`/currencies/${coin.id}`}
                      className={`flex items-center justify-between p-4 rounded-xl bg-gradient-to-r ${getBgColor(
                        coin.price_change_percentage_24h
                      )} border ${getBorderColor(
                        coin.price_change_percentage_24h
                      )} shadow-sm ${getHoverClass(
                        coin.price_change_percentage_24h
                      )} transition-all duration-300 group hover:shadow-md`}
                    >
                      <div className="flex items-center min-w-0 flex-1">
                        <div className="relative flex-shrink-0 mr-4">
                          <div className="relative">
                            <img
                              src={coin.image}
                              alt={coin.name}
                              className="w-10 h-10 rounded-full border-2 border-white/80 dark:border-gray-600/80 shadow-sm group-hover:scale-105 transition-transform"
                            />
                            <div
                              className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${
                                coin.price_change_percentage_24h >= 0
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              } flex items-center justify-center text-white text-xs font-bold shadow-md`}
                            >
                              {index + 1}
                            </div>
                          </div>
                        </div>
                        <div className="min-w-0">
                          <span className="block font-semibold text-gray-800 dark:text-gray-100 truncate">
                            {coin.name}
                          </span>
                          <span className="block text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {coin.symbol.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 text-right min-w-[120px]">
                        <span className="block font-bold text-gray-800 dark:text-gray-100">
                          {formatPrice(coin.current_price)}
                        </span>
                        <span
                          className={`block text-sm font-semibold ${getPriceChangeColor(
                            coin.price_change_percentage_24h
                          )}`}
                        >
                          {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                          {coin.price_change_percentage_24h.toFixed(2)}%
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default TopMovers;
