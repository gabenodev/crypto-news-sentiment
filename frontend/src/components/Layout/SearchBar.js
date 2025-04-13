import React, { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

const SearchBar = ({ navigate }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

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
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
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
                <span className="text-xs font-medium text-teal-500">→</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
