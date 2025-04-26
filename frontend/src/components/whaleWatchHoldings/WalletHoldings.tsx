"use client";

import React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  FiList,
  FiSearch,
  FiBarChart2,
  FiRefreshCw,
  FiExternalLink,
} from "react-icons/fi";
import { generateCryptoPlaceholder } from "../../utils/placeholderGenerator";
import WalletLoadingState from "./components/WalletLoadingState";

// Update WalletHoldingsProps interface
interface WalletHoldingsProps {
  address?: string;
  onLoadingChange?: (loading: boolean) => void;
  onStatsUpdate?: (stats: any) => void;
  holdings?: TokenData[];
  ethBalance?: number;
  ethPrice?: number;
  isLoading?: boolean;
  error?: string | null;
  loadingStatus?: string;
  refreshData?: () => void;
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
];

// Modify the getCryptoLogoUrl function to handle errors better
const getCryptoLogoUrl = (symbol: string): string => {
  if (!symbol) return generateCryptoPlaceholder("?");
  try {
    // Return directly the placeholder generated
    return generateCryptoPlaceholder(symbol);
  } catch (error) {
    console.error("Error generating crypto logo:", error);
    return `/placeholder.svg?height=32&width=32&query=${encodeURIComponent(
      symbol || "?"
    )}`;
  }
};

// Format currency values
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
};

// Improved CustomTooltip component with better styling
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-2">
          <div
            className="w-4 h-4 rounded-full mr-2"
            style={{ backgroundColor: payload[0].color }}
          ></div>
          <p className="font-medium text-gray-900 dark:text-white text-base">
            {data.tokenInfo?.name || data.name}
          </p>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
          <span className="font-medium">Symbol:</span>{" "}
          {data.tokenInfo?.symbol || data.symbol}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
          <span className="font-medium">Value:</span>{" "}
          {formatCurrency(data.value || 0)}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          <span className="font-medium">Percentage:</span>{" "}
          {(data.percentage || 0).toFixed(2)}%
        </p>
      </div>
    );
  }
  return null;
};

