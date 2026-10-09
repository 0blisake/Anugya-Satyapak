import { useEffect, useRef, useState, type DragEvent } from 'react'
import { demoReport } from './mockReport'
import type { Finding, Report } from './types'

type Locale = 'en' | 'hi'
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const apiUrl = (path: string) => `${API_BASE_URL}${path}`

const copy = {
  en: {
    navSummary: 'Summary', navContact: 'Contact', jurisdiction: 'Reviewing for', language: 'Language',
    eyebrow: 'A clearer look at the fine print', headline: 'Know what you’re agreeing to.',
    intro: 'Drop in a contract. We’ll surface the terms that could affect your money, choices, or rights—in language that makes sense.',
    uploadTitle: 'Start with your contract', uploadHint: 'PDF, photo, or text · one file at a time', browse: 'Browse files', pasteTab: 'Paste text', uploadTab: 'Upload a file',
    drop: 'Drop your contract here', or: 'or', pastePlaceholder: 'Paste the terms and conditions here…', analyze: 'Review contract', analyzing: 'Reading your contract…',
    sample: 'Explore a sample report', sampleHint: 'See what a review looks like with a fictional subscription agreement.',
    looksFor: 'What we look for', lookOne: 'Renewals, cancellation & lock-in', lookTwo: 'Extra fees, penalties & refunds', lookThree: 'Changes, disputes & liability',
    privacy: 'Prototype notice', privacyText: 'Without an API, pasted text is scanned in your browser. With an API connected, files go to that server for processing. The prototype does not keep a contract database; check the host’s privacy settings before sharing real documents.',
    resultEyebrow: 'Your contract review', quick: 'Quick read', full: 'Detailed findings', sources: 'Sources & citations',
    download: 'Download report', print: 'Print / save PDF', found: 'items to review', allClear: 'No matching clauses were detected by this prototype scan.',
    original: 'Original clause', plain: 'In plain language', why: 'Why it may matter', next: 'What you can check', page: 'Page',
    review: 'Needs a closer look', moderate: 'Worth checking', info: 'For your awareness', confidence: 'Match confidence',
    citationNote: 'These sources are possible reference points, not a legal conclusion. A lawyer can assess how they apply to your situation.',
    disclaimer: 'Anugya Satyapak is an early prototype. It may miss terms or misread context. This report is general information, not legal advice.',
    lawyerTitle: 'Need advice for your situation?', lawyerText: 'A qualified lawyer can review the full contract and explain your options. Lawyer matching is not live in this prototype.',
    lawyerButton: 'Lawyer referrals coming soon', contactTitle: 'Contact the team', contactText: 'Questions or feedback? Contact details will be added before the public demo.',
    footerLine: 'Understand the terms. Make your own decision.', scanMode: 'Prototype scan', demoMode: 'Sample report', loadingError: 'Could not reach the analysis service.',
    backendHint: 'For PDF and photo extraction, start the local API. You can also paste contract text or use the sample report.', remove: 'Remove file',
  },
  hi: {
    navSummary: 'सारांश', navContact: 'संपर्क', jurisdiction: 'समीक्षा क्षेत्र', language: 'भाषा',
    eyebrow: 'छोटी लिखावट को स्पष्ट रूप से समझें', headline: 'जानें कि आप किन शर्तों से सहमत हो रहे हैं।',
    intro: 'समझौता अपलोड करें। हम उन शर्तों को सामने लाएँगे जो आपके पैसे, विकल्पों या अधिकारों को प्रभावित कर सकती हैं—सरल भाषा में।',
    uploadTitle: 'अपने समझौते से शुरू करें', uploadHint: 'PDF, फोटो या टेक्स्ट · एक बार में एक फ़ाइल', browse: 'फ़ाइल चुनें', pasteTab: 'टेक्स्ट पेस्ट करें', uploadTab: 'फ़ाइल अपलोड करें',
    drop: 'समझौता यहाँ छोड़ें', or: 'या', pastePlaceholder: 'नियम और शर्तें यहाँ पेस्ट करें…', analyze: 'समझौते की समीक्षा करें', analyzing: 'समझौता पढ़ रहे हैं…',
    sample: 'नमूना रिपोर्ट देखें', sampleHint: 'काल्पनिक सब्सक्रिप्शन समझौते की समीक्षा का उदाहरण देखें।',
    looksFor: 'हम क्या देखते हैं', lookOne: 'नवीनीकरण, रद्दीकरण और लॉक-इन', lookTwo: 'अतिरिक्त शुल्क, जुर्माना और रिफंड', lookThree: 'बदलाव, विवाद और ज़िम्मेदारी',
    privacy: 'प्रोटोटाइप सूचना', privacyText: 'API के बिना, पेस्ट किया गया टेक्स्ट आपके ब्राउज़र में स्कैन होता है। API जुड़ी हो तो फ़ाइलें प्रोसेसिंग के लिए उस सर्वर पर भेजी जाती हैं। यह प्रोटोटाइप समझौते संग्रहीत नहीं करता; असली दस्तावेज़ साझा करने से पहले होस्ट की गोपनीयता सेटिंग जाँचें।',
    resultEyebrow: 'आपके समझौते की समीक्षा', quick: 'संक्षिप्त जानकारी', full: 'विस्तृत निष्कर्ष', sources: 'स्रोत और उद्धरण',
    download: 'रिपोर्ट डाउनलोड करें', print: 'प्रिंट / PDF सेव करें', found: 'जाँचने योग्य बातें', allClear: 'इस प्रोटोटाइप स्कैन में कोई मेल खाती शर्त नहीं मिली।',
    original: 'मूल शर्त', plain: 'सरल भाषा में', why: 'यह क्यों मायने रख सकता है', next: 'आप क्या जाँच सकते हैं', page: 'पृष्ठ',
    review: 'ध्यान से जाँचें', moderate: 'जाँच करना उपयोगी होगा', info: 'जानकारी के लिए', confidence: 'मिलान का भरोसा',
    citationNote: 'ये संभावित संदर्भ स्रोत हैं, कानूनी निष्कर्ष नहीं। वकील बता सकते हैं कि ये आपकी स्थिति पर कैसे लागू होते हैं।',
    disclaimer: 'Anugya Satyapak शुरुआती प्रोटोटाइप है। यह शर्तें छोड़ सकता है या संदर्भ गलत समझ सकता है। यह सामान्य जानकारी है, कानूनी सलाह नहीं।',
    lawyerTitle: 'अपनी स्थिति पर सलाह चाहिए?', lawyerText: 'योग्य वकील पूरे समझौते की समीक्षा कर आपके विकल्प समझा सकते हैं। इस प्रोटोटाइप में वकील से मिलान की सुविधा उपलब्ध नहीं है।',
    lawyerButton: 'वकील रेफ़रल जल्द उपलब्ध होंगे', contactTitle: 'टीम से संपर्क करें', contactText: 'सवाल या सुझाव? सार्वजनिक डेमो से पहले संपर्क विवरण जोड़े जाएँगे।',
    footerLine: 'शर्तें समझें। अपना निर्णय स्वयं लें।', scanMode: 'प्रोटोटाइप स्कैन', demoMode: 'नमूना रिपोर्ट', loadingError: 'विश्लेषण सेवा से संपर्क नहीं हो सका।',
    backendHint: 'PDF और फोटो निकालने के लिए स्थानीय API शुरू करें। आप टेक्स्ट पेस्ट कर सकते हैं या नमूना रिपोर्ट देख सकते हैं।', remove: 'फ़ाइल हटाएँ',
  },
}

