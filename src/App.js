import React, { useState } from "react";
import Header from "./components/Header";
import SentimentChart from "./components/SentimentChart";
import NewsCard from "./components/NewsCard";
import AltcoinSeason from "./components/AltcoinSeason";
import Footer from "./components/Footer";

function App() {
  const [activeTab, setActiveTab] = useState("news");

  return (
    <div className="App bg-gray-100 min-h-screen flex flex-col">
      <Header setActiveTab={setActiveTab} />{" "}
      {/* Conținutul crește pentru a umple spațiul disponibil */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {activeTab === "sentiment" && <SentimentChart />}
          {activeTab === "altcoin" && <AltcoinSeason />}
          {activeTab === "news" && <NewsCard />}
        </div>
      </main>
      {/* Footer-ul rămâne jos */}
      <Footer />
    </div>
  );
}

export default App;
