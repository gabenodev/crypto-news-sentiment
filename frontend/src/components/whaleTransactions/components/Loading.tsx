// components/whales/WhaleTransactionsLoading.tsx
import React from "react";

const WhaleTransactionsLoading = () => {
  return (
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
  );
};

export default WhaleTransactionsLoading;
