// src/components/SentimentChart.js
import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
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
import { format } from "date-fns";

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

function SentimentChart() {
  const [sentimentData, setSentimentData] = useState({
    labels: [],
    datasets: [],
  });
  const [timeframe, setTimeframe] = useState("365"); // Default la 1 an (365 zile)

  // Fetch data în funcție de intervalul de timp selectat
  const fetchSentimentData = async (limit) => {
    try {
      let url = "";
      // Verificăm dacă vrem să luăm datele pentru întreaga perioadă
      if (limit === "max") {
        // API-ul nu acceptă o valoare directă de "max", deci folosim 2000
        url = "https://api.alternative.me/fng/?limit=2000&format=json";
      } else {
        url = `https://api.alternative.me/fng/?limit=${limit}&format=json`;
      }

      const response = await axios.get(url);

      const sentimentScores = response.data.data.map((item) =>
        parseInt(item.value)
      );
      const sentimentTimestamps = response.data.data.map((item) =>
        format(new Date(item.timestamp * 1000), "MMM dd, yyyy")
      );

      // Inversăm datele pentru a avea cea mai recentă dată în dreapta
      const reversedTimestamps = sentimentTimestamps.reverse();
      const reversedScores = sentimentScores.reverse();

      setSentimentData({
        labels: reversedTimestamps,
        datasets: [
          {
            label: "Sentiment Trend (Fear & Greed Index)",
            data: reversedScores,
            fill: false,
            borderColor: "#23d996", // Culoare linie turcoaz
            backgroundColor: "#23d996", // Culoare linie turcoaz
            tension: 0.1,
            pointBackgroundColor: "#23d996", // Culoare puncte turcoaz
            pointBorderColor: "#23d996", // Culoare puncte turcoaz
            pointRadius: 3, // Puncte mai mici
            pointHoverRadius: 4, // Puncte la hover
            borderWidth: 2, // Grosimea liniei
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching sentiment data:", error);
    }
  };

  useEffect(() => {
    fetchSentimentData(timeframe); // Fetch data când se schimbă intervalul de timp
  }, [timeframe]);

  const handleTimeframeChange = (e) => {
    setTimeframe(e.target.value);
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        title: { display: true, text: "Date" },
        ticks: { autoSkip: true, maxTicksLimit: 10, maxRotation: 45 },
      },
      y: {
        title: { display: true, text: "Fear and Greed Index" },
        ticks: { min: 0, max: 100, stepSize: 10 },
      },
    },
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-3xl font-semibold text-gray-800">
        Market Sentiment (Fear and Greed Index)
      </h2>
      <div className="mt-6">
        {/* Dropdown pentru alegerea intervalului de timp */}
        <select
          value={timeframe}
          onChange={handleTimeframeChange}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md appearance-none"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="365">Last 1 Year</option>
          <option value="max">All Time</option>{" "}
          {/* Noua opțiune pentru toată perioada */}
        </select>
      </div>
      <div className="mt-6">
        <Line data={sentimentData} options={options} />
      </div>
    </section>
  );
}

export default SentimentChart;
