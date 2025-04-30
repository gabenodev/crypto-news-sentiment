"use client"
import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import WalletDashboard from "../components/whaleWatchHoldings/WalletDashboard"

const WalletDetailsPage = () => {
  const { address = "" } = useParams<{ address: string }>()
  const navigate = useNavigate()

  // Redirect to the dashboard component
  useEffect(() => {
    if (address) {
      // This is just a wrapper component that renders the dashboard
      // All the functionality is in the WalletDashboard component
    } else {
      navigate("/wallet-holdings")
    }
  }, [address, navigate])

  return <WalletDashboard />
}

export default WalletDetailsPage
