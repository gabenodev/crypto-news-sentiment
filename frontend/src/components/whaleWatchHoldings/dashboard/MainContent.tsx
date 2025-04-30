"use client";

import React from "react";
import { motion } from "framer-motion";
import WalletOverview from "../WalletOverview";
import WalletHoldings from "../WalletHoldings";
import WalletTransactionHistory from "../WalletTransactionHistory";
import type { MainContentProps } from "../types";

const MainContent: React.FC<MainContentProps> = ({
  activeTab,
  address,
  onLoadingChange,
  onStatsUpdate,
  holdings,
  transactions,
  ethBalance,
  ethPrice,
  isLoading,
  error,
  loadingStatus,
  refreshData,
  chainId,
}) => {
  return (
    <motion.div
      key={activeTab}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-16" // Reduced bottom margin to account for footer
    >
      {activeTab === "overview" && (
        <WalletOverview
          address={address}
          onLoadingChange={onLoadingChange}
          onStatsUpdate={onStatsUpdate}
          holdings={holdings}
          transactions={transactions}
          ethBalance={ethBalance}
          ethPrice={ethPrice}
          isLoading={isLoading}
          error={error}
          loadingStatus={loadingStatus}
          refreshData={refreshData}
          chainId={chainId}
        />
      )}
      {activeTab === "holdings" && (
        <WalletHoldings
          address={address}
          onLoadingChange={onLoadingChange}
          onStatsUpdate={onStatsUpdate}
          holdings={holdings}
          ethBalance={ethBalance}
          ethPrice={ethPrice}
          isLoading={isLoading}
          error={error}
          loadingStatus={loadingStatus}
          refreshData={refreshData}
          chainId={chainId}
        />
      )}
      {activeTab === "transactions" && (
        <WalletTransactionHistory
          address={address}
          onLoadingChange={onLoadingChange}
          transactions={transactions}
          isLoading={isLoading}
          error={error}
          loadingStatus={loadingStatus}
          refreshData={refreshData}
          chainId={chainId}
        />
      )}
    </motion.div>
  );
};

export default MainContent;
