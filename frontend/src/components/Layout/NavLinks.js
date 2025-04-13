import React from "react";
import { Link } from "react-router-dom";

const NavLinks = ({ mobile = false, onClose = () => {} }) => {
  const links = [
    { to: "/news", text: "News" },
    { to: "/altcoin-season-index", text: "Altcoin Index" },
    { to: "/sentiment-trend", text: "Sentiment" },
    { to: "/whale-transactions", text: "Whale Watch" },
  ];

  return links.map((link) =>
    mobile ? (
      <Link
        key={link.to}
        to={link.to}
        className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
        onClick={onClose}
      >
        {link.text}
      </Link>
    ) : (
      <Link
        key={link.to}
        to={link.to}
        className="text-gray-500 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 transition-colors duration-200 relative group"
      >
        {link.text}
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-500 transition-all duration-300 group-hover:w-full"></span>
      </Link>
    )
  );
};

export default NavLinks;
