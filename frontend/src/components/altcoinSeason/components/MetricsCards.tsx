import { FaChartLine, FaBitcoin } from "react-icons/fa";
import type { MetricsCardsProps } from "../types";
import * as React from "react";
const MetricsCards = ({
  outperformingCount,
  totalAltcoins,
  percentage,
  enhancedStatus,
  enhancedIndex,
  bitcoinData,
}: MetricsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        className={`p-6 rounded-xl border shadow-md ${
          enhancedStatus.bgColor
        } bg-opacity-10 dark:bg-opacity-20 border-${enhancedStatus.bgColor.replace(
          "bg-",
          ""
        )}/30`}
      >
        <div className="flex items-center mb-3">
          <div
            className={`w-10 h-10 rounded-full ${enhancedStatus.bgColor} flex items-center justify-center mr-3`}
          >
            {enhancedStatus.icon}
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            {enhancedStatus.title}
          </h3>
        </div>
        <div className="flex items-baseline">
          <span
            className={`text-4xl font-bold ${enhancedStatus.bgColor.replace(
              "bg-",
              "text-"
            )}`}
          >
            {enhancedIndex.toFixed(1)}
          </span>
          <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            / 100
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md">
        <div className="flex items-center mb-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mr-3">
            <FaChartLine className="text-white text-lg" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            Outperforming Altcoins
          </h3>
        </div>
        <div className="flex items-baseline">
          <span className="text-4xl font-bold text-blue-500 dark:text-blue-400">
            {outperformingCount}
          </span>
          <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            / {totalAltcoins} coins
          </span>
        </div>
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {percentage.toFixed(1)}% outperforming Bitcoin
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md">
        <div className="flex items-center mb-3">
          <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center mr-3">
            <FaBitcoin className="text-white text-lg" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            Bitcoin Performance
          </h3>
        </div>
        <div className="flex items-baseline">
          <span
            className={`text-4xl font-bold ${
              (bitcoinData?.price_change_percentage_24h ?? 0) >= 0
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {bitcoinData
              ? (bitcoinData.price_change_percentage_24h >= 0 ? "+" : "") +
                bitcoinData.price_change_percentage_24h.toFixed(2) +
                "%"
              : "0.00%"}
          </span>
          <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            24h change
          </span>
        </div>
        {bitcoinData && (
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Price: ${bitcoinData.current_price.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricsCards;
