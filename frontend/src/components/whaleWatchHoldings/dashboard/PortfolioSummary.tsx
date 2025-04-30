import React from "react";
import { CHAIN_NATIVE_TOKENS } from "../../../utils/API/etherScanAPI";
import type { PortfolioSummaryProps } from "../types";

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  walletStats,
  selectedChain,
}) => {
  return (
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
  );
};

export default PortfolioSummary;
