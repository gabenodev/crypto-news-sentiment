"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FiDollarSign,
  FiActivity,
  FiClock,
  FiTrendingUp,
  FiAlertCircle,
  FiPieChart,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiInfo,
  FiTrendingDown,
  FiZap,
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts";
import { generateCryptoPlaceholder } from "../../../utils/placeholderGenerator";
import WalletLoadingState from "../components/WalletLoadingState";
import {
  CHAIN_NATIVE_TOKENS,
  CHAIN_NATIVE_TOKEN_NAMES,
} from "../../../utils/API/etherScanAPI";
import { COLORS } from "./utils/constants";
import {
  formatCurrency,
  formatDate,
  getTotalValueFontSize,
} from "./utils/formatters";
import {
  CustomTooltip,
  TransactionActivityTooltip,
  renderCustomizedLabel,
} from "./components/CustomTooltip";
import { usePortfolioData } from "./hooks/usePortfolioData";
import type { WalletOverviewProps } from "./types";

const WalletOverview: React.FC<WalletOverviewProps> = ({
  address,
  onLoadingChange,
  onStatsUpdate,
  holdings = [],
  transactions = [],
  ethBalance = 0,
  ethPrice = 3500,
  isLoading = false,
  error = null,
  loadingStatus = "Initializing...",
  refreshData,
  chainId = 1,
}) => {
  const {
    loading,
    stats,
    processedHoldings,
    activeTimeRange,
    setActiveTimeRange,
    showAllTokens,
    setShowAllTokens,
    assetDistributionData,
    transactionActivityData,
    gasUsageData,
    valueOverTimeData,
  } = usePortfolioData(
    address,
    holdings,
    transactions,
    ethBalance,
    ethPrice,
    isLoading,
    chainId,
    onLoadingChange,
    onStatsUpdate
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <WalletLoadingState status={loadingStatus} />
      </div>
    );
  }

  return (
    <div>
      {/* Time range selector */}
      <div className="flex justify-between mb-6">
        <div className="inline-flex bg-gray-100 dark:bg-dark-tertiary rounded-lg p-1">
          {["7d", "30d", "90d", "all"].map((range) => (
            <button
              key={range}
              onClick={() => setActiveTimeRange(range as any)}
              className={`px-3 py-1 text-sm rounded-md ${
                activeTimeRange === range
                  ? "bg-teal-500 text-white"
                  : "text-gray-600 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-tertiary/80"
              }`}
            >
              {range === "all" ? "All" : range}
            </button>
          ))}
        </div>
      </div>

      {/* Main statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-dark-secondary rounded-xl p-6 shadow-lg border border-gray-100 dark:border-dark-tertiary hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center mb-2">
            <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg mr-3">
              <FiDollarSign className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-dark-text-primary">
              Portfolio Value
            </h3>
          </div>
          <p
            className={`${getTotalValueFontSize(
              stats.totalValue
            )} font-bold text-gray-900 dark:text-dark-text-primary break-all`}
          >
            {formatCurrency(stats.totalValue)}
          </p>
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-gray-500 dark:text-dark-text-secondary">
              {stats.ethBalance.toFixed(4)} ETH
            </span>
            <span className="text-teal-600 dark:text-teal-400">
              +{stats.tokenCount} tokens
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white dark:bg-dark-secondary rounded-xl p-6 shadow-lg border border-gray-100 dark:border-dark-tertiary hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
              <FiActivity className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-dark-text-primary">
              Transactions
            </h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
            {stats.transactionCount}
          </p>
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-green-600 dark:text-green-400 flex items-center">
              <FiArrowDownLeft className="mr-1" /> In:{" "}
              {formatCurrency(stats.incomingValue)}
            </span>
            <span className="text-red-600 dark:text-red-400 flex items-center">
              <FiArrowUpRight className="mr-1" /> Out:{" "}
              {formatCurrency(stats.outgoingValue)}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white dark:bg-dark-secondary rounded-xl p-6 shadow-lg border border-gray-100 dark:border-dark-tertiary hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
              <FiTrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-dark-text-primary">
              {CHAIN_NATIVE_TOKEN_NAMES[chainId]}
            </h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
            {stats.ethBalance.toFixed(4)} {CHAIN_NATIVE_TOKENS[chainId]}
          </p>
          <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-2">
            Value: {formatCurrency(stats.ethBalance * stats.ethPrice)}
            {stats.ethPrice > 0 && (
              <span className="ml-1 text-xs">
                (@${stats.ethPrice.toLocaleString()})
              </span>
            )}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white dark:bg-dark-secondary rounded-xl p-6 shadow-lg border border-gray-100 dark:border-dark-tertiary hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center mb-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg mr-3">
              <FiClock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-dark-text-primary">
              Last Activity
            </h3>
          </div>
          <p className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">
            {formatDate(stats.lastActivity)}
          </p>
          <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-2">
            {stats.transactionCount > 0
              ? `From ${stats.transactionCount} transactions`
              : "No transactions"}
          </p>
        </motion.div>
      </div>

      {/* Portfolio value over time chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="bg-white dark:bg-dark-secondary rounded-xl p-6 shadow-lg border border-gray-100 dark:border-dark-tertiary mb-8"
      >
        <div className="flex items-center mb-4">
          <FiTrendingUp className="h-5 w-5 text-teal-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-800 dark:text-dark-text-primary">
            Portfolio Value Over Time
          </h3>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={valueOverTimeData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fill: "#A0A0A0" }}
                axisLine={{ stroke: "rgba(160, 160, 160, 0.2)" }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis
                tick={{ fill: "#A0A0A0" }}
                axisLine={{ stroke: "rgba(160, 160, 160, 0.2)" }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                domain={["auto", "auto"]}
                scale="linear"
                padding={{ top: 10, bottom: 10 }}
                allowDataOverflow={false}
              />
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(160, 160, 160, 0.2)"
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                name="Portfolio Value"
                stroke="#14b8a6"
                fillOpacity={1}
                fill="url(#colorValue)"
              />
              <ReferenceLine y={0} stroke="rgba(160, 160, 160, 0.2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Asset Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-white dark:bg-dark-secondary rounded-xl p-6 shadow-lg border border-gray-100 dark:border-dark-tertiary"
        >
          <div className="flex items-center mb-4">
            <FiPieChart className="h-5 w-5 text-teal-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-800 dark:text-dark-text-primary">
              Asset Distribution
            </h3>
          </div>

          <div className="h-[300px]">
            {assetDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={renderCustomizedLabel}
                    isAnimationActive={true}
                  >
                    {assetDistributionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  {/* Removed tooltip to disable hover effect */}
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    iconType="circle"
                    iconSize={10}
                    wrapperStyle={{ right: -10, top: 0 }}
                    formatter={(value, entry, index) => {
                      // Adapt text color based on theme
                      return (
                        <span className="text-gray-900 dark:text-white text-xs">
                          {value}
                        </span>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-dark-tertiary rounded-lg">
                <FiAlertCircle className="h-10 w-10 text-dark-text-secondary mb-2" />
                <p className="text-gray-500 dark:text-dark-text-secondary">
                  No asset data available
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Transaction Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="bg-white dark:bg-dark-secondary rounded-xl p-6 shadow-lg border border-gray-100 dark:border-dark-tertiary"
        >
          <div className="flex items-center mb-4">
            <FiActivity className="h-5 w-5 text-green-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-800 dark:text-dark-text-primary">
              Transaction Activity
            </h3>
          </div>

          <div className="h-[300px]">
            {transactionActivityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={transactionActivityData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(160, 160, 160, 0.2)"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#A0A0A0" }}
                    axisLine={{ stroke: "rgba(160, 160, 160, 0.2)" }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis
                    tick={{ fill: "#A0A0A0" }}
                    axisLine={{ stroke: "rgba(160, 160, 160, 0.2)" }}
                  />
                  <RechartsTooltip
                    content={<TransactionActivityTooltip />}
                    cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
                  />
                  <Bar
                    dataKey="count"
                    name="Transactions"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-dark-tertiary rounded-lg">
                <FiAlertCircle className="h-10 w-10 text-dark-text-secondary mb-2" />
                <p className="text-gray-500 dark:text-dark-text-secondary">
                  No transaction data available
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Additional insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="bg-white dark:bg-dark-secondary rounded-xl p-6 shadow-lg border border-gray-100 dark:border-dark-tertiary"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg mr-3">
              <FiInfo className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-dark-text-primary">
              Portfolio Insights
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500 dark:text-dark-text-secondary">
                  Diversification Score
                </span>
                <span className="font-medium text-teal-600 dark:text-teal-400">
                  {Math.min(100, Math.round(stats.tokenCount * 10))}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-dark-tertiary rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-teal-500 to-green-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(stats.tokenCount * 10)
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500 dark:text-dark-text-secondary">
                  ETH Dominance
                </span>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {Math.min(
                    100,
                    Math.round(
                      ((stats.ethBalance * stats.ethPrice) / stats.totalValue) *
                        100
                    )
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-dark-tertiary rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        ((stats.ethBalance * stats.ethPrice) /
                          stats.totalValue) *
                          100
                      )
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500 dark:text-dark-text-secondary">
                  Activity Level
                </span>
                <span className="font-medium text-purple-600 dark:text-purple-400">
                  {stats.transactionCount > 100
                    ? "High"
                    : stats.transactionCount > 20
                    ? "Medium"
                    : "Low"}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-dark-tertiary rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, stats.transactionCount)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          className="bg-white dark:bg-dark-secondary rounded-xl p-6 shadow-lg border border-gray-100 dark:border-dark-tertiary"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
              <FiTrendingDown className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-dark-text-primary">
              Gas Usage
            </h3>
          </div>

          <div className="h-[150px]">
            {gasUsageData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={gasUsageData}
                  margin={{ top: 5, right: 5, left: 15, bottom: 5 }}
                >
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#A0A0A0", fontSize: 10 }}
                    axisLine={{ stroke: "rgba(160, 160, 160, 0.2)" }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis
                    tick={{ fill: "#A0A0A0", fontSize: 10 }}
                    axisLine={{ stroke: "rgba(160, 160, 160, 0.2)" }}
                    tickFormatter={(value) => `${(value * 1000000).toFixed(0)}`}
                    label={{
                      value: "Gwei",
                      angle: -90,
                      position: "insideLeft",
                      dx: -10,
                      fontSize: 12,
                      fill: "#A0A0A0",
                    }}
                    width={40}
                  />
                  <RechartsTooltip
                    content={<CustomTooltip />}
                    formatter={(value: number) => [
                      (value * 1000000).toFixed(6) + " Gwei",
                      "Gas Used",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="gas"
                    name="Gas Used"
                    stroke="#10b981"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                  No gas data available
                </p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.9 }}
          className="bg-white dark:bg-dark-secondary rounded-xl p-6 shadow-lg border border-gray-100 dark:border-dark-tertiary"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg mr-3">
              <FiZap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-dark-text-primary">
              Activity Summary
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-dark-text-secondary">
                Total Transactions
              </span>
              <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                {stats.transactionCount}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-dark-text-secondary">
                Incoming
              </span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {Math.round(
                  (transactions.filter(
                    (tx) => tx.to?.toLowerCase() === address.toLowerCase()
                  ).length /
                    stats.transactionCount) *
                    100
                )}
                %
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-dark-text-secondary">
                Outgoing
              </span>
              <span className="font-medium text-red-600 dark:text-red-400">
                {Math.round(
                  (transactions.filter(
                    (tx) => tx.from?.toLowerCase() === address.toLowerCase()
                  ).length /
                    stats.transactionCount) *
                    100
                )}
                %
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-dark-text-secondary">
                First Transaction
              </span>
              <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                {transactions.length > 0
                  ? new Date(
                      Math.min(...transactions.map((tx) => tx.timestamp * 1000))
                    ).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top tokens section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 1.0 }}
        className="bg-white dark:bg-dark-secondary rounded-xl p-6 shadow-lg border border-gray-100 dark:border-dark-tertiary mb-8"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-dark-text-primary flex items-center">
            <FiDollarSign className="h-5 w-5 mr-2 text-teal-500" />
            {showAllTokens ? "All Tokens" : "Top Tokens"}
          </h3>
          <button
            onClick={() => setShowAllTokens(!showAllTokens)}
            className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-dark-tertiary dark:hover:bg-dark-tertiary/80 text-gray-700 dark:text-dark-text-primary rounded-lg transition-colors"
          >
            {showAllTokens ? "Show Top 5" : "Show All"}
          </button>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
            <span className="flex items-center">
              <FiInfo className="mr-1" size={12} />
              Note: Due to API limitations, not all tokens may be displayed. For
              a complete view, check on
              <a
                href={`https://etherscan.io/address/${address}#tokentxns`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 dark:text-teal-400 hover:underline ml-1"
              >
                Etherscan
              </a>
              .
            </span>
          </div>
        </div>

        {processedHoldings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-tertiary">
              <thead className="bg-gray-50 dark:bg-dark-tertiary">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider"
                  >
                    Token
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider"
                  >
                    Value
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider"
                  >
                    % of Portfolio
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-secondary divide-y divide-gray-200 dark:divide-dark-tertiary">
                {(showAllTokens
                  ? processedHoldings
                  : processedHoldings.slice(0, 5)
                ).map((token, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50 dark:hover:bg-dark-tertiary/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={
                            generateCryptoPlaceholder(token.tokenInfo.symbol) ||
                            "/placeholder.svg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg"
                          }
                          alt={token.tokenInfo.name || "Token"}
                          className="w-8 h-8 rounded-full mr-3 bg-gray-100 dark:bg-dark-tertiary"
                        />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-dark-text-primary">
                            {token.tokenInfo.name || "Unknown Token"}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-dark-text-secondary">
                            {token.tokenInfo.symbol || "???"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                        {token.formattedBalance?.toLocaleString("en-US", {
                          maximumFractionDigits: 6,
                        }) || "0"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                        {token.tokenInfo.price?.rate
                          ? formatCurrency(token.tokenInfo.price.rate)
                          : "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                        {token.value ? formatCurrency(token.value) : "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div
                        className={`text-sm font-medium ${
                          (token.percentage || 0) >= 5
                            ? "text-green-600 dark:text-green-400"
                            : (token.percentage || 0) >= 1
                            ? "text-teal-600 dark:text-teal-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {token.percentage
                          ? token.percentage.toFixed(2) + "%"
                          : "—"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!showAllTokens && processedHoldings.length > 5 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                  {processedHoldings.length - 5} more tokens not shown. Click
                  "Show All" to see all tokens.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-dark-text-secondary">
              No tokens found for this wallet
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default WalletOverview;
