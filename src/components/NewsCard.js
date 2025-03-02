// src/components/NewsCard.js
import React from "react";

function NewsCard({ article }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all ease-in-out transform hover:scale-105">
      <h2 className="text-2xl font-semibold text-gray-800">{article.title}</h2>
      <p className="mt-3 text-gray-600">{article.description}</p>
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block text-blue-600 hover:text-blue-800 transition duration-200"
      >
        Read more
      </a>
    </div>
  );
}

export default NewsCard;
