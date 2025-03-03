import React from "react";
import NightToggle from "./NightToggle"; // Importă componenta NightToggle

function Header({ setActiveTab }) {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-6 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Title */}
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-green-400 dark:text-white">
            Crypto News and Sentiment Analysis
          </h1>

          {/* Night Toggle */}
          <NightToggle />
        </div>

        {/* Navigation */}
        <nav className="mt-6 flex justify-center space-x-8 text-lg font-semibold">
          <button
            className="text-white hover:text-teal-300 transition duration-300"
            onClick={() => setActiveTab("news")} // Actualizează tab-ul activ la "news"
          >
            News
          </button>

          <button
            className="text-white hover:text-teal-300 transition duration-300"
            onClick={() => setActiveTab("altcoin")} // Actualizează tab-ul activ la "altcoin"
          >
            AltcoinSeason Index
          </button>

          <button
            className="text-white hover:text-teal-300 transition duration-300"
            onClick={() => setActiveTab("sentiment")} // Actualizează tab-ul activ la "sentiment"
          >
            Sentiment Trend
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
