import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'
import { getListingAudit } from '../services/api'
import './ListingDetail.css'

function ListingDetail() {
  const { listingId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('chunks')
  const [expandedChunk, setExpandedChunk] = useState(null)
  const [expandedSuggestion, setExpandedSuggestion] = useState(null)

  useEffect(() => {
    // Reset all state when listing changes to prevent showing stale data
    setData(null)
    setExpandedChunk(null)
    setExpandedSuggestion(null)
    setError(null)
    fetchData()
  }, [listingId])

  async function fetchData() {
    try {
      setLoading(true)
      const response = await getListingAudit(listingId)
      setData(response)
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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

  function getDayOfWeek(dateStr) {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' })
  }

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loader" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-state">
        <div className="error-icon">⚠️</div>
        <h3>Failed to load</h3>
        <p>{error}</p>
        <Link to="/" className="btn btn-secondary">← Back</Link>
      </div>
    )
  }

  const { listing, data: listingData, counts } = data
  const hasData = counts.calendarDays > 0 || counts.analyses > 0

  // Chart data for market snapshots
  const snapshotChartData = listingData?.marketSnapshots?.map(s => ({
    date: formatDate(s.targetDate),
    ourPrice: s.ourPrice,
    min: s.competitorMin,
    avg: s.competitorAvg,
    max: s.competitorMax,
    booked: s.isBooked
  })) || []

  // Chart data for AI suggestions
  const suggestionsChartData = listingData?.aiSuggestions?.map(s => ({
    date: formatDate(s.date),
    recommended: s.recommendedPrice,
    low: s.lowPrice,
    high: s.highPrice,
    marketAvg: s.competitorAvg
  })) || []

  return (
    <div className="detail-page">
      {/* Back Link */}
      <Link to="/" className="back-link">← Back to listings</Link>

      {/* Listing Header */}
      <div className="listing-header">
        <div className="listing-info">
          <h1>{listing.title}</h1>
          <p className="location">{listing.location || 'No location'}</p>
          <div className="specs">
            <span>🛏️ {listing.bedrooms} bed</span>
            <span>👥 {listing.guests} guests</span>
          </div>
        </div>
        {listing.airbnbUrl && (
          <a href={listing.airbnbUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            View on Airbnb ↗
          </a>
        )}
      </div>

      {/* Stats Pills */}
      <div className="stats-pills">
        <div className="pill">
          <span className="pill-value">{counts.calendarDays}</span>
          <span className="pill-label">Days</span>
        </div>
        <div className="pill">
          <span className="pill-value">{counts.totalCompetitors}</span>
          <span className="pill-label">Competitors</span>
        </div>
        <div className="pill">
          <span className="pill-value">{counts.aiSuggestions}</span>
          <span className="pill-label">AI Tips</span>
        </div>
        <div className="pill">
          <span className="pill-value">{counts.marketSnapshots}</span>
          <span className="pill-label">Snapshots</span>
        </div>
        <div className="pill">
          <span className="pill-value">{counts.analyses}</span>
          <span className="pill-label">Chunks</span>
        </div>
      </div>

      {/* No Data State */}
      {!hasData && counts.aiSuggestions === 0 && (
        <div className="no-data-card">
          <div className="no-data-icon">📊</div>
          <h3>No market data yet</h3>
          <p>Run "Sync Market Data" from the overview page to fetch pricing data for this listing.</p>
          <Link to="/" className="btn btn-primary">Go to Overview</Link>
        </div>
      )}

      {/* Tabs */}
      {(hasData || counts.aiSuggestions > 0) && (
        <>
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'chunks' ? 'active' : ''}`}
              onClick={() => setActiveTab('chunks')}
            >
              📦 Chunks & Competitors
            </button>
            <button 
              className={`tab ${activeTab === 'snapshots' ? 'active' : ''}`}
              onClick={() => setActiveTab('snapshots')}
            >
              📸 Market Snapshots
            </button>
            <button 
              className={`tab ${activeTab === 'ai' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai')}
            >
              🤖 AI Recommendations
            </button>
            <button 
              className={`tab ${activeTab === 'calendar' ? 'active' : ''}`}
              onClick={() => setActiveTab('calendar')}
            >
              📅 Calendar
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            
            {/* CHUNKS & COMPETITORS TAB */}
            {activeTab === 'chunks' && (
              <div className="chunks-tab">
                <div className="section-header">
                  <h2>Price Analysis Chunks</h2>
                  <p className="section-desc">Each chunk represents a date range with scraped competitor data</p>
                </div>
                
                {listingData?.analyses?.length > 0 ? (
                  <div className="chunks-list">
                    {listingData.analyses.map((chunk, i) => (
                      <div key={chunk.id} className="chunk-card">
                        <div 
                          className="chunk-header"
                          onClick={() => setExpandedChunk(expandedChunk === i ? null : i)}
                        >
                          <div className="chunk-dates">
                            <span className="date-range">
                              {formatFullDate(chunk.checkIn)} → {formatFullDate(chunk.checkOut)}
                            </span>
                            <span className="nights-badge">{chunk.nights} nights</span>
                          </div>
                          
                          <div className="chunk-prices">
                            <div className="price-box low">
                              <span className="price-label">Low</span>
                              <span className="price-value">{formatCurrency(chunk.lowestPrice)}</span>
                            </div>
                            <div className="price-box avg">
                              <span className="price-label">Avg</span>
                              <span className="price-value">{formatCurrency(chunk.averagePrice)}</span>
                            </div>
                            <div className="price-box high">
                              <span className="price-label">High</span>
                              <span className="price-value">{formatCurrency(chunk.highestPrice)}</span>
                            </div>
                          </div>
                          
                          <div className="chunk-meta">
                            <span className="competitor-count">{chunk.competitorCount} competitors</span>
                            <span className={`expand-icon ${expandedChunk === i ? 'expanded' : ''}`}>▼</span>
                          </div>
                        </div>
                        
                        {expandedChunk === i && chunk.competitors && (
                          <div className="chunk-competitors">
                            <div className="competitors-header">
                              <h4>Competitor Listings</h4>
                            </div>
                            <div className="competitors-grid">
                              {chunk.competitors.map((comp, j) => (
                                <div key={comp.id || j} className="competitor-card">
                                  {comp.imageUrl && (
                                    <div className="competitor-image">
                                      <img src={comp.imageUrl} alt={comp.title} />
                                    </div>
                                  )}
                                  <div className="competitor-info">
                                    <h5 className="competitor-title">{comp.title}</h5>
                                    <div className="competitor-details">
                                      <span className="beds">🛏️ {comp.bedrooms} bed</span>
                                      <span className="comp-price">{formatCurrency(comp.price)}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-tab">No chunk data yet. Run a sync to fetch competitor prices.</div>
                )}
              </div>
            )}

            {/* MARKET SNAPSHOTS TAB */}
            {activeTab === 'snapshots' && (
              <div className="snapshots-tab">
                <div className="section-header">
                  <h2>Daily Market Snapshots</h2>
                  <p className="section-desc">Historical market prices recorded each day</p>
                </div>
                
                {snapshotChartData.length > 0 && (
                  <div className="chart-card">
                    <h3>Price Comparison Over Time</h3>
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={snapshotChartData}>
                        <defs>
                          <linearGradient id="colorOur" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#58a6ff" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#58a6ff" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f0883e" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#f0883e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                        <XAxis dataKey="date" stroke="#8b949e" fontSize={12} />
                        <YAxis stroke="#8b949e" fontSize={12} tickFormatter={v => `$${v}`} />
                        <Tooltip 
                          contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px' }}
                          formatter={(value, name) => [`$${value}`, name]}
                        />
                        <Legend />
                        <Area type="monotone" dataKey="max" stroke="#f85149" fill="none" strokeDasharray="3 3" name="Market Max" />
                        <Area type="monotone" dataKey="avg" stroke="#f0883e" fill="url(#colorAvg)" name="Market Avg" />
                        <Area type="monotone" dataKey="min" stroke="#3fb950" fill="none" strokeDasharray="3 3" name="Market Min" />
                        <Area type="monotone" dataKey="ourPrice" stroke="#58a6ff" fill="url(#colorOur)" strokeWidth={2} name="Your Price" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
                
                {listingData?.marketSnapshots?.length > 0 ? (
                  <div className="snapshots-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Target Date</th>
                          <th>Days Out</th>
                          <th>Your Price</th>
                          <th>Status</th>
                          <th>Market Min</th>
                          <th>Market Avg</th>
                          <th>Market Max</th>
                          <th>AI Prediction</th>
                        </tr>
                      </thead>
                      <tbody>
                        {listingData.marketSnapshots.map((snap, i) => (
                          <tr key={i} className={snap.isBooked ? 'booked-row' : ''}>
                            <td>
                              <span className="day-name">{getDayOfWeek(snap.targetDate)}</span>
                              {formatDate(snap.targetDate)}
                            </td>
                            <td>{snap.daysUntilCheckin} days</td>
                            <td className="price-cell our">{formatCurrency(snap.ourPrice)}</td>
                            <td>
                              <span className={`status-badge ${snap.isBooked ? 'booked' : 'available'}`}>
                                {snap.isBooked ? 'Booked' : 'Available'}
                              </span>
                            </td>
                            <td className="price-cell min">{formatCurrency(snap.competitorMin)}</td>
                            <td className="price-cell avg">{formatCurrency(snap.competitorAvg)}</td>
                            <td className="price-cell max">{formatCurrency(snap.competitorMax)}</td>
                            <td className="price-cell ai">{formatCurrency(snap.predictedPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-tab">No market snapshots yet. Run a sync to start collecting daily market data.</div>
                )}
              </div>
            )}

            {/* AI RECOMMENDATIONS TAB */}
            {activeTab === 'ai' && (
              <div className="ai-tab">
                <div className="section-header">
                  <h2>AI Price Recommendations</h2>
                  <p className="section-desc">Smart pricing suggestions based on market analysis</p>
                </div>
                
                {suggestionsChartData.length > 0 && (
                  <div className="chart-card">
                    <h3>AI Recommended Prices</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={suggestionsChartData}>
                        <defs>
                          <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a371f7" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#a371f7" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                        <XAxis dataKey="date" stroke="#8b949e" fontSize={12} />
                        <YAxis stroke="#8b949e" fontSize={12} tickFormatter={v => `$${v}`} />
                        <Tooltip 
                          contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px' }}
                          formatter={(value) => [`$${value}`, '']}
                        />
                        <Area type="monotone" dataKey="high" stroke="#f85149" fill="none" strokeDasharray="3 3" name="High Range" />
                        <Area type="monotone" dataKey="recommended" stroke="#a371f7" fill="url(#colorRec)" strokeWidth={2} name="Recommended" />
                        <Area type="monotone" dataKey="low" stroke="#3fb950" fill="none" strokeDasharray="3 3" name="Low Range" />
                        <Area type="monotone" dataKey="marketAvg" stroke="#f0883e" fill="none" strokeWidth={1} name="Market Avg" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
                
                {listingData?.aiSuggestions?.length > 0 ? (
                  <div className="suggestions-list">
                    {listingData.aiSuggestions.map((sug, i) => (
                      <div key={i} className="suggestion-card">
                        <div 
                          className="suggestion-header"
                          onClick={() => setExpandedSuggestion(expandedSuggestion === i ? null : i)}
                        >
                          <div className="suggestion-date">
                            <span className="date-day">{new Date(sug.date).getDate()}</span>
                            <span className="date-month">{new Date(sug.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                            <span className="date-dow">{getDayOfWeek(sug.date)}</span>
                          </div>
                          
                          <div className="suggestion-main">
                            <div className="recommended-price">
                              <span className="rec-label">AI Recommends</span>
                              <span className="rec-value">{formatCurrency(sug.recommendedPrice)}</span>
                            </div>
                            <div className="price-range-bar">
                              <span className="range-low">{formatCurrency(sug.lowPrice)}</span>
                              <div className="range-line"></div>
                              <span className="range-high">{formatCurrency(sug.highPrice)}</span>
                            </div>
                          </div>
                          
                          <div className="suggestion-market">
                            <div className="market-prices">
                              <span className="mkt-min">{formatCurrency(sug.competitorMin)}</span>
                              <span className="mkt-avg">{formatCurrency(sug.competitorAvg)}</span>
                              <span className="mkt-max">{formatCurrency(sug.competitorMax)}</span>
                            </div>
                            <span className="market-label">Min / Avg / Max</span>
                          </div>
                          
                          <div className="suggestion-meta">
                            <span className="days-out">{sug.daysUntilCheckin} days out</span>
                            <span className={`expand-icon ${expandedSuggestion === i ? 'expanded' : ''}`}>▼</span>
                          </div>
                        </div>
                        
                        {expandedSuggestion === i && (
                          <div className="suggestion-details">
                            {sug.reasoning && (
                              <div className="reasoning-box">
                                <h5>AI Reasoning</h5>
                                <p>{sug.reasoning}</p>
                              </div>
                            )}
                            {sug.specialNotes && (
                              <div className="notes-box">
                                <h5>Special Notes</h5>
                                <p>{sug.specialNotes}</p>
                              </div>
                            )}
                            {sug.userAction && (
                              <div className="action-box">
                                <span className={`action-badge ${sug.userAction.toLowerCase()}`}>
                                  {sug.userAction}
                                </span>
                                {sug.finalPrice && (
                                  <span className="final-price">Final: {formatCurrency(sug.finalPrice)}</span>
                                )}
                                {sug.bookingOutcome && (
                                  <span className={`outcome-badge ${sug.bookingOutcome.toLowerCase()}`}>
                                    {sug.bookingOutcome}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-tab">No AI suggestions yet. Run a sync to generate recommendations.</div>
                )}
              </div>
            )}

            {/* CALENDAR TAB */}
            {activeTab === 'calendar' && (
              <div className="calendar-tab">
                <div className="section-header">
                  <h2>Calendar Data</h2>
                  <p className="section-desc">Your listing's daily prices and availability</p>
                </div>
                
                {listingData?.calendarDays?.length > 0 ? (
                  <div className="calendar-grid">
                    {listingData.calendarDays.map((day, i) => (
                      <div key={i} className={`calendar-day ${day.isAvailable ? 'available' : 'booked'}`}>
                        <div className="day-header">
                          <span className="day-dow">{getDayOfWeek(day.date)}</span>
                          <span className="day-date">{formatDate(day.date)}</span>
                        </div>
                        <span className="day-price">{formatCurrency(day.price)}</span>
                        <div className="day-market">
                          {day.marketMinPrice && (
                            <span className="mkt-range">
                              {formatCurrency(day.marketMinPrice)} - {formatCurrency(day.marketMaxPrice)}
                            </span>
                          )}
                          {day.marketAvgPrice && (
                            <span className="mkt-avg">Avg: {formatCurrency(day.marketAvgPrice)}</span>
                          )}
                        </div>
                        <span className={`avail-badge ${day.isAvailable ? 'open' : 'taken'}`}>
                          {day.isAvailable ? 'Open' : 'Booked'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-tab">No calendar data. Run a sync to fetch your listing's calendar.</div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default ListingDetail
