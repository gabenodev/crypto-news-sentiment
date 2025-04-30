"use client";

import React from "react";
import { Link } from "react-router-dom";
import { FiHome, FiPieChart, FiActivity, FiClock } from "react-icons/fi";
import { generateWalletPlaceholder } from "../../../utils/placeholderGenerator";
import ChainSelector from "./ChainSelector";
import PortfolioSummary from "./PortfolioSummary";
import AddressCard from "./AddressCard";
import type { SidebarProps } from "../types";

const Sidebar: React.FC<SidebarProps> = ({
  address,
  walletInfo,
  activeTab,
  setActiveTab,
  walletStats,
  recentWallets,
  selectedChain,
  setSelectedChain,
  dropdownOpen,
  setDropdownOpen,
  dropdownRef,
  copySuccess,
  setCopySuccess,
}) => {
  // Function to truncate address for display
  const truncateAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div
      className="hidden lg:block lg:w-80 bg-white dark:bg-dark-primary shadow-lg fixed left-0 top-[57px] z-40 overflow-y-auto border-r border-gray-200 dark:border-gray-700"
      style={{ height: "calc(100vh - 57px)" }}
    >
      <div className="flex flex-col h-full pb-4">
        {/* Wallet header - more compact */}
        <div className="px-4 py-4 flex items-center border-b border-gray-200 dark:border-gray-700">
          <div className="h-12 w-12 rounded-full overflow-hidden bg-gradient-to-br from-teal-400/30 to-teal-600/30 p-0.5 mr-3">
            <img
              src={generateWalletPlaceholder(address, 48) || "/placeholder.svg"}
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

        {/* Chain selector */}
        <div className="px-4 py-3">
          <ChainSelector
            selectedChain={selectedChain}
            setSelectedChain={setSelectedChain}
            dropdownOpen={dropdownOpen}
            setDropdownOpen={setDropdownOpen}
            dropdownRef={dropdownRef}
          />
        </div>

        {/* Portfolio summary */}
        <div className="px-4 pt-3">
          <PortfolioSummary
            walletStats={walletStats}
            selectedChain={selectedChain}
          />
        </div>

        {/* Address card */}
        <div className="px-4 pb-2">
          <AddressCard
            address={address}
            copySuccess={copySuccess}
            setCopySuccess={setCopySuccess}
            selectedChain={selectedChain}
          />
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
  );
};

export default Sidebar;