// Modificăm componenta pentru a utiliza datele primite prin props
const WalletHoldings: React.FC<WalletHoldingsProps> = ({
  address = "",
  onLoadingChange,
  onStatsUpdate,
  holdings = [],
  ethBalance = 0,
  ethPrice = 3500,
  isLoading = false,
  error = null,
  loadingStatus = "Initializing...",
  refreshData,
}: WalletHoldingsProps) => {
  const [loading, setLoading] = useState(isLoading);
  const [localError, setLocalError] = useState<string | null>(error);
  const [processedHoldings, setProcessedHoldings] = useState<TokenData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "bar">("list");
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null);
  const [sortBy, setSortBy] = useState<"value" | "name" | "balance">("value");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Use useRef to prevent duplicate requests
  const previousAddressRef = useRef("");
  const isInitialMount = useRef(true);
  const isLoadingRef = useRef(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousHoldingsRef = useRef("");
  const selectedTokenRef = useRef<string | null>(null);

  // Folosim useMemo pentru a calcula filteredHoldings în loc de a folosi un state separat
  const filteredHoldings = useMemo(() => {
    if (processedHoldings.length === 0) return [];

    // Aplicăm sortarea
    const sortedHoldings = [...processedHoldings].sort((a, b) => {
      if (sortBy === "value") {
        const aValue = a.value || 0;
        const bValue = b.value || 0;
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      } else if (sortBy === "name") {
        const aName = a.tokenInfo.name.toLowerCase();
        const bName = b.tokenInfo.name.toLowerCase();
        return sortOrder === "asc"
          ? aName.localeCompare(bName)
          : bName.localeCompare(aName);
      } else {
        const aBalance = a.formattedBalance || 0;
        const bBalance = b.formattedBalance || 0;
        return sortOrder === "asc" ? aBalance - bBalance : bBalance - aBalance;
      }
    });

    // Apoi aplicăm filtrarea pe rezultatul sortat
    if (searchTerm.trim() === "") {
      return sortedHoldings;
    } else {
      const term = searchTerm.toLowerCase();
      return sortedHoldings.filter(
        (token) =>
          token.tokenInfo.name.toLowerCase().includes(term) ||
          token.tokenInfo.symbol.toLowerCase().includes(term)
      );
    }
  }, [processedHoldings, searchTerm, sortBy, sortOrder]);

  // Folosim useMemo pentru a calcula barChartData în loc de a folosi un state separat
  const barChartData = useMemo(() => {
    if (filteredHoldings.length === 0) return [];

    // Filtrăm token-urile care au valoare și luăm primele 10
    return filteredHoldings
      .filter((token) => (token.value || 0) > 0)
      .slice(0, 10)
      .map((token) => ({
        name: token.tokenInfo.symbol,
        value: token.value || 0,
        percentage: token.percentage || 0,
        tokenInfo: {
          name: token.tokenInfo.name,
          symbol: token.tokenInfo.symbol,
          decimals: token.tokenInfo.decimals,
          price: token.tokenInfo.price,
          image: token.tokenInfo.image,
        },
      }));
  }, [filteredHoldings]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [address]);

  // Create a ref to track if we've already updated stats
  const statsUpdatedRef = useRef(false);

  useEffect(() => {
    if (isLoading) {
      setLoading(true);
      return;
    }

    // Verificăm dacă holdings s-a schimbat cu adevărat pentru a evita procesarea inutilă
    const holdingsString = JSON.stringify(holdings);
    if (holdingsString === previousHoldingsRef.current) {
      return;
    }
    previousHoldingsRef.current = holdingsString;

    try {
      // Salvăm simbolul tokenului selectat curent (dacă există)
      const currentSelectedSymbol = selectedToken?.tokenInfo.symbol || null;
      if (currentSelectedSymbol) {
        selectedTokenRef.current = currentSelectedSymbol;
      }

      // Procesăm datele primite
      let totalValue = 0;
      const processedTokens = holdings.map((token: TokenData) => {
        const decimals = Number(token.tokenInfo.decimals) || 0;
        // Asigurăm-ne că formattedBalance este calculat corect
        const formattedBalance = Number(token.balance) / Math.pow(10, decimals);
        const value = token.tokenInfo.price?.rate
          ? formattedBalance * token.tokenInfo.price.rate
          : 0;

        totalValue += value;

        // Make sure formattedBalance is properly set
        return {
          ...token,
          formattedBalance: formattedBalance,
          value,
        };
      });

      // Calculăm procentajele și sortăm după valoare
      const dataWithPercentages = processedTokens
        .map((token: TokenData) => ({
          ...token,
          percentage:
            token.value && totalValue > 0
              ? (token.value / totalValue) * 100
              : 0,
        }))
        .sort((a, b) => (b.value || 0) - (a.value || 0));

      // Calculăm statisticile
      const topToken =
        dataWithPercentages.length > 0
          ? {
              name: dataWithPercentages[0].tokenInfo.name,
              symbol: dataWithPercentages[0].tokenInfo.symbol,
              value: dataWithPercentages[0].value || 0,
              percentage: dataWithPercentages[0].percentage || 0,
            }
          : null;

      const updatedStats = {
        totalValue,
        tokenCount: dataWithPercentages.length,
        topToken,
        topGainer: null,
        topLoser: null,
      };

      setProcessedHoldings(dataWithPercentages);
      setLocalError(null);

      // Actualizăm statisticile în componenta părinte
      if (onStatsUpdate) {
        onStatsUpdate({
          totalValue,
          tokenCount: dataWithPercentages.length,
          ethBalance,
        });
      }

      // Gestionăm selecția tokenului
      if (dataWithPercentages.length > 0) {
        if (selectedTokenRef.current) {
          // Încercăm să găsim tokenul anterior selectat
          const previouslySelected = dataWithPercentages.find(
            (token) => token.tokenInfo.symbol === selectedTokenRef.current
          );
          if (previouslySelected) {
            // Actualizăm tokenul selectat cu datele complete
            setSelectedToken(previouslySelected);
          } else if (isInitialMount.current) {
            // Dacă nu găsim tokenul anterior și este prima încărcare, selectăm primul token
            setSelectedToken(dataWithPercentages[0]);
            isInitialMount.current = false;
          }
        } else if (isInitialMount.current) {
          // Dacă nu există un token selectat anterior și este prima încărcare, selectăm primul token
          setSelectedToken(dataWithPercentages[0]);
          isInitialMount.current = false;
        }
      }
    } catch (err: any) {
      console.error("Eroare la procesarea datelor:", err);
      setLocalError(err.message || "Eroare la procesarea datelor");
    } finally {
      setLoading(false);
      if (onLoadingChange) onLoadingChange(false);
    }
    // Remove selectedToken from the dependency array to prevent infinite loops
  }, [holdings, isLoading, ethBalance, onLoadingChange, onStatsUpdate]);

  useEffect(() => {
    if (
      !isLoading &&
      holdings &&
      holdings.length > 0 &&
      !statsUpdatedRef.current
    ) {
      try {
        // Set the flag to true to prevent multiple updates
        statsUpdatedRef.current = true;
        // Verificăm dacă ETH există deja în holdings
        const ethTokenExists = holdings.some(
          (token) =>
            token.tokenInfo.symbol.toLowerCase() === "eth" &&
            !token.tokenInfo.name.toLowerCase().includes("defi")
        );

        // Calculăm valoarea ETH
        const ethValue = ethBalance * ethPrice;

        // Calculăm valoarea totală a token-urilor
        let totalTokenValue = 0;
        holdings.forEach((token) => {
          if (token.tokenInfo.price?.rate) {
            const decimals = Number(token.tokenInfo.decimals) || 0;
            const formattedBalance =
              Number(token.balance) / Math.pow(10, decimals);
            totalTokenValue += formattedBalance * token.tokenInfo.price.rate;
          }
        });

        // Calculăm valoarea totală a portofoliului, evitând dublarea ETH
        const totalValue = totalTokenValue + (ethTokenExists ? 0 : ethValue);

        // Actualizăm statisticile
        if (onStatsUpdate) {
          onStatsUpdate({
            totalValue,
            tokenCount: holdings.length,
            ethBalance,
          });
        }
      } catch (err) {
        console.error("Eroare la calcularea valorii totale:", err);
      }
    }

    // Reset the flag when dependencies change
    return () => {
      if (isLoading) {
        statsUpdatedRef.current = false;
      }
    };
  }, [holdings, ethBalance, ethPrice, isLoading, onStatsUpdate]);

  // Fix the handleTokenSelect function to prevent re-rendering issues
  const handleTokenSelect = (token: TokenData) => {
    if (!token || !token.tokenInfo) return;

    // Check if the token is already selected to avoid re-rendering
    if (selectedToken?.tokenInfo.symbol === token.tokenInfo.symbol) {
      return;
    }

    // Găsim tokenul complet din processedHoldings pentru a ne asigura că avem toate datele
    const fullToken =
      processedHoldings.find(
        (t: TokenData) => t.tokenInfo.symbol === token.tokenInfo.symbol
      ) || token;

    // Salvăm simbolul tokenului selectat
    selectedTokenRef.current = fullToken.tokenInfo.symbol;
    setSelectedToken(fullToken);
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Set sort by field
  const handleSortBy = (field: "value" | "name" | "balance") => {
    if (sortBy === field) {
      toggleSortOrder();
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setShowFilterMenu(false);
  };

  // Modificăm funcția handleRetry pentru a utiliza funcția primită prin props
  const handleRetry = () => {
    if (refreshData) {
      refreshData();
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-8">
        <WalletLoadingState status={loadingStatus} />
      </div>
    );

  if (localError)
    return (
      <div
        className="bg-red-100/30 dark:bg-error/20 border border-error/50 text-error px-4 py-3 rounded-lg relative"
        role="alert"
      >
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {localError}</span>
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
      {/* View controls and search */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center space-x-2">
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
        </div>
      </div>

      {/* Token detail card - shows when a token is selected */}
      {selectedToken && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-dark-secondary rounded-xl p-6 shadow-lg border border-gray-100 dark:border-dark-tertiary mb-6 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-start">
            <div className="w-16 h-16 rounded-full mr-4 bg-gray-100 dark:bg-dark-tertiary overflow-hidden flex-shrink-0">
              <img
                src={
                  getCryptoLogoUrl(selectedToken.tokenInfo.symbol) ||
                  "/placeholder.svg"
                }
                alt={selectedToken.tokenInfo.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">
                {selectedToken.tokenInfo.name} ({selectedToken.tokenInfo.symbol}
                )
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                    Balance
                  </p>
                  <p className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">
                    {(selectedToken.formattedBalance || 0).toLocaleString(
                      "en-US",
                      {
                        maximumFractionDigits: 6,
                      }
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                    Value
                  </p>
                  <p className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">
                    {formatCurrency(selectedToken.value || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                    Price
                  </p>
                  <p className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">
                    {selectedToken.tokenInfo.price?.rate
                      ? formatCurrency(selectedToken.tokenInfo.price.rate)
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                    Portfolio %
                  </p>
                  <p className="text-lg font-medium text-green-600 dark:text-green-400">
                    {(selectedToken.percentage || 0).toFixed(2)}%
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
                    {(selectedToken.percentage || 0).toFixed(2)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-dark-tertiary rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-green-500 h-2.5 rounded-full"
                    style={{ width: `${selectedToken.percentage || 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Token actions */}
              <div className="mt-4 flex space-x-2">
                <a
                  href={`https://etherscan.io/token/${selectedToken.tokenInfo.symbol}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-dark-tertiary dark:hover:bg-dark-tertiary/80 text-gray-700 dark:text-dark-text-primary rounded-lg transition-colors flex items-center"
                >
                  <FiExternalLink className="mr-1" /> View on Etherscan
                </a>
                <button
                  onClick={() => {
                    setSelectedToken(null);
                    selectedTokenRef.current = null;
                  }}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-dark-tertiary dark:hover:bg-dark-tertiary/80 text-gray-700 dark:text-dark-text-primary rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Bar chart view */}
      {viewMode === "bar" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-dark-secondary rounded-xl p-6 shadow-lg border border-gray-100 dark:border-dark-tertiary mb-8 hover:shadow-xl transition-shadow"
        >
          <h3 className="text-lg font-medium text-gray-800 dark:text-dark-text-primary mb-4 flex items-center">
            <FiBarChart2 className="h-5 w-5 mr-2 text-green-500" />
            Token Values
          </h3>

          {barChartData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-dark-text-secondary">
                {searchTerm
                  ? `No results found for search "${searchTerm}"`
                  : "No tokens with value found"}
              </p>
              <div className="flex justify-center items-center py-8">
                <FiBarChart2 className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-2" />
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {processedHoldings.length > 0
                  ? "Tokens exist but none have a calculated value. Try refreshing the data."
                  : "No tokens found in this wallet."}
              </p>
            </div>
          ) : (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  onClick={(data) => {
                    if (data && data.activePayload && data.activePayload[0]) {
                      const symbol = data.activePayload[0].payload.name;
                      // Căutăm tokenul în processedHoldings pentru a avea toate datele calculate
                      const token = processedHoldings.find(
                        (t) => t.tokenInfo.symbol === symbol
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
                    content={<CustomTooltip />}
                    cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
                  />
                  <Bar dataKey="value" name="Value" radius={[4, 4, 0, 0]}>
                    {barChartData.map((entry, index) => (
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
        </motion.div>
      )}

      {/* List view */}
      {viewMode === "list" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-dark-secondary rounded-xl p-6 shadow-lg border border-gray-100 dark:border-dark-tertiary hover:shadow-xl transition-shadow"
        >
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
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortBy("name")}
                    >
                      Token{" "}
                      {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortBy("balance")}
                    >
                      Balance{" "}
                      {sortBy === "balance" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortBy("value")}
                    >
                      Value{" "}
                      {sortBy === "value" && (sortOrder === "asc" ? "↑" : "↓")}
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
                            ? "bg-teal-50 dark:bg-teal-900/20"
                            : ""
                        }`}
                        onClick={() => handleTokenSelect(token)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full mr-3 bg-gray-100 dark:bg-dark-tertiary overflow-hidden flex-shrink-0">
                              <img
                                src={
                                  getCryptoLogoUrl(tokenInfo.symbol) ||
                                  "/placeholder.svg"
                                }
                                alt={tokenInfo.name || tokenInfo.symbol}
                                className="w-full h-full object-cover"
                              />
                            </div>
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
                            {formattedBalance > 0
                              ? formattedBalance.toLocaleString("en-US", {
                                  maximumFractionDigits: 6,
                                })
                              : token.balance
                              ? (
                                  Number(token.balance) /
                                  Math.pow(10, Number(token.tokenInfo.decimals))
                                ).toLocaleString("en-US", {
                                  maximumFractionDigits: 6,
                                })
                              : "0"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                            {tokenInfo.price?.rate ? (
                              formatCurrency(tokenInfo.price.rate)
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
                              formatCurrency(value)
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
                                  className="bg-gradient-to-r from-teal-500 to-green-500 h-2 rounded-full"
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
        </motion.div>
      )}
    </div>
  );
};

export default WalletHoldings;
