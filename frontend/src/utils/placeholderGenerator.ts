/**
 * Utility functions for generating abstract, visually appealing placeholders
 */

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
