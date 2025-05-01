"use client"

import React from "react"
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"
import type { PaginationProps } from "../types"

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, paginate }) => {
  if (totalPages <= 1) return null

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = []

    if (totalPages <= 7) {
      // If 7 or fewer pages, show all
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Always include first page
      pageNumbers.push(1)

      // Add ellipsis if not on first few pages
      if (currentPage > 3) {
        pageNumbers.push("...")
      }

      // Add pages around current page
      const startPage = Math.max(2, currentPage - 1)
      const endPage = Math.min(totalPages - 1, currentPage + 1)

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }

      // Add ellipsis if not on last few pages
      if (currentPage < totalPages - 2) {
        pageNumbers.push("...")
      }

      // Always include last page
      pageNumbers.push(totalPages)
    }

    return pageNumbers
  }

  return (
    <div className="flex justify-center mt-6">
      <nav className="flex items-center space-x-1">
        {/* Previous button */}
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-md ${
            currentPage === 1
              ? "text-gray-400 dark:text-dark-text-secondary cursor-not-allowed"
              : "text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-tertiary"
          }`}
        >
          <FiChevronLeft className="h-5 w-5" />
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {typeof page === "number" ? (
              <button
                onClick={() => paginate(page)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === page
                    ? "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
                    : "text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-tertiary"
                }`}
              >
                {page}
              </button>
            ) : (
              <span className="px-2 text-gray-500 dark:text-dark-text-secondary">...</span>
            )}
          </React.Fragment>
        ))}

        {/* Next button */}
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-md ${
            currentPage === totalPages
              ? "text-gray-400 dark:text-dark-text-secondary cursor-not-allowed"
              : "text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-tertiary"
          }`}
        >
          <FiChevronRight className="h-5 w-5" />
        </button>
      </nav>
    </div>
  )
}

export default Pagination
