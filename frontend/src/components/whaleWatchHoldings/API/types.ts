// Types for Ethereum wallet data

// TokenInfo interface
export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: string;
  price?: {
    rate: number;
  };
  image?: string;
  contractAddress?: string;
}

// Transaction data interface
export interface TransactionData {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  confirmations: string;
  methodId: string;
  functionName: string;
}

// Processed transaction interface
export interface ProcessedTransaction {
  timestamp: number;
  transactionHash: string;
  value: number;
  from: string;
  to: string;
  isError: string;
  gasUsed: string;
  gasPrice: string;
  chainId: number;
}

// Token balance cache entry
export interface TokenPriceCacheEntry {
  price: number | null;
  timestamp: number;
}

// API response cache entry
export interface ApiResponseCacheEntry {
  data: any;
  timestamp: number;
}
