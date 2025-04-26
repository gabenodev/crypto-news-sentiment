"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiHome,
  FiPieChart,
  FiActivity,
  FiArrowLeft,
  FiCopy,
  FiExternalLink,
} from "react-icons/fi";
import WalletOverview from "./WalletOverview";
import WalletHoldings from "./WalletHoldings";
import WalletTransactionHistory from "./WalletTransactionHistory";
import { isValidEthereumAddress } from "../../utils/API/etherScanAPI";
import { generateWalletPlaceholder } from "../../utils/placeholderGenerator";

// Popular wallets with names
const KNOWN_WALLETS: Record<string, { name: string; description: string }> = {
  "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045": {
    name: "Vitalik Buterin",
    description: "Ethereum Co-founder",
  },
  "0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe": {
    name: "Ethereum Foundation",
    description: "Non-profit organization",
  },
  "0x28C6c06298d514Db089934071355E5743bf21d60": {
    name: "Binance",
    description: "Cryptocurrency exchange",
  },
  "0x503828976D22510aad0201ac7EC88293211D23Da": {
    name: "Coinbase",
    description: "Popular exchange",
  },
  "0x2910543Af39abA0Cd09dBb2D50200b3E800A63D2": {
    name: "Kraken",
    description: "Top exchange",
  },
  "0x9F4cda013E354b8fC285BF4b9A60460cEe7f7Ea9": {
    name: "US Government Seized",
    description: "Seized by US government",
  },
};

type TabType = "overview" | "holdings" | "transactions";

const WalletDashboard: React.FC = () => {
  const { address = "" } = useParams<{ address: string }>();
  const [isValidAddress, setIsValidAddress] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [recentWallets, setRecentWallets] = useState<string[]>([]);
  const [walletStats, setWalletStats] = useState({
    totalValue: 0,
    tokenCount: 0,
    ethBalance: 0,
  });

  // Get wallet info if it's a known wallet
  const walletInfo = KNOWN_WALLETS[address] || null;

  // Load recent wallets from localStorage on component mount
  useEffect(() => {
    const savedWallets = localStorage.getItem("recentWallets");
    if (savedWallets) {
      setRecentWallets(JSON.parse(savedWallets));
    }
  }, []);

  // Add current wallet to recent wallets
  useEffect(() => {
    if (address && isValidAddress) {
      setRecentWallets((prevWallets) => {
        const updatedWallets = [
          address,
          ...prevWallets.filter((w) => w !== address),
        ].slice(0, 5);
        localStorage.setItem("recentWallets", JSON.stringify(updatedWallets));
        return updatedWallets;
      });
    }
  }, [address, isValidAddress]);

  // Validate the address
  useEffect(() => {
    if (address) {
      setIsValidAddress(isValidEthereumAddress(address));
    }
  }, [address]);

  // Handle loading state changes
  const handleLoadingChange = (loading: boolean) => {
    // setIsLoading(loading) // Removed setIsLoading
  };

  // Handle stats updates from child components
  const handleStatsUpdate = (stats: any) => {
    setWalletStats((prevStats) => ({
      ...prevStats,
      ...stats,
    }));
  };

  // Copy address to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // If address is invalid, show error
  if (!isValidAddress) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 dark:bg-error/20 border border-red-200 dark:border-error/50 rounded-xl p-6 text-center">
          <div className="text-error text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-error mb-2">
            Invalid Ethereum Address
          </h2>
          <p className="text-error/90 mb-6">
            The address "{address}" is not a valid Ethereum address. Please
            check the address and try again.
          </p>
          <Link
            to="/wallet-holdings"
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white rounded-lg transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back to Wallet Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-dark-primary">
      {/* Main content */}
      <div className="flex-grow flex flex-col md:flex-row">
        {/* Sidebar - now with auto height instead of fixed height */}
        <div className="hidden lg:block lg:w-80 bg-white dark:bg-dark-primary shadow-lg fixed left-0 top-[57px] z-40 overflow-y-auto">
          <div className="flex flex-col">
            {/* Wallet info */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="mr-4 h-12 w-12 rounded-full overflow-hidden">
                  <img
                    src={
                      generateWalletPlaceholder(address, 48) ||
                      "/placeholder.svg"
                    }
                    alt="Wallet"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">
                    {walletInfo ? walletInfo.name : "Anonymous Wallet"}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                    {walletInfo ? walletInfo.description : "Ethereum address"}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-dark-tertiary rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500 dark:text-dark-text-secondary">
                    Address
                  </span>
                  <div className="flex items-center">
                    <button
                      onClick={copyToClipboard}
                      className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 p-1 transition-colors"
                      title="Copy address"
                    >
                      <FiCopy size={14} />
                    </button>
                    <a
                      href={`https://etherscan.io/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 p-1 ml-1 transition-colors"
                      title="View on Etherscan"
                    >
                      <FiExternalLink size={14} />
                    </a>
                  </div>
                </div>
                <p className="text-xs text-gray-700 dark:text-dark-text-primary font-mono break-all">
                  {address}
                  {copySuccess && (
                    <span className="text-xs text-green-500 ml-2">Copied!</span>
                  )}
                </p>
              </div>

              <div className="bg-white dark:bg-dark-secondary rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-500 dark:text-dark-text-secondary">
                    Portfolio Value
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                  $
                  {walletStats.totalValue.toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                  })}
                </p>
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {walletStats.ethBalance.toFixed(4)} ETH
                  </span>
                  <span className="text-teal-600 dark:text-teal-400">
                    {walletStats.tokenCount} tokens
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${
                      activeTab === "overview"
                        ? "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
                        : "text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-tertiary"
                    }`}
                  >
                    <FiHome className="mr-3" />
                    Overview
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("holdings")}
                    className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${
                      activeTab === "holdings"
                        ? "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
                        : "text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-tertiary"
                    }`}
                  >
                    <FiPieChart className="mr-3" />
                    Holdings
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("transactions")}
                    className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${
                      activeTab === "transactions"
                        ? "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
                        : "text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-tertiary"
                    }`}
                  >
                    <FiActivity className="mr-3" />
                    Transactions
                  </button>
                </li>
              </ul>
            </nav>

            {/* Recent wallets */}
            {recentWallets.length > 0 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary mb-3">
                  Recent Wallets
                </h3>
                <ul className="space-y-2">
                  {recentWallets
                    .filter((w) => w !== address)
                    .slice(0, 3)
                    .map((wallet) => (
                      <li key={wallet} className="flex items-center">
                        <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                          <img
                            src={
                              generateWalletPlaceholder(wallet, 24) ||
                              "/placeholder.svg"
                            }
                            alt="Wallet"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Link
                          to={`/wallet-holdings/${wallet}`}
                          className="block text-xs text-gray-700 dark:text-dark-text-primary hover:text-teal-600 dark:hover:text-teal-400 truncate"
                        >
                          {wallet}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Main content area */}
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
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-20" // Add bottom margin to ensure content doesn't overlap with footer
          >
            {activeTab === "overview" && (
              <WalletOverview
                address={address}
                onLoadingChange={handleLoadingChange}
                onStatsUpdate={handleStatsUpdate}
              />
            )}
            {activeTab === "holdings" && (
              <WalletHoldings
                address={address}
                onLoadingChange={handleLoadingChange}
                onStatsUpdate={handleStatsUpdate}
              />
            )}
            {activeTab === "transactions" && (
              <WalletTransactionHistory
                address={address}
                onLoadingChange={handleLoadingChange}
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WalletDashboard;
