"use client";
import React from "react";
import { Link } from "react-router-dom";
import useTrendingCoins from "../../hooks/homepage/useTrendingCoins";
import { ClipLoader } from "react-spinners";
import { motion } from "framer-motion";
import type { TrendingCoin } from "../../types";

function TrendingCoins(): JSX.Element {
  const { trendingCoins, loading } = useTrendingCoins();

  const formatPrice = (price: number | undefined): string => {
    if (!price) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: price < 1 ? 6 : 2,
      maximumFractionDigits: price < 1 ? 8 : 2,
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="h-full"
    >
      <div className="relative w-full h-full bg-white/95 dark:bg-dark-secondary/95 p-5 rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 backdrop-blur-sm flex flex-col">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-xl font-bold flex items-center">
            <span className="mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-amber-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-500">
              Trending Coins
            </span>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-1">
              (24h)
            </span>
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <div className="space-y-7">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <ClipLoader color="#10b981" size={40} />
              </div>
            ) : (
              trendingCoins.map((coin: TrendingCoin, index: number) => (
                <motion.div
                  key={coin.item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ backgroundColor: "rgba(16, 185, 129, 0.05)" }}
                  className=""
                >
                  <Link
                    to={`/currencies/${coin.item.id}`}
                    className="flex items-center justify-between p-2 rounded-xl bg-gray-50/70 dark:bg-dark-tertiary/70 border border-gray-200/50 dark:border-gray-600/50 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-colors group"
                  >
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="relative flex-shrink-0 mr-2">
                        <img
                          src={coin.item.thumb || "/placeholder.svg"}
                          alt={coin.item.name}
                          className="w-9 h-9 rounded-full border-2 border-white dark:border-gray-700 shadow-sm"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex flex-col">
                        <span className="font-medium text-gray-800 dark:text-dark-text-primary group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate text-base">
                          {coin.item.name}
                        </span>
                        <span className="text-sm text-teal-500 dark:text-teal-400 font-medium">
                          {coin.item.symbol.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-2 text-right min-w-[90px]">
                      <span className="block font-semibold text-gray-800 dark:text-gray-100 text-base">
                        {formatPrice(coin.item.data?.price)}
                      </span>
                      <span
                        className={`block text-sm font-medium ${
                          (coin.item.data?.price_change_percentage_24h?.usd ??
                            0) >= 0
                            ? "text-emerald-500"
                            : "text-rose-500"
                        }`}
                      >
                        {(coin.item.data?.price_change_percentage_24h?.usd ??
                          0) >= 0
                          ? "+"
                          : ""}
                        {(
                          coin.item.data?.price_change_percentage_24h?.usd ?? 0
                        ).toFixed(2)}
                        %
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default TrendingCoins;
