"use client";

import * as React from "react";
import { Link } from "react-router-dom";
import useTrendingCoins from "@hooks/homepage/useTrendingCoins";
import { ClipLoader } from "react-spinners";
import { motion } from "framer-motion";
import type { TrendingCoin } from "../../types";

function TrendingCoins(): JSX.Element {
  const { trendingCoins, loading } = useTrendingCoins();

  const formatPrice = (price: number | undefined): string => {
    if (!price) return "Loading...";
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
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-center px-4">
        <div className="relative w-full max-w-lg h-full">
          <div className="relative w-full bg-white/95 dark:bg-gray-800/95 p-5 rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 backdrop-blur-sm h-full">
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-xl font-bold">
                <span className="mr-2">🔥</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-500">
                  Trending Coins
                </span>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-1">
                  (24h)
                </span>
              </h3>
            </div>

            <div className="space-y-8">
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
                  >
                    <Link
                      to={`/currencies/${coin.item.id}`}
                      className="flex items-center justify-between p-3 h-[62px] rounded-lg bg-gray-50/70 dark:bg-gray-700/70 border border-gray-200/50 dark:border-gray-600/50 hover:bg-teal-50/50 dark:hover:bg-teal-900/30 transition-colors group"
                    >
                      <div className="flex items-center min-w-0 flex-1">
                        <div className="relative flex-shrink-0 mr-3">
                          <img
                            src={coin.item.thumb || "/placeholder.svg"}
                            alt={coin.item.name}
                            className="w-9 h-9 rounded-full border-2 border-white dark:border-gray-600 shadow-sm"
                          />
                          <span
                            className={`absolute -bottom-1 -right-1 ${
                              (coin.item.data?.price_change_percentage_24h
                                ?.usd ?? 0) >= 0
                                ? "bg-gradient-to-br from-teal-400 to-green-500"
                                : "bg-red-500"
                            } text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-xs`}
                          >
                            {index + 1}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <span className="block font-medium text-gray-800 dark:text-gray-100 truncate">
                            {coin.item.name}
                          </span>
                          <span className="block text-xs text-teal-500 dark:text-teal-400 font-medium">
                            {coin.item.symbol.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3 text-right min-w-[110px]">
                        <span className="block font-semibold text-gray-800 dark:text-gray-100">
                          {formatPrice(coin.item.data?.price)}
                        </span>
                        <span
                          className={`block text-xs ${
                            (coin.item.data?.price_change_percentage_24h?.usd ??
                              0) >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {(coin.item.data?.price_change_percentage_24h?.usd ??
                            0) >= 0
                            ? "+"
                            : ""}
                          {(
                            coin.item.data?.price_change_percentage_24h?.usd ??
                            0
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
      </div>
    </motion.div>
  );
}

export default TrendingCoins;
