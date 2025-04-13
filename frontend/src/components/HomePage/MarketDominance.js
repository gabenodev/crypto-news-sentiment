import React from "react";
import { motion } from "framer-motion";
import useMarketDominance from "../hooks/homepage/useMarketDominance"; // Importă hook-ul tău

const MarketDominanceCard = () => {
  const { dominance, loading, error } = useMarketDominance(); // Folosește hook-ul

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-center px-4">
        <div className="relative w-full max-w-sm h-full">
          <div className="relative w-full bg-white/95 dark:bg-gray-800/95 p-4 rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 backdrop-blur-sm h-full">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-lg font-semibold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-500">
                  Market Dominance
                </span>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1">
                  (Top Cryptos)
                </span>
              </h3>
            </div>

            <div className="space-y-2.5">
              {loading ? (
                <div className="flex justify-center items-center py-6">
                  <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : error ? (
                <div className="h-56 flex flex-col items-center justify-center space-y-4 text-center p-4">
                  <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-bold text-gray-800 dark:text-gray-200">
                    Failed to load data
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    Couldn't connect to API. Please try again later.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white text-xs font-medium rounded-lg transition-all duration-300 shadow-sm hover:shadow-md" // Gradient și efecte îmbunătățite
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {dominance.map((item, i) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                      whileHover={{ scale: 1.02 }} // Efect de hover subtil
                    >
                      <div className="flex justify-between items-center px-3 py-2 rounded-lg bg-gray-50/70 dark:bg-gray-700/70 border border-gray-200/50 dark:border-gray-600/50 hover:bg-gray-100/70 dark:hover:bg-gray-600/70 transition-colors duration-200">
                        {" "}
                        {/* Efect de hover */}
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm" // Umbra subtilă
                            style={{
                              backgroundColor:
                                i === 0
                                  ? "#F7931A"
                                  : i === 1
                                  ? "#627EEA"
                                  : i === 2
                                  ? "#26A17B"
                                  : "#A6B7D4",
                            }}
                          />
                          <span className="font-medium text-gray-800 dark:text-gray-100 text-sm">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className="font-bold text-gray-800 dark:text-gray-100 text-sm"
                            style={{
                              color:
                                i === 0
                                  ? "#F7931A"
                                  : i === 1
                                  ? "#627EEA"
                                  : i === 2
                                  ? "#26A17B"
                                  : "#A6B7D4",
                            }} // Culori consistente cu punctele
                          >
                            {item.value}%
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MarketDominanceCard;
