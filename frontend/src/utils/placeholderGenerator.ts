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
  size = 32
): string => {
  if (!symbol) symbol = "?";

  const text = symbol.substring(0, 2).toUpperCase();
  const [color1, color2] = selectColorPalette(symbol);

  // Generează un pattern abstract bazat pe hash-ul simbolului
  const hash = hashString(symbol);
  const numShapes = 3 + Math.floor(hash * 3); // 3-5 forme

  let shapes = "";

  // Adaugă forme geometrice abstracte
  for (let i = 0; i < numShapes; i++) {
    const shapeHash = hashString(symbol + i);
    const x = size * 0.1 + shapeHash * size * 0.8;
    const y = size * 0.1 + hashString(symbol + i + 1) * size * 0.8;
    const radius = size * (0.1 + hashString(symbol + i + 2) * 0.2);

    // Alternează între cercuri și pătrate rotunjite
    if (i % 2 === 0) {
      shapes += `<circle cx="${x}" cy="${y}" r="${radius}" fill="rgba(255,255,255,0.15)" />`;
    } else {
      shapes += `<rect x="${x - radius}" y="${y - radius}" width="${
        radius * 2
      }" height="${radius * 2}" rx="${
        radius * 0.5
      }" fill="rgba(255,255,255,0.1)" />`;
    }
  }

  // Creează SVG-ul cu gradient și forme abstracte
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${color1}" />
          <stop offset="100%" stop-color="${color2}" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${
    size * 0.25
  }" fill="url(#grad)" />
      ${shapes}
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${
        size * 0.4
      }" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${text}</text>
    </svg>`;

  // Convertește la data URL
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Generează un identicon pixelat pentru portofele, similar cu exemplul
 * @param address Adresa portofelului
 * @param size Dimensiunea imaginii
 * @returns Un URL de date pentru SVG
 */
export const generateWalletPlaceholder = (
  address: string,
  size = 32
): string => {
  if (!address) address = "wallet";

  // Folosim adresa pentru a genera un hash consistent
  const seed = Array.from(address).reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0
  );

  // Determinăm numărul de pixeli pe rând/coloană (8x8 grid)
  const gridSize = 8;
  const pixelSize = size / gridSize;

  // Selectăm un fundal colorat în loc de negru
  const backgroundIndex = Math.floor(
    Math.abs(Math.sin(seed * 0.1) * 10000) % BACKGROUND_COLORS.length
  );
  const backgroundColor = BACKGROUND_COLORS[backgroundIndex];

  // Selectăm doar 3-4 culori pentru acest identicon, bazat pe adresă
  const numColors = 3 + (seed % 2); // 3 sau 4 culori
  const selectedColors: string[] = [];

  // Selectăm culorile în mod deterministic bazat pe adresă
  for (let i = 0; i < numColors; i++) {
    const colorIndex = Math.floor(
      Math.abs(Math.sin(seed + i * 100) * 10000) % PIXEL_COLORS.length
    );
    selectedColors.push(PIXEL_COLORS[colorIndex]);
  }

  // Generăm matricea de pixeli
  let pixels = "";
  const matrix = Array(gridSize)
    .fill(0)
    .map(() => Array(gridSize).fill(0));

  // Completăm matricea cu valori determinate de adresă
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      // Folosim un algoritm pseudorandom dar deterministic
      const value =
        Math.abs(Math.sin(seed + i * 11 + j * 7) * 10000) % numColors;
      matrix[i][j] = Math.floor(value);
    }
  }

  // Desenăm pixelii - creștem densitatea pentru a umple mai mult spațiul
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      // Folosim o formulă care generează mai mulți pixeli (70-80% din spațiu)
      const shouldDraw =
        Math.abs(Math.sin(seed + i * 13 + j * 17) * 1000) % 10 > 2;

      if (shouldDraw) {
        const colorIndex = matrix[i][j];
        const pixelColor = selectedColors[colorIndex];
        const x = i * pixelSize;
        const y = j * pixelSize;

        pixels += `<rect x="${x}" y="${y}" width="${pixelSize}" height="${pixelSize}" fill="${pixelColor}" />`;
      }
    }
  }

  // Creează SVG-ul cu fundal colorat și pixeli colorați
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" fill="${backgroundColor}" />
      ${pixels}
    </svg>`;

  // Convertește la data URL
  return `data:image/svg+xml;base64,${btoa(svg)}`;
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
