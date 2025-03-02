import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Înregistrăm componentele Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const sentimentData = {
    labels: ["1h", "4h", "12h", "24h", "7d"], // Etichete pentru intervalele de timp
    datasets: [
      {
        label: "Sentiment Trend",
        data: [70, 65, 60, 55, 50], // Exemplu de valori de sentiment (poți să le actualizezi cu date reale)
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

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
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-green-400">
            Crypto News and Sentiment Analysis
          </h1>
        </div>
      </header>

      {/* Sentiment Chart Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-semibold text-gray-800">
          Market Sentiment
        </h2>
        <div className="mt-6">
          <Line data={sentimentData} />
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {news.length === 0 ? (
          <p className="text-center text-xl text-gray-600">No news found.</p>
        ) : (
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
                  className="mt-4 inline-block text-blue-600 hover:text-blue-800 transition duration-200"
                >
                  Read more
                </a>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-8 text-center">
        <p className="text-lg">
          &copy; 2025 Crypto Sentiment. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default App;
