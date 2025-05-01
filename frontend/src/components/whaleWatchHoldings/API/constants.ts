// Constants for Ethereum wallet data

// API key for Etherscan
export const ETHERSCAN_API_KEY = "RP1AAGBP2YNUWFTAFP6KWT7GRRKC5BG5MM";

// Base URL for the v2 API that supports all chains
export const API_BASE_URL = "https://api.etherscan.io/v2/api";

// Define chain names for display
export const CHAIN_NAMES: Record<number, string> = {
  1: "Ethereum",
  56: "Binance Smart Chain",
};

// Define native token symbols for each chain
export const CHAIN_NATIVE_TOKENS: Record<number, string> = {
  1: "ETH",
  56: "BNB",
};

// Define native token names for each chain
export const CHAIN_NATIVE_TOKEN_NAMES: Record<number, string> = {
  1: "Ethereum",
  56: "Binance Coin",
};

// Cache timeouts
export const TOKEN_CACHE_TIME = 5 * 60 * 1000; // 5 minutes
export const TX_CACHE_TIME = 10 * 60 * 1000; // 10 minutes

// Predefined prices for popular tokens to avoid too many API requests
export const POPULAR_TOKEN_PRICES: Record<string, number> = {
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
export const POPULAR_TOKEN_IMAGES: Record<string, string> = {
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

// Add predefined prices for BSC tokens
export const POPULAR_TOKEN_PRICES_BSC: Record<string, number> = {
  "0xe9e7cea3dedca5984780bafc599bd69add087d56": 1, // BUSD
  "0x55d398326f99059ff775485246999027b3197955": 1, // USDT
  "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d": 1, // USDC
  "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c": 60000, // BTCB
  "0x2170ed0880ac9a755fd29b2688956bd959f933f8": 3500, // ETH
  "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3": 1, // DAI
  "0x3ee2200efb3400fabb9aacf31297cbdd1d435d47": 0.3, // ADA
  "0xbf5140a22578168fd562dccf235e5d43a02ce9b1": 0.7, // UNI
  "0x4338665cbb7b2485a8855a139b75d5e34ab0db94": 0.1, // LTC
  "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82": 5, // CAKE
};

// Add predefined images for BSC tokens
export const POPULAR_TOKEN_IMAGES_BSC: Record<string, string> = {
  "0xe9e7cea3dedca5984780bafc599bd69add087d56":
    "https://assets.coingecko.com/coins/images/9576/thumb/BUSD.png", // BUSD
  "0x55d398326f99059ff775485246999027b3197955":
    "https://assets.coingecko.com/coins/images/325/thumb/Tether.png", // USDT
  "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d":
    "https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png", // USDC
  "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c":
    "https://assets.coingecko.com/coins/images/14108/thumb/BTCB.png", // BTCB
  "0x2170ed0880ac9a755fd29b2688956bd959f933f8":
    "https://assets.coingecko.com/coins/images/279/thumb/ethereum.png", // ETH
  "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3":
    "https://assets.coingecko.com/coins/images/9956/thumb/4943.png", // DAI
  "0x3ee2200efb3400fabb9aacf31297cbdd1d435d47":
    "https://assets.coingecko.com/coins/images/975/thumb/cardano.png", // ADA
  "0xbf5140a22578168fd562dccf235e5d43a02ce9b1":
    "https://assets.coingecko.com/coins/images/12504/thumb/uniswap-uni.png", // UNI
  "0x4338665cbb7b2485a8855a139b75d5e34ab0db94":
    "https://assets.coingecko.com/coins/images/2/thumb/litecoin.png", // LTC
  "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82":
    "https://assets.coingecko.com/coins/images/12632/thumb/pancakeswap-cake-logo.png", // CAKE
};
