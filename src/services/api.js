import axios from 'axios'

// Direct API URL - call backend directly (no proxy)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://roomify-server-production.up.railway.app/api'

// Credentials from environment variables
const AUTH_EMAIL = import.meta.env.VITE_AUTH_EMAIL
const AUTH_PASSWORD = import.meta.env.VITE_AUTH_PASSWORD

let authToken = localStorage.getItem('authToken') || ''

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`
  }
  return config
})

// Ensure we have a valid token before making requests
async function ensureAuth() {
  // If we have a token, test it
  if (authToken) {
    try {
      await axios.get(`${API_BASE_URL}/pricing/training-data-stats`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      return true // Token is valid
    } catch (e) {
      // Token is invalid, clear it
      authToken = ''
      localStorage.removeItem('authToken')
    }
  }
  
  // Login to get a new token
  if (!AUTH_EMAIL || !AUTH_PASSWORD) {
    console.error('Auth credentials not configured. Set VITE_AUTH_EMAIL and VITE_AUTH_PASSWORD.')
    return false
  }
  
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: AUTH_EMAIL,
      password: AUTH_PASSWORD
    })
    authToken = response.data.accessToken
    localStorage.setItem('authToken', authToken)
    // Update the api instance default headers
    api.defaults.headers.Authorization = `Bearer ${authToken}`
    return true
  } catch (e) {
    console.error('Auto-login failed:', e)
    return false
  }
}

// ============ Pricing API ============

export async function getAudit() {
  await ensureAuth()
  const { data } = await api.get('/pricing/audit')
  return data
}

export async function getListingAudit(listingId, date = null) {
  await ensureAuth()
  const url = date 
    ? `/pricing/audit/${listingId}?date=${date}`
    : `/pricing/audit/${listingId}`
  const { data } = await api.get(url)
  return data
}

export async function getListings() {
  await ensureAuth()
  const { data } = await api.get('/pricing/listings')
  return data
}

export async function getListingCalendar(listingId) {
  await ensureAuth()
  const { data } = await api.get(`/pricing/listings/${listingId}/calendar`)
  return data
}

export async function getTrainingDataStats() {
  await ensureAuth()
  const { data } = await api.get('/pricing/training-data-stats')
  return data
}

export async function triggerNightlyCollection() {
  await ensureAuth()
  const { data } = await api.post('/pricing/trigger-nightly-collection')
  return data
}

export async function getMarketAnalysis(date = null) {
  await ensureAuth()
  const url = date 
    ? `/pricing/market-analysis?date=${date}`
    : '/pricing/market-analysis'
  const { data } = await api.get(url)
  return data
}

// ============ Error Tracking API ============

export async function getErrorSummary() {
  await ensureAuth()
  const { data } = await api.get('/pricing/errors')
  return data
}

export async function getPendingErrors() {
  await ensureAuth()
  const { data } = await api.get('/pricing/errors/pending')
  return data
}

export async function getListingErrors(listingId, includeResolved = false) {
  await ensureAuth()
  const { data } = await api.get(`/pricing/errors/listing/${listingId}?includeResolved=${includeResolved}`)
  return data
}

export async function getCompletenessStatus(listingId) {
  await ensureAuth()
  const { data } = await api.get(`/pricing/completeness/${listingId}`)
  return data
}

export async function getListingsWithIssues() {
  await ensureAuth()
  const { data } = await api.get('/pricing/issues')
  return data
}

export async function validateListingData(listingId) {
  await ensureAuth()
  const { data } = await api.post(`/pricing/validate/${listingId}`)
  return data
}

export async function resolveError(errorId, notes = '') {
  await ensureAuth()
  const { data } = await api.post(`/pricing/errors/${errorId}/resolve`, { notes })
  return data
}

export async function ignoreError(errorId, notes = '') {
  await ensureAuth()
  const { data } = await api.post(`/pricing/errors/${errorId}/ignore`, { notes })
  return data
}

export async function retryError(errorId) {
  await ensureAuth()
  const { data } = await api.post(`/pricing/errors/${errorId}/retry`)
  return data
}

export async function retryAllListingErrors(listingId) {
  await ensureAuth()
  const { data } = await api.post(`/pricing/listings/${listingId}/retry-all`)
  return data
}

export async function getIncompleteListings() {
  await ensureAuth()
  const { data } = await api.get('/pricing/incomplete-listings')
  return data
}

export async function fixIncompleteCalendars(listingIds = []) {
  await ensureAuth()
  const { data } = await api.post('/pricing/fix-calendars', { listingIds })
  return data
}

export default api
