"use client";

import React from "react";
import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiStar,
  FiInfo,
  FiArrowRight,
  FiPieChart,
  FiActivity,
} from "react-icons/fi";
import { generateWalletPlaceholder } from "../utils/placeholderGenerator";

// Popular wallets with descriptions
const POPULAR_WALLETS = [
  {
    name: "Vitalik Buterin",
    address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    description: "Ethereum Co-founder",
  },
  {
    name: "Ethereum Foundation",
    address: "0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe",
    description: "Non-profit organization",
  },
  {
    name: "Binance",
    address: "0x28C6c06298d514Db089934071355E5743bf21d60",
    description: "Cryptocurrency exchange",
  },
  {
    name: "Coinbase",
    address: "0x503828976D22510aad0201ac7EC88293211D23Da",
    description: "Popular exchange",
  },
  {
    name: "Kraken",
    address: "0x2910543Af39abA0Cd09dBb2D50200b3E800A63D2",
    description: "Top exchange",
  },
  {
    name: "US Government Seized",
    address: "0x9F4cda013E354b8fC285BF4b9A60460cEe7f7Ea9",
    description: "Seized by US government",
  },
];

const WalletHoldingsPage: React.FC = () => {
  const [address, setAddress] = useState("");
  const [submittedAddress, setSubmittedAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recentWallets, setRecentWallets] = useState<string[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const navigate = useNavigate();

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
    if (address.trim()) {
      const formattedAddress = address.trim();
      // Navigate to the wallet details page
      navigate(`/wallet-holdings/${formattedAddress}`);
    }
  };

  const selectWallet = (walletAddress: string) => {
    // Navigate to the wallet details page
    navigate(`/wallet-holdings/${walletAddress}`);
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
          Explore any Ethereum wallet and analyze asset distribution in
          real-time
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
                  disabled={!address.trim() || isLoading}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors ${
                    isLoading || !address.trim()
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isLoading ? "Loading..." : "Check"}
                </button>
              </div>
            </form>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <FiInfo className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Enter a valid Ethereum address to see all ERC-20 tokens held
                    by that wallet.
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    <strong>Note:</strong> Due to API limitations, some tokens
                    or values may not display correctly. For a complete view,
                    please verify on{" "}
                    <a
                      href="https://etherscan.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      Etherscan
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>

            {recentWallets.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Recent Wallets
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recentWallets.map((wallet) => (
                    <div key={wallet} className="flex items-center">
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
                      <button
                        onClick={() => selectWallet(wallet)}
                        className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg px-3 py-1 transition-colors truncate max-w-[200px]"
                      >
                        {wallet}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                className={`w-full p-3 rounded-lg border transition-colors flex items-center justify-between ${
                  isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    <img
                      src={
                        generateWalletPlaceholder(wallet.address, 40) ||
                        "/placeholder.svg"
                      }
                      alt={wallet.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{wallet.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {wallet.description}
                    </div>
                  </div>
                </div>
                <FiArrowRight className="text-blue-500" />
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Enter an Ethereum address to see all wallet details, including held
            assets, transactions, and analytics.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiSearch className="text-blue-600 dark:text-blue-400 text-xl" />
              </div>
              <h3 className="font-medium text-lg mb-2">Search a Wallet</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Enter an Ethereum address or choose a popular wallet to get
                started.
              </p>
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiPieChart className="text-green-600 dark:text-green-400 text-xl" />
              </div>
              <h3 className="font-medium text-lg mb-2">View Assets</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                See all tokens held, their value, and portfolio distribution.
                Some tokens may be filtered due to API limitations.
              </p>
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="bg-purple-100 dark:bg-purple-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiActivity className="text-purple-600 dark:text-purple-400 text-xl" />
              </div>
              <h3 className="font-medium text-lg mb-2">Analyze Transactions</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Explore transaction history and wallet activity over time.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WalletHoldingsPage;
