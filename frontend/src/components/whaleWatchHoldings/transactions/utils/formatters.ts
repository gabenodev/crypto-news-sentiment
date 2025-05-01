import type { TransactionData } from "../types"
import { getNativeTokenSymbol } from "./constants"

// Format timestamp to readable date
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Format address for display
export const formatAddress = (addr: string, isCurrentWallet: boolean): string => {
  if (isCurrentWallet) {
    return "This Wallet"
  }
  return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
}

// Format native token value with appropriate decimals
export const formatNativeTokenValue = (value: number, chainId = 1): string => {
  try {
    const tokenSymbol = getNativeTokenSymbol(chainId)

    if (value === 0) return `0 ${tokenSymbol}`

    // Format with 6 decimal places for small values, fewer for larger values
    const formattedValue = value.toLocaleString("en-US", {
      maximumFractionDigits: value < 0.01 ? 6 : value < 1 ? 4 : 2,
    })

    return `${formattedValue} ${tokenSymbol}`
  } catch (error) {
    console.error(`Error formatting token value:`, error)
    return `${value} ${getNativeTokenSymbol(chainId)}`
  }
}

// Get transaction direction relative to the wallet address
export const getTransactionDirection = (tx: TransactionData, address: string): "incoming" | "outgoing" => {
  if (tx.to && tx.to.toLowerCase() === address.toLowerCase()) {
    return "incoming"
  }
  return "outgoing"
}