const sourceForRule = demoReport.citations

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true as const }
  if (name === 'logo') return <svg {...common}><path d="M12 3.3 19 6v5.3c0 4.4-2.9 7.7-7 9.4-4.1-1.7-7-5-7-9.4V6l7-2.7Z"/><path d="m8.7 12.1 2.2 2.1 4.5-4.7"/></svg>
  if (name === 'upload') return <svg {...common}><path d="M12 15V4m0 0L8 8m4-4 4 4"/><path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"/></svg>
  if (name === 'file') return <svg {...common}><path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10Z"/><path d="M13 3v7h7M8 14h8M8 17h6"/></svg>
  if (name === 'arrow') return <svg {...common}><path d="M5 12h14m-6-6 6 6-6 6"/></svg>
  if (name === 'check') return <svg {...common}><path d="m5 12 4 4L19 6"/></svg>
  if (name === 'spark') return <svg {...common}><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z"/><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"/></svg>
  if (name === 'shield') return <svg {...common}><path d="M12 3.3 19 6v5.3c0 4.4-2.9 7.7-7 9.4-4.1-1.7-7-5-7-9.4V6l7-2.7Z"/><path d="M12 8v4m0 3h.01"/></svg>
  if (name === 'download') return <svg {...common}><path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M5 17v3h14v-3"/></svg>
  if (name === 'link') return <svg {...common}><path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1"/></svg>
  return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 8v4l2.5 1.5"/></svg>
}

