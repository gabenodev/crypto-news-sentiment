"use client"

import { useEffect, useState } from "react"
import { fetchMarketDominance } from "../../utils/API/CoinGeckoAPI"
import type { MarketDominanceItem } from "../../types"

function useMarketDominance() {
  const [dominance, setDominance] = useState<MarketDominanceItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(false)

        const data = await fetchMarketDominance() // Call the function from api.ts

        const marketData = data.data.market_cap_percentage // Get the data you need

        const btc = Number.parseFloat(marketData.btc.toFixed(2))
        const eth = Number.parseFloat(marketData.eth.toFixed(2))
        const usdt = Number.parseFloat(marketData.usdt?.toFixed(2) || "0")
        const others = 100 - btc - eth - usdt

        setDominance([
          { name: "BTC", value: btc },
          { name: "ETH", value: eth },
          { name: "USDT", value: usdt },
          { name: "OTHERS", value: Number.parseFloat(others.toFixed(2)) },
        ])
      } catch (err) {
        setError(true)
        console.error("Error fetching market dominance:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { dominance, loading, error }
}

export default useMarketDominance
