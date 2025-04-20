"use client";
import * as React from "react";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AltcoinChart from "./AltcoinChart";
import { excludedCoins } from "../../utils/excludedCoins";
import {
  FiSearch,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiHelpCircle,
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

// Add interface for market dominance data
interface MarketDominanceData {
  btc: number;
  eth: number;
  usdt: number;
  others: number;
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
  // Add new state for market dominance
  const [marketDominance, setMarketDominance] =
    useState<MarketDominanceData | null>(null);
  // Add new state for the enhanced altcoin season index
  const [enhancedIndex, setEnhancedIndex] = useState<number>(0);
  // Add state for showing the enhanced index explanation
  const [showEnhancedInfo, setShowEnhancedInfo] = useState<boolean>(false);

  useEffect(() => {
    const fetchAllCrpytosData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://sentimentxv2-project.vercel.app/api/all-cryptos`
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
        const altcoinPercentage =
          (outperformingCountTemp / filteredData.length) * 100;
        setPercentage(altcoinPercentage);
        setIsAltcoinSeason(altcoinPercentage >= 75);
      } catch (error) {
        console.error("Error fetching altcoin season data:", error);
        setIsAltcoinSeason(false);
      } finally {
        setLoading(false);
      }
    };

    // Add new function to fetch market dominance data
    const fetchMarketDominance = async () => {
      try {
        const response = await fetch(
          "https://sentimentxv2-project.vercel.app/api/market-dominance"
        );
        const data = await response.json();

        if (data && data.data && data.data.market_cap_percentage) {
          const marketData = data.data.market_cap_percentage;

          const btcDominance = marketData.btc || 0;
          const ethDominance = marketData.eth || 0;
          const usdtDominance = marketData.usdt || 0;
          const othersDominance =
            100 - btcDominance - ethDominance - usdtDominance;

          setMarketDominance({
            btc: btcDominance,
            eth: ethDominance,
            usdt: usdtDominance,
            others: othersDominance,
          });
        }
      } catch (error) {
        console.error("Error fetching market dominance data:", error);
      }
    };

    fetchAllCrpytosData();
    fetchMarketDominance();
  }, []);

  // Calculate enhanced altcoin season index when dependencies change
  useEffect(() => {
    if (marketDominance && percentage) {
      // CoinMarketCap-style formula for enhanced index:
      // - Higher percentage of outperforming altcoins increases the index
      // - Lower BTC dominance increases the index
      // - Lower USDT dominance increases the index (less stablecoin parking)
      // - Market momentum factor (based on Bitcoin's performance)

      // Weights for each factor
      const altcoinPerformanceWeight = 0.45;
      const btcDominanceWeight = 0.3;
      const usdtDominanceWeight = 0.15;
      const marketMomentumWeight = 0.1;

      // Normalize each factor to a 0-100 scale
      const altcoinPerformanceFactor = percentage; // Already 0-100
      const btcDominanceFactor = 100 - marketDominance.btc; // Invert so lower BTC dominance = higher score
      const usdtDominanceFactor = 100 - marketDominance.usdt * 5; // Invert and scale (USDT is usually much lower)

      // Market momentum factor - higher when Bitcoin is down or flat, lower when Bitcoin is strongly up
      // This is because altcoin seasons often happen when Bitcoin consolidates
      const bitcoinPerformance = bitcoinData?.price_change_percentage_24h || 0;
      const marketMomentumFactor =
        bitcoinPerformance > 5
          ? 30
          : // Bitcoin strongly up = less likely altcoin season
          bitcoinPerformance < -5
          ? 50
          : // Bitcoin strongly down = mixed for altcoins
          bitcoinPerformance > 0
          ? 70
          : // Bitcoin slightly up = good for altcoins
            90; // Bitcoin flat to slightly down = best for altcoins

      // Calculate weighted average
      const enhancedIndexValue =
        altcoinPerformanceFactor * altcoinPerformanceWeight +
        btcDominanceFactor * btcDominanceWeight +
        usdtDominanceFactor * usdtDominanceWeight +
        marketMomentumFactor * marketMomentumWeight;

      // Ensure the index is between 0-100
      setEnhancedIndex(Math.min(100, Math.max(0, enhancedIndexValue)));
    }
  }, [marketDominance, percentage, bitcoinData]);

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

  // Function to determine the enhanced index status
  const getEnhancedIndexStatus = () => {
    if (enhancedIndex >= 80) {
      return {
        title: "Strong Altcoin Season",
        description:
          "Multiple indicators suggest we're in a strong altcoin season. Altcoins are significantly outperforming Bitcoin, and Bitcoin dominance is decreasing.",
        color: "from-emerald-500 to-green-400",
        icon: <FaRocket className="text-white text-2xl" />,
        bgColor: "bg-emerald-500",
      };
    } else if (enhancedIndex >= 60) {
      return {
        title: "Moderate Altcoin Season",
        description:
          "Several indicators point to a moderate altcoin season. Many altcoins are outperforming Bitcoin, with decreasing Bitcoin dominance.",
        color: "from-teal-500 to-cyan-400",
        icon: <FaChartLine className="text-white text-2xl" />,
        bgColor: "bg-teal-500",
      };
    } else if (enhancedIndex >= 40) {
      return {
        title: "Neutral Market",
        description:
          "The market shows mixed signals. Some altcoins are performing well, but Bitcoin still maintains significant dominance.",
        color: "from-amber-500 to-yellow-400",
        icon: <FaExchangeAlt className="text-white text-2xl" />,
        bgColor: "bg-amber-500",
      };
    } else {
      return {
        title: "Bitcoin Season",
        description:
          "Bitcoin is outperforming most altcoins and maintains high market dominance. This is typically a good time to focus on Bitcoin.",
        color: "from-orange-500 to-red-400",
        icon: <FaBitcoin className="text-white text-2xl" />,
        bgColor: "bg-orange-500",
      };
    }
  };

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
  const enhancedStatus = getEnhancedIndexStatus();

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

  return (
    <div className="min-h-screen bg-gradient-to-br bg-gray-50 dark:bg-gray-900 p-4 lg:p-8">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-green-500"
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

        <div
          className={`grid ${
            selectedCoin ? "lg:grid-cols-7" : "lg:grid-cols-3 lg:px-16"
          } gap-8`}
        >
          {/* Main Card */}
          <motion.div
            className={`${
              selectedCoin ? "lg:col-span-3" : "lg:col-span-3"
            } bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center">
                  <div
                    className={`w-12 h-12 rounded-full ${enhancedStatus.bgColor} flex items-center justify-center mr-4 shadow-lg`}
                  >
                    {enhancedStatus.icon}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Altcoin Season Index
                      </h2>
                      <button
                        onClick={() => setShowEnhancedInfo(!showEnhancedInfo)}
                        className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <FiHelpCircle size={16} />
                      </button>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      {enhancedStatus.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Enhanced Index Info Panel */}
              <AnimatePresence>
                {showEnhancedInfo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-xl p-4 overflow-hidden"
                  >
                    <h3 className="font-bold text-purple-800 dark:text-purple-300 mb-2">
                      Altcoin Season Index Explained
                    </h3>
                    <p className="text-purple-700 dark:text-purple-200 mb-2">
                      This index combines multiple market factors to provide a
                      comprehensive view of the current market cycle:
                    </p>
                    <ul className="list-disc list-inside text-purple-700 dark:text-purple-200 space-y-1">
                      <li>
                        <strong>Altcoin Performance (50%):</strong> Percentage
                        of top altcoins outperforming Bitcoin
                      </li>
                      <li>
                        <strong>Bitcoin Dominance (35%):</strong> Lower Bitcoin
                        dominance indicates more capital flowing to altcoins
                      </li>
                      <li>
                        <strong>Stablecoin Dominance (15%):</strong> Lower
                        stablecoin dominance suggests more active market
                        participation
                      </li>
                    </ul>
                    <p className="text-purple-700 dark:text-purple-200 mt-2">
                      The index ranges from 0-100, with higher values indicating
                      stronger altcoin market conditions.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Progress Bar */}
            <div className="p-6">
              <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div
                    className={`p-6 rounded-xl border shadow-md ${
                      enhancedStatus.bgColor
                    } bg-opacity-10 dark:bg-opacity-20 border-${enhancedStatus.bgColor.replace(
                      "bg-",
                      ""
                    )}/30`}
                  >
                    <div className="flex items-center mb-3">
                      <div
                        className={`w-10 h-10 rounded-full ${enhancedStatus.bgColor} flex items-center justify-center mr-3`}
                      >
                        {enhancedStatus.icon}
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                        {enhancedStatus.title}
                      </h3>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-green-500">
                        {enhancedIndex.toFixed(1)}
                      </span>
                      <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                        / 100
                      </span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                        <FaChartLine className="text-white text-lg" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                        Outperforming Altcoins
                      </h3>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-blue-500 dark:text-blue-400">
                        {outperformingCount}
                      </span>
                      <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                        / {totalAltcoins} coins
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {percentage.toFixed(1)}% outperforming Bitcoin
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center mr-3">
                        <FaBitcoin className="text-white text-lg" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                        Bitcoin Performance
                      </h3>
                    </div>
                    <div className="flex items-baseline">
                      <span
                        className={`text-4xl font-bold ${
                          bitcoinData &&
                          bitcoinData.price_change_percentage_24h >= 0
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {bitcoinData
                          ? (bitcoinData.price_change_percentage_24h >= 0
                              ? "+"
                              : "") +
                            bitcoinData.price_change_percentage_24h.toFixed(2) +
                            "%"
                          : "0.00%"}
                      </span>
                      <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                        24h change
                      </span>
                    </div>
                    {bitcoinData && (
                      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Price: ${bitcoinData.current_price.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

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
            className={`${
              selectedCoin ? "lg:col-span-4" : "hidden lg:block lg:col-span-0"
            }`}
            initial={{ opacity: 0, x: 20 }}
            animate={{
              opacity: selectedCoin ? 1 : 0,
              x: selectedCoin ? 0 : 20,
            }}
            transition={{ duration: 0.5, delay: 0.2 }}
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
