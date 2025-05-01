// Helper function to generate appropriate mock response based on URL
export const getMockResponseForUrl = (url: string): any => {
  // Extract chain ID from URL if present
  const chainIdMatch = url.match(/chainid=(\d+)/);
  const chainId = chainIdMatch ? Number.parseInt(chainIdMatch[1]) : 1; // Default to Ethereum if not found

  if (url.includes("action=balance")) {
    return {
      status: "1",
      result: chainId === 56 ? "10000000000000000000" : "1000000000000000000", // 10 BNB or 1 ETH in wei
      message: "Mock balance due to API error",
    };
  } else if (url.includes("action=txlist")) {
    const addressMatch = url.match(/address=([^&]+)/);
    const address = addressMatch
      ? addressMatch[1]
      : "0x0000000000000000000000000000000000000000";
    return {
      status: "1",
      result: generateMockTransactions(address, chainId),
      message: "Mock transactions due to API error",
    };
  } else if (url.includes("action=tokentx")) {
    return {
      status: "1",
      result: generateMockTokenTransactions(chainId),
      message: "Mock token transactions due to API error",
    };
  } else if (url.includes("action=tokenbalance")) {
    return {
      status: "1",
      result: "1000000", // Generic value for token balance
      message: "Mock token balance due to API error",
    };
  } else if (
    url.includes("action=ethprice") ||
    url.includes("action=bnbprice")
  ) {
    return {
      status: "1",
      result: {
        ethbtc: chainId === 56 ? "0.01" : "0.05",
        ethbtc_timestamp: Math.floor(Date.now() / 1000).toString(),
        ethusd: chainId === 56 ? "300" : "3500",
        ethusd_timestamp: Math.floor(Date.now() / 1000).toString(),
      },
      message: "Mock price due to API error",
    };
  }

  // Default mock response
  return {
    status: "1",
    result: [],
    message: "Mock data due to API error",
  };
};

// Function to generate mock token transactions
export const generateMockTokenTransactions = (chainId = 1) => {
  // Define mock tokens based on chain
  const mockTokens =
    chainId === 56
      ? [
          {
            contractAddress: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
            tokenName: "BUSD Token",
            tokenSymbol: "BUSD",
            tokenDecimal: "18",
          },
          {
            contractAddress: "0x55d398326f99059ff775485246999027b3197955",
            tokenName: "Tether USD",
            tokenSymbol: "USDT",
            tokenDecimal: "18",
          },
          {
            contractAddress: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
            tokenName: "USD Coin",
            tokenSymbol: "USDC",
            tokenDecimal: "18",
          },
          {
            contractAddress: "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",
            tokenName: "BTCB Token",
            tokenSymbol: "BTCB",
            tokenDecimal: "18",
          },
          {
            contractAddress: "0x2170ed0880ac9a755fd29b2688956bd959f933f8",
            tokenName: "Ethereum Token",
            tokenSymbol: "ETH",
            tokenDecimal: "18",
          },
        ]
      : [
          {
            contractAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            tokenName: "Tether USD",
            tokenSymbol: "USDT",
            tokenDecimal: "6",
          },
          {
            contractAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            tokenName: "USD Coin",
            tokenSymbol: "USDC",
            tokenDecimal: "6",
          },
          {
            contractAddress: "0x6b175474e89094c44da98b954eedeac495271d0f",
            tokenName: "Dai Stablecoin",
            tokenSymbol: "DAI",
            tokenDecimal: "18",
          },
          {
            contractAddress: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
            tokenName: "Wrapped BTC",
            tokenSymbol: "WBTC",
            tokenDecimal: "8",
          },
          {
            contractAddress: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
            tokenName: "Matic Token",
            tokenSymbol: "MATIC",
            tokenDecimal: "18",
          },
        ];

  const mockTransactions = [];
  const now = Math.floor(Date.now() / 1000);

  // Generate 20 mock token transactions
  for (let i = 0; i < 20; i++) {
    const tokenIndex = Math.floor(Math.random() * mockTokens.length);
    const token = mockTokens[tokenIndex];

    mockTransactions.push({
      blockNumber: String(16000000 - i),
      timeStamp: String(now - i * 86400),
      hash: `0x${Math.random().toString(16).substring(2)}`,
      nonce: String(Math.floor(Math.random() * 1000)),
      blockHash: `0x${Math.random().toString(16).substring(2)}`,
      from: `0x${Math.random().toString(16).substring(2, 42)}`,
      contractAddress: token.contractAddress,
      to: `0x${Math.random().toString(16).substring(2, 42)}`,
      value: String(Math.floor(Math.random() * 1000000000)),
      tokenName: token.tokenName,
      tokenSymbol: token.tokenSymbol,
      tokenDecimal: token.tokenDecimal,
      transactionIndex: String(Math.floor(Math.random() * 100)),
      gas: "100000",
      gasPrice: chainId === 56 ? "5000000000" : "20000000000", // Gas is cheaper on BSC
      gasUsed: "50000",
      cumulativeGasUsed: "1000000",
      input: "deprecated",
      confirmations: "1000",
      chainId: chainId,
    });
  }

  return mockTransactions;
};

