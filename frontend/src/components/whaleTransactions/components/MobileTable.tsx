"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { WhaleTransaction } from "../../../types";
import type { CryptoData } from "../types";
import { truncate, formatValue } from "../utils/formatters";
import { getExchangeColor, getTrendIcon } from "../utils/exchanges";
import { getUsdValue } from "../utils/cryptoData";

interface MobileTableProps {
  transactions: WhaleTransaction[];
  cryptoData: Record<string, CryptoData>;
}

const MobileTable: React.FC<MobileTableProps> = ({
  transactions,
  cryptoData,
}) => {
  return (
    <div className="md:hidden space-y-3 px-4 py-4">
      <AnimatePresence>
        {transactions.map((tx: WhaleTransaction, index: number) => (
          <motion.div
            key={tx.hash}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${getExchangeColor(
                    tx.exchange
                  )}`}
                />
                <span className="font-medium text-gray-900 dark:text-white">
                  {tx.exchange}
                </span>
                {getTrendIcon(tx.exchange) && (
                  <span className="ml-2">{getTrendIcon(tx.exchange)}</span>
                )}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <time dateTime={tx.date} title={tx.date}>
                  {tx.age || tx.date}
                </time>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center space-x-1 text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 text-gray-500 dark:text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
                <a
                  href={`https://etherscan.io/address/${tx.from}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 font-mono text-xs"
                >
                  {truncate(tx.from)}
                </a>
                <span className="text-gray-500 dark:text-gray-400">→</span>
                <a
                  href={`https://etherscan.io/address/${tx.to}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 font-mono text-xs"
                >
                  {truncate(tx.to)}
                </a>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 mr-1 text-emerald-500 dark:text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400 text-sm">
                    {formatValue(tx.value)} {tx.blockchain}
                  </span>
                </div>
                {getUsdValue(tx.value, tx.blockchain, cryptoData) && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-4">
                    ≈ {getUsdValue(tx.value, tx.blockchain, cryptoData)}
                  </span>
                )}
              </div>
              <a
                href={`https://etherscan.io/tx/${tx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 flex items-center"
              >
                View
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>

            {(tx.block || tx.fee) && (
              <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                {tx.block && (
                  <div>
                    <span className="font-medium">Block:</span>{" "}
                    <a
                      href={`https://etherscan.io/block/${tx.block}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
                    >
                      {tx.block}
                    </a>
                  </div>
                )}
                {tx.fee && (
                  <div>
                    <span className="font-medium">Fee:</span> {tx.fee}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default MobileTable;
