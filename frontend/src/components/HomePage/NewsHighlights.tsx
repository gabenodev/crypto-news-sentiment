"use client";
import React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fetchNews } from "../../utils/API/newsAPI";
import type { NewsArticle } from "../../types";

const NewsHighlights = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getNews = async () => {
      try {
        setLoading(true);
        const newsData = await fetchNews();
        setNews(newsData.slice(0, 3)); // Doar primele 3 știri
        setLoading(false);
      } catch (error) {
        console.error("Error fetching news:", error);
        setError("Failed to load news");
        setLoading(false);
      }
    };

    getNews();
  }, []);

  if (loading) {
    return (
      <div className="bg-white/95 dark:bg-dark-secondary/95 rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 p-5 h-full">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-xl font-bold">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-500">
              Latest News
            </span>
          </h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex space-x-4">
                <div className="rounded-xl bg-gray-200 dark:bg-gray-700 h-24 w-24"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || news.length === 0) {
    // Fallback data in case of error or empty response
    const fallbackNews = [
      {
        title: "Bitcoin Surges Past $60,000 as Institutional Interest Grows",
        description:
          "Bitcoin has reached new heights as major financial institutions continue to show interest in cryptocurrency investments.",
        url: "#",
        urlToImage: "https://picsum.photos/600/400?random=1",
        publishedAt: new Date().toISOString(),
        source: { name: "Crypto News" },
      },
      {
        title: "Ethereum 2.0 Upgrade: What You Need to Know",
        description:
          "The long-awaited Ethereum 2.0 upgrade is approaching. Here's what it means for investors and the future of DeFi.",
        url: "#",
        urlToImage: "https://picsum.photos/600/400?random=2",
        publishedAt: new Date().toISOString(),
        source: { name: "DeFi Daily" },
      },
      {
        title:
          "Regulatory Developments: New Crypto Frameworks Emerging Globally",
        description:
          "Countries around the world are developing new regulatory frameworks for cryptocurrencies and digital assets.",
        url: "#",
        urlToImage: "https://picsum.photos/600/400?random=3",
        publishedAt: new Date().toISOString(),
        source: { name: "Blockchain Report" },
      },
    ];

    setNews(fallbackNews as NewsArticle[]);
  }

  return (
    <div className="bg-white/95 dark:bg-dark-secondary/95 rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 p-5 h-full">
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200/50 dark:border-gray-700/50">
        <h3 className="text-xl font-bold">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-500">
            Latest News
          </span>
        </h3>
        <a
          href="/news"
          className="text-sm font-medium text-teal-500 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300"
        >
          View all
        </a>
      </div>

      <div className="space-y-4">
        {news.map((article, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group"
          >
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex space-x-4 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50 p-2 rounded-xl transition-colors"
            >
              <div className="rounded-xl overflow-hidden w-24 h-24 flex-shrink-0">
                <img
                  src={
                    article.urlToImage ||
                    `https://picsum.photos/600/400?random=${index}`
                  }
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://picsum.photos/600/400?random=${index}`;
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-1 line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {article.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-1">
                  {article.description}
                </p>
                <div className="flex items-center text-xs text-gray-400 dark:text-gray-500">
                  <span className="mr-2">{article.source?.name}</span>
                  <span>
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default NewsHighlights;