function localScan(text: string, fileName: string, jurisdiction: string): Report {
  const checks: { category: string; title: string; pattern: RegExp; plain: string; why: string }[] = [
    { category: 'Renewal & cancellation', title: 'Renewal or cancellation wording found', pattern: /auto(?:matic(?:ally)?)?[- ]?renew|renewal|cancel(?:lation)?|notice period|terminate/gi, plain: 'This passage discusses renewal, cancellation, or termination. Check the deadline and steps the contract requires.', why: 'A missed deadline or required notice method could affect when you can leave or stop paying.' },
    { category: 'Additional charges', title: 'A fee or extra charge is mentioned', pattern: /additional fee|service charge|processing fee|late fee|penalty|charge of|surcharge|non-refundable/gi, plain: 'This passage mentions a fee, penalty, or payment restriction. Check when it applies and how the amount is calculated.', why: 'The amount you pay may be higher than the headline price or harder to recover.' },
    { category: 'Refunds & termination', title: 'Refund or early-exit wording found', pattern: /refund|non-refundable|early termination|lock[- ]?in|minimum term|remaining subscription/gi, plain: 'This passage describes a refund, minimum term, or early-exit condition.', why: 'These conditions can affect the cost of ending the service or recovering payments.' },
    { category: 'Changes to terms', title: 'The provider may change terms', pattern: /we may (?:change|modify|revise|update)|at our (?:sole )?discretion|continued use.*(?:accept|agree)/gi, plain: 'The provider appears to reserve a right to change terms or treat continued use as acceptance.', why: 'Check how you will be notified, when changes take effect, and whether you can cancel.' },
    { category: 'Disputes', title: 'A dispute-resolution process is specified', pattern: /arbitrat(?:ion|or)|exclusive jurisdiction|courts? of|class action|dispute resolution/gi, plain: 'This passage sets out where or how disputes must be handled.', why: 'The location and process may affect how practical it is to raise a dispute.' },
    { category: 'Liability', title: 'A liability limit or exclusion is mentioned', pattern: /liabilit(?:y|ies)|indirect damages|consequential damages|maximum extent permitted|not be responsible/gi, plain: 'The provider appears to limit its responsibility for certain losses or claims.', why: 'Check which claims are covered and whether exceptions are listed elsewhere.' },
  ]
  const paragraphs = text.split(/(?<=[.!?;])\s+|\n+/).map((part) => part.trim()).filter(Boolean)
  const findings: Finding[] = []
  for (const check of checks) {
    const match = paragraphs.find((paragraph) => check.pattern.test(paragraph))
    check.pattern.lastIndex = 0
    if (!match) continue
    const chargeSources = /penalt|early termination|cancellation fee/i.test(match)
      ? sourceForRule.filter((source) => source.id === 'cp-act-2-46-ii')
      : /additional fee|service charge|processing fee|late fee|surcharge|charge of/i.test(match)
        ? sourceForRule.filter((source) => source.id === 'cp-act-2-46-vi')
        : []
    findings.push({
      id: `scan-${findings.length + 1}`,
      category: check.category,
      title: check.title,
      risk: 'Review',
      confidence: 0.58,
      page: null,
      original_clause: match,
      plain_language: check.plain,
      why_it_matters: check.why,
      suggested_action: 'Read the surrounding section and check any related definitions, exceptions, and notice terms.',
      citations: chargeSources,
    })
  }
  const citations = [...new Map(findings.flatMap((finding) => finding.citations).map((citation) => [citation.id, citation])).values()]
  return {
    report_id: `scan-${Date.now()}`,
    document_name: fileName || 'Pasted contract text',
    jurisdiction,
    language: 'English',
    analysis_mode: 'rules-prototype',
    contract_summary: 'This prototype uses keyword patterns to surface passages for a closer read. It does not determine whether a term is fair, enforceable, or unlawful.',
    findings,
    citations,
  }
}

