import React from "react";
import NightToggle from "./NightToggle"; // Importă componenta NightToggle

function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-green-400 dark:text-white text-black">
          Crypto News and Sentiment Analysis
        </h1>
        <NightToggle /> {/* Aici adăugăm butonul de NightToggle */}
      </div>
    </header>
  );
}

export default Header;
