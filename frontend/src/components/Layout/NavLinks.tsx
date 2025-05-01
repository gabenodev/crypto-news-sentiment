"use client";
import React from "react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

interface NavLinksProps {
  mobile?: boolean;
  onClose?: () => void;
}

const NavLinks = ({
  mobile = false,
  onClose = () => {},
}: NavLinksProps): JSX.Element => {
  const [whaleDropdownOpen, setWhaleDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const mainLinks = [
    { to: "/news", text: "News" },
    { to: "/altcoin-season-index", text: "Altcoin Index" },
    { to: "/sentiment-trend", text: "Sentiment" },
  ];

  const whaleLinks = [
    { to: "/whale-transactions", text: "Whale Transactions" },
    { to: "/wallet-holdings", text: "Wallet Holdings" },
  ];

  // Check if current path is a whale-related page
  const isWhaleActive = whaleLinks.some(
    (link) => location.pathname === link.to
  );

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setWhaleDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdown when route changes
  useEffect(() => {
    setWhaleDropdownOpen(false);
  }, [location.pathname]);

  if (mobile) {
    return (
      <>
        {mainLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            onClick={onClose}
          >
            {link.text}
          </Link>
        ))}

        {/* Whale Watch Dropdown for Mobile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setWhaleDropdownOpen(!whaleDropdownOpen)}
            className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors duration-200 ${
              isWhaleActive
                ? "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <span>Whale Watch</span>
            <span className="text-xs ml-1">
              {whaleDropdownOpen ? "▲" : "▼"}
            </span>
          </button>

          <div
            className={`pl-4 mt-1 space-y-1 overflow-hidden transition-all duration-200 ease-in-out ${
              whaleDropdownOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            {whaleLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`block px-4 py-2 rounded-lg transition-colors duration-200 ${
                  location.pathname === link.to
                    ? "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                onClick={onClose}
              >
                {link.text}
              </Link>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {mainLinks.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className={`text-gray-500 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 transition-colors duration-200 relative group ${
            location.pathname === link.to
              ? "text-teal-500 dark:text-teal-400"
              : ""
          }`}
        >
          {link.text}
          <span
            className={`absolute bottom-0 left-0 h-0.5 bg-teal-500 transition-all duration-300 ${
              location.pathname === link.to
                ? "w-full"
                : "w-0 group-hover:w-full"
            }`}
          ></span>
        </Link>
      ))}

      {/* Whale Watch Dropdown for Desktop */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setWhaleDropdownOpen(!whaleDropdownOpen)}
          className={`transition-colors duration-200 relative group ${
            isWhaleActive
              ? "text-teal-500 dark:text-teal-400"
              : "text-gray-500 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400"
          }`}
          aria-expanded={whaleDropdownOpen}
          aria-haspopup="true"
        >
          Whale Watch
          <span
            className={`absolute bottom-0 left-0 h-0.5 bg-teal-500 transition-all duration-300 ${
              isWhaleActive ? "w-full" : "w-0 group-hover:w-full"
            }`}
          ></span>
        </button>

        <div
          className={`absolute left-0 mt-2 w-56 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-200 ease-in-out origin-top-left ${
            whaleDropdownOpen
              ? "transform scale-100 opacity-100"
              : "transform scale-95 opacity-0 pointer-events-none"
          }`}
        >
          {whaleLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                location.pathname === link.to
                  ? "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={onClose}
            >
              {link.text}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default NavLinks;
