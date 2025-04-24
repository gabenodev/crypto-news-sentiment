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

// Colors for the pie chart
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#8DD1E1",
  "#A4DE6C",
  "#D0ED57",
  "#FAACC5",
  "#F5A623",
  "#7ED321",
  "#50E3C2",
  "#4A90E2",
  "#BD10E0",
  "#9013FE",
  "#4A4A4A",
  "#417505",
  "#7ED321",
  "#B8E986",
];

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

  // Use useRef to prevent duplicate requests
  const previousAddressRef = useRef("");
  const isInitialMount = useRef(true);

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

  useEffect(() => {
    // If it's the first mount, set the flag and continue
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
    // If it's not the first mount and the address hasn't changed, ignore
    else if (previousAddressRef.current === address) {
      return;
    }

    // Update the previous address
    previousAddressRef.current = address;

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

        // Set the first token as selected by default
        if (dataWithPercentages.length > 0) {
          setSelectedToken(dataWithPercentages[0]);
        }
      } catch (err: any) {
        console.error("Error loading holdings:", err);
        setError(err.message);
      } finally {
        setLoading(false);
        if (onLoadingChange) onLoadingChange(false);
      }
    };

    loadHoldings();

    // Cleanup function
    return () => {
      console.log("CLEANUP EFFECT FOR ADDRESS:", address);
    };
  }, [address, onLoadingChange]);

  // Function to format values for tooltip
  const formatTooltipValue = (value: number) => {
    return `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium">
            {data.tokenInfo.name} ({data.tokenInfo.symbol})
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Value: $
            {data.value?.toLocaleString("en-US", { maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
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

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">{loadingStatus}</p>
      </div>
    );

  if (error)
    return (
      <div
        className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg relative"
        role="alert"
      >
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );

  if (holdings.length === 0)
    return (
      <div className="text-center py-8">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 inline-flex mb-4">
          <FiSearch className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">
          No tokens found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
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
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center mb-2">
            <FiDollarSign className="h-6 w-6 mr-2" />
            <h3 className="text-lg font-medium">Total Value</h3>
          </div>
          <p className="text-3xl font-bold">
            $
            {stats.totalValue.toLocaleString("en-US", {
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-blue-100 mt-2 text-sm">
            {stats.tokenCount} different tokens
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-2">
              <FiArrowUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">
              Top Token
            </h3>
          </div>
          {stats.topToken ? (
            <>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.topToken.name} ({stats.topToken.symbol})
              </p>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-gray-500 dark:text-gray-400">
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
            <p className="text-gray-500 dark:text-gray-400">
              No data available
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-2">
              <FiPieChart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">
              Distribution
            </h3>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
            Top 3 tokens represent:
          </p>
          {holdings.length >= 3 ? (
            <div className="flex items-center">
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
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
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {(
                  (holdings[0].percentage || 0) +
                  (holdings[1].percentage || 0) +
                  (holdings[2].percentage || 0)
                ).toFixed(0)}
                %
              </span>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
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
            className={`px-4 py-2 rounded-lg flex items-center ${
              viewMode === "chart"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            <FiPieChart className="mr-2" />
            Pie Chart
          </button>
          <button
            onClick={() => setViewMode("bar")}
            className={`px-4 py-2 rounded-lg flex items-center ${
              viewMode === "bar"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            <FiBarChart2 className="mr-2" />
            Bar Chart
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded-lg flex items-center ${
              viewMode === "list"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
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
            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Token detail card - shows when a token is selected */}
      {selectedToken && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-100 dark:border-gray-700 mb-6"
        >
          <div className="flex items-start">
            <img
              src={
                selectedToken.tokenInfo.image ||
                `/placeholder.svg?height=64&width=64&query=${selectedToken.tokenInfo.symbol}`
              }
              alt={selectedToken.tokenInfo.name}
              className="w-16 h-16 rounded-full mr-4 bg-gray-100 dark:bg-gray-700"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `/placeholder.svg?height=64&width=64&query=${selectedToken.tokenInfo.symbol}`;
              }}
            />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedToken.tokenInfo.name} ({selectedToken.tokenInfo.symbol}
                )
              </h3>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Balance
                  </p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {selectedToken.formattedBalance?.toLocaleString("en-US", {
                      maximumFractionDigits: 6,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Value
                  </p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    $
                    {selectedToken.value?.toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Price
                  </p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
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
                  <p className="text-sm text-gray-500 dark:text-gray-400">
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
                  <span className="text-gray-500 dark:text-gray-400">
                    Portfolio allocation
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {selectedToken.percentage?.toFixed(2)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
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
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-100 dark:border-gray-700 mb-8">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Asset Distribution
          </h3>

          {filteredHoldings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
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
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-100 dark:border-gray-700 mb-8">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Token Values
          </h3>

          {filteredHoldings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fill: "#6B7280", fontSize: 12 }}
                  />
                  <YAxis
                    tickFormatter={(value) =>
                      `$${
                        value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value
                      }`
                    }
                    tick={{ fill: "#6B7280", fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `$${Number(value).toLocaleString("en-US", {
                        maximumFractionDigits: 2,
                      })}`,
                      "Value",
                    ]}
                    labelFormatter={(name) => `Token: ${name}`}
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700">
          {filteredHoldings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No results found for search "{searchTerm}"
              </p>
            </div>
          ) : (
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
                      Balance
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
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      % of Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredHoldings.map((token, idx) => {
                    const tokenInfo = token.tokenInfo;
                    const formattedBalance = token.formattedBalance || 0;
                    const value = token.value || 0;
                    const percentage = token.percentage || 0;

                    return (
                      <tr
                        key={idx}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${
                          selectedToken?.tokenInfo.symbol ===
                          token.tokenInfo.symbol
                            ? "bg-blue-50 dark:bg-blue-900/20"
                            : ""
                        }`}
                        onClick={() => handleTokenSelect(token)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={
                                tokenInfo.image ||
                                `/placeholder.svg?height=32&width=32&query=${tokenInfo.symbol}`
                              }
                              alt={tokenInfo.name || tokenInfo.symbol}
                              className="w-8 h-8 rounded-full mr-3 bg-gray-100 dark:bg-gray-700"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `/placeholder.svg?height=32&width=32&query=${tokenInfo.symbol}`;
                              }}
                            />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {tokenInfo.name || "Unknown Token"}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {tokenInfo.symbol}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {formattedBalance.toLocaleString("en-US", {
                              maximumFractionDigits: 6,
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {tokenInfo.price?.rate ? (
                              `$${tokenInfo.price.rate.toLocaleString("en-US", {
                                maximumFractionDigits: 6,
                              })}`
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500">
                                —
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {value > 0 ? (
                              `$${value.toLocaleString("en-US", {
                                maximumFractionDigits: 2,
                              })}`
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500">
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
                                  ? "text-blue-600 dark:text-blue-400"
                                  : "text-gray-600 dark:text-gray-400"
                              }`}
                            >
                              {percentage > 0 ? (
                                `${percentage.toFixed(2)}%`
                              ) : (
                                <span className="text-gray-400 dark:text-gray-500">
                                  —
                                </span>
                              )}
                            </div>
                            {percentage > 0 && (
                              <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full ml-2">
                                <div
                                  className="h-2 bg-blue-600 rounded-full"
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
