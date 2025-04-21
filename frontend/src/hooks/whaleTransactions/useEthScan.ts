"use client"

import { fetchWhaleTransactions } from "../../utils/API/CoinGeckoAPI" // Importă funcția din api.ts
import { useState, useEffect } from "react"
import type { WhaleTransaction } from "../../types"

function useWhaleTransactions(page = 1, threshold = 100) {
  const [transactions, setTransactions] = useState<WhaleTransaction[]>([])
  const [totalPages, setTotalPages] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true)
        const data = await fetchWhaleTransactions(page, threshold) // Folosește funcția din api.ts
        setTransactions(data.transactions)
        setTotalPages(data.totalPages)
        setError(null)
      } catch (error) {
        console.error("Error fetching whale transactions:", error)
        setError("Failed to fetch whale transactions")
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [page, threshold])

  return { transactions, totalPages, loading, error }
}

export default useWhaleTransactions
