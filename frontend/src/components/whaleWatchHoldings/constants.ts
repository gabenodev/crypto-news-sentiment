// Constants used in the wallet dashboard

// Popular wallets with names
export const KNOWN_WALLETS: Record<string, { name: string; description: string }> = {
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
  "0x503828976D22510aad0201ac7EC88293211D23Da": {
    name: "Coinbase",
    description: "Popular exchange",
  },
  "0x2910543Af39abA0Cd09dBb2D50200b3E800A63D2": {
    name: "Kraken",
    description: "Top exchange",
  },
  "0x9F4cda013E354b8fC285BF4b9A60460cEe7f7Ea9": {
    name: "US Government Seized",
    description: "Seized by US government",
  },
}

// Available blockchain networks
export const AVAILABLE_CHAINS = [
  { id: 1, name: "Ethereum", icon: "Ξ", color: "#627EEA" },
  { id: 56, name: "BSC", icon: "B", color: "#F3BA2F" },
  { id: 137, name: "Polygon", icon: "P", color: "#8247E5" },
  { id: 43114, name: "Avalanche", icon: "A", color: "#E84142" },
  { id: 10, name: "Optimism", icon: "O", color: "#FF0420" },
  { id: 42161, name: "Arbitrum", icon: "A", color: "#28A0F0" },
]
