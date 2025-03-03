// src/App.js
import React from "react";
import Header from "./components/Header";
import SentimentChart from "./components/SentimentChart"; // SentimentChart rămâne aici
import NewsCard from "./components/NewsCard"; // Importăm NewsCard pentru a-l folosi
import AltcoinSeason from "./components/AltcoinSeason";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="App bg-gray-100 min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {" "}
          {/* Adăugăm spațiere uniformă între componente */}
          <SentimentChart />
          <AltcoinSeason />
          <NewsCard />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
