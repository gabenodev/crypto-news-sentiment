import React, { useState } from "react";
import Header from "./components/Layout/Header";
import SentimentChart from "./components/Sentiment_Trend/SentimentChart";
import NewsCard from "./components/News/NewsCard";
import AltcoinSeason from "./components/Altcoin_Season/AltcoinSeason";
import WhaleTransactions from "./components/Whale_Transactions/WhaleTransactions"; // Importă componenta WhaleTransactions
import Footer from "./components/Layout/Footer";

function App() {
  const [activeTab, setActiveTab] = useState("news");

  return (
    <div className="App bg-gray-100 min-h-screen flex flex-col">
      <Header setActiveTab={setActiveTab} />
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {/* Condiții pentru a afisa tab-urile corecte */}
          {activeTab === "sentiment" && <SentimentChart />}
          {activeTab === "altcoin" && <AltcoinSeason />}
          {activeTab === "news" && <NewsCard />}
          {activeTab === "whaleTransactions" && <WhaleTransactions />}{" "}
          {/* Aici adăugăm tab-ul pentru WhaleTransactions */}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
