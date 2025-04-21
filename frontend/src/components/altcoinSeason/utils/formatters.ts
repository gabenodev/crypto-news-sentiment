export const formatMarketCap = (marketCap: number): string => {
  if (marketCap >= 1_000_000_000) {
    return `${(marketCap / 1_000_000_000).toFixed(2)}B`
  } else if (marketCap >= 1_000_000) {
    return `${(marketCap / 1_000_000).toFixed(2)}M`
  }
  return `${(marketCap / 1_000).toFixed(2)}K`
}
