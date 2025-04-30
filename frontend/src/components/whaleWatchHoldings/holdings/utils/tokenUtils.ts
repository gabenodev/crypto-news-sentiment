import type { TokenData } from "../types";

// Normalize token value to handle suspicious tokens
export const normalizeTokenValue = (
  token: TokenData,
  totalPortfolioValue: number
): TokenData => {
  if (!token || !token.tokenInfo)
    return { ...token, formattedBalance: 0, value: 0 };

  // Make sure formattedBalance is always defined
  const formattedBalance = token.formattedBalance || 0;

  // Check if the token has a suspicious value
  if (token.value && token.value > 1000000000) {
    // Over 1 billion USD
    const symbol = token.tokenInfo.symbol.toLowerCase();
    // Allow known stablecoins to have large values
    const isStablecoin = ["usdt", "usdc", "dai", "busd", "tusd"].includes(
      symbol
    );

    if (!isStablecoin) {
      // Check if token name contains suspicious words
      const name = token.tokenInfo.name.toLowerCase();
      const suspiciousWords = [
        "vitalik",
        "buterin",
        "musk",
        "elon",
        "raccoon",
        "pet",
        "inu",
        "shib",
        "doge",
        "moon",
        "safe",
      ];

      if (
        suspiciousWords.some((word) => name.includes(word)) ||
        token.value > totalPortfolioValue * 0.9
      ) {
        console.log(
          `🚨 Correcting suspicious token value: ${token.tokenInfo.name} from ${token.value} to 0`
        );
        // Reset value and percentage for suspicious tokens
        return {
          ...token,
          formattedBalance,
          value: 0,
          percentage: 0,
        };
      }
    }
  }

  return {
    ...token,
    formattedBalance,
  };
};

// Process token data
export const processTokenData = (
  holdings: TokenData[],
  ethBalance: number,
  ethPrice: number
): { processedTokens: TokenData[]; totalValue: number } => {
  let totalTokenValue = 0;
  let processedTokens = holdings.map((token: TokenData) => {
    if (!token || !token.tokenInfo) {
      return {
        ...token,
        formattedBalance: 0,
        value: 0,
      };
    }

    const decimals = Number(token.tokenInfo.decimals) || 0;
    const formattedBalance = Number(token.balance) / Math.pow(10, decimals);
    const value = token.tokenInfo.price?.rate
      ? formattedBalance * token.tokenInfo.price.rate
      : 0;

    // Add to totalTokenValue only if value is not suspicious
    if (value < 1000000000) {
      // Less than 1 billion USD
      totalTokenValue += value;
    }

    return {
      ...token,
      formattedBalance,
      value,
    };
  });

  // Normalize suspicious token values
  processedTokens = processedTokens.map((token) => {
    const normalizedToken = normalizeTokenValue(token, totalTokenValue);
    // Ensure formattedBalance and value are always numbers
    return {
      ...normalizedToken,
      formattedBalance: normalizedToken.formattedBalance || 0,
      value: normalizedToken.value || 0,
    };
  });

  // Recalculate totalTokenValue after normalization
  totalTokenValue = processedTokens.reduce(
    (sum, token) => sum + (token.value || 0),
    0
  );

  return { processedTokens, totalValue: totalTokenValue };
};

// Calculate percentages and sort tokens
export const calculatePercentagesAndSort = (
  tokens: TokenData[],
  totalValue: number
): TokenData[] => {
  return tokens
    .map((token) => ({
      ...token,
      percentage:
        token.value && totalValue > 0 ? (token.value / totalValue) * 100 : 0,
    }))
    .sort((a, b) => (b.value || 0) - (a.value || 0));
};
