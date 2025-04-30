"use client";
import React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fetchCryptoData } from "../../utils/API/CoinGeckoAPI";
import type { Cryptocurrency } from "../../types";

const MarketOverview = () => {
  const [marketData, setMarketData] = useState<{
    totalMarketCap: number;
    totalVolume: number;
    btcDominance: number;
    activeCryptos: number;
  }>({
    totalMarketCap: 0,
    totalVolume: 0,
    btcDominance: 0,
    activeCryptos: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Rezolvare pentru datele de market cap și volume
    // Asigurăm-ne că folosim date reale din API

    // Modificăm funcția fetchMarketData pentru a obține date mai precise
    const fetchMarketData = async () => {
      try {
        const data = await fetchCryptoData(1);

        // Calculate total market cap and volume
        let totalMarketCap = 0;
        let totalVolume = 0;
        let btcMarketCap = 0;
        const activeCryptos = data.length;

        data.forEach((coin: Cryptocurrency) => {
          if (coin.market_cap) totalMarketCap += coin.market_cap;
          if (coin.total_volume) totalVolume += coin.total_volume;

          if (coin.id === "bitcoin") {
            btcMarketCap = coin.market_cap || 0;
          }
        });

        // Calculate BTC dominance
        const btcDominance =
          totalMarketCap > 0
            ? Math.min(100, (btcMarketCap / totalMarketCap) * 100)
            : 0;

        setMarketData({
          totalMarketCap,
          totalVolume,
          btcDominance,
          activeCryptos,
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching market data:", error);
        setLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  // Îmbunătățim formatarea valorilor pentru a fi mai precise
  const formatCurrency = (value: number): string => {
    if (value >= 1_000_000_000_000) {
      return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
    }
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(2)}B`;
    }
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  const metrics = [
    {
      title: "Market Cap",
      value: formatCurrency(marketData.totalMarketCap),
      icon: (
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
      ),
      bgColor: "bg-teal-100 dark:bg-teal-900/30",
    },
    {
      title: "24h Volume",
      value: formatCurrency(marketData.totalVolume),
      icon: (
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
      ),
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      title: "BTC Dominance",
      value: `${Math.min(100, marketData.btcDominance).toFixed(2)}%`,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-amber-500"
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
      ),
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      title: "Active Cryptos",
      value: marketData.activeCryptos.toString(),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-emerald-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-xl transition-all duration-300"
          >
            {loading ? (
              <div className="animate-pulse">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 mr-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
              </div>
            ) : (
              <>
                <div className="flex items-center mb-4">
                  <div
                    className={`w-10 h-10 ${metric.bgColor} rounded-full flex items-center justify-center mr-4`}
                  >
                    {metric.icon}
                  </div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {metric.title}
                  </h3>
                </div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  {metric.value}
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MarketOverview;
