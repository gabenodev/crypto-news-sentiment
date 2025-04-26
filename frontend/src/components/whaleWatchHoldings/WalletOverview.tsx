"use client";
import React from "react";

import { useState, useEffect, useRef, useMemo } from "react";
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

// Helper functions
const getTotalValueFontSize = (value: number): string => {
  if (value > 1000000) {
    return "text-xl";
  } else if (value > 10000) {
    return "text-2xl";
  } else {
    return "text-3xl";
  }
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (timestamp: number | null): string => {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 text-white p-2 rounded-md shadow-md">
        <p className="label">{`${label}`}</p>
        {payload.map((item: any) => (
          <p key={item.dataKey} className="intro-text">
            {`${item.name}: ${formatCurrency(item.value)}`}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

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

  // Prepare data functions - declared outside useEffect to avoid recreating them on every render
  const prepareAssetDistributionData = useMemo(() => {
    return () => {
      if (!stats || stats.totalValue === 0) {
        return [];
      }

      // Calculate ETH value
      const ethValue = stats.ethBalance * stats.ethPrice;
      const totalValue = stats.totalValue;

      // Create a map to consolidate tokens with the same symbol
      const tokenMap = new Map<string, any>();

      // Add ETH first
      tokenMap.set("ETH", {
        name: "ETH",
        value: ethValue,
        percentage: (ethValue / totalValue) * 100,
      });

      // Add top tokens (excluding ETH if it's already in the tokens list)
      holdings.slice(0, 5).forEach((token) => {
        if (token.value && token.value > 0) {
          // Skip if it's ETH (already added)
          if (token.tokenInfo.symbol.toLowerCase() === "eth") return;

          tokenMap.set(token.tokenInfo.symbol, {
            name: token.tokenInfo.symbol,
            value: token.value,
            percentage: (token.value / totalValue) * 100,
          });
        }
      });

      // Add "Others" category for remaining tokens
      const otherTokens = holdings.slice(5);
      const otherValue = otherTokens.reduce((sum, token) => {
        // Skip if it's ETH (already added)
        if (token.tokenInfo.symbol.toLowerCase() === "eth") return sum;
        return sum + (token.value || 0);
      }, 0);

      if (otherValue > 0) {
        tokenMap.set("Others", {
          name: "Others",
          value: otherValue,
          percentage: (otherValue / totalValue) * 100,
        });
      }

      return Array.from(tokenMap.values());
    };
  }, [stats, holdings]);

  const prepareTransactionActivityData = useMemo(() => {
    return () => {
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

          const date = new Date(tx.timestamp * 1000)
            .toISOString()
            .split("T")[0];
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
  }, [transactions, activeTimeRange]);

  const prepareGasUsageData = useMemo(() => {
    return () => {
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
      return Object.values(gasByDay).sort((a, b) =>
        a.date.localeCompare(b.date)
      );
    };
  }, [transactions, activeTimeRange]);

  const prepareValueOverTimeData = useMemo(() => {
    return () => {
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
  }, [stats.totalValue, activeTimeRange]);

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

    // Modifică funcția loadWalletData pentru a afișa corect soldul ETH
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

        // Convertim corect din wei în ETH
        const ethBalance = Number.parseFloat(ethData.result) / 1e18;
        console.log("Raw ETH balance from API:", ethData.result);
        console.log("Converted ETH balance:", ethBalance);

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

        // Calculăm valoarea ETH
        const ethValue = ethBalance * ethPrice;
        console.log("ETH Balance:", ethBalance);
        console.log("ETH Price:", ethPrice);
        console.log("ETH Value:", ethValue);
        console.log("Total Token Value:", totalTokenValue);

        // Calculăm valoarea totală a portofoliului
        // Check if there's already an ETH token in the tokens list to avoid double counting
        const ethToken = processedTokens.find(
          (token) => token.tokenInfo.symbol.toLowerCase() === "eth"
        );
        const totalPortfolioValue = totalTokenValue + (ethToken ? 0 : ethValue);

        // Update the stats with the correct total value
        const updatedStats = {
          totalValue: totalPortfolioValue,
          ethBalance,
          ethPrice,
          tokenCount: tokensWithPercentages.length,
          transactionCount: txHistory.length,
          lastActivity: txHistory.length > 0 ? txHistory[0].timestamp : null,
          incomingValue,
          outgoingValue,
        };

        console.log("ETH Balance (ETH):", ethBalance);
        console.log("ETH Price (USD):", ethPrice);
        console.log("ETH Value (USD):", ethBalance * ethPrice);
        console.log("Total Token Value (USD):", totalTokenValue);
        console.log(
          "Total Portfolio Value (USD):",
          totalTokenValue + ethBalance * ethPrice
        );

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

  // Memorarea datelor pentru graficul de distribuție a activelor
  const assetDistributionData = useMemo(() => {
    if (!stats || stats.totalValue === 0) {
      return [];
    }

    // Calculate ETH value
    const ethValue = stats.ethBalance * stats.ethPrice;
    const totalValue = stats.totalValue;

    // Create a map to consolidate tokens with the same symbol
    const tokenMap = new Map<string, any>();

    // Add ETH first
    tokenMap.set("ETH", {
      name: "ETH",
      value: ethValue,
      percentage: (ethValue / totalValue) * 100,
    });

    // Add top tokens (excluding ETH if it's already in the tokens list)
    holdings.slice(0, 5).forEach((token) => {
      if (token.value && token.value > 0) {
        // Skip if it's ETH (already added)
        if (token.tokenInfo.symbol.toLowerCase() === "eth") return;

        tokenMap.set(token.tokenInfo.symbol, {
          name: token.tokenInfo.symbol,
          value: token.value,
          percentage: (token.value / totalValue) * 100,
        });
      }
    });

    // Add "Others" category for remaining tokens
    const otherTokens = holdings.slice(5);
    const otherValue = otherTokens.reduce((sum, token) => {
      // Skip if it's ETH (already added)
      if (token.tokenInfo.symbol.toLowerCase() === "eth") return sum;
      return sum + (token.value || 0);
    }, 0);

    if (otherValue > 0) {
      tokenMap.set("Others", {
        name: "Others",
        value: otherValue,
        percentage: (otherValue / totalValue) * 100,
      });
    }

    return Array.from(tokenMap.values());
  }, [stats, holdings]);

  // Memorarea datelor pentru graficul de activitate a tranzacțiilor
  const transactionActivityData = useMemo(() => {
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
  }, [transactions, activeTimeRange]);

  // Memorarea datelor pentru graficul de utilizare a gazului
  const gasUsageData = useMemo(() => {
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
  }, [transactions, activeTimeRange]);

  // Memorarea datelor pentru graficul "Portfolio Value Over Time"
  const valueOverTimeData = useMemo(() => {
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
  }, [stats.totalValue, activeTimeRange]);

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
            {assetDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetDistributionData}
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
                    {assetDistributionData.map((entry, index) => (
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
                    labelFormatter={(name: string) => `Token: ${name}`}
                    contentStyle={{
                      backgroundColor: "rgba(30, 30, 30, 0.8)",
                      borderRadius: "8px",
                      border: "none",
                      color: "#E0E0E0",
                    }}
                  />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    iconType="circle"
                    iconSize={10}
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
            {gasUsageData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={gasUsageData}
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
