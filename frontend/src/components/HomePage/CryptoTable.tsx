"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowUp,
  FiArrowDown,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiInfo,
  FiDollarSign,
  FiTrendingUp,
  FiBarChart2,
  FiCircle,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import type { Cryptocurrency } from "../../types";

// Utility for price formatting
const formatPrice = (price: number | undefined): string => {
  if (!price && price !== 0) return "—";
  if (price < 0.01) return price.toFixed(8).replace(/\.?0+$/, "");
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: price < 1 ? 6 : 2,
  }).format(price);
};

// Utility for formatting large numbers
const formatNumber = (num: number | undefined): string => {
  if (!num && num !== 0) return "—";
  return new Intl.NumberFormat().format(num);
};

// Utility for formatting market cap
const formatMarketCap = (marketCap: number | undefined): string => {
  if (!marketCap && marketCap !== 0) return "—";
  if (marketCap >= 1_000_000_000_000) {
    return `$${(marketCap / 1_000_000_000_000).toFixed(2)}T`;
  }
  if (marketCap >= 1_000_000_000) {
    return `$${(marketCap / 1_000_000_000).toFixed(2)}B`;
  }
  if (marketCap >= 1_000_000) {
    return `$${(marketCap / 1_000_000).toFixed(2)}M`;
  }
  return `$${formatNumber(marketCap)}`;
};

interface CryptoRowProps {
  crypto: Cryptocurrency;
  index: number;
  itemsPerPage: number;
  currentPage: number;
  navigate: (path: string) => void;
  isEven: boolean;
}

// Table row component for better performance
const CryptoRow = React.memo(
  ({
    crypto,
    index,
    itemsPerPage,
    currentPage,
    navigate,
    isEven,
  }: CryptoRowProps) => {
    const maxSupply = crypto.max_supply || crypto.total_supply;
    const progress = maxSupply
      ? (crypto.circulating_supply / maxSupply) * 100
      : 0;
    const priceChangeClass =
      crypto.price_change_percentage_24h >= 0
        ? "text-emerald-500 dark:text-emerald-400"
        : "text-rose-500 dark:text-rose-400";

    return (
      <motion.tr
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: index * 0.03 }}
        onClick={() => navigate(`/currencies/${crypto.id}`)}
        className={`group hover:bg-teal-50/60 dark:hover:bg-teal-900/30 transition-colors cursor-pointer border-b border-gray-200/20 dark:border-gray-700/20 ${
          isEven ? "bg-white/20 dark:bg-gray-800/20" : "bg-transparent"
        }`}
      >
        <td className="py-5 px-6 text-gray-600 dark:text-gray-300 font-medium text-base">
          {index + 1 + (currentPage - 1) * itemsPerPage}
        </td>
        <td className="py-5 px-6">
          <div className="flex items-center space-x-3">
            <div className="relative flex-shrink-0">
              <img
                src={crypto.image || "/placeholder.svg"}
                alt={crypto.name}
                className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-600 shadow-sm group-hover:border-teal-300 transition-colors"
                loading="lazy"
              />
              {crypto.market_cap_rank <= 10 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">
                    {crypto.market_cap_rank}
                  </span>
                </div>
              )}
            </div>
            <div>
              <div className="font-medium text-gray-800 dark:text-gray-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                {crypto.name}
              </div>
              <div className="text-xs text-teal-500 dark:text-teal-400 font-medium">
                {crypto.symbol.toUpperCase()}
              </div>
            </div>
          </div>
        </td>
        <td className="py-5 px-6 font-medium text-gray-800 dark:text-gray-100 text-base">
          ${formatPrice(crypto.current_price)}
        </td>
        <td
          className={`py-5 px-6 text-right font-medium ${priceChangeClass} text-base`}
        >
          <div className="flex items-center justify-end">
            {crypto.price_change_percentage_24h >= 0 ? (
              <FiArrowUp className="mr-1" size={12} />
            ) : (
              <FiArrowDown className="mr-1" size={12} />
            )}
            {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
          </div>
        </td>
        <td className="py-5 px-6 text-right font-medium text-gray-800 dark:text-gray-100 text-base">
          {formatMarketCap(crypto.market_cap)}
        </td>
        <td className="py-5 px-6 text-right text-base">
          {progress >= 100 ? (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatNumber(crypto.circulating_supply)}
            </span>
          ) : (
            <div className="flex flex-col items-end space-y-1">
              <div className="w-full max-w-[120px] bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-teal-400 to-emerald-500"
                  style={{
                    width: `${progress.toFixed(2)}%`,
                  }}
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <span className="text-teal-500 dark:text-teal-400 font-medium">
                  {progress.toFixed(0)}%
                </span>
              </div>
            </div>
          )}
        </td>
      </motion.tr>
    );
  }
);

