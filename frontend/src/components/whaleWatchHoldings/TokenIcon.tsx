"use client";

import React from "react";

interface TokenIconProps {
  symbol: string;
  size?: number;
  className?: string;
}

// Common crypto symbols for logo mapping
const CRYPTO_SYMBOLS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
  USDC: "usd-coin",
  BNB: "binance-coin",
  XRP: "ripple",
  ADA: "cardano",
  SOL: "solana",
  DOGE: "dogecoin",
  DOT: "polkadot",
  AVAX: "avalanche",
  SHIB: "shiba-inu",
  MATIC: "polygon",
  LTC: "litecoin",
  UNI: "uniswap",
  LINK: "chainlink",
  XLM: "stellar",
  ATOM: "cosmos",
  ALGO: "algorand",
  FIL: "filecoin",
};

// Function to get a color based on the symbol string
const getColorFromSymbol = (symbol: string): string => {
  const colors = [
    "#14b8a6", // teal-500
    "#10b981", // green-500
    "#059669", // green-600
    "#047857", // green-700
    "#0d9488", // teal-600
    "#0f766e", // teal-700
    "#0e7490", // cyan-700
    "#0891b2", // cyan-600
    "#06b6d4", // cyan-500
  ];

  // Use the sum of character codes to determine the color
  const charSum = symbol
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[charSum % colors.length];
};

const TokenIcon: React.FC<TokenIconProps> = ({
  symbol,
  size = 32,
  className = "",
}) => {
  const [imageError, setImageError] = React.useState(false);

  if (!symbol) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-teal-500 text-white font-bold ${className}`}
        style={{ width: size, height: size }}
      >
        ?
      </div>
    );
  }

  const normalizedSymbol = symbol.toUpperCase();
  const mappedSymbol = CRYPTO_SYMBOLS[normalizedSymbol] || symbol.toLowerCase();
  const iconUrl = `https://cryptoicons.org/api/icon/${mappedSymbol}/32`;

  // If image failed to load, show a colored div with the symbol's first letters
  if (imageError) {
    const text = symbol.substring(0, 2).toUpperCase();
    const bgColor = getColorFromSymbol(symbol);

    return (
      <div
        className={`flex items-center justify-center rounded-full text-white font-bold ${className}`}
        style={{ width: size, height: size, backgroundColor: bgColor }}
      >
        {text}
      </div>
    );
  }

  // Try to load the image
  return (
    <img
      src={iconUrl || "/placeholder.svg"}
      alt={symbol}
      className={`rounded-full ${className}`}
      style={{ width: size, height: size }}
      onError={() => setImageError(true)}
    />
  );
};

export default TokenIcon;
