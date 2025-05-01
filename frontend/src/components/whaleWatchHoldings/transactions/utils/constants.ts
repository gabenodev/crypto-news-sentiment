import { CHAIN_NATIVE_TOKENS } from "../../../../utils/API/etherScanAPI"

// Number of transactions to display per page
export const TRANSACTIONS_PER_PAGE = 10

// Explorer URLs by chain ID
export const EXPLORER_URLS: Record<number, string> = {
  1: "https://etherscan.io/tx/",
  56: "https://bscscan.com/tx/",
  137: "https://polygonscan.com/tx/",
  42161: "https://arbiscan.io/tx/",
  10: "https://optimistic.etherscan.io/tx/",
  43114: "https://snowtrace.io/tx/",
  250: "https://ftmscan.com/tx/",
  // Add more chains as needed
}

// Get the explorer URL for a transaction hash based on chain ID
export const getExplorerUrl = (txHash: string, chainId = 1): string => {
  const baseUrl = EXPLORER_URLS[chainId] || EXPLORER_URLS[1] // Default to Ethereum if chain not found
  return `${baseUrl}${txHash}`
}

// Get the native token symbol for a chain
export const getNativeTokenSymbol = (chainId = 1): string => {
  return CHAIN_NATIVE_TOKENS[chainId] || "ETH" // Default to ETH if chain not found
}
