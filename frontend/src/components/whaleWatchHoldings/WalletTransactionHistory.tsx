"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { CHAIN_NATIVE_TOKENS } from "../../utils/API/etherScanAPI"
import { motion } from "framer-motion"
import { FiExternalLink, FiArrowUp, FiArrowDown, FiFilter, FiSearch, FiClock, FiRefreshCw } from "react-icons/fi"
import WalletLoadingState from "./components/WalletLoadingState"

// Update the interface to include chainId
interface WalletTransactionHistoryProps {
  address: string
  onLoadingChange?: (loading: boolean) => void
  transactions?: TransactionData[]
  isLoading?: boolean
  error?: string | null
  loadingStatus?: string
  refreshData?: () => void
  chainId?: number
}

interface TransactionData {
  timestamp: number
  transactionHash: string
  value: number
  from: string
  to: string
  isError?: string
  gasUsed?: string
  gasPrice?: string
  tokenSymbol?: string
  tokenName?: string
  tokenDecimal?: string
}

// Update the component to use chainId
const WalletTransactionHistory: React.FC<WalletTransactionHistoryProps> = ({
  address,
  onLoadingChange,
  transactions = [],
  isLoading = false,
  error = null,
  loadingStatus = "Inițializare...",
  refreshData,
  chainId = 1,
}) => {
  const [loading, setLoading] = useState(isLoading)
  const [localError, setLocalError] = useState<string | null>(error)
  const [processedTransactions, setProcessedTransactions] = useState<TransactionData[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "incoming" | "outgoing">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const transactionsPerPage = 10

  // Use refs to prevent duplicate requests and infinite loops
  const isLoadingRef = useRef(false)
  const previousAddressRef = useRef("")
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }
    }
  }, [address])

  // Înlocuim useEffect-ul care face fetch cu unul care procesează datele primite
  useEffect(() => {
    if (isLoading) {
      setLoading(true)
      return
    }

    try {
      // Sortăm tranzacțiile după timestamp (cele mai noi primele)
      const sortedTransactions: TransactionData[] = [...transactions].sort(
        (a: TransactionData, b: TransactionData) => b.timestamp - a.timestamp,
      )

      setProcessedTransactions(sortedTransactions)
      setFilteredTransactions(sortedTransactions)
      setLocalError(null)
    } catch (err: any) {
      console.error("Eroare la procesarea tranzacțiilor:", err)
      setLocalError(err.message || "Eroare la procesarea datelor")
    } finally {
      setLoading(false)
      if (onLoadingChange) onLoadingChange(false)
    }
  }, [transactions, isLoading, onLoadingChange])

  // Filter transactions based on search term and filter type
  useEffect(() => {
    let filtered = [...processedTransactions]

    // Apply type filter
    if (filter === "incoming") {
      filtered = filtered.filter((tx) => tx.to && tx.to.toLowerCase() === address.toLowerCase())
    } else if (filter === "outgoing") {
      filtered = filtered.filter((tx) => tx.from && tx.from.toLowerCase() === address.toLowerCase())
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (tx) =>
          tx.transactionHash.toLowerCase().includes(term) ||
          (tx.from && tx.from.toLowerCase().includes(term)) ||
          (tx.to && tx.to.toLowerCase().includes(term)) ||
          (tx.tokenSymbol && tx.tokenSymbol.toLowerCase().includes(term)),
      )
    }

    setFilteredTransactions(filtered)
    setCurrentPage(1) // Reset to first page when filtering
  }, [processedTransactions, searchTerm, filter, address])

  // Format timestamp to readable date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Format address for display
  const formatAddress = (addr: string, isCurrentWallet: boolean) => {
    if (isCurrentWallet) {
      return "This Wallet"
    }
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }

  // Update formatEthValue function to use the correct token symbol
  const formatNativeTokenValue = (value: number) => {
    try {
      if (value === 0) return `0 ${CHAIN_NATIVE_TOKENS[chainId]}`

      // Format with 6 decimal places for small values, fewer for larger values
      const formattedValue = value.toLocaleString("en-US", {
        maximumFractionDigits: value < 0.01 ? 6 : value < 1 ? 4 : 2,
      })

      return `${formattedValue} ${CHAIN_NATIVE_TOKENS[chainId]}`
    } catch (error) {
      console.error(`Error formatting ${CHAIN_NATIVE_TOKENS[chainId]} value:`, error)
      return `${value} ${CHAIN_NATIVE_TOKENS[chainId]}`
    }
  }

  // Update the explorer URL based on the chain
  const getExplorerUrl = (txHash: string) => {
    return chainId === 56 ? `https://bscscan.com/tx/${txHash}` : `https://etherscan.io/tx/${txHash}`
  }

  // Get transaction direction
  const getTransactionDirection = (tx: TransactionData) => {
    if (tx.to && tx.to.toLowerCase() === address.toLowerCase()) {
      return "incoming"
    }
    return "outgoing"
  }

  // Get current page transactions
  const getCurrentTransactions = () => {
    const indexOfLastTx = currentPage * transactionsPerPage
    const indexOfFirstTx = indexOfLastTx - transactionsPerPage
    return filteredTransactions.slice(indexOfFirstTx, indexOfLastTx)
  }

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  // Modificăm funcția handleRetry pentru a utiliza funcția primită prin props
  const handleRetry = () => {
    if (refreshData) {
      refreshData()
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <WalletLoadingState message="Loading Transaction History" status={loadingStatus} />
      </div>
    )
  }

  if (localError) {
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
    )
  }

  if (processedTransactions.length === 0) {
    return (
      <div className="text-center py-8 bg-white dark:bg-dark-secondary rounded-xl shadow border border-gray-100 dark:border-dark-tertiary">
        <div className="bg-gray-100 dark:bg-dark-tertiary rounded-full p-6 inline-flex mb-4">
          <FiClock className="h-12 w-12 text-dark-text-secondary" />
        </div>
        <h3 className="text-xl font-medium text-gray-800 dark:text-dark-text-primary mb-2">No transactions found</h3>
        <p className="text-gray-500 dark:text-dark-text-secondary max-w-md mx-auto">
          This wallet has no transactions or we couldn't retrieve the data. Check the address and try again.
        </p>
      </div>
    )
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
                  const direction = getTransactionDirection(tx)

                  return (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-dark-tertiary/50 transition-colors">
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
                              <FiArrowDown className={`h-4 w-4 text-green-600 dark:text-green-400`} />
                            ) : (
                              <FiArrowUp className={`h-4 w-4 text-red-600 dark:text-red-400`} />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-dark-text-primary">
                              {direction === "incoming" ? "Received" : "Sent"}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-dark-text-secondary">
                              {`${tx.transactionHash.substring(0, 8)}...${tx.transactionHash.substring(
                                tx.transactionHash.length - 8,
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
                          {formatAddress(tx.from, tx.from.toLowerCase() === address.toLowerCase())}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-dark-text-primary">
                          {formatAddress(tx.to, tx.to.toLowerCase() === address.toLowerCase())}
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
                          {formatNativeTokenValue(tx.value)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <a
                          href={getExplorerUrl(tx.transactionHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
                        >
                          <FiExternalLink className="inline h-5 w-5" />
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-dark-text-secondary">No transactions found matching your filters</p>
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
              length: Math.ceil(filteredTransactions.length / transactionsPerPage),
            }).map((_, index) => {
              // Show only a window of page numbers
              if (
                index === 0 ||
                index === Math.ceil(filteredTransactions.length / transactionsPerPage) - 1 ||
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
                )
              } else if (
                (index === currentPage - 3 && currentPage > 3) ||
                (index === currentPage + 3 &&
                  currentPage < Math.ceil(filteredTransactions.length / transactionsPerPage) - 3)
              ) {
                return (
                  <button
                    key={index}
                    className="px-4 py-2 border-t border-b border-gray-300 dark:border-dark-tertiary bg-white text-gray-700 dark:bg-dark-secondary dark:text-dark-text-secondary"
                    disabled
                  >
                    ...
                  </button>
                )
              }
              return null
            })}

            <button
              onClick={() =>
                paginate(
                  currentPage < Math.ceil(filteredTransactions.length / transactionsPerPage)
                    ? currentPage + 1
                    : currentPage,
                )
              }
              disabled={currentPage === Math.ceil(filteredTransactions.length / transactionsPerPage)}
              className={`px-4 py-2 rounded-r-md border border-gray-300 dark:border-dark-tertiary ${
                currentPage === Math.ceil(filteredTransactions.length / transactionsPerPage)
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
  )
}

export default WalletTransactionHistory
