export const truncate = (str: string): string => {
  return str.length > 15 ? `${str.slice(0, 6)}...${str.slice(-4)}` : str
}

export const formatValue = (value: number): string => {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 5,
  })
}

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}
