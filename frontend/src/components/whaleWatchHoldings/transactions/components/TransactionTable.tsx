"use client";

import React from "react";
import { FiArrowDown, FiArrowUp, FiExternalLink } from "react-icons/fi";
import type { TransactionTableProps } from "../types";

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  address,
  chainId,
  getExplorerUrl,
  formatDate,
  formatAddress,
  formatNativeTokenValue,
  getTransactionDirection,
}) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-dark-text-secondary">
          No transactions found matching your filters
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-tertiary">
        <thead className="bg-gray-50 dark:bg-dark-tertiary">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider"
            >
              Transaction
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider"
            >
              Date
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider"
            >
              From
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider"
            >
              To
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider"
            >
              Value
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-dark-secondary divide-y divide-gray-200 dark:divide-dark-tertiary">
          {transactions.map((tx, idx) => {
            const direction = getTransactionDirection(tx, address);

            return (
              <tr
                key={idx}
                className="hover:bg-gray-50 dark:hover:bg-dark-tertiary/50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div
                      className={`p-2 rounded-full mr-3 ${
                        direction === "incoming"
                          ? "bg-green-100 dark:bg-green-900/30"
                          : "bg-red-100 dark:bg-red-900/30"
                      }`}
                    >
                      {direction === "incoming" ? (
                        <FiArrowDown
                          className={`h-4 w-4 text-green-600 dark:text-green-400`}
                        />
                      ) : (
                        <FiArrowUp
                          className={`h-4 w-4 text-red-600 dark:text-red-400`}
                        />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-dark-text-primary">
                        {direction === "incoming" ? "Received" : "Sent"}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-dark-text-secondary">
                        {`${tx.transactionHash.substring(
                          0,
                          8
                        )}...${tx.transactionHash.substring(
                          tx.transactionHash.length - 8
                        )}`}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-dark-text-primary">
                    {formatDate(tx.timestamp)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-dark-text-primary">
                    {formatAddress(
                      tx.from,
                      tx.from.toLowerCase() === address.toLowerCase()
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-dark-text-primary">
                    {formatAddress(
                      tx.to,
                      tx.to.toLowerCase() === address.toLowerCase()
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div
                    className={`text-sm font-medium ${
                      direction === "incoming"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {direction === "incoming" ? "+" : "-"}
                    {formatNativeTokenValue(tx.value, chainId)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <a
                    href={getExplorerUrl(tx.transactionHash, chainId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
                  >
                    <FiExternalLink className="inline h-5 w-5" />
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
