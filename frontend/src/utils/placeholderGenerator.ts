/**
 * Utility functions for generating abstract, visually appealing placeholders
 */

// Paleta de culori moderne pentru gradienți
const COLOR_PALETTES = [
  // Teal/Green
  ["#14b8a6", "#10b981"],
  // Blue/Purple
  ["#3b82f6", "#8b5cf6"],
  // Pink/Orange
  ["#ec4899", "#f97316"],
  // Cyan/Blue
  ["#06b6d4", "#3b82f6"],
  // Amber/Orange
  ["#f59e0b", "#f97316"],
  // Emerald/Teal
  ["#10b981", "#14b8a6"],
  // Violet/Indigo
  ["#8b5cf6", "#6366f1"],
  // Rose/Pink
  ["#f43f5e", "#ec4899"],
  // Lime/Green
  ["#84cc16", "#22c55e"],
  // Sky/Cyan
  ["#0ea5e9", "#06b6d4"],
];

// Culori vibrante pentru pixeli
const PIXEL_COLORS = [
  "#FF5252", // Roșu
  "#FF4081", // Roz
  "#E040FB", // Purpuriu
  "#7C4DFF", // Violet adânc
  "#536DFE", // Indigo
  "#448AFF", // Albastru
  "#40C4FF", // Albastru deschis
  "#18FFFF", // Cyan
  "#64FFDA", // Verde-albăstrui
  "#69F0AE", // Verde
  "#B2FF59", // Verde deschis
  "#EEFF41", // Lime
  "#FFFF00", // Galben
  "#FFD740", // Chihlimbar
  "#FFAB40", // Portocaliu
  "#FF6E40", // Portocaliu adânc
];

// Culori pentru fundaluri - mai închise dar nu negre
const BACKGROUND_COLORS = [
  "#1E293B", // Slate-800
  "#1E3A8A", // Blue-900
  "#0F766E", // Teal-800
  "#3730A3", // Indigo-800
  "#9F1239", // Rose-800
  "#7E22CE", // Purple-800
  "#3F6212", // Lime-800
  "#7C2D12", // Orange-900
  "#134E4A", // Teal-900
  "#4C1D95", // Violet-900
];

/**
 * Generează un hash consistent din text
 * @param text Textul pentru care se generează hash-ul
 * @returns Un număr între 0 și 1
 */
const hashString = (text: string): number => {
  let hash = 0;
  if (text.length === 0) return hash;

  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Normalizează între 0 și 1
  return Math.abs(hash) / 2147483647;
};

/**
 * Selectează o paletă de culori bazată pe text
 * @param text Textul pentru care se selectează paleta
 * @returns Un array cu două culori pentru gradient
 */
const selectColorPalette = (text: string): string[] => {
  const hash = hashString(text);
  const index = Math.floor(hash * COLOR_PALETTES.length);
  return COLOR_PALETTES[index];
};

/**
 * Generează un SVG abstract pentru criptomonede
 * @param symbol Simbolul criptomonedei
 * @param size Dimensiunea imaginii
 * @returns Un URL de date pentru SVG
 */
export const generateCryptoPlaceholder = (
  symbol: string,
  size: number = 100
): string => {
  try {
    // Ensure symbol is a string and limit to 4 characters
    const cleanSymbol = String(symbol || "?")
      .slice(0, 4)
      .toUpperCase();

    // Generate a deterministic color based on the symbol
    const hue =
      Array.from(cleanSymbol).reduce(
        (acc, char) => acc + char.charCodeAt(0),
        0
      ) % 360;
    const color = `hsl(${hue}, 65%, 55%)`;
    const darkColor = `hsl(${hue}, 65%, 40%)`;

    // Create SVG
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <rect width="100" height="100" fill="${color}" />
        <circle cx="50" cy="50" r="35" fill="${darkColor}" />
        <text x="50" y="50" font-family="Arial, sans-serif" font-size="30" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">${cleanSymbol}</text>
      </svg>
    `;

    // Use encodeURIComponent instead of btoa to handle Unicode characters
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  } catch (error) {
    console.error("Error generating crypto placeholder:", error);
    return `/placeholder.svg?height=32&width=32&query=${encodeURIComponent(
      symbol || "?"
    )}`;
  }
};

export const generateWalletPlaceholder = (
  address: string,
  size = 64
): string => {
  try {
    if (!address) return "";

    // Take the first 6 characters of the address for color generation
    const colorSeed = address.slice(2, 8);
    const hue = Number.parseInt(colorSeed, 16) % 360;
    const color = `hsl(${hue}, 70%, 60%)`;
    const darkColor = `hsl(${hue}, 70%, 45%)`;

    // Create a pattern based on the address
    const patternSeed = address.slice(2, 10);
    const patternDigits = Number.parseInt(patternSeed, 16) % 1000;

    // Create SVG with a simple pattern
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
        <rect width="${size}" height="${size}" fill="${color}" />
        <circle cx="${size / 2}" cy="${size / 2}" r="${
      size / 3
    }" fill="${darkColor}" />
        <text x="${size / 2}" y="${
      size / 2
    }" font-family="monospace" font-size="${
      size / 4
    }" fill="white" text-anchor="middle" dominant-baseline="central">${address.slice(
      0,
      2
    )}</text>
      </svg>
    `;

    // Use encodeURIComponent instead of btoa to handle Unicode characters
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  } catch (error) {
    console.error("Error generating wallet placeholder:", error);
    return `/placeholder.svg?height=${size}&width=${size}&query=wallet`;
  }
};

/**
 * Funcție generică pentru generarea de placeholdere
 * @param text Textul pentru care se generează placeholderul
 * @param size Dimensiunea imaginii
 * @param type Tipul de placeholder (crypto sau wallet)
 * @returns Un URL de date pentru SVG
 */
export const generatePlaceholder = (
  text: string,
  size = 32,
  type: "crypto" | "wallet" = "crypto"
): string => {
  return type === "crypto"
    ? generateCryptoPlaceholder(text, size)
    : generateWalletPlaceholder(text, size);
};
