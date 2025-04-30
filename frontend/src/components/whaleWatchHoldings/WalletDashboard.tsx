"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { isValidEthereumAddress } from "../../utils/API/etherScanAPI";
import {
  fetchEthBalance,
  fetchTokenBalances,
  fetchTransactionHistory,
  getEthPrice,
  CHAIN_NAMES,
  CHAIN_NATIVE_TOKENS,
} from "../../utils/API/etherScanAPI";

// Import components
import ChainSelector from "./components/ChainSelector";
import WalletHeader from "./components/WalletHeader";
import PortfolioSummary from "./components/PortfolioSummary";
import AddressCard from "./components/AddressCard";
import NavigationTabs from "./components/NavigationTabs";
import RecentWallets from "./components/RecentWallets";
import DashboardContent from "./components/DashboardContent";
import ErrorView from "./components/ErrorView";

// Import types and utilities
import type { TabType, WalletStats } from "./types";
import { KNOWN_WALLETS, AVAILABLE_CHAINS } from "./constants";
import { calculateTotalValue, truncateAddress, getExplorerUrl } from "./utils";

const WalletDashboard: React.FC = () => {
  const { address = "" } = useParams<{ address: string }>();
  const [isValidAddress, setIsValidAddress] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [recentWallets, setRecentWallets] = useState<string[]>([]);
  const [walletStats, setWalletStats] = useState<WalletStats>({
    totalValue: 0,
    tokenCount: 0,
    ethBalance: 0,
  });

  // Chain selection state
  const [selectedChain, setSelectedChain] = useState<number>(1); // Default to Ethereum (1)

  // Data states
  const [holdings, setHoldings] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [ethBalance, setEthBalance] = useState(0);
  const [ethPrice, setEthPrice] = useState(0);

  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState("Loading...");
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [hideFooter, setHideFooter] = useState(true);

  // Get wallet info if it's a known wallet
  const walletInfo = KNOWN_WALLETS[address] || null;

  // Function to refresh data
  const refreshData = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Load recent wallets from localStorage on component mount
  useEffect(() => {
    const savedWallets = localStorage.getItem("recentWallets");
    if (savedWallets) {
      setRecentWallets(JSON.parse(savedWallets));
    }

    // Hide footer when on wallet holdings page
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

  // Fetch wallet data
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
            currentNativePrice,
            selectedChain
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

  // Handle chain change
  const handleChainChange = (chainId: number) => {
    if (chainId !== selectedChain) {
      setSelectedChain(chainId);
      setIsLoading(true);
      setLoadingStatus(`Switching to ${CHAIN_NAMES[chainId]}...`);
      // The useEffect will trigger a data refresh
    }
  };

  // If address is invalid, show error
  if (!isValidAddress) {
    return <ErrorView address={address} />;
  }

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
            {/* Wallet header */}
            <WalletHeader address={address} walletInfo={walletInfo} />

            {/* Chain selector */}
            <div className="px-4 py-3">
              <ChainSelector
                selectedChain={selectedChain}
                availableChains={AVAILABLE_CHAINS}
                onChainChange={handleChainChange}
              />
            </div>

            {/* Portfolio summary */}
            <div className="px-4 pt-3">
              <PortfolioSummary
                walletStats={walletStats}
                selectedChain={selectedChain}
                nativeToken={CHAIN_NATIVE_TOKENS[selectedChain]}
              />
            </div>

            {/* Address card */}
            <div className="px-4 pb-2">
              <AddressCard
                address={address}
                selectedChain={selectedChain}
                getExplorerUrl={(addr) => getExplorerUrl(addr, selectedChain)}
              />
            </div>

            {/* Navigation tabs */}
            <NavigationTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              className="px-4 mb-4"
            />

            {/* Recent wallets */}
            <RecentWallets
              recentWallets={recentWallets}
              currentAddress={address}
              truncateAddress={truncateAddress}
              className="px-4 mt-auto"
            />
          </div>
        </div>

        {/* Main content area */}
        <DashboardContent
          activeTab={activeTab}
          address={address}
          holdings={holdings}
          transactions={transactions}
          ethBalance={ethBalance}
          ethPrice={ethPrice}
          isLoading={isLoading}
          error={error}
          loadingStatus={loadingStatus}
          refreshData={refreshData}
          selectedChain={selectedChain}
          handleLoadingChange={handleLoadingChange}
          handleStatsUpdate={handleStatsUpdate}
        />
      </div>
    </div>
  );
};

export default WalletDashboard;
