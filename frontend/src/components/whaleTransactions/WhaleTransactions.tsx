"use client";

import React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useWhaleTransactions from "../../hooks/whaleTransactions/useEthScan";
import type { WhaleTransaction } from "../../types";

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  [key: string]: any;
}

export default function WhaleTransactions(): JSX.Element {
  const [page, setPage] = useState<number>(1);
  const [cryptoData, setCryptoData] = useState<Record<string, CryptoData>>({});
  const [isLoadingCryptoData, setIsLoadingCryptoData] = useState<boolean>(true);
  const itemsPerPage = 10;

  const { transactions, totalPages, loading } = useWhaleTransactions(
    page,
    itemsPerPage
  );

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await fetch(
          "https://sentimentxv2-project.vercel.app/api/all-cryptos"
        );
        const data = await response.json();
        const cryptoMap = data.reduce(
          (acc: Record<string, CryptoData>, crypto: CryptoData) => {
            acc[crypto.symbol.toLowerCase()] = crypto;
            return acc;
          },
          {}
        );
        setCryptoData(cryptoMap);
      } catch (error) {
        console.error("Failed to fetch crypto data:", error);
      } finally {
        setIsLoadingCryptoData(false);
      }
    };

    fetchCryptoData();
  }, []);

  const truncate = (str: string): string => {
    return str.length > 15 ? `${str.slice(0, 6)}...${str.slice(-4)}` : str;
  };

  const getExchangeColor = (exchange: string): string => {
    const exchangeColors: Record<string, string> = {
      Binance: "bg-yellow-500",
      Coinbase: "bg-blue-500",
      Huobi: "bg-teal-500",
      Kraken: "bg-purple-500",
      FTX: "bg-orange-500",
      Bitfinex: "bg-red-500",
      OKX: "bg-indigo-500",
      Bybit: "bg-green-500",
      KuCoin: "bg-pink-500",
    };

    return exchangeColors[exchange] || "bg-gray-500";
  };

  const formatValue = (value: number): string => {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 5,
    });
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getCryptoPrice = (symbol: string): number | null => {
    const crypto = cryptoData[symbol.toLowerCase()];
    return crypto ? crypto.current_price : null;
  };

  const getUsdValue = (value: number, symbol: string): string | null => {
    const price = getCryptoPrice(symbol);
    if (price === null) return null;
    return formatCurrency(value * price);
  };

  const getTrendIcon = (exchange: string) => {
    const trendIcons: Record<string, JSX.Element> = {
      Binance: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-yellow-500"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M16.624 13.9202l2.7175 2.7154-7.353 7.353-7.353-7.352 2.7175-2.7164 4.6355 4.6595 4.6356-4.6595zm4.6366-4.6366L24 12l-2.7154 2.7164L18.5682 12l2.6924-2.7164zm-9.272.001l2.7163 2.6914-2.7164 2.7174v-.001L9.2721 12l2.7164-2.7154zm-9.2722-.001L5.4088 12l-2.6914 2.6924L0 12l2.7164-2.7164zM11.9885.0115l7.353 7.329-2.7174 2.7154-4.6356-4.6356-4.6355 4.6595-2.7174-2.7154 7.353-7.353z" />
        </svg>
      ),
      Coinbase: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-blue-500"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 24C5.376 24 0 18.624 0 12S5.376 0 12 0s12 5.376 12 12-5.376 12-12 12zm4.5-15.5h-9v7h9v-7z" />
        </svg>
      ),
      Kraken: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-purple-500"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 24C5.376 24 0 18.624 0 12S5.376 0 12 0s12 5.376 12 12-5.376 12-12 12zm-5.5-7.5h11v-4h-11v4z" />
        </svg>
      ),
    };

    return trendIcons[exchange] || null;
  };
  const getTopExchange = (): string => {
    if (transactions.length === 0) return "N/A";

    const exchangeCounts = transactions.reduce((acc, tx) => {
      acc[tx.exchange] = (acc[tx.exchange] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedExchanges = Object.entries(exchangeCounts).sort(
      (a, b) => b[1] - a[1]
    );
    return sortedExchanges[0][0];
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-teal-500 to-emerald-600">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Whale Transactions
              </h2>
              <p className="text-sm text-teal-100 dark:text-teal-200 mt-1">
                Tracking large cryptocurrency movements across major exchanges
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 text-xs font-medium bg-white/20 text-white rounded-full flex items-center">
                <span className="relative flex h-2 w-2 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Live Data
              </div>
              <button
                onClick={() => {
                  setPage(1);
                }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                title="Refresh"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 border-b border-gray-200 dark:border-gray-700 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center">
            <div className="bg-teal-100 dark:bg-teal-900/50 p-2 rounded-lg mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-teal-600 dark:text-teal-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Total Transactions
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {transactions.length * totalPages}+
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-600 dark:text-blue-400"
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
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Avg. Value
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {transactions.length > 0
                  ? formatCurrency(
                      transactions.reduce(
                        (sum, tx) =>
                          sum +
                          tx.value *
                            (getCryptoPrice(tx.blockchain.toLowerCase()) || 0),
                        0
                      ) / transactions.length
                    )
                  : "$0"}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-lg mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-purple-600 dark:text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Top Exchange
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {getTopExchange()}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-lg mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Data Security
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                Verified
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading || isLoadingCryptoData ? (
          <div className="p-6">
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-teal-500 dark:text-teal-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Loading whale transactions...
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="border rounded-lg p-4 animate-pulse bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                        <div>
                          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          <div className="h-3 w-16 mt-1 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      </div>
                      <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Array(6)
                        .fill(0)
                        .map((_, j) => (
                          <div
                            key={j}
                            className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
                          ></div>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div>
            {/* Desktop view */}
            <div className="hidden md:block overflow-x-auto">
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
                    {transactions.length > 0 && transactions[0].block && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Block
                      </th>
                    )}
                    {transactions.length > 0 && transactions[0].fee && (
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
                    {transactions.map((tx: WhaleTransaction, index: number) => (
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
                            ></div>
                            <div className="flex items-center">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {tx.exchange}
                              </span>
                              {getTrendIcon(tx.exchange) && (
                                <span className="ml-2">
                                  {getTrendIcon(tx.exchange)}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="group relative inline-flex">
                              <a
                                href={`https://etherscan.io/address/${tx.from}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 font-mono text-sm flex items-center"
                              >
                                <span className="inline-flex items-center">
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
                                  {truncate(tx.from)}
                                </span>
                              </a>
                              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10">
                                <div className="bg-gray-800 dark:bg-gray-700 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-lg">
                                  <p className="font-mono">{tx.from}</p>
                                  <p className="mt-1 text-teal-400">
                                    Click to view on Etherscan
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="group relative inline-flex mt-1">
                              <a
                                href={`https://etherscan.io/address/${tx.to}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 font-mono text-sm flex items-center"
                              >
                                <span className="inline-flex items-center">
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
                                  {truncate(tx.to)}
                                </span>
                              </a>
                              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10">
                                <div className="bg-gray-800 dark:bg-gray-700 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-lg">
                                  <p className="font-mono">{tx.to}</p>
                                  <p className="mt-1 text-teal-400">
                                    Click to view on Etherscan
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-medium text-emerald-600 dark:text-emerald-400">
                              {formatValue(tx.value)} {tx.blockchain}
                            </span>
                            {getUsdValue(tx.value, tx.blockchain) && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                ≈ {getUsdValue(tx.value, tx.blockchain)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {getUsdValue(tx.value, tx.blockchain) || (
                              <span className="text-gray-400 dark:text-gray-500">
                                N/A
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
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
                        </td>
                        {transactions.length > 0 && transactions[0].block && (
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
                        {transactions.length > 0 && transactions[0].fee && (
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

            {/* Mobile view */}
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
                        ></div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {tx.exchange}
                        </span>
                        {getTrendIcon(tx.exchange) && (
                          <span className="ml-2">
                            {getTrendIcon(tx.exchange)}
                          </span>
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
                        <span className="text-gray-500 dark:text-gray-400">
                          →
                        </span>
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
                        {getUsdValue(tx.value, tx.blockchain) && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-4">
                            ≈ {getUsdValue(tx.value, tx.blockchain)}
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

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 sm:mb-0">
                Showing page {page} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className={`px-4 py-2 text-sm font-medium rounded-md border flex items-center ${
                    page === 1
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500 dark:border-gray-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
                  }`}
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Previous
                </button>
                <div className="flex items-center space-x-1 px-2">
                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                    const pageNum =
                      Math.max(1, Math.min(page, totalPages - 2)) + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 flex items-center justify-center text-sm rounded-md ${
                          page === pageNum
                            ? "bg-teal-500 text-white"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 3 && page < totalPages - 2 && (
                    <span className="px-1">...</span>
                  )}
                  {totalPages > 3 && page < totalPages - 1 && (
                    <button
                      onClick={() => setPage(totalPages)}
                      className={`w-8 h-8 flex items-center justify-center text-sm rounded-md ${
                        page === totalPages
                          ? "bg-teal-500 text-white"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
                      }`}
                    >
                      {totalPages}
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className={`px-4 py-2 text-sm font-medium rounded-md border flex items-center ${
                    page === totalPages
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500 dark:border-gray-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
                  }`}
                >
                  Next
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
