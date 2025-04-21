"use client"

import { useEffect, useState } from "react"
import { fetchCryptoData } from "../../utils/API/CoinGeckoAPI" // Importă funcția din api.ts
import type { Cryptocurrency } from "../../types"

function useCryptoData(page = 1) {
  const [cryptoData, setCryptoData] = useState<Cryptocurrency[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await fetchCryptoData(page) // Folosește funcția din api.ts
        setCryptoData(data)
        setError(null)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to fetch cryptocurrency data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [page])

  return { cryptoData, loading, error }
}

export default useCryptoData
