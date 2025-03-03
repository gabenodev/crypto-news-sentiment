import React, { useEffect, useState } from "react";
import axios from "axios";

function NewsCard() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("relevance");

  useEffect(() => {
    const getNews = async () => {
      try {
        const response = await axios.get(
          `https://newsapi.org/v2/everything?q=crypto&apiKey=b4aeb5d2f71d497a8140ed67aed1037c`
        );
        setNews(response.data.articles || []);
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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-500">
        <div className="text-white text-2xl animate-pulse">Loading news...</div>
      </div>
    );

  if (news.length === 0)
    return <p className="text-center text-xl text-gray-600">No news found.</p>;

  // Filter news based on search term
  const filteredNews = news.filter((article) =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort filtered news
  const sortedNews = filteredNews.sort((a, b) => {
    if (sortOption === "relevance") {
      // Calculate relevance score based on search term match
      const aRelevance = a.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
        ? 1
        : 0;
      const bRelevance = b.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
        ? 1
        : 0;
      return bRelevance - aRelevance; // Sort by relevance (match first)
    } else if (sortOption === "date") {
      return new Date(b.publishedAt) - new Date(a.publishedAt); // Sort by date (newest first)
    }
    return 0;
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Search Bar and Filters */}
      <div className="flex items-center mb-6">
        <input
          type="text"
          placeholder="Search news..."
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="ml-4 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="relevance">Most Relevant</option>
          <option value="date">Newest</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedNews.map((article, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all ease-in-out transform hover:scale-105"
          >
            {/* Image with fallback */}
            <img
              src={article.urlToImage || "https://picsum.photos/150"} // New placeholder image
              alt={article.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
              onError={
                (e) => (e.target.src = "https://picsum.photos/150") // New fallback image
              }
            />

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
    </div>
  );
}

export default NewsCard;
