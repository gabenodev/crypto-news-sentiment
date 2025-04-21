import axios from "axios"

export const fetchNews = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`https://sentimentxv2-project.vercel.app/api/news`)

    if (Array.isArray(response.data.articles)) {
      return response.data.articles
    } else {
      throw new Error("Unexpected data format received from server")
    }
  } catch (error) {
    console.error("Error fetching news:", error)
    throw new Error("Failed to load news. Please try again later.")
  }
}
