import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AltcoinChart from "./AltcoinChart";
import { excludedCoins } from "../../utils/excludedCoins";

const AltcoinSeason = () => {
  const [isAltcoinSeason, setIsAltcoinSeason] = useState(null);
  const [loading, setLoading] = useState(true);
  const [outperformingCount, setOutperformingCount] = useState(0);
  const [totalAltcoins, setTotalAltcoins] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [outperformingCoins, setOutperformingCoins] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);

  useEffect(() => {
    const fetchAllCrpytosData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://sentimentx-backend.vercel.app/api/all-cryptos`
        );
        const data = await response.json();

        // Pas 1: Selectăm primele 100 de monede
        let filteredData = data
          .slice(0, 100)
          .filter((coin) => !excludedCoins.has(coin.id));

        // Pas 2: Dacă avem mai puțin de 100, adăugăm altele din listă
        let index = 100;
        while (filteredData.length < 100 && index < data.length) {
          let coin = data[index];
          if (
            !excludedCoins.has(coin.id) &&
            !filteredData.some((c) => c.id === coin.id)
          ) {
            filteredData.push(coin);
          }
          index++;
        }

        let outperformingCountTemp = 0;
        let outperformingCoinsTemp = [];

        const bitcoin = data.find((coin) => coin.id === "bitcoin");
        if (!bitcoin) {
          console.error("Bitcoin data not found");
          return;
        }

        for (let coin of filteredData) {
          if (
            coin.price_change_percentage_24h >
            bitcoin.price_change_percentage_24h
          ) {
            outperformingCountTemp++;
            outperformingCoinsTemp.push({
              name: coin.name,
              priceChange: coin.price_change_percentage_24h,
              image: coin.image,
              id: coin.id,
            });
          }
        }

        setOutperformingCount(outperformingCountTemp);
        setTotalAltcoins(filteredData.length);
        setOutperformingCoins(outperformingCoinsTemp);
        setPercentage((outperformingCountTemp / filteredData.length) * 100);
        setIsAltcoinSeason(
          (outperformingCountTemp / filteredData.length) * 100 >= 75
        );
      } catch (error) {
        console.error("Error fetching altcoin season data:", error);
        setIsAltcoinSeason(false);
      } finally {
        setLoading(false);
      }
    };
    fetchAllCrpytosData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const barColor =
    percentage >= 80
      ? "from-emerald-500 to-green-400"
      : percentage >= 60
      ? "from-teal-500 to-cyan-400"
      : percentage >= 40
      ? "from-amber-500 to-yellow-400"
      : percentage >= 20
      ? "from-orange-500 to-amber-400"
      : "from-rose-500 to-pink-400";

  outperformingCoins.sort((a, b) => b.priceChange - a.priceChange);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 items-start">
      {/* Main Card */}
      <div className="flex-1 w-full p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-lg border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white dark:bg-gray-700 shadow-md mb-4">
            {isAltcoinSeason ? (
              <span className="text-3xl">🚀</span>
            ) : (
              <span className="text-3xl">📉</span>
            )}
          </div>
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white">
            {isAltcoinSeason ? "Altcoin Season is ON!" : "Not Altcoin Season"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-center">
            {isAltcoinSeason
              ? "Most altcoins are outperforming Bitcoin"
              : "Bitcoin is dominating the market"}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {percentage.toFixed(1)}% of altcoins outperforming
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {outperformingCount}/{totalAltcoins}
            </span>
          </div>
          <div className="relative w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-1000 ease-out`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">0%</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              100%
            </span>
          </div>
        </div>

        {/* Outperforming Coins */}
        {outperformingCoins.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Top Performing Altcoins
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {outperformingCoins.map((coin, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCoin(coin)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedCoin?.id === coin.id
                      ? "bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800"
                      : "bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {coin.name}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          #{index + 1} performer
                        </span>
                      </div>
                    </div>
                    <span
                      className={`font-medium ${
                        coin.priceChange > 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-500 dark:text-red-400"
                      }`}
                    >
                      {coin.priceChange > 0 ? "+" : ""}
                      {coin.priceChange.toFixed(2)}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chart Card - Right Side */}
      <AnimatePresence>
        {selectedCoin && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
            className="sticky top-20 w-full lg:w-1/2 xl:w-2/5"
          >
            <AltcoinChart
              coin={selectedCoin}
              onClose={() => setSelectedCoin(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AltcoinSeason;
