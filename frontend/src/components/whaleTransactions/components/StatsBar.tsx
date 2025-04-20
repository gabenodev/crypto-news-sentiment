import React from "react";
import { formatCurrency } from "../utils/formatters";
import { getCryptoPrice } from "../utils/cryptoData";
import { getTopExchange } from "../utils/analysis";

interface StatItem {
  icon: JSX.Element;
  title: string;
  value: string;
  bgColor: string;
}

interface StatsBarProps {
  transactions: any[];
  cryptoData: Record<string, any>;
}

export const StatsBar = ({ transactions, cryptoData }: StatsBarProps) => {
  const stats: StatItem[] = [
    {
      icon: <ChartIcon />,
      title: "Total Transactions",
      value: `${transactions.length}+`,
      bgColor: "bg-teal-100 dark:bg-teal-900/50",
    },
    {
      icon: <MoneyIcon />,
      title: "Avg. Value",
      value: calculateAverageValue(transactions, cryptoData),
      bgColor: "bg-blue-100 dark:bg-blue-900/50",
    },
    {
      icon: <ExchangeIcon />,
      title: "Top Exchange",
      value: getTopExchange(transactions),
      bgColor: "bg-purple-100 dark:bg-purple-900/50",
    },
    {
      icon: <ShieldIcon />,
      title: "Data Security",
      value: "Verified",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/50",
    },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 border-b border-gray-200 dark:border-gray-700 grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatItemComponent key={index} {...stat} />
      ))}
    </div>
  );
};

const StatItemComponent = ({ icon, title, value, bgColor }: StatItem) => (
  <div className="flex items-center">
    <div className={`${bgColor} p-2 rounded-lg mr-3`}>{icon}</div>
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{title}</p>
      <p className="font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const calculateAverageValue = (
  transactions: any[],
  cryptoData: Record<string, any>
): string => {
  if (transactions.length === 0) return "$0";

  const total = transactions.reduce((sum, tx) => {
    const price = getCryptoPrice(tx.blockchain.toLowerCase(), cryptoData) || 0;
    return sum + tx.value * price;
  }, 0);

  return formatCurrency(total / transactions.length);
};

// Iconițe cu culorile originale
const ChartIcon = () => (
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
);

const MoneyIcon = () => (
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
);

const ExchangeIcon = () => (
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
);

const ShieldIcon = () => (
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
);
