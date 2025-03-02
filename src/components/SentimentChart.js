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
    labels: [], // Etichete pentru axa X
    datasets: [
      {
        label: "Sentiment Trend (Fear & Greed Index)",
        data: [], // Datele pentru axa Y
        fill: false, // Linia nu va fi umplută
        borderColor: "rgb(75, 192, 192)", // Culoare linie
        tension: 0.1, // Liniile vor fi mai puțin ondulate
      },
    ],
  });

  const fetchSentimentData = async () => {
    try {
      const response = await axios.get(
        "https://api.alternative.me/fng/?limit=365&format=json" // URL-ul pentru Fear and Greed Index pe 1 an
      );

      const sentimentScores = response.data.data.map((item) => item.value); // Valorile sentimentului
      const sentimentTimestamps = response.data.data.map(
        (item) => item.timestamp
      ); // Timestamp-urile

      // Formatarea timestamp-urilor
      const formattedTimestamps = sentimentTimestamps.map(
        (timestamp) => format(new Date(timestamp * 1000), "MMM dd, yyyy") // Formatarea timestamp-urilor
      );

      // Inversăm ordinea datelor pentru a avea cea mai recentă dată în dreapta
      const reversedTimestamps = formattedTimestamps.reverse();
      const reversedScores = sentimentScores.reverse();

      setSentimentData({
        labels: reversedTimestamps, // Folosim timestamp-urile inversate pe axa X
        datasets: [
          {
            label: "Sentiment Trend (Fear & Greed Index)",
            data: reversedScores, // Valorile de sentiment inversate pe axa Y
            fill: false,
            borderColor: "rgb(75, 192, 192)", // Culoare linie
            tension: 0.1, // Liniile vor fi mai puțin ondulate
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching sentiment data:", error);
    }
  };

  useEffect(() => {
    fetchSentimentData();
  }, []);

  // Configurarea opțiunilor pentru grafic
  const options = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: "Date", // Eticheta axei X
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10, // Limităm numărul de etichete pe axa X
          maxRotation: 45, // Permitem rotirea etichetelor pentru a economisi spațiu
          minRotation: 0, // Prevenim rotirea etichetelor pe axa X
          autoSkipPadding: 10, // Adăugăm un padding pentru a preveni suprapunerea
        },
        // Setăm axa X să fie inversată astfel încât să avem ordinea corectă
        reverse: false, // Axa X trebuie să fie de la dreapta la stânga
      },
      y: {
        title: {
          display: true,
          text: "Fear and Greed Index",
        },
        ticks: {
          min: 0,
          max: 100,
          stepSize: 10,
        },
      },
    },
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-3xl font-semibold text-gray-800">
        Market Sentiment (Fear and Greed Index)
      </h2>
      <div className="mt-6">
        <Line data={sentimentData} options={options} />
      </div>
    </section>
  );
}

export default SentimentChart;
