"use client";

// Pagination.tsx

import React from "react";

interface PaginationProps {
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  setPage,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-dark-secondary">
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
            const pageNum = Math.max(1, Math.min(page, totalPages - 2)) + i;
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
  );
};

export default Pagination;
