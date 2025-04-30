"use client";
import React from "react";
import { motion } from "framer-motion";
import useMarketDominance from "../../hooks/homepage/useMarketDominance";
import type { MarketDominanceItem } from "../../types";

const MarketDominanceCard = (): JSX.Element => {
  const { dominance, loading, error } = useMarketDominance();

  // Define colors for each cryptocurrency
  const coinColors = {
    BTC: { bg: "#F7931A", text: "#F7931A", light: "rgba(247, 147, 26, 0.1)" },
    ETH: { bg: "#627EEA", text: "#627EEA", light: "rgba(98, 126, 234, 0.1)" },
    USDT: { bg: "#26A17B", text: "#26A17B", light: "rgba(38, 161, 123, 0.1)" },
    OTHERS: {
      bg: "#A6B7D4",
      text: "#A6B7D4",
      light: "rgba(166, 183, 212, 0.1)",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="relative w-full bg-white/95 dark:bg-dark-secondary/95 p-5 rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-xl font-bold flex items-center">
            <span className="mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-teal-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
              </svg>
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-500">
              Market Dominance
            </span>
          </h3>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"
                ></div>
              ))}
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
                className="mt-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white text-xs font-medium rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Pie chart visualization */}
              <div className="relative w-full h-40 flex items-center justify-center mb-2">
                <svg
                  viewBox="0 0 100 100"
                  className="w-40 h-40 transform -rotate-90"
                >
                  {dominance.reduce((acc, item, i) => {
                    const prevTotal =
                      i === 0
                        ? 0
                        : dominance
                            .slice(0, i)
                            .reduce((sum, d) => sum + d.value, 0);
                    const color =
                      coinColors[item.name as keyof typeof coinColors]?.bg ||
                      "#A6B7D4";

                    return [
                      ...acc,
                      <circle
                        key={item.name}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke={color}
                        strokeWidth="20"
                        strokeDasharray={`${item.value * 2.51} 251`}
                        strokeDashoffset={`${-prevTotal * 2.51}`}
                        className="transition-all duration-1000 ease-out"
                      />,
                    ];
                  }, [] as React.ReactNode[])}
                  <circle
                    cx="50"
                    cy="50"
                    r="30"
                    fill="white"
                    className="dark:fill-dark-secondary"
                  />
                </svg>
              </div>

              {/* Legend */}
              <div className="space-y-3 mt-4">
                {dominance.map((item: MarketDominanceItem, i: number) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div
                      className="flex justify-between items-center px-4 py-3 rounded-xl border border-gray-200/50 dark:border-gray-600/50 hover:shadow-md transition-all duration-200"
                      style={{
                        backgroundColor:
                          coinColors[item.name as keyof typeof coinColors]
                            ?.light || "rgba(166, 183, 212, 0.1)",
                        borderColor:
                          coinColors[item.name as keyof typeof coinColors]
                            ?.bg || "#A6B7D4",
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                          style={{
                            backgroundColor:
                              coinColors[item.name as keyof typeof coinColors]
                                ?.bg || "#A6B7D4",
                          }}
                        />
                        <span className="font-medium text-gray-800 dark:text-dark-text-primary text-sm">
                          {item.name}
                        </span>
                      </div>
                      <div>
                        <span
                          className="font-bold text-sm"
                          style={{
                            color:
                              coinColors[item.name as keyof typeof coinColors]
                                ?.text || "#A6B7D4",
                          }}
                        >
                          {item.value}%
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MarketDominanceCard;
