"use client";

import React from "react";
import { FiGlobe, FiChevronDown, FiCheck } from "react-icons/fi";
import type { ChainSelectorProps } from "../types";
import { AVAILABLE_CHAINS } from "../utils/constants";

// Add this at the top of the file, after the imports
declare global {
  interface Window {
    refreshWalletData?: () => void;
  }
}

const ChainSelector: React.FC<ChainSelectorProps> = ({
  selectedChain,
  setSelectedChain,
  dropdownOpen,
  setDropdownOpen,
  dropdownRef,
}) => {
  // Update the handleChainChange function to force a data refresh when chain changes
  const handleChainChange = (chainId: number) => {
    if (chainId !== selectedChain) {
      setSelectedChain(chainId);
      // Close the dropdown after selection
      setDropdownOpen(false);

      // Add a small delay to ensure the UI updates before data fetching starts
      setTimeout(() => {
        if (window.refreshWalletData) {
          window.refreshWalletData();
        }
      }, 100);
    }
  };

  // Get the currently selected chain
  const selectedChainData =
    AVAILABLE_CHAINS.find((chain) => chain.id === selectedChain) ||
    AVAILABLE_CHAINS[0];

  return (
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
            <span className="font-medium">{selectedChainData.name}</span>
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
            {AVAILABLE_CHAINS.map((chain) => (
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
                <span className="flex-grow text-left">{chain.name}</span>
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
  );
};

export default ChainSelector;
