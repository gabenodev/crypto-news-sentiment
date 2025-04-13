import React from "react";
import { Link } from "react-router-dom";

const Logo = () => (
  <Link to="/" className="flex items-center space-x-2 group">
    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-teal-500 to-green-500 flex items-center justify-center transition-transform duration-300 group-hover:rotate-12">
      <span className="text-white font-bold text-xl">SX</span>
    </div>
    <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-green-500 bg-clip-text text-transparent">
      SentimentX
    </span>
  </Link>
);

export default Logo;
