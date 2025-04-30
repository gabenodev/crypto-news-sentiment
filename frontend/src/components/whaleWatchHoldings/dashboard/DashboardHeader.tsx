"use client";

import React from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import type { DashboardHeaderProps } from "../types";

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  address,
  error,
  refreshData,
}) => {
  return (
    <>
      <div className="mb-4">
        <Link
          to="/wallet-holdings"
          className="inline-flex items-center text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          <span>Back to Wallet Search</span>
        </Link>
      </div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg">
          <p className="text-red-700 dark:text-red-400 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
          <button
            onClick={refreshData}
            className="mt-3 px-4 py-2 bg-red-100 dark:bg-red-800/30 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </>
  );
};

export default DashboardHeader;