interface EmptyStateProps {
  message: string;
  icon: React.ReactNode;
}

// Empty state component
const EmptyState = ({ message, icon }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-20 px-4">
    <div className="bg-white/30 dark:bg-gray-800/30 rounded-full p-6 mb-6">
      {icon}
    </div>
    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
      No results found
    </h3>
    <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
      {message}
    </p>
  </div>
);

// Loading skeleton component
const TableSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-t-lg mb-2"></div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 mb-2"></div>
    ))}
  </div>
);

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

// Error state component
const ErrorState = ({ error, onRetry }: ErrorStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-4 mb-4">
      <FiInfo className="text-red-500 h-6 w-6" />
    </div>
    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
      Failed to load data
    </h3>
    <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-4">
      {error}
    </p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors flex items-center"
    >
      <FiRefreshCw className="mr-2" /> Try Again
    </button>
  </div>
);

interface CryptoTableProps {
  cryptoData: Cryptocurrency[];
  isLoading: boolean;
  error: string | null;
}

function CryptoTable({ cryptoData, isLoading, error }: CryptoTableProps) {
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Cryptocurrency;
    direction: "asc" | "desc";
  }>({
    key: "market_cap_rank",
    direction: "asc",
  });
  const [itemsPerPage, setItemsPerPage] = useState<number>(() => {
    return Number(localStorage.getItem("cryptoItemsPerPage")) || 10;
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterConfig, setFilterConfig] = useState<{
    priceChange: "all" | "positive" | "negative";
    marketCap: "all" | "large" | "medium" | "small";
  }>({
    priceChange: "all", // all, positive, negative
    marketCap: "all", // all, large, medium, small
  });
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  // Reset page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [cryptoData, searchTerm, filterConfig]);

  // Apply sorting and filtering
  const filteredAndSortedData = useMemo(() => {
    if (!cryptoData) return [];

    // First apply search filter
    let filtered = cryptoData.filter(
      (coin) =>
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Then apply other filters
    if (filterConfig.priceChange === "positive") {
      filtered = filtered.filter(
        (coin) => coin.price_change_percentage_24h >= 0
      );
    } else if (filterConfig.priceChange === "negative") {
      filtered = filtered.filter(
        (coin) => coin.price_change_percentage_24h < 0
      );
    }

    const ONE_BILLION = 1_000_000_000;
    const TEN_BILLION = 10_000_000_000;

    if (filterConfig.marketCap === "large") {
      filtered = filtered.filter((coin) => coin.market_cap >= TEN_BILLION); // $10B+
    } else if (filterConfig.marketCap === "medium") {
      filtered = filtered.filter(
        (coin) =>
          coin.market_cap >= ONE_BILLION && coin.market_cap < TEN_BILLION
      ); // $1B-$10B
    } else if (filterConfig.marketCap === "small") {
      filtered = filtered.filter((coin) => coin.market_cap < ONE_BILLION); // <$1B
    }

    // Then sort
    return [...filtered].sort((a, b) => {
      const { key, direction } = sortConfig;
      const aValue = a[key];
      const bValue = b[key];

      if (aValue == null) return direction === "asc" ? 1 : -1;
      if (bValue == null) return direction === "asc" ? -1 : 1;

      if (typeof aValue === "number" && typeof bValue === "number") {
        return direction === "asc" ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });
  }, [cryptoData, sortConfig, searchTerm, filterConfig]);

  const requestSort = (key: keyof Cryptocurrency) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSortIcon = (key: keyof Cryptocurrency) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <FiArrowUp className="ml-1" size={12} />
    ) : (
      <FiArrowDown className="ml-1" size={12} />
    );
  };

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const currentData = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
    // Scroll to top of table
    document
      .getElementById("crypto-table-container")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleItemsPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = Number(event.target.value);
    setItemsPerPage(value);
    localStorage.setItem("cryptoItemsPerPage", value.toString());
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterConfig({
      priceChange: "all",
      marketCap: "all",
    });
    setIsFilterOpen(false);
  };

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  // Calculate visible page numbers for pagination
  const getVisiblePageNumbers = () => {
    const delta = 2; // Number of pages to show before and after current page
    const range: Array<number | string> = [];

    for (
      let i = Math.max(1, currentPage - delta);
      i <= Math.min(totalPages, currentPage + delta);
      i++
    ) {
      range.push(i);
    }
    // Add first page if not already in range
    if (typeof range[0] === "number" && range[0] > 1) {
      if (range[0] > 2) {
        range.unshift("...");
      }
      range.unshift(1);
    }

    // Add last page if not already in range
    const last = range[range.length - 1];
    if (typeof last === "number" && last < totalPages) {
      if (last < totalPages - 1) {
        range.push("...");
      }
      range.push(totalPages);
    }

    return range;
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Cryptocurrency Market
              </h2>
              <div className="animate-pulse w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
            <TableSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
          <div className="p-6">
            <ErrorState error={error} onRetry={handleRetry} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="crypto-table-container"
      className="w-full max-w-full mx-auto px-6 py-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-transparent backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-200/30 dark:border-gray-700/30"
      >
        {/* Header with search and filters */}
        <div className="p-8 border-b border-gray-200/30 dark:border-gray-700/30 bg-white/40 dark:bg-dark-secondary/40">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text-primary flex items-center">
              <FiBarChart2 className="mr-2" />
              Cryptocurrency Market
              {filteredAndSortedData.length > 0 && (
                <span className="ml-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                  {filteredAndSortedData.length}
                </span>
              )}
            </h2>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search coins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full sm:w-64 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <FiX size={16} />
                  </button>
                )}
              </div>

              {/* Filter button */}
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`px-4 py-2 rounded-lg flex items-center justify-center transition-colors ${
                    isFilterOpen ||
                    filterConfig.priceChange !== "all" ||
                    filterConfig.marketCap !== "all"
                      ? "bg-teal-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <FiFilter className="mr-2" />
                  Filters
                  {(filterConfig.priceChange !== "all" ||
                    filterConfig.marketCap !== "all") && (
                    <span className="ml-2 bg-white text-teal-500 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {(filterConfig.priceChange !== "all" ? 1 : 0) +
                        (filterConfig.marketCap !== "all" ? 1 : 0)}
                    </span>
                  )}
                </button>

                {/* Filter dropdown */}
                <AnimatePresence>
                  {isFilterOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-80 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50 z-10"
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-medium text-gray-800 dark:text-white">
                            Filters
                          </h3>
                          <button
                            onClick={clearFilters}
                            className="text-xs text-teal-500 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300"
                          >
                            Clear All
                          </button>
                        </div>

                        {/* Price Change Filter */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Price Change (24h)
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={() =>
                                setFilterConfig({
                                  ...filterConfig,
                                  priceChange: "all",
                                })
                              }
                              className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
                                filterConfig.priceChange === "all"
                                  ? "bg-teal-500 text-white"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                              }`}
                            >
                              All
                            </button>
                            <button
                              onClick={() =>
                                setFilterConfig({
                                  ...filterConfig,
                                  priceChange: "positive",
                                })
                              }
                              className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
                                filterConfig.priceChange === "positive"
                                  ? "bg-emerald-500 text-white"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                              }`}
                            >
                              Positive
                            </button>
                            <button
                              onClick={() =>
                                setFilterConfig({
                                  ...filterConfig,
                                  priceChange: "negative",
                                })
                              }
                              className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
                                filterConfig.priceChange === "negative"
                                  ? "bg-rose-500 text-white"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                              }`}
                            >
                              Negative
                            </button>
                          </div>
                        </div>

                        {/* Market Cap Filter */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Market Cap
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() =>
                                setFilterConfig({
                                  ...filterConfig,
                                  marketCap: "all",
                                })
                              }
                              className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
                                filterConfig.marketCap === "all"
                                  ? "bg-teal-500 text-white"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                              }`}
                            >
                              All
                            </button>
                            <button
                              onClick={() =>
                                setFilterConfig({
                                  ...filterConfig,
                                  marketCap: "large",
                                })
                              }
                              className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
                                filterConfig.marketCap === "large"
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                              }`}
                            >
                              Large Cap ($10B+)
                            </button>
                            <button
                              onClick={() =>
                                setFilterConfig({
                                  ...filterConfig,
                                  marketCap: "medium",
                                })
                              }
                              className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
                                filterConfig.marketCap === "medium"
                                  ? "bg-purple-500 text-white"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                              }`}
                            >
                              Mid Cap ($1B-$10B)
                            </button>
                            <button
                              onClick={() =>
                                setFilterConfig({
                                  ...filterConfig,
                                  marketCap: "small",
                                })
                              }
                              className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
                                filterConfig.marketCap === "small"
                                  ? "bg-amber-500 text-white"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                              }`}
                            >
                              Small Cap ($1B)
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {currentData.length === 0 ? (
            <EmptyState
              message={
                searchTerm
                  ? `No cryptocurrencies found matching "${searchTerm}"`
                  : "No cryptocurrencies found matching your filters"
              }
              icon={<FiCircle className="h-6 w-6 text-gray-400" />}
            />
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white/30 dark:bg-dark-secondary/30 text-gray-600 dark:text-dark-text-primary text-base border-b border-gray-200/30 dark:border-gray-700/30">
                  <th
                    className="py-4 px-4 font-medium text-left cursor-pointer hover:text-teal-500 transition-colors"
                    onClick={() => requestSort("market_cap_rank")}
                  >
                    <div className="flex items-center">
                      # {getSortIcon("market_cap_rank")}
                    </div>
                  </th>
                  <th className="py-4 px-4 font-medium text-left">Coin</th>
                  <th
                    className="py-4 px-4 font-medium text-left cursor-pointer hover:text-teal-500 transition-colors"
                    onClick={() => requestSort("current_price")}
                  >
                    <div className="flex items-center">
                      <FiDollarSign className="mr-1" size={14} />
                      Price {getSortIcon("current_price")}
                    </div>
                  </th>
                  <th
                    className="py-4 px-4 font-medium text-right cursor-pointer hover:text-teal-500 transition-colors"
                    onClick={() => requestSort("price_change_percentage_24h")}
                  >
                    <div className="flex items-center justify-end">
                      <FiTrendingUp className="mr-1" size={14} />
                      24h {getSortIcon("price_change_percentage_24h")}
                    </div>
                  </th>
                  <th
                    className="py-4 px-4 font-medium text-right cursor-pointer hover:text-teal-500 transition-colors"
                    onClick={() => requestSort("market_cap")}
                  >
                    <div className="flex items-center justify-end">
                      <FiBarChart2 className="mr-1" size={14} />
                      Market Cap {getSortIcon("market_cap")}
                    </div>
                  </th>
                  <th className="py-4 px-4 font-medium text-right">Supply</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((crypto, index) => (
                  <CryptoRow
                    key={crypto.id}
                    crypto={crypto}
                    index={index}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    navigate={navigate}
                    isEven={index % 2 === 1}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="px-8 py-6 bg-white/30 dark:bg-dark-secondary/30 border-t border-gray-200/30 dark:border-gray-700/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2 text-base text-gray-600 dark:text-gray-300">
            <span>Show</span>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-teal-500 focus:outline-none dark:text-white"
            >
              {[10, 20, 50, 100].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
            <span>items per page</span>
          </div>

          <div className="flex items-center">
            <div className="hidden sm:flex mr-4 text-sm text-gray-600 dark:text-gray-300">
              Showing {(currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(
                currentPage * itemsPerPage,
                filteredAndSortedData.length
              )}{" "}
              of {filteredAndSortedData.length}
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="First page"
              >
                <FiChevronsLeft size={18} />
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <FiChevronLeft size={18} />
              </button>

              {/* Page numbers */}
              <div className="hidden sm:flex">
                {getVisiblePageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      typeof page === "number" ? handlePageChange(page) : null
                    }
                    disabled={page === "..."}
                    className={`w-12 h-12 flex items-center justify-center rounded-md text-base ${
                      page === currentPage
                        ? "bg-teal-500 text-white"
                        : page === "..."
                        ? "text-gray-600 dark:text-gray-300 cursor-default"
                        : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              {/* Mobile page indicator */}
              <div className="sm:hidden flex items-center justify-center min-w-[80px] h-10 text-gray-600 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <FiChevronRight size={18} />
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Last page"
              >
                <FiChevronsRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default React.memo(CryptoTable);
