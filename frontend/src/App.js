import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Layout/Header";
import SentimentChart from "./components/Sentiment_Trend/SentimentChart";
import NewsCard from "./components/News/NewsCard";
import AltcoinSeason from "./components/Altcoin_Season/AltcoinSeason";
import WhaleTransactions from "./components/Whale_Transactions/WhaleTransactions";
import Footer from "./components/Layout/Footer";
import Homepage from "./components/HomePage/HomePage";

function App() {
  return (
    <Router>
      {/* Background diferit pentru light și dark mode */}
      <div className="App bg-gray-50 dark:bg-gradient-to-r from-gray-900 to-gray-800 min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-12">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/sentiment-trend" element={<SentimentChart />} />
            <Route path="/news" element={<NewsCard />} />
            <Route path="/altcoin-season-index" element={<AltcoinSeason />} />
            <Route path="/whale-transactions" element={<WhaleTransactions />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
