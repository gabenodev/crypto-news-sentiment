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
  FiClock,
  FiGlobe,
  FiChevronDown,
  FiCheck,
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
  getEthPrice,
  CHAIN_NAMES,
  CHAIN_NATIVE_TOKENS,
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
  // Add state for selected chain
  const [selectedChain, setSelectedChain] = useState<number>(1); // Default to Ethereum (1)
  // Add state for dropdown open/closed
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // Ref for dropdown to handle clicks outside
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Add state for available chains with better icons
  const availableChains = [
    { id: 1, name: "Ethereum", icon: "Ξ", color: "#627EEA" },
    { id: 56, name: "BSC", icon: "B", color: "#F3BA2F" },
    // You can add more chains here in the future
  ];

  // Adăugăm state-uri pentru a stoca datele la nivel de Dashboard
  const [holdings, setHoldings] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [ethBalance, setEthBalance] = useState(0);
  // Modificăm starea ethPrice pentru a folosi o valoare inițială mai realistă
  const [ethPrice, setEthPrice] = useState(0); // Inițializăm cu 0 și vom actualiza cu valoarea reală
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState("Loading...");
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [hideFooter, setHideFooter] = useState(true); // State pentru a ascunde footer-ul

  // Get wallet info if it's a known wallet
  const walletInfo = KNOWN_WALLETS[address] || null;

  // Adăugăm după declararea state-urilor, înainte de useEffect-uri
  // Funcție pentru a reîmprospăta datele
  const refreshData = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Handle clicks outside of dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load recent wallets from localStorage on component mount
  useEffect(() => {
    const savedWallets = localStorage.getItem("recentWallets");
    if (savedWallets) {
      setRecentWallets(JSON.parse(savedWallets));
    }

    // Ascundem footer-ul când suntem pe pagina de wallet holdings
    const footerElement = document.querySelector("footer");
    if (footerElement && hideFooter) {
      footerElement.style.display = "none";
    }

    // Cleanup function to restore footer when component unmounts
    return () => {
      const footerElement = document.querySelector("footer");
      if (footerElement) {
        footerElement.style.display = "block";
      }
    };
  }, [hideFooter]);

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

  // Înlocuim useEffect-ul care face fetch-ul datelor pentru a include și obținerea prețului ETH
  // Update the data fetching useEffect to include chainId
  useEffect(() => {
    if (address && isValidAddress && !isFetchingRef.current) {
      // Set the flag to prevent concurrent fetches
      isFetchingRef.current = true;

      const fetchAllData = async () => {
        setIsLoading(true);
        setLoadingStatus(
          `Loading wallet data from ${CHAIN_NAMES[selectedChain]}...`
        );
        setError(null); // Reset any previous errors

        try {
          console.log(
            `🔄 Starting data fetch for wallet: ${address} on ${CHAIN_NAMES[selectedChain]}`
          );

          // Fetch ETH/BNB price first
          console.log(
            `🔍 Fetching ${CHAIN_NATIVE_TOKENS[selectedChain]} price...`
          );
          const nativePriceData = await getEthPrice(selectedChain);
          console.log(
            `💲 ${CHAIN_NATIVE_TOKENS[selectedChain]} price:`,
            nativePriceData
          );
          const currentNativePrice =
            nativePriceData || (selectedChain === 56 ? 300 : 3500); // Use appropriate fallback
          setEthPrice(currentNativePrice);
          console.log(
            `💲 Updated ${CHAIN_NATIVE_TOKENS[selectedChain]} price state:`,
            currentNativePrice
          );

          // Fetch ETH/BNB balance
          console.log(
            `🔍 Fetching ${CHAIN_NATIVE_TOKENS[selectedChain]} balance...`
          );
          const nativeData = await fetchEthBalance(address, selectedChain);
          console.log(
            `📥 ${CHAIN_NATIVE_TOKENS[selectedChain]} balance response:`,
            JSON.stringify(nativeData)
          );
          let nativeBalanceValue = 0;

          // Check if we have a valid result
          if (
            typeof nativeData.result === "string" &&
            !isNaN(Number(nativeData.result))
          ) {
            nativeBalanceValue = Number.parseFloat(nativeData.result) / 1e18;
            console.log(
              `💰 ${CHAIN_NATIVE_TOKENS[selectedChain]} balance in ${CHAIN_NATIVE_TOKENS[selectedChain]}:`,
              nativeBalanceValue
            );
            setEthBalance(nativeBalanceValue);
          } else {
            console.log(
              `⚠️ Invalid ${
                CHAIN_NATIVE_TOKENS[selectedChain]
              } balance result, setting to ${
                selectedChain === 56 ? "10" : "1"
              } ${CHAIN_NATIVE_TOKENS[selectedChain]}`
            );
            nativeBalanceValue = selectedChain === 56 ? 10 : 1; // Use appropriate default value
            setEthBalance(nativeBalanceValue);
          }

          // Fetch token balances with a small delay to avoid rate limiting
          setLoadingStatus("Loading tokens...");
          console.log("⏱️ Waiting before token balance request...");
          await new Promise((resolve) => setTimeout(resolve, 500));

          console.log(
            `🔍 Fetching token balances on ${CHAIN_NAMES[selectedChain]}...`
          );
          const tokenData = await fetchTokenBalances(address, selectedChain);
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

          console.log(
            `🔍 Fetching transaction history on ${CHAIN_NAMES[selectedChain]}...`
          );
          const txHistory = await fetchTransactionHistory(
            address,
            selectedChain
          );
          console.log(
            "📥 Transaction history response:",
            txHistory.length,
            "transactions found"
          );
          console.log("📊 Transaction sample:", txHistory.slice(0, 2));
          setTransactions(txHistory || []);

          // Calculate total value once here and pass it to all components
          // Use the real native token price for calculation
          const totalValue = calculateTotalValue(
            tokenData || [],
            nativeBalanceValue,
            currentNativePrice
          );
          console.log("💰 Calculated total value:", totalValue);

          // Update statistics once
          const updatedStats = {
            totalValue: totalValue,
            tokenCount: (tokenData || []).length,
            ethBalance: nativeBalanceValue,
          };

          // Update local state
          setWalletStats(updatedStats);

          // Pass updated statistics to all child components
          handleStatsUpdate(updatedStats);

          console.log("✅ Data fetch complete");
        } catch (err: any) {
          console.error(
            `❌ Error loading wallet data from ${CHAIN_NAMES[selectedChain]}:`,
            err
          );
          setError(
            err.message ||
              `Error loading data. ${
                selectedChain === 1 ? "Etherscan" : "BscScan"
              } API may be temporarily unavailable.`
          );

          // Set empty data in case of error
          setHoldings([]);
          setTransactions([]);
          setEthBalance(0);

          // Reset statistics in case of error
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
  }, [address, isValidAddress, refreshKey, selectedChain]);

  // Modificăm funcția calculateTotalValue pentru a folosi prețul ETH primit ca parametru
  const calculateTotalValue = (
    holdings: any[],
    ethBalance: number,
    ethPrice: number
  ) => {
    let total = 0;

    // Verificăm dacă ETH există deja în holdings pentru a evita dublarea
    const nativeTokenExists = holdings.some(
      (token) =>
        token.tokenInfo &&
        token.tokenInfo.symbol &&
        token.tokenInfo.symbol.toLowerCase() ===
          CHAIN_NATIVE_TOKENS[selectedChain].toLowerCase() &&
        token.tokenInfo.name &&
        !token.tokenInfo.name.toLowerCase().includes("defi")
    );

    // Adăugăm valoarea ETH doar dacă nu există deja în holdings
    if (!nativeTokenExists) {
      total += ethBalance * ethPrice; // Folosim ethPrice din parametru
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

  // Handle chain change
  const handleChainChange = (chainId: number) => {
    if (chainId !== selectedChain) {
      setSelectedChain(chainId);
      setIsLoading(true);
      setLoadingStatus(`Switching to ${CHAIN_NAMES[chainId]}...`);
      // Close the dropdown after selection
      setDropdownOpen(false);
      // The useEffect will trigger a data refresh
    }
  };

  // Get the currently selected chain
  const selectedChainData =
    availableChains.find((chain) => chain.id === selectedChain) ||
    availableChains[0];

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

  // Function to truncate address for display
  const truncateAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Get explorer URL based on selected chain
  const getExplorerUrl = (address: string) => {
    return selectedChain === 56
      ? `https://bscscan.com/address/${address}`
      : `https://etherscan.io/address/${address}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-dark-primary">
      {/* Main content */}
      <div className="flex-grow flex flex-col md:flex-row relative">
        {/* Sidebar - more compact layout */}
        <div
          className="hidden lg:block lg:w-80 bg-white dark:bg-dark-primary shadow-lg fixed left-0 top-[57px] z-40 overflow-y-auto border-r border-gray-200 dark:border-gray-700"
          style={{ height: "calc(100vh - 57px)" }}
        >
          <div className="flex flex-col h-full pb-4">
            {/* Wallet header - more compact */}
            <div className="px-4 py-4 flex items-center border-b border-gray-200 dark:border-gray-700">
              <div className="h-12 w-12 rounded-full overflow-hidden bg-gradient-to-br from-teal-400/30 to-teal-600/30 p-0.5 mr-3">
                <img
                  src={
                    generateWalletPlaceholder(address, 48) || "/placeholder.svg"
                  }
                  alt="Wallet"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-900 dark:text-dark-text-primary">
                  {walletInfo ? walletInfo.name : "Anonymous Wallet"}
                </h1>
                <p className="text-xs text-gray-500 dark:text-dark-text-secondary">
                  {walletInfo ? walletInfo.description : "Blockchain address"}
                </p>
              </div>
            </div>

            {/* Custom Chain selector dropdown */}
            <div className="px-4 py-3">
              <div className="bg-gray-50 dark:bg-dark-secondary rounded-lg p-2 mb-3 border border-gray-200 dark:border-gray-700 shadow-inner w-full">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-500 dark:text-dark-text-secondary flex items-center">
                    <FiGlobe
                      className="mr-2 text-teal-500 dark:text-teal-400"
                      size={14}
                    />
                    Blockchain
                  </span>
                </div>

                {/* Custom dropdown */}
                <div className="relative mt-2" ref={dropdownRef}>
                  {/* Dropdown trigger button */}
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full flex items-center justify-between p-2.5 rounded-md bg-white dark:bg-dark-tertiary border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-dark-tertiary/80 transition-colors"
                  >
                    <div className="flex items-center">
                      <div
                        className="flex items-center justify-center w-6 h-6 rounded-full mr-2"
                        style={{
                          backgroundColor: `${selectedChainData.color}20`,
                        }}
                      >
                        <span
                          className="text-sm font-medium"
                          style={{ color: selectedChainData.color }}
                        >
                          {selectedChainData.icon}
                        </span>
                      </div>
                      <span className="font-medium">
                        {selectedChainData.name}
                      </span>
                    </div>
                    <FiChevronDown
                      className={`transition-transform duration-200 ${
                        dropdownOpen ? "transform rotate-180" : ""
                      }`}
                      size={16}
                    />
                  </button>

                  {/* Dropdown menu */}
                  {dropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-dark-tertiary rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 max-h-60 overflow-auto">
                      {availableChains.map((chain) => (
                        <button
                          key={chain.id}
                          onClick={() => handleChainChange(chain.id)}
                          className={`
                            w-full flex items-center px-3 py-2 text-sm
                            ${
                              selectedChain === chain.id
                                ? "bg-gray-100 dark:bg-dark-secondary text-teal-600 dark:text-teal-400"
                                : "hover:bg-gray-50 dark:hover:bg-dark-secondary/50 text-gray-700 dark:text-dark-text-primary"
                            }
                          `}
                        >
                          <div
                            className="flex items-center justify-center w-6 h-6 rounded-full mr-2"
                            style={{ backgroundColor: `${chain.color}20` }}
                          >
                            <span
                              className="text-sm font-medium"
                              style={{ color: chain.color }}
                            >
                              {chain.icon}
                            </span>
                          </div>
                          <span className="flex-grow text-left">
                            {chain.name}
                          </span>
                          {selectedChain === chain.id && (
                            <FiCheck
                              className="text-teal-500 dark:text-teal-400"
                              size={16}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Portfolio value card - more compact */}
            <div className="px-4 pt-3">
              <div className="bg-gray-50 dark:bg-dark-secondary rounded-lg p-3 mb-3 border border-gray-200 dark:border-gray-700 shadow-inner w-full">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-500 dark:text-dark-text-secondary">
                    Portfolio Value
                  </span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-1">
                  $
                  {walletStats.totalValue.toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                  })}
                </p>
                <div className="flex justify-between mt-1 text-sm">
                  <span className="text-gray-600 dark:text-dark-text-primary flex items-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-teal-400 mr-2"></span>
                    {walletStats.ethBalance.toFixed(4)}{" "}
                    {CHAIN_NATIVE_TOKENS[selectedChain]}
                  </span>
                  <span className="text-teal-600 dark:text-teal-400">
                    {walletStats.tokenCount} tokens
                  </span>
                </div>
              </div>
            </div>

            {/* Address card - more compact */}
            <div className="px-4 pb-2">
              <div className="bg-gray-50 dark:bg-dark-tertiary rounded-lg p-3 mb-3 border border-gray-200 dark:border-gray-700 w-full">
                <div className="flex justify-between items-center mb-1">
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
                      href={getExplorerUrl(address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 p-1 ml-1 transition-colors"
                      title={`View on ${
                        selectedChain === 56 ? "BscScan" : "Etherscan"
                      }`}
                    >
                      <FiExternalLink size={14} />
                    </a>
                  </div>
                </div>
                <div className="bg-white dark:bg-dark-secondary rounded-lg px-2 py-1.5 font-mono text-xs text-gray-700 dark:text-dark-text-primary break-all">
                  {address}
                  {copySuccess && (
                    <span className="text-xs text-teal-500 dark:text-teal-400 ml-2">
                      Copied!
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation - more compact */}
            <nav className="px-4 mb-4">
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`w-full flex items-center px-3 py-2 rounded-lg transition-all ${
                      activeTab === "overview"
                        ? "bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300 border-l-2 border-teal-500 dark:border-teal-400"
                        : "text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-tertiary hover:text-gray-900 dark:hover:text-dark-text-primary"
                    }`}
                  >
                    <FiHome
                      className={`mr-2 ${
                        activeTab === "overview"
                          ? "text-teal-600 dark:text-teal-400"
                          : ""
                      }`}
                      size={16}
                    />
                    Overview
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("holdings")}
                    className={`w-full flex items-center px-3 py-2 rounded-lg transition-all ${
                      activeTab === "holdings"
                        ? "bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300 border-l-2 border-teal-500 dark:border-teal-400"
                        : "text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-tertiary hover:text-gray-900 dark:hover:text-dark-text-primary"
                    }`}
                  >
                    <FiPieChart
                      className={`mr-2 ${
                        activeTab === "holdings"
                          ? "text-teal-600 dark:text-teal-400"
                          : ""
                      }`}
                      size={16}
                    />
                    Holdings
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("transactions")}
                    className={`w-full flex items-center px-3 py-2 rounded-lg transition-all ${
                      activeTab === "transactions"
                        ? "bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300 border-l-2 border-teal-500 dark:border-teal-400"
                        : "text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-tertiary hover:text-gray-900 dark:hover:text-dark-text-primary"
                    }`}
                  >
                    <FiActivity
                      className={`mr-2 ${
                        activeTab === "transactions"
                          ? "text-teal-600 dark:text-teal-400"
                          : ""
                      }`}
                      size={16}
                    />
                    Transactions
                  </button>
                </li>
              </ul>
            </nav>

            {/* Recent wallets - more compact */}
            {recentWallets.length > 0 && (
              <div className="px-4 mt-auto">
                <h3 className="text-xs font-medium text-gray-500 dark:text-dark-text-secondary mb-2 flex items-center">
                  <FiClock
                    className="mr-2 text-teal-500 dark:text-teal-400"
                    size={14}
                  />
                  Recent Wallets
                </h3>
                <ul className="space-y-1">
                  {recentWallets
                    .filter((w) => w !== address)
                    .slice(0, 3)
                    .map((wallet) => (
                      <li key={wallet} className="group">
                        <Link
                          to={`/wallet-holdings/${wallet}`}
                          className="flex items-center p-2 rounded-lg bg-gray-50 dark:bg-dark-tertiary hover:bg-gray-100 dark:hover:bg-dark-secondary transition-all group-hover:border-l border-teal-500 dark:border-teal-400"
                        >
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-tertiary dark:to-dark-secondary p-0.5 mr-2">
                            <img
                              src={
                                generateWalletPlaceholder(wallet, 24) ||
                                "/placeholder.svg"
                              }
                              alt="Wallet"
                              className="w-full h-full object-cover rounded-full"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-700 dark:text-dark-text-primary truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                              {truncateAddress(wallet)}
                            </p>
                          </div>
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
                {selectedChain === 56 ? "BscScan" : "Etherscan"} API may be
                temporarily unavailable or has reached its rate limit. Try again
                later or check another wallet.
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
            className="mb-16" // Reduced bottom margin to account for footer
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
      </div>
    </div>
  );
};

export default WalletDashboard;
