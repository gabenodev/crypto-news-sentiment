import type { ChartDataPoint } from "../../types";

// Function to calculate Simple Moving Average (SMA)
export const movingAverage = (
  data: ChartDataPoint[],
  period: number,
  key: string
): ChartDataPoint[] => {
  if (data.length < period) {
    console.error(`Cannot calculate ${key} on a timeframe this small.`);
    return data.map((item) => ({ ...item, [key]: null }));
  }
  return data.map((item, index) => {
    if (index < period - 1) return { ...item, [key]: null };
    const sum = data
      .slice(index - period + 1, index + 1)
      .reduce((acc, val) => acc + val.price, 0);
    return { ...item, [key]: sum / period };
  });
};

// Function to calculate minimum price
export const calculateMinPrice = (data: ChartDataPoint[]): number => {
  return Math.min(...data.map((item) => item.price));
};

// Function to calculate maximum price
export const calculateMaxPrice = (data: ChartDataPoint[]): number => {
  return Math.max(...data.map((item) => item.price));
};

// Function to calculate average price
export const calculateAveragePrice = (data: ChartDataPoint[]): number => {
  const min = calculateMinPrice(data);
  const max = calculateMaxPrice(data);
  return (min + max) / 2;
};
