/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Culori pentru Dark Mode (personalizate)
        dark: {
          primary: "#121212", // Fundal principal
          secondary: "#1E1E1E", // Carduri, bare laterale
          tertiary: "#2D2D2D", // Elemente interactive (hover/focus)
          text: {
            primary: "#E0E0E0", // Text principal
            secondary: "#A0A0A0", // Text secundar (subtitluri)
          },
        },
        // Accente (folosite în ambele moduri)
        accent: {
          primary: "#BB86FC", // Violet (accent principal)
          secondary: "#03DAC6", // Turcoaz (accent secundar)
        },
        // Erori/avertismente
        error: {
          DEFAULT: "#CF6679", // Roșu desaturat
        },
      },
    },
  },
  plugins: [],
}
