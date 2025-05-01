// Format currency values
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

// Format date from timestamp
export const formatDate = (timestamp: number | null): string => {
  if (!timestamp) return "N/A"
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Get font size based on value
export const getTotalValueFontSize = (value: number): string => {
  if (value > 1000000) {
    return "text-xl"
  } else if (value > 10000) {
    return "text-2xl"
  } else {
    return "text-3xl"
  }
}
