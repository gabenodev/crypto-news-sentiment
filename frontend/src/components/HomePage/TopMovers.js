import React, { useState } from "react";
import { Link } from "react-router-dom"; // Importăm Link pentru a naviga între pagini
import { ClipLoader } from "react-spinners";
import { motion } from "framer-motion";
import useTopMovers from "../hooks/useTopMovers";

function TopMovers() {
  const { topMovers, topLosers, loading } = useTopMovers();
  const [showTopMovers, setShowTopMovers] = useState(true); // State pentru switch între top movers și top losers

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
    setShowTopMovers(!showTopMovers); // Inversează starea pentru a comuta între top movers și top losers
  };

  const getPriceChangeColor = (percentage) => {
    if (percentage >= 0) {
      return "text-green-500"; // Top Movers
    } else {
      return "text-red-500"; // Top Losers
    }
  };

  const getCircleClass = (percentage) => {
    if (percentage >= 0) {
      return "bg-green-500"; // Top Movers
    } else {
      return "bg-red-500"; // Top Losers
    }
  };

  const getHoverClass = (percentage) => {
    if (percentage >= 0) {
      return "hover:bg-teal-50/50 dark:hover:bg-teal-900/30"; // Top Movers (verde)
    } else {
      return "hover:bg-red-50/50 dark:hover:bg-red-900/30"; // Top Losers (roșu)
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="flex justify-center px-4">
        <div className="relative w-full max-w-lg">
          {/* Glow effect */}
          <div className="absolute -inset-2 bg-gradient-to-r from-teal-400/20 to-green-500/20 rounded-xl blur-md opacity-80 dark:opacity-60 animate-pulse-slow"></div>

          {/* Main card */}
          <div className="w-full bg-white/90 dark:bg-gray-800/90 p-5 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 relative backdrop-blur-sm">
            <h3 className="text-xl font-bold text-center mb-5 pb-3 border-b border-gray-200/50 dark:border-gray-700/50">
              <span className="mr-1">📈</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-500">
                {showTopMovers ? "Top Movers" : "Top Losers"} (24h)
              </span>
            </h3>

            {/* Switch button in the top-right corner */}
            <button
              onClick={toggleView}
              className="absolute top-4 right-4 px-3 py-1 bg-teal-500 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-teal-400 transition-all"
            >
              Switch to {showTopMovers ? "Top Losers" : "Top Movers"}
            </button>

            <div className="space-y-3">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <ClipLoader color="#23d996" size={40} />
                </div>
              ) : (
                (showTopMovers ? topMovers : topLosers).map((coin, index) => (
                  <Link
                    key={coin.id} // Folosim Link pentru a redirecționa către pagina criptomonedei
                    to={`/currencies/${coin.id}`}
                    className={`flex items-center justify-between p-3 rounded-lg bg-gray-50/70 dark:bg-gray-700/70 ${getHoverClass(
                      coin.price_change_percentage_24h
                    )} transition-all group backdrop-blur-sm`}
                  >
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="relative flex-shrink-0 mr-3">
                        <img
                          src={coin.image}
                          alt={coin.name}
                          className="w-9 h-9 rounded-full border-2 border-white dark:border-gray-600 shadow-sm group-hover:border-teal-300 transition-colors"
                        />
                        <span
                          className={`absolute -bottom-1 -right-1 ${getCircleClass(
                            coin.price_change_percentage_24h
                          )} text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-xs`}
                        >
                          {index + 1}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <span className="block font-medium text-gray-800 dark:text-gray-100 truncate">
                          {coin.name}
                        </span>
                        <span className="block text-xs text-teal-500 dark:text-teal-400 font-medium">
                          {coin.symbol.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 text-right min-w-[120px]">
                      <span className="block font-semibold text-gray-800 dark:text-gray-100">
                        {formatPrice(coin.current_price)}
                      </span>
                      <span
                        className={`block text-xs ${getPriceChangeColor(
                          coin.price_change_percentage_24h
                        )}`}
                      >
                        {coin.price_change_percentage_24h.toFixed(2)}%
                      </span>
                    </div>
                  </Link>
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
