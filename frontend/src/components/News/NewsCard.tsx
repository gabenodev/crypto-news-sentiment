"use client";
import React from "react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchNews } from "../../utils/API/newsAPI";
import type { NewsArticle } from "../../types";
import type { JSX } from "react/jsx-runtime";

function NewsCard(): JSX.Element {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortOption, setSortOption] = useState<"relevance" | "date">("date");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getNews = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        const fetchedNews = await fetchNews();
        setNews(fetchedNews);
      } catch (error) {
        setError("Failed to load news. Please try again later.");
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    getNews();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2 mb-8"></div>
            <div className="flex gap-4 mb-8">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-48"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                >
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-md p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-center">
          <div className="text-red-500 dark:text-red-400 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-md p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            No Crypto News Found
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We couldn't find any crypto news articles matching your criteria.
          </p>
          <button
            onClick={() => setSearchTerm("")}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
          >
            Reset Search
          </button>
        </div>
      </div>
    );
  }

  const filteredNews = news.filter((article) =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedNews = filteredNews.sort((a, b) => {
    if (sortOption === "relevance") {
      return (
        (b.title.toLowerCase().includes(searchTerm.toLowerCase()) ? 1 : 0) -
        (a.title.toLowerCase().includes(searchTerm.toLowerCase()) ? 1 : 0)
      );
    } else if (sortOption === "date") {
      return (
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
          Crypto News
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Stay updated with the latest cryptocurrency news
        </p>

        {/* Search and Sort */}
        <div className="flex flex-col md:flex-row items-center mb-8 gap-4">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search crypto news..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <div className="relative">
              <select
                className="appearance-none w-full pl-3 pr-8 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={sortOption}
                onChange={(e) =>
                  setSortOption(e.target.value as "relevance" | "date")
                }
              >
                <option value="date">Newest First</option>
                <option value="relevance">Most Relevant</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Showing {sortedNews.length}{" "}
          {sortedNews.length === 1 ? "result" : "results"}
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedNews.map((article, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-dark-secondary rounded-xl shadow-md hover:shadow-xl overflow-hidden transition-shadow duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{
                duration: 0.4,
                delay: index * 0.1,
                ease: "easeInOut",
              }}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.2, ease: "easeInOut" },
              }}
            >
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={
                    article.urlToImage ||
                    `https://picsum.photos/600/400?random=${index}`
                  }
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://picsum.photos/600/400?random=${index}`;
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  {article.source?.name && (
                    <span className="text-xs font-medium text-white bg-black/30 px-2 py-1 rounded">
                      {article.source.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {article.publishedAt && (
                    <span className="flex items-center">
                      <svg
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text-primary mb-3 line-clamp-2">
                  {article.title}
                </h2>
                <p className="text-gray-600 dark:text-dark-text-secondary mb-4 line-clamp-3">
                  {article.description}
                </p>

                <div className="flex justify-between items-center">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition duration-200 font-medium"
                  >
                    Read full story
                    <svg
                      className="h-4 w-4 ml-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </a>

                  {article.author && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[100px]">
                      by {article.author}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NewsCard;
