import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Header from "./components/Layout/Header"
import SentimentChart from "./components/sentimentTrend/SentimentChart"
import NewsCard from "./components/News/NewsCard"
import AltcoinSeason from "./components/altcoinSeason/AltcoinSeason"
import WhaleTransactions from "./components/whaleTransactions/WhaleTransactions"
import Footer from "./components/Layout/Footer"
import Homepage from "./pages/HomePage"
import CurrencyDetails from "./components/CurrencyDetails/CurrencyDetails"
import ScrollToTop from "./utils/ScrollToTop"
import WalletHoldingsPage from "./pages/WalletHoldingsPage"
import WalletDetailsPage from "./pages/WalletDetailsPage"

function App(): JSX.Element {
  return (
    <Router>
      <ScrollToTop />
      <div className="App bg-gray-50 dark:bg-dark-primary min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-12">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/sentiment-trend" element={<SentimentChart />} />
            <Route path="/news" element={<NewsCard />} />
            <Route path="/altcoin-season-index" element={<AltcoinSeason />} />
            <Route path="/whale-transactions" element={<WhaleTransactions />} />
            <Route path="/currencies/:coinId" element={<CurrencyDetails />} />
            <Route path="/wallet-holdings" element={<WalletHoldingsPage />} />
            <Route path="/wallet-holdings/:address" element={<WalletDetailsPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
