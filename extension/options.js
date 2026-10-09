import { API_BASE_KEY, FULL_SITE_URL_KEY, apiPermissionPattern, DEFAULT_API_BASE, getConfiguredApiBase, normalizeApiBase, normalizeWebsiteUrl } from './shared.js'

const address = document.getElementById('api-address')
const websiteAddress = document.getElementById('website-address')
const saveButton = document.getElementById('save-button')
const status = document.getElementById('status')
let previousApiBase = ''

function showStatus(message, isError = false) {
  status.textContent = message
  status.classList.toggle('error', isError)
}

async function initialize() {
  const configured = await getConfiguredApiBase()
  previousApiBase = configured
  address.value = configured || DEFAULT_API_BASE
  const savedWebsite = await chrome.storage.local.get(FULL_SITE_URL_KEY)
  websiteAddress.value = savedWebsite[FULL_SITE_URL_KEY] || ''
  if (configured) showStatus(`Saved API origin: ${configured}`)
}

async function saveApiAddress() {
  showStatus('')
  saveButton.disabled = true
  try {
    const apiBase = normalizeApiBase(address.value)
    const fullSiteUrl = normalizeWebsiteUrl(websiteAddress.value)
    const originPattern = apiPermissionPattern(apiBase)
    // Start the permission prompt directly from this click handler before any awaited work.
    const granted = await chrome.permissions.request({ origins: [originPattern] })
    if (!granted) {
      showStatus('Chrome did not grant access to this API origin. No new origin was saved.', true)
      return
    }

    await chrome.storage.local.set({ [API_BASE_KEY]: apiBase, [FULL_SITE_URL_KEY]: fullSiteUrl })
    if (previousApiBase && previousApiBase !== apiBase) {
      const previousPattern = apiPermissionPattern(previousApiBase)
      await chrome.permissions.remove({ origins: [previousPattern] }).catch(() => false)
    }
    previousApiBase = apiBase
    showStatus(`Saved. The extension can now contact ${apiBase}. Start the backend and open Quick Check to confirm it is reachable.`)
  } catch (error) {
    showStatus(error instanceof Error ? error.message : 'The API origin could not be saved.', true)
  } finally {
    saveButton.disabled = false
  }
}

saveButton.addEventListener('click', saveApiAddress)
initialize().catch(() => showStatus('Could not load extension settings.', true))
