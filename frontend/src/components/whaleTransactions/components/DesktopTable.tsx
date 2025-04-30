"use client";

// components/whaleTransactions/DesktopTable.tsx

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { WhaleTransaction } from "../../../types";
import type { CryptoData } from "./../types";
import { truncate, formatValue } from "../utils/formatters";
import { getExchangeColor, getTrendIcon } from "../utils/exchanges";
import { getUsdValue } from "../utils/cryptoData";

type Props = {
  transactions: WhaleTransaction[];
  cryptoData: Record<string, CryptoData>;
};

const DesktopTable: React.FC<Props> = ({ transactions, cryptoData }) => {
  return (
    <div className="hidden md:block overflow-x-auto overflow-hidden">
      <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Exchange
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Transaction
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Value (USD)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Time
            </th>
            {transactions[0]?.block && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Block
              </th>
            )}
            {transactions[0]?.fee && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Fee
              </th>
            )}
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          <AnimatePresence>
            {transactions.map((tx, index) => (
              <motion.tr
                key={tx.hash}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${getExchangeColor(
                        tx.exchange
                      )}`}
                    />
                    <span className="font-medium text-gray-900 dark:text-white flex items-center">
                      {tx.exchange}
                      {getTrendIcon(tx.exchange) && (
                        <span className="ml-2">
                          {getTrendIcon(tx.exchange)}
                        </span>
                      )}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <AddressLink address={tx.from} label="From" />
                    <AddressLink address={tx.to} label="To" />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      {formatValue(tx.value)} {tx.blockchain}
                    </span>
                    {getUsdValue(tx.value, tx.blockchain, cryptoData) && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        ≈ {getUsdValue(tx.value, tx.blockchain, cryptoData)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {getUsdValue(tx.value, tx.blockchain, cryptoData) || (
                      <span className="text-gray-400 dark:text-gray-500">
                        N/A
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <svg
                      className="h-3 w-3 mr-1"
                      xmlns="http://www.w3.org/2000/svg"
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
                </td>
                {tx.block && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <a
                      href={`https://etherscan.io/block/${tx.block}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 font-mono"
                    >
                      {tx.block}
                    </a>
                  </td>
                )}
                {tx.fee && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {tx.fee}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex justify-end space-x-2">
                    <a
                      href={`https://etherscan.io/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      title="View on Etherscan"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
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
                      View
                    </a>
                  </div>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
};

const AddressLink = ({
  address,
  label,
}: {
  address: string;
  label: string;
}) => (
  <div className="group relative inline-flex mt-1">
    <a
      href={`https://etherscan.io/address/${address}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 font-mono text-sm flex items-center"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-3 w-3 mr-1 text-gray-400 dark:text-gray-500"
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
      {truncate(address)}
    </a>
    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10">
      <div className="bg-gray-800 dark:bg-gray-700 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-lg">
        <p className="font-mono">{address}</p>
        <p className="mt-1 text-teal-400">Click to view on Etherscan</p>
      </div>
    </div>
  </div>
);

export default DesktopTable;
