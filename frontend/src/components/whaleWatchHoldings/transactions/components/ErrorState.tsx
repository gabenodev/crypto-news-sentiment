"use client";

import React from "react";
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import type { ErrorStateProps } from "../types";

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 bg-white dark:bg-dark-secondary rounded-xl shadow border border-gray-100 dark:border-dark-tertiary">
      <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
        <FiAlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-2">
        Error Loading Transactions
      </h3>
      <p className="text-sm text-gray-500 dark:text-dark-text-secondary text-center max-w-md mb-4">
        {error}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-dark-secondary"
        >
          <FiRefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
