import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiMinimize2, FiMaximize2 } from "react-icons/fi";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

// Helper function for price formatting
const formatPrice = (price) => {
  if (price < 0.001) {
    return price.toFixed(6);
  }
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: price < 1 ? 6 : 2,
  }).format(price);
};

const formatMarketCap = (cap) => {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
  return `$${cap.toLocaleString()}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    const fullDate = dataPoint.fullDate.toLocaleString("en-GB", {
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
      </div>
    );
  }
  return null;
};

const PriceChangeIndicator = ({ change }) => {
  const isPositive = change >= 0;
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
        isPositive
          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      }`}
    >
      {isPositive ? (
        <FaArrowUp className="mr-1" />
      ) : (
        <FaArrowDown className="mr-1" />
      )}
      {change > 0 ? "+" : ""}
      {change.toFixed(2)}%
    </span>
  );
};

const LoadingSkeleton = () => (
  <div className="w-96 p-6 bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
    <div className="animate-pulse flex flex-col space-y-4">
      <div className="flex justify-between">
        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
    </div>
  </div>
);

const ErrorMessage = ({ error }) => (
  <div className="w-96 p-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl shadow-xl">
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
    </div>
  </div>
);

const AltcoinChart = ({ coin, onClose }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [marketCap, setMarketCap] = useState(null);
  const [rank, setRank] = useState(null);

  const fetchMarketData = async (coinId) => {
    try {
      const response = await fetch(
        `https://sentimentx-backend.vercel.app/api/all-cryptos`
      );
      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }
      const data = await response.json();

      const coinData = data.find((coin) => coin.id === coinId);
      if (!coinData) {
        throw new Error("Coin not found in market data");
      }

      return {
        market_cap: coinData.market_cap,
        rank: coinData.market_cap_rank,
      };
    } catch (error) {
      console.error("Error fetching market data:", error);
      return { market_cap: null, rank: null };
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        // Fetch historical data
        const historicalResponse = await fetch(
          `https://sentimentx-backend.vercel.app/api/altcoin-season-chart?coinId=${coin.id}`
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

        const formattedData = historicalData.prices.map((priceData) => ({
          date: new Date(priceData[0]).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          }),
          price: priceData[1],
          fullDate: new Date(priceData[0]),
        }));
        setChartData(formattedData);

        // Fetch market cap and rank
        const { market_cap, rank } = await fetchMarketData(coin.id);
        setMarketCap(market_cap);
        setRank(rank);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [coin.id]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  const prices = chartData.map((data) => parseFloat(data.price));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;
  const margin = priceRange * 0.1;
  const yDomain = [Math.max(0, minPrice - margin), maxPrice + margin];
  const currentPrice = prices[prices.length - 1];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`${
          isExpanded ? "w-full max-w-3xl" : "w-96"
        } bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col`}
      >
        <div className="p-6 pb-0 flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <img
              src={coin.image}
              alt={coin.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                {coin.name}
                <span className="ml-2 text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
                  #{rank || "--"}
                </span>
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

        {marketCap !== null && (
          <div className="px-6 pt-3 pb-2 flex flex-wrap gap-4">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">
                Market Cap:
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatMarketCap(marketCap)}
              </span>
            </div>
          </div>
        )}

        <div className="flex-1 p-4 pt-2">
          <ResponsiveContainer width="100%" height={isExpanded ? 400 : 250}>
            <LineChart data={chartData}>
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
              <Line
                type="monotone"
                dataKey="price"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 6,
                  stroke: "#fff",
                  strokeWidth: 2,
                  fill: "#3b82f6",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="px-6 pb-4 pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Updated: {new Date().toLocaleTimeString()}</span>
            <span>Source: SentimentX API</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AltcoinChart;
