"use client"
import type { TrendingCoin } from "../../types" // Asigură-te că ai definit tipul TrendingCoin în types.ts
import { useState, useEffect } from "react"
import { fetchTrendingCoins } from "../../utils/API/CoinGeckoAPI" // Importa funcția din api.ts

function useTrendingCoins() {
  const [trendingCoins, setTrendingCoins] = useState<TrendingCoin[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await fetchTrendingCoins() // Folosește funcția importată
        setTrendingCoins(data.coins.slice(0, 5)) // Prelucrarea datelor primite
        setError(null)
      } catch (error) {
        console.error("Error fetching trending coins:", error)
        setError("Failed to fetch trending coins data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { trendingCoins, loading, error }
}

export default useTrendingCoins
