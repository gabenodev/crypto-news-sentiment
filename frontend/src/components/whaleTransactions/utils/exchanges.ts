import { exchangeIcons } from "./exchangeIcons"
const exchangeColors: Record<string, string> = {
  Binance: "bg-yellow-500",
  Coinbase: "bg-blue-500",
  Huobi: "bg-teal-500",
  Kraken: "bg-purple-500",
  FTX: "bg-orange-500",
  Bitfinex: "bg-red-500",
  OKX: "bg-indigo-500",
  Bybit: "bg-green-500",
  KuCoin: "bg-pink-500",
}

export const getExchangeColor = (exchange: string): string => {
  const match = Object.entries(exchangeColors).find(([key]) => exchange.toLowerCase().includes(key.toLowerCase()))
  return match ? match[1] : "bg-gray-400"
}

export const getTrendIcon = (exchange: string): JSX.Element | null => {
  if (!exchange) return null

  // Caută potrivire exactă sau parțială (case insensitive)
  const matchedKey = Object.keys(exchangeIcons).find((key) => exchange.toLowerCase().includes(key.toLowerCase()))

  return matchedKey ? exchangeIcons[matchedKey] : null
}
