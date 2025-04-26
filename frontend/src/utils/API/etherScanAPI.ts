// Improved API functions for Ethereum wallet data

// Etherscan API Key
const ETHERSCAN_API_KEY = "RP1AAGBP2YNUWFTAFP6KWT7GRRKC5BG5MM";

// Interfaces for data types
interface TokenBalance {
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  balance: string;
}

interface TokenTransaction {
  contractAddress: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  value: string;
}

// TokenInfo interface
interface TokenInfo {
  name: string;
  symbol: string;
  decimals: string;
  price?: {
    rate: number;
  };
  image?: string;
  contractAddress?: string;
}

interface ProcessedToken {
  tokenInfo: TokenInfo;
  balance: string;
}

interface TransactionData {
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

// Cache for token prices to reduce API requests
const tokenPriceCache: Record<
  string,
  { price: number | null; timestamp: number }
> = {};

// Cache for API responses to prevent duplicate requests
const apiResponseCache: Record<string, { data: any; timestamp: number }> = {};

// Function to check if an address is valid
export const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Predefined prices for popular tokens to avoid too many API requests
const POPULAR_TOKEN_PRICES: Record<string, number> = {
  // Popular tokens with their approximate prices
  "0xdac17f958d2ee523a2206206994597c13d831ec7": 1, // USDT
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": 1, // USDC
  "0x6b175474e89094c44da98b954eedeac495271d0f": 1, // DAI
  "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": 60000, // WBTC
  "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0": 0.7, // MATIC
  "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984": 8, // UNI
  "0x514910771af9ca656af840dff83e8264ecf986ca": 15, // LINK
  "0x0d8775f648430679a709e98d2b0cb6250d2887ef": 0.3, // BAT
  "0x0f5d2fb29fb7d3cfee444a200298f468908cc942": 0.5, // MANA
  "0xc944e90c64b2c07662a292be6244bdf05cda44a7": 0.4, // GRT
  "0x4fabb145d64652a948d72533023f6e7a623c7c53": 1, // BUSD
  "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce": 0.000008, // SHIB
  "0x1a4b46696b2bb4794eb3d4c26f1c55f9170fa4c5": 0.2, // BIT
  "0x0000000000085d4780b73119b644ae5ecd22b376": 1, // TUSD
  "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e": 7000, // YFI
  "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f": 1.5, // SNX
  "0xd533a949740bb3306d119cc777fa900ba034cd52": 0.5, // CRV
  "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2": 1000, // MKR
  "0xba100000625a3754423978a60c9317c58a424e3d": 5, // BAL
  "0xc00e94cb662c3520282e6f5717214004a7f26888": 50, // COMP
};

// Predefined icons for popular tokens
const POPULAR_TOKEN_IMAGES: Record<string, string> = {
  "0xdac17f958d2ee523a2206206994597c13d831ec7":
    "https://assets.coingecko.com/coins/images/325/thumb/Tether.png", // USDT
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48":
    "https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png", // USDC
  "0x6b175474e89094c44da98b954eedeac495271d0f":
    "https://assets.coingecko.com/coins/images/9956/thumb/4943.png", // DAI
  "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599":
    "https://assets.coingecko.com/coins/images/7598/thumb/wrapped_bitcoin_wbtc.png", // WBTC
  "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0":
    "https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png", // MATIC
  "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984":
    "https://assets.coingecko.com/coins/images/12504/thumb/uniswap-uni.png", // UNI
  "0x514910771af9ca656af840dff83e8264ecf986ca":
    "https://assets.coingecko.com/coins/images/877/thumb/chainlink-new-logo.png", // LINK
  "0x0d8775f648430679a709e98d2b0cb6250d2887ef":
    "https://assets.coingecko.com/coins/images/677/thumb/basic-attention-token.png", // BAT
  "0x0f5d2fb29fb7d3cfee444a200298f468908cc942":
    "https://assets.coingecko.com/coins/images/878/thumb/decentraland-mana.png", // MANA
  "0xc944e90c64b2c07662a292be6244bdf05cda44a7":
    "https://assets.coingecko.com/coins/images/13397/thumb/Graph_Token.png", // GRT
  "0x4fabb145d64652a948d72533023f6e7a623c7c53":
    "https://assets.coingecko.com/coins/images/9576/thumb/BUSD.png", // BUSD
  "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce":
    "https://assets.coingecko.com/coins/images/11939/thumb/shiba.png", // SHIB
  "0x0000000000085d4780b73119b644ae5ecd22b376":
    "https://assets.coingecko.com/coins/images/9129/thumb/trueusd.jpg", // TUSD
  "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e":
    "https://assets.coingecko.com/coins/images/11849/thumb/yfi-192x192.png", // YFI
  "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f":
    "https://assets.coingecko.com/coins/images/3406/thumb/SNX.png", // SNX
  "0xd533a949740bb3306d119cc777fa900ba034cd52":
    "https://assets.coingecko.com/coins/images/12124/thumb/Curve.png", // CRV
  "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2":
    "https://assets.coingecko.com/coins/images/1364/thumb/Mark_Maker.png", // MKR
  "0xba100000625a3754423978a60c9317c58a424e3d":
    "https://assets.coingecko.com/coins/images/11683/thumb/Balancer.png", // BAL
  "0xc00e94cb662c3520282e6f5717214004a7f26888":
    "https://assets.coingecko.com/coins/images/10775/thumb/COMP.png", // COMP
};

// Function to get cryptocurrency prices from the backend API
const fetchCryptoPrices = async (): Promise<Record<string, number>> => {
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
const getTokenImage = (contractAddress: string, symbol: string): string => {
  // Check if we have the predefined icon
  const predefinedImage = POPULAR_TOKEN_IMAGES[contractAddress.toLowerCase()];
  if (predefinedImage) {
    return predefinedImage;
  }

  // Return a placeholder instead of making API calls
  return `/placeholder.svg?height=32&width=32&query=${symbol}`;
};

// Function to get a token's price
const getTokenPrice = async (
  contractAddress: string,
  symbol: string
): Promise<number | null> => {
  // Check if we have the price in cache and if it hasn't expired (5 minutes)
  const cacheKey = contractAddress.toLowerCase();
  const cacheEntry = tokenPriceCache[cacheKey];
  if (cacheEntry && Date.now() - cacheEntry.timestamp < 5 * 60 * 1000) {
    return cacheEntry.price;
  }

  // Check if we have the predefined price
  const predefinedPrice = POPULAR_TOKEN_PRICES[cacheKey];
  if (predefinedPrice) {
    // Save to cache
    tokenPriceCache[cacheKey] = {
      price: predefinedPrice,
      timestamp: Date.now(),
    };
    return predefinedPrice;
  }

  try {
    // Get prices from the backend API
    const prices = await fetchCryptoPrices();
    const symbolLower = symbol.toLowerCase();

    if (prices[symbolLower]) {
      // Save to cache
      tokenPriceCache[cacheKey] = {
        price: prices[symbolLower],
        timestamp: Date.now(),
      };
      return prices[symbolLower];
    }

    // If we don't find the price in the backend API, try with CoinGecko
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${contractAddress}&vs_currencies=usd`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const price = data[cacheKey]?.usd || null;

    // Save to cache
    if (price !== null) {
      tokenPriceCache[cacheKey] = {
        price,
        timestamp: Date.now(),
      };
    }

    return price;
  } catch (error) {
    console.error("Error getting token price:", error);
    return null;
  }
};

// Function to get ETH price
const getEthPrice = async (): Promise<number | null> => {
  // Check if we have the price in cache and if it hasn't expired (5 minutes)
  const cacheEntry = tokenPriceCache["ethereum"];
  if (cacheEntry && Date.now() - cacheEntry.timestamp < 5 * 60 * 1000) {
    return cacheEntry.price;
  }

  try {
    // Try to get the price from the backend API
    const prices = await fetchCryptoPrices();

    if (prices["eth"]) {
      // Save to cache
      tokenPriceCache["ethereum"] = {
        price: prices["eth"],
        timestamp: Date.now(),
      };
      return prices["eth"];
    }

    // If we don't find the price in the backend API, try with CoinGecko
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const price = data.ethereum?.usd || null;

    // Save to cache
    if (price !== null) {
      tokenPriceCache["ethereum"] = {
        price,
        timestamp: Date.now(),
      };
    }

    return price;
  } catch (error) {
    console.error("Error getting ETH price:", error);
    // Return an approximate price for ETH in case of error
    return 3500;
  }
};

// Helper function to cache API responses
const cachedApiCall = async (url: string, cacheTime = 60000): Promise<any> => {
  // Check if we have a cached response
  const cacheEntry = apiResponseCache[url];
  if (cacheEntry && Date.now() - cacheEntry.timestamp < cacheTime) {
    return cacheEntry.data;
  }

  try {
    // Make the API call
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Cache the response
    apiResponseCache[url] = {
      data,
      timestamp: Date.now(),
    };

    return data;
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    throw error;
  }
};

// Function to fetch ETH balance
export const fetchEthBalance = async (address: string) => {
  try {
    const url = `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`;

    // Use cached API call with 30 second cache time
    const data = await cachedApiCall(url, 30000);

    if (data.status !== "1") {
      throw new Error(data.message || "Error fetching ETH balance");
    }

    return data;
  } catch (error) {
    console.error("Error fetching ETH balance:", error);
    throw error;
  }
};

// Function to fetch transaction history
export const fetchTransactionHistory = async (address: string) => {
  try {
    const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=100&sort=desc&apikey=${ETHERSCAN_API_KEY}`;

    // Use cached API call with 30 second cache time
    const data = await cachedApiCall(url, 30000);

    if (data.status !== "1") {
      throw new Error(data.message || "Error fetching transaction history");
    }

    // Process the transactions to match our expected format
    return data.result.map((tx: TransactionData) => ({
      timestamp: Number.parseInt(tx.timeStamp),
      transactionHash: tx.hash,
      value: Number.parseFloat(tx.value) / 1e18, // Convert wei to ETH
      from: tx.from,
      to: tx.to,
      isError: tx.isError,
      gasUsed: tx.gasUsed,
      gasPrice: tx.gasPrice,
    }));
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    return [];
  }
};

// Function to get token holdings
export const fetchTokenBalances = async (address: string) => {
  try {
    // Check if the address is valid
    if (!isValidEthereumAddress(address)) {
      throw new Error("Invalid Ethereum address");
    }

    // Get ETH balance
    const ethBalanceUrl = `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`;
    const ethBalanceData = await cachedApiCall(ethBalanceUrl, 30000);

    // Get ETH price - using a more accurate price now
    const ethPrice = (await getEthPrice()) || 3500; // Fallback to 3500 if API fails

    // Add ETH as the first token with correct balance and value
    const tokens: any[] = [];

    if (ethBalanceData.status === "1" && Number(ethBalanceData.result) > 0) {
      const ethBalanceInEth = Number(ethBalanceData.result) / 1e18; // Convert wei to ETH
      console.log("ETH Balance in ETH:", ethBalanceInEth);
      console.log("ETH Price:", ethPrice);

      tokens.push({
        tokenInfo: {
          name: "Ethereum",
          symbol: "ETH",
          decimals: "18",
          price: { rate: ethPrice },
          image:
            "https://assets.coingecko.com/coins/images/279/thumb/ethereum.png",
          contractAddress: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Standard placeholder for ETH
        },
        balance: ethBalanceData.result,
      });
    }

    // Use the tokentx endpoint to get transactions with ERC-20 tokens
    const tokenTxUrl = `https://api.etherscan.io/api?module=account&action=tokentx&address=${address}&page=1&offset=100&sort=desc&apikey=${ETHERSCAN_API_KEY}`;
    const data = await cachedApiCall(tokenTxUrl, 30000);

    if (data.status !== "1") {
      // If we can't get token transactions but have ETH, return just ETH
      if (tokens.length > 0) {
        return tokens;
      }
      throw new Error(
        data.message || data.result || "Error getting transactions"
      );
    }

    // Process tokens
    const processedTokens = new Map<string, boolean>(); // To avoid duplicates

    // Process transactions to extract unique tokens
    // Limit to the first 30 tokens to avoid too many API requests
    const uniqueTokens = new Map<string, any>();
    for (const tx of data.result) {
      const tokenAddress = tx.contractAddress.toLowerCase();

      // If we've already processed this token, skip
      if (uniqueTokens.has(tokenAddress)) continue;

      uniqueTokens.set(tokenAddress, {
        contractAddress: tokenAddress,
        tokenName: tx.tokenName,
        tokenSymbol: tx.tokenSymbol,
        tokenDecimal: tx.tokenDecimal,
      });

      // Limit to 30 tokens to avoid too many API requests
      if (uniqueTokens.size >= 30) break;
    }

    // Process each unique token
    // Convert Map to Array to avoid iteration error
    const uniqueTokensArray = Array.from(uniqueTokens.entries());

    for (let i = 0; i < uniqueTokensArray.length; i++) {
      const [tokenAddress, tokenData] = uniqueTokensArray[i];

      // Get balance for this specific token
      const tokenBalanceUrl = `https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${tokenAddress}&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`;
      const tokenBalanceData = await cachedApiCall(tokenBalanceUrl, 30000);

      // If balance is 0, skip
      if (
        tokenBalanceData.status !== "1" ||
        Number(tokenBalanceData.result) === 0
      )
        continue;

      // Get token price only, use placeholder for image
      const price = await getTokenPrice(tokenAddress, tokenData.tokenSymbol);
      const imageUrl = getTokenImage(tokenAddress, tokenData.tokenSymbol);

      tokens.push({
        tokenInfo: {
          name: tokenData.tokenName,
          symbol: tokenData.tokenSymbol,
          decimals: tokenData.tokenDecimal,
          price: price ? { rate: price } : undefined,
          image: imageUrl,
          contractAddress: tokenAddress,
        },
        balance: tokenBalanceData.result,
      });

      // Add a small pause between requests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Adaugă acest cod înainte de return tokens în funcția fetchTokenBalances
    console.log(
      "Tokenuri procesate pentru portofel:",
      tokens.map((t) => ({
        name: t.tokenInfo.name,
        symbol: t.tokenInfo.symbol,
        balance: t.balance,
        value: t.tokenInfo.price?.rate
          ? (Number(t.balance) / Math.pow(10, Number(t.tokenInfo.decimals))) *
            t.tokenInfo.price.rate
          : 0,
      }))
    );

    return tokens;
  } catch (error) {
    console.error("Error getting data from Etherscan:", error);
    throw error;
  }
};
