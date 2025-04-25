"use client";

import React from "react";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  fetchTokenBalances,
  fetchEthBalance,
  fetchTransactionHistory,
  isValidEthereumAddress,
} from "../../utils/API/etherScanAPI";
import {
  FiDollarSign,
  FiActivity,
  FiClock,
  FiTrendingUp,
  FiAlertCircle,
  FiRefreshCw,
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
} from "recharts";
import { generateCryptoPlaceholder } from "../../utils/placeholderGenerator";

interface WalletOverviewProps {
  address: string;
  onLoadingChange?: (loading: boolean) => void;
  onStatsUpdate?: (stats: any) => void;
}

interface TokenData {
  tokenInfo: {
    name: string;
    symbol: string;
    decimals: string;
    price?: {
      rate: number;
    };
    image?: string;
  };
  balance: string;
  formattedBalance?: number;
  value?: number;
  percentage?: number;
}

interface TransactionData {
  timestamp: number;
  transactionHash: string;
  value: number;
  from: string;
  to: string;
  isError?: string;
  gasUsed?: string;
  gasPrice?: string;
}

interface OverviewStats {
  totalValue: number;
  ethBalance: number;
  ethPrice: number;
  tokenCount: number;
  transactionCount: number;
  lastActivity: number | null;
  incomingValue: number;
  outgoingValue: number;
}

// Colors for charts - using teal and green theme
const COLORS = [
  "#14b8a6",
  "#10b981",
  "#059669",
  "#047857",
  "#0d9488",
  "#0f766e",
  "#0e7490",
  "#0891b2",
  "#06b6d4",
  "#22d3ee",
];

