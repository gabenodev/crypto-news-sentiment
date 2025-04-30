// Types for the wallet dashboard components
import type { ReactNode } from "react";

// Tab types
export type TabType = "overview" | "holdings" | "transactions";

// Chain data type
export interface ChainData {
  id: number;
  name: string;
  icon: string;
  color: string;
}

// Wallet info type
export interface WalletInfo {
  name: string;
  description: string;
}

// Wallet stats type
export interface WalletStats {
  totalValue: number;
  tokenCount: number;
  ethBalance: number;
}

// Common props shared across components
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

// Props for the ChainSelector component
export interface ChainSelectorProps extends BaseComponentProps {
  selectedChain: number;
  availableChains: ChainData[];
  onChainChange: (chainId: number) => void;
}

// Props for the WalletHeader component
export interface WalletHeaderProps extends BaseComponentProps {
  address: string;
  walletInfo: WalletInfo | null;
}

// Props for the PortfolioSummary component
export interface PortfolioSummaryProps extends BaseComponentProps {
  walletStats: WalletStats;
  selectedChain: number;
  nativeToken: string;
}

// Props for the AddressCard component
export interface AddressCardProps extends BaseComponentProps {
  address: string;
  selectedChain: number;
  getExplorerUrl: (address: string) => string;
}

// Props for the NavigationTabs component
export interface NavigationTabsProps extends BaseComponentProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

// Props for the RecentWallets component
export interface RecentWalletsProps extends BaseComponentProps {
  recentWallets: string[];
  currentAddress: string;
  truncateAddress: (address: string) => string;
}

// Props for the main dashboard content
export interface DashboardContentProps {
  activeTab: TabType;
  address: string;
  holdings: any[];
  transactions: any[];
  ethBalance: number;
  ethPrice: number;
  isLoading: boolean;
  error: string | null;
  loadingStatus: string;
  refreshData: () => void;
  selectedChain: number;
  handleLoadingChange: (loading: boolean) => void;
  handleStatsUpdate: (stats: any) => void;
}
