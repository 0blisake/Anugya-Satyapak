import { scanContractText } from './local-scan.js'

const MAX_QUICK_TEXT = 40_000
const MAX_VISIBLE_FINDINGS = 6
const elements = Object.fromEntries([
  'selection-button', 'page-button', 'clear-button', 'contract-text',
  'capture-source', 'character-count', 'capture-message', 'review-button',
  'review-hint',
  'copy-text-button', 'copy-message', 'error-message', 'report', 'summary',
  'findings', 'no-findings', 'more-findings',
].map((id) => [id.replaceAll('-', '_'), document.getElementById(id)]))

let activeTabId = null

function showError(message) {
  elements.error_message.textContent = message
  elements.error_message.hidden = !message
}

function setCaptureMessage(message) {
  elements.capture_message.textContent = message
  elements.capture_message.hidden = !message
}

function updateTextMeta() {
  const length = elements.contract_text.value.length
  const hasText = Boolean(elements.contract_text.value.trim())
  elements.character_count.textContent = `${length.toLocaleString()} / ${MAX_QUICK_TEXT.toLocaleString()}`
  elements.review_button.disabled = !hasText
  elements.review_hint.textContent = hasText
    ? 'Text is ready. Run the local quick check when you’re ready.'
    : 'Add text above to enable the quick check: paste a clause, capture selected text, or read visible page text.'
  elements.copy_text_button.disabled = !hasText
  elements.report.hidden = true
  elements.findings.replaceChildren()
  elements.more_findings.hidden = true
  showError('')
  elements.copy_message.hidden = true
}

async function getActiveTabId() {
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
  activeTabId = tabs[0]?.id ?? null
  return activeTabId
}

async function captureFromPage(mode, { quietIfEmpty = false } = {}) {
  showError('')
  elements.selection_button.disabled = true
  elements.page_button.disabled = true
  setCaptureMessage(mode === 'selection' ? 'Reading the selected text…' : 'Reading text visible on this page…')

  try {
    const tabId = activeTabId ?? await getActiveTabId()
    if (tabId === null) throw new Error('No active browser tab was available.')
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: (captureMode, maxChars) => {
        const selectedText = window.getSelection()?.toString().trim() ?? ''
        const pageText = (document.body?.innerText || document.documentElement?.innerText || '').trim()
        const text = captureMode === 'selection' ? selectedText : pageText
        return { text: text.slice(0, maxChars), totalLength: text.length }
      },
      args: [mode, MAX_QUICK_TEXT],
    })
    const captured = results[0]?.result

    if (!captured?.text) {
      if (quietIfEmpty) {
        if (!elements.contract_text.value.trim()) {
          elements.capture_source.textContent = 'Nothing selected · paste text or read visible page'
          setCaptureMessage('No selected text was found. Paste a clause below, or choose Read visible page.')
        } else {
          elements.capture_source.textContent = 'Edited or pasted text'
          setCaptureMessage('')
        }
        return
      }
      throw new Error(mode === 'selection'
        ? 'No text is selected. Select a passage, or paste the terms below.'
        : 'No readable page text was found. Try selecting text or paste it below.')
    }

    if (quietIfEmpty && elements.contract_text.value.trim()) {
      elements.capture_source.textContent = 'Edited or pasted text'
      setCaptureMessage('')
      return
    }
    elements.contract_text.value = captured.text
    elements.capture_source.textContent = mode === 'selection' ? 'Captured selected text from this tab' : 'Captured visible text from this tab'
    updateTextMeta()

    if (captured.totalLength > MAX_QUICK_TEXT) {
      setCaptureMessage(`Only the first ${MAX_QUICK_TEXT.toLocaleString()} characters were loaded. Later terms may be missing; use the full website for a long document.`)
    } else {
      setCaptureMessage('Check the captured text for unrelated page content before scanning.')
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'The page text could not be read.'
    if (quietIfEmpty && !elements.contract_text.value.trim() && detail.startsWith('No text is selected')) {
      elements.capture_source.textContent = 'Nothing selected · paste text or read visible page'
      setCaptureMessage('No selected text was found. Paste a clause below, or choose Read visible page.')
    } else {
      setCaptureMessage(`${detail} Browser-internal pages and some built-in PDF viewers block text capture. You can paste copied text instead.`)
    }
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
  category.textContent = finding.category || 'Contract wording'
  const risk = document.createElement('span')
  risk.className = 'finding-risk review'
  risk.textContent = 'Read closely'
  meta.append(category, risk)

  const heading = document.createElement('h3')
  heading.textContent = finding.title || 'Term to read more closely'
  card.append(meta, heading)

  if (finding.original_clause) {
    const quote = document.createElement('blockquote')
    quote.textContent = finding.original_clause
    card.append(quote)
  }
  if (finding.plain_language) {
    const explanation = document.createElement('p')
    explanation.className = 'finding-explanation'
    explanation.textContent = finding.plain_language
    card.append(explanation)
  }
  if (finding.why_it_matters) {
    const why = document.createElement('p')
    why.className = 'finding-why'
    why.textContent = `Why check it: ${finding.why_it_matters}`
    card.append(why)
  }
  if (finding.suggested_action) {
    const action = document.createElement('p')
    action.className = 'finding-action'
    const strong = document.createElement('strong')
    strong.textContent = 'Next: '
    action.append(strong, document.createTextNode(finding.suggested_action))
    card.append(action)
  }
  return card
}

