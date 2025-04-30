"use client";
import React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { fetchCryptoData } from "../../utils/API/CoinGeckoAPI";
import type { Cryptocurrency } from "../../types";

const HeroSection = () => {
  const [btcData, setBtcData] = useState<Cryptocurrency | null>(null);
  const [ethData, setEthData] = useState<Cryptocurrency | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopCoins = async () => {
      try {
        setLoading(true);
        const data = await fetchCryptoData(1);
        const bitcoin = data.find((coin) => coin.id === "bitcoin") || null;
        const ethereum = data.find((coin) => coin.id === "ethereum") || null;

        setBtcData(bitcoin);
        setEthData(ethereum);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching top coins:", error);
        setLoading(false);
      }
    };

    fetchTopCoins();
  }, []);

  const formatPrice = (price: number | undefined): string => {
    if (!price && price !== 0) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatPercentage = (percentage: number | undefined): string => {
    if (!percentage && percentage !== 0) return "—";
    return `${percentage >= 0 ? "+" : ""}${percentage.toFixed(2)}%`;
  };

  const formatCurrency = (value: number | undefined): string => {
    if (!value && value !== 0) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      compactDisplay: "short",
    }).format(value);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-teal-500/10 to-emerald-500/10 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-2xl">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-400/10 dark:bg-teal-400/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-24 w-80 h-80 bg-emerald-400/10 dark:bg-emerald-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative z-10 rounded-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Text content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-800 dark:text-white leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-500">
                Real-time
              </span>{" "}
              Crypto Market Insights
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
              Track cryptocurrency prices, market trends, and sentiment analysis
              all in one place. Make informed decisions with our comprehensive
              data and analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/sentiment-trend"
                className="px-8 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center"
              >
                Sentiment Analysis
              </Link>
              <Link
                to="/whale-transactions"
                className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-medium rounded-xl shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 text-center"
              >
                Whale Transactions
              </Link>
            </div>
          </motion.div>

          {/* Right column - Stats cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Bitcoin Card */}
              <div className="bg-white/80 dark:bg-dark-tertiary/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 transform">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mr-4">
                    <img
                      src="https://assets.coingecko.com/coins/images/1/small/bitcoin.png"
                      alt="Bitcoin"
                      className="w-8 h-8"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg?height=32&width=32";
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                      Bitcoin
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      BTC
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                      {formatPrice(btcData?.current_price)}
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        (btcData?.price_change_percentage_24h || 0) >= 0
                          ? "text-emerald-500"
                          : "text-rose-500"
                      }`}
                    >
                      {formatPercentage(btcData?.price_change_percentage_24h)}{" "}
                      (24h)
                    </div>
                  </>
                )}
              </div>

              {/* Ethereum Card */}
              <div className="bg-white/80 dark:bg-dark-tertiary/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 transform">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mr-4">
                    <img
                      src="https://assets.coingecko.com/coins/images/279/small/ethereum.png"
                      alt="Ethereum"
                      className="w-8 h-8"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg?height=32&width=32";
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                      Ethereum
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ETH
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                      {formatPrice(ethData?.current_price)}
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        (ethData?.price_change_percentage_24h || 0) >= 0
                          ? "text-emerald-500"
                          : "text-rose-500"
                      }`}
                    >
                      {formatPercentage(ethData?.price_change_percentage_24h)}{" "}
                      (24h)
                    </div>
                  </>
                )}
              </div>

              {/* Market Cap Card */}
              <div className="bg-white/80 dark:bg-dark-tertiary/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 transform">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-teal-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                      Bitcoin Market Cap
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      24h Change
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                      {loading ? "—" : formatCurrency(btcData?.market_cap || 0)}
                    </div>
                    <div className="text-sm font-medium text-emerald-500">
                      {loading
                        ? "—"
                        : `${
                            (btcData?.market_cap_change_percentage_24h ?? 0) >=
                            0
                              ? "+"
                              : ""
                          }${
                            btcData?.market_cap_change_percentage_24h?.toFixed(
                              2
                            ) || 0
                          }% (24h)`}
                    </div>
                  </>
                )}
              </div>

              {/* Volume Card */}
              <div className="bg-white/80 dark:bg-dark-tertiary/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 transform">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-purple-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                      Bitcoin Volume
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      BTC Volume
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                      {loading
                        ? "—"
                        : formatCurrency(btcData?.total_volume || 0)}
                    </div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      24h trading volume
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
