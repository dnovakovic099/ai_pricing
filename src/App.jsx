import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Overview from './pages/Overview'
import ListingDetail from './pages/ListingDetail'
import MarketAnalysis from './pages/MarketAnalysis'
import Errors from './pages/Errors'
import './App.css'

function App() {
  const location = useLocation()
  
  return (
    <div className="app">
      <header className="header">
        <div className="container header-content">
          <Link to="/" className="logo">
            <span className="logo-icon">📊</span>
            <span className="logo-text">Market Data</span>
          </Link>
          <nav className="nav">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
              Overview
            </Link>
            <Link to="/analysis" className={`nav-link ${location.pathname === '/analysis' ? 'active' : ''}`}>
              Market Analysis
            </Link>
            <Link to="/errors" className={`nav-link ${location.pathname === '/errors' ? 'active' : ''}`}>
              Data Quality
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="main">
        <div className="container">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/listing/:listingId" element={<ListingDetail />} />
            <Route path="/analysis" element={<MarketAnalysis />} />
            <Route path="/errors" element={<Errors />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default App
