import type { CryptoData } from "../types"
import { formatCurrency } from "./formatters"

export const getCryptoPrice = (symbol: string, cryptoData: Record<string, CryptoData>): number | null => {
  if (!cryptoData) return null
  const crypto = cryptoData[symbol.toLowerCase()]
  return crypto ? crypto.current_price : null
}

export const getUsdValue = (value: number, symbol: string, cryptoData: Record<string, CryptoData>): string | null => {
  if (!cryptoData) return null
  const price = getCryptoPrice(symbol, cryptoData)
  if (price === null) return null
  return formatCurrency(value * price)
}
