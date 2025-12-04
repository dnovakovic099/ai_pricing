import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAudit, triggerNightlyCollection } from '../services/api'
import './Overview.css'

function Overview() {
  const [audit, setAudit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    fetchAudit()
  }, [])

  async function fetchAudit() {
    try {
      setLoading(true)
      setError(null)
      const data = await getAudit()
      setAudit(data.audit)
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSync() {
    try {
      setSyncing(true)
      await triggerNightlyCollection()
      alert('✅ Data collection started! This may take 10-15 minutes. Refresh the page to see updates.')
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.error || err.message))
    } finally {
      setSyncing(false)
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loader" />
        <p>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-state">
        <div className="error-icon">⚠️</div>
        <h3>Something went wrong</h3>
        <p>{error}</p>
        <button className="btn btn-secondary" onClick={fetchAudit}>Retry</button>
      </div>
    )
  }

  const hasData = audit?.globalCounts?.totalPricingAnalyses > 0 || 
                  audit?.globalCounts?.totalCalendarDays > 0

  return (
    <div className="overview">
      {/* Header */}
      <header className="page-header">
        <div>
          <h1>Your Listings</h1>
          <p className="subtitle">{audit?.listings?.length || 0} properties tracked</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={handleSync}
          disabled={syncing}
        >
          {syncing ? 'Syncing...' : '🔄 Sync Market Data'}
        </button>
      </header>

      {/* Empty State */}
      {!hasData && (
        <div className="empty-banner">
          <div className="empty-icon">📊</div>
          <div className="empty-content">
            <h3>No market data yet</h3>
            <p>Click "Sync Market Data" to fetch competitor pricing and calendar data for your listings. This runs automatically every night at midnight.</p>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {hasData && (
        <div className="stats-bar">
          <div className="stat">
            <span className="stat-value">{audit?.globalCounts?.totalCalendarDays || 0}</span>
            <span className="stat-label">Calendar Days</span>
          </div>
          <div className="stat">
            <span className="stat-value">{audit?.globalCounts?.totalCompetitors || 0}</span>
            <span className="stat-label">Competitors</span>
          </div>
          <div className="stat">
            <span className="stat-value">{audit?.globalCounts?.totalDailyMarketSnapshots || 0}</span>
            <span className="stat-label">Snapshots</span>
          </div>
          <div className="stat">
            <span className="stat-value">{audit?.globalCounts?.totalAISuggestions || 0}</span>
            <span className="stat-label">AI Suggestions</span>
          </div>
        </div>
      )}

      {/* Listings Grid */}
      <div className="listings-grid">
        {audit?.listings?.map((listing) => (
          <Link to={`/listing/${listing.id}`} key={listing.id} className="listing-card">
            <div className="listing-header">
              <h3 className="listing-title">{listing.title}</h3>
              <span className="listing-location">{listing.location || 'No location'}</span>
            </div>
            
            <div className="listing-stats">
              <div className="listing-stat">
                <span className="listing-stat-value">{listing.bedrooms || 0}</span>
                <span className="listing-stat-label">Beds</span>
              </div>
              <div className="listing-stat">
                <span className="listing-stat-value">{listing.dataCounts?.calendarDays || 0}</span>
                <span className="listing-stat-label">Days</span>
              </div>
              <div className="listing-stat">
                <span className="listing-stat-value">{listing.dataCounts?.aiSuggestions || 0}</span>
                <span className="listing-stat-label">AI Tips</span>
              </div>
            </div>

            <div className="listing-footer">
              {listing.dataCounts?.calendarDays > 0 ? (
                <span className="status-badge success">Data Ready</span>
              ) : (
                <span className="status-badge pending">Needs Sync</span>
              )}
              <span className="view-link">View →</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty Listings State */}
      {(!audit?.listings || audit.listings.length === 0) && (
        <div className="no-listings">
          <div className="no-listings-icon">🏠</div>
          <h3>No listings found</h3>
          <p>Add an Airbnb URL in the mobile app to start tracking.</p>
        </div>
      )}
    </div>
  )
}

export default Overview
