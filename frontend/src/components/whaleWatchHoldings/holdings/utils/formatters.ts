// Format currency values
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value)
}

// Get crypto logo URL
export const getCryptoLogoUrl = (symbol: string): string => {
  if (!symbol) return generateCryptoPlaceholder("?")
  try {
    // Return directly the placeholder generated
    return generateCryptoPlaceholder(symbol)
  } catch (error) {
    console.error("Error generating crypto logo:", error)
    return `/placeholder.svg?height=32&width=32&query=${encodeURIComponent(symbol || "?")}`
  }
}

// This is a placeholder function - you'll need to import the actual implementation
// from your placeholderGenerator utility
function generateCryptoPlaceholder(symbol: string): string {
  // This is just a placeholder - replace with your actual implementation
  return `/placeholder.svg?height=32&width=32&query=${encodeURIComponent(symbol || "?")}`
}
