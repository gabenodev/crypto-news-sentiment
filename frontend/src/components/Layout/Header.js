import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaUserCircle } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import NightToggle from "./NightToggle";

function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const fetchSearchResults = async () => {
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/search?query=${searchQuery}`
        );
        const data = await response.json();
        setSearchResults(data.coins.slice(0, 5));
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && searchResults.length > 0) {
      navigate(`/currencies/${searchResults[0].id}`);
      setSearchQuery("");
      setShowResults(false);
    }
  };

  const handleResultClick = (coinId) => {
    navigate(`/currencies/${coinId}`);
    setSearchQuery("");
    setShowResults(false);
    setIsMobileMenuOpen(false);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <header className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm w-full sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
      <div className="w-full px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <button
              className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-400"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-teal-500 to-green-500 flex items-center justify-center transition-transform duration-300 group-hover:rotate-12">
                <span className="text-white font-bold text-xl">SX</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-green-500 bg-clip-text text-transparent">
                SentimentX
              </span>
            </Link>
          </div>

          {/* Navigation - Hidden on mobile */}
          <nav className="hidden lg:flex space-x-6 text-sm font-medium">
            <Link
              to="/news"
              className="text-gray-500 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 transition-colors duration-200 relative group"
            >
              News
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/altcoin-season-index"
              className="text-gray-500 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 transition-colors duration-200 relative group"
            >
              Altcoin Index
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/sentiment-trend"
              className="text-gray-500 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 transition-colors duration-200 relative group"
            >
              Sentiment
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/whale-transactions"
              className="text-gray-500 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 transition-colors duration-200 relative group"
            >
              Whale Watch
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search Bitcoin, Ethereum..."
                    className="py-2 pl-4 pr-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent w-48 md:w-64 transition-all duration-200 text-sm placeholder-gray-400 dark:placeholder-gray-500"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowResults(true);
                    }}
                    onFocus={() => setShowResults(true)}
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors duration-200"
                    >
                      <IoMdClose size={14} />
                    </button>
                  ) : null}
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-teal-500 transition-colors duration-200"
                  >
                    <FaSearch size={14} />
                  </button>
                </div>
              </form>

              {/* Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="py-1">
                    {searchResults.map((coin) => (
                      <div
                        key={coin.id}
                        className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center space-x-3 transition-colors duration-150"
                        onClick={() => handleResultClick(coin.id)}
                      >
                        <img
                          src={coin.thumb}
                          alt={coin.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-gray-900 dark:text-white">
                            {coin.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {coin.symbol.toUpperCase()}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-teal-500">
                          →
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Icon */}
            <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
              <FaUserCircle size={20} />
            </button>

            {/* Night Toggle with better visibility in light mode */}
            <div className="p-1 rounded-full bg-gray-100 dark:bg-gray-800">
              <NightToggle className="text-gray-700 dark:text-gray-300" />
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 space-y-4">
            <div className="flex flex-col space-y-3">
              <Link
                to="/news"
                className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                News
              </Link>
              <Link
                to="/altcoin-season-index"
                className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Altcoin Index
              </Link>
              <Link
                to="/sentiment-trend"
                className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sentiment
              </Link>
              <Link
                to="/whale-transactions"
                className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Whale Watch
              </Link>
            </div>

            {/* Mobile Search - Only visible when menu is open */}
            <div className="px-4 pt-2">
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search cryptocurrencies..."
                    className="py-2 pl-4 pr-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent w-full transition-all duration-200 text-sm placeholder-gray-400 dark:placeholder-gray-500"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowResults(true);
                    }}
                    onFocus={() => setShowResults(true)}
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors duration-200"
                    >
                      <IoMdClose size={14} />
                    </button>
                  ) : null}
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-teal-500 transition-colors duration-200"
                  >
                    <FaSearch size={14} />
                  </button>
                </div>
              </form>

              {/* Mobile Search Results */}
              {showResults && searchResults.length > 0 && (
                <div className="mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="py-1">
                    {searchResults.map((coin) => (
                      <div
                        key={coin.id}
                        className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center space-x-3 transition-colors duration-150"
                        onClick={() => handleResultClick(coin.id)}
                      >
                        <img
                          src={coin.thumb}
                          alt={coin.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-gray-900 dark:text-white">
                            {coin.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {coin.symbol.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
