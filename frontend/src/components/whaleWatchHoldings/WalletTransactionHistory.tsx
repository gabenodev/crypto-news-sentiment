"use client";

import React from "react";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  fetchTransactionHistory,
  isValidEthereumAddress,
} from "../../utils/API/etherScanAPI";
import {
  FiExternalLink,
  FiArrowUp,
  FiArrowDown,
  FiFilter,
  FiSearch,
  FiClock,
  FiRefreshCw,
} from "react-icons/fi";

interface WalletTransactionHistoryProps {
  address: string;
  onLoadingChange?: (loading: boolean) => void;
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
  tokenSymbol?: string;
  tokenName?: string;
  tokenDecimal?: string;
}

const WalletTransactionHistory: React.FC<WalletTransactionHistoryProps> = ({
  address,
  onLoadingChange,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    TransactionData[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "incoming" | "outgoing">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [retryCount, setRetryCount] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState("Initializing...");
  const transactionsPerPage = 10;

  // Use refs to prevent duplicate requests and infinite loops
  const isLoadingRef = useRef(false);
  const previousAddressRef = useRef("");
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [address]);

  // Fetch transaction history
  useEffect(() => {
    // If we're already loading or the address hasn't changed, don't start a new load
    if (isLoadingRef.current || previousAddressRef.current === address) {
      return;
    }

    // Update refs
    isLoadingRef.current = true;
    previousAddressRef.current = address;

    const loadTransactions = async () => {
      try {
        setLoading(true);
        if (onLoadingChange) onLoadingChange(true);

        // Check if the address is valid
        if (!isValidEthereumAddress(address)) {
          throw new Error("Invalid Ethereum address");
        }

        setLoadingStatus("Fetching transaction history...");

        // Fetch transaction history using etherScanAPI
        const txHistory = await fetchTransactionHistory(address);

        // Sort transactions by timestamp (newest first)
        const sortedTransactions: TransactionData[] = txHistory.sort(
          (a: TransactionData, b: TransactionData) => b.timestamp - a.timestamp
        );

        setTransactions(sortedTransactions);
        setFilteredTransactions(sortedTransactions);
        setError(null);
        setRetryCount(0);
      } catch (err: any) {
        console.error("Error loading transactions:", err);

        // If we get an error and haven't retried too many times, retry
        if (retryCount < 3) {
          const nextRetryCount = retryCount + 1;
          setRetryCount(nextRetryCount);
          setError(`API error. Retrying... (${nextRetryCount}/3)`);
          setLoadingStatus(`Retrying... (Attempt ${nextRetryCount}/3)`);

          // Wait 2 seconds before retrying
          retryTimeoutRef.current = setTimeout(() => {
            retryTimeoutRef.current = null;
            isLoadingRef.current = false; // Reset loading ref to allow retry
            loadTransactions();
          }, 2000);
          return;
        }

        setError(err.message || "Failed to load transaction data");
      } finally {
        // Only set loading to false if we're not in a retry cycle
        if (!retryTimeoutRef.current) {
          setLoading(false);
          if (onLoadingChange) onLoadingChange(false);
          isLoadingRef.current = false;
        }
      }
    };

    loadTransactions();
  }, [address, onLoadingChange, retryCount]);

  // Filter transactions based on search term and filter type
  useEffect(() => {
    let filtered = [...transactions];

    // Apply type filter
    if (filter === "incoming") {
      filtered = filtered.filter(
        (tx) => tx.to && tx.to.toLowerCase() === address.toLowerCase()
      );
    } else if (filter === "outgoing") {
      filtered = filtered.filter(
        (tx) => tx.from && tx.from.toLowerCase() === address.toLowerCase()
      );
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          tx.transactionHash.toLowerCase().includes(term) ||
          (tx.from && tx.from.toLowerCase().includes(term)) ||
          (tx.to && tx.to.toLowerCase().includes(term)) ||
          (tx.tokenSymbol && tx.tokenSymbol.toLowerCase().includes(term))
      );
    }

    setFilteredTransactions(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [transactions, searchTerm, filter, address]);

  // Format timestamp to readable date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format address for display
  const formatAddress = (addr: string, isCurrentWallet: boolean) => {
    if (isCurrentWallet) {
      return "This Wallet";
    }
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Format ETH value with full numbers
  const formatEthValue = (value: number) => {
    if (value === 0) return "0 ETH";

    // Format with 6 decimal places for small values, fewer for larger values
    const formattedValue = value.toLocaleString("en-US", {
      maximumFractionDigits: value < 0.01 ? 6 : value < 1 ? 4 : 2,
    });

    return `${formattedValue} ETH`;
  };

  // Get transaction direction
  const getTransactionDirection = (tx: TransactionData) => {
    if (tx.to && tx.to.toLowerCase() === address.toLowerCase()) {
      return "incoming";
    }
    return "outgoing";
  };

  // Get current page transactions
  const getCurrentTransactions = () => {
    const indexOfLastTx = currentPage * transactionsPerPage;
    const indexOfFirstTx = indexOfLastTx - transactionsPerPage;
    return filteredTransactions.slice(indexOfFirstTx, indexOfLastTx);
  };

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Retry loading transactions
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
        <p className="text-gray-600 dark:text-dark-text-primary">
          {loadingStatus}
        </p>
        <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-2">
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

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 bg-white dark:bg-dark-secondary rounded-xl shadow border border-gray-100 dark:border-dark-tertiary">
        <div className="bg-gray-100 dark:bg-dark-tertiary rounded-full p-6 inline-flex mb-4">
          <FiClock className="h-12 w-12 text-dark-text-secondary" />
        </div>
        <h3 className="text-xl font-medium text-gray-800 dark:text-dark-text-primary mb-2">
          No transactions found
        </h3>
        <p className="text-gray-500 dark:text-dark-text-secondary max-w-md mx-auto">
          This wallet has no transactions or we couldn't retrieve the data.
          Check the address and try again.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Filters and search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
              filter === "all"
                ? "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
                : "bg-gray-100 text-gray-700 dark:bg-dark-tertiary dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-tertiary/80"
            }`}
          >
            <FiFilter className="mr-2" />
            All
          </button>
          <button
            onClick={() => setFilter("incoming")}
            className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
              filter === "incoming"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                : "bg-gray-100 text-gray-700 dark:bg-dark-tertiary dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-tertiary/80"
            }`}
          >
            <FiArrowDown className="mr-2" />
            Received
          </button>
          <button
            onClick={() => setFilter("outgoing")}
            className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
              filter === "outgoing"
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                : "bg-gray-100 text-gray-700 dark:bg-dark-tertiary dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-tertiary/80"
            }`}
          >
            <FiArrowUp className="mr-2" />
            Sent
          </button>
        </div>

        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-dark-tertiary dark:border-dark-tertiary dark:text-dark-text-primary focus:ring-2 focus:ring-accent-primary focus:border-accent-primary"
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-text-secondary" />
        </div>
      </div>

      {/* Transactions table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-dark-secondary rounded-xl shadow border border-gray-100 dark:border-dark-tertiary mb-6"
      >
        {filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-tertiary">
              <thead className="bg-gray-50 dark:bg-dark-tertiary">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider"
                  >
                    Transaction
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider"
                  >
                    From
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider"
                  >
                    To
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-secondary divide-y divide-gray-200 dark:divide-dark-tertiary">
                {getCurrentTransactions().map((tx, idx) => {
                  const direction = getTransactionDirection(tx);

                  return (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50 dark:hover:bg-dark-tertiary/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className={`p-2 rounded-full mr-3 ${
                              direction === "incoming"
                                ? "bg-green-100 dark:bg-green-900/30"
                                : "bg-red-100 dark:bg-red-900/30"
                            }`}
                          >
                            {direction === "incoming" ? (
                              <FiArrowDown
                                className={`h-4 w-4 text-green-600 dark:text-green-400`}
                              />
                            ) : (
                              <FiArrowUp
                                className={`h-4 w-4 text-red-600 dark:text-red-400`}
                              />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-dark-text-primary">
                              {direction === "incoming" ? "Received" : "Sent"}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-dark-text-secondary">
                              {`${tx.transactionHash.substring(
                                0,
                                8
                              )}...${tx.transactionHash.substring(
                                tx.transactionHash.length - 8
                              )}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-dark-text-primary">
                          {formatDate(tx.timestamp)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-dark-text-primary">
                          {formatAddress(
                            tx.from,
                            tx.from.toLowerCase() === address.toLowerCase()
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-dark-text-primary">
                          {formatAddress(
                            tx.to,
                            tx.to.toLowerCase() === address.toLowerCase()
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div
                          className={`text-sm font-medium ${
                            direction === "incoming"
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {direction === "incoming" ? "+" : "-"}
                          {formatEthValue(tx.value)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <a
                          href={`https://etherscan.io/tx/${tx.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
                        >
                          <FiExternalLink className="inline h-5 w-5" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-dark-text-secondary">
              No transactions found matching your filters
            </p>
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {filteredTransactions.length > transactionsPerPage && (
        <div className="flex justify-center mt-6">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-l-md border border-gray-300 dark:border-dark-tertiary ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 dark:bg-dark-tertiary dark:text-dark-text-secondary cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-dark-secondary dark:text-dark-text-primary dark:hover:bg-dark-tertiary/80 transition-colors"
              }`}
            >
              Previous
            </button>

            {Array.from({
              length: Math.ceil(
                filteredTransactions.length / transactionsPerPage
              ),
            }).map((_, index) => {
              // Show only a window of page numbers
              if (
                index === 0 ||
                index ===
                  Math.ceil(filteredTransactions.length / transactionsPerPage) -
                    1 ||
                (index >= currentPage - 2 && index <= currentPage + 2)
              ) {
                return (
                  <button
                    key={index}
                    onClick={() => paginate(index + 1)}
                    className={`px-4 py-2 border-t border-b border-gray-300 dark:border-dark-tertiary ${
                      currentPage === index + 1
                        ? "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 font-medium"
                        : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-dark-secondary dark:text-dark-text-primary dark:hover:bg-dark-tertiary/80 transition-colors"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              } else if (
                (index === currentPage - 3 && currentPage > 3) ||
                (index === currentPage + 3 &&
                  currentPage <
                    Math.ceil(
                      filteredTransactions.length / transactionsPerPage
                    ) -
                      3)
              ) {
                return (
                  <button
                    key={index}
                    className="px-4 py-2 border-t border-b border-gray-300 dark:border-dark-tertiary bg-white text-gray-700 dark:bg-dark-secondary dark:text-dark-text-secondary"
                    disabled
                  >
                    ...
                  </button>
                );
              }
              return null;
            })}

            <button
              onClick={() =>
                paginate(
                  currentPage <
                    Math.ceil(filteredTransactions.length / transactionsPerPage)
                    ? currentPage + 1
                    : currentPage
                )
              }
              disabled={
                currentPage ===
                Math.ceil(filteredTransactions.length / transactionsPerPage)
              }
              className={`px-4 py-2 rounded-r-md border border-gray-300 dark:border-dark-tertiary ${
                currentPage ===
                Math.ceil(filteredTransactions.length / transactionsPerPage)
                  ? "bg-gray-100 text-gray-400 dark:bg-dark-tertiary dark:text-dark-text-secondary cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-dark-secondary dark:text-dark-text-primary dark:hover:bg-dark-tertiary/80 transition-colors"
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default WalletTransactionHistory;
