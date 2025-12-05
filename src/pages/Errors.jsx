import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  getErrorSummary, 
  getPendingErrors, 
  getListingsWithIssues,
  resolveError,
  ignoreError,
  retryError,
  getIncompleteListings,
  fixIncompleteCalendars
} from '../services/api'
import './Errors.css'

const ERROR_TYPE_LABELS = {
  CALENDAR_FETCH: 'Calendar Fetch',
  COMPETITOR_FETCH: 'Competitor Fetch',
  PRICE_FETCH: 'Price Fetch',
  LISTING_DATA: 'Listing Data',
  MARKET_DATA: 'Market Data',
  AI_SUGGESTION: 'AI Suggestion',
  VALIDATION: 'Validation'
}

const ERROR_TYPE_ICONS = {
  CALENDAR_FETCH: '📅',
  COMPETITOR_FETCH: '🏠',
  PRICE_FETCH: '💰',
  LISTING_DATA: '📋',
  MARKET_DATA: '📊',
  AI_SUGGESTION: '🤖',
  VALIDATION: '⚠️'
}

const STATUS_COLORS = {
  PENDING: 'status-pending',
  RETRYING: 'status-retrying',
  FAILED: 'status-failed',
  RESOLVED: 'status-resolved',
  IGNORED: 'status-ignored'
}

