"use client";

import React from "react";
import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import WalletHoldings from "../components/whaleWatchHoldings/WalletHoldings";
import {
  FiSearch,
  FiCopy,
  FiExternalLink,
  FiStar,
  FiInfo,
} from "react-icons/fi";

// Popular wallets with descriptions
const POPULAR_WALLETS = [
  {
    name: "Vitalik Buterin",
    address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    description: "Ethereum Co-founder",
    icon: "👨‍💻",
  },
  {
    name: "Ethereum Foundation",
    address: "0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe",
    description: "Non-profit organization",
    icon: "🏛️",
  },
  {
    name: "Binance",
    address: "0x28C6c06298d514Db089934071355E5743bf21d60",
    description: "Cryptocurrency exchange",
    icon: "🔄",
  },
  {
    name: "Coinbase",
    address: "0x503828976D22510aad0201ac7EC88293211D23Da",
    description: "Popular exchange",
    icon: "💱",
  },
  {
    name: "Kraken",
    address: "0x2910543Af39abA0Cd09dBb2D50200b3E800A63D2",
    description: "Top exchange",
    icon: "🐙",
  },
  {
    name: "US Government Seized",
    address: "0x9F4cda013E354b8fC285BF4b9A60460cEe7f7Ea9",
    description: "Seized by US government",
    icon: "🏛️",
  },
];

const WalletHoldingsPage: React.FC = () => {
  const [address, setAddress] = useState("");
  const [submittedAddress, setSubmittedAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recentWallets, setRecentWallets] = useState<string[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);

  // Load recent wallets from localStorage on component mount
  useEffect(() => {
    const savedWallets = localStorage.getItem("recentWallets");
    if (savedWallets) {
      setRecentWallets(JSON.parse(savedWallets));
    }
  }, []);

  // Function to add a wallet to the recent list
  const addToRecentWallets = (walletAddress: string) => {
    const updatedWallets = [
      walletAddress,
      ...recentWallets.filter((w) => w !== walletAddress),
    ].slice(0, 5); // Keep only the last 5 wallets

    setRecentWallets(updatedWallets);
    localStorage.setItem("recentWallets", JSON.stringify(updatedWallets));
  };

  // Use useCallback to prevent recreating the function on each render
  const handleLoadingChange = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim() && address.trim() !== submittedAddress) {
      const formattedAddress = address.trim();
      setSubmittedAddress(formattedAddress);
      addToRecentWallets(formattedAddress);
    }
  };

  const selectWallet = (walletAddress: string) => {
    if (walletAddress !== submittedAddress) {
      setAddress(walletAddress);
      setSubmittedAddress(walletAddress);
      addToRecentWallets(walletAddress);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
          Wallet Holdings Explorer
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Explore any Ethereum wallet's holdings and analyze asset distribution
          in real-time
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-full"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FiSearch className="mr-2 text-blue-500" />
              Check Any Wallet
            </h2>

            <form onSubmit={handleSubmit} className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter Ethereum wallet address (0x...)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={isLoading}
                  className="w-full p-4 pl-12 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <FiSearch
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />

                <button
                  type="submit"
                  disabled={
                    !address.trim() ||
                    isLoading ||
                    address.trim() === submittedAddress
                  }
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors ${
                    isLoading ||
                    !address.trim() ||
                    address.trim() === submittedAddress
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isLoading ? "Loading..." : "Check"}
                </button>
              </div>
            </form>

            {recentWallets.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Recent wallets
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recentWallets.map((wallet) => (
                    <button
                      key={wallet}
                      onClick={() => selectWallet(wallet)}
                      className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg px-3 py-1 transition-colors truncate max-w-[200px]"
                    >
                      {wallet}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-start">
                <FiInfo className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Enter a valid Ethereum address to view all ERC-20 tokens
                    held by that wallet.
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Data is fetched in real-time from Etherscan and CoinGecko.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FiStar className="mr-2 text-amber-500" />
            Popular Wallets
          </h2>

          <div className="space-y-3">
            {POPULAR_WALLETS.map((wallet) => (
              <button
                key={wallet.address}
                onClick={() => selectWallet(wallet.address)}
                disabled={isLoading}
                className={`w-full p-3 rounded-lg border transition-colors flex items-center ${
                  submittedAddress === wallet.address
                    ? "bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:border-blue-500"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="text-2xl mr-3">{wallet.icon}</div>
                <div className="text-left">
                  <div className="font-medium">{wallet.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {wallet.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {submittedAddress && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold mb-1">
                {POPULAR_WALLETS.find((w) => w.address === submittedAddress)
                  ?.name || "Wallet"}{" "}
                Holdings
              </h2>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 break-all">
                <span className="hidden md:inline mr-2">
                  {submittedAddress}
                </span>
                <span className="md:hidden mr-2">{`${submittedAddress.substring(
                  0,
                  6
                )}...${submittedAddress.substring(
                  submittedAddress.length - 4
                )}`}</span>
                <button
                  onClick={() => copyToClipboard(submittedAddress)}
                  className="text-blue-500 hover:text-blue-600 p-1"
                  title="Copy address"
                >
                  <FiCopy size={14} />
                </button>
                <a
                  href={`https://etherscan.io/address/${submittedAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 p-1 ml-1"
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

          <WalletHoldings
            address={submittedAddress}
            onLoadingChange={handleLoadingChange}
          />
        </motion.div>
      )}
    </div>
  );
};

export default WalletHoldingsPage;
