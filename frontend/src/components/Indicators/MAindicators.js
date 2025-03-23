// MAindicators.js

// Funcție pentru calculul Mediei Mobile Simple (SMA)
export const movingAverage = (data, period, key) => {
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

// Funcție pentru calculul prețului minim
export const calculateMinPrice = (data) => {
  return Math.min(...data.map((item) => item.price));
};

// Funcție pentru calculul prețului maxim
export const calculateMaxPrice = (data) => {
  return Math.max(...data.map((item) => item.price));
};

// Funcție pentru calculul prețului mediu
export const calculateAveragePrice = (data) => {
  const min = calculateMinPrice(data);
  const max = calculateMaxPrice(data);
  return (min + max) / 2;
};
