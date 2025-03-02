// src/App.js
import React from "react";
import Header from "./components/Header";
import SentimentChart from "./components/SentimentChart"; // SentimentChart rămâne aici
import NewsCard from "./components/NewsCard"; // Importăm NewsCard pentru a-l folosi
import Footer from "./components/Footer";

function App() {
  return (
    <div className="App bg-gray-100 min-h-screen">
      <Header />
      <SentimentChart /> {/* SentimentChart rămâne acolo */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Aici doar includem NewsCard */}
        <NewsCard />
      </main>
      <Footer />
    </div>
  );
}

export default App;
