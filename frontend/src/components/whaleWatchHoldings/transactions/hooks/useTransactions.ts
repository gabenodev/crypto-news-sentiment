"use client"

import { useState, useMemo, useEffect } from "react"
import type { TransactionData, UseTransactionsReturn } from "../types"
import { getTransactionDirection } from "../utils/formatters"
import { TRANSACTIONS_PER_PAGE } from "../utils/constants"

export const useTransactions = (
  transactions: TransactionData[],
  address: string,
  isLoading: boolean,
): UseTransactionsReturn => {
  const [currentPage, setCurrentPage] = useState(1)
  const [filter, setFilter] = useState<"all" | "incoming" | "outgoing">("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Reset to first page when filter or search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [filter, searchTerm])

  // Process transactions to add direction
  const processedTransactions = useMemo(() => {
    return transactions.map((tx) => ({
      ...tx,
      direction: getTransactionDirection(tx, address),
    }))
  }, [transactions, address])

  // Apply filters and search
  const filteredTransactions = useMemo(() => {
    if (isLoading) return []

    return processedTransactions.filter((tx) => {
      // Apply direction filter
      if (filter !== "all" && getTransactionDirection(tx, address) !== filter) {
        return false
      }

      // Apply search filter if there's a search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          tx.transactionHash.toLowerCase().includes(searchLower) ||
          tx.from.toLowerCase().includes(searchLower) ||
          tx.to.toLowerCase().includes(searchLower)
        )
      }

      return true
    })
  }, [processedTransactions, filter, searchTerm, isLoading, address])

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / TRANSACTIONS_PER_PAGE))

  // Get current page transactions
  const currentPageTransactions = useMemo(() => {
    const indexOfLastTx = currentPage * TRANSACTIONS_PER_PAGE
    const indexOfFirstTx = indexOfLastTx - TRANSACTIONS_PER_PAGE
    return filteredTransactions.slice(indexOfFirstTx, indexOfLastTx)
  }, [filteredTransactions, currentPage])

  // Pagination function
  const paginate = (pageNumber: number) => {
    setCurrentPage(Math.min(Math.max(1, pageNumber), totalPages))
  }

  return {
    processedTransactions,
    filteredTransactions,
    currentPageTransactions,
    currentPage,
    totalPages,
    filter,
    searchTerm,
    setFilter,
    setSearchTerm,
    paginate,
  }
}
