"use client";
import React from "react";
import { useEffect, useState, useRef } from "react";
import {
  FaLink,
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
} from "react-icons/fa";
import { FiAlertCircle, FiBarChart2 } from "react-icons/fi";
import { CgWebsite } from "react-icons/cg";
import type { CoinDetail } from "../../types";
import PriceChart from "./PriceChart";

interface CurrencyStatsProps {
  activeSection: string;
  coinId: string;
}

function CurrencyStats({
  activeSection,
  coinId,
}: CurrencyStatsProps): JSX.Element {
  const [coinData, setCoinData] = useState<CoinDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [needsExpansion, setNeedsExpansion] = useState<boolean>(false);
  const descriptionRef = useRef<HTMLDivElement>(null);

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

  // Verifică dacă textul necesită expandare după ce datele sunt încărcate
  useEffect(() => {
    if (coinData && descriptionRef.current) {
      const descriptionHeight = descriptionRef.current.scrollHeight;
      const maxHeight = 96; // 24px * 4 linii (max-h-24)
      setNeedsExpansion(
        descriptionHeight > maxHeight && coinData.description.en.length > 100
      );
    }
  }, [coinData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary p-6 flex justify-center items-center">
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
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary p-6 flex justify-center items-center">
        <div className="max-w-md w-full bg-white dark:bg-dark-secondary rounded-xl shadow-lg p-8">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <FiAlertCircle className="text-red-500 text-3xl" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text-primary mb-2">
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

  // Calculăm procentul, dar ne asigurăm că este între 0 și 100
  let progress = ((currentPrice - atlPrice) / (athPrice - atlPrice)) * 100;
  progress = Math.max(0, Math.min(100, progress)); // Limitează între 0 și 100

  const priceChange24h = coinData.market_data.price_change_24h;
  const priceChangePercentage24h =
    coinData.market_data.price_change_percentage_24h;
  const marketCapChangePercentage24h =
    coinData.market_data.market_cap_change_percentage_24h;

  // Render different content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return renderOverview();
      case "markets":
        return renderMarkets();
      case "fundamentals":
        return renderFundamentals();
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => {
    return (
      <>
        {/* Hero Card with Coin Info */}
        <div className="bg-white dark:bg-dark-secondary rounded-2xl shadow-md p-6 border border-gray-100 dark:border-dark-tertiary/50">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Coin Identity */}
            <div className="flex items-center md:items-start gap-4 md:gap-6">
              <div className="relative">
                <img
                  src={coinData.image.large || "/placeholder.svg"}
                  alt={coinData.name}
                  className="h-20 w-20 rounded-xl border-[3px] border-white dark:border-gray-700 shadow-lg"
                />
                <div className="absolute -bottom-2 -right-2 bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1 text-xs font-bold text-gray-800 dark:text-gray-200 shadow-sm">
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
            <div className="flex flex-col items-start md:items-end md:ml-auto">
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

          {/* Price Position Slider */}
          <div className="mt-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-teal-600 dark:text-teal-400 font-medium">
                All Time Low
              </span>
              <span className="text-orange-600 dark:text-orange-400 font-medium">
                All Time High
              </span>
            </div>
            <div className="relative w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              {/* Background before current point - teal */}
              <div
                className="absolute h-4 bg-gradient-to-r from-teal-600 to-teal-400 rounded-l-full"
                style={{ width: `${progress}%` }}
              ></div>

              {/* Background after current point - orange */}
              <div
                className="absolute h-4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-r-full"
                style={{
                  left: `${progress}%`,
                  width: `${100 - progress}%`,
                }}
              ></div>

              {/* Current point marker - asigurăm poziționarea corectă */}
              <div
                className="absolute w-4 h-4 bg-white border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg z-10"
                style={{
                  left: `${progress}%`,
                  top: "50%",
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs mt-2">
              <span className="text-teal-600 dark:text-teal-400 font-medium">
                ${formatPrice(atlPrice)}
              </span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                ${formatPrice(currentPrice)}
              </span>
              <span className="text-orange-600 dark:text-orange-400 font-medium">
                ${formatPrice(athPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-sm p-5 border border-gray-100 dark:border-dark-tertiary/50">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                <FaDollarSign className="text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Market Cap
              </h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatMarketCap(coinData.market_data.market_cap.usd)}
            </p>
            <p
              className={`text-sm mt-1 flex items-center ${
                marketCapChangePercentage24h >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {marketCapChangePercentage24h >= 0 ? (
                <FaArrowUp className="mr-1" />
              ) : (
                <FaArrowDown className="mr-1" />
              )}
              {Math.abs(marketCapChangePercentage24h).toFixed(2)}% (24h)
            </p>
          </div>

          <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-sm p-5 border border-gray-100 dark:border-dark-tertiary/50">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3">
                <FaExchangeAlt className="text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                24h Volume
              </h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatMarketCap(coinData.market_data.total_volume.usd)}
            </p>
            <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">
              {(
                (coinData.market_data.total_volume.usd /
                  coinData.market_data.market_cap.usd) *
                100
              ).toFixed(2)}
              % of market cap
            </p>
          </div>

          <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-sm p-5 border border-gray-100 dark:border-dark-tertiary/50">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                <FaCoins className="text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Circulating Supply
              </h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatSupply(coinData.market_data.circulating_supply)}{" "}
              {coinData.symbol.toUpperCase()}
            </p>
            {coinData.market_data.max_supply && (
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-teal-500 h-2.5 rounded-full"
                  style={{
                    width: `${(
                      (coinData.market_data.circulating_supply /
                        coinData.market_data.max_supply) *
                      100
                    ).toFixed(2)}%`,
                  }}
                ></div>
              </div>
            )}
            <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">
              {coinData.market_data.max_supply
                ? `${(
                    (coinData.market_data.circulating_supply /
                      coinData.market_data.max_supply) *
                    100
                  ).toFixed(2)}% of max supply`
                : "No max supply data"}
            </p>
          </div>
        </div>

        {/* Price Chart Section */}
        <div className="mt-6">
          <PriceChart coinId={coinId} />
        </div>

        {/* Description Section */}
        {coinData.description.en && (
          <div className="mt-6 bg-white dark:bg-dark-secondary rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-tertiary/50">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg mr-3">
                <FaInfoCircle className="text-yellow-500" />
              </div>
              About {coinData.name}
            </h2>
            <div className="relative">
              <div
                ref={descriptionRef}
                className={`prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 ${
                  !expanded && needsExpansion ? "max-h-24 overflow-hidden" : ""
                }`}
                dangerouslySetInnerHTML={{
                  __html: coinData.description.en,
                }}
              />
              {!expanded && needsExpansion && (
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none"></div>
              )}
              {needsExpansion && (
                <div className="mt-2 pt-2 relative z-10">
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-teal-400 hover:text-teal-300 text-sm font-medium flex items-center rounded px-4 py-2 bg-gray-800 border border-gray-700 transition-colors shadow-md"
                  >
                    {expanded ? (
                      <>
                        <FaChevronUp className="mr-2" /> Read less
                      </>
                    ) : (
                      <>
                        <FaChevronDown className="mr-2" /> Read more
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </>
    );
  };

  const renderMarkets = () => {
    return (
      <>
        {/* Market Overview Card */}
        <div className="bg-white dark:bg-dark-secondary rounded-2xl shadow-md p-6 border border-gray-100 dark:border-dark-tertiary/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Coin Identity - Compact version */}
            <div className="flex items-center space-x-4">
              <img
                src={coinData.image.large || "/placeholder.svg"}
                alt={coinData.name}
                className="h-12 w-12 rounded-full border-[2px] border-white dark:border-gray-700 shadow-md"
              />
              <div>
                <div className="flex items-center flex-wrap gap-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {coinData.name}
                  </h1>
                  <span className="text-lg font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md">
                    {coinData.symbol.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Price Data - Compact version */}
            <div className="flex flex-col items-start md:items-end">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${formatPrice(currentPrice)}
                </span>
                <span
                  className={`flex items-center text-base font-medium px-2 py-0.5 rounded-full ${
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
            </div>
          </div>
        </div>

        {/* Market Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* 24 Hour Statistics */}
          <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-tertiary/50">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg mr-3">
                <FaClock className="text-green-500" />
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
          </div>

          {/* Price Change Periods */}
          <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-tertiary/50">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg mr-3">
                <FaChartLine className="text-indigo-500" />
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
          </div>
        </div>

        {/* Resources & Links */}
        <div className="mt-6 bg-white dark:bg-dark-secondary rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-tertiary/50">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg mr-3">
              <FaLink className="text-indigo-500" />
            </div>
            Resources & Links
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coinData.links.homepage[0] && (
              <a
                href={coinData.links.homepage[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-tertiary transition-colors duration-200 border border-gray-100 dark:border-dark-tertiary/50"
              >
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl mr-4">
                  <CgWebsite className="text-blue-500 text-2xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Official Website
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {coinData.links.homepage[0]?.replace(/^https?:\/\//, "")}
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
                className="flex items-center p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-tertiary transition-colors duration-200 border border-gray-100 dark:border-dark-tertiary/50"
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
                  className="flex items-center p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-tertiary transition-colors duration-200 border border-gray-100 dark:border-dark-tertiary/50"
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
                className="flex items-center p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-tertiary transition-colors duration-200 border border-gray-100 dark:border-dark-tertiary/50"
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
          </div>
        </div>
      </>
    );
  };

  const renderFundamentals = () => {
    return (
      <>
        {/* Fundamentals Overview Card */}
        <div className="bg-white dark:bg-dark-secondary rounded-2xl shadow-md p-6 border border-gray-100 dark:border-dark-tertiary/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Coin Identity - Compact version */}
            <div className="flex items-center space-x-4">
              <img
                src={coinData.image.large || "/placeholder.svg"}
                alt={coinData.name}
                className="h-12 w-12 rounded-full border-[2px] border-white dark:border-gray-700 shadow-md"
              />
              <div>
                <div className="flex items-center flex-wrap gap-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {coinData.name}
                  </h1>
                  <span className="text-lg font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md">
                    {coinData.symbol.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Price Data - Compact version */}
            <div className="flex flex-col items-start md:items-end">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${formatPrice(currentPrice)}
                </span>
                <span
                  className={`flex items-center text-base font-medium px-2 py-0.5 rounded-full ${
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
            </div>
          </div>
        </div>

        {/* Supply Information */}
        <div className="mt-6 bg-white dark:bg-dark-secondary rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-tertiary/50">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg mr-3">
              <FaCoins className="text-green-500" />
            </div>
            Supply Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-300">
                  Circulating Supply
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatSupply(coinData.market_data.circulating_supply)}{" "}
                  {coinData.symbol.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-300">
                  Total Supply
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatSupply(coinData.market_data.total_supply)}{" "}
                  {coinData.symbol.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600 dark:text-gray-300">
                  Max Supply
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {coinData.market_data.max_supply
                    ? formatSupply(coinData.market_data.max_supply)
                    : "∞"}{" "}
                  {coinData.symbol.toUpperCase()}
                </span>
              </div>
            </div>

            <div>
              {coinData.market_data.max_supply && (
                <div className="h-full flex flex-col justify-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Supply Progress
                  </p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
                    <div
                      className="bg-teal-500 h-4 rounded-full"
                      style={{
                        width: `${(
                          (coinData.market_data.circulating_supply /
                            coinData.market_data.max_supply) *
                          100
                        ).toFixed(2)}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>0</span>
                    <span>
                      {formatSupply(coinData.market_data.circulating_supply)}
                    </span>
                    <span>{formatSupply(coinData.market_data.max_supply)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* All-Time Highs and Lows */}
        <div className="mt-6 bg-white dark:bg-dark-secondary rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-tertiary/50">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg mr-3">
              <FaChartBar className="text-purple-500" />
            </div>
            All-Time Highs and Lows
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-dark-tertiary p-4 rounded-xl border border-gray-200 dark:border-dark-tertiary/70">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                All-Time High
              </p>
              <p className="text-2xl font-bold text-orange-500">
                ${formatPrice(athPrice)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {athDate}
              </p>
              <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Current price is{" "}
                <span
                  className={
                    athChangePercentage >= 0 ? "text-green-500" : "text-red-500"
                  }
                >
                  {athChangePercentage.toFixed(2)}%
                </span>{" "}
                {athChangePercentage >= 0 ? "above" : "below"} ATH
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-dark-tertiary p-4 rounded-xl border border-gray-200 dark:border-dark-tertiary/70">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                All-Time Low
              </p>
              <p className="text-2xl font-bold text-teal-500">
                ${formatPrice(atlPrice)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {atlDate}
              </p>
              <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Current price is{" "}
                <span className="text-green-500">
                  {atlChangePercentage.toFixed(2)}%
                </span>{" "}
                above ATL
              </p>
            </div>
          </div>
        </div>

        {/* Market Data */}
        <div className="mt-6 bg-white dark:bg-dark-secondary rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-tertiary/50">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg mr-3">
              <FiBarChart2 className="text-blue-500" />
            </div>
            Market Data
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-300">
                Market Cap Rank
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                #{coinData.market_cap_rank}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-300">
                Market Cap
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatMarketCap(coinData.market_data.market_cap.usd)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-300">
                24h Trading Volume
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatMarketCap(coinData.market_data.total_volume.usd)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-300">
                Fully Diluted Valuation
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {coinData.market_data.fully_diluted_valuation?.usd
                  ? formatMarketCap(
                      coinData.market_data.fully_diluted_valuation.usd
                    )
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </>
    );
  };

  return <div className="transition-all duration-300">{renderContent()}</div>;
}

export default CurrencyStats;
