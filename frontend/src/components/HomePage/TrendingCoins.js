import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function TrendingCoins() {
  const [trendingCoins, setTrendingCoins] = useState([]);

  useEffect(() => {
    const fetchTrendingCoins = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/search/trending"
        );
        const data = await response.json();
        setTrendingCoins(data.coins.slice(0, 5));
      } catch (error) {
        console.error("Error fetching trending coins:", error);
      }
    };

    fetchTrendingCoins();
  }, []);

  const formatPrice = (price) => {
    if (!price) return "Loading...";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: price < 1 ? 6 : 2,
      maximumFractionDigits: price < 1 ? 8 : 2,
    }).format(price);
  };

  return (
    <div className="flex justify-center px-4">
      <div className="relative w-full max-w-lg">
        {/* Glow effect */}
        <div className="absolute -inset-2 bg-gradient-to-r from-teal-400/20 to-green-500/20 rounded-xl blur-md opacity-80 dark:opacity-60 animate-pulse-slow"></div>

        {/* Main card */}
        <div className="w-full bg-white/90 dark:bg-gray-800/90 p-5 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 relative backdrop-blur-sm">
          <h3 className="text-xl font-bold text-center mb-5 pb-3 border-b border-gray-200/50 dark:border-gray-700/50">
            <span className="mr-1">🔥</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-500">
              Trending Coins (24h)
            </span>
          </h3>

          <div className="space-y-3">
            {trendingCoins.map((coin, index) => (
              <Link
                key={coin.item.id}
                to={`/currencies/${coin.item.id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50/70 dark:bg-gray-700/70 hover:bg-teal-50/50 dark:hover:bg-teal-900/30 transition-all group backdrop-blur-sm"
              >
                <div className="flex items-center min-w-0 flex-1">
                  <div className="relative flex-shrink-0 mr-3">
                    <img
                      src={coin.item.thumb}
                      alt={coin.item.name}
                      className="w-9 h-9 rounded-full border-2 border-white dark:border-gray-600 shadow-sm group-hover:border-teal-300 transition-colors"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-gradient-to-br from-teal-400 to-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-xs">
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

                {/* Price section */}
                <div className="ml-4 text-right min-w-[120px]">
                  <span className="block font-semibold text-gray-800 dark:text-gray-100">
                    {formatPrice(coin.item.data?.price)}
                  </span>
                  <span
                    className={`block text-xs ${
                      coin.item.data?.price_change_percentage_24h?.usd >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {coin.item.data?.price_change_percentage_24h?.usd?.toFixed(
                      2
                    ) || "0.00"}
                    %
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrendingCoins;
