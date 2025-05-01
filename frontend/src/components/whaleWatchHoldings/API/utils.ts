// Utility functions for Ethereum wallet data
import type { TokenPriceCacheEntry, ApiResponseCacheEntry } from "./types";
import {
  getMockResponseForUrl,
  getFallbackTokens,
  addFallbackTokens,
} from "./mockData";
import { POPULAR_TOKEN_IMAGES, POPULAR_TOKEN_IMAGES_BSC } from "./constants";

// Cache for token prices to reduce API requests
export const tokenPriceCache: Record<string, TokenPriceCacheEntry> = {};

// Cache for API responses to prevent duplicate requests
export const apiResponseCache: Record<string, ApiResponseCacheEntry> = {};

// Function to check if an address is valid
export const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Function to get cryptocurrency prices from the backend API
export const fetchCryptoPrices = async (): Promise<Record<string, number>> => {
  try {
    // Check if we have prices in cache and if they haven't expired (5 minutes)
    const cacheKey = "all_crypto_prices";
    const cacheEntry = tokenPriceCache[cacheKey];
    if (cacheEntry && Date.now() - cacheEntry.timestamp < 5 * 60 * 1000) {
      return cacheEntry.price as unknown as Record<string, number>;
    }

    // Make the request to the backend API
    const response = await fetch(
      "https://sentimentxv2-project.vercel.app/api/all-cryptos"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Build an object with symbols and prices
    const prices: Record<string, number> = {};
    data.forEach((coin: any) => {
      if (coin.symbol && coin.current_price) {
        prices[coin.symbol.toLowerCase()] = coin.current_price;
      }
    });

    // Save to cache
    tokenPriceCache[cacheKey] = {
      price: prices as any,
      timestamp: Date.now(),
    };

    return prices;
  } catch (error) {
    console.error("Error getting cryptocurrency prices:", error);
    return {};
  }
};

// Function to get a token's icon - simplified to use only placeholders
export const getTokenImage = (
  contractAddress: string,
  symbol: string,
  chainId = 1
): string => {
  // Check if we have the predefined icon for this chain
  const predefinedImages =
    chainId === 56 ? POPULAR_TOKEN_IMAGES_BSC : POPULAR_TOKEN_IMAGES;
  const predefinedImage = predefinedImages[contractAddress.toLowerCase()];
  if (predefinedImage) {
    return predefinedImage;
  }

  // Return a placeholder instead of making API calls
  return `/placeholder.svg?height=32&width=32&query=${symbol}`;
};

// Function to determine if a token is abnormal based on certain criteria
export const isAbnormalToken = (token: any): boolean => {
  // Check if the token has a suspicious value
  if (token.tokenInfo && token.tokenInfo.decimals && token.balance) {
    const decimals = Number(token.tokenInfo.decimals);
    const formattedBalance = Number(token.balance) / Math.pow(10, decimals);

    // If the formatted balance is over 1 million and not a known stablecoin
    if (formattedBalance > 1000000) {
      const symbol = token.tokenInfo.symbol.toLowerCase();
      // Allow known stablecoins to have large values (USDT, USDC, DAI, etc.)
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
          "cum",
          "elon",
        ];

        if (suspiciousWords.some((word) => name.includes(word))) {
          console.log(
            `🚨 Detected suspicious token: ${token.tokenInfo.name} with large balance: ${formattedBalance}`
          );
          return true;
        }

        // Check if balance is extremely large (over 100 million)
        if (formattedBalance > 100000000) {
          console.log(
            `🚨 Detected token with extremely large balance: ${token.tokenInfo.name}, ${formattedBalance}`
          );
          return true;
        }
      }
    }
  }

  return false;
};

// Helper function to cache API responses with retry mechanism
export const cachedApiCall = async (
  url: string,
  cacheTime = 60000,
  retries = 2,
  delay = 2000
): Promise<any> => {
  // Check if we have a cached response
  const cacheEntry = apiResponseCache[url];
  if (cacheEntry && Date.now() - cacheEntry.timestamp < cacheTime) {
    console.log("🔄 Using cached response for:", url.substring(0, 50) + "...");
    return cacheEntry.data;
  }

  try {
    console.log("🌐 Calling API:", url.substring(0, 50) + "...");

    // Add a random delay to avoid rate limiting
    const randomDelay = Math.floor(Math.random() * 500);
    await new Promise((resolve) => setTimeout(resolve, randomDelay));

    // Make the API call
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(
      "📥 API Response:",
      JSON.stringify(data).substring(0, 200) + "..."
    );

    // Detect API key errors and return mock data
    if (
      data.status === "0" &&
      data.message === "NOTOK" &&
      data.result &&
      (data.result.includes("Invalid API Key") ||
        data.result.includes("Too many invalid api key") ||
        data.result.includes("Max rate limit reached"))
    ) {
      console.log(
        "🚫 API rate limit or invalid key detected, returning mock data immediately"
      );
      return getMockResponseForUrl(url);
    }

    // Cache the response
    apiResponseCache[url] = {
      data,
      timestamp: Date.now(),
    };

    return data;
  } catch (error) {
    console.error(`❌ Error fetching from ${url}:`, error);

    // If we've exhausted retries, return a mock response
    if (retries <= 0) {
      console.log("🔄 All retries exhausted, returning mock data");
      return getMockResponseForUrl(url);
    }

    // Otherwise retry with exponential backoff
    if (retries > 0) {
      console.warn(
        `🔄 API call failed, retrying in ${delay / 1000} seconds...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return cachedApiCall(url, cacheTime, retries - 1, delay * 2);
    }

    throw error;
  }
};

// Re-export these functions from mockData
export { getFallbackTokens, addFallbackTokens };