function showReport(report) {
  elements.report.hidden = false
  elements.summary.textContent = report.contract_summary
  elements.findings.replaceChildren()

  const findings = Array.isArray(report.findings) ? report.findings : []
  elements.no_findings.hidden = findings.length !== 0
  for (const finding of findings.slice(0, MAX_VISIBLE_FINDINGS)) {
    elements.findings.append(createFindingCard(finding))
  }
  if (findings.length > MAX_VISIBLE_FINDINGS) {
    elements.more_findings.textContent = `Showing ${MAX_VISIBLE_FINDINGS} of ${findings.length} findings.`
    elements.more_findings.hidden = false
  } else {
    elements.more_findings.hidden = true
  }
  elements.report.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function runQuickCheck() {
  const text = elements.contract_text.value.trim()
  showError('')
  if (!text) return showError('Add contract terms before starting the quick check.')
  if (text.length > MAX_QUICK_TEXT) return showError('This quick check is limited to 40,000 characters. Use the website for a longer document.')
  showReport(scanContractText(text))
}

async function copyTextForWebsite() {
  const text = elements.contract_text.value.trim()
  if (!text) return
  elements.copy_message.hidden = true
  try {
    await navigator.clipboard.writeText(text)
    elements.copy_message.textContent = 'Copied. Open the full website and paste the text there; it is not transferred automatically.'
    elements.copy_message.classList.remove('error')
    elements.copy_message.hidden = false
  } catch {
    elements.copy_message.textContent = 'Clipboard access was unavailable. Select the text above and copy it manually, then open the full website.'
    elements.copy_message.classList.add('error')
    elements.copy_message.hidden = false
  }
}

elements.selection_button.addEventListener('click', () => captureFromPage('selection'))
elements.page_button.addEventListener('click', () => captureFromPage('page'))
elements.clear_button.addEventListener('click', () => {
  elements.contract_text.value = ''
  elements.capture_source.textContent = 'Nothing captured yet'
  setCaptureMessage('')
  updateTextMeta()
  elements.contract_text.focus()
})
elements.contract_text.addEventListener('input', () => {
  elements.capture_source.textContent = 'Edited or pasted text'
  updateTextMeta()
})
elements.review_button.addEventListener('click', runQuickCheck)
elements.copy_text_button.addEventListener('click', copyTextForWebsite)

async function initialize() {
  await getActiveTabId().catch(() => { activeTabId = null })
  if (activeTabId === null) {
    elements.capture_source.textContent = 'Paste text or open a webpage to capture it'
    setCaptureMessage('This tab does not allow text capture. You can still paste contract terms here.')
    return
  }
  await captureFromPage('selection', { quietIfEmpty: true })
}

initialize().catch((error) => {
  const detail = error instanceof Error ? error.message : 'The extension popup could not initialize.'
  elements.capture_source.textContent = 'Paste text to begin'
  setCaptureMessage(`${detail} You can still paste contract terms here.`)
})
