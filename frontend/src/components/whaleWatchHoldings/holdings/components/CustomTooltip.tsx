import React from "react";
import type { CustomTooltipProps } from "../types";
import { formatCurrency } from "../utils/formatters";

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-2">
          <div
            className="w-4 h-4 rounded-full mr-2"
            style={{ backgroundColor: payload[0].color }}
          ></div>
          <p className="font-medium text-gray-900 dark:text-white text-base">
            {data.tokenInfo?.name || data.name}
          </p>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
          <span className="font-medium">Symbol:</span>{" "}
          {data.tokenInfo?.symbol || data.symbol}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
          <span className="font-medium">Value:</span>{" "}
          {formatCurrency(data.value || 0)}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          <span className="font-medium">Percentage:</span>{" "}
          {(data.percentage || 0).toFixed(2)}%
        </p>
      </div>
    );
  }
  return null;
};

export default CustomTooltip;
