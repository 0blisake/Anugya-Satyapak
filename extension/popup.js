import { apiPermissionPattern, getConfiguredApiBase, getConfiguredWebsiteUrl, readApiError } from './shared.js'

const MAX_QUICK_TEXT = 40_000
const elements = Object.fromEntries([
  'connection-dot', 'connection-title', 'connection-detail', 'configure-button',
  'settings-button', 'selection-button', 'page-button', 'contract-text',
  'capture-source', 'character-count', 'capture-message', 'send-consent',
  'review-button', 'error-message', 'report', 'mode-pill', 'report-warning',
  'summary', 'findings', 'no-findings', 'more-findings', 'full-review-link', 'full-review-help',
].map((id) => [id.replaceAll('-', '_'), document.getElementById(id)]))

let apiBase = ''
let apiReady = false
let aiAvailable = false
let activeTabId = null
let documentLabel = 'Selected webpage text'
let fullSiteUrl = ''

function showError(message) {
  elements.error_message.textContent = message
  elements.error_message.hidden = !message
}

function updateReviewButton() {
  elements.review_button.disabled = !apiReady || !elements.contract_text.value.trim() || !elements.send_consent.checked
}

function setCaptureMessage(message, visible = true) {
  elements.capture_message.textContent = message
  elements.capture_message.hidden = !visible
}

function updateTextMeta() {
  const length = elements.contract_text.value.length
  elements.character_count.textContent = `${length.toLocaleString()} / ${MAX_QUICK_TEXT.toLocaleString()}`
  elements.send_consent.checked = false
  elements.report.hidden = true
  showError('')
  updateReviewButton()
}

function setConnection(ready, title, detail) {
  apiReady = ready
  elements.connection_title.textContent = title
  elements.connection_detail.textContent = detail
  elements.connection_dot.classList.toggle('ready', ready)
  elements.configure_button.hidden = ready
  updateReviewButton()
}

async function checkApi() {
  apiBase = await getConfiguredApiBase()
  if (!apiBase) {
    setConnection(false, 'Connect your review service', 'Set the local API address or the HTTPS address where your backend is hosted.')
    return
  }

  const pattern = apiPermissionPattern(apiBase)
  const granted = await chrome.permissions.contains({ origins: [pattern] })
  if (!granted) {
    setConnection(false, 'API access is not approved yet', 'Open settings and grant this extension access to your configured API origin.')
    return
  }

  try {
    const response = await fetch(`${apiBase}/api/health`, { method: 'GET', cache: 'no-store' })
    if (!response.ok) throw new Error(`The API returned HTTP ${response.status}.`)
    const health = await response.json()
    if (health.status !== 'ok') throw new Error('The configured service did not report ready.')
    aiAvailable = health.ai_available === true
    const mode = aiAvailable ? 'AI-assisted review is configured.' : 'The API is using its rules-based review.'
    setConnection(true, 'Review service is ready', `${mode} Your page text is not sent until you choose Review.`)
  } catch (error) {
    aiAvailable = false
    const detail = error instanceof Error ? error.message : 'The API could not be reached.'
    setConnection(false, 'Could not reach the review service', `${detail} Check that the backend is running and that the saved API origin is correct.`)
  }
}

async function getActiveTabId() {
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
  activeTabId = tabs[0]?.id ?? null
  return activeTabId
}

async function captureFromPage(mode) {
  showError('')
  elements.selection_button.disabled = true
  elements.page_button.disabled = true
  setCaptureMessage(mode === 'selection' ? 'Reading the current text selection…' : 'Reading text rendered on this page…')
  try {
    const tabId = activeTabId ?? await getActiveTabId()
    if (tabId === null) throw new Error('No active browser tab was available.')
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: (captureMode, maxChars) => {
        const selected = window.getSelection()?.toString().trim() ?? ''
        const pageText = (document.body?.innerText || document.documentElement?.innerText || '').trim()
        const text = captureMode === 'selection' ? selected : pageText
        return {
          text: text.slice(0, maxChars),
          totalLength: text.length,
        }
      },
      args: [mode, MAX_QUICK_TEXT],
    })
    const captured = results[0]?.result
    if (!captured || !captured.text) {
      throw new Error(mode === 'selection' ? 'No text is selected. Select a passage, or choose Read page text.' : 'No readable page text was found. Try selecting text or paste it below.')
    }
    elements.contract_text.value = captured.text
    documentLabel = mode === 'selection' ? 'Selected webpage text' : 'Webpage text'
    elements.capture_source.textContent = mode === 'selection' ? 'Text selected from the active tab' : 'Text read from the active tab'
    if (captured.totalLength > MAX_QUICK_TEXT) {
      setCaptureMessage(`Only the first ${MAX_QUICK_TEXT.toLocaleString()} characters were loaded. This quick check may omit later terms; use the website for a full review.`)
    } else {
      setCaptureMessage('Review and edit this text before sending it.')
    }
    updateTextMeta()
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'The page text could not be read.'
    setCaptureMessage(`${detail} Browser-internal pages and some built-in PDF viewers do not allow text access. You can paste copied text instead.`)
  } finally {
    elements.selection_button.disabled = false
    elements.page_button.disabled = false
  }
}

