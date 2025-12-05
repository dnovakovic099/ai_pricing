import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMarketAnalysis } from '../services/api'
import './MarketAnalysis.css'

function MarketAnalysis() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedListing, setExpandedListing] = useState(null)
  const [expandedChunk, setExpandedChunk] = useState({})
  const [availableDates, setAvailableDates] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData(date = null) {
    try {
      setLoading(true)
      const response = await getMarketAnalysis(date)
      setData(response)
      setAvailableDates(response.availableDates || [])
      if (response.selectedDate) setSelectedDate(response.selectedDate)
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (e) => {
    const newDate = e.target.value
    setSelectedDate(newDate)
    fetchData(newDate)
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  function formatFullDate(dateStr) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  function formatCurrency(val) {
    if (!val && val !== 0) return '—'
    return `$${val.toLocaleString()}`
  }

  function formatDateTime(dateStr) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  function toggleListing(listingId) {
    // Reset expanded chunks when changing listings to prevent stale AI recommendation display
    if (expandedListing !== listingId) {
      setExpandedChunk({})
    }
    setExpandedListing(expandedListing === listingId ? null : listingId)
  }

  function toggleChunk(listingId, chunkId) {
    const key = `${listingId}-${chunkId}`
    setExpandedChunk(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  function getPricePosition(userPrice, low, high) {
    if (!userPrice || !low || !high || low === high) return 50
    return Math.min(100, Math.max(0, ((userPrice - low) / (high - low)) * 100))
  }

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loader" />
        <p>Loading market analysis data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-state">
        <div className="error-icon">⚠️</div>
        <h3>Failed to load</h3>
        <p>{error}</p>
        <button className="btn btn-secondary" onClick={fetchData}>Retry</button>
      </div>
    )
  }

  return (
    <div className="market-analysis-page">
      {/* Header */}
      <header className="page-header">
        <div>
          <h1>📊 Market Analysis Reports</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '8px' }}>
            <p className="subtitle" style={{ margin: 0 }}>
              Nightly scraped competitor data • Last run: {formatDateTime(data?.lastRun)}
            </p>
            {availableDates.length > 0 && (
              <div className="date-selector" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: '#8b949e' }}>View Date:</label>
                <select 
                  value={selectedDate || ''} 
                  onChange={handleDateChange}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid #30363d',
                    background: '#0d1117',
                    color: '#c9d1d9',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  {availableDates.map(date => (
                    <option key={date} value={date}>{formatDate(date)}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
        <Link to="/" className="btn btn-secondary">← Back to Overview</Link>
      </header>

      {/* Summary Stats */}
      <div className="summary-bar">
        <div className="summary-stat">
          <span className="stat-value">{data?.totalListings || 0}</span>
          <span className="stat-label">Listings</span>
        </div>
        <div className="summary-stat">
          <span className="stat-value">{data?.totalChunks || 0}</span>
          <span className="stat-label">Date Chunks</span>
        </div>
        <div className="summary-stat">
          <span className="stat-value">{data?.totalCompetitors || 0}</span>
          <span className="stat-label">Competitors Found</span>
        </div>
        <div className="summary-stat">
          <span className="stat-value">{data?.totalAISuggestions || 0}</span>
          <span className="stat-label">AI Recommendations</span>
        </div>
      </div>

      {/* Listings Table */}
      <div className="listings-table-container">
        <table className="listings-table">
          <thead>
            <tr>
              <th className="col-expand"></th>
              <th className="col-listing">Listing</th>
              <th className="col-location">Location</th>
              <th className="col-beds">Beds</th>
              <th className="col-chunks">Chunks</th>
              <th className="col-competitors">Competitors</th>
              <th className="col-price-range">Price Range (Market)</th>
              <th className="col-ai">AI Tips</th>
              <th className="col-updated">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {data?.listings?.map((listing) => (
              <>
                {/* Listing Row */}
                <tr 
                  key={listing.id} 
                  className={`listing-row ${expandedListing === listing.id ? 'expanded' : ''}`}
                  onClick={() => toggleListing(listing.id)}
                >
                  <td className="col-expand">
                    <span className={`expand-arrow ${expandedListing === listing.id ? 'open' : ''}`}>
                      ▶
                    </span>
                  </td>
                  <td className="col-listing">
                    <div className="listing-cell">
                      {listing.imageUrl && (
                        <img src={listing.imageUrl} alt="" className="listing-thumb" />
                      )}
                      <span className="listing-title">{listing.title}</span>
                    </div>
                  </td>
                  <td className="col-location">{listing.location || '—'}</td>
                  <td className="col-beds">{listing.bedrooms}</td>
                  <td className="col-chunks">
                    <span className="badge">{listing.chunkCount}</span>
                  </td>
                  <td className="col-competitors">
                    <span className="badge accent">{listing.totalCompetitors}</span>
                  </td>
                  <td className="col-price-range">
                    <div className="price-range-display">
                      <span className="price low">{formatCurrency(listing.overallLowest)}</span>
                      <span className="price-sep">—</span>
                      <span className="price high">{formatCurrency(listing.overallHighest)}</span>
                    </div>
                    <div className="price-avg">
                      Avg: {formatCurrency(listing.overallAverage)}
                    </div>
                  </td>
                  <td className="col-ai">
                    <span className="badge purple">{listing.aiSuggestionCount}</span>
                  </td>
                  <td className="col-updated">{formatDateTime(listing.lastUpdated)}</td>
                </tr>

                {/* Expanded Chunks */}
                {expandedListing === listing.id && (
                  <tr className="chunks-row">
                    <td colSpan="9">
                      <div className="chunks-container">
                        {/* ADR Section - Only show if Hostify data exists */}
                        {listing.adrSource === 'hostify' && listing.overallADR && (
                          <div className="adr-section">
                            <div className="adr-header">
                              <h4>💰 Average Daily Rate (ADR)</h4>
                              <span className="adr-source">
                                from PMS bookings • {listing.reservationCount} reservations
                              </span>
                            </div>
                            
                            <div className="adr-stats">
                              <div className="adr-overall">
                                <span className="adr-label">Overall ADR</span>
                                <span className="adr-value">{formatCurrency(listing.overallADR)}</span>
                                <span className="adr-sublabel">{listing.bookedNightsCount} booked nights</span>
                              </div>
                              
                              {listing.weekdayADR && (
                                <div className="weekday-adr-grid">
                                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                                    const fullDay = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][idx];
                                    const adr = listing.weekdayADR[fullDay];
                                    const isWeekend = day === 'Fri' || day === 'Sat';
                                    return (
                                      <div key={day} className={`weekday-adr-card ${isWeekend ? 'weekend' : ''}`}>
                                        <span className="weekday-name">{day}</span>
                                        <span className="weekday-value">
                                          {adr !== null ? formatCurrency(adr) : '—'}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="chunks-header">
                          <h4>📅 Date Chunks ({listing.chunks?.length || 0})</h4>
                          <p>Each chunk represents available dates with competitor pricing</p>
                        </div>
                        
                        <table className="chunks-table">
                          <thead>
                            <tr>
                              <th></th>
                              <th>Check-in</th>
                              <th>Check-out</th>
                              <th>Nights</th>
                              <th>Your Price</th>
                              <th>Lowest</th>
                              <th>Average</th>
                              <th>Highest</th>
                              <th>Competitors</th>
                              <th>AI Rec</th>
                              <th>Position</th>
                            </tr>
                          </thead>
                          <tbody>
                            {listing.chunks?.map((chunk) => (
                              <>
                                <tr 
                                  key={chunk.id}
                                  className={`chunk-row ${expandedChunk[`${listing.id}-${chunk.id}`] ? 'expanded' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleChunk(listing.id, chunk.id)
                                  }}
                                >
                                  <td>
                                    <span className={`expand-arrow small ${expandedChunk[`${listing.id}-${chunk.id}`] ? 'open' : ''}`}>
                                      ▶
                                    </span>
                                  </td>
                                  <td>
                                    <div className="date-cell">
                                      <span className="date-main">{formatDate(chunk.checkIn)}</span>
                                      <span className="date-day">{new Date(chunk.checkIn).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="date-cell">
                                      <span className="date-main">{formatDate(chunk.checkOut)}</span>
                                      <span className="date-day">{new Date(chunk.checkOut).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                    </div>
                                  </td>
                                  <td className="nights-cell">{chunk.nights}</td>
                                  <td className="price-cell user">
                                    {chunk.userPrice ? formatCurrency(chunk.userPrice) : '—'}
                                  </td>
                                  <td className="price-cell low">{formatCurrency(chunk.lowestPrice)}</td>
                                  <td className="price-cell avg">{formatCurrency(chunk.averagePrice)}</td>
                                  <td className="price-cell high">{formatCurrency(chunk.highestPrice)}</td>
                                  <td className="competitors-cell">
                                    <span className="comp-count">{chunk.competitorCount}</span>
                                  </td>
                                  <td className="price-cell ai">
                                    {chunk.aiRecommendation ? (
                                      <div className="ai-rec">
                                        <span className="ai-price">{formatCurrency(chunk.aiRecommendation.recommendedPrice)}</span>
                                      </div>
                                    ) : '—'}
                                  </td>
                                  <td className="position-cell">
                                    {chunk.userPrice && (
                                      <div className="position-bar">
                                        <div className="position-track">
                                          <div 
                                            className="position-marker"
                                            style={{ left: `${getPricePosition(chunk.userPrice, chunk.lowestPrice, chunk.highestPrice)}%` }}
                                          />
                                        </div>
                                        <span className={`position-label ${
                                          chunk.userPrice < chunk.averagePrice ? 'below' : 
                                          chunk.userPrice > chunk.averagePrice ? 'above' : 'at'
                                        }`}>
                                          {chunk.userPrice < chunk.averagePrice ? 'Below Avg' : 
                                           chunk.userPrice > chunk.averagePrice ? 'Above Avg' : 'At Avg'}
                                        </span>
                                      </div>
                                    )}
                                  </td>
                                </tr>

                                {/* Expanded Competitors */}
                                {expandedChunk[`${listing.id}-${chunk.id}`] && chunk.competitors && (
                                  <tr className="competitors-row">
                                    <td colSpan="11">
                                      <div className="competitors-container">
                                        <div className="competitors-grid">
                                          {chunk.competitors.map((comp, idx) => (
                                            <div key={comp.id || idx} className="competitor-card">
                                              {comp.imageUrl && (
                                                <img src={comp.imageUrl} alt="" className="comp-image" />
                                              )}
                                              <div className="comp-info">
                                                <div className="comp-title">{comp.title}</div>
                                                <div className="comp-details">
                                                  <span className="comp-beds">🛏️ {comp.bedrooms} bed</span>
                                                  <span className="comp-price">{formatCurrency(comp.price)}</span>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                        
                                        {chunk.aiRecommendation?.reasoning && (
                                          <div className="ai-reasoning-box">
                                            <h5>🤖 AI Reasoning</h5>
                                            <p>{chunk.aiRecommendation.reasoning}</p>
                                            <div className="ai-range">
                                              <span>Suggested Range: </span>
                                              <span className="range-low">{formatCurrency(chunk.aiRecommendation.lowPrice)}</span>
                                              <span> — </span>
                                              <span className="range-high">{formatCurrency(chunk.aiRecommendation.highPrice)}</span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {(!data?.listings || data.listings.length === 0) && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No market analysis data yet</h3>
          <p>Run "Sync Market Data" from the overview page to collect competitor pricing data.</p>
          <Link to="/" className="btn btn-primary">Go to Overview</Link>
        </div>
      )}
    </div>
  )
}

export default MarketAnalysis