// Function to generate mock transactions
export const generateMockTransactions = (address: string, chainId = 1) => {
  const mockTransactions = [];
  const now = Math.floor(Date.now() / 1000);

  // Generate 10 mock transactions
  for (let i = 0; i < 10; i++) {
    const isOutgoing = Math.random() > 0.5;
    mockTransactions.push({
      timestamp: now - i * 86400, // One day apart
      transactionHash: `0x${Math.random().toString(16).substring(2)}`,
      value: Math.random() * (chainId === 56 ? 5 : 2), // Random BNB/ETH amount
      from: isOutgoing
        ? address
        : `0x${Math.random().toString(16).substring(2, 42)}`,
      to: isOutgoing
        ? `0x${Math.random().toString(16).substring(2, 42)}`
        : address,
      isError: "0",
      gasUsed: "21000",
      gasPrice: chainId === 56 ? "5000000000" : "20000000000", // Gas is cheaper on BSC
      chainId: chainId,
    });
  }

  return mockTransactions;
};

// Function to get fallback tokens
export const getFallbackTokens = (chainId = 1) => {
  const fallbackTokens =
    chainId === 56
      ? [
          {
            tokenInfo: {
              name: "Binance Coin",
              symbol: "BNB",
              decimals: "18",
              price: { rate: 300 },
              image:
                "https://assets.coingecko.com/coins/images/825/thumb/bnb-icon2_2x.png",
              contractAddress: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
            },
            balance: "10000000000000000000", // 10 BNB
          },
          {
            tokenInfo: {
              name: "BUSD Token",
              symbol: "BUSD",
              decimals: "18",
              price: { rate: 1 },
              image:
                "https://assets.coingecko.com/coins/images/9576/thumb/BUSD.png",
              contractAddress: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
            },
            balance: "1000000000000000000", // 1 BUSD
          },
          {
            tokenInfo: {
              name: "Tether USD",
              symbol: "USDT",
              decimals: "18",
              price: { rate: 1 },
              image:
                "https://assets.coingecko.com/coins/images/325/thumb/Tether.png",
              contractAddress: "0x55d398326f99059ff775485246999027b3197955",
            },
            balance: "2000000000000000000", // 2 USDT
          },
        ]
      : [
          {
            tokenInfo: {
              name: "Ethereum",
              symbol: "ETH",
              decimals: "18",
              price: { rate: 3500 },
              image:
                "https://assets.coingecko.com/coins/images/279/thumb/ethereum.png",
              contractAddress: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
            },
            balance: "1000000000000000000", // 1 ETH
          },
          {
            tokenInfo: {
              name: "USD Tether",
              symbol: "USDT",
              decimals: "6",
              price: { rate: 1 },
              image:
                "https://assets.coingecko.com/coins/images/325/thumb/Tether.png",
              contractAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            },
            balance: "1000000", // 1 USDT
          },
          {
            tokenInfo: {
              name: "USD Coin",
              symbol: "USDC",
              decimals: "6",
              price: { rate: 1 },
              image:
                "https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png",
              contractAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            },
            balance: "2000000", // 2 USDC
          },
        ];

  console.log(
    `✅ Returning fallback tokens for chain ${chainId} after error:`,
    fallbackTokens.length
  );
  return fallbackTokens;
};

// Function to add fallback tokens
export const addFallbackTokens = (tokens: any[], chainId = 1) => {
  const fallbackTokens =
    chainId === 56
      ? [
          {
            tokenInfo: {
              name: "BUSD Token",
              symbol: "BUSD",
              decimals: "18",
              price: { rate: 1 },
              image:
                "https://assets.coingecko.com/coins/images/9576/thumb/BUSD.png",
              contractAddress: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
            },
            balance: "1000000000000000000", // 1 BUSD
          },
          {
            tokenInfo: {
              name: "Tether USD",
              symbol: "USDT",
              decimals: "18",
              price: { rate: 1 },
              image:
                "https://assets.coingecko.com/coins/images/325/thumb/Tether.png",
              contractAddress: "0x55d398326f99059ff775485246999027b3197955",
            },
            balance: "2000000000000000000", // 2 USDT
          },
          {
            tokenInfo: {
              name: "BTCB Token",
              symbol: "BTCB",
              decimals: "18",
              price: { rate: 60000 },
              image:
                "https://assets.coingecko.com/coins/images/14108/thumb/BTCB.png",
              contractAddress: "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",
            },
            balance: "100000000000000", // 0.0001 BTCB
          },
        ]
      : [
          {
            tokenInfo: {
              name: "USD Tether",
              symbol: "USDT",
              decimals: "6",
              price: { rate: 1 },
              image:
                "https://assets.coingecko.com/coins/images/325/thumb/Tether.png",
              contractAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            },
            balance: "1000000", // 1 USDT
          },
          {
            tokenInfo: {
              name: "USD Coin",
              symbol: "USDC",
              decimals: "6",
              price: { rate: 1 },
              image:
                "https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png",
              contractAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            },
            balance: "2000000", // 2 USDC
          },
          {
            tokenInfo: {
              name: "Wrapped Bitcoin",
              symbol: "WBTC",
              decimals: "8",
              price: { rate: 60000 },
              image:
                "https://assets.coingecko.com/coins/images/7598/thumb/wrapped_bitcoin_wbtc.png",
              contractAddress: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
            },
            balance: "100000", // 0.001 WBTC
          },
        ];

  // Add fallback tokens to the token list
  tokens.push(...fallbackTokens);
  console.log(
    `✅ Added fallback tokens for chain ${chainId}:`,
    fallbackTokens.length
  );
};
