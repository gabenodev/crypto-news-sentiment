"use client";
import * as React from "react";
import { useEffect, useState, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiMinimize2,
  FiMaximize2,
  FiInfo,
  FiClock,
  FiDollarSign,
  FiTrendingUp,
  FiBarChart2,
} from "react-icons/fi";
import { FaArrowUp, FaArrowDown, FaExchangeAlt } from "react-icons/fa";
import type { ChartDataPoint } from "../../types";

// Helper function for price formatting
const formatPrice = (price: number): string => {
  if (price < 0.001) {
    return price.toFixed(6);
  }
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: price < 1 ? 6 : 2,
  }).format(price);
};

const formatMarketCap = (cap: number | null): string => {
  if (!cap) return "N/A";
  if (cap >= 1e12) return `${(cap / 1e12).toFixed(2)}T`;
  if (cap >= 1e9) return `${(cap / 1e9).toFixed(2)}B`;
  if (cap >= 1e6) return `${(cap / 1e6).toFixed(2)}M`;
  return `${cap.toLocaleString()}`;
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload as ChartDataPoint;
    const fullDate = dataPoint.fullDate?.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          {fullDate}
        </p>
        <p className="text-lg font-bold text-gray-900 dark:text-white">
          ${formatPrice(payload[0].value)}
        </p>
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Volume:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              $1.2M
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

interface PriceChangeIndicatorProps {
  change: number;
}

const PriceChangeIndicator = ({ change }: PriceChangeIndicatorProps) => {
  const isPositive = change >= 0;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-sm font-medium ${
        isPositive
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      }`}
    >
      {isPositive ? (
        <FaArrowUp className="mr-1 text-xs" />
      ) : (
        <FaArrowDown className="mr-1 text-xs" />
      )}
      {change > 0 ? "+" : ""}
      {change.toFixed(2)}%
    </span>
  );
};

const LoadingSkeleton = () => (
  <div className="w-full p-6 bg-white dark:bg-gray-800 shadow-xl rounded-2xl animate-pulse">
    <div className="flex justify-between mb-4">
      <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
    </div>
    <div className="flex items-center space-x-3 mb-4">
      <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
    <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
    <div className="mt-4 h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
  </div>
);

interface ErrorMessageProps {
  error: string;
}

const ErrorMessage = ({ error }: ErrorMessageProps) => (
  <div className="w-full p-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl shadow-xl">
    <div className="flex flex-col items-center text-center">
      <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-3">
        <svg
          className="w-6 h-6 text-red-500 dark:text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      </div>
      <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
        Error Loading Data
      </h3>
      <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
      <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
        Try Again
      </button>
    </div>
  </div>
);

interface CoinData {
  id: string;
  name: string;
  symbol: string;
  image: string;
  priceChange: number;
  marketCap?: number;
  volume?: number;
  rank?: number;
}

interface AltcoinChartProps {
  coin: CoinData;
  onClose: () => void;
}

const AltcoinChart = ({ coin, onClose }: AltcoinChartProps): JSX.Element => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [marketCap, setMarketCap] = useState<number | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [timeframe, setTimeframe] = useState<string>("30");
  const [showStats, setShowStats] = useState<boolean>(true);
  const chartRef = useRef<HTMLDivElement>(null);
  const [bitcoinData, setBitcoinData] = useState<{
    price_change_percentage_24h: number;
  } | null>(null);

  const fetchMarketData = async (coinId: string) => {
    try {
      const response = await fetch(
        `https://sentimentx-backend.vercel.app/api/all-cryptos`
      );
      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }
      const data = await response.json();

      const coinData = data.find((coin: any) => coin.id === coinId);
      if (!coinData) {
        throw new Error("Coin not found in market data");
      }

      return {
        market_cap: coinData.market_cap,
        rank: coinData.market_cap_rank,
        volume: coinData.total_volume,
        ath: coinData.ath,
        atl: coinData.atl,
      };
    } catch (error) {
      console.error("Error fetching market data:", error);
      return {
        market_cap: null,
        rank: null,
        volume: null,
        ath: null,
        atl: null,
      };
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        // Fetch historical data
        const historicalResponse = await fetch(
          `https://sentimentx-backend.vercel.app/api/altcoin-season-chart?coinId=${coin.id}&days=${timeframe}`
        );
        if (!historicalResponse.ok) {
          throw new Error(
            `Server returned status: ${historicalResponse.status}`
          );
        }
        const historicalData = await historicalResponse.json();
        if (!historicalData || !historicalData.prices) {
          throw new Error("Invalid data format: prices not found");
        }

        const formattedData = historicalData.prices.map(
          (priceData: [number, number]) => ({
            date: new Date(priceData[0]).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
            }),
            price: priceData[1],
            fullDate: new Date(priceData[0]),
          })
        );
        setChartData(formattedData);

        // Fetch market cap and rank
        const { market_cap, rank } = await fetchMarketData(coin.id);
        setMarketCap(market_cap);
        setRank(rank);

        // Fetch Bitcoin data
        const bitcoinResponse = await fetch(
          `https://api.coingecko.com/api/v3/coins/bitcoin`
        );
        if (bitcoinResponse.ok) {
          const bitcoinData = await bitcoinResponse.json();
          setBitcoinData({
            price_change_percentage_24h:
              bitcoinData.market_data.price_change_percentage_24h,
          });
        } else {
          console.error("Failed to fetch Bitcoin data");
          setBitcoinData(null);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError((error as Error).message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [coin.id, timeframe]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  const prices = chartData.map((data) =>
    Number.parseFloat(data.price.toString())
  );
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;
  const margin = priceRange * 0.1;
  const yDomain = [Math.max(0, minPrice - margin), maxPrice + margin];
  const currentPrice = prices[prices.length - 1];

  const timeframeOptions = [
    { value: "1", label: "24h" },
    { value: "7", label: "7d" },
    { value: "30", label: "30d" },
    { value: "90", label: "90d" },
    { value: "365", label: "1y" },
    { value: "max", label: "Max" },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`${
          isExpanded
            ? "fixed inset-0 z-50 p-4 bg-gray-900/80 flex items-center justify-center"
            : "w-full"
        }`}
      >
        <div
          className={`${
            isExpanded ? "w-full max-w-4xl" : "w-full"
          } bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col`}
        >
          <div className="p-6 pb-0 flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <img
                src={coin.image || "/placeholder.svg"}
                alt={coin.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  {coin.name}
                  {rank && (
                    <span className="ml-2 text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
                      #{rank}
                    </span>
                  )}
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${formatPrice(currentPrice)}
                  </span>
                  <PriceChangeIndicator change={coin.priceChange} />
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label={isExpanded ? "Minimize" : "Expand"}
              >
                {isExpanded ? (
                  <FiMinimize2 className="w-5 h-5" />
                ) : (
                  <FiMaximize2 className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Timeframe selector */}
          <div className="px-6 pt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Timeframe:
              </span>
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {timeframeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTimeframe(option.value)}
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      timeframe === option.value
                        ? "bg-teal-500 text-white"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    } transition-colors`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => setShowStats(!showStats)}
              className={`text-xs px-2 py-1 rounded flex items-center ${
                showStats
                  ? "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              }`}
            >
              <FiInfo className="mr-1" size={12} />
              {showStats ? "Hide Stats" : "Show Stats"}
            </button>
          </div>

          {/* Stats row */}
          <AnimatePresence>
            {showStats && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="px-6 pt-3 pb-2 overflow-hidden"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <FiDollarSign className="mr-1" size={10} />
                      Market Cap
                    </div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatMarketCap(marketCap)}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <FiBarChart2 className="mr-1" size={10} />
                      24h Volume
                    </div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatMarketCap(coin.volume || null)}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <FiTrendingUp className="mr-1" size={10} />
                      All-Time High
                    </div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      ${formatPrice(maxPrice)}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <FiClock className="mr-1" size={10} />
                      Updated
                    </div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 p-4 pt-2" ref={chartRef}>
            <ResponsiveContainer width="100%" height={isExpanded ? 500 : 300}>
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#eee"
                  vertical={false}
                  horizontal={true}
                  strokeOpacity={0.1}
                />
                <XAxis
                  dataKey="date"
                  tick={{
                    fill: "#6b7280",
                    fontSize: 11,
                    fontFamily: "Inter, sans-serif",
                  }}
                  tickMargin={10}
                  interval={Math.floor(chartData.length / 7)}
                  axisLine={{ stroke: "#e5e7eb", strokeOpacity: 0.3 }}
                />
                <YAxis
                  tickFormatter={(value) => `$${formatPrice(value)}`}
                  tick={{
                    fill: "#6b7280",
                    fontSize: 11,
                    fontFamily: "Inter, sans-serif",
                  }}
                  tickMargin={10}
                  axisLine={{ stroke: "#e5e7eb", strokeOpacity: 0.3 }}
                  domain={yDomain}
                  width={80}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{
                    stroke: "#3b82f6",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                    strokeOpacity: 0.3,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 6,
                    stroke: "#fff",
                    strokeWidth: 2,
                    fill: "#10b981",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="px-6 pb-4 pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Updated: {new Date().toLocaleTimeString()}</span>
              <div className="flex items-center">
                <FaExchangeAlt className="mr-1" size={10} />
                <span>
                  vs Bitcoin:{" "}
                  {(
                    coin.priceChange -
                    (bitcoinData?.price_change_percentage_24h || 0)
                  ).toFixed(2)}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AltcoinChart;