export default function Errors() {
  const [summary, setSummary] = useState(null)
  const [pendingErrors, setPendingErrors] = useState([])
  const [issueListings, setIssueListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [actionLoading, setActionLoading] = useState(null)
  const [incompleteListings, setIncompleteListings] = useState([])
  const [fixLoading, setFixLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [summaryRes, errorsRes, issuesRes, incompleteRes] = await Promise.all([
        getErrorSummary(),
        getPendingErrors(),
        getListingsWithIssues(),
        getIncompleteListings()
      ])
      
      setSummary(summaryRes)
      setPendingErrors(errorsRes.errors || [])
      setIssueListings(issuesRes.listings || [])
      setIncompleteListings(incompleteRes.listings || [])
    } catch (error) {
      console.error('Failed to load error data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleFixCalendars() {
    setFixLoading(true)
    try {
      await fixIncompleteCalendars()
      alert('Started background jobs to fix missing calendars. Check back in a few minutes.')
      await loadData()
    } catch (error) {
      console.error('Failed to start calendar fix:', error)
      alert('Failed to start fix jobs')
    } finally {
      setFixLoading(false)
    }
  }

  async function handleResolve(errorId) {
    setActionLoading(errorId)
    try {
      await resolveError(errorId, 'Manually resolved from dashboard')
      await loadData()
    } catch (error) {
      console.error('Failed to resolve error:', error)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleIgnore(errorId) {
    setActionLoading(errorId)
    try {
      await ignoreError(errorId, 'Ignored from dashboard')
      await loadData()
    } catch (error) {
      console.error('Failed to ignore error:', error)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleRetry(errorId) {
    setActionLoading(errorId)
    try {
      await retryError(errorId)
      await loadData()
    } catch (error) {
      console.error('Failed to retry error:', error)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return <div className="loading">Loading error data...</div>
  }

  return (
    <div className="errors-page">
      <div className="page-header">
        <div className="header-left">
          <h1>Data Quality &amp; Errors</h1>
          <p className="subtitle">Track and resolve data fetching issues</p>
        </div>
        <button className="refresh-btn" onClick={loadData}>
          🔄 Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card pending">
          <div className="card-value">{summary?.pending || 0}</div>
          <div className="card-label">Pending</div>
        </div>
        <div className="summary-card retrying">
          <div className="card-value">{summary?.retrying || 0}</div>
          <div className="card-label">Retrying</div>
        </div>
        <div className="summary-card failed">
          <div className="card-value">{summary?.failed || 0}</div>
          <div className="card-label">Failed</div>
        </div>
        <div className="summary-card resolved">
          <div className="card-value">{summary?.resolved || 0}</div>
          <div className="card-label">Resolved</div>
        </div>
      </div>

      {/* Error Types Breakdown */}
      {summary?.byType && Object.keys(summary.byType).length > 0 && (
        <div className="error-types-section">
          <h2>Errors by Type</h2>
          <div className="error-types-grid">
            {Object.entries(summary.byType).map(([type, count]) => (
              <div key={type} className="error-type-card">
                <span className="type-icon">{ERROR_TYPE_ICONS[type] || '❌'}</span>
                <span className="type-label">{ERROR_TYPE_LABELS[type] || type}</span>
                <span className="type-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Errors ({pendingErrors.length})
        </button>
        <button 
          className={`tab ${activeTab === 'issues' ? 'active' : ''}`}
          onClick={() => setActiveTab('issues')}
        >
          Listings with Issues ({issueListings.length})
        </button>
        <button 
          className={`tab ${activeTab === 'incomplete' ? 'active' : ''}`}
          onClick={() => setActiveTab('incomplete')}
        >
          Missing Calendars ({incompleteListings.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'incomplete' && (
          <div className="incomplete-list">
            {incompleteListings.length > 0 ? (
              <div className="fix-header">
                <div className="fix-info">
                  <h3>Found {incompleteListings.length} listings with missing calendar data</h3>
                  <p>These listings have competitor data but are missing your calendar/pricing data.</p>
                </div>
                <button 
                  className="fix-all-btn"
                  onClick={handleFixCalendars}
                  disabled={fixLoading}
                >
                  {fixLoading ? 'Starting Jobs...' : '🔧 Fix All Calendars'}
                </button>
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-icon">✅</span>
                <p>No missing calendars found!</p>
              </div>
            )}

            <div className="listings-grid">
              {incompleteListings.map(listing => (
                <div key={listing.id} className="listing-card">
                  <h3>{listing.title}</h3>
                  <a href={listing.airbnb_url} target="_blank" rel="noopener noreferrer" className="listing-link">
                    View on Airbnb ↗
                  </a>
                  <div className="stats-row">
                    <span className="stat">Analyzed Chunks: {listing.analysis_count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="errors-list">
            {pendingErrors.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">✅</span>
                <p>No pending errors! All data is up to date.</p>
              </div>
            ) : (
              pendingErrors.map(error => (
                <div key={error.id} className="error-card">
                  <div className="error-header">
                    <span className="error-icon">{ERROR_TYPE_ICONS[error.errorType] || '❌'}</span>
                    <div className="error-info">
                      <h3>{error.listingTitle}</h3>
                      <span className={`status-badge ${STATUS_COLORS[error.status]}`}>
                        {error.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="error-details">
                    <div className="detail-row">
                      <span className="detail-label">Type:</span>
                      <span className="detail-value">{ERROR_TYPE_LABELS[error.errorType]}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Message:</span>
                      <span className="detail-value">{error.message}</span>
                    </div>
                    {error.date && (
                      <div className="detail-row">
                        <span className="detail-label">Date:</span>
                        <span className="detail-value">
                          {new Date(error.date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="detail-label">Retries:</span>
                      <span className="detail-value">{error.retryCount} / {error.maxRetries}</span>
                    </div>
                    {error.nextRetryAt && (
                      <div className="detail-row">
                        <span className="detail-label">Next Retry:</span>
                        <span className="detail-value">
                          {new Date(error.nextRetryAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="error-actions">
                    <button 
                      className="action-btn retry"
                      onClick={() => handleRetry(error.id)}
                      disabled={actionLoading === error.id}
                    >
                      {actionLoading === error.id ? '...' : '🔄 Retry'}
                    </button>
                    <button 
                      className="action-btn resolve"
                      onClick={() => handleResolve(error.id)}
                      disabled={actionLoading === error.id}
                    >
                      {actionLoading === error.id ? '...' : '✅ Resolve'}
                    </button>
                    <button 
                      className="action-btn ignore"
                      onClick={() => handleIgnore(error.id)}
                      disabled={actionLoading === error.id}
                    >
                      {actionLoading === error.id ? '...' : '🚫 Ignore'}
                    </button>
                    <Link 
                      to={`/listing/${error.listingId}`}
                      className="action-btn view"
                    >
                      👁️ View Listing
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'issues' && (
          <div className="issues-list">
            {issueListings.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">✅</span>
                <p>All listings have complete data!</p>
              </div>
            ) : (
              issueListings.map(item => (
                <div key={item.listing.id} className="issue-card">
                  <div className="issue-header">
                    <h3>{item.listing.title}</h3>
                    <span className="location">{item.listing.location}</span>
                  </div>

                  <div className="completeness-bars">
                    <div className="completeness-bar">
                      <span className="bar-label">Calendar</span>
                      <div className="bar-track">
                        <div 
                          className="bar-fill" 
                          style={{ width: `${item.completeness.calendar}%` }}
                        />
                      </div>
                      <span className="bar-value">{item.completeness.calendar}%</span>
                    </div>
                    <div className="completeness-bar">
                      <span className="bar-label">Market</span>
                      <div className="bar-track">
                        <div 
                          className="bar-fill market" 
                          style={{ width: `${item.completeness.market}%` }}
                        />
                      </div>
                      <span className="bar-value">{item.completeness.market}%</span>
                    </div>
                    <div className="completeness-bar">
                      <span className="bar-label">AI</span>
                      <div className="bar-track">
                        <div 
                          className="bar-fill ai" 
                          style={{ width: `${item.completeness.ai}%` }}
                        />
                      </div>
                      <span className="bar-value">{item.completeness.ai}%</span>
                    </div>
                  </div>

                  <div className="missing-data">
                    {item.missingData.prices > 0 && (
                      <span className="missing-badge prices">
                        💰 {item.missingData.prices} missing prices
                      </span>
                    )}
                    {item.missingData.market > 0 && (
                      <span className="missing-badge market">
                        📊 {item.missingData.market} missing market data
                      </span>
                    )}
                    {item.missingData.ai > 0 && (
                      <span className="missing-badge ai">
                        🤖 {item.missingData.ai} missing AI suggestions
                      </span>
                    )}
                  </div>

                  <div className="issue-footer">
                    <span className="last-validated">
                      Last validated: {new Date(item.lastValidated).toLocaleString()}
                    </span>
                    <Link 
                      to={`/listing/${item.listing.id}`}
                      className="view-btn"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

