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
  const [days, setDays] = useState(30);
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
    <div className="w-full mx-auto p-6">
      {/* Glow container */}
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute -inset-3 -z-10 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-400/40 to-purple-500/40 rounded-2xl blur-xl opacity-30 dark:opacity-40 animate-pulse-slow"></div>
        </div>

        {/* Main container */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-white/30 dark:border-gray-700/50 shadow-xl overflow-hidden p-6">
            {/* Control Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Moving Averages */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 p-4 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                  MOVING AVERAGES
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(movingAverages).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() =>
                        setMovingAverages({ ...movingAverages, [key]: !value })
                      }
                      className={`px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
                        value
                          ? `text-white shadow-md`
                          : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                      } hover:shadow-md hover:scale-[1.03] focus:outline-none`}
                      style={value ? { backgroundColor: maColors[key] } : {}}
                    >
                      {key.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reference Lines */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 p-4 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                  REFERENCE LINES
                </h3>
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
                      className={`px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
                        referenceLines[item]
                          ? item === "min"
                            ? "bg-green-500 text-white shadow-md"
                            : item === "max"
                            ? "bg-red-500 text-white shadow-md"
                            : "bg-orange-500 text-white shadow-md"
                          : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                      } hover:shadow-md hover:scale-[1.03] focus:outline-none`}
                    >
                      {item.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Period Selector */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 p-4 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                  TIME PERIOD
                </h3>
                <div className="relative">
                  <select
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="appearance-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white pl-4 pr-8 py-2 rounded-md w-full text-sm border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                  >
                    <option value={1}>1 Day</option>
                    <option value={7}>7 Days</option>
                    <option value={30}>30 Days</option>
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
            </div>

            {/* Main Chart */}
            <div className="mb-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-900/30 p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              <ResponsiveContainer width="100%" height={600}>
                <LineChart
                  data={dataWithMAs6}
                  margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                >
                  <defs>
                    <linearGradient
                      id="priceGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#23d996" stopOpacity={0.8} />
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
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    tickFormatter={(time) =>
                      days < 7
                        ? new Date(time).toLocaleString()
                        : new Date(time).toLocaleDateString()
                    }
                    interval={Math.floor(priceData.length / 5)}
                  />
                  <YAxis
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    domain={yDomain}
                    tickFormatter={(price) => {
                      if (price >= 1) return `$${price.toFixed(2)}`;
                      return `$${price.toFixed(6)}`;
                    }}
                    tickCount={8}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    contentStyle={{
                      backgroundColor: "rgba(17, 24, 39, 0.9)",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      backdropFilter: "blur(4px)",
                      boxShadow:
                        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#23d996"
                    fill="url(#priceGradient)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 8, fill: "#23d996" }}
                    animationDuration={1000}
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
                          animationDuration={1000}
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
                      strokeOpacity={0.8}
                      label={{
                        value: `Min: $${minPrice.toFixed(6)}`,
                        position: "insideBottomRight",
                        fill: "#10b981",
                        fontSize: 12,
                        fontWeight: "bold",
                        offset: 10,
                      }}
                    />
                  )}
                  {referenceLines.max && (
                    <ReferenceLine
                      y={maxPrice}
                      stroke="#ef4444"
                      strokeDasharray="3 3"
                      strokeOpacity={0.8}
                      label={{
                        value: `Max: $${maxPrice.toFixed(6)}`,
                        position: "insideTopRight",
                        fill: "#ef4444",
                        fontSize: 12,
                        fontWeight: "bold",
                        offset: 10,
                      }}
                    />
                  )}
                  {referenceLines.avg && (
                    <ReferenceLine
                      y={avgPrice}
                      stroke="#f59e0b"
                      strokeDasharray="3 3"
                      strokeOpacity={0.8}
                      label={{
                        value: `Avg: $${avgPrice.toFixed(6)}`,
                        position: "insideRight",
                        fill: "#f59e0b",
                        fontSize: 12,
                        fontWeight: "bold",
                        offset: 10,
                      }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* RSI Chart */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-900/30 p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Relative Strength Index (RSI)
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-xs px-2 py-1 rounded bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                    Oversold ≤30
                  </span>
                  <span className="text-xs px-2 py-1 rounded bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                    Overbought ≥70
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={rsiData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#2D3748"
                    strokeOpacity={0.3}
                  />
                  <XAxis dataKey="time" tick={false} />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "#6b7280", fontSize: 10 }}
                    ticks={[0, 30, 70, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(17, 24, 39, 0.9)",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      backdropFilter: "blur(4px)",
                      boxShadow:
                        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    }}
                    formatter={(value) => [Math.round(value), "RSI"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="rsi"
                    stroke="#8b5cf6"
                    fill="url(#rsiGradient)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, fill: "#8b5cf6" }}
                    animationDuration={1000}
                    isAnimationActive={true}
                  >
                    <defs>
                      <linearGradient
                        id="rsiGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#8b5cf6"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#8b5cf6"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                  </Line>
                  <ReferenceLine
                    y={30}
                    stroke="#f59e0b"
                    strokeDasharray="3 3"
                    strokeOpacity={0.7}
                  />
                  <ReferenceLine
                    y={70}
                    stroke="#f59e0b"
                    strokeDasharray="3 3"
                    strokeOpacity={0.7}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default PriceChart;
