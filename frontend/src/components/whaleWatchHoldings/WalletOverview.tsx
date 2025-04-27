"use client";
import React from "react";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
} from "recharts";
import { generateCryptoPlaceholder } from "../../utils/placeholderGenerator";
import WalletLoadingState from "./components/WalletLoadingState";

// Actualizăm interfața WalletOverviewProps pentru a include noile props
interface WalletOverviewProps {
  address: string;
  onLoadingChange?: (loading: boolean) => void;
  onStatsUpdate?: (stats: any) => void;
  holdings?: TokenData[];
  transactions?: TransactionData[];
  ethBalance?: number;
  ethPrice?: number;
  isLoading?: boolean;
  error?: string | null;
  loadingStatus?: string;
  refreshData?: () => void;
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
    contractAddress?: string;
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

interface AssetDistributionItem {
  name: string;
  symbol: string;
  value: number;
  percentage: number;
  smallTokens?: Array<{
    name: string;
    symbol: string;
    value: number;
    percentage: number;
  }>;
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

// Custom tooltip component with improved styling for dark mode
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-3 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-medium mb-1">{`${label}`}</p>
        {payload.map((item: any) => (
          <p key={item.dataKey} className="text-sm">
            {`${item.name}: ${formatCurrency(item.value)}`}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

// Custom pie chart label component to avoid overlapping
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
  name,
  value,
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.1;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Shorten name for display
  const displayName = name.length > 6 ? name.substring(0, 6) + "..." : name;

  return (
    <text
      x={x}
      y={y}
      fill="#FFFFFF"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      style={{
        fontSize: "12px",
        fontWeight: "bold",
        textShadow: "0px 0px 3px rgba(0,0,0,0.7)",
      }}
    >
      {`${displayName} (${(percent * 100).toFixed(1)}%)`}
    </text>
  );
};

// Modificăm componenta pentru a utiliza datele primite prin props
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
  loadingStatus = "Inițializare...",
  refreshData,
}) => {
  const [loading, setLoading] = useState(isLoading);
  const [stats, setStats] = useState<OverviewStats>({
    totalValue: 0,
    ethBalance: ethBalance,
    ethPrice: ethPrice,
    tokenCount: 0,
    transactionCount: 0,
    lastActivity: null,
    incomingValue: 0,
    outgoingValue: 0,
  });
  const [activeTimeRange, setActiveTimeRange] = useState<
    "7d" | "30d" | "90d" | "all"
  >("30d");
  const [refreshKey, setRefreshKey] = useState(0); // Adăugat pentru a forța reîmprospătarea
  const [processedHoldings, setHoldings] = useState<TokenData[]>([]);
  const [showAllTokens, setShowAllTokens] = useState(false);

  // Adaugă această referință pentru a urmări dacă datele s-au schimbat
  const previousDataRef = useRef<string | null>(null);

  // Use refs to prevent duplicate requests and infinite loops
  const isLoadingRef = useRef(false);
  const previousAddressRef = useRef("");
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Prepare data functions - declared outside useEffect to avoid recreating them on every render
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

  // Custom tooltip for transaction activity
  const TransactionActivityTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white text-base">
            {new Date(label).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            <span className="font-medium">Transactions:</span>{" "}
            {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

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

  // Înlocuim useEffect-ul care face fetch cu unul care procesează datele primite
  // Add a ref to track if we've already processed the data
  const dataProcessedRef = useRef(false);

  useEffect(() => {
    if (isLoading) {
      setLoading(true);
      dataProcessedRef.current = false;
      return;
    }

    // Folosim o referință pentru a verifica dacă datele s-au schimbat cu adevărat
    const holdingsKey =
      holdings && holdings.length
        ? JSON.stringify(
            holdings.map((h) => h.tokenInfo?.contractAddress + h.balance)
          )
        : "empty-holdings";

    const transactionsKey =
      transactions && transactions.length > 0
        ? transactions[0].transactionHash
        : "empty-transactions";

    const dataKey = `${holdingsKey}-${transactionsKey}-${ethBalance}`;

    // Verificăm dacă datele sunt identice cu cele procesate anterior
    if (previousDataRef.current === dataKey || dataProcessedRef.current) {
      setLoading(false);
      if (onLoadingChange) onLoadingChange(false);
      return;
    }

    // Actualizăm referința cu noile date
    previousDataRef.current = dataKey;
    dataProcessedRef.current = true;

    try {
      // Procesăm datele primite
      let totalTokenValue = 0;
      const processedTokens = holdings.map((token: TokenData) => {
        if (!token || !token.tokenInfo) {
          return {
            ...token,
            formattedBalance: 0,
            value: 0,
          };
        }

        const decimals = Number(token.tokenInfo.decimals) || 0;
        const formattedBalance = Number(token.balance) / Math.pow(10, decimals);
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

      // Calculăm valorile pentru statistici
      let incomingValue = 0;
      let outgoingValue = 0;

      if (transactions && transactions.length) {
        transactions.forEach((tx: TransactionData) => {
          if (tx.to && tx.to.toLowerCase() === address.toLowerCase()) {
            incomingValue += tx.value || 0;
          } else if (
            tx.from &&
            tx.from.toLowerCase() === address.toLowerCase()
          ) {
            outgoingValue += tx.value || 0;
          }
        });
      }

      // Verificăm dacă există deja un token ETH pentru a evita numărarea dublă
      const ethToken = processedTokens.find(
        (token) =>
          token.tokenInfo?.symbol?.toLowerCase() === "eth" &&
          !token.tokenInfo?.name?.toLowerCase().includes("defi")
      );

      // Calculăm valoarea ETH
      const ethValue = ethBalance * ethPrice;

      // Calculăm valoarea totală a portofoliului, evitând dublarea ETH
      const totalPortfolioValue = totalTokenValue + (ethToken ? 0 : ethValue);

      // Adăugăm procentajele la fiecare token
      const tokensWithPercentages = processedTokens
        .map((token) => ({
          ...token,
          percentage:
            token.value && totalPortfolioValue > 0
              ? (token.value / totalPortfolioValue) * 100
              : 0,
        }))
        .sort((a, b) => (b.value || 0) - (a.value || 0));

      // Actualizăm statisticile
      const updatedStats = {
        totalValue: totalPortfolioValue,
        ethBalance,
        ethPrice,
        tokenCount: processedTokens.length,
        transactionCount: transactions?.length || 0,
        lastActivity:
          transactions?.length > 0 ? transactions[0].timestamp : null,
        incomingValue,
        outgoingValue,
      };

      setStats(updatedStats);
      setHoldings(tokensWithPercentages);

      // Actualizăm statisticile în componenta părinte
      if (onStatsUpdate) {
        onStatsUpdate({
          totalValue: totalPortfolioValue,
          tokenCount: processedTokens.length,
          ethBalance,
        });
      }
    } catch (err) {
      console.error("Eroare la procesarea datelor:", err);
    } finally {
      setLoading(false);
      if (onLoadingChange) onLoadingChange(false);
    }
  }, [holdings, transactions, ethBalance, ethPrice, isLoading, address]);

  // Modificăm funcția handleRefresh pentru a utiliza funcția primită prin props
  const handleRefresh = useCallback(() => {
    if (refreshData) {
      // Resetăm referința pentru a forța procesarea datelor
      previousDataRef.current = null;
      refreshData();
    }
  }, [refreshData]);

  // Modificăm funcția assetDistributionData pentru a filtra tokenurile cu procent sub 1%
  // și pentru a îmbunătăți afișarea numelor pe grafic

  // Înlocuiește funcția assetDistributionData existentă cu aceasta:
  const assetDistributionData = useMemo(() => {
    if (!stats || stats.totalValue === 0 || processedHoldings.length === 0) {
      return [] as AssetDistributionItem[];
    }

    // Verificăm dacă ETH există deja în holdings
    const ethTokenExists = processedHoldings.some(
      (token) =>
        token.tokenInfo.symbol.toLowerCase() === "eth" &&
        !token.tokenInfo.name.toLowerCase().includes("defi")
    );

    // Calculăm valoarea ETH
    const ethValue = stats.ethBalance * stats.ethPrice;

    // Creăm un array cu toate tokenurile
    const allAssets: AssetDistributionItem[] = [];

    // Valoarea totală a tokenurilor mici (<1%)
    let smallTokensValue = 0;
    // Array pentru a ține evidența tokenurilor mici
    const smallTokens: AssetDistributionItem[] = [];

    // Adăugăm ETH doar dacă are valoare și nu există deja în holdings
    if (ethValue > 0 && !ethTokenExists) {
      const ethPercentage = (ethValue / stats.totalValue) * 100;
      if (ethPercentage >= 1) {
        allAssets.push({
          name: "ETH",
          symbol: "ETH",
          value: ethValue,
          percentage: ethPercentage,
        });
      } else {
        smallTokensValue += ethValue;
        smallTokens.push({
          name: "ETH",
          symbol: "ETH",
          value: ethValue,
          percentage: ethPercentage,
        });
      }
    }

    // Procesăm toate tokenurile
    processedHoldings.forEach((token) => {
      if (token.value && token.value > 0) {
        // Calculăm procentul
        const percentage = (token.value / stats.totalValue) * 100;

        // Verificăm dacă tokenul are procent >= 1%
        if (percentage >= 1) {
          allAssets.push({
            name: token.tokenInfo.name,
            symbol: token.tokenInfo.symbol,
            value: token.value,
            percentage: percentage,
          });
        } else {
          // Adăugăm valoarea la tokenurile mici
          smallTokensValue += token.value;
          smallTokens.push({
            name: token.tokenInfo.name,
            symbol: token.tokenInfo.symbol,
            value: token.value,
            percentage: percentage,
          });
        }
      }
    });

    // Sortăm tokenurile după valoare (descrescător)
    allAssets.sort((a, b) => b.value - a.value);

    // Luăm primele 6 active pentru afișare individuală
    const topAssets = allAssets.slice(0, 6);

    // Combinăm restul activelor semnificative într-o categorie "Others"
    const otherSignificantAssets = allAssets.slice(6);
    const otherSignificantValue = otherSignificantAssets.reduce(
      (sum, asset) => sum + asset.value,
      0
    );

    // Valoarea totală pentru "Others" (tokenuri semnificative > 6 + tokenuri mici < 1%)
    const otherValue = otherSignificantValue + smallTokensValue;

    // Adăugăm categoria "Others" doar dacă există active suplimentare
    if (otherValue > 0) {
      const otherPercentage = (otherValue / stats.totalValue) * 100;
      topAssets.push({
        name: "Others",
        symbol: "OTHERS",
        value: otherValue,
        percentage: otherPercentage,
        smallTokens: [...otherSignificantAssets, ...smallTokens], // Păstrăm referința la tokenurile incluse în "Others"
      });
    }

    return topAssets;
  }, [stats, processedHoldings]);

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

  // Funcție pentru reîmprospătarea datelor

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
