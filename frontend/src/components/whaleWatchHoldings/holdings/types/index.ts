// Interface for token data
export interface TokenData {
  tokenInfo: {
    name: string;
    symbol: string;
    decimals: string;
    price?: {
      rate: number;
    };
    image?: string;
  };
  balance: string;
  formattedBalance?: number;
  value?: number;
  percentage?: number;
}

// Props for the WalletHoldings component
export interface WalletHoldingsProps {
  address?: string;
  onLoadingChange?: (loading: boolean) => void;
  onStatsUpdate?: (stats: any) => void;
  holdings?: TokenData[];
  ethBalance?: number;
  ethPrice?: number;
  isLoading?: boolean;
  error?: string | null;
  loadingStatus?: string;
  refreshData?: () => void;
  chainId?: number;
}

// Props for the CustomTooltip component
export interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}
