"use client";
import React from "react";
import { useState, useEffect } from "react";
import { Sun, Moon } from "react-feather";
import { motion } from "framer-motion";

function NightToggle(): JSX.Element {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Check theme from localStorage on load
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = (): void => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      if (newMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return newMode;
    });
  };

  return (
    <motion.button
      onClick={toggleTheme}
      whileTap={{ scale: 0.9 }}
      whileHover={{
        scale: 1.1,
        boxShadow: isDarkMode
          ? "0px 0px 12px rgba(255, 215, 0, 0.9)"
          : "0px 0px 12px rgba(26, 25, 25, 0.8)",
      }}
      className="relative p-2 rounded-full bg-transparent dark:bg-transparent transition-colors duration-300"
    >
      <motion.div
        key={isDarkMode ? "sun" : "moon"}
        initial={{ rotate: -180, scale: 0.5, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        exit={{ rotate: 180, scale: 0.5, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
      >
        {isDarkMode ? (
          <Sun className="w-6 h-6 text-yellow-400" />
        ) : (
          <Moon className="w-6 h-6 text-black dark:text-gray-200" />
        )}
      </motion.div>
    </motion.button>
  );
}

export default NightToggle;
