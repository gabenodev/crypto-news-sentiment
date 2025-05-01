// Popular wallets with names
export const KNOWN_WALLETS: Record<
  string,
  { name: string; description: string }
> = {
  "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045": {
    name: "Vitalik Buterin",
    description: "Ethereum Co-founder",
  },
  "0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe": {
    name: "Ethereum Foundation",
    description: "Non-profit organization",
  },
  "0x28C6c06298d514Db089934071355E5743bf21d60": {
    name: "Binance",
    description: "Cryptocurrency exchange",
  },
  "0xF977814e90dA44bFA03b6295A0616a897441aceC": {
    name: "Wintermute",
    description: "Major crypto market maker",
  },
  "0x8EB8a3b98659Cce290402893d0123abb75E3ab28": {
    name: "Jump Trading",
    description: "Quantitative trading firm",
  },
  "0x5a52E96BAcdaBb82fd05763E25335261B270Efcb": {
    name: "Alameda Research",
    description: "Former FTX trading arm",
  },
};

// Available chains with better icons
export const AVAILABLE_CHAINS = [
  {
    id: 1,
    name: "Ethereum",
    icon: "Ξ",
    color: "#627EEA",
    iconUrl: "https://assets.coingecko.com/coins/images/279/thumb/ethereum.png",
  },
  {
    id: 56,
    name: "BSC",
    icon: "B",
    color: "#F3BA2F",
    iconUrl:
      "https://assets.coingecko.com/coins/images/825/thumb/bnb-icon2_2x.png",
  },
];
