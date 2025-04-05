import { Link } from "react-router-dom";
import useTrendingCoins from "../hooks/useTrendingCoins";
import { ClipLoader } from "react-spinners";
import { motion } from "framer-motion";

function TrendingCoins() {
  const { trendingCoins, loading } = useTrendingCoins();

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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-center px-4">
        <div className="relative w-full max-w-lg">
          {/* Glow effect consistent cu TopMovers */}
          <div className="absolute -inset-3 bg-gradient-to-r from-teal-400/30 to-green-500/30 rounded-2xl blur-xl opacity-40 dark:opacity-30 animate-pulse-slow"></div>

          {/* Main card - dimensiuni egale cu TopMovers */}
          <div className="relative w-full bg-white/95 dark:bg-gray-800/95 p-6 rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 backdrop-blur-sm">
            {/* Header consistent */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-2xl font-bold tracking-tight">
                <span className="mr-2">🔥</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-500">
                  Trending Coins
                </span>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-1">
                  (24h)
                </span>
              </h3>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <ClipLoader color="#10b981" size={45} />
                </div>
              ) : (
                trendingCoins.map((coin, index) => (
                  <motion.div
                    key={coin.item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={`/currencies/${coin.item.id}`}
                      className={`flex items-center justify-between p-4 rounded-xl bg-gray-50/70 dark:bg-gray-700/70 ${
                        coin.item.data?.price_change_percentage_24h?.usd >= 0
                          ? "hover:bg-teal-50/50 dark:hover:bg-teal-900/30"
                          : "hover:bg-red-50/50 dark:hover:bg-red-900/30"
                      } transition-all group backdrop-blur-sm`}
                    >
                      <div className="flex items-center min-w-0 flex-1">
                        <div className="relative flex-shrink-0 mr-4">
                          <div className="relative">
                            <img
                              src={coin.item.thumb}
                              alt={coin.item.name}
                              className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-600 shadow-sm group-hover:border-teal-300 transition-colors"
                            />
                            <div
                              className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${
                                coin.item.data?.price_change_percentage_24h
                                  ?.usd >= 0
                                  ? "bg-gradient-to-br from-teal-400 to-green-500"
                                  : "bg-red-500"
                              } flex items-center justify-center text-white text-xs font-bold shadow-md`}
                            >
                              {index + 1}
                            </div>
                          </div>
                        </div>
                        <div className="min-w-0">
                          <span className="block font-semibold text-gray-800 dark:text-gray-100 truncate">
                            {coin.item.name}
                          </span>
                          <span className="block text-xs text-teal-500 dark:text-teal-400 font-medium">
                            {coin.item.symbol.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 text-right min-w-[120px]">
                        <span className="block font-bold text-gray-800 dark:text-gray-100">
                          {formatPrice(coin.item.data?.price)}
                        </span>
                        <span
                          className={`block text-sm font-semibold ${
                            coin.item.data?.price_change_percentage_24h?.usd >=
                            0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {coin.item.data?.price_change_percentage_24h?.usd >= 0
                            ? "+"
                            : ""}
                          {coin.item.data?.price_change_percentage_24h?.usd?.toFixed(
                            2
                          ) || "0.00"}
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
