"use client";

import React from "react";
import { useState, useEffect, useRef } from "react";
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
import {
  fetchEthBalance,
  fetchTokenBalances,
  fetchTransactionHistory,
} from "../../utils/API/etherScanAPI";

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

  // Adăugăm state-uri pentru a stoca datele la nivel de Dashboard
  const [holdings, setHoldings] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [ethBalance, setEthBalance] = useState(0);
  const [ethPrice, setEthPrice] = useState(3500); // Placeholder - în aplicația reală ar trebui să obținem prețul curent
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState("Inițializare...");
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Get wallet info if it's a known wallet
  const walletInfo = KNOWN_WALLETS[address] || null;

  // Adăugăm după declararea state-urilor, înainte de useEffect-uri
  // Funcție pentru a reîmprospăta datele
  const refreshData = () => {
    setRefreshKey((prev) => prev + 1);
  };

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

  // Add a ref to track if we're already fetching data
  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (address && isValidAddress && !isFetchingRef.current) {
      // Set the flag to prevent concurrent fetches
      isFetchingRef.current = true;

      const fetchAllData = async () => {
        setIsLoading(true);
        setLoadingStatus("Loading wallet data...");
        setError(null); // Reset any previous errors

        try {
          console.log("🔄 Starting data fetch for wallet:", address);

          // Fetch ETH balance
          console.log("🔍 Fetching ETH balance...");
          const ethData = await fetchEthBalance(address);
          console.log("📥 ETH balance response:", JSON.stringify(ethData));
          let ethBalanceValue = 0;

          // Verificăm dacă avem un rezultat valid
          if (
            typeof ethData.result === "string" &&
            !isNaN(Number(ethData.result))
          ) {
            ethBalanceValue = Number.parseFloat(ethData.result) / 1e18;
            console.log("💰 ETH balance in ETH:", ethBalanceValue);
            setEthBalance(ethBalanceValue);
          } else {
            console.log("⚠️ Invalid ETH balance result, setting to 1 ETH");
            ethBalanceValue = 1; // Folosim 1 ETH ca valoare implicită
            setEthBalance(ethBalanceValue);
          }

          // Fetch token balances with a small delay to avoid rate limiting
          setLoadingStatus("Loading tokens...");
          console.log("⏱️ Waiting before token balance request...");
          await new Promise((resolve) => setTimeout(resolve, 500));

          console.log("🔍 Fetching token balances...");
          const tokenData = await fetchTokenBalances(address);
          console.log(
            "📥 Token balances response:",
            tokenData.length,
            "tokens found"
          );
          console.log("📊 Token data sample:", tokenData.slice(0, 2));
          setHoldings(tokenData || []);

          // Fetch transaction history with a small delay to avoid rate limiting
          setLoadingStatus("Loading transaction history...");
          console.log("⏱️ Waiting before transaction history request...");
          await new Promise((resolve) => setTimeout(resolve, 500));

          console.log("🔍 Fetching transaction history...");
          const txHistory = await fetchTransactionHistory(address);
          console.log(
            "📥 Transaction history response:",
            txHistory.length,
            "transactions found"
          );
          console.log("📊 Transaction sample:", txHistory.slice(0, 2));
          setTransactions(txHistory || []);

          // Calculăm valoarea totală o singură dată aici și o transmitem la toate componentele
          const totalValue = calculateTotalValue(
            tokenData || [],
            ethBalanceValue
          );
          console.log("💰 Calculated total value:", totalValue);

          // Actualizăm statisticile o singură dată
          const updatedStats = {
            totalValue: totalValue,
            tokenCount: (tokenData || []).length,
            ethBalance: ethBalanceValue,
          };

          // Actualizăm state-ul local
          setWalletStats(updatedStats);

          // Transmitem statisticile actualizate la toate componentele copil
          handleStatsUpdate(updatedStats);

          console.log("✅ Data fetch complete");
        } catch (err: any) {
          console.error("❌ Error loading wallet data:", err);
          setError(
            err.message ||
              "Error loading data. Etherscan API may be temporarily unavailable."
          );

          // Set empty data in case of error
          setHoldings([]);
          setTransactions([]);
          setEthBalance(0);

          // Resetăm și statisticile în caz de eroare
          const emptyStats = {
            totalValue: 0,
            tokenCount: 0,
            ethBalance: 0,
          };
          setWalletStats(emptyStats);
          handleStatsUpdate(emptyStats);
        } finally {
          setIsLoading(false);
          setLoadingStatus("");
          // Reset the fetching flag
          isFetchingRef.current = false;
        }
      };

      fetchAllData();
    }
  }, [address, isValidAddress, refreshKey]);

  const calculateTotalValue = (holdings: any[], ethBalance: number) => {
    let total = 0;

    // Verificăm dacă ETH există deja în holdings pentru a evita dublarea
    const ethTokenExists = holdings.some(
      (token) =>
        token.tokenInfo &&
        token.tokenInfo.symbol &&
        token.tokenInfo.symbol.toLowerCase() === "eth" &&
        token.tokenInfo.name &&
        !token.tokenInfo.name.toLowerCase().includes("defi")
    );

    // Adăugăm valoarea ETH doar dacă nu există deja în holdings
    if (!ethTokenExists) {
      total += ethBalance * ethPrice; // Folosim ethPrice din state
    }

    // Adăugăm valorile token-urilor
    for (const token of holdings) {
      if (token && token.tokenInfo && token.tokenInfo.price?.rate) {
        const decimals = Number(token.tokenInfo.decimals || 0);
        const tokenBalance =
          Number(token.balance || 0) / Math.pow(10, decimals);
        total += tokenBalance * token.tokenInfo.price.rate;
      }
    }

    return total;
  };

  // Handle loading state changes
  const handleLoadingChange = (loading: boolean) => {
    setIsLoading(loading);
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

  // Add this helper function to calculate total value

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-dark-primary">
      {/* Main content */}
      <div className="flex-grow flex flex-col md:flex-row">
        {/* Sidebar - now with auto height instead of fixed height */}
        <div className="hidden lg:block lg:w-96 bg-white dark:bg-dark-primary shadow-lg fixed left-0 top-[57px] z-40 overflow-y-auto h-[calc(100vh-57px)]">
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
        <div className="w-full lg:ml-96 flex-1 p-4 pt-4 mt-0">
          <div className="mb-4">
            <Link
              to="/wallet-holdings"
              className="inline-flex items-center text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
            >
              <FiArrowLeft className="mr-2" />
              <span>Back to Wallet Search</span>
            </Link>
          </div>
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg">
              <p className="text-red-700 dark:text-red-400 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </p>
              <p className="mt-2 text-sm text-red-600 dark:text-red-300">
                Etherscan API may be temporarily unavailable or has reached its
                rate limit. Try again later or check another wallet.
              </p>
              <button
                onClick={refreshData}
                className="mt-3 px-4 py-2 bg-red-100 dark:bg-red-800/30 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
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
                holdings={holdings}
                transactions={transactions}
                ethBalance={ethBalance}
                ethPrice={ethPrice}
                isLoading={isLoading}
                error={error}
                loadingStatus={loadingStatus}
                refreshData={refreshData}
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
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WalletDashboard;
