"use client";
import * as React from "react";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AltcoinChart from "./AltcoinChart";
import { excludedCoins } from "../../utils/excludedCoins";
import {
  FiInfo,
  FiSearch,
  FiX,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import {
  FaRocket,
  FaBitcoin,
  FaChartLine,
  FaExchangeAlt,
} from "react-icons/fa";
import type { Cryptocurrency } from "../../types";

interface CoinData {
  id: string;
  name: string;
  symbol: string;
  image: string;
  priceChange: number;
  marketCap: number;
  volume: number;
  rank: number;
}

const AltcoinSeason = (): JSX.Element => {
  const [isAltcoinSeason, setIsAltcoinSeason] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [outperformingCount, setOutperformingCount] = useState<number>(0);
  const [totalAltcoins, setTotalAltcoins] = useState<number>(0);
  const [percentage, setPercentage] = useState<number>(0);
  const [outperformingCoins, setOutperformingCoins] = useState<CoinData[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<
    "priceChange" | "marketCap" | "name" | "rank"
  >("priceChange");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [bitcoinData, setBitcoinData] = useState<Cryptocurrency | null>(null);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d">("24h");

  useEffect(() => {
    const fetchAllCrpytosData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://sentimentx-backend.vercel.app/api/all-cryptos`
        );
        const data: Cryptocurrency[] = await response.json();

        // Step 1: Select the first 100 coins
        const filteredData = data
          .slice(0, 100)
          .filter((coin) => !excludedCoins.has(coin.id));

        // Step 2: If we have less than 100, add others from the list
        let index = 100;
        while (filteredData.length < 100 && index < data.length) {
          const coin = data[index];
          if (
            !excludedCoins.has(coin.id) &&
            !filteredData.some((c) => c.id === coin.id)
          ) {
            filteredData.push(coin);
          }
          index++;
        }

        let outperformingCountTemp = 0;
        const outperformingCoinsTemp: CoinData[] = [];

        const bitcoin = data.find((coin) => coin.id === "bitcoin");
        if (!bitcoin) {
          console.error("Bitcoin data not found");
          return;
        }

        setBitcoinData(bitcoin);

        for (const coin of filteredData) {
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
              symbol: coin.symbol,
              marketCap: coin.market_cap,
              volume: coin.total_volume,
              rank: coin.market_cap_rank,
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

  const handleSort = (
    newSortBy: "priceChange" | "marketCap" | "name" | "rank"
  ) => {
    if (sortBy === newSortBy) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortDirection("desc");
    }
  };

  const filteredAndSortedCoins = useMemo(() => {
    let filtered = outperformingCoins;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (coin) =>
          coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      if (sortBy === "priceChange") {
        return sortDirection === "asc"
          ? a.priceChange - b.priceChange
          : b.priceChange - a.priceChange;
      } else if (sortBy === "marketCap") {
        return sortDirection === "asc"
          ? a.marketCap - b.marketCap
          : b.marketCap - a.marketCap;
      } else if (sortBy === "name") {
        return sortDirection === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        return sortDirection === "asc" ? a.rank - b.rank : b.rank - a.rank;
      }
    });
  }, [outperformingCoins, searchTerm, sortBy, sortDirection]);

  const formatMarketCap = (marketCap: number): string => {
    if (marketCap >= 1_000_000_000) {
      return `$${(marketCap / 1_000_000_000).toFixed(2)}B`;
    } else if (marketCap >= 1_000_000) {
      return `$${(marketCap / 1_000_000).toFixed(2)}M`;
    } else {
      return `$${(marketCap / 1_000).toFixed(2)}K`;
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center justify-center p-8 rounded-xl bg-white dark:bg-gray-800 shadow-xl max-w-md mx-auto">
          <div className="relative w-24 h-24 mb-6">
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.2, 1],
              }}
              transition={{
                rotate: {
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                },
                scale: {
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                },
              }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-400 to-blue-500 opacity-70 blur-md"
            />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: [0, 360] }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            >
              <FaRocket className="text-white text-4xl" />
            </motion.div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Analyzing Market Data
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
            We're calculating the Altcoin Season Index by comparing performance
            against Bitcoin...
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-teal-400 to-blue-500"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            />
          </div>
        </div>
      </div>
    );

  const getSeasonStatus = () => {
    if (percentage >= 80) {
      return {
        title: "Strong Altcoin Season",
        description:
          "Altcoins are significantly outperforming Bitcoin. This is typically a good time for altcoin investments.",
        color: "from-emerald-500 to-green-400",
        icon: <FaRocket className="text-white text-2xl" />,
        bgColor: "bg-emerald-500",
      };
    } else if (percentage >= 60) {
      return {
        title: "Moderate Altcoin Season",
        description:
          "Many altcoins are outperforming Bitcoin. The market is showing signs of altcoin strength.",
        color: "from-teal-500 to-cyan-400",
        icon: <FaChartLine className="text-white text-2xl" />,
        bgColor: "bg-teal-500",
      };
    } else if (percentage >= 40) {
      return {
        title: "Neutral Market",
        description:
          "The market is balanced between Bitcoin and altcoins. No clear trend is visible.",
        color: "from-amber-500 to-yellow-400",
        icon: <FaExchangeAlt className="text-white text-2xl" />,
        bgColor: "bg-amber-500",
      };
    } else {
      return {
        title: "Bitcoin Season",
        description:
          "Bitcoin is outperforming most altcoins. This is typically a good time to focus on Bitcoin.",
        color: "from-orange-500 to-red-400",
        icon: <FaBitcoin className="text-white text-2xl" />,
        bgColor: "bg-orange-500",
      };
    }
  };

  const seasonStatus = getSeasonStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-blue-600"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Altcoin Season Index
          </motion.h1>
          <motion.p
            className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Track whether we're in an Altcoin Season or Bitcoin Season based on
            market performance
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Card */}
          <motion.div
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Status Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center">
                  <div
                    className={`w-12 h-12 rounded-full ${seasonStatus.bgColor} flex items-center justify-center mr-4 shadow-lg`}
                  >
                    {seasonStatus.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                      {seasonStatus.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      {seasonStatus.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <FiInfo size={18} />
                    <span>What is this?</span>
                  </button>
                </div>
              </div>

              {/* Info Panel */}
              <AnimatePresence>
                {showInfo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 overflow-hidden"
                  >
                    <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2">
                      Understanding the Altcoin Season Index
                    </h3>
                    <p className="text-blue-700 dark:text-blue-200 mb-2">
                      The Altcoin Season Index measures whether the market is in
                      an "Altcoin Season" or a "Bitcoin Season".
                    </p>
                    <ul className="list-disc list-inside text-blue-700 dark:text-blue-200 space-y-1">
                      <li>
                        <strong>Altcoin Season (75%+):</strong> When 75% or more
                        of the top 50 altcoins perform better than Bitcoin over
                        the last 90 days
                      </li>
                      <li>
                        <strong>Bitcoin Season (below 75%):</strong> When more
                        than 25% of altcoins underperform Bitcoin over the last
                        90 days
                      </li>
                    </ul>
                    <p className="text-blue-700 dark:text-blue-200 mt-2">
                      This index helps investors understand market cycles and
                      potentially adjust their investment strategies
                      accordingly.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Progress Bar */}
            <div className="p-6">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-800 dark:text-white">
                      {percentage.toFixed(1)}%
                    </span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      of altcoins outperforming Bitcoin
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    {outperformingCount}/{totalAltcoins}
                  </span>
                </div>
                <div className="relative w-full h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r ${seasonStatus.color}`}
                  />

                  {/* Bitcoin marker */}
                  {bitcoinData && (
                    <div
                      className="absolute top-0 h-full flex items-center"
                      style={{ left: `${percentage}%` }}
                    >
                      <div className="relative">
                        <div className="absolute -left-3 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border-2 border-orange-500 flex items-center justify-center shadow-md">
                          <FaBitcoin className="text-orange-500 text-xs" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>Bitcoin Season</span>
                  <span>Neutral</span>
                  <span>Altcoin Season</span>
                </div>
              </div>

              {/* Bitcoin Performance */}
              {bitcoinData && (
                <div className="mb-8 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl border border-orange-100 dark:border-orange-800/30">
                  <div className="flex items-center gap-3">
                    <img
                      src={bitcoinData.image || "/placeholder.svg"}
                      alt="Bitcoin"
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-white">
                        Bitcoin Performance
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          24h Change:
                        </span>
                        <span
                          className={`font-medium ${
                            bitcoinData.price_change_percentage_24h >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {bitcoinData.price_change_percentage_24h >= 0
                            ? "+"
                            : ""}
                          {bitcoinData.price_change_percentage_24h.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="text-lg font-bold text-gray-800 dark:text-white">
                        ${bitcoinData.current_price.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Market Cap: $
                        {(bitcoinData.market_cap / 1_000_000_000).toFixed(2)}B
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Outperforming Coins */}
              {outperformingCoins.length > 0 && (
                <div className="mt-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      Top Performing Altcoins
                    </h3>

                    <div className="flex flex-col sm:flex-row gap-3">
                      {/* Search */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search coins..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <FiX size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Table Header */}
                  <div className="hidden md:grid md:grid-cols-5 gap-4 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-t-lg font-medium text-gray-600 dark:text-gray-300 text-sm">
                    <div
                      className="flex items-center cursor-pointer hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
                      onClick={() => handleSort("rank")}
                    >
                      Rank
                      {sortBy === "rank" &&
                        (sortDirection === "asc" ? (
                          <FiChevronUp className="ml-1" />
                        ) : (
                          <FiChevronDown className="ml-1" />
                        ))}
                    </div>
                    <div
                      className="flex items-center cursor-pointer hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
                      onClick={() => handleSort("name")}
                    >
                      Coin
                      {sortBy === "name" &&
                        (sortDirection === "asc" ? (
                          <FiChevronUp className="ml-1" />
                        ) : (
                          <FiChevronDown className="ml-1" />
                        ))}
                    </div>
                    <div
                      className="flex items-center cursor-pointer hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
                      onClick={() => handleSort("priceChange")}
                    >
                      24h Change
                      {sortBy === "priceChange" &&
                        (sortDirection === "asc" ? (
                          <FiChevronUp className="ml-1" />
                        ) : (
                          <FiChevronDown className="ml-1" />
                        ))}
                    </div>
                    <div
                      className="flex items-center cursor-pointer hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
                      onClick={() => handleSort("marketCap")}
                    >
                      Market Cap
                      {sortBy === "marketCap" &&
                        (sortDirection === "asc" ? (
                          <FiChevronUp className="ml-1" />
                        ) : (
                          <FiChevronDown className="ml-1" />
                        ))}
                    </div>
                    <div className="text-right">Action</div>
                  </div>

                  {/* Coins Grid */}
                  <div className="bg-white dark:bg-gray-800 rounded-b-lg overflow-hidden">
                    {filteredAndSortedCoins.length > 0 ? (
                      filteredAndSortedCoins.map((coin, index) => (
                        <motion.div
                          key={coin.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`grid grid-cols-2 md:grid-cols-5 gap-4 p-4 items-center ${
                            index % 2 === 0
                              ? "bg-white dark:bg-gray-800"
                              : "bg-gray-50 dark:bg-gray-700/30"
                          } ${
                            selectedCoin?.id === coin.id
                              ? "bg-teal-50 dark:bg-teal-900/30 border-l-4 border-teal-500"
                              : "border-l-4 border-transparent"
                          } hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-colors`}
                        >
                          <div className="text-gray-800 dark:text-gray-200 font-medium">
                            #{coin.rank}
                          </div>
                          <div className="flex items-center space-x-3 col-span-2 md:col-span-1">
                            <img
                              src={coin.image || "/placeholder.svg"}
                              alt={coin.name}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {coin.name}
                              </div>
                              <div className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                                {coin.symbol.toUpperCase()}
                              </div>
                            </div>
                          </div>
                          <div className="text-green-600 dark:text-green-400 font-medium">
                            +{coin.priceChange.toFixed(2)}%
                          </div>
                          <div className="hidden md:block text-gray-700 dark:text-gray-300">
                            {formatMarketCap(coin.marketCap)}
                          </div>
                          <div className="flex justify-end">
                            <button
                              onClick={() => setSelectedCoin(coin)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                                selectedCoin?.id === coin.id
                                  ? "bg-teal-500 text-white"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-teal-100 dark:hover:bg-teal-900/30"
                              } transition-colors`}
                            >
                              {selectedCoin?.id === coin.id
                                ? "Selected"
                                : "View Chart"}
                            </button>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FiSearch className="text-gray-400 text-xl" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                          No coins found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          No coins match your search criteria. Try adjusting
                          your filters.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Chart Card - Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-20">
              {selectedCoin ? (
                <AltcoinChart
                  coin={selectedCoin}
                  onClose={() => setSelectedCoin(null)}
                />
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200/50 dark:border-gray-700/50 h-full">
                  <div className="flex flex-col items-center justify-center h-full text-center py-10">
                    <div className="w-20 h-20 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mb-4">
                      <FaChartLine className="text-teal-500 text-2xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                      Select a Coin
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-xs">
                      Click on any coin from the list to view its detailed price
                      chart and performance metrics.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AltcoinSeason;
