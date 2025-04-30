"use client"
import { useState, useEffect, useMemo } from "react"
import { FaRocket, FaBitcoin, FaChartLine, FaExchangeAlt } from "react-icons/fa"
import { excludedCoins } from "../../../utils/excludedCoins"
import type { CoinData, MarketDominanceData, SeasonStatus } from "../types"
import type { Cryptocurrency } from "../../../types"

export const useAltcoinSeasonData = () => {
  // State management
  const [loading, setLoading] = useState<boolean>(true)
  const [outperformingCount, setOutperformingCount] = useState<number>(0)
  const [totalAltcoins, setTotalAltcoins] = useState<number>(0)
  const [percentage, setPercentage] = useState<number>(0)
  const [outperformingCoins, setOutperformingCoins] = useState<CoinData[]>([])
  const [bitcoinData, setBitcoinData] = useState<Cryptocurrency | null>(null)
  const [marketDominance, setMarketDominance] = useState<MarketDominanceData | null>(null)
  const [enhancedIndex, setEnhancedIndex] = useState<number>(0)

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [cryptoResponse, dominanceResponse] = await Promise.all([
          fetch(`https://sentimentxv2-project.vercel.app/api/all-cryptos`),
          fetch(`https://sentimentxv2-project.vercel.app/api/market-dominance`),
        ])

        const [cryptoData, dominanceData] = await Promise.all([cryptoResponse.json(), dominanceResponse.json()])

        processCryptoData(cryptoData)
        processDominanceData(dominanceData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const processCryptoData = (data: Cryptocurrency[]) => {
    const filteredData = data.slice(0, 100).filter((coin) => !excludedCoins.has(coin.id))

    // Fill up to 100 coins if needed
    let index = 100
    while (filteredData.length < 100 && index < data.length) {
      const coin = data[index]
      if (!excludedCoins.has(coin.id)) {
        filteredData.push(coin)
      }
      index++
    }

    const bitcoin = data.find((coin) => coin.id === "bitcoin")
    if (!bitcoin) {
      console.error("Bitcoin data not found")
      return
    }

    setBitcoinData(bitcoin)

    const outperforming = filteredData.filter(
      (coin) => coin.price_change_percentage_24h > bitcoin.price_change_percentage_24h,
    )

    const outperformingCoinsData = outperforming.map((coin) => ({
      name: coin.name,
      priceChange: coin.price_change_percentage_24h,
      image: coin.image,
      id: coin.id,
      symbol: coin.symbol,
      marketCap: coin.market_cap,
      volume: coin.total_volume,
      rank: coin.market_cap_rank,
    }))

    const altcoinPercentage = (outperforming.length / filteredData.length) * 100

    setOutperformingCount(outperforming.length)
    setTotalAltcoins(filteredData.length)
    setOutperformingCoins(outperformingCoinsData)
    setPercentage(altcoinPercentage)
  }

  const processDominanceData = (data: any) => {
    if (data?.data?.market_cap_percentage) {
      const marketData = data.data.market_cap_percentage
      const btcDominance = marketData.btc || 0
      const ethDominance = marketData.eth || 0
      const usdtDominance = marketData.usdt || 0
      const othersDominance = 100 - btcDominance - ethDominance - usdtDominance

      setMarketDominance({
        btc: btcDominance,
        eth: ethDominance,
        usdt: usdtDominance,
        others: othersDominance,
      })
    }
  }

  // Enhanced index calculation
  useEffect(() => {
    if (marketDominance && percentage && bitcoinData) {
      // CoinMarketCap-like formula weights
      const altcoinPerformanceWeight = 0.35 // Reduced weight for altcoin performance
      const btcDominanceWeight = 0.45 // Increased weight for BTC dominance
      const stablecoinDominanceWeight = 0.2 // Stable weight for stablecoin dominance

      // Normalize factors to better match CMC ranges
      const altcoinPerformanceFactor = percentage * 0.5 // Reduced impact

      // BTC dominance factor with stronger inverse relationship
      const btcDominanceFactor = Math.max(0, 60 - marketDominance.btc) * 1.5

      // Stablecoin dominance with stronger inverse relationship
      const stablecoinDominanceFactor = Math.max(0, 15 - marketDominance.usdt) * 2

      // Calculate base index
      let enhancedIndexValue =
        altcoinPerformanceFactor * altcoinPerformanceWeight +
        btcDominanceFactor * btcDominanceWeight +
        stablecoinDominanceFactor * stablecoinDominanceWeight

      // Apply logarithmic scale to better match CMC's compression
      enhancedIndexValue = 100 * (1 - Math.exp(-enhancedIndexValue / 50))

      // Additional adjustment based on Bitcoin performance
      const btcPerformance = bitcoinData.price_change_percentage_24h || 0
      if (btcPerformance > 5) {
        enhancedIndexValue *= 0.8 // Reduce index during strong BTC rallies
      } else if (btcPerformance < -5) {
        enhancedIndexValue *= 1.2 // Boost index during BTC drops
      }

      // Final smoothing and bounding
      setEnhancedIndex((prev) => {
        const boundedValue = Math.min(100, Math.max(0, enhancedIndexValue))
        return prev ? prev * 0.7 + boundedValue * 0.3 : boundedValue
      })
    }
  }, [marketDominance, percentage, bitcoinData])

  const seasonStatus = useMemo<SeasonStatus>(() => {
    if (enhancedIndex >= 75) {
      return {
        title: "Altcoin Season",
        description:
          "Altcoins are significantly outperforming Bitcoin. This is typically a good time for altcoin investments.",
        color: "from-emerald-500 to-green-400",
        icon: <FaRocket className="text-white text-2xl" />,
        bgColor: "bg-emerald-500",
      }
    } else if (enhancedIndex >= 50) {
      return {
        title: "Altcoin Season Approaching",
        description: "Many altcoins are outperforming Bitcoin. The market is showing signs of altcoin strength.",
        color: "from-teal-500 to-cyan-400",
        icon: <FaChartLine className="text-white text-2xl" />,
        bgColor: "bg-teal-500",
      }
    } else if (enhancedIndex >= 25) {
      return {
        title: "Neutral Market",
        description: "The market is balanced between Bitcoin and altcoins. No clear trend is visible.",
        color: "from-amber-500 to-yellow-400",
        icon: <FaExchangeAlt className="text-white text-2xl" />,
        bgColor: "bg-amber-500",
        additionalText: "Market is in transition - watch for breakout opportunities in either direction.",
      }
    } else {
      return {
        title: "Bitcoin Season",
        description: "Bitcoin is outperforming most altcoins. This is typically a good time to focus on Bitcoin.",
        color: "from-orange-500 to-red-400",
        icon: <FaBitcoin className="text-white text-2xl" />,
        bgColor: "bg-orange-500",
      }
    }
  }, [enhancedIndex])

  const enhancedStatus = useMemo<SeasonStatus>(() => {
    if (enhancedIndex >= 75) {
      return {
        title: "Altcoin Season",
        description:
          "Multiple indicators suggest we're in a strong altcoin season. Altcoins are significantly outperforming Bitcoin, and Bitcoin dominance is decreasing.",
        color: "from-emerald-500 to-green-400",
        icon: <FaRocket className="text-white text-2xl" />,
        bgColor: "bg-emerald-500",
      }
    } else if (enhancedIndex >= 50) {
      return {
        title: "Altcoin Season Approaching",
        description:
          "Several indicators point to a developing altcoin season. Many altcoins are outperforming Bitcoin, with decreasing Bitcoin dominance.",
        color: "from-teal-500 to-cyan-400",
        icon: <FaChartLine className="text-white text-2xl" />,
        bgColor: "bg-teal-500",
      }
    } else if (enhancedIndex >= 25) {
      return {
        title: "Neutral Market",
        description:
          "The market shows mixed signals. Some altcoins are performing well, but Bitcoin still maintains significant dominance.",
        color: "from-amber-500 to-yellow-400",
        icon: <FaExchangeAlt className="text-white text-2xl" />,
        bgColor: "bg-amber-500",
      }
    } else {
      return {
        title: "Bitcoin Season",
        description:
          "Bitcoin is outperforming most altcoins and maintains high market dominance. This is typically a good time to focus on Bitcoin.",
        color: "from-orange-500 to-red-400",
        icon: <FaBitcoin className="text-white text-2xl" />,
        bgColor: "bg-orange-500",
      }
    }
  }, [enhancedIndex])

  return {
    loading,
    outperformingCount,
    totalAltcoins,
    percentage,
    outperformingCoins,
    bitcoinData,
    enhancedIndex,
    seasonStatus,
    enhancedStatus,
  }
}

export default useAltcoinSeasonData