const WalletOverview: React.FC<WalletOverviewProps> = ({
  address,
  onLoadingChange,
  onStatsUpdate,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [holdings, setHoldings] = useState<TokenData[]>([]);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [stats, setStats] = useState<OverviewStats>({
    totalValue: 0,
    ethBalance: 0,
    ethPrice: 0,
    tokenCount: 0,
    transactionCount: 0,
    lastActivity: null,
    incomingValue: 0,
    outgoingValue: 0,
  });
  const [loadingStatus, setLoadingStatus] = useState("Initializing...");
  const [retryCount, setRetryCount] = useState(0);
  const [activeTimeRange, setActiveTimeRange] = useState<
    "7d" | "30d" | "90d" | "all"
  >("30d");

  // Use refs to prevent duplicate requests and infinite loops
  const isLoadingRef = useRef(false);
  const previousAddressRef = useRef("");
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch wallet data
  useEffect(() => {
    // Clear any existing retry timeout when component unmounts or address changes
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [address]);

  useEffect(() => {
    // If we're already loading or the address hasn't changed, don't start a new load
    if (isLoadingRef.current || previousAddressRef.current === address) {
      return;
    }

    // Update refs
    isLoadingRef.current = true;
    previousAddressRef.current = address;

    const loadWalletData = async () => {
      try {
        setLoading(true);
        if (onLoadingChange) onLoadingChange(true);

        // Check if the address is valid
        if (!isValidEthereumAddress(address)) {
          throw new Error("Invalid Ethereum address");
        }

        setLoadingStatus("Fetching ETH balance...");

        // Fetch ETH balance
        const ethData = await fetchEthBalance(address);
        if (ethData.status === "0" || ethData.message === "NOTOK") {
          throw new Error("API temporarily unavailable. Please try again.");
        }

        const ethBalance = Number.parseFloat(ethData.result) / 1e18;
        const ethPrice = 3500; // Placeholder - in a real app, fetch the current ETH price

        setLoadingStatus("Fetching token balances...");

        // Fetch token balances
        const tokenData = await fetchTokenBalances(address);

        // Process token data
        let totalTokenValue = 0;
        const processedTokens = tokenData.map((token: TokenData) => {
          const decimals = Number(token.tokenInfo.decimals) || 0;
          const formattedBalance =
            Number(token.balance) / Math.pow(10, decimals);
          const value = token.tokenInfo.price?.rate
            ? formattedBalance * token.tokenInfo.price.rate
            : 0;

          totalTokenValue += value;

          return {
            ...token,
            formattedBalance,
            value,
          };
        });

        // Calculate percentages and sort by value
        const tokensWithPercentages = processedTokens
          .map((token: TokenData) => ({
            ...token,
            percentage: token.value ? (token.value / totalTokenValue) * 100 : 0,
          }))
          .sort((a, b) => (b.value || 0) - (a.value || 0));

        setLoadingStatus("Fetching transaction history...");

        // Fetch transaction history
        const txHistory = await fetchTransactionHistory(address);

        // Calculate transaction stats
        let incomingValue = 0;
        let outgoingValue = 0;

        txHistory.forEach((tx: TransactionData) => {
          if (tx.to && tx.to.toLowerCase() === address.toLowerCase()) {
            incomingValue += tx.value;
          } else if (
            tx.from &&
            tx.from.toLowerCase() === address.toLowerCase()
          ) {
            outgoingValue += tx.value;
          }
        });

        // Set data
        setHoldings(tokensWithPercentages);
        setTransactions(txHistory);

        const updatedStats = {
          totalValue: totalTokenValue + ethBalance * ethPrice,
          ethBalance,
          ethPrice,
          tokenCount: tokensWithPercentages.length,
          transactionCount: txHistory.length,
          lastActivity: txHistory.length > 0 ? txHistory[0].timestamp : null,
          incomingValue,
          outgoingValue,
        };

        setStats(updatedStats);

        // Update parent component with stats
        if (onStatsUpdate) {
          onStatsUpdate(updatedStats);
        }

        setError(null);
        setRetryCount(0);
      } catch (err: any) {
        console.error("Error loading wallet data:", err);

        // If we get an error and haven't retried too many times, retry
        if (retryCount < 3) {
          const nextRetryCount = retryCount + 1;
          setRetryCount(nextRetryCount);
          setError(`API error. Retrying... (${nextRetryCount}/3)`);

          // Wait 2 seconds before retrying
          retryTimeoutRef.current = setTimeout(() => {
            retryTimeoutRef.current = null;
            isLoadingRef.current = false; // Reset loading ref to allow retry
            loadWalletData();
          }, 2000);
          return;
        }

        setError(err.message || "Failed to load wallet data");
      } finally {
        // Only set loading to false if we're not in a retry cycle
        if (!retryTimeoutRef.current) {
          setLoading(false);
          if (onLoadingChange) onLoadingChange(false);
          isLoadingRef.current = false;
        }
      }
    };

    loadWalletData();
  }, [address, onLoadingChange, retryCount, onStatsUpdate]);

  // Prepare data for asset distribution chart
  const prepareAssetDistributionData = () => {
    if (!stats || stats.totalValue === 0) {
      return [];
    }

    // Start with ETH
    const ethValue = stats.ethBalance * stats.ethPrice;
    const totalValue = stats.totalValue;

    const data = [
      {
        name: "ETH",
        value: ethValue,
        percentage: (ethValue / totalValue) * 100,
      },
    ];

    // Add top tokens
    const topTokens = holdings.slice(0, 5);
    topTokens.forEach((token) => {
      if (token.value && token.value > 0) {
        data.push({
          name: token.tokenInfo.symbol,
          value: token.value,
          percentage: (token.value / totalValue) * 100,
        });
      }
    });

    // Add "Others" category for remaining tokens
    const otherTokens = holdings.slice(5);
    const otherValue = otherTokens.reduce(
      (sum, token) => sum + (token.value || 0),
      0
    );

    if (otherValue > 0) {
      data.push({
        name: "Others",
        value: otherValue,
        percentage: (otherValue / totalValue) * 100,
      });
    }

    return data;
  };

  // Prepare data for transaction activity chart
  const prepareTransactionActivityData = () => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    // Filter transactions based on time range
    const now = Date.now();
    const msInDay = 24 * 60 * 60 * 1000;
    const filteredTransactions = transactions.filter((tx) => {
      if (activeTimeRange === "all") return true;
      const txDate = tx.timestamp * 1000;
      const daysDiff = (now - txDate) / msInDay;

      if (activeTimeRange === "7d") return daysDiff <= 7;
      if (activeTimeRange === "30d") return daysDiff <= 30;
      if (activeTimeRange === "90d") return daysDiff <= 90;
      return true;
    });

    // Group transactions by day
    const txByDay = filteredTransactions.reduce(
      (acc: Record<string, number>, tx) => {
        if (!tx || !tx.timestamp) return acc;

        const date = new Date(tx.timestamp * 1000).toISOString().split("T")[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {}
    );

    // Convert to array and sort by date
    return Object.entries(txByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  // Prepare data for value over time chart (simulated data)
  const prepareValueOverTimeData = () => {
    // In a real app, this would fetch historical value data
    // For now, we'll generate simulated data
    const dataPoints =
      activeTimeRange === "7d"
        ? 7
        : activeTimeRange === "30d"
        ? 30
        : activeTimeRange === "90d"
        ? 90
        : 180;
    const result = [];
    const baseValue = stats.totalValue * 0.8;
    const now = new Date();

    for (let i = dataPoints; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      // Add some random variation to simulate price changes
      const randomFactor = 0.8 + Math.random() * 0.4;
      const value = baseValue * randomFactor;

      result.push({
        date: dateStr,
        value: value,
      });
    }

    return result;
  };

  // Prepare data for gas usage chart (simulated data)
  const prepareGasUsageData = () => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    // Filter transactions based on time range
    const now = Date.now();
    const msInDay = 24 * 60 * 60 * 1000;
    const filteredTransactions = transactions.filter((tx) => {
      if (activeTimeRange === "all") return true;
      const txDate = tx.timestamp * 1000;
      const daysDiff = (now - txDate) / msInDay;

      if (activeTimeRange === "7d") return daysDiff <= 7;
      if (activeTimeRange === "30d") return daysDiff <= 30;
      if (activeTimeRange === "90d") return daysDiff <= 90;
      return true;
    });

    // Group transactions by day and calculate gas used
    const gasByDay: Record<string, { date: string; gas: number }> = {};

    filteredTransactions.forEach((tx) => {
      if (!tx.timestamp || !tx.gasUsed || !tx.gasPrice) return;

      const date = new Date(tx.timestamp * 1000).toISOString().split("T")[0];
      const gasUsed = (Number(tx.gasUsed) * Number(tx.gasPrice)) / 1e18;

      if (!gasByDay[date]) {
        gasByDay[date] = { date, gas: 0 };
      }

      gasByDay[date].gas += gasUsed;
    });

    // Convert to array and sort by date
    return Object.values(gasByDay).sort((a, b) => a.date.localeCompare(b.date));
  };

  // Format timestamp to readable date
  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format currency values with full numbers and commas
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Determine font size based on the length of the number
  const getTotalValueFontSize = (value: number) => {
    const valueStr = Math.floor(value).toString();
    if (valueStr.length > 12) return "text-xl"; // Very large numbers (trillions+)
    if (valueStr.length > 9) return "text-2xl"; // Billions
    if (valueStr.length > 6) return "text-2xl"; // Millions
    return "text-3xl"; // Default size
  };

  // Retry loading data
  const handleRetry = () => {
    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    setRetryCount(0);
    setError(null);
    isLoadingRef.current = false; // Reset loading ref to allow retry
    previousAddressRef.current = ""; // Reset address ref to force reload
    setLoading(true);
  };

  // Custom tooltip component for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-dark-tertiary p-3 rounded-lg shadow-lg border border-gray-200 dark:border-dark-tertiary/50">
          <p className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}:{" "}
              {entry.name.includes("Value")
                ? formatCurrency(entry.value)
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mb-4"></div>
        <p className="text-dark-text-primary dark:text-dark-text-primary">
          {loadingStatus}
        </p>
        <p className="text-xs text-dark-text-secondary dark:text-dark-text-secondary mt-2">
          This may take a few moments as we connect to the blockchain
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100/30 dark:bg-error/20 border border-error/50 text-error px-4 py-3 rounded-lg relative"
        role="alert"
      >
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
        <button
          onClick={handleRetry}
          className="mt-2 flex items-center px-4 py-2 bg-error/10 text-error rounded-md hover:bg-error/20 transition-colors"
        >
          <FiRefreshCw className="mr-2" /> Retry
        </button>
      </div>
    );
  }

  // Safety check for empty data
  if (!stats || stats.totalValue === 0) {
    return (
      <div className="text-center py-8 bg-white dark:bg-dark-secondary rounded-xl shadow border border-gray-100 dark:border-dark-tertiary">
        <div className="bg-gray-100 dark:bg-dark-tertiary rounded-full p-6 inline-flex mb-4">
          <FiAlertCircle className="h-12 w-12 text-dark-text-secondary" />
        </div>
        <h3 className="text-xl font-medium text-gray-800 dark:text-dark-text-primary mb-2">
          No wallet data found
        </h3>
        <p className="text-gray-500 dark:text-dark-text-secondary max-w-md mx-auto">
          We couldn't retrieve any data for this wallet. It may be empty or the
          API might be temporarily unavailable.
        </p>
        <button
          onClick={handleRetry}
          className="mt-4 flex items-center px-4 py-2 bg-accent-primary/20 text-accent-primary rounded-md hover:bg-accent-primary/30 transition-colors mx-auto"
        >
          <FiRefreshCw className="mr-2" /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Time range selector */}
      <div className="flex justify-end mb-6">
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
              Ethereum
            </h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
            {stats.ethBalance.toFixed(4)} ETH
          </p>
          <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-2">
            Value: {formatCurrency(stats.ethBalance * stats.ethPrice)}
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
              data={prepareValueOverTimeData()}
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
            {prepareAssetDistributionData().length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={prepareAssetDistributionData()}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percentage }) =>
                      `${name} (${percentage.toFixed(1)}%)`
                    }
                  >
                    {prepareAssetDistributionData().map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: number) => [
                      formatCurrency(value),
                      "Value",
                    ]}
                    labelFormatter={(name) => `Token: ${name}`}
                    contentStyle={{
                      backgroundColor: "rgba(30, 30, 30, 0.8)",
                      borderRadius: "8px",
                      border: "none",
                      color: "#E0E0E0",
                    }}
                  />
                  <Legend />
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
            {prepareTransactionActivityData().length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={prepareTransactionActivityData()}
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
                    formatter={(value: number) => [
                      `${value} transactions`,
                      "Count",
                    ]}
                    labelFormatter={(date) => `Date: ${date}`}
                    contentStyle={{
                      backgroundColor: "rgba(30, 30, 30, 0.8)",
                      borderRadius: "8px",
                      border: "none",
                      color: "#E0E0E0",
                    }}
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
                  {Math.round(
                    ((stats.ethBalance * stats.ethPrice) / stats.totalValue) *
                      100
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-dark-tertiary rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${Math.round(
                      ((stats.ethBalance * stats.ethPrice) / stats.totalValue) *
                        100
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
            {prepareGasUsageData().length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={prepareGasUsageData()}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
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
                    tickFormatter={(value) => `${value.toFixed(2)} ETH`}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
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
        <h3 className="text-lg font-medium text-gray-800 dark:text-dark-text-primary mb-4 flex items-center">
          <FiDollarSign className="h-5 w-5 mr-2 text-teal-500" />
          Top Tokens
        </h3>

        {holdings.length > 0 ? (
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
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-secondary divide-y divide-gray-200 dark:divide-dark-tertiary">
                {holdings.slice(0, 5).map((token, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50 dark:hover:bg-dark-tertiary/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={
                            generateCryptoPlaceholder(token.tokenInfo.symbol) ||
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
                  </tr>
                ))}
              </tbody>
            </table>
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
