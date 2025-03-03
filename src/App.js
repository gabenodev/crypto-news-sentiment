import React, { useState } from "react";
import Header from "./components/Header";
import SentimentChart from "./components/SentimentChart";
import NewsCard from "./components/NewsCard";
import AltcoinSeason from "./components/AltcoinSeason";
import Footer from "./components/Footer";

function App() {
  const [activeTab, setActiveTab] = useState("news"); // Setăm tab-ul activ, default este "news"

  return (
    <div className="App bg-gray-100 min-h-screen">
      <Header setActiveTab={setActiveTab} />{" "}
      {/* Transmitere funcție setActiveTab către Header */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {/* Afișează componenta corespunzătoare bazat pe tab-ul activ */}
          {activeTab === "sentiment" && <SentimentChart />}
          {activeTab === "altcoin" && <AltcoinSeason />}
          {activeTab === "news" && <NewsCard />}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
