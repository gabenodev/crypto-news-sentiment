import type React from "react"
export interface CoinData {
  id: string
  name: string
  symbol: string
  image: string
  priceChange: number
  marketCap: number
  volume: number
  rank: number
}

export interface MarketDominanceData {
  btc: number
  eth: number
  usdt: number
  others: number
}

export interface SeasonStatus {
  title: string
  description: string
  color: string
  icon: React.ReactNode
  bgColor: string
  additionalText?: string
}

// New types for modularization
export interface FilteredAndSortedCoinsProps {
  outperformingCoins: CoinData[]
  searchTerm: string
  sortConfig: {
    key: "priceChange" | "marketCap" | "name" | "rank"
    direction: "asc" | "desc"
  }
}

export interface SortConfigType {
  key: "priceChange" | "marketCap" | "name" | "rank"
  direction: "asc" | "desc"
}

export interface StatusCardProps {
  seasonStatus: SeasonStatus
  enhancedIndex: number
  showEnhancedInfo: boolean
  setShowEnhancedInfo: (show: boolean) => void
}

export interface MetricsCardsProps {
  outperformingCount: number
  totalAltcoins: number
  percentage: number
  enhancedStatus: SeasonStatus
  enhancedIndex: number
  bitcoinData: any
}

export interface CoinListProps {
  filteredAndSortedCoins: CoinData[]
  selectedCoin: CoinData | null
  setSelectedCoin: (coin: CoinData) => void
  handleSort: (key: "priceChange" | "marketCap" | "name" | "rank") => void
  sortConfig: SortConfigType
  formatMarketCap: (marketCap: number) => string
}

export interface SearchFilterProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  isFilterOpen: boolean
  setIsFilterOpen: (isOpen: boolean) => void
}

export interface LoadingStateProps {
  message?: string
}
