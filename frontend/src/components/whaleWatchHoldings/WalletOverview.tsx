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
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface WalletOverviewProps {
  address: string;
  onLoadingChange?: (loading: boolean) => void;
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
        setStats({
          totalValue: totalTokenValue + ethBalance * ethPrice,
          ethBalance,
          ethPrice,
          tokenCount: tokensWithPercentages.length,
          transactionCount: txHistory.length,
          lastActivity: txHistory.length > 0 ? txHistory[0].timestamp : null,
          incomingValue,
          outgoingValue,
        });

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
  }, [address, onLoadingChange, retryCount]);

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

    // Group transactions by day
    const txByDay = transactions.reduce((acc: Record<string, number>, tx) => {
      if (!tx || !tx.timestamp) return acc;

      const date = new Date(tx.timestamp * 1000).toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Convert to array and sort by date
    return Object.entries(txByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Last 30 days
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

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary mb-4"></div>
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
      {/* Main statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-dark-tertiary text-white rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center mb-2">
            <FiDollarSign className="h-6 w-6 mr-2" />
            <h3 className="text-lg font-medium">Total Value</h3>
          </div>
          <p
            className={`${getTotalValueFontSize(
              stats.totalValue
            )} font-bold break-all`}
          >
            {formatCurrency(stats.totalValue)}
          </p>
          <p className="text-white/80 mt-2 text-sm">
            {stats.ethBalance.toFixed(4)} ETH + {stats.tokenCount} tokens
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white dark:bg-dark-secondary rounded-xl p-6 shadow border border-gray-100 dark:border-dark-tertiary"
        >
          <div className="flex items-center mb-2">
            <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg mr-2">
              <FiActivity className="h-4 w-4 text-teal-600 dark:text-teal-400" />
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
              <FiArrowDownLeft className="mr-1" />{" "}
              {formatCurrency(stats.incomingValue)}
            </span>
            <span className="text-red-600 dark:text-red-400 flex items-center">
              <FiArrowUpRight className="mr-1" />{" "}
              {formatCurrency(stats.outgoingValue)}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white dark:bg-dark-secondary rounded-xl p-6 shadow border border-gray-100 dark:border-dark-tertiary"
        >
          <div className="flex items-center mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-2">
              <FiTrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
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
          className="bg-white dark:bg-dark-secondary rounded-xl p-6 shadow border border-gray-100 dark:border-dark-tertiary"
        >
          <div className="flex items-center mb-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg mr-2">
              <FiClock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
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

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Asset Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-white dark:bg-dark-secondary rounded-xl p-6 shadow border border-gray-100 dark:border-dark-tertiary"
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
                  <Tooltip
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
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-white dark:bg-dark-secondary rounded-xl p-6 shadow border border-gray-100 dark:border-dark-tertiary"
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
                  />
                  <YAxis
                    tick={{ fill: "#A0A0A0" }}
                    axisLine={{ stroke: "rgba(160, 160, 160, 0.2)" }}
                  />
                  <Tooltip
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

      {/* Top tokens section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
        className="bg-white dark:bg-dark-secondary rounded-xl p-6 shadow border border-gray-100 dark:border-dark-tertiary mb-8"
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
                          src={`https://cryptoicons.org/api/icon/${token.tokenInfo.symbol.toLowerCase()}/32`}
                          alt={token.tokenInfo.name || "Token"}
                          className="w-8 h-8 rounded-full mr-3 bg-gray-100 dark:bg-dark-tertiary"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `/placeholder.svg?height=32&width=32&query=${
                              token.tokenInfo.symbol || "token"
                            }`;
                          }}
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
