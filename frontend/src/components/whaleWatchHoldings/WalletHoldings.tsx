"use client";

import React from "react";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  fetchTokenBalances,
  isValidEthereumAddress,
} from "../../utils/API/etherScanAPI";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  FiDollarSign,
  FiPieChart,
  FiList,
  FiArrowUp,
  FiSearch,
  FiBarChart2,
  FiRefreshCw,
} from "react-icons/fi";

// Update WalletHoldingsProps interface
interface WalletHoldingsProps {
  address: string;
  onLoadingChange?: (loading: boolean) => void;
}

// Interface for token data
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

// Interface for stats data
interface StatsData {
  totalValue: number;
  tokenCount: number;
  topToken: {
    name: string;
    symbol: string;
    value: number;
    percentage: number;
  } | null;
  topGainer: {
    name: string;
    symbol: string;
    price: number;
  } | null;
  topLoser: {
    name: string;
    symbol: string;
    price: number;
  } | null;
}

// Colors for the pie chart - using teal and green theme
const COLORS = [
  "#14b8a6", // teal-500
  "#10b981", // green-500
  "#059669", // green-600
  "#047857", // green-700
  "#0d9488", // teal-600
  "#0f766e", // teal-700
  "#0e7490", // cyan-700
  "#0891b2", // cyan-600
  "#06b6d4", // cyan-500
  "#22d3ee", // cyan-400
  "#2dd4bf", // teal-400
  "#34d399", // green-400
  "#6ee7b7", // green-300
  "#99f6e4", // teal-200
  "#a7f3d0", // green-200
  "#5eead4", // teal-300
  "#0d9488", // teal-600
  "#065f46", // green-800
  "#134e4a", // teal-800
  "#115e59", // teal-800
];

// Common crypto symbols for logo mapping
const CRYPTO_SYMBOLS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
  USDC: "usd-coin",
  BNB: "binance-coin",
  XRP: "ripple",
  ADA: "cardano",
  SOL: "solana",
  DOGE: "dogecoin",
  DOT: "polkadot",
  AVAX: "avalanche",
  SHIB: "shiba-inu",
  MATIC: "polygon",
  LTC: "litecoin",
  UNI: "uniswap",
  LINK: "chainlink",
  XLM: "stellar",
  ATOM: "cosmos",
  ALGO: "algorand",
  FIL: "filecoin",
  // Add more mappings as needed
};

// Function to get crypto logo URL
const getCryptoLogoUrl = (symbol: string): string => {
  const normalizedSymbol = symbol.toUpperCase();
  const mappedSymbol = CRYPTO_SYMBOLS[normalizedSymbol] || symbol.toLowerCase();
  return `https://cryptoicons.org/api/icon/${mappedSymbol}/32`;
};

