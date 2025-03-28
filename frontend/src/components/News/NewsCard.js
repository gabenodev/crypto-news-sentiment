import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

function NewsCard() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("date");

  useEffect(() => {
    const getNews = async () => {
      try {
        const response = await axios.get(
          `https://sentimentx-backend.vercel.app/api/news`
        );

        if (Array.isArray(response.data)) {
          setNews(response.data);
          console.log("News array populated:", response.data);
        } else {
          setNews([]);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    getNews();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-40 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-gray-800 dark:to-gray-900 text-white rounded-lg shadow-2xl mx-4 p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-xl font-semibold animate-pulse">
            Fetching latest news...
          </div>
          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );

  if (news.length === 0) {
    return (
      <p className="text-center text-xl text-gray-600 dark:text-gray-300">
        No news found.
      </p>
    );
  }

  const filteredNews = news.filter((article) =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedNews = filteredNews.sort((a, b) => {
    if (sortOption === "relevance") {
      return (
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) -
        a.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else if (sortOption === "date") {
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    }
    return 0;
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center mb-6 gap-4">
        <input
          type="text"
          placeholder="Search news..."
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="date">Newest</option>
          <option value="relevance">Most Relevant</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedNews.map((article, index) => (
          <motion.div
            key={index}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{
              duration: 0.4, // Redusă durata pentru a face animația mai rapidă
              delay: index * 0.1,
              ease: "easeInOut", // Folosește easing uniform pentru o tranziție lină
            }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2, ease: "easeInOut" }, // Animație mai rapidă la hover
            }}
          >
            <img
              src={article.urlToImage || "https://picsum.photos/150"}
              alt={article.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
              onError={(e) => (e.target.src = "https://picsum.photos/150")}
            />

            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
              {article.title}
            </h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              {article.description}
            </p>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition duration-200"
            >
              Read more
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default NewsCard;
