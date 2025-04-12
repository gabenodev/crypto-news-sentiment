import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import {
  movingAverage,
  calculateMinPrice,
  calculateMaxPrice,
  calculateAveragePrice,
} from "../Indicators/MAindicators";
import { calculateRSI } from "../Indicators/RSIindicator"; // Import the RSI function

const maColors = {
  ma5: "#1890ff",
  ma8: "#722ed1",
  ma13: "#13c2c2",
  ma50: "#fa8c16",
  ma100: "#f5222d",
  ma200: "#52c41a",
};

function PriceChart({ coinId }) {
  const [priceData, setPriceData] = useState([]);
  const [rsiData, setRsiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(1);
  const [movingAverages, setMovingAverages] = useState({
    ma5: false,
    ma8: false,
    ma13: false,
    ma50: false,
    ma100: false,
    ma200: false,
  });
  const [referenceLines, setReferenceLines] = useState({
    min: false,
    max: false,
    avg: false,
  });

  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        const response = await fetch(
          `https://sentimentx-backend.vercel.app/api/altcoin-season-chart?coinId=${coinId}&days=${days}`
        );
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();

        if (data && Array.isArray(data.prices)) {
          const priceChartData = data.prices.map((item) => ({
            time: new Date(item[0]).toLocaleString(),
            price: item[1],
          }));
          setPriceData(priceChartData);

          // Calculăm RSI folosind funcția din RSIindicator.js
          const prices = data.prices.map((item) => item[1]);
          const rsiValues = calculateRSI(prices);
          const rsiChartData = priceChartData
            .slice(14) // Ignorăm primele 14 puncte (perioada RSI)
            .map((item, index) => ({
              ...item,
              rsi: rsiValues[index],
            }));
          setRsiData(rsiChartData);
        } else {
          throw new Error("Data is not in expected format");
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchPriceData();
  }, [coinId, days]);

  if (loading) return <div>Loading...</div>;

  const minPrice = calculateMinPrice(priceData);
  const maxPrice = calculateMaxPrice(priceData);
  const avgPrice = calculateAveragePrice(priceData);

  const buffer = (maxPrice - minPrice) * 0.05;
  const yDomain = [minPrice - buffer, maxPrice + buffer];

  const dataWithMAs = movingAverage(priceData, 5, "ma5");
  const dataWithMAs2 = movingAverage(dataWithMAs, 8, "ma8");
  const dataWithMAs3 = movingAverage(dataWithMAs2, 13, "ma13");
  const dataWithMAs4 = movingAverage(dataWithMAs3, 50, "ma50");
  const dataWithMAs5 = movingAverage(dataWithMAs4, 100, "ma100");
  const dataWithMAs6 = movingAverage(dataWithMAs5, 200, "ma200");

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 rounded-lg shadow-lg">
          <p className="text-sm text-white">
            {days < 7
              ? `Time: ${new Date(label).toLocaleString()}`
              : `Date: ${new Date(label).toLocaleDateString()}`}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${
                entry.value >= 1
                  ? entry.value.toFixed(2) // 2 zecimale pentru valori >= 1
                  : entry.value.toFixed(8) // 8 zecimale pentru valori < 1
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w mx-auto p-4 md:p-6">
      {/* Glow container with improved animation */}
      <div className="relative">
        {/* Enhanced glow effect */}
        <div className="absolute -inset-3 -z-10 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-400/40 via-purple-500/40 to-indigo-500/40 rounded-2xl blur-xl opacity-30 dark:opacity-40 animate-pulse-slow"></div>
        </div>

        {/* Main container with smoother motion */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl border border-white/30 dark:border-gray-700/50 shadow-xl overflow-hidden">
            {/* Header with title */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-200/50 dark:border-gray-700/50">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Crypto Price Analytics
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Interactive chart with technical indicators
                </p>
              </div>
            </div>

            {/* Control Panel */}
            <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Moving Averages - Enhanced card */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18v4H3V4z"
                        />
                      </svg>
                      MOVING AVERAGES
                    </h3>
                    <button
                      onClick={() =>
                        setMovingAverages(
                          Object.fromEntries(
                            Object.keys(movingAverages).map((key) => [
                              key,
                              false,
                            ])
                          )
                        )
                      }
                      className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(movingAverages).map(([key, value]) => (
                      <button
                        key={key}
                        onClick={() =>
                          setMovingAverages({
                            ...movingAverages,
                            [key]: !value,
                          })
                        }
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
                          value
                            ? `text-white shadow-md`
                            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        } hover:shadow-md hover:scale-[1.03] focus:outline-none`}
                        style={value ? { backgroundColor: maColors[key] } : {}}
                      >
                        {key.toUpperCase()}
                        {value && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reference Lines - Enhanced card */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                      REFERENCE LINES
                    </h3>
                    <button
                      onClick={() =>
                        setReferenceLines({
                          min: false,
                          max: false,
                          avg: false,
                        })
                      }
                      className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["min", "max", "avg"].map((item) => (
                      <button
                        key={item}
                        onClick={() =>
                          setReferenceLines({
                            ...referenceLines,
                            [item]: !referenceLines[item],
                          })
                        }
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
                          referenceLines[item]
                            ? item === "min"
                              ? "bg-green-500 text-white shadow-md"
                              : item === "max"
                              ? "bg-red-500 text-white shadow-md"
                              : "bg-orange-500 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        } hover:shadow-md hover:scale-[1.03] focus:outline-none`}
                      >
                        {item.toUpperCase()}
                        {referenceLines[item] && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Period Selector - Enhanced */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    TIME PERIOD
                  </h3>
                  <div className="relative">
                    <select
                      value={days}
                      onChange={(e) => setDays(Number(e.target.value))}
                      className="appearance-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white pl-3 pr-8 py-2 rounded-md w-full text-sm border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all shadow-sm"
                    >
                      <option value={1}>1 Day</option>
                      <option value={7}>7 Days</option>
                      <option value={30}>30 Days</option>
                      <option value={90}>90 Days</option>
                      <option value={365}>1 Year</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Price Summary - New Component */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 11V9a2 2 0 00-2-2m2 4v4a2 2 0 104 0v-1m-4-3H9m2 0h4m6 1a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    PRICE SUMMARY
                  </h3>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex flex-col items-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                      <span className="text-gray-500 dark:text-gray-400">
                        Min
                      </span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        ${minPrice.toFixed(6)}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                      <span className="text-gray-500 dark:text-gray-400">
                        Avg
                      </span>
                      <span className="font-semibold text-orange-600 dark:text-orange-400">
                        ${avgPrice.toFixed(6)}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                      <span className="text-gray-500 dark:text-gray-400">
                        Max
                      </span>
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        ${maxPrice.toFixed(6)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Chart with improved styling */}
            <div className="p-4 md:p-6">
              <div className="mb-6 bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Price Chart
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400">
                      <span className="w-2 h-2 rounded-full bg-teal-500 mr-1"></span>
                      Current: $
                      {priceData[priceData.length - 1]?.price.toFixed(6) ||
                        "0.00"}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                      {days === 1
                        ? "24h"
                        : days === 7
                        ? "7d"
                        : days === 30
                        ? "30d"
                        : days === 90
                        ? "90d"
                        : days === 365
                        ? "1y"
                        : "All"}
                    </span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={500}>
                  <LineChart
                    data={dataWithMAs6}
                    margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
                  >
                    <defs>
                      <linearGradient
                        id="priceGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#23d996"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#23d996"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#eee"
                      strokeOpacity={0.3}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="time"
                      tick={{ fill: "#6b7280", fontSize: 11 }}
                      tickFormatter={(time) =>
                        days < 7
                          ? new Date(time).toLocaleTimeString()
                          : new Date(time).toLocaleDateString()
                      }
                      interval={Math.floor(priceData.length / 5)}
                    />
                    <YAxis
                      tick={{ fill: "#6b7280", fontSize: 11 }}
                      domain={yDomain}
                      tickFormatter={(price) => {
                        if (price >= 1) return `$${price.toFixed(2)}`;
                        return `$${price.toFixed(6)}`;
                      }}
                      tickCount={8}
                      width={80}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      contentStyle={{
                        backgroundColor: "rgba(17, 24, 39, 0.95)",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                        backdropFilter: "blur(4px)",
                        boxShadow:
                          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                        padding: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#23d996"
                      fill="url(#priceGradient)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, fill: "#23d996", strokeWidth: 2 }}
                      animationDuration={800}
                      isAnimationActive={true}
                    />
                    {Object.entries(movingAverages).map(
                      ([key, value]) =>
                        value && (
                          <Line
                            key={key}
                            type="monotone"
                            dataKey={key}
                            stroke={maColors[key]}
                            strokeDasharray="5 5"
                            strokeWidth={2}
                            dot={false}
                            animationDuration={800}
                            isAnimationActive={true}
                            name={key.toUpperCase()}
                          />
                        )
                    )}
                    {referenceLines.min && (
                      <ReferenceLine
                        y={minPrice}
                        stroke="#10b981"
                        strokeDasharray="3 3"
                        strokeOpacity={0.7}
                        label={{
                          value: `Min: $${minPrice.toFixed(6)}`,
                          position: "insideBottomRight",
                          fill: "#10b981",
                          fontSize: 11,
                          fontWeight: "bold",
                          offset: 5,
                        }}
                      />
                    )}
                    {referenceLines.max && (
                      <ReferenceLine
                        y={maxPrice}
                        stroke="#ef4444"
                        strokeDasharray="3 3"
                        strokeOpacity={0.7}
                        label={{
                          value: `Max: $${maxPrice.toFixed(6)}`,
                          position: "insideTopRight",
                          fill: "#ef4444",
                          fontSize: 11,
                          fontWeight: "bold",
                          offset: 5,
                        }}
                      />
                    )}
                    {referenceLines.avg && (
                      <ReferenceLine
                        y={avgPrice}
                        stroke="#f59e0b"
                        strokeDasharray="3 3"
                        strokeOpacity={0.7}
                        label={{
                          value: `Avg: $${avgPrice.toFixed(6)}`,
                          position: "insideRight",
                          fill: "#f59e0b",
                          fontSize: 11,
                          fontWeight: "bold",
                          offset: 5,
                        }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* RSI Chart with improved styling */}
              <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Relative Strength Index (RSI)
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                      Current:{" "}
                      {Math.round(rsiData[rsiData.length - 1]?.rsi) || 0}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                        Overbought ≥70
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        Oversold ≤30
                      </span>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={rsiData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#2D3748"
                      strokeOpacity={0.1}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="time"
                      tick={{ fill: "#6b7280", fontSize: 10 }}
                      tickFormatter={(time) =>
                        days < 7
                          ? new Date(time).toLocaleTimeString()
                          : new Date(time).toLocaleDateString()
                      }
                      interval={Math.floor(rsiData.length / 5)}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: "#6b7280", fontSize: 10 }}
                      ticks={[0, 30, 70, 100]}
                      width={40}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(17, 24, 39, 0.95)",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                        backdropFilter: "blur(4px)",
                        boxShadow:
                          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                        padding: "12px",
                      }}
                      formatter={(value) => [Math.round(value), "RSI"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="rsi"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 5, fill: "#8b5cf6", strokeWidth: 2 }}
                      animationDuration={800}
                      isAnimationActive={true}
                    />
                    <ReferenceLine
                      y={30}
                      stroke="#10b981"
                      strokeDasharray="3 3"
                      strokeOpacity={0.6}
                      label={{
                        value: "Oversold",
                        position: "insideBottomLeft",
                        fill: "#10b981",
                        fontSize: 10,
                        offset: 5,
                      }}
                    />
                    <ReferenceLine
                      y={70}
                      stroke="#ef4444"
                      strokeDasharray="3 3"
                      strokeOpacity={0.6}
                      label={{
                        value: "Overbought",
                        position: "insideTopLeft",
                        fill: "#ef4444",
                        fontSize: 10,
                        offset: 5,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Simplified footer */}
            <div className="px-6 py-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default PriceChart;
