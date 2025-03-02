// src/App.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "./components/Header";
import SentimentChart from "./components/SentimentChart";
import NewsCard from "./components/NewsCard";
import Footer from "./components/Footer";

function App() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const getNews = async () => {
    try {
      const response = await axios.get(
        `https://newsapi.org/v2/everything?q=crypto&apiKey=b4aeb5d2f71d497a8140ed67aed1037c`
      );
      if (response.data.articles) {
        setNews(response.data.articles);
      } else {
        setNews([]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching news:", error);
      setNews([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    getNews();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-500">
        <div className="text-white text-2xl animate-pulse">Loading news...</div>
      </div>
    );

  return (
    <div className="App bg-gray-100 min-h-screen">
      <Header />

      <SentimentChart />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {news.length === 0 ? (
          <p className="text-center text-xl text-gray-600">No news found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((article, index) => (
              <NewsCard key={index} article={article} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
