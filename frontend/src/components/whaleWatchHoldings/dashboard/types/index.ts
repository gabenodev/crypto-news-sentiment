import type React from "react"
// Tab type for wallet dashboard
export type TabType = "overview" | "holdings" | "transactions"

// Wallet stats type
export interface WalletStats {
  totalValue: number
  tokenCount: number
  ethBalance: number
}

// Props for sidebar component
export interface SidebarProps {
  address: string
  walletInfo: { name: string; description: string } | null
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  walletStats: WalletStats
  recentWallets: string[]
  selectedChain: number
  setSelectedChain: (chainId: number) => void
  dropdownOpen: boolean
  setDropdownOpen: (open: boolean) => void
  dropdownRef: React.RefObject<HTMLDivElement>
  copySuccess: boolean
  setCopySuccess: (success: boolean) => void
}

// Props for chain selector component
export interface ChainSelectorProps {
  selectedChain: number
  setSelectedChain: (chainId: number) => void
  dropdownOpen: boolean
  setDropdownOpen: (open: boolean) => void
  dropdownRef: React.RefObject<HTMLDivElement>
}

// Props for portfolio summary component
export interface PortfolioSummaryProps {
  walletStats: WalletStats
  selectedChain: number
}

// Props for address card component
export interface AddressCardProps {
  address: string
  copySuccess: boolean
  setCopySuccess: (success: boolean) => void
  selectedChain: number
}

// Props for main content component
export interface MainContentProps {
  activeTab: TabType
  address: string
  onLoadingChange: (loading: boolean) => void
  onStatsUpdate: (stats: any) => void
  holdings: any[]
  transactions: any[]
  ethBalance: number
  ethPrice: number
  isLoading: boolean
  error: string | null
  loadingStatus: string
  refreshData: () => void
  chainId: number
}

// Props for dashboard header component
export interface DashboardHeaderProps {
  address: string
  error: string | null
  refreshData: () => void
}

// Props for invalid address error component
export interface InvalidAddressErrorProps {
  address: string
}
