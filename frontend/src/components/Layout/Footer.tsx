import type React from "react"
import { useLocation } from "react-router-dom"

const Footer: React.FC = () => {
  const location = useLocation()

  // Verificăm dacă suntem pe o pagină de wallet holdings și ascundem footer-ul
  if (location.pathname.includes("/wallet-holdings/")) {
    return null
  }

  return (
    <footer className="bg-dark-primary text-white py-3 text-center w-full z-10 relative border-t border-gray-700">
      <p className="text-sm">&copy; 2025 Crypto Sentiment. All rights reserved.</p>
    </footer>
  )
}

export default Footer
