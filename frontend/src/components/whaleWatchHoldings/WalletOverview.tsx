"use client";

import React from "react";

import { useState, useEffect } from "react";
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

// Colors for charts
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
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

  // Fetch wallet data
  useEffect(() => {
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
          if (tx.to.toLowerCase() === address.toLowerCase()) {
            incomingValue += tx.value;
          } else if (tx.from.toLowerCase() === address.toLowerCase()) {
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
      } catch (err: any) {
        console.error("Error loading wallet data:", err);

        // If we get an error and haven't retried too many times, retry
        if (retryCount < 3) {
          setRetryCount(retryCount + 1);
          setError(`API error. Retrying... (${retryCount + 1}/3)`);

          // Wait 2 seconds before retrying
          setTimeout(() => {
            loadWalletData();
          }, 2000);
          return;
        }

        setError(err.message);
      } finally {
        setLoading(false);
        if (onLoadingChange) onLoadingChange(false);
      }
    };

    loadWalletData();
  }, [address, onLoadingChange, retryCount]);

  // Prepare data for asset distribution chart
  const prepareAssetDistributionData = () => {
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
    // Group transactions by day
    const txByDay = transactions.reduce((acc: Record<string, number>, tx) => {
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

  // Retry loading data
  const handleRetry = () => {
    setRetryCount(0);
    setError(null);
    setLoading(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">{loadingStatus}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          This may take a few moments as we connect to the blockchain
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg relative"
        role="alert"
      >
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
        <button
          onClick={handleRetry}
          className="mt-2 flex items-center px-4 py-2 bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-300 rounded-md hover:bg-red-300 dark:hover:bg-red-700"
        >
          <FiRefreshCw className="mr-2" /> Retry
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
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center mb-2">
            <FiDollarSign className="h-6 w-6 mr-2" />
            <h3 className="text-lg font-medium">Total Value</h3>
          </div>
          <p className="text-3xl font-bold">
            {formatCurrency(stats.totalValue)}
          </p>
          <p className="text-blue-100 mt-2 text-sm">
            {stats.ethBalance.toFixed(4)} ETH + {stats.tokenCount} tokens
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-2">
              <FiActivity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">
              Transactions
            </h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.transactionCount}
          </p>
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-green-600 dark:text-green-400">
              +{formatCurrency(stats.incomingValue)} received
            </span>
            <span className="text-red-600 dark:text-red-400">
              -{formatCurrency(stats.outgoingValue)} sent
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-2">
              <FiTrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">
              Ethereum
            </h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.ethBalance.toFixed(4)} ETH
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Value: {formatCurrency(stats.ethBalance * stats.ethPrice)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center mb-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg mr-2">
              <FiClock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">
              Last Activity
            </h3>
          </div>
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            {formatDate(stats.lastActivity)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
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
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Asset Distribution
          </h3>

          <div className="h-[300px]">
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
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Transaction Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Transaction Activity
          </h3>

          {transactions.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={prepareTransactionActivityData()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [
                      `${value} transactions`,
                      "Count",
                    ]}
                    labelFormatter={(date) => `Date: ${date}`}
                  />
                  <Bar
                    dataKey="count"
                    name="Transactions"
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <FiAlertCircle className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-gray-500 dark:text-gray-400">
                No transaction data available
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Top tokens section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-100 dark:border-gray-700 mb-8"
      >
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
          Top Tokens
        </h3>

        {holdings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Token
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {holdings.slice(0, 5).map((token, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={
                            token.tokenInfo.image ||
                            `/placeholder.svg?height=32&width=32&query=${
                              token.tokenInfo.symbol || "/placeholder.svg"
                            }`
                          }
                          alt={token.tokenInfo.name}
                          className="w-8 h-8 rounded-full mr-3 bg-gray-100 dark:bg-gray-700"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `/placeholder.svg?height=32&width=32&query=${token.tokenInfo.symbol}`;
                          }}
                        />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {token.tokenInfo.name || "Unknown Token"}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {token.tokenInfo.symbol}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {token.formattedBalance?.toLocaleString("en-US", {
                          maximumFractionDigits: 6,
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {token.tokenInfo.price?.rate
                          ? formatCurrency(token.tokenInfo.price.rate)
                          : "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
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
            <p className="text-gray-500 dark:text-gray-400">
              No tokens found for this wallet
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default WalletOverview;
