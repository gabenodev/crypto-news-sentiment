"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { CHAIN_NATIVE_TOKENS, CHAIN_NATIVE_TOKEN_NAMES } from "../../../../utils/API/etherScanAPI"
import type { TokenData, TransactionData, OverviewStats, AssetDistributionItem } from "../types"
import type { TimeRange } from "../utils/constants"

export const usePortfolioData = (
  address: string,
  holdings: TokenData[] = [],
  transactions: TransactionData[] = [],
  ethBalance = 0,
  ethPrice = 3500,
  isLoading = false,
  chainId = 1,
  onLoadingChange?: (loading: boolean) => void,
  onStatsUpdate?: (stats: any) => void,
) => {
  const [loading, setLoading] = useState(isLoading)
  const [stats, setStats] = useState<OverviewStats>({
    totalValue: 0,
    ethBalance: ethBalance,
    ethPrice: ethPrice,
    tokenCount: 0,
    transactionCount: 0,
    lastActivity: null,
    incomingValue: 0,
    outgoingValue: 0,
  })
  const [activeTimeRange, setActiveTimeRange] = useState<TimeRange>("30d")
  const [processedHoldings, setProcessedHoldings] = useState<TokenData[]>([])
  const [showAllTokens, setShowAllTokens] = useState(false)

  // Add a ref to track if data has changed
  const previousDataRef = useRef<string | null>(null)

  // Use refs to prevent duplicate requests and infinite loops
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Add a ref to track if we've already processed the data
  const dataProcessedRef = useRef(false)

  // Add a function to check and correct abnormal values
  const normalizeTokenValue = (token: TokenData, totalPortfolioValue: number): TokenData => {
    if (!token || !token.tokenInfo) return token

    // Make sure formattedBalance is always defined
    const formattedBalance = token.formattedBalance || 0

    // Check if the token has a suspicious value
    if (token.value && token.value > 1000000000) {
      // Over 1 billion USD
      const symbol = token.tokenInfo.symbol.toLowerCase()
      // Allow known stablecoins to have large values
      const isStablecoin = ["usdt", "usdc", "dai", "busd", "tusd"].includes(symbol)

      if (!isStablecoin) {
        // Check if token name contains suspicious words
        const name = token.tokenInfo.name.toLowerCase()
        const suspiciousWords = [
          "vitalik",
          "buterin",
          "musk",
          "elon",
          "raccoon",
          "pet",
          "inu",
          "shib",
          "doge",
          "moon",
          "safe",
        ]

        if (suspiciousWords.some((word) => name.includes(word)) || token.value > totalPortfolioValue * 0.9) {
          console.log(`🚨 Correcting suspicious token value: ${token.tokenInfo.name} from ${token.value} to 0`)
          // Reset value and percentage for suspicious tokens
          return {
            ...token,
            formattedBalance,
            value: 0,
            percentage: 0,
          }
        }
      }
    }

    return {
      ...token,
      formattedBalance,
    }
  }

  // Process holdings and transactions data
  useEffect(() => {
    if (isLoading) {
      setLoading(true)
      dataProcessedRef.current = false
      return
    }

    // Use a reference to check if data has actually changed
    const holdingsKey =
      holdings && holdings.length
        ? JSON.stringify(holdings.map((h) => h.tokenInfo?.contractAddress + h.balance))
        : "empty-holdings"

    const transactionsKey =
      transactions && transactions.length > 0 ? transactions[0].transactionHash : "empty-transactions"

    const dataKey = `${holdingsKey}-${transactionsKey}-${ethBalance}`

    // Check if data is identical to previously processed data
    if (previousDataRef.current === dataKey || dataProcessedRef.current) {
      setLoading(false)
      if (onLoadingChange) onLoadingChange(false)
      return
    }

    // Update reference with new data
    previousDataRef.current = dataKey
    dataProcessedRef.current = true

    try {
      // Process received data
      let totalTokenValue = 0
      let processedTokens = holdings.map((token: TokenData) => {
        if (!token || !token.tokenInfo) {
          return {
            ...token,
            formattedBalance: 0,
            value: 0,
          }
        }

        const decimals = Number(token.tokenInfo.decimals) || 0
        const formattedBalance = Number(token.balance) / Math.pow(10, decimals)
        const value = token.tokenInfo.price?.rate ? formattedBalance * token.tokenInfo.price.rate : 0

        // Add to totalTokenValue only if value is not suspicious
        if (value < 1000000000) {
          // Under 1 billion USD
          totalTokenValue += value
        }

        return {
          ...token,
          formattedBalance,
          value,
        }
      })

      // Normalize suspicious token values
      processedTokens = processedTokens.map((token) => normalizeTokenValue(token, totalTokenValue)) as {
        formattedBalance: number
        value: number
        tokenInfo: {
          name: string
          symbol: string
          decimals: string
          price?: { rate: number }
          image?: string
          contractAddress?: string
        }
        balance: string
        percentage?: number
      }[]

      // Recalculate totalTokenValue after normalization
      totalTokenValue = processedTokens.reduce((sum, token) => sum + (token.value || 0), 0)

      // Calculate values for statistics
      let incomingValue = 0
      let outgoingValue = 0

      if (transactions && transactions.length) {
        transactions.forEach((tx: TransactionData) => {
          if (tx.to && tx.to.toLowerCase() === address.toLowerCase()) {
            incomingValue += tx.value || 0
          } else if (tx.from && tx.from.toLowerCase() === address.toLowerCase()) {
            outgoingValue += tx.value || 0
          }
        })
      }

      // Check if ETH token already exists to avoid double counting
      const ethToken = processedTokens.find(
        (token) =>
          token.tokenInfo?.symbol?.toLowerCase() === "eth" && !token.tokenInfo?.name?.toLowerCase().includes("defi"),
      )

      // Calculate ETH value
      const ethValue = ethBalance * ethPrice

      // Calculate total portfolio value, avoiding ETH duplication
      const totalPortfolioValue = totalTokenValue + (ethToken ? 0 : ethValue)

      // Add percentages to each token
      const tokensWithPercentages = processedTokens
        .map((token) => ({
          ...token,
          percentage: token.value && totalPortfolioValue > 0 ? (token.value / totalPortfolioValue) * 100 : 0,
        }))
        .sort((a, b) => (b.value || 0) - (a.value || 0))

      // Update statistics
      const updatedStats = {
        totalValue: totalPortfolioValue,
        ethBalance,
        ethPrice,
        tokenCount: processedTokens.length,
        transactionCount: transactions?.length || 0,
        lastActivity: transactions?.length > 0 ? transactions[0].timestamp : null,
        incomingValue,
        outgoingValue,
      }

      setStats(updatedStats)
      setProcessedHoldings(tokensWithPercentages)

      // Update statistics in parent component
      if (onStatsUpdate) {
        onStatsUpdate({
          totalValue: totalPortfolioValue,
          tokenCount: processedTokens.length,
          ethBalance,
        })
      }
    } catch (err) {
      console.error("Error processing data:", err)
    } finally {
      setLoading(false)
      if (onLoadingChange) {
        onLoadingChange(false)
      }
    }
  }, [holdings, transactions, ethBalance, ethPrice, isLoading, address, onLoadingChange, onStatsUpdate, chainId])

  // Calculate asset distribution data
  const assetDistributionData = useMemo(() => {
    if (!stats || stats.totalValue === 0 || processedHoldings.length === 0) {
      return [] as AssetDistributionItem[]
    }

    // Check if ETH already exists in holdings
    const ethTokenExists = processedHoldings.some(
      (token) => token.tokenInfo.symbol.toLowerCase() === "eth" && !token.tokenInfo.name.toLowerCase().includes("defi"),
    )

    // Calculate ETH value
    const ethValue = stats.ethBalance * stats.ethPrice

    // Create an array with all tokens
    const allAssets: AssetDistributionItem[] = []

    // Total value of small tokens (<1%)
    let smallTokensValue = 0
    // Array to track small tokens
    const smallTokens: AssetDistributionItem[] = []

    // Add ETH only if it has value and doesn't already exist in holdings
    if (ethValue > 0 && !ethTokenExists) {
      const ethPercentage = (ethValue / stats.totalValue) * 100
      if (ethPercentage >= 1) {
        allAssets.push({
          name: "ETH",
          symbol: "ETH",
          value: ethValue,
          percentage: ethPercentage,
        })
      } else {
        smallTokensValue += ethValue
        smallTokens.push({
          name: "ETH",
          symbol: "ETH",
          value: ethValue,
          percentage: ethPercentage,
        })
      }
    }

    // Process all tokens
    processedHoldings.forEach((token) => {
      if (token.value && token.value > 0) {
        // Calculate percentage
        const percentage = (token.value / stats.totalValue) * 100

        // Check if token has percentage >= 1%
        if (percentage >= 1) {
          allAssets.push({
            name: token.tokenInfo.name,
            symbol: token.tokenInfo.symbol,
            value: token.value,
            percentage: percentage,
          })
        } else {
          // Add value to small tokens
          smallTokensValue += token.value
          smallTokens.push({
            name: token.tokenInfo.name,
            symbol: token.tokenInfo.symbol,
            value: token.value,
            percentage: percentage,
          })
        }
      }
    })

    // Sort tokens by value (descending)
    allAssets.sort((a, b) => b.value - a.value)

    // Take top 6 assets for individual display
    const topAssets = allAssets.slice(0, 6)

    // Combine remaining significant assets into "Others" category
    const otherSignificantAssets = allAssets.slice(6)
    const otherSignificantValue = otherSignificantAssets.reduce((sum, asset) => sum + asset.value, 0)

    // Total value for "Others" (significant tokens > 6 + small tokens < 1%)
    const otherValue = otherSignificantValue + smallTokensValue

    // Add "Others" category only if there are additional assets
    if (otherValue > 0) {
      const otherPercentage = (otherValue / stats.totalValue) * 100
      topAssets.push({
        name: "Others",
        symbol: "OTHERS",
        value: otherValue,
        percentage: otherPercentage,
        smallTokens: [...otherSignificantAssets, ...smallTokens], // Keep reference to tokens included in "Others"
      })
    }

    return topAssets
  }, [stats, processedHoldings])

  // Calculate transaction activity data
  const transactionActivityData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return []
    }

    // Filter transactions based on time range
    const now = Date.now()
    const msInDay = 24 * 60 * 60 * 1000
    const filteredTransactions = transactions.filter((tx) => {
      if (activeTimeRange === "all") return true
      const txDate = tx.timestamp * 1000
      const daysDiff = (now - txDate) / msInDay

      if (activeTimeRange === "7d") return daysDiff <= 7
      if (activeTimeRange === "30d") return daysDiff <= 30
      if (activeTimeRange === "90d") return daysDiff <= 90
      return true
    })

    // Group transactions by day
    const txByDay = filteredTransactions.reduce((acc: Record<string, number>, tx) => {
      if (!tx || !tx.timestamp) return acc

      const date = new Date(tx.timestamp * 1000).toISOString().split("T")[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    // Convert to array and sort by date
    return Object.entries(txByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [transactions, activeTimeRange])

  // Calculate gas usage data
  const gasUsageData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return []
    }

    // Filter transactions based on time range
    const now = Date.now()
    const msInDay = 24 * 60 * 60 * 1000
    const filteredTransactions = transactions.filter((tx) => {
      if (activeTimeRange === "all") return true
      const txDate = tx.timestamp * 1000
      const daysDiff = (now - txDate) / msInDay

      if (activeTimeRange === "7d") return daysDiff <= 7
      if (activeTimeRange === "30d") return daysDiff <= 30
      if (activeTimeRange === "90d") return daysDiff <= 90
      return true
    })

    // Group transactions by day and calculate gas used
    const gasByDay: Record<string, { date: string; gas: number }> = {}

    filteredTransactions.forEach((tx) => {
      if (!tx.timestamp || !tx.gasUsed || !tx.gasPrice) return

      const date = new Date(tx.timestamp * 1000).toISOString().split("T")[0]
      const gasUsed = (Number(tx.gasUsed) * Number(tx.gasPrice)) / 1e18

      if (!gasByDay[date]) {
        gasByDay[date] = { date, gas: 0 }
      }

      gasByDay[date].gas += gasUsed
    })

    // Convert to array and sort by date
    return Object.values(gasByDay).sort((a, b) => a.date.localeCompare(b.date))
  }, [transactions, activeTimeRange])

  // Generate portfolio value over time data
  const valueOverTimeData = useMemo(() => {
    // Generate deterministic data based on the wallet address and total value
    const dataPoints =
      activeTimeRange === "7d" ? 7 : activeTimeRange === "30d" ? 30 : activeTimeRange === "90d" ? 90 : 180

    const result = []
    const now = new Date()

    // Get list of assets in portfolio
    const assets = [...processedHoldings]

    // Add ETH if it doesn't already exist in holdings
    const ethExists = assets.some(
      (token) =>
        token.tokenInfo.symbol.toLowerCase() === CHAIN_NATIVE_TOKENS[chainId].toLowerCase() &&
        !token.tokenInfo.name.toLowerCase().includes("defi"),
    )

    if (!ethExists) {
      assets.push({
        tokenInfo: {
          name: CHAIN_NATIVE_TOKEN_NAMES[chainId],
          symbol: CHAIN_NATIVE_TOKENS[chainId],
          decimals: "18",
          price: { rate: stats.ethPrice },
        },
        balance: (stats.ethBalance * 1e18).toString(),
        formattedBalance: stats.ethBalance,
        value: stats.ethBalance * stats.ethPrice,
        percentage: ((stats.ethBalance * stats.ethPrice) / stats.totalValue) * 100,
      })
    }

    // Generate historical prices for each day and calculate total value
    for (let i = dataPoints; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      // Calculate portfolio value for this day
      let portfolioValue = 0

      // For each asset, calculate its value on that date
      assets.forEach((asset) => {
        if (!asset.formattedBalance || !asset.tokenInfo.price?.rate) return

        // Simulate historical price for this asset
        // Use a model based on typical asset volatility
        const currentPrice = asset.tokenInfo.price.rate
        const symbol = asset.tokenInfo.symbol.toLowerCase()

        // Volatility differs based on asset type
        let volatility
        if (symbol === "eth")
          volatility = 0.05 // Increased from 0.03 to 0.05
        else if (["usdt", "usdc", "dai", "busd", "tusd"].includes(symbol))
          volatility = 0.003 // Increased from 0.002 to 0.003
        else volatility = 0.08 // Increased from 0.05 to 0.08

        // Generate deterministic historical price based on date and symbol
        // Use a sinusoidal function to simulate market cycles
        const daysPassed = i
        const symbolHash = symbol.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
        const priceFactor =
          1 +
          Math.sin(daysPassed * 0.1 + symbolHash * 0.01) * volatility +
          Math.cos(daysPassed * 0.05 + symbolHash * 0.02) * volatility * 0.5

        // Add a general downward trend as we go back in time
        // This simulates the general growth of the crypto market over time
        const trendFactor = 1 - (daysPassed / dataPoints) * 0.25 // Increased from 0.15 to 0.25

        const historicalPrice = currentPrice * priceFactor * trendFactor

        // Calculate asset value at this historical price
        // Assume balance remained constant (a simplification)
        const assetValue = asset.formattedBalance * historicalPrice

        // Add to total portfolio value
        portfolioValue += assetValue
      })

      // Add date and portfolio value to result
      result.push({
        date: dateStr,
        value: portfolioValue,
      })
    }

    return result
  }, [stats.totalValue, stats.ethBalance, stats.ethPrice, processedHoldings, activeTimeRange, chainId])

  // Clean up on unmount
  useEffect(() => {
    // Clear any existing retry timeout when component unmounts or address changes
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }
    }
  }, [address])

  return {
    loading,
    stats,
    processedHoldings,
    activeTimeRange,
    setActiveTimeRange,
    showAllTokens,
    setShowAllTokens,
    assetDistributionData,
    transactionActivityData,
    gasUsageData,
    valueOverTimeData,
  }
}