function createFindingCard(finding) {
  const card = document.createElement('article')
  card.className = 'finding-card'

  const meta = document.createElement('div')
  meta.className = 'finding-meta'
  const category = document.createElement('span')
  const pageText = Number.isInteger(finding.page) && finding.page > 0 ? ` · Page ${finding.page}` : ''
  category.textContent = `${finding.category || 'Contract wording'}${pageText}`
  const risk = document.createElement('span')
  risk.className = 'finding-risk'
  const riskName = typeof finding.risk === 'string' ? finding.risk : 'Review'
  risk.textContent = riskName
  if (riskName === 'Review') risk.classList.add('review')
  if (riskName === 'Informational') risk.classList.add('info')
  meta.append(category, risk)

  const heading = document.createElement('h3')
  heading.textContent = finding.title || 'Term to read more closely'
  card.append(meta, heading)

  if (typeof finding.original_clause === 'string' && finding.original_clause) {
    const quote = document.createElement('blockquote')
    quote.textContent = finding.original_clause
    card.append(quote)
  }
  if (typeof finding.plain_language === 'string' && finding.plain_language) {
    const explanation = document.createElement('p')
    explanation.className = 'finding-explanation'
    explanation.textContent = finding.plain_language
    card.append(explanation)
  }
  if (typeof finding.suggested_action === 'string' && finding.suggested_action) {
    const action = document.createElement('p')
    action.className = 'finding-action'
    const strong = document.createElement('strong')
    strong.textContent = 'Check: '
    action.append(strong, document.createTextNode(finding.suggested_action))
    card.append(action)
  }

  for (const citation of Array.isArray(finding.citations) ? finding.citations.slice(0, 2) : []) {
    if (typeof citation?.url !== 'string') continue
    try {
      const url = new URL(citation.url)
      if (url.protocol !== 'https:') continue
      const link = document.createElement('a')
      link.className = 'finding-source'
      link.href = url.href
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      link.textContent = `Source: ${citation.title || citation.section || 'Open reference'}`
      card.append(link)
    } catch {
      // Ignore malformed source links from an unexpected response.
    }
  }
  return card
}

function showReport(report) {
  elements.report.hidden = false
  elements.mode_pill.textContent = report.analysis_mode === 'ai-assisted-prototype' ? 'AI-assisted' : 'Rules-based'
  elements.summary.textContent = report.contract_summary || 'No summary was returned.'
  elements.findings.replaceChildren()

  const findings = Array.isArray(report.findings) ? report.findings : []
  elements.no_findings.hidden = findings.length !== 0
  for (const finding of findings.slice(0, 8)) elements.findings.append(createFindingCard(finding))
  if (findings.length > 8) {
    elements.more_findings.textContent = `Showing 8 of ${findings.length} findings.`
    elements.more_findings.hidden = false
  } else {
    elements.more_findings.hidden = true
  }
  const warnings = [report.extraction_warning, report.analysis_warning].filter((item) => typeof item === 'string' && item.trim())
  elements.report_warning.textContent = warnings.join(' ')
  elements.report_warning.hidden = warnings.length === 0
  elements.full_review_link.href = fullSiteUrl || '#'
  elements.full_review_link.hidden = !fullSiteUrl
  elements.full_review_help.hidden = !fullSiteUrl
  elements.report.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function submitReview() {
  showError('')
  const text = elements.contract_text.value.trim()
  if (!text) return showError('Add contract terms before starting the review.')
  if (!elements.send_consent.checked) return showError('Confirm the data-sharing notice before sending this text.')
  if (text.length > MAX_QUICK_TEXT) return showError('This quick check is limited to 40,000 characters. Split the text or use the website for a full review.')
  if (!apiReady || !apiBase) return showError('Connect to the review service in extension settings first.')

  elements.review_button.disabled = true
  elements.review_button.textContent = 'Reviewing… keep this popup open'
  elements.report.hidden = true
  try {
    const form = new FormData()
    form.append('text', text)
    form.append('document_name', documentLabel)
    form.append('jurisdiction', 'India · Central')
    form.append('language', 'English')
    form.append('ai_consent', String(elements.send_consent.checked && aiAvailable))
    const response = await fetch(`${apiBase}/api/analyze`, { method: 'POST', body: form })
    if (!response.ok) throw new Error(await readApiError(response, 'The review service could not analyze this text.'))
    const report = await response.json()
    showReport(report)
  } catch (error) {
    showError(error instanceof Error ? error.message : 'The review request failed. Check the API connection and try again.')
  } finally {
    elements.review_button.textContent = 'Review this text'
    updateReviewButton()
  }
}

async function openOptions() {
  await chrome.runtime.openOptionsPage()
}

async function initialize() {
  await getActiveTabId().catch(() => { activeTabId = null })
  fullSiteUrl = await getConfiguredWebsiteUrl()
  await checkApi()
}

elements.selection_button.addEventListener('click', () => captureFromPage('selection'))
elements.page_button.addEventListener('click', () => captureFromPage('page'))
elements.configure_button.addEventListener('click', openOptions)
elements.settings_button.addEventListener('click', openOptions)
elements.contract_text.addEventListener('input', () => {
  elements.capture_source.textContent = 'Edited or pasted review text'
  documentLabel = 'Quick review text'
  updateTextMeta()
})
elements.send_consent.addEventListener('change', updateReviewButton)
elements.review_button.addEventListener('click', submitReview)

initialize().catch((error) => {
  const detail = error instanceof Error ? error.message : 'The extension popup could not initialize.'
  setConnection(false, 'Extension setup is incomplete', detail)
})
