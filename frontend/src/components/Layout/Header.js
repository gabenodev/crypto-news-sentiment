import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import NightToggle from "./NightToggle";

function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

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
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <header className="bg-gray-900 text-white shadow-sm w-full sticky top-0 z-50 border-b border-gray-700">
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-teal-500 to-green-500 flex items-center justify-center transition-transform duration-300 group-hover:rotate-12">
              <span className="text-white font-bold text-xl">SX</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-green-500 bg-clip-text text-transparent">
              SentimentX
            </span>
          </Link>

          {/* Navigation - Hidden on mobile */}
          <nav className="hidden lg:flex space-x-6 text-sm font-medium">
            <Link
              to="/news"
              className="text-gray-300 hover:text-teal-400 transition-colors duration-200 hover:underline underline-offset-4 decoration-2"
            >
              News
            </Link>
            <Link
              to="/altcoin-season-index"
              className="text-gray-300 hover:text-teal-400 transition-colors duration-200 hover:underline underline-offset-4 decoration-2"
            >
              Altcoin Index
            </Link>
            <Link
              to="/sentiment-trend"
              className="text-gray-300 hover:text-teal-400 transition-colors duration-200 hover:underline underline-offset-4 decoration-2"
            >
              Sentiment
            </Link>
            <Link
              to="/whale-transactions"
              className="text-gray-300 hover:text-teal-400 transition-colors duration-200 hover:underline underline-offset-4 decoration-2"
            >
              Whale Watch
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative hidden md:block">
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search Bitcoin, Ethereum..."
                    className="py-2 pl-4 pr-10 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 w-64 transition-all duration-200 text-sm placeholder-gray-400"
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
                      className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      <IoMdClose size={14} />
                    </button>
                  ) : null}
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-teal-400 transition-colors duration-200"
                  >
                    <FaSearch size={14} />
                  </button>
                </div>
              </form>

              {/* Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute z-50 mt-1 w-full bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
                  {searchResults.map((coin) => (
                    <div
                      key={coin.id}
                      className="px-4 py-3 hover:bg-gray-700 cursor-pointer flex items-center space-x-3 transition-colors duration-150"
                      onClick={() => handleResultClick(coin.id)}
                    >
                      <img
                        src={coin.thumb}
                        alt={coin.name}
                        className="w-5 h-5 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {coin.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {coin.symbol.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <NightToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
