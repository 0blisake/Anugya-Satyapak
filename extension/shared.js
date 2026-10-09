export const DEFAULT_API_BASE = 'http://127.0.0.1:8000'
export const API_BASE_KEY = 'apiBaseUrl'
export const FULL_SITE_URL_KEY = 'fullSiteUrl'

export function normalizeApiBase(value) {
  let parsed
  try {
    parsed = new URL(value.trim())
  } catch {
    throw new Error('Enter a complete API address, such as http://127.0.0.1:8000 or https://api.example.com.')
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('The API address must start with http:// or https://.')
  }
  if (parsed.username || parsed.password || parsed.search || parsed.hash || !['', '/'].includes(parsed.pathname)) {
    throw new Error('Enter only the API origin. Do not include a path, username, password, query, or fragment.')
  }
  const isLoopback = ['localhost', '127.0.0.1'].includes(parsed.hostname.toLowerCase())
  if (parsed.protocol !== 'https:' && !isLoopback) {
    throw new Error('Use HTTPS for a hosted API. Plain HTTP is allowed only for a local loopback address.')
  }
  return parsed.origin
}

export function apiPermissionPattern(apiBase) {
  return `${new URL(apiBase).origin}/*`
}

export async function getConfiguredApiBase() {
  const stored = await chrome.storage.local.get(API_BASE_KEY)
  return stored[API_BASE_KEY] || ''
}

export function normalizeWebsiteUrl(value) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  let parsed
  try {
    parsed = new URL(trimmed)
  } catch {
    throw new Error('Enter a complete website address, such as https://example.github.io/project/.')
  }
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error('Enter a website URL without credentials, query parameters, or a fragment.')
  }
  const isLoopback = ['localhost', '127.0.0.1'].includes(parsed.hostname.toLowerCase())
  if (parsed.protocol !== 'https:' && !isLoopback) {
    throw new Error('Use HTTPS for a hosted website. Plain HTTP is allowed only for a local loopback address.')
  }
  return `${parsed.origin}${parsed.pathname.replace(/\/+$/, '')}`
}

export async function getConfiguredWebsiteUrl() {
  const stored = await chrome.storage.local.get(FULL_SITE_URL_KEY)
  return stored[FULL_SITE_URL_KEY] || ''
}

export async function readApiError(response, fallback) {
  try {
    const payload = await response.json()
    if (typeof payload.detail === 'string') return payload.detail
  } catch {
    // Keep the user-facing error short if the API returned a non-JSON response.
  }
  return fallback
}
