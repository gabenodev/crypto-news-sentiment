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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-center px-4">
        <div className="relative w-full max-w-lg">
          <div className="absolute -inset-3 bg-gradient-to-r from-teal-400/30 to-green-500/30 rounded-2xl blur-xl opacity-40 dark:opacity-30 animate-pulse-slow"></div>

          <div className="relative w-full bg-white/95 dark:bg-gray-800/95 p-5 rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-xl font-bold">
                <span className="mr-2">📊</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-500">
                  {showTopMovers ? "Top Gainers" : "Top Losers"}
                </span>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-1">
                  (24h)
                </span>
              </h3>

              {/* Button container cu height fix și overflow-hidden */}
              <div className="h-6 overflow-hidden">
                <button
                  onClick={toggleView}
                  className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  aria-label={showTopMovers ? "Show losers" : "Show gainers"}
                >
                  {showTopMovers ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <ClipLoader color="#10b981" size={40} />
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
                      className={`flex items-center justify-between p-3 h-[62px] rounded-lg border ${
                        coin.price_change_percentage_24h >= 0
                          ? "bg-teal-50/70 hover:bg-teal-100/50 dark:bg-teal-900/20 dark:hover:bg-teal-900/30 border-teal-200/50 dark:border-teal-700/50"
                          : "bg-red-50/70 hover:bg-red-100/50 dark:bg-red-900/20 dark:hover:bg-red-900/30 border-red-200/50 dark:border-red-700/50"
                      } transition-colors group`}
                    >
                      <div className="flex items-center min-w-0 flex-1">
                        <div className="relative flex-shrink-0 mr-3">
                          <img
                            src={coin.image}
                            alt={coin.name}
                            className="w-9 h-9 rounded-full border-2 border-white dark:border-gray-600 shadow-sm"
                          />
                          <span
                            className={`absolute -bottom-1 -right-1 ${
                              coin.price_change_percentage_24h >= 0
                                ? "bg-green-500"
                                : "bg-red-500"
                            } text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-xs`}
                          >
                            {index + 1}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <span className="block font-medium text-gray-800 dark:text-gray-100 truncate">
                            {coin.name}
                          </span>
                          <span className="block text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {coin.symbol.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3 text-right min-w-[110px]">
                        <span className="block font-semibold text-gray-800 dark:text-gray-100">
                          {formatPrice(coin.current_price)}
                        </span>
                        <span
                          className={`block text-xs ${
                            coin.price_change_percentage_24h >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
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