function downloadReport(report: Report) {
  const lines = [
    'ANUGYA SATYAPAK · CONTRACT REVIEW',
    `${report.document_name} · ${report.jurisdiction}`,
    '',
    'PROTOTYPE NOTICE',
    'This is an automated prototype scan for general information, not legal advice. It may miss terms or misread context.',
    '',
    'QUICK SUMMARY',
    report.contract_summary,
    '',
    'FINDINGS',
    ...report.findings.flatMap((item, index) => [
      `${index + 1}. ${item.title} [${item.category}]`,
      `Original clause: ${item.original_clause}`,
      `In plain language: ${item.plain_language}`,
      `Why it may matter: ${item.why_it_matters}`,
      `What to check: ${item.suggested_action}`,
      item.citations.length ? `Sources: ${item.citations.map((citation) => `${citation.title}, ${citation.section} — ${citation.url}`).join('; ')}` : 'Sources: no specific source matched in this prototype.',
      '',
    ]),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${report.document_name.replace(/\.[^.]+$/, '').replace(/[^\w-]+/g, '-').toLowerCase() || 'contract-review'}-anugya-satyapak.txt`
  link.click()
  URL.revokeObjectURL(url)
}

function App() {
  const [locale, setLocale] = useState<Locale>('en')
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file')
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState('')
  const [jurisdiction, setJurisdiction] = useState('India · Central')
  const [report, setReport] = useState<Report | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const [backendReady, setBackendReady] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const t = copy[locale]
  const isHi = locale === 'hi'

  useEffect(() => {
    fetch(apiUrl('/api/health')).then((response) => setBackendReady(response.ok)).catch(() => setBackendReady(false))
  }, [])

  function chooseFile(next: File | undefined) {
    if (!next) return
    const allowed = /\.(pdf|png|jpe?g|webp|txt|md)$/i.test(next.name)
    if (!allowed) {
      setError('Choose a PDF, PNG, JPG, WEBP, TXT, or MD file.')
      return
    }
    if (next.size > 12 * 1024 * 1024) {
      setError('This prototype accepts files up to 12 MB.')
      return
    }
    setFile(next)
    setError('')
    setReport(null)
  }

  async function analyze() {
    setError('')
    setBusy(true)
    try {
      const form = new FormData()
      form.append('jurisdiction', jurisdiction)
      form.append('language', locale === 'hi' ? 'Hindi' : 'English')
      if (inputMode === 'text') {
        if (!text.trim()) {
          setError('Paste contract text before starting the review.')
          setBusy(false)
          return
        }
        form.append('text', text)
        if (backendReady) {
          try {
            const response = await fetch(apiUrl('/api/analyze'), { method: 'POST', body: form })
            if (!response.ok) throw new Error('API returned an error')
            setReport(await response.json() as Report)
          } catch {
            setReport(localScan(text, 'Pasted contract text', jurisdiction))
          }
        } else {
          setReport(localScan(text, 'Pasted contract text', jurisdiction))
        }
      } else {
        if (!file) {
          setError('Choose a contract file, paste text, or open the sample report.')
          setBusy(false)
          return
        }
        if (!backendReady) {
          if (/\.(txt|md)$/i.test(file.name)) {
            setReport(localScan(await file.text(), file.name, jurisdiction))
          } else {
            setError('The file analysis API is not running. ' + t.backendHint)
            setBusy(false)
            return
          }
        } else {
          form.append('file', file)
          const response = await fetch(apiUrl('/api/analyze'), { method: 'POST', body: form })
          const payload = await response.json()
          if (!response.ok) throw new Error(payload.detail || t.loadingError)
          setReport(payload as Report)
        }
      }
      window.setTimeout(() => document.getElementById('summary')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : t.loadingError)
    } finally {
      setBusy(false)
    }
  }

  function showSample() {
    setReport(demoReport)
    setError('')
    window.setTimeout(() => document.getElementById('summary')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    chooseFile(event.dataTransfer.files[0])
  }

  function summaryFor(finding: Finding) {
    if (isHi && report?.analysis_mode === 'demo') return finding.plain_language_hi || finding.plain_language
    return finding.plain_language
  }

  function reasonFor(finding: Finding) {
    if (isHi && report?.analysis_mode === 'demo') return finding.why_it_matters_hi || finding.why_it_matters
    return finding.why_it_matters
  }

  const fileInput = <input ref={fileRef} className="visually-hidden" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,application/pdf,image/png,image/jpeg,image/webp,text/plain" onChange={(event) => chooseFile(event.target.files?.[0])} />
  const findings = report?.findings ?? []
  const reviewCount = findings.filter((finding) => finding.risk !== 'Informational').length

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Anugya Satyapak home">
          <span className="brand-mark"><Icon name="logo" size={23} /></span>
          <span>Anugya <span className="brand-strong">Satyapak</span></span>
          <span className="brand-beta">BETA</span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#summary">{t.navSummary}</a>
          <a href="#contact">{t.navContact}</a>
        </nav>
        <div className="top-controls">
          <label className="select-control"><span>{t.jurisdiction}</span><select value={jurisdiction} onChange={(event) => setJurisdiction(event.target.value)} aria-label={t.jurisdiction}>
            <option>India · Central</option><option>India · Delhi</option><option>India · Maharashtra</option><option>India · Karnataka</option><option>Other / not sure</option>
          </select></label>
          <label className="select-control language-control"><span>{t.language}</span><select value={locale} onChange={(event) => setLocale(event.target.value as Locale)} aria-label={t.language}>
            <option value="en">English</option><option value="hi">हिन्दी</option>
          </select></label>
        </div>
      </header>

      <main id="top">
        <section className="hero-section page-width">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" />{t.eyebrow}</div>
            <h1>{t.headline}</h1>
            <p className="hero-intro">{t.intro}</p>
            <div className="trust-row"><span><Icon name="shield" size={17} /> Prototype · no account</span><span><Icon name="check" size={17} /> Original wording preserved</span></div>
          </div>
          <div className="hero-note"><span className="note-spark"><Icon name="spark" size={18} /></span><p>Important terms shouldn’t hide in the fine print.</p><span className="note-caption">A first-pass review, in plain language.</span></div>
        </section>

        <section className="workspace-grid page-width" aria-label="Contract review">
          <div className="upload-panel panel">
            <div className="panel-heading">
              <div><span className="step-label">01 / START HERE</span><h2>{t.uploadTitle}</h2></div>
              <div className={`api-status ${backendReady ? 'api-online' : ''}`}><span />{backendReady ? 'API connected' : 'Demo mode'}</div>
            </div>
            <div className="input-tabs" role="tablist" aria-label="Contract input type">
              <button className={inputMode === 'file' ? 'active' : ''} role="tab" aria-selected={inputMode === 'file'} onClick={() => { setInputMode('file'); setError('') }}><Icon name="upload" size={16} />{t.uploadTab}</button>
              <button className={inputMode === 'text' ? 'active' : ''} role="tab" aria-selected={inputMode === 'text'} onClick={() => { setInputMode('text'); setError('') }}><Icon name="file" size={16} />{t.pasteTab}</button>
            </div>
            {inputMode === 'file' ? <>
              {fileInput}
              <div className={`dropzone ${dragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`} onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
                {file ? <>
                  <span className="file-badge"><Icon name="file" size={22} /></span>
                  <div className="selected-file"><strong>{file.name}</strong><span>{(file.size / (1024 * 1024)).toFixed(2)} MB · ready to review</span></div>
                  <button className="text-button remove-file" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = '' }}>{t.remove}</button>
                </> : <>
                  <span className="upload-icon"><Icon name="upload" size={23} /></span>
                  <strong>{t.drop}</strong><span className="or-line">{t.or}</span>
                  <button className="browse-button" onClick={() => fileRef.current?.click()}>{t.browse}<Icon name="arrow" size={16} /></button>
                  <small>{t.uploadHint}</small>
                </>}
              </div>
              <button className="primary-button full-button" onClick={analyze} disabled={busy || !file}>{busy ? <><span className="spinner" />{t.analyzing}</> : <>{t.analyze}<Icon name="arrow" size={17} /></>}</button>
            </> : <>
              <label className="visually-hidden" htmlFor="contract-text">Paste contract text</label>
              <textarea id="contract-text" className="contract-textarea" placeholder={t.pastePlaceholder} value={text} onChange={(event) => { setText(event.target.value); setReport(null) }} />
              <div className="text-meta"><span>{text.trim() ? `${text.trim().split(/\s+/).length} words` : 'Your text stays in this browser in demo mode'}</span><span>Up to 80,000 characters</span></div>
              <button className="primary-button full-button" onClick={analyze} disabled={busy || !text.trim()}>{busy ? <><span className="spinner" />{t.analyzing}</> : <>{t.analyze}<Icon name="arrow" size={17} /></>}</button>
            </>}
            {error && <div className="error-message" role="alert"><Icon name="shield" size={17} />{error}</div>}
            <div className="demo-callout">
              <span className="demo-icon"><Icon name="spark" size={17} /></span>
              <div><strong>{t.sample}</strong><p>{t.sampleHint}</p></div>
              <button className="icon-button" aria-label={t.sample} onClick={showSample}><Icon name="arrow" size={17} /></button>
            </div>
          </div>

          <aside className="side-panel">
            <div className="side-card look-card">
              <div className="side-heading"><span className="side-icon"><Icon name="spark" size={17} /></span><h3>{t.looksFor}</h3></div>
              <ul className="look-list"><li><span>01</span>{t.lookOne}</li><li><span>02</span>{t.lookTwo}</li><li><span>03</span>{t.lookThree}</li></ul>
              <div className="coverage-note"><span className="coverage-line" />Focused on everyday consumer terms</div>
            </div>
            <div className="privacy-card"><div className="privacy-heading"><Icon name="shield" size={18} /><strong>{t.privacy}</strong></div><p>{t.privacyText}</p><div className="privacy-foot"><span className="privacy-dot" />No account required</div></div>
          </aside>
        </section>

        {!report && <section className="below-fold page-width">
          <div className="below-heading"><span className="step-label">A BETTER FIRST READ</span><h2>Know where to look before you agree.</h2><p>Anugya Satyapak keeps the original wording close, then explains why a term could deserve a second look.</p></div>
          <div className="value-grid"><article><span className="value-number">01</span><h3>Spot the detail</h3><p>Find renewals, extra charges, exit conditions, and other terms that shape the real cost.</p></article><article><span className="value-number">02</span><h3>Understand the effect</h3><p>Get a short explanation beside the clause, so the practical impact is easier to see.</p></article><article><span className="value-number">03</span><h3>Keep a record</h3><p>Download the review with the source wording and references ready for a closer conversation.</p></article></div>
        </section>}

        {report && <section id="summary" className="report-section page-width">
          <div className="report-header">
            <div><span className="step-label">02 / REVIEW</span><div className="report-title-row"><h2>{t.resultEyebrow}</h2><span className={`mode-pill ${report.analysis_mode === 'demo' ? 'sample-pill' : ''}`}>{report.analysis_mode === 'demo' ? t.demoMode : t.scanMode}</span></div><p className="report-file"><Icon name="file" size={15} />{report.document_name}<span>·</span>{report.jurisdiction}</p></div>
            <div className="report-actions"><button className="secondary-button" onClick={() => downloadReport(report)}><Icon name="download" size={17} />{t.download}</button><button className="quiet-button" onClick={() => window.print()}>{t.print}</button></div>
          </div>
          <div className="prototype-banner"><span className="banner-icon"><Icon name="spark" size={18} /></span><div><strong>{report.analysis_mode === 'demo' ? 'You’re viewing a fictional sample contract.' : 'This is a pattern-based prototype scan.'}</strong><p>{report.analysis_mode === 'demo' ? 'It demonstrates the report layout. The sample findings are illustrative and do not assess a real agreement.' : 'It surfaces wording for review. It does not determine whether a term is fair, enforceable, or unlawful.'}</p></div></div>
          {report.extraction_warning && <div className="warning-banner"><Icon name="shield" size={18} />{report.extraction_warning}</div>}
          <div className="summary-overview">
            <div className="overview-main"><div className="section-kicker"><span className="status-dot" />{t.quick}</div><p>{isHi && report.analysis_mode === 'demo' ? (report.contract_summary_hi || report.contract_summary) : report.contract_summary}</p><div className="summary-count"><strong>{reviewCount}</strong><span>{t.found}</span><span className="count-divider" /><span>{findings.length} total</span></div></div>
            <div className="summary-stat"><span className="stat-label">TERMS SURFACED</span><strong>{findings.length.toString().padStart(2, '0')}</strong><span>Across {new Set(findings.map((finding) => finding.category)).size} categories</span></div>
            <div className="summary-stat"><span className="stat-label">SOURCE LINKS</span><strong>{report.citations.length.toString().padStart(2, '0')}</strong><span>For further review</span></div>
          </div>
          <div className="quick-findings">
            {findings.length ? findings.slice(0, 3).map((finding, index) => <a key={finding.id} className="quick-card" href={`#finding-${finding.id}`}>
              <span className="quick-index">0{index + 1}</span><span className="quick-card-copy"><small>{finding.category}</small><strong>{finding.title}</strong></span><span className={`risk-dot risk-${finding.risk.toLowerCase()}`} /><Icon name="arrow" size={16} />
            </a>) : <div className="empty-result"><Icon name="check" size={18} />{t.allClear}</div>}
          </div>

          <div className="findings-heading"><div><span className="step-label">03 / THE DETAILS</span><h2>{t.full}</h2></div><span className="finding-count">{findings.length} findings</span></div>
          <div className="findings-list">
            {findings.map((finding, index) => <article id={`finding-${finding.id}`} key={finding.id} className="finding-card">
              <div className="finding-top"><span className="finding-index">{String(index + 1).padStart(2, '0')}</span><div className="finding-title"><span className="category-label">{finding.category}{finding.page ? ` · ${t.page} ${finding.page}` : ''}</span><h3>{finding.title}</h3></div><span className={`risk-pill risk-pill-${finding.risk.toLowerCase()}`}><span />{finding.risk === 'Informational' ? t.info : finding.risk === 'Moderate' ? t.moderate : t.review}</span></div>
              <div className="finding-body"><div className="clause-quote"><div className="body-label"><span className="quote-mark">“</span>{t.original}</div><blockquote>{finding.original_clause}</blockquote></div><div className="explanation-grid"><div><div className="body-label">{t.plain}</div><p>{summaryFor(finding)}</p></div><div><div className="body-label">{t.why}</div><p>{reasonFor(finding)}</p></div></div><div className="next-step"><span className="next-icon"><Icon name="check" size={15} /></span><p><strong>{t.next}:</strong> {finding.suggested_action}</p></div></div>
              <div className="finding-footer"><span><Icon name="spark" size={14} />{t.confidence}: {Math.round(finding.confidence * 100)}% <span className="confidence-note">(pattern match)</span></span>{finding.citations.length > 0 && <a href="#sources">View source <Icon name="arrow" size={14} /></a>}</div>
            </article>)}
          </div>

          <section id="sources" className="sources-section">
            <div className="sources-heading"><div><span className="step-label">04 / REFERENCE</span><h2>{t.sources}</h2></div><span className="source-count"><Icon name="link" size={15} />{report.citations.length} source{report.citations.length === 1 ? '' : 's'}</span></div>
            {report.citations.length ? <><p className="sources-intro">Legal references matched to selected findings. Open the official source to read the provision in context.</p><div className="source-list">{report.citations.map((citation) => <article className="source-card" key={citation.id}><div className="source-badge"><Icon name="file" size={18} /></div><div className="source-content"><span className="source-act">{citation.title}</span><h3>{citation.section}</h3><p>{citation.description}</p><div className="source-relevance"><strong>Why it appears</strong><span>{citation.relevance}</span></div></div><a className="source-link" href={citation.url} target="_blank" rel="noreferrer" aria-label={`Open ${citation.title} source`}><Icon name="arrow" size={17} /></a></article>)}</div><p className="citation-note"><Icon name="shield" size={17} />{t.citationNote}</p></> : <div className="no-sources"><span className="source-badge"><Icon name="link" size={18} /></span><div><strong>No specific legal source matched these findings.</strong><p>This prototype only displays citations from its reviewed source list. That does not mean no law applies.</p></div></div>}
          </section>
          {isHi && report.analysis_mode !== 'demo' && <p className="translation-note">अभी नई रिपोर्टों के लिए अनुवाद सुविधा उपलब्ध नहीं है। मूल अनुबंध का पाठ बिना बदलाव दिखाया गया है।</p>}
        </section>}

        <section id="contact" className="support-section page-width">
          <div className="support-card"><div className="support-icon"><Icon name="shield" size={23} /></div><div><span className="step-label">A NEXT STEP, WHEN YOU NEED IT</span><h2>{t.lawyerTitle}</h2><p>{t.lawyerText}</p></div><button className="support-button" disabled>{t.lawyerButton}<Icon name="arrow" size={16} /></button></div>
          <div className="contact-strip"><div><span className="step-label">GET IN TOUCH</span><h3>{t.contactTitle}</h3><p>{t.contactText}</p></div><span className="contact-mark">AS<span>·</span></span></div>
        </section>
      </main>

      <footer className="site-footer"><div className="footer-inner page-width"><a className="brand footer-brand" href="#top"><span className="brand-mark"><Icon name="logo" size={21} /></span><span>Anugya <span className="brand-strong">Satyapak</span></span></a><p>{t.footerLine}</p><span>© 2026 Anugya Satyapak · Prototype</span></div><div className="footer-disclaimer page-width"><Icon name="shield" size={15} />{t.disclaimer}</div></footer>
    </div>
  )
}

export default App
