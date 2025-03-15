import React, { useState, useEffect } from "react";
import { FaMoon, FaSun } from "react-icons/fa";

function NightToggle() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Verificăm localStorage pentru tema aleasă anterior
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark"); // Aplicăm dark mode
    }
  }, []);

  // Schimbăm tema între dark și light
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      const theme = newMode ? "dark" : "light";
      if (newMode) {
        document.documentElement.classList.add("dark"); // Aplicăm dark mode
      } else {
        document.documentElement.classList.remove("dark"); // Îndepărtăm dark mode
      }
      localStorage.setItem("theme", theme); // Salvăm tema în localStorage
      return newMode;
    });
  };

  return (
    <button
      onClick={toggleTheme}
      className="text-white p-2 rounded-full focus:outline-none"
    >
      {isDarkMode ? <FaSun size={24} /> : <FaMoon size={24} />}
    </button>
  );
}

export default NightToggle;
