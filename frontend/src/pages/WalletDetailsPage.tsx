"use client";

import React from "react";
import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import WalletHoldings from "../components/whaleWatchHoldings/WalletHoldings";
import WalletTransactionHistory from "../components/whaleWatchHoldings/WalletTransactionHistory";
import WalletOverview from "../components/whaleWatchHoldings/WalletOverview";
import {
  FiArrowLeft,
  FiCopy,
  FiExternalLink,
  FiInfo,
  FiActivity,
  FiPieChart,
} from "react-icons/fi";
import { isValidEthereumAddress } from "../utils/API/etherScanAPI";

// Popular wallets with names
const KNOWN_WALLETS: Record<
  string,
  { name: string; description: string; icon: string }
> = {
  "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045": {
    name: "Vitalik Buterin",
    description: "Ethereum Co-founder",
    icon: "👨‍💻",
  },
  "0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe": {
    name: "Ethereum Foundation",
    description: "Non-profit organization",
    icon: "🏛️",
  },
  "0x28C6c06298d514Db089934071355E5743bf21d60": {
    name: "Binance",
    description: "Cryptocurrency exchange",
    icon: "🔄",
  },
  "0x503828976D22510aad0201ac7EC88293211D23Da": {
    name: "Coinbase",
    description: "Popular exchange",
    icon: "💱",
  },
  "0x2910543Af39abA0Cd09dBb2D50200b3E800A63D2": {
    name: "Kraken",
    description: "Top exchange",
    icon: "🐙",
  },
  "0x9F4cda013E354b8fC285BF4b9A60460cEe7f7Ea9": {
    name: "US Government Seized",
    description: "Seized by US government",
    icon: "🏛️",
  },
};

type TabType = "overview" | "holdings" | "transactions";

const WalletDetailsPage = () => {
  const { address = "" } = useParams<{ address: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isValidAddress, setIsValidAddress] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [recentWallets, setRecentWallets] = useState<string[]>([]);

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
  const handleLoadingChange = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

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
    <div className="max-w-6xl mx-auto">
      {/* Back button and wallet info header */}
      <div className="mb-6">
        <Link
          to="/wallet-holdings"
          className="inline-flex items-center text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 mb-4 transition-colors"
        >
          <FiArrowLeft className="mr-1" />
          <span>Back to Wallet Search</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-dark-secondary rounded-xl shadow-lg p-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center">
              {walletInfo && (
                <div className="text-3xl mr-4 bg-teal-100 dark:bg-teal-900/30 h-12 w-12 rounded-full flex items-center justify-center">
                  {walletInfo.icon}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold mb-1 text-gray-900 dark:text-dark-text-primary">
                  {walletInfo ? walletInfo.name : "Wallet"}{" "}
                  {walletInfo && (
                    <span className="text-gray-500 dark:text-dark-text-secondary text-sm">
                      ({walletInfo.description})
                    </span>
                  )}
                </h1>
                <div className="flex items-center text-sm text-gray-500 dark:text-dark-text-secondary break-all">
                  <span className="hidden md:inline mr-2">{address}</span>
                  <span className="md:hidden mr-2">{`${address.substring(
                    0,
                    6
                  )}...${address.substring(address.length - 4)}`}</span>
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
                  {copySuccess && (
                    <span className="text-xs text-green-500 ml-2">Copied!</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <a
                href={`https://etherscan.io/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white rounded-lg transition-colors flex items-center"
              >
                <FiExternalLink className="mr-2" />
                View on Etherscan
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-dark-tertiary">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm transition-colors ${
                activeTab === "overview"
                  ? "border-teal-500 text-teal-600 dark:text-teal-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-dark-text-secondary dark:hover:text-dark-text-primary"
              }`}
            >
              <FiInfo className="mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("holdings")}
              className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm transition-colors ${
                activeTab === "holdings"
                  ? "border-teal-500 text-teal-600 dark:text-teal-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-dark-text-secondary dark:hover:text-dark-text-primary"
              }`}
            >
              <FiPieChart className="mr-2" />
              Holdings
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm transition-colors ${
                activeTab === "transactions"
                  ? "border-teal-500 text-teal-600 dark:text-teal-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-dark-text-secondary dark:hover:text-dark-text-primary"
              }`}
            >
              <FiActivity className="mr-2" />
              Transactions
            </button>
          </nav>
        </div>
      </div>

      {/* Tab content */}
      <div className="mb-8">
        {activeTab === "overview" && (
          <WalletOverview
            address={address}
            onLoadingChange={handleLoadingChange}
          />
        )}
        {activeTab === "holdings" && (
          <WalletHoldings
            address={address}
            onLoadingChange={handleLoadingChange}
          />
        )}
        {activeTab === "transactions" && (
          <WalletTransactionHistory
            address={address}
            onLoadingChange={handleLoadingChange}
          />
        )}
      </div>
    </div>
  );
};

export default WalletDetailsPage;