const WalletHoldings: React.FC<WalletHoldingsProps> = ({
  address,
  onLoadingChange,
}: WalletHoldingsProps) => {
  const [holdings, setHoldings] = useState<TokenData[]>([]);
  const [filteredHoldings, setFilteredHoldings] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatsData>({
    totalValue: 0,
    tokenCount: 0,
    topToken: null,
    topGainer: null,
    topLoser: null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "chart" | "bar">("chart");
  const [loadingStatus, setLoadingStatus] = useState<string>("Initializing...");
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Use useRef to prevent duplicate requests
  const previousAddressRef = useRef("");
  const isInitialMount = useRef(true);
  const isLoadingRef = useRef(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Effect for filtering holdings based on search term
  useEffect(() => {
    if (holdings.length > 0) {
      if (searchTerm.trim() === "") {
        setFilteredHoldings(holdings);
      } else {
        const term = searchTerm.toLowerCase();
        setFilteredHoldings(
          holdings.filter(
            (token) =>
              token.tokenInfo.name.toLowerCase().includes(term) ||
              token.tokenInfo.symbol.toLowerCase().includes(term)
          )
        );
      }
    }
  }, [searchTerm, holdings]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [address]);

  useEffect(() => {
    // If it's the first mount, set the flag and continue
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
    // If it's not the first mount and the address hasn't changed, ignore
    else if (previousAddressRef.current === address || isLoadingRef.current) {
      return;
    }

    // Update the previous address and set loading flag
    previousAddressRef.current = address;
    isLoadingRef.current = true;

    const loadHoldings = async () => {
      try {
        setLoading(true);
        if (onLoadingChange) onLoadingChange(true);

        // Check if the address is valid
        if (!isValidEthereumAddress(address)) {
          throw new Error("Invalid Ethereum address");
        }

        setLoadingStatus("Fetching wallet data...");

        // Get data from API
        const data = await fetchTokenBalances(address);

        if (data.length === 0) {
          setHoldings([]);
          setFilteredHoldings([]);
          setStats({
            totalValue: 0,
            tokenCount: 0,
            topToken: null,
            topGainer: null,
            topLoser: null,
          });
          setError(null);
          setLoading(false);
          if (onLoadingChange) onLoadingChange(false);
          isLoadingRef.current = false;
          return;
        }

        // Process data to calculate values and percentages
        let totalValue = 0;
        const processedData = data.map((token: TokenData) => {
          const decimals = Number(token.tokenInfo.decimals) || 0;
          const formattedBalance =
            Number(token.balance) / Math.pow(10, decimals);
          const value = token.tokenInfo.price?.rate
            ? formattedBalance * token.tokenInfo.price.rate
            : 0;

          totalValue += value;

          return {
            ...token,
            formattedBalance,
            value,
          };
        });

        // Calculate percentages and sort by value
        const dataWithPercentages = processedData
          .map((token: TokenData) => ({
            ...token,
            percentage: token.value ? (token.value / totalValue) * 100 : 0,
          }))
          .sort((a, b) => (b.value || 0) - (a.value || 0));

        // Calculate statistics
        const topToken =
          dataWithPercentages.length > 0
            ? {
                name: dataWithPercentages[0].tokenInfo.name,
                symbol: dataWithPercentages[0].tokenInfo.symbol,
                value: dataWithPercentages[0].value || 0,
                percentage: dataWithPercentages[0].percentage || 0,
              }
            : null;

        // Set data and statistics
        setHoldings(dataWithPercentages);
        setFilteredHoldings(dataWithPercentages);
        setStats({
          totalValue,
          tokenCount: dataWithPercentages.length,
          topToken,
          topGainer: null, // We don't have historical price data to calculate gains
          topLoser: null,
        });
        setError(null);
        setRetryCount(0);

        // Set the first token as selected by default
        if (dataWithPercentages.length > 0) {
          setSelectedToken(dataWithPercentages[0]);
        }
      } catch (err: any) {
        console.error("Error loading holdings:", err);

        // If we get an error and haven't retried too many times, retry
        if (retryCount < 3) {
          const nextRetryCount = retryCount + 1;
          setRetryCount(nextRetryCount);
          setError(`API error. Retrying... (${nextRetryCount}/3)`);

          // Wait 2 seconds before retrying
          retryTimeoutRef.current = setTimeout(() => {
            retryTimeoutRef.current = null;
            isLoadingRef.current = false; // Reset loading ref to allow retry
            loadHoldings();
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

    loadHoldings();
  }, [address, onLoadingChange, retryCount]);

  // Function to format values for tooltip
  const formatTooltipValue = (value: number) => {
    return `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-dark-secondary p-3 rounded-lg shadow-lg border border-dark-tertiary text-dark-text-primary">
          <p className="font-medium">
            {data.tokenInfo.name} ({data.tokenInfo.symbol})
          </p>
          <p className="text-sm text-dark-text-secondary">
            Value: $
            {data.value?.toLocaleString("en-US", { maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-dark-text-secondary">
            Percentage: {data.percentage?.toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Prepare data for the pie chart
  const pieData = filteredHoldings
    .filter((token) => (token.value || 0) > 0)
    .map((token) => ({
      ...token,
      name: token.tokenInfo.symbol,
    }));

  // Group small tokens into a single "Others" category for the pie chart
  const prepareChartData = () => {
    if (pieData.length <= 10) return pieData;

    const topTokens = pieData.slice(0, 9);
    const otherTokens = pieData.slice(9);

    const otherValue = otherTokens.reduce(
      (sum, token) => sum + (token.value || 0),
      0
    );
    const otherPercentage = otherTokens.reduce(
      (sum, token) => sum + (token.percentage || 0),
      0
    );

    return [
      ...topTokens,
      {
        tokenInfo: {
          name: "Others",
          symbol: "OTHERS",
          decimals: "0",
          image: "/Abstract-Geometric-Shapes.png",
        },
        balance: "0",
        formattedBalance: 0,
        value: otherValue,
        percentage: otherPercentage,
        name: "Others",
      },
    ];
  };

  // Prepare data for the bar chart
  const prepareBarChartData = () => {
    return filteredHoldings
      .filter((token) => (token.value || 0) > 0)
      .slice(0, 10)
      .map((token) => ({
        name: token.tokenInfo.symbol,
        value: token.value || 0,
        percentage: token.percentage || 0,
      }));
  };

  // Handle token selection
  const handleTokenSelect = (token: TokenData) => {
    setSelectedToken(token);
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

  // Determine font size based on the length of the number
  const getTotalValueFontSize = (value: number) => {
    const valueStr = Math.floor(value).toString();
    if (valueStr.length > 12) return "text-xl"; // Very large numbers (trillions+)
    if (valueStr.length > 9) return "text-2xl"; // Billions
    if (valueStr.length > 6) return "text-2xl"; // Millions
    return "text-3xl"; // Default size
  };

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary mb-4"></div>
        <p className="text-gray-600 dark:text-dark-text-primary">
          {loadingStatus}
        </p>
      </div>
    );

  if (error)
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

  if (holdings.length === 0)
    return (
      <div className="text-center py-8">
        <div className="bg-gray-100 dark:bg-dark-tertiary rounded-full p-6 inline-flex mb-4">
          <FiSearch className="h-12 w-12 text-dark-text-secondary" />
        </div>
        <h3 className="text-xl font-medium text-gray-800 dark:text-dark-text-primary mb-2">
          No tokens found
        </h3>
        <p className="text-gray-500 dark:text-dark-text-secondary max-w-md mx-auto">
          This wallet doesn't hold any ERC-20 tokens or we couldn't retrieve the
          data. Check the address and try again.
        </p>
      </div>
    );

  return (
    <div>
      {/* Main statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
            $
            {stats.totalValue.toLocaleString("en-US", {
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-white/80 mt-2 text-sm">
            {stats.tokenCount} different tokens
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white dark:bg-dark-secondary rounded-xl p-6 shadow border border-gray-100 dark:border-dark-tertiary"
        >
          <div className="flex items-center mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-2">
              <FiArrowUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-dark-text-primary">
              Top Token
            </h3>
          </div>
          {stats.topToken ? (
            <>
              <p className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">
                {stats.topToken.name} ({stats.topToken.symbol})
              </p>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-gray-500 dark:text-dark-text-secondary">
                  $
                  {stats.topToken.value.toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className="text-green-600 dark:text-green-400 font-medium">
                  {stats.topToken.percentage.toFixed(2)}% of portfolio
                </span>
              </div>
            </>
          ) : (
            <p className="text-gray-500 dark:text-dark-text-secondary">
              No data available
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white dark:bg-dark-secondary rounded-xl p-6 shadow border border-gray-100 dark:border-dark-tertiary"
        >
          <div className="flex items-center mb-2">
            <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg mr-2">
              <FiPieChart className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-dark-text-primary">
              Distribution
            </h3>
          </div>
          <p className="text-gray-500 dark:text-dark-text-secondary text-sm mb-2">
            Top 3 tokens represent:
          </p>
          {holdings.length >= 3 ? (
            <div className="flex items-center">
              <div className="flex-1 bg-gray-200 dark:bg-dark-tertiary rounded-full h-2.5 mr-2">
                <div
                  className="bg-gradient-to-r from-teal-500 to-green-500 h-2.5 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      (holdings[0].percentage || 0) +
                        (holdings[1].percentage || 0) +
                        (holdings[2].percentage || 0)
                    )}%`,
                  }}
                ></div>
              </div>
              <span className="text-sm font-medium text-teal-600 dark:text-teal-400">
                {(
                  (holdings[0].percentage || 0) +
                  (holdings[1].percentage || 0) +
                  (holdings[2].percentage || 0)
                ).toFixed(0)}
                %
              </span>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-dark-text-secondary">
              Insufficient data
            </p>
          )}
        </motion.div>
      </div>

      {/* View controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode("chart")}
            className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
              viewMode === "chart"
                ? "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
                : "bg-gray-100 text-gray-700 dark:bg-dark-tertiary dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-tertiary/80"
            }`}
          >
            <FiPieChart className="mr-2" />
            Pie Chart
          </button>
          <button
            onClick={() => setViewMode("bar")}
            className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
              viewMode === "bar"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                : "bg-gray-100 text-gray-700 dark:bg-dark-tertiary dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-tertiary/80"
            }`}
          >
            <FiBarChart2 className="mr-2" />
            Bar Chart
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
              viewMode === "list"
                ? "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
                : "bg-gray-100 text-gray-700 dark:bg-dark-tertiary dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-tertiary/80"
            }`}
          >
            <FiList className="mr-2" />
            List
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search token..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-dark-tertiary dark:border-dark-tertiary dark:text-dark-text-primary focus:ring-2 focus:ring-accent-primary focus:border-accent-primary"
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-text-secondary" />
        </div>
      </div>

      {/* Token detail card - shows when a token is selected */}
      {selectedToken && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-dark-secondary rounded-xl p-6 shadow border border-gray-100 dark:border-dark-tertiary mb-6"
        >
          <div className="flex items-start">
            <img
              src={
                getCryptoLogoUrl(selectedToken.tokenInfo.symbol) ||
                "/placeholder.svg"
              }
              alt={selectedToken.tokenInfo.name}
              className="w-16 h-16 rounded-full mr-4 bg-gray-100 dark:bg-dark-tertiary"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `/placeholder.svg?height=64&width=64&query=${selectedToken.tokenInfo.symbol}`;
              }}
            />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">
                {selectedToken.tokenInfo.name} ({selectedToken.tokenInfo.symbol}
                )
              </h3>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                    Balance
                  </p>
                  <p className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">
                    {selectedToken.formattedBalance?.toLocaleString("en-US", {
                      maximumFractionDigits: 6,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                    Value
                  </p>
                  <p className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">
                    $
                    {selectedToken.value?.toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                    Price
                  </p>
                  <p className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">
                    {selectedToken.tokenInfo.price?.rate
                      ? `$${selectedToken.tokenInfo.price.rate.toLocaleString(
                          "en-US",
                          {
                            maximumFractionDigits: 6,
                          }
                        )}`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                    Portfolio %
                  </p>
                  <p className="text-lg font-medium text-green-600 dark:text-green-400">
                    {selectedToken.percentage?.toFixed(2)}%
                  </p>
                </div>
              </div>

              {/* Portfolio percentage visualization */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500 dark:text-dark-text-secondary">
                    Portfolio allocation
                  </span>
                  <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                    {selectedToken.percentage?.toFixed(2)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-dark-tertiary rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-green-500 h-2.5 rounded-full"
                    style={{ width: `${selectedToken.percentage || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Pie chart view */}
      {viewMode === "chart" && (
        <div className="bg-white dark:bg-dark-secondary rounded-xl p-6 shadow border border-gray-100 dark:border-dark-tertiary mb-8">
          <h3 className="text-lg font-medium text-gray-800 dark:text-dark-text-primary mb-4 flex items-center">
            <FiPieChart className="h-5 w-5 mr-2 text-teal-500" />
            Asset Distribution
          </h3>

          {filteredHoldings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-dark-text-secondary">
                No results found for search "{searchTerm}"
              </p>
            </div>
          ) : (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={prepareChartData()}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={60}
                    paddingAngle={1}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    labelLine={true}
                    onClick={(data) => handleTokenSelect(data)}
                  >
                    {prepareChartData().map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke={
                          selectedToken?.tokenInfo.symbol ===
                          entry.tokenInfo.symbol
                            ? "#fff"
                            : "none"
                        }
                        strokeWidth={
                          selectedToken?.tokenInfo.symbol ===
                          entry.tokenInfo.symbol
                            ? 2
                            : 0
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    onClick={(data) => {
                      const token = holdings.find(
                        (t) => t.tokenInfo.symbol === data.value
                      );
                      if (token) handleTokenSelect(token);
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Bar chart view */}
      {viewMode === "bar" && (
        <div className="bg-white dark:bg-dark-secondary rounded-xl p-6 shadow border border-gray-100 dark:border-dark-tertiary mb-8">
          <h3 className="text-lg font-medium text-gray-800 dark:text-dark-text-primary mb-4 flex items-center">
            <FiBarChart2 className="h-5 w-5 mr-2 text-green-500" />
            Token Values
          </h3>

          {filteredHoldings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-dark-text-secondary">
                No results found for search "{searchTerm}"
              </p>
            </div>
          ) : (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={prepareBarChartData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  onClick={(data) => {
                    if (data && data.activePayload && data.activePayload[0]) {
                      const token = holdings.find(
                        (t) =>
                          t.tokenInfo.symbol ===
                          data.activePayload?.[0]?.payload?.name
                      );
                      if (token) handleTokenSelect(token);
                    }
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(160, 160, 160, 0.2)"
                  />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fill: "#A0A0A0", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(160, 160, 160, 0.2)" }}
                  />
                  <YAxis
                    tickFormatter={(value) =>
                      `$${
                        value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value
                      }`
                    }
                    tick={{ fill: "#A0A0A0", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(160, 160, 160, 0.2)" }}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `$${Number(value).toLocaleString("en-US", {
                        maximumFractionDigits: 2,
                      })}`,
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
                  <Bar dataKey="value" name="Value" radius={[4, 4, 0, 0]}>
                    {prepareBarChartData().map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke={
                          selectedToken?.tokenInfo.symbol === entry.name
                            ? "#fff"
                            : "none"
                        }
                        strokeWidth={
                          selectedToken?.tokenInfo.symbol === entry.name ? 2 : 0
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* List view */}
      {viewMode === "list" && (
        <div className="bg-white dark:bg-dark-secondary rounded-xl shadow border border-gray-100 dark:border-dark-tertiary">
          {filteredHoldings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-dark-text-secondary">
                No results found for search "{searchTerm}"
              </p>
            </div>
          ) : (
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
                      Balance
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
                      % of Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-secondary divide-y divide-gray-200 dark:divide-dark-tertiary">
                  {filteredHoldings.map((token, idx) => {
                    const tokenInfo = token.tokenInfo;
                    const formattedBalance = token.formattedBalance || 0;
                    const value = token.value || 0;
                    const percentage = token.percentage || 0;

                    return (
                      <tr
                        key={idx}
                        className={`hover:bg-gray-50 dark:hover:bg-dark-tertiary/50 transition-colors cursor-pointer ${
                          selectedToken?.tokenInfo.symbol ===
                          token.tokenInfo.symbol
                            ? "bg-teal-50/10 dark:bg-teal-900/20"
                            : ""
                        }`}
                        onClick={() => handleTokenSelect(token)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={
                                getCryptoLogoUrl(tokenInfo.symbol) ||
                                "/placeholder.svg"
                              }
                              alt={tokenInfo.name || tokenInfo.symbol}
                              className="w-8 h-8 rounded-full mr-3 bg-gray-100 dark:bg-dark-tertiary"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `/placeholder.svg?height=32&width=32&query=${tokenInfo.symbol}`;
                              }}
                            />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-dark-text-primary">
                                {tokenInfo.name || "Unknown Token"}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-dark-text-secondary">
                                {tokenInfo.symbol}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                            {formattedBalance.toLocaleString("en-US", {
                              maximumFractionDigits: 6,
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                            {tokenInfo.price?.rate ? (
                              `$${tokenInfo.price.rate.toLocaleString("en-US", {
                                maximumFractionDigits: 6,
                              })}`
                            ) : (
                              <span className="text-gray-400 dark:text-dark-text-secondary">
                                —
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                            {value > 0 ? (
                              `$${value.toLocaleString("en-US", {
                                maximumFractionDigits: 2,
                              })}`
                            ) : (
                              <span className="text-gray-400 dark:text-dark-text-secondary">
                                —
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end">
                            <div
                              className={`text-sm font-medium ${
                                percentage > 10
                                  ? "text-green-600 dark:text-green-400"
                                  : percentage > 1
                                  ? "text-teal-600 dark:text-teal-400"
                                  : "text-gray-600 dark:text-dark-text-secondary"
                              }`}
                            >
                              {percentage > 0 ? (
                                `${percentage.toFixed(2)}%`
                              ) : (
                                <span className="text-gray-400 dark:text-dark-text-secondary">
                                  —
                                </span>
                              )}
                            </div>
                            {percentage > 0 && (
                              <div className="w-16 h-2 bg-gray-200 dark:bg-dark-tertiary rounded-full ml-2">
                                <div
                                  className="h-2 bg-gradient-to-r from-teal-500 to-green-500 rounded-full"
                                  style={{
                                    width: `${Math.min(100, percentage)}%`,
                                  }}
                                ></div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletHoldings;
