import React from "react";
import type { CustomTooltipProps } from "../types";
import { formatCurrency } from "../utils/formatters";

// Custom tooltip component with improved styling for dark mode
export const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-3 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-medium mb-1">{`${label}`}</p>
        {payload.map((item: any) => (
          <p key={item.dataKey} className="text-sm">
            {`${item.name}: ${
              item.dataKey === "gas"
                ? `${(item.value * 1000000).toFixed(6)} Gwei`
                : formatCurrency(item.value)
            }`}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

// Custom tooltip for transaction activity
export const TransactionActivityTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-medium text-gray-900 dark:text-white text-base">
          {new Date(label ?? "").toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          <span className="font-medium">Transactions:</span> {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

// Custom pie chart label component to avoid overlapping
export const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
  name,
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.1;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Shorten name for display
  const displayName = name.length > 6 ? name.substring(0, 6) + "..." : name;

  return (
    <text
      x={x}
      y={y}
      fill="#FFFFFF"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      style={{
        fontSize: "12px",
        fontWeight: "bold",
        textShadow: "0px 0px 3px rgba(0,0,0,0.7)",
      }}
    >
      {`${displayName} (${(percent * 100).toFixed(1)}%)`}
    </text>
  );
};
