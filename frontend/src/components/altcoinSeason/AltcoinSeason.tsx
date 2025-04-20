"use client";
import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import AltcoinChart from "./AltcoinChart";
import { CoinData, MarketDominanceData, SeasonStatus } from "./types";
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

const AltcoinSeason: React.FC = () => {
  // State management
  const [loading, setLoading] = useState<boolean>(true);
  const [outperformingCount, setOutperformingCount] = useState<number>(0);
  const [totalAltcoins, setTotalAltcoins] = useState<number>(0);
  const [percentage, setPercentage] = useState<number>(0);
  const [outperformingCoins, setOutperformingCoins] = useState<CoinData[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<{
    key: "priceChange" | "marketCap" | "name" | "rank";
    direction: "asc" | "desc";
  }>({ key: "priceChange", direction: "desc" });
  const [bitcoinData, setBitcoinData] = useState<Cryptocurrency | null>(null);
  const [marketDominance, setMarketDominance] =
    useState<MarketDominanceData | null>(null);
  const [enhancedIndex, setEnhancedIndex] = useState<number>(0);
  const [showEnhancedInfo, setShowEnhancedInfo] = useState<boolean>(false);

  const seasonStatus = useMemo<SeasonStatus>(() => {
    if (enhancedIndex >= 75) {
      return {
        title: "Altcoin Season",
        description:
          "Altcoins are significantly outperforming Bitcoin. This is typically a good time for altcoin investments.",
        color: "from-emerald-500 to-green-400",
        icon: <FaRocket className="text-white text-2xl" />,
        bgColor: "bg-emerald-500",
      };
    } else if (enhancedIndex >= 50) {
      return {
        title: "Altcoin Season Approaching",
        description:
          "Many altcoins are outperforming Bitcoin. The market is showing signs of altcoin strength.",
        color: "from-teal-500 to-cyan-400",
        icon: <FaChartLine className="text-white text-2xl" />,
        bgColor: "bg-teal-500",
      };
    } else if (enhancedIndex >= 25) {
      return {
        title: "Neutral Market",
        description:
          "The market is balanced between Bitcoin and altcoins. No clear trend is visible.",
        color: "from-amber-500 to-yellow-400",
        icon: <FaExchangeAlt className="text-white text-2xl" />,
        bgColor: "bg-amber-500",
        additionalText:
          "Market is in transition - watch for breakout opportunities in either direction.",
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
  }, [enhancedIndex]);

  const enhancedStatus = useMemo<SeasonStatus>(() => {
    if (enhancedIndex >= 75) {
      return {
        title: "Altcoin Season",
        description:
          "Multiple indicators suggest we're in a strong altcoin season. Altcoins are significantly outperforming Bitcoin, and Bitcoin dominance is decreasing.",
        color: "from-emerald-500 to-green-400",
        icon: <FaRocket className="text-white text-2xl" />,
        bgColor: "bg-emerald-500",
      };
    } else if (enhancedIndex >= 50) {
      return {
        title: "Altcoin Season Approaching",
        description:
          "Several indicators point to a developing altcoin season. Many altcoins are outperforming Bitcoin, with decreasing Bitcoin dominance.",
        color: "from-teal-500 to-cyan-400",
        icon: <FaChartLine className="text-white text-2xl" />,
        bgColor: "bg-teal-500",
      };
    } else if (enhancedIndex >= 25) {
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
  }, [enhancedIndex]);

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cryptoResponse, dominanceResponse] = await Promise.all([
          fetch(`https://sentimentxv2-project.vercel.app/api/all-cryptos`),
          fetch(`https://sentimentxv2-project.vercel.app/api/market-dominance`),
        ]);

        const [cryptoData, dominanceData] = await Promise.all([
          cryptoResponse.json(),
          dominanceResponse.json(),
        ]);

        processCryptoData(cryptoData);
        processDominanceData(dominanceData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processCryptoData = (data: Cryptocurrency[]) => {
    const filteredData = data
      .slice(0, 100)
      .filter((coin) => !excludedCoins.has(coin.id));

    // Fill up to 100 coins if needed
    let index = 100;
    while (filteredData.length < 100 && index < data.length) {
      const coin = data[index];
      if (!excludedCoins.has(coin.id)) {
        filteredData.push(coin);
      }
      index++;
    }

    const bitcoin = data.find((coin) => coin.id === "bitcoin");
    if (!bitcoin) {
      console.error("Bitcoin data not found");
      return;
    }

    setBitcoinData(bitcoin);

    const outperforming = filteredData.filter(
      (coin) =>
        coin.price_change_percentage_24h > bitcoin.price_change_percentage_24h
    );

    const outperformingCoinsData = outperforming.map((coin) => ({
      name: coin.name,
      priceChange: coin.price_change_percentage_24h,
      image: coin.image,
      id: coin.id,
      symbol: coin.symbol,
      marketCap: coin.market_cap,
      volume: coin.total_volume,
      rank: coin.market_cap_rank,
    }));

    const altcoinPercentage =
      (outperforming.length / filteredData.length) * 100;

    setOutperformingCount(outperforming.length);
    setTotalAltcoins(filteredData.length);
    setOutperformingCoins(outperformingCoinsData);
    setPercentage(altcoinPercentage);
  };

  const processDominanceData = (data: any) => {
    if (data?.data?.market_cap_percentage) {
      const marketData = data.data.market_cap_percentage;
      const btcDominance = marketData.btc || 0;
      const ethDominance = marketData.eth || 0;
      const usdtDominance = marketData.usdt || 0;
      const othersDominance = 100 - btcDominance - ethDominance - usdtDominance;

      setMarketDominance({
        btc: btcDominance,
        eth: ethDominance,
        usdt: usdtDominance,
        others: othersDominance,
      });
    }
  };

  // Enhanced index calculation - updated to be more like CoinMarketCap
  // Enhanced index calculation - final adjustment to match CMC
  useEffect(() => {
    if (marketDominance && percentage && bitcoinData) {
      // CoinMarketCap-like formula weights
      const altcoinPerformanceWeight = 0.35; // Reduced weight for altcoin performance
      const btcDominanceWeight = 0.45; // Increased weight for BTC dominance
      const stablecoinDominanceWeight = 0.2; // Stable weight for stablecoin dominance

      // Normalize factors to better match CMC ranges
      const altcoinPerformanceFactor = percentage * 0.5; // Reduced impact

      // BTC dominance factor with stronger inverse relationship
      const btcDominanceFactor = Math.max(0, 60 - marketDominance.btc) * 1.5;

      // Stablecoin dominance with stronger inverse relationship
      const stablecoinDominanceFactor =
        Math.max(0, 15 - marketDominance.usdt) * 2;

      // Calculate base index
      let enhancedIndexValue =
        altcoinPerformanceFactor * altcoinPerformanceWeight +
        btcDominanceFactor * btcDominanceWeight +
        stablecoinDominanceFactor * stablecoinDominanceWeight;

      // Apply logarithmic scale to better match CMC's compression
      enhancedIndexValue = 100 * (1 - Math.exp(-enhancedIndexValue / 50));

      // Additional adjustment based on Bitcoin performance
      const btcPerformance = bitcoinData.price_change_percentage_24h || 0;
      if (btcPerformance > 5) {
        enhancedIndexValue *= 0.8; // Reduce index during strong BTC rallies
      } else if (btcPerformance < -5) {
        enhancedIndexValue *= 1.2; // Boost index during BTC drops
      }

      // Final smoothing and bounding
      setEnhancedIndex((prev) => {
        const boundedValue = Math.min(100, Math.max(0, enhancedIndexValue));
        return prev ? prev * 0.7 + boundedValue * 0.3 : boundedValue;
      });
    }
  }, [marketDominance, percentage, bitcoinData]);

  // Sorting and filtering
  const filteredAndSortedCoins = useMemo(() => {
    let filtered = outperformingCoins;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (coin) =>
          coin.name.toLowerCase().includes(term) ||
          coin.symbol.toLowerCase().includes(term)
      );
    }

    return [...filtered].sort((a, b) => {
      if (sortConfig.key === "priceChange") {
        return sortConfig.direction === "asc"
          ? a.priceChange - b.priceChange
          : b.priceChange - a.priceChange;
      } else if (sortConfig.key === "marketCap") {
        return sortConfig.direction === "asc"
          ? a.marketCap - b.marketCap
          : b.marketCap - a.marketCap;
      } else if (sortConfig.key === "name") {
        return sortConfig.direction === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        return sortConfig.direction === "asc"
          ? a.rank - b.rank
          : b.rank - a.rank;
      }
    });
  }, [outperformingCoins, searchTerm, sortConfig]);

  const handleSort = (key: "priceChange" | "marketCap" | "name" | "rank") => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  const formatMarketCap = (marketCap: number): string => {
    if (marketCap >= 1_000_000_000) {
      return `$${(marketCap / 1_000_000_000).toFixed(2)}B`;
    } else if (marketCap >= 1_000_000) {
      return `$${(marketCap / 1_000_000).toFixed(2)}M`;
    }
    return `$${(marketCap / 1_000).toFixed(2)}K`;
  };

  if (loading) {
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br bg-gray-50 dark:bg-gray-900 p-4 lg:p-8">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-green-500">
            Altcoin Season Index
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-lg">
            Track whether we're in an Altcoin Season or Bitcoin Season based on
            market performance
          </p>
        </div>

        {/* Main Content Area */}
        <div
          className={`flex flex-col ${selectedCoin ? "lg:flex-row" : ""} gap-8`}
        >
          {/* Left Card */}
          <div
            className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50 ${
              selectedCoin ? "lg:min-w-[500px] lg:w-[55%]" : "w-full"
            }`}
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
                    {seasonStatus.additionalText && (
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-2">
                        {seasonStatus.additionalText}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {showEnhancedInfo && (
                <div className="mt-4 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                  <h3 className="font-bold text-purple-800 dark:text-purple-300 mb-2">
                    Altcoin Season Index Explained
                  </h3>
                  <p className="text-purple-700 dark:text-purple-200 mb-2">
                    This index combines multiple market factors to provide a
                    comprehensive view of the current market cycle:
                  </p>
                  <ul className="list-disc list-inside text-purple-700 dark:text-purple-200 space-y-1">
                    <li>
                      <strong>Altcoin Performance (60%):</strong> Percentage of
                      top altcoins outperforming Bitcoin
                    </li>
                    <li>
                      <strong>Bitcoin Dominance (35%):</strong> Lower Bitcoin
                      dominance indicates more capital flowing to altcoins
                    </li>
                    <li>
                      <strong>Market Momentum (5%):</strong> General market
                      trend direction
                    </li>
                  </ul>
                  <p className="text-purple-700 dark:text-purple-200 mt-2">
                    The index ranges from 0-100, with values above 75 indicating
                    Altcoin Season and below 25 indicating Bitcoin Season.
                  </p>
                </div>
              )}
            </div>

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
                      <span
                        className={`text-4xl font-bold ${enhancedStatus.bgColor.replace(
                          "bg-",
                          "text-"
                        )}`}
                      >
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
                          (bitcoinData?.price_change_percentage_24h ?? 0) >= 0
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

              {outperformingCoins.length > 0 && (
                <div className="mt-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      Top Performing Altcoins
                    </h3>

                    <div className="flex flex-col sm:flex-row gap-3">
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

                  <div className="hidden md:grid md:grid-cols-5 gap-4 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-t-lg font-medium text-gray-600 dark:text-gray-300 text-sm">
                    <div
                      className="flex items-center cursor-pointer hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
                      onClick={() => handleSort("rank")}
                    >
                      Rank
                      {sortConfig.key === "rank" &&
                        (sortConfig.direction === "asc" ? (
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
                      {sortConfig.key === "name" &&
                        (sortConfig.direction === "asc" ? (
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
                      {sortConfig.key === "priceChange" &&
                        (sortConfig.direction === "asc" ? (
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
                      {sortConfig.key === "marketCap" &&
                        (sortConfig.direction === "asc" ? (
                          <FiChevronUp className="ml-1" />
                        ) : (
                          <FiChevronDown className="ml-1" />
                        ))}
                    </div>
                    <div className="text-right">Action</div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-b-lg overflow-hidden">
                    {filteredAndSortedCoins.length > 0 ? (
                      filteredAndSortedCoins.map((coin, index) => (
                        <div
                          key={coin.id}
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
                        </div>
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
          </div>

          {/* Right Chart Card */}
          {selectedCoin ? (
            <div className="lg:flex-1 min-w-0">
              <div className="sticky top-20 h-[calc(100vh-32px)] overflow-y-auto">
                <AltcoinChart
                  coin={selectedCoin}
                  onClose={() => setSelectedCoin(null)}
                />
              </div>
            </div>
          ) : (
            <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200/50 dark:border-gray-700/50 h-full">
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
      </div>
    </div>
  );
};

export default AltcoinSeason;
