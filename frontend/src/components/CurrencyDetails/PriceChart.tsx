"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
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
  Legend,
} from "recharts";
import {
  movingAverage,
  calculateMinPrice,
  calculateMaxPrice,
  calculateAveragePrice,
} from "../Indicators/MAindicators";
import { calculateRSI } from "../Indicators/RSIindicator";
import { Tab } from "@headlessui/react";
import {
  FiClock,
  FiTrendingUp,
  FiActivity,
  FiBarChart2,
  FiRefreshCw,
  FiInfo,
  FiMaximize2,
  FiMinimize2,
} from "react-icons/fi";
import type { ChartDataPoint } from "../../types";

const maColors = {
  ma5: "#3b82f6", // Blue
  ma8: "#8b5cf6", // Purple
  ma13: "#06b6d4", // Cyan
  ma50: "#f59e0b", // Amber
  ma100: "#ef4444", // Red
  ma200: "#10b981", // Emerald
};

interface PriceChartProps {
  coinId: string;
}

function PriceChart({ coinId }: PriceChartProps): JSX.Element {
  const [priceData, setPriceData] = useState<ChartDataPoint[]>([]);
  const [rsiData, setRsiData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState<number | string>(1);
  const [movingAverages, setMovingAverages] = useState<{
    ma5: boolean;
    ma8: boolean;
    ma13: boolean;
    ma50: boolean;
    ma100: boolean;
    ma200: boolean;
  }>({
    ma5: false,
    ma8: false,
    ma13: false,
    ma50: false,
    ma100: false,
    ma200: false,
  });
  const [referenceLines, setReferenceLines] = useState<{
    min: boolean;
    max: boolean;
    avg: boolean;
  }>({
    min: false,
    max: false,
    avg: false,
  });
  const [activeTab, setActiveTab] = useState<number>(0);
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchPriceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `https://sentimentx-backend.vercel.app/api/altcoin-season-chart?coinId=${coinId}&days=${days}`
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();

      if (data && Array.isArray(data.prices)) {
        const priceChartData = data.prices.map((item: [number, number]) => ({
          time: new Date(item[0]).toLocaleString(),
          price: item[1],
          timestamp: item[0],
        }));
        setPriceData(priceChartData);

        // Calculate RSI using the function from RSIindicator.js
        const prices = data.prices.map((item: [number, number]) => item[1]);
        const rsiValues = calculateRSI(prices);
        const rsiChartData = priceChartData
          .slice(14) // Ignore first 14 points (RSI period)
          .map((item: ChartDataPoint, index: number) => ({
            ...item,
            rsi: rsiValues[index],
          }));
        setRsiData(rsiChartData);
        setLastUpdated(new Date());
      } else {
        throw new Error("Data is not in expected format");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError((error as Error).message || "Failed to load chart data");
    } finally {
      setLoading(false);
    }
  }, [coinId, days]);

  useEffect(() => {
    fetchPriceData();
  }, [fetchPriceData]);

  const toggleMovingAverage = (key: keyof typeof movingAverages) => {
    setMovingAverages((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleReferenceLine = (key: keyof typeof referenceLines) => {
    setReferenceLines((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const resetMovingAverages = () => {
    setMovingAverages({
      ma5: false,
      ma8: false,
      ma13: false,
      ma50: false,
      ma100: false,
      ma200: false,
    });
  };

  const resetReferenceLines = () => {
    setReferenceLines({
      min: false,
      max: false,
      avg: false,
    });
  };

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  if (loading) {
    return (
      <div
        className={`w-full ${
          fullscreen
            ? "fixed inset-0 z-50 bg-white dark:bg-gray-900 p-6"
            : "max-w-7xl mx-auto p-4"
        }`}
      >
        <div className="flex flex-col items-center justify-center h-80 bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
          <div className="w-12 h-12 border-4 border-t-teal-500 border-teal-200 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
            Loading chart data...
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            Fetching the latest price information
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`w-full ${
          fullscreen
            ? "fixed inset-0 z-50 bg-white dark:bg-gray-900 p-6"
            : "max-w-7xl mx-auto p-4"
        }`}
      >
        <div className="flex flex-col items-center justify-center h-80 bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <FiInfo className="text-red-500 text-3xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Error Loading Chart
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
            {error}
          </p>
          <button
            onClick={fetchPriceData}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors flex items-center"
          >
            <FiRefreshCw className="mr-2" /> Retry
          </button>
        </div>
      </div>
    );
  }

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

  const formatPrice = (price: number): string => {
    if (price < 0.001) {
      return price.toFixed(6);
    }
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  };

  interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            {typeof days === "number" && days < 7
              ? `Time: ${new Date(label ?? "").toLocaleString()}`
              : `Date: ${new Date(label ?? "").toLocaleDateString()}`}
          </p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between mb-1">
              <span
                className="text-sm font-medium"
                style={{ color: entry.color }}
              >
                {entry.name}:
              </span>
              <span
                className="text-sm font-bold ml-4"
                style={{ color: entry.color }}
              >
                {entry.name === "Price" ? "$" : ""}
                {formatPrice(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const timeframeOptions = [
    { value: 1, label: "24h" },
    { value: 7, label: "7d" },
    { value: 30, label: "30d" },
    { value: 90, label: "90d" },
    { value: 365, label: "1y" },
    { value: "max", label: "All" },
  ];

  const tabItems = [
    { name: "Price", icon: <FiTrendingUp className="mr-2" /> },
    { name: "RSI", icon: <FiActivity className="mr-2" /> },
    { name: "Settings", icon: <FiBarChart2 className="mr-2" /> },
  ];

  const containerClass = fullscreen
    ? "fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-auto"
    : "w-full max-w-7xl mx-auto p-4";

  return (
    <div className={`${containerClass} ${fullscreen ? "p-4 md:p-6" : ""}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
              Price Chart
              <span className="ml-2 text-sm font-medium bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded-full">
                {timeframeOptions.find((option) => option.value === days)
                  ?.label || "24h"}
              </span>
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center">
              <FiClock className="mr-1" size={14} />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Timeframe Selector */}
            <div className="relative">
              <select
                value={days.toString()}
                onChange={(e) =>
                  setDays(Number(e.target.value) || e.target.value)
                }
                className="appearance-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white pl-3 pr-8 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all shadow-sm"
              >
                {timeframeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
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

            {/* Refresh Button */}
            <button
              onClick={fetchPriceData}
              className="p-2 text-gray-500 hover:text-teal-500 dark:text-gray-400 dark:hover:text-teal-400 bg-gray-100 dark:bg-gray-700 rounded-lg transition-colors"
              aria-label="Refresh data"
            >
              <FiRefreshCw size={18} />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-500 hover:text-teal-500 dark:text-gray-400 dark:hover:text-teal-400 bg-gray-100 dark:bg-gray-700 rounded-lg transition-colors"
              aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {fullscreen ? (
                <FiMinimize2 size={18} />
              ) : (
                <FiMaximize2 size={18} />
              )}
            </button>

            {/* Back to Details Button - Only visible in fullscreen mode */}
            {fullscreen && (
              <button
                onClick={() => {
                  window.scrollTo(0, 0);
                  setFullscreen(false);
                }}
                className="ml-2 px-3 py-2 text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 rounded-lg transition-colors flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Details
              </button>
            )}
          </div>
        </div>

        {/* Current Price Summary */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center">
              <div className="mr-4">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Current Price
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${formatPrice(priceData[priceData.length - 1]?.price || 0)}
                </div>
              </div>

              <div className="flex space-x-4">
                <div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    24h Low
                  </div>
                  <div className="text-sm font-semibold text-red-500">
                    ${formatPrice(minPrice)}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    24h High
                  </div>
                  <div className="text-sm font-semibold text-green-500">
                    ${formatPrice(maxPrice)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {Object.entries(movingAverages)
                .filter(([_, value]) => value)
                .map(([key]) => (
                  <div
                    key={key}
                    className="px-2 py-1 text-xs font-medium rounded-full flex items-center"
                    style={{
                      backgroundColor: `${
                        maColors[key as keyof typeof maColors]
                      }20`,
                      color: maColors[key as keyof typeof maColors],
                    }}
                  >
                    {key.toUpperCase()}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
          <Tab.List className="flex space-x-1 px-6 pt-4 bg-white dark:bg-gray-800">
            {tabItems.map((item, index) => (
              <Tab
                key={index}
                className={({ selected }) =>
                  `px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500
                 ${
                   selected
                     ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                     : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                 }
                 `
                }
              >
                <div className="flex items-center">
                  {item.icon}
                  {item.name}
                </div>
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels>
            {/* Price Chart Panel */}
            <Tab.Panel>
              <div className="p-6 pt-4">
                <div className="h-[400px] md:h-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={dataWithMAs6}
                      margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
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
                            stopColor="#10b981"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
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
                          typeof days === "number" && days < 7
                            ? new Date(time).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : new Date(time).toLocaleDateString()
                        }
                        interval={Math.floor(priceData.length / 5)}
                        axisLine={{ stroke: "#e5e7eb", strokeOpacity: 0.3 }}
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
                        axisLine={{ stroke: "#e5e7eb", strokeOpacity: 0.3 }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ paddingBottom: "10px" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{
                          r: 6,
                          fill: "#10b981",
                          strokeWidth: 2,
                          stroke: "#fff",
                        }}
                        name="Price"
                      />
                      {Object.entries(movingAverages).map(
                        ([key, value]) =>
                          value && (
                            <Line
                              key={key}
                              type="monotone"
                              dataKey={key}
                              stroke={maColors[key as keyof typeof maColors]}
                              strokeWidth={1.5}
                              dot={false}
                              activeDot={false}
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
                            value: `Min: $${formatPrice(minPrice)}`,
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
                            value: `Max: $${formatPrice(maxPrice)}`,
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
                            value: `Avg: $${formatPrice(avgPrice)}`,
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
              </div>
            </Tab.Panel>

            {/* RSI Chart Panel */}
            <Tab.Panel>
              <div className="p-6 pt-4">
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Relative Strength Index (RSI)
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                        Overbought ≥70
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        Oversold ≤30
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Current RSI:{" "}
                    <span className="font-medium">
                      {Math.round(rsiData[rsiData.length - 1]?.rsi || 0)}
                    </span>
                  </p>
                </div>

                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={rsiData}
                      margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                    >
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
                          typeof days === "number" && days < 7
                            ? new Date(time).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : new Date(time).toLocaleDateString()
                        }
                        interval={Math.floor(rsiData.length / 5)}
                        axisLine={{ stroke: "#e5e7eb", strokeOpacity: 0.3 }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fill: "#6b7280", fontSize: 11 }}
                        ticks={[0, 30, 50, 70, 100]}
                        width={40}
                        axisLine={{ stroke: "#e5e7eb", strokeOpacity: 0.3 }}
                      />
                      <Tooltip
                        formatter={(value) => [
                          `${Math.round(value as number)}`,
                          "RSI",
                        ]}
                        content={<CustomTooltip />}
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
                        y={50}
                        stroke="#9ca3af"
                        strokeDasharray="3 3"
                        strokeOpacity={0.4}
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
                      <Line
                        type="monotone"
                        dataKey="rsi"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{
                          r: 5,
                          fill: "#8b5cf6",
                          strokeWidth: 2,
                          stroke: "#fff",
                        }}
                        name="RSI"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-6 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Understanding RSI
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    The Relative Strength Index (RSI) is a momentum oscillator
                    that measures the speed and change of price movements. RSI
                    oscillates between 0 and 100. Traditionally, RSI is
                    considered overbought when above 70 and oversold when below
                    30. Signals can also be generated by looking for
                    divergences, failure swings, and centerline crossovers.
                  </p>
                </div>
              </div>
            </Tab.Panel>

            {/* Settings Panel */}
            <Tab.Panel>
              <div className="p-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Moving Averages */}
                  <div className="bg-white dark:bg-gray-700/30 p-5 rounded-xl border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                        <FiTrendingUp className="mr-2" />
                        Moving Averages
                      </h3>
                      <button
                        onClick={resetMovingAverages}
                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
                      >
                        Reset All
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Object.entries(movingAverages).map(([key, value]) => (
                        <button
                          key={key}
                          onClick={() =>
                            toggleMovingAverage(
                              key as keyof typeof movingAverages
                            )
                          }
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                            value
                              ? "text-white shadow-md"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                          } hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500`}
                          style={
                            value
                              ? {
                                  backgroundColor:
                                    maColors[key as keyof typeof maColors],
                                }
                              : {}
                          }
                        >
                          {key.toUpperCase()}
                          {value && (
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
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                      <p>
                        Moving averages help identify trends by smoothing out
                        price fluctuations over specific time periods.
                      </p>
                    </div>
                  </div>

                  {/* Reference Lines */}
                  <div className="bg-white dark:bg-gray-700/30 p-5 rounded-xl border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                        <FiBarChart2 className="mr-2" />
                        Reference Lines
                      </h3>
                      <button
                        onClick={resetReferenceLines}
                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
                      >
                        Reset All
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => toggleReferenceLine("min")}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                          referenceLines.min
                            ? "bg-green-500 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        } hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500`}
                      >
                        MIN
                        {referenceLines.min && (
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
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => toggleReferenceLine("avg")}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                          referenceLines.avg
                            ? "bg-amber-500 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        } hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500`}
                      >
                        AVG
                        {referenceLines.avg && (
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
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => toggleReferenceLine("max")}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                          referenceLines.max
                            ? "bg-red-500 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        } hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500`}
                      >
                        MAX
                        {referenceLines.max && (
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
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                      <p>
                        Reference lines help visualize important price levels
                        like minimum, maximum, and average values.
                      </p>
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div className="bg-white dark:bg-gray-700/30 p-5 rounded-xl border border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                      <FiInfo className="mr-2" />
                      Price Summary
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Minimum
                        </div>
                        <div className="text-base font-bold text-green-600 dark:text-green-400">
                          ${formatPrice(minPrice)}
                        </div>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Average
                        </div>
                        <div className="text-base font-bold text-amber-600 dark:text-amber-400">
                          ${formatPrice(avgPrice)}
                        </div>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Maximum
                        </div>
                        <div className="text-base font-bold text-red-600 dark:text-red-400">
                          ${formatPrice(maxPrice)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                      <p>
                        Summary of key price points during the selected time
                        period.
                      </p>
                    </div>
                  </div>

                  {/* Chart Information */}
                  <div className="bg-white dark:bg-gray-700/30 p-5 rounded-xl border border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                      <FiInfo className="mr-2" />
                      Chart Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Time Period:
                        </span>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {timeframeOptions.find(
                            (option) => option.value === days
                          )?.label || "24h"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Data Points:
                        </span>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {priceData.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          First Data Point:
                        </span>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {priceData[0]?.time
                            ? new Date(priceData[0].time).toLocaleString()
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Last Data Point:
                        </span>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {priceData[priceData.length - 1]?.time
                            ? new Date(
                                priceData[priceData.length - 1].time
                              ).toLocaleString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
          <div>Data source: SentimentX API</div>
          <div>Chart rendered with Recharts</div>
        </div>
      </motion.div>
    </div>
  );
}

export default PriceChart;
