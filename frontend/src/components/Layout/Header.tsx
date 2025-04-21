"use client";
import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../Layout/Logo";
import NavLinks from "../Layout/NavLinks";
import SearchBar from "../Layout/SearchBar";
import UserControls from "../Layout/UserControls";
import MobileMenu from "../Layout/MobileMenu";

function Header(): JSX.Element {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  return (
    <header className="bg-white dark:bg-dark-primary text-gray-900 dark:text-dark-text-primary shadow-sm w-full sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
      <div className="w-full px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <button
              className="lg:hidden text-gray-500 dark:text-dark-text-secondary hover:text-accent-secondary dark:hover:text-accent-secondary"
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
            <Logo />
          </div>

          {/* Navigation - Hidden on mobile */}
          <nav className="hidden lg:flex space-x-6 text-sm font-medium">
            <NavLinks />
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <SearchBar navigate={navigate} />
            <UserControls />
          </div>
        </div>

        {/* Mobile Menu */}
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          navigate={navigate}
        />
      </div>
    </header>
  );
}

export default Header;
