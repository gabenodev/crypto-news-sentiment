// src/components/NewsCard.js
import React, { useEffect, useState } from "react";
import axios from "axios";

function NewsCard() {
  const [news, setNews] = useState([]); // State pentru știri
  const [loading, setLoading] = useState(true); // State pentru încărcare

  // Funcția pentru obținerea știrilor
  const getNews = async () => {
    try {
      const response = await axios.get(
        `https://newsapi.org/v2/everything?q=crypto&apiKey=b4aeb5d2f71d497a8140ed67aed1037c`
      );
      if (response.data.articles) {
        setNews(response.data.articles); // Setează știrile în state
      } else {
        setNews([]); // Dacă nu sunt știri, setează un array gol
      }
      setLoading(false); // Setează încărcarea ca falsă
    } catch (error) {
      console.error("Error fetching news:", error);
      setNews([]); // În caz de eroare, setează știrile la un array gol
      setLoading(false); // Setează încărcarea ca falsă
    }
  };

  // Folosim useEffect pentru a obține datele când componenta se montează
  useEffect(() => {
    getNews(); // Apelează funcția pentru a obține știrile
  }, []); // Array gol înseamnă că se va apela doar o singură dată, când componenta este montată

  // Dacă încă încarcă știrile
  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-500">
        <div className="text-white text-2xl animate-pulse">Loading news...</div>
      </div>
    );

  // Dacă nu sunt știri
  if (news.length === 0)
    return <p className="text-center text-xl text-gray-600">No news found.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {news.map((article, index) => (
        <div
          key={index}
          className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all ease-in-out transform hover:scale-105"
        >
          <h2 className="text-2xl font-semibold text-gray-800">
            {article.title}
          </h2>
          <p className="mt-3 text-gray-600">{article.description}</p>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800 transition duration-200 dark:text-black dark:hover:text-blue-400"
          >
            Read more
          </a>
        </div>
      ))}
    </div>
  );
}

export default NewsCard;
