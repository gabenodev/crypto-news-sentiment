// Interface for token data
export interface TokenData {
  tokenInfo: {
    name: string
    symbol: string
    decimals: string
    price?: {
      rate: number
    }
    image?: string
    contractAddress?: string
  }
  balance: string
  formattedBalance?: number
  value?: number
  percentage?: number
}

// Interface for transaction data
export interface TransactionData {
  timestamp: number
  transactionHash: string
  value: number
  from: string
  to: string
  isError?: string
  gasUsed?: string
  gasPrice?: string
}

// Interface for overview statistics
export interface OverviewStats {
  totalValue: number
  ethBalance: number
  ethPrice: number
  tokenCount: number
  transactionCount: number
  lastActivity: number | null
  incomingValue: number
  outgoingValue: number
}

// Interface for asset distribution item
export interface AssetDistributionItem {
  name: string
  symbol: string
  value: number
  percentage: number
  smallTokens?: Array<{
    name: string
    symbol: string
    value: number
    percentage: number
  }>
}

// Props for the WalletOverview component
export interface WalletOverviewProps {
  address: string
  onLoadingChange?: (loading: boolean) => void
  onStatsUpdate?: (stats: any) => void
  holdings?: TokenData[]
  transactions?: TransactionData[]
  ethBalance?: number
  ethPrice?: number
  isLoading?: boolean
  error?: string | null
  loadingStatus?: string
  refreshData?: () => void
  chainId?: number
}

// Props for custom tooltip components
export interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
}
