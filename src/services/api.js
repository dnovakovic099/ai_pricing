import axios from 'axios'

// Auto-login credentials (for development)
const DEV_EMAIL = 'owner@hostiq.com'
const DEV_PASSWORD = 'password123'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

let authToken = localStorage.getItem('authToken') || ''

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
      await axios.get('/api/pricing/training-data-stats', {
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
  try {
    const response = await axios.post('/api/auth/login', {
      email: DEV_EMAIL,
      password: DEV_PASSWORD
    })
    authToken = response.data.accessToken
    localStorage.setItem('authToken', authToken)
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

export async function getListingAudit(listingId) {
  await ensureAuth()
  const { data } = await api.get(`/pricing/audit/${listingId}`)
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

export async function getMarketAnalysis() {
  await ensureAuth()
  const { data } = await api.get('/pricing/market-analysis')
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

// ============ Auth helpers ============

export function setAuthToken(token) {
  authToken = token
  localStorage.setItem('authToken', token)
}

export function clearAuthToken() {
  authToken = ''
  localStorage.removeItem('authToken')
}

export default api
