"use client";

import React from "react";
import { FiCopy, FiExternalLink } from "react-icons/fi";
import type { AddressCardProps } from "./types";

const AddressCard: React.FC<AddressCardProps> = ({
  address,
  copySuccess,
  setCopySuccess,
  selectedChain,
}) => {
  // Copy address to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Get explorer URL based on selected chain
  const getExplorerUrl = (address: string) => {
    return selectedChain === 56
      ? `https://bscscan.com/address/${address}`
      : `https://etherscan.io/address/${address}`;
  };

  return (
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
            title={`View on ${selectedChain === 56 ? "BscScan" : "Etherscan"}`}
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
  );
};

export default AddressCard;
