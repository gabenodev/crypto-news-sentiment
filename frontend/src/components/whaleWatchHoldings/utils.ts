// Utility functions for the wallet dashboard
import { CHAIN_NATIVE_TOKENS } from "../../utils/API/etherScanAPI";

/**
 * Calculate the total value of a wallet's holdings
 */
export const calculateTotalValue = (
  holdings: any[],
  ethBalance: number,
  ethPrice: number,
  selectedChain: number
): number => {
  let total = 0;

  // Check if native token exists in holdings to avoid duplication
  const nativeTokenExists = holdings.some(
    (token) =>
      token.tokenInfo &&
      token.tokenInfo.symbol &&
      token.tokenInfo.symbol.toLowerCase() ===
        CHAIN_NATIVE_TOKENS[selectedChain].toLowerCase() &&
      token.tokenInfo.name &&
      !token.tokenInfo.name.toLowerCase().includes("defi")
  );

  // Add native token value only if it doesn't exist in holdings
  if (!nativeTokenExists) {
    total += ethBalance * ethPrice;
  }

  // Add token values
  for (const token of holdings) {
    if (token && token.tokenInfo && token.tokenInfo.price?.rate) {
      const decimals = Number(token.tokenInfo.decimals || 0);
      const tokenBalance = Number(token.balance || 0) / Math.pow(10, decimals);
      total += tokenBalance * token.tokenInfo.price.rate;
    }
  }

  return total;
};

/**
 * Truncate an address for display
 */
export const truncateAddress = (addr: string): string => {
  if (!addr) return "";
  return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
};

/**
 * Get explorer URL based on selected chain
 */
export const getExplorerUrl = (
  address: string,
  selectedChain: number
): string => {
  return selectedChain === 56
    ? `https://bscscan.com/address/${address}`
    : `https://etherscan.io/address/${address}`;
};
