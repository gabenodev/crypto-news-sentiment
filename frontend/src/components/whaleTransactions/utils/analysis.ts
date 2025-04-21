import type { WhaleTransaction } from "../../../types"

export const getTopExchange = (transactions: WhaleTransaction[]): string => {
  if (!transactions || transactions.length === 0) return "N/A"

  const exchangeCounts = transactions.reduce(
    (acc, tx) => {
      acc[tx.exchange] = (acc[tx.exchange] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const sortedExchanges = Object.entries(exchangeCounts).sort((a, b) => b[1] - a[1])
  return sortedExchanges[0][0]
}
