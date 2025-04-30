"use client";

import React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
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

// Import dashboard components
import Sidebar from "./dashboard/Sidebar";
import DashboardHeader from "./dashboard/DashboardHeader";
import MainContent from "./dashboard/MainContent";
import InvalidAddressError from "./dashboard/InvalidAddressError";

// Import types and constants
import type { TabType } from "./types";
import { KNOWN_WALLETS } from "./utils/constants";

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
  const [hideFooter] = useState(true); // State pentru a ascunde footer-ul

  // Get wallet info if it's a known wallet
  const walletInfo = KNOWN_WALLETS[address] || null;

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

  // Calculate total value function - memoize with useCallback
  const calculateTotalValue = useCallback(
    (holdings: any[], ethBalance: number, ethPrice: number) => {
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
    },
    [selectedChain]
  );

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
  }, [address, isValidAddress, refreshKey, selectedChain, calculateTotalValue]);

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

  // If address is invalid, show error
  if (!isValidAddress) {
    return <InvalidAddressError address={address} />;
  }

  return (
    <div className="flex flex-col w-full min-h-screen">
      <div className="flex-grow flex flex-col md:flex-row relative">
        {/* Sidebar */}
        <Sidebar
          address={address}
          walletInfo={walletInfo}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          walletStats={walletStats}
          recentWallets={recentWallets}
          selectedChain={selectedChain}
          setSelectedChain={setSelectedChain}
          dropdownOpen={dropdownOpen}
          setDropdownOpen={setDropdownOpen}
          dropdownRef={dropdownRef}
          copySuccess={copySuccess}
          setCopySuccess={setCopySuccess}
        />

        {/* Main content area */}
        <div className="w-full lg:ml-80 flex-1 p-4 pt-4 mt-0">
          <DashboardHeader
            address={address}
            error={error}
            refreshData={refreshData}
          />

          <MainContent
            activeTab={activeTab}
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
        </div>
      </div>
    </div>
  );
};

export default WalletDashboard;
