import React, { useEffect, useState } from "react";

function Homepage() {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Funcție pentru a obține datele de la API-ul de pe Vercel
    const fetchCryptoData = async () => {
      try {
        // URL-ul corect de pe Vercel
        const response = await fetch(
          "https://sentimentx-backend.vercel.app/api/cryptos"
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json(); // Parsem datele ca JSON
        console.log("API Response:", data); // Verificăm datele

        setCryptoData(data); // Setăm datele corecte în state
        setLoading(false); // Oprim starea de încărcare
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false); // Oprirea stării de încărcare și tratarea erorilor
      }
    };

    fetchCryptoData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Top Cryptocurrencies</h1>
      <ul>
        {cryptoData &&
          Object.keys(cryptoData).map((key) => (
            <li key={key}>
              {key}: ${cryptoData[key]?.USD} {/* Afișăm prețurile */}
            </li>
          ))}
      </ul>
    </div>
  );
}

export default Homepage;
