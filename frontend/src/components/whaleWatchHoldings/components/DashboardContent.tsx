"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { FiArrowLeft } from "react-icons/fi"
import type { DashboardContentProps } from "../types"
import WalletOverview from "../WalletOverview"
import WalletHoldings from "../WalletHoldings"
import WalletTransactionHistory from "../WalletTransactionHistory"

const DashboardContent: React.FC<DashboardContentProps> = ({
  activeTab,
  address,
  holdings,
  transactions,
  ethBalance,
  ethPrice,
  isLoading,
  error,
  loadingStatus,
  refreshData,
  selectedChain,
  handleLoadingChange,
  handleStatsUpdate,
}) => {
  return (
    <div className="w-full lg:ml-80 flex-1 p-4 pt-4 mt-0">
      <div className="mb-4">
        <Link
          to="/wallet-holdings"
          className="inline-flex items-center text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          <span>Back to Wallet Search</span>
        </Link>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg">
          <p className="text-red-700 dark:text-red-400 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
          <p className="mt-2 text-sm text-red-600 dark:text-red-300">
            {selectedChain === 56 ? "BscScan" : "Etherscan"} API may be temporarily unavailable or has reached its rate
            limit. Try again later or check another wallet.
          </p>
          <button
            onClick={refreshData}
            className="mt-3 px-4 py-2 bg-red-100 dark:bg-red-800/30 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Content based on active tab */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-16"
      >
        {activeTab === "overview" && (
          <WalletOverview
            address={address}
            onLoadingChange={handleLoadingChange}
            onStatsUpdate={handleStatsUpdate}
            holdings={holdings}
            transactions={transactions}
            ethBalance={ethBalance}
            ethPrice={ethPrice}
            isLoading={isLoading}
            error={error}
            loadingStatus={loadingStatus}
            refreshData={refreshData}
            chainId={selectedChain}
          />
        )}
        {activeTab === "holdings" && (
          <WalletHoldings
            address={address}
            onLoadingChange={handleLoadingChange}
            onStatsUpdate={handleStatsUpdate}
            holdings={holdings}
            ethBalance={ethBalance}
            ethPrice={ethPrice}
            isLoading={isLoading}
            error={error}
            loadingStatus={loadingStatus}
            refreshData={refreshData}
            chainId={selectedChain}
          />
        )}
        {activeTab === "transactions" && (
          <WalletTransactionHistory
            address={address}
            onLoadingChange={handleLoadingChange}
            transactions={transactions}
            isLoading={isLoading}
            error={error}
            loadingStatus={loadingStatus}
            refreshData={refreshData}
            chainId={selectedChain}
          />
        )}
      </motion.div>
    </div>
  )
}

export default DashboardContent
