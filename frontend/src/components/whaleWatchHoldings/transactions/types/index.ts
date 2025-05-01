export interface TransactionData {
  timestamp: number;
  transactionHash: string;
  value: number;
  from: string;
  to: string;
  isError?: string;
  gasUsed?: string;
  gasPrice?: string;
  tokenSymbol?: string;
  tokenName?: string;
  tokenDecimal?: string;
}

export interface WalletTransactionHistoryProps {
  address: string;
  onLoadingChange?: (loading: boolean) => void;
  transactions?: TransactionData[];
  isLoading?: boolean;
  error?: string | null;
  loadingStatus?: string;
  refreshData?: () => void;
  chainId?: number;
}

export type TransactionFilter = "all" | "incoming" | "outgoing";

export interface FilterBarProps {
  filter: TransactionFilter;
  setFilter: (filter: TransactionFilter) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  paginate: (pageNumber: number) => void;
}

export interface TransactionTableProps {
  transactions: TransactionData[];
  address: string;
  chainId: number;
  getExplorerUrl: (txHash: string, chainId?: number) => string;
  formatDate: (timestamp: number) => string;
  formatAddress: (addr: string, isCurrentWallet: boolean) => string;
  formatNativeTokenValue: (value: number, chainId?: number) => string;
  getTransactionDirection: (
    tx: TransactionData,
    address: string
  ) => "incoming" | "outgoing";
}

export interface EmptyStateProps {
  message: string;
  description?: string;
}

export interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export interface UseTransactionsReturn {
  processedTransactions: TransactionData[];
  filteredTransactions: TransactionData[];
  currentPageTransactions: TransactionData[];
  currentPage: number;
  totalPages: number;
  filter: "all" | "incoming" | "outgoing";
  searchTerm: string;
  setFilter: (filter: "all" | "incoming" | "outgoing") => void;
  setSearchTerm: (term: string) => void;
  paginate: (pageNumber: number) => void;
}
