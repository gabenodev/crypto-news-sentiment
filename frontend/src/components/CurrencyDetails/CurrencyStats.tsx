"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaLink,
  FaReddit,
  FaArrowUp,
  FaArrowDown,
  FaChartLine,
  FaDollarSign,
  FaExchangeAlt,
  FaCoins,
  FaChartBar,
  FaClock,
  FaChartPie,
  FaExternalLinkAlt,
  FaPercentage,
  FaInfoCircle,
  FaChevronUp,
  FaChevronDown,
  FaGithub,
  FaTwitter,
  FaGlobe,
} from "react-icons/fa";
import { CgWebsite } from "react-icons/cg";
import { motion } from "framer-motion";
import { Tab } from "@headlessui/react";
import type { CoinDetail } from "../../types";

function CurrencyStats(): JSX.Element {
  const { coinId } = useParams<{ coinId: string }>();
  const [coinData, setCoinData] = useState<CoinDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(
          `https://sentimentxv2-project.vercel.app/api/coin-data?coinId=${coinId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        setCoinData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching coin data:", error);
        setError(
          "There was an error fetching the coin data. Please try again."
        );
        setLoading(false);
      }
    }

    fetchData();
  }, [coinId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex justify-center items-center">
        <div className="max-w-md w-full">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-t-teal-500 border-b-teal-500 border-l-transparent border-r-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              Loading cryptocurrency data
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-center">
              Fetching the latest information for {coinId}...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex justify-center items-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <FaInfoCircle className="text-red-500 text-3xl" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Error Loading Data
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!coinData) {
    return <></>;
  }

  const formatPrice = (price: number): string => {
    if (price < 0.0001) {
      return price.toFixed(8);
    }
    return price.toLocaleString();
  };

  const formatMarketCap = (cap: number): string => {
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
    return `$${cap.toLocaleString()}`;
  };

  const formatSupply = (supply: number | null): string => {
    if (!supply) return "N/A";
    if (supply >= 1e9) return `${(supply / 1e9).toFixed(2)}B`;
    if (supply >= 1e6) return `${(supply / 1e6).toFixed(2)}M`;
    if (supply >= 1e3) return `${(supply / 1e3).toFixed(2)}K`;
    return supply.toLocaleString();
  };

  const currentPrice = coinData.market_data.current_price.usd;
  const athPrice = coinData.market_data.ath.usd;
  const atlPrice = coinData.market_data.atl.usd;
  const high24h = coinData.market_data.high_24h.usd;
  const low24h = coinData.market_data.low_24h.usd;
  const athChangePercentage = coinData.market_data.ath_change_percentage.usd;
  const atlChangePercentage = coinData.market_data.atl_change_percentage.usd;
  const athDate = new Date(
    coinData.market_data.ath_date.usd
  ).toLocaleDateString();
  const atlDate = new Date(
    coinData.market_data.atl_date.usd
  ).toLocaleDateString();
  const progress = ((currentPrice - atlPrice) / (athPrice - atlPrice)) * 100;

  const priceChange24h = coinData.market_data.price_change_24h;
  const priceChangePercentage24h =
    coinData.market_data.price_change_percentage_24h;
  const marketCapChangePercentage24h =
    coinData.market_data.market_cap_change_percentage_24h;

  const tabItems = [
    { name: "Overview", icon: <FaChartLine className="mr-2" /> },
    { name: "Market Stats", icon: <FaChartBar className="mr-2" /> },
    { name: "Links", icon: <FaLink className="mr-2" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors duration-300">
      {/* Hero Section with Sticky Header */}
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Coin Identity */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={coinData.image.large || "/placeholder.svg"}
                  alt={coinData.name}
                  className="h-16 w-16 rounded-full border-[3px] border-white dark:border-gray-700 shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1 text-xs font-bold text-gray-800 dark:text-gray-200 shadow-sm">
                  #{coinData.market_cap_rank}
                </div>
              </div>
              <div>
                <div className="flex items-center flex-wrap gap-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {coinData.name}
                  </h1>
                  <span className="text-xl font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                    {coinData.symbol.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center flex-wrap gap-3 mt-2">
                  {coinData.categories &&
                    coinData.categories.slice(0, 3).map(
                      (category, index) =>
                        category && (
                          <span
                            key={index}
                            className="text-xs font-medium bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 px-2 py-1 rounded-full"
                          >
                            {category}
                          </span>
                        )
                    )}
                </div>
              </div>
            </div>

            {/* Price Data */}
            <div className="flex flex-col items-end">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  ${formatPrice(currentPrice)}
                </span>
                <span
                  className={`flex items-center text-lg font-medium px-3 py-1 rounded-full ${
                    priceChangePercentage24h >= 0
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {priceChangePercentage24h >= 0 ? (
                    <FaArrowUp className="mr-1" />
                  ) : (
                    <FaArrowDown className="mr-1" />
                  )}
                  {Math.abs(priceChangePercentage24h).toFixed(2)}%
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                24h Range:{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  ${formatPrice(low24h)} - ${formatPrice(high24h)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
          <Tab.List className="flex space-x-2 rounded-xl bg-white dark:bg-gray-800 p-1 shadow-md mb-6">
            {tabItems.map((item, index) => (
              <Tab
                key={index}
                className={({ selected }) =>
                  `w-full rounded-lg py-3 text-sm font-medium leading-5 transition-all duration-200
                 ${
                   selected
                     ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 shadow-sm"
                     : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                 }
                 `
                }
              >
                <div className="flex items-center justify-center">
                  {item.icon}
                  {item.name}
                </div>
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="mt-2">
            {/* Overview Panel */}
            <Tab.Panel>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Price Position Card */}
                <motion.div
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700 lg:col-span-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg mr-3">
                      <FaChartBar className="text-purple-500 text-xl" />
                    </div>
                    Price Position
                  </h2>
                  <div className="space-y-6">
                    <div className="relative w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      {/* Background before current point - blue */}
                      <div
                        className="absolute h-4 bg-gradient-to-r from-teal-500 to-teal-400 rounded-l-full"
                        style={{ width: `${progress}%` }}
                      ></div>

                      {/* Current point marker */}
                      <div
                        className="absolute w-6 h-6 bg-white border-4 border-teal-500 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg z-10"
                        style={{
                          left: `${progress}%`,
                          top: "50%",
                        }}
                      ></div>

                      {/* Background after current point */}
                      <div
                        className="absolute h-4 bg-gradient-to-r from-orange-400 to-orange-500 rounded-r-full"
                        style={{
                          left: `${progress}%`,
                          width: `${100 - progress}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-sm mt-6">
                      <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-300 mb-1">
                          All Time Low
                        </p>
                        <p className="font-medium text-teal-500 px-3 py-1 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                          ${formatPrice(atlPrice)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {atlDate}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-300 mb-1">
                          Current
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white px-3 py-1 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          ${formatPrice(currentPrice)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Today
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-300 mb-1">
                          All Time High
                        </p>
                        <p className="font-medium text-orange-500 px-3 py-1 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          ${formatPrice(athPrice)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {athDate}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          ATH Change
                        </p>
                        <p
                          className={`text-2xl font-bold ${
                            athChangePercentage >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {athChangePercentage >= 0 ? "+" : ""}
                          {athChangePercentage.toFixed(2)}%
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          From All Time High
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          ATL Change
                        </p>
                        <p
                          className={`text-2xl font-bold ${
                            atlChangePercentage >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {atlChangePercentage >= 0 ? "+" : ""}
                          {atlChangePercentage.toFixed(2)}%
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          From All Time Low
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Market Data Card */}
                <motion.div
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg mr-3">
                      <FaChartLine className="text-blue-500 text-xl" />
                    </div>
                    Market Overview
                  </h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-300 flex items-center">
                        <FaDollarSign className="mr-2 text-gray-400" />
                        Market Cap
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatMarketCap(coinData.market_data.market_cap.usd)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-300 flex items-center">
                        <FaExchangeAlt className="mr-2 text-gray-400" />
                        24h Volume
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatMarketCap(coinData.market_data.total_volume.usd)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-300 flex items-center">
                        <FaCoins className="mr-2 text-gray-400" />
                        Circulating Supply
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatSupply(coinData.market_data.circulating_supply)}{" "}
                        {coinData.symbol.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-300 flex items-center">
                        <FaCoins className="mr-2 text-gray-400" />
                        Total Supply
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatSupply(coinData.market_data.total_supply)}{" "}
                        {coinData.symbol.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-600 dark:text-gray-300 flex items-center">
                        <FaCoins className="mr-2 text-gray-400" />
                        Max Supply
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatSupply(coinData.market_data.max_supply)}{" "}
                        {coinData.symbol.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Description Section */}
              {coinData.description.en && (
                <motion.div
                  className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg mr-3">
                      <FaInfoCircle className="text-yellow-500 text-xl" />
                    </div>
                    About {coinData.name}
                  </h2>
                  <div className="relative">
                    <div
                      className={`prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 ${
                        !expanded ? "max-h-32 overflow-hidden" : ""
                      }`}
                      dangerouslySetInnerHTML={{
                        __html: coinData.description.en,
                      }}
                    />
                    {!expanded && (
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pointer-events-none"></div>
                    )}
                    {coinData.description.en.length > 200 && (
                      <div className="mt-4 pt-2 relative z-10">
                        <button
                          onClick={() => setExpanded(!expanded)}
                          className="text-teal-500 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300 text-sm font-medium flex items-center focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded px-2 py-1"
                        >
                          {expanded ? (
                            <>
                              <FaChevronUp className="mr-1" /> Read less
                            </>
                          ) : (
                            <>
                              <FaChevronDown className="mr-1" /> Read more
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </Tab.Panel>

            {/* Market Stats Panel */}
            <Tab.Panel>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 24 Hour Statistics */}
                <motion.div
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg mr-3">
                      <FaClock className="text-green-500 text-xl" />
                    </div>
                    24 Hour Statistics
                  </h2>
                  <div className="space-y-5">
                    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-300 flex items-center">
                        <FaArrowUp className="mr-2 text-green-500" />
                        High
                      </span>
                      <span className="font-medium text-green-500 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-lg">
                        ${formatPrice(high24h)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-300 flex items-center">
                        <FaArrowDown className="mr-2 text-red-500" />
                        Low
                      </span>
                      <span className="font-medium text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-lg">
                        ${formatPrice(low24h)}
                      </span>
                    </div>

                    <div className="py-4">
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>
                    </div>

                    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-300 flex items-center">
                        <FaDollarSign className="mr-2 text-gray-400" />
                        Price Change
                      </span>
                      <div className="flex items-center">
                        <span
                          className={`font-medium px-3 py-1 rounded-lg ${
                            priceChange24h >= 0
                              ? "text-green-500 bg-green-50 dark:bg-green-900/20"
                              : "text-red-500 bg-red-50 dark:bg-red-900/20"
                          }`}
                        >
                          ${formatPrice(Math.abs(priceChange24h))}
                        </span>
                        {priceChange24h >= 0 ? (
                          <FaArrowUp className="ml-2 text-green-500" />
                        ) : (
                          <FaArrowDown className="ml-2 text-red-500" />
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-300 flex items-center">
                        <FaPercentage className="mr-2 text-gray-400" />
                        Price Change %
                      </span>
                      <span
                        className={`font-medium px-3 py-1 rounded-lg ${
                          priceChangePercentage24h >= 0
                            ? "text-green-500 bg-green-50 dark:bg-green-900/20"
                            : "text-red-500 bg-red-50 dark:bg-red-900/20"
                        }`}
                      >
                        {priceChangePercentage24h >= 0 ? "+" : ""}
                        {priceChangePercentage24h.toFixed(2)}%
                      </span>
                    </div>

                    <div className="py-4">
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>
                    </div>

                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-600 dark:text-gray-300 flex items-center">
                        <FaChartPie className="mr-2 text-gray-400" />
                        Market Cap Change %
                      </span>
                      <span
                        className={`font-medium px-3 py-1 rounded-lg ${
                          marketCapChangePercentage24h >= 0
                            ? "text-green-500 bg-green-50 dark:bg-green-900/20"
                            : "text-red-500 bg-red-50 dark:bg-red-900/20"
                        }`}
                      >
                        {marketCapChangePercentage24h >= 0 ? "+" : ""}
                        {marketCapChangePercentage24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Price Change Periods */}
                <motion.div
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg mr-3">
                      <FaChartLine className="text-indigo-500 text-xl" />
                    </div>
                    Price Change by Period
                  </h2>
                  <div className="space-y-4">
                    {["7d", "14d", "30d", "60d", "200d", "1y"].map((period) => {
                      const changeKey = `price_change_percentage_${period}`;
                      const changeValue = coinData.market_data[
                        changeKey as keyof typeof coinData.market_data
                      ] as number;
                      return (
                        <div
                          key={period}
                          className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700"
                        >
                          <span className="text-gray-600 dark:text-gray-300">
                            {period === "7d"
                              ? "7 Days"
                              : period === "14d"
                              ? "14 Days"
                              : period === "30d"
                              ? "30 Days"
                              : period === "60d"
                              ? "60 Days"
                              : period === "200d"
                              ? "200 Days"
                              : "1 Year"}
                          </span>
                          <span
                            className={`font-medium px-3 py-1 rounded-lg ${
                              changeValue >= 0
                                ? "text-green-500 bg-green-50 dark:bg-green-900/20"
                                : "text-red-500 bg-red-50 dark:bg-red-900/20"
                            }`}
                          >
                            {changeValue >= 0 ? "+" : ""}
                            {changeValue ? changeValue.toFixed(2) : "0.00"}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            </Tab.Panel>

            {/* Links Panel */}
            <Tab.Panel>
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg mr-3">
                    <FaLink className="text-indigo-500 text-xl" />
                  </div>
                  Resources & Links
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {coinData.links.homepage[0] && (
                    <a
                      href={coinData.links.homepage[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 border border-gray-100 dark:border-gray-700"
                    >
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl mr-4">
                        <CgWebsite className="text-blue-500 text-2xl" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Official Website
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {coinData.links.homepage[0]?.replace(
                            /^https?:\/\//,
                            ""
                          )}
                        </p>
                      </div>
                      <FaExternalLinkAlt className="ml-auto text-gray-400" />
                    </a>
                  )}

                  {coinData.links.blockchain_site[0] && (
                    <a
                      href={coinData.links.blockchain_site[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 border border-gray-100 dark:border-gray-700"
                    >
                      <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl mr-4">
                        <FaLink className="text-purple-500 text-2xl" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Blockchain Explorer
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {coinData.links.blockchain_site[0]?.replace(
                            /^https?:\/\//,
                            ""
                          )}
                        </p>
                      </div>
                      <FaExternalLinkAlt className="ml-auto text-gray-400" />
                    </a>
                  )}

                  {coinData.links.repos_url.github &&
                    coinData.links.repos_url.github.length > 0 && (
                      <a
                        href={coinData.links.repos_url.github[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 border border-gray-100 dark:border-gray-700"
                      >
                        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-xl mr-4">
                          <FaGithub className="text-gray-800 dark:text-gray-200 text-2xl" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white">
                            GitHub
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            Source Code Repository
                          </p>
                        </div>
                        <FaExternalLinkAlt className="ml-auto text-gray-400" />
                      </a>
                    )}

                  {coinData.links.twitter_screen_name && (
                    <a
                      href={`https://twitter.com/${coinData.links.twitter_screen_name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 border border-gray-100 dark:border-gray-700"
                    >
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl mr-4">
                        <FaTwitter className="text-blue-500 text-2xl" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Twitter
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          @{coinData.links.twitter_screen_name}
                        </p>
                      </div>
                      <FaExternalLinkAlt className="ml-auto text-gray-400" />
                    </a>
                  )}

                  {coinData.links.subreddit_url && (
                    <a
                      href={coinData.links.subreddit_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 border border-gray-100 dark:border-gray-700"
                    >
                      <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-xl mr-4">
                        <FaReddit className="text-orange-500 text-2xl" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Reddit
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {coinData.links.subreddit_url?.replace(
                            /^https?:\/\//,
                            ""
                          )}
                        </p>
                      </div>
                      <FaExternalLinkAlt className="ml-auto text-gray-400" />
                    </a>
                  )}

                  {coinData.links.official_forum_url &&
                    coinData.links.official_forum_url[0] && (
                      <a
                        href={coinData.links.official_forum_url[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 border border-gray-100 dark:border-gray-700"
                      >
                        <div className="bg-teal-100 dark:bg-teal-900/30 p-3 rounded-xl mr-4">
                          <FaGlobe className="text-teal-500 text-2xl" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white">
                            Official Forum
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {coinData.links.official_forum_url[0]?.replace(
                              /^https?:\/\//,
                              ""
                            )}
                          </p>
                        </div>
                        <FaExternalLinkAlt className="ml-auto text-gray-400" />
                      </a>
                    )}
                </div>
              </motion.div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}

export default CurrencyStats;
