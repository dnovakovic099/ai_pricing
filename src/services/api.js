import axios from 'axios'

// Pre-generated JWT token for owner@hostiq.com
// This token is valid for API access - generate a new one if it expires
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhNzJlNzIxOS0xZTA5LTQ5MDItYWFmZS0wZDQ4ZjdlMjI5NzIiLCJpZCI6ImE3MmU3MjE5LTFlMDktNDkwMi1hYWZlLTBkNDhmN2UyMjk3MiIsInJvbGUiOiJPV05FUiIsImlhdCI6MTc2NDY3OTE0MCwiZXhwIjoxNzY3MjcxMTQwfQ.B2CJpLwZRqXxfiKdZQ2I8q5N-V7HTgM-M26YK_wHpYY'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AUTH_TOKEN}`
  }
})

// No auth needed - we use pre-generated token
async function ensureAuth() {
  return true
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

export default api
