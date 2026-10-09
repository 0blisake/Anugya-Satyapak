import { useEffect, useRef, useState, type DragEvent } from 'react'
import { demoReport } from './mockReport'
import type { ApiHealth, ExtractionResult, Finding, Report } from './types'

type Locale = 'en' | 'hi'
const IS_LOCAL_APP = import.meta.env.DEV
const apiUrl = (path: string) => path
const MAX_FILE_BYTES = 12 * 1024 * 1024
const MAX_BATCH_BYTES = 30 * 1024 * 1024
const MAX_BATCH_FILES = 10
const MAX_TEXT_CHARS = 250_000
const SUPPORTED_FILE = /\.(pdf|png|jpe?g|webp|txt|md)$/i
const IMAGE_FILE = /\.(png|jpe?g|webp)$/i

const copy = {
  en: {
    navSummary: 'Summary', navContact: 'Contact', jurisdiction: 'Reviewing for', language: 'Language',
    eyebrow: 'A clearer look at the fine print', headline: 'Know what you’re agreeing to.',
    intro: 'Paste contract text for a first-pass scan that runs in your browser. PDF and photo review is available in the local version on your laptop.',
    localIntro: 'Paste text, or extract a PDF or photos with the service running on this laptop. Review uses prototype rules unless you configure AI.',
    uploadTitle: 'Start with your contract', uploadHint: 'One PDF or text file, or up to 10 screenshots · 12 MB each / 30 MB total', browse: 'Choose files', pasteTab: 'Paste text', uploadTab: 'Upload file(s)',
    batchHint: 'For screenshots, select them in page order. You can reorder them below.', prepare: 'Extract text for review', preparing: 'Reading your file(s)…', reExtract: 'Extract again', extractedTitle: 'Check the extracted text', extractedHint: 'OCR can make mistakes. Correct the text here before reviewing it.',
    pages: 'pages', moveUp: 'Move page up', moveDown: 'Move page down', clearFiles: 'Clear files', ocrUnavailable: 'Photo and scanned-page OCR is not ready on this laptop:', fileOffline: 'The local file service is not running. Start it on this laptop; text review still works in your browser.',
    publicFilesNote: 'PDF and photo review runs locally from your laptop. This public page does not upload your pasted text.', publicFilesLink: 'See the local setup guide',
    drop: 'Drop a contract or screenshots here', or: 'or', pastePlaceholder: 'Paste the terms and conditions here…', analyze: 'Review contract', analyzing: 'Reviewing your contract…',
    sample: 'Explore a sample report', sampleHint: 'See what a review looks like with a fictional subscription agreement.',
    looksFor: 'What we look for', lookOne: 'Renewals, cancellation & lock-in', lookTwo: 'Extra fees, penalties & refunds', lookThree: 'Changes, disputes & liability',
    privacy: 'Prototype notice', privacyPublicText: 'Public text review runs in this browser; pasted text is not sent to a server. This is an English-focused pattern scan and can miss clauses. PDF and photo review is available in the private local version.',
    privacyLocalText: 'When the local API is running, files and pasted text are sent to it on this laptop for review. If you configure AI, corrected text is sent to OpenAI only after you consent. Use documents you are permitted to process.',
    resultEyebrow: 'Your contract review', quick: 'Quick read', full: 'Detailed findings', sources: 'Sources & citations',
    download: 'Download report', print: 'Print / save PDF', found: 'items to review', allClear: 'No matching clauses were detected by this prototype scan.',
    original: 'Original clause', plain: 'In plain language', why: 'Why it may matter', next: 'What you can check', page: 'Page',
    review: 'Needs a closer look', moderate: 'Worth checking', info: 'For your awareness', confidence: 'Evidence clarity', confidenceLow: 'Low', confidenceMedium: 'Medium', confidenceHigh: 'High', uncertainties: 'Context to check',
    aiConsent: 'I understand that the corrected contract text will be sent to the Anugya Satyapak API and OpenAI for analysis. I will share only text I am permitted to submit.', aiConsentRequired: 'Confirm the AI processing notice before starting this review.',
    aiMode: 'AI-assisted prototype', rulesMode: 'Rules-based prototype', aiBannerTitle: 'AI-assisted first-pass review', aiBannerText: 'AI suggestions are shown only when their quoted evidence matches the supplied text. Approved source records are attached by the API. This can still miss terms or misread context and is not legal advice.',
    rulesBannerTitle: 'This is a pattern-based prototype scan.', rulesBannerText: 'It surfaces wording for review. It does not determine whether a term is fair, enforceable, or unlawful.',
    citationNote: 'These sources are possible reference points, not a legal conclusion. A lawyer can assess how they apply to your situation.',
    disclaimer: 'Anugya Satyapak is an early prototype. It may miss terms or misread context. This report is general information, not legal advice.',
    lawyerTitle: 'Need advice for your situation?', lawyerText: 'A qualified lawyer can review the full contract and explain your options. Lawyer matching is not live in this prototype.',
    lawyerButton: 'Lawyer referrals coming soon', contactTitle: 'Contact the team', contactText: 'Questions or feedback? Contact details will be added before the public demo.',
    footerLine: 'Understand the terms. Make your own decision.', scanMode: 'Prototype scan', demoMode: 'Sample report', loadingError: 'Could not reach the analysis service.',
    backendHint: 'Start the local service on this laptop to extract PDFs and photos. You can also paste text or use the sample report.', remove: 'Remove file',
    apiReady: 'AI review ready', apiRules: 'Rules-based mode', apiAiNoOcr: 'AI ready · OCR unavailable', apiRulesNoOcr: 'Rules mode · OCR unavailable', apiDemo: 'Local API offline', publicMode: 'Browser text mode', publicTextMeta: 'Your text stays in this browser · English-focused pattern scan', localTextMeta: 'Text is reviewed locally unless optional AI is enabled',
  },
  hi: {
    navSummary: 'सारांश', navContact: 'संपर्क', jurisdiction: 'समीक्षा क्षेत्र', language: 'भाषा',
    eyebrow: 'छोटी लिखावट को स्पष्ट रूप से समझें', headline: 'जानें कि आप किन शर्तों से सहमत हो रहे हैं।',
    intro: 'पहली जाँच के लिए समझौते का टेक्स्ट पेस्ट करें; समीक्षा इसी ब्राउज़र में होगी। PDF और फोटो की समीक्षा आपके लैपटॉप पर चलने वाले स्थानीय संस्करण में उपलब्ध है।',
    localIntro: 'टेक्स्ट पेस्ट करें या इस लैपटॉप पर चलने वाली सेवा से PDF और फोटो का टेक्स्ट निकालें। AI सेट न करने पर समीक्षा प्रोटोटाइप नियमों से होगी।',
    uploadTitle: 'अपने समझौते से शुरू करें', uploadHint: 'एक PDF या टेक्स्ट फ़ाइल, या अधिकतम 10 स्क्रीनशॉट · हर फ़ाइल 12 MB, कुल 30 MB तक', browse: 'फ़ाइलें चुनें', pasteTab: 'टेक्स्ट पेस्ट करें', uploadTab: 'फ़ाइलें अपलोड करें',
    batchHint: 'स्क्रीनशॉट को पेज के क्रम में चुनें। नीचे उनका क्रम बदला जा सकता है।', prepare: 'समीक्षा के लिए टेक्स्ट निकालें', preparing: 'फ़ाइलें पढ़ रहे हैं…', reExtract: 'फिर से टेक्स्ट निकालें', extractedTitle: 'निकाले गए टेक्स्ट की जाँच करें', extractedHint: 'OCR में गलती हो सकती है। समीक्षा से पहले यहाँ टेक्स्ट ठीक करें।',
    pages: 'पृष्ठ', moveUp: 'पृष्ठ ऊपर ले जाएँ', moveDown: 'पृष्ठ नीचे ले जाएँ', clearFiles: 'फ़ाइलें हटाएँ', ocrUnavailable: 'इस लैपटॉप पर फोटो और स्कैन किए गए पेज का OCR उपलब्ध नहीं है:', fileOffline: 'स्थानीय फ़ाइल सेवा नहीं चल रही। इसे इस लैपटॉप पर शुरू करें; टेक्स्ट की समीक्षा ब्राउज़र में फिर भी हो सकती है।',
    publicFilesNote: 'PDF और फोटो की समीक्षा आपके लैपटॉप पर स्थानीय रूप से होती है। यह सार्वजनिक पेज पेस्ट किए गए टेक्स्ट को अपलोड नहीं करता।', publicFilesLink: 'स्थानीय सेटअप निर्देश देखें',
    drop: 'समझौता या स्क्रीनशॉट यहाँ छोड़ें', or: 'या', pastePlaceholder: 'नियम और शर्तें यहाँ पेस्ट करें…', analyze: 'समझौते की समीक्षा करें', analyzing: 'समीक्षा कर रहे हैं…',
    sample: 'नमूना रिपोर्ट देखें', sampleHint: 'काल्पनिक सब्सक्रिप्शन समझौते की समीक्षा का उदाहरण देखें।',
    looksFor: 'हम क्या देखते हैं', lookOne: 'नवीनीकरण, रद्दीकरण और लॉक-इन', lookTwo: 'अतिरिक्त शुल्क, जुर्माना और रिफंड', lookThree: 'बदलाव, विवाद और ज़िम्मेदारी',
    privacy: 'प्रोटोटाइप सूचना', privacyPublicText: 'सार्वजनिक टेक्स्ट समीक्षा इसी ब्राउज़र में होती है; पेस्ट किया गया टेक्स्ट सर्वर पर नहीं भेजा जाता। यह मुख्यतः अंग्रेज़ी शब्दों पर आधारित पैटर्न स्कैन है और शर्तें छूट सकती हैं। PDF और फोटो की समीक्षा स्थानीय संस्करण में उपलब्ध है।',
    privacyLocalText: 'स्थानीय API चलने पर फ़ाइलें और पेस्ट किया गया टेक्स्ट समीक्षा के लिए इसी लैपटॉप पर भेजे जाते हैं। AI सेट करने पर सुधारा गया टेक्स्ट आपकी सहमति के बाद ही OpenAI को भेजा जाता है। केवल वही दस्तावेज़ इस्तेमाल करें जिन्हें प्रोसेस करने की अनुमति आपके पास है।',
    resultEyebrow: 'आपके समझौते की समीक्षा', quick: 'संक्षिप्त जानकारी', full: 'विस्तृत निष्कर्ष', sources: 'स्रोत और उद्धरण',
    download: 'रिपोर्ट डाउनलोड करें', print: 'प्रिंट / PDF सेव करें', found: 'जाँचने योग्य बातें', allClear: 'इस प्रोटोटाइप स्कैन में कोई मेल खाती शर्त नहीं मिली।',
    original: 'मूल शर्त', plain: 'सरल भाषा में', why: 'यह क्यों मायने रख सकता है', next: 'आप क्या जाँच सकते हैं', page: 'पृष्ठ',
    review: 'ध्यान से जाँचें', moderate: 'जाँच करना उपयोगी होगा', info: 'जानकारी के लिए', confidence: 'साक्ष्य की स्पष्टता', confidenceLow: 'कम', confidenceMedium: 'मध्यम', confidenceHigh: 'अधिक', uncertainties: 'जाँचने योग्य संदर्भ',
    aiConsent: 'मैं समझता/समझती हूँ कि सुधारा गया समझौता-पाठ विश्लेषण के लिए Anugya Satyapak API और OpenAI को भेजा जाएगा। मैं केवल वही पाठ साझा करूँगा/करूँगी जिसे भेजने की अनुमति मेरे पास है।', aiConsentRequired: 'समीक्षा शुरू करने से पहले AI प्रोसेसिंग सूचना की पुष्टि करें।',
    aiMode: 'AI-सहायित प्रोटोटाइप', rulesMode: 'नियम-आधारित प्रोटोटाइप', aiBannerTitle: 'AI-सहायित प्रारंभिक समीक्षा', aiBannerText: 'AI सुझाव तभी दिखते हैं जब उद्धृत साक्ष्य दिए गए पाठ से मेल खाता है। API केवल स्वीकृत स्रोत रिकॉर्ड जोड़ता है। फिर भी कुछ शर्तें छूट सकती हैं या संदर्भ गलत समझा जा सकता है; यह कानूनी सलाह नहीं है।',
    rulesBannerTitle: 'यह नियम-आधारित प्रोटोटाइप स्कैन है।', rulesBannerText: 'यह जाँच योग्य शब्दों को सामने लाता है। यह तय नहीं करता कि कोई शर्त उचित, लागू करने योग्य या गैरकानूनी है।',
    citationNote: 'ये संभावित संदर्भ स्रोत हैं, कानूनी निष्कर्ष नहीं। वकील बता सकते हैं कि ये आपकी स्थिति पर कैसे लागू होते हैं।',
    disclaimer: 'Anugya Satyapak शुरुआती प्रोटोटाइप है। यह शर्तें छोड़ सकता है या संदर्भ गलत समझ सकता है। यह सामान्य जानकारी है, कानूनी सलाह नहीं।',
    lawyerTitle: 'अपनी स्थिति पर सलाह चाहिए?', lawyerText: 'योग्य वकील पूरे समझौते की समीक्षा कर आपके विकल्प समझा सकते हैं। इस प्रोटोटाइप में वकील से मिलान की सुविधा उपलब्ध नहीं है।',
    lawyerButton: 'वकील रेफ़रल जल्द उपलब्ध होंगे', contactTitle: 'टीम से संपर्क करें', contactText: 'सवाल या सुझाव? सार्वजनिक डेमो से पहले संपर्क विवरण जोड़े जाएँगे।',
    footerLine: 'शर्तें समझें। अपना निर्णय स्वयं लें।', scanMode: 'प्रोटोटाइप स्कैन', demoMode: 'नमूना रिपोर्ट', loadingError: 'विश्लेषण सेवा से संपर्क नहीं हो सका।',
    backendHint: 'PDF और फोटो से टेक्स्ट निकालने के लिए इस लैपटॉप पर स्थानीय सेवा शुरू करें। आप टेक्स्ट पेस्ट कर सकते हैं या नमूना रिपोर्ट देख सकते हैं।', remove: 'फ़ाइल हटाएँ',
    apiReady: 'AI समीक्षा उपलब्ध', apiRules: 'नियम-आधारित मोड', apiAiNoOcr: 'AI उपलब्ध · OCR नहीं', apiRulesNoOcr: 'नियम मोड · OCR नहीं', apiDemo: 'स्थानीय API बंद है', publicMode: 'ब्राउज़र टेक्स्ट मोड', publicTextMeta: 'आपका टेक्स्ट इसी ब्राउज़र में रहता है · अंग्रेज़ी पैटर्न स्कैन', localTextMeta: 'वैकल्पिक AI चालू न हो तो समीक्षा स्थानीय रूप से होती है',
  },
}

const sourceForRule = demoReport.citations

async function apiErrorMessage(response: Response, fallback: string) {
  try {
    const payload = await response.json() as { detail?: unknown }
    if (typeof payload.detail === 'string') return payload.detail
    if (Array.isArray(payload.detail)) {
      return payload.detail.map((item) => typeof item === 'object' && item && 'msg' in item ? String(item.msg) : String(item)).join('; ')
    }
  } catch {
    // Keep the user-facing fallback when the server did not return JSON.
  }
  return fallback
}

function formatBytes(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

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
  const [inputMode, setInputMode] = useState<'file' | 'text'>(IS_LOCAL_APP ? 'file' : 'text')
  const [files, setFiles] = useState<File[]>([])
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null)
  const [extractedText, setExtractedText] = useState('')
  const [text, setText] = useState('')
  const [jurisdiction, setJurisdiction] = useState('India · Central')
  const [report, setReport] = useState<Report | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const [backendReady, setBackendReady] = useState(false)
  const [aiAvailable, setAiAvailable] = useState(false)
  const [aiMessage, setAiMessage] = useState('')
  const [aiConsent, setAiConsent] = useState(false)
  const [ocrAvailable, setOcrAvailable] = useState<boolean | null>(null)
  const [ocrMessage, setOcrMessage] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const t = copy[locale]
  const isHi = locale === 'hi'

  useEffect(() => {
    if (!IS_LOCAL_APP) return
    let active = true
    fetch(apiUrl('/api/health'))
      .then(async (response) => {
        if (!response.ok) throw new Error('API health check failed')
        const health = await response.json() as ApiHealth
        if (!active) return
        setBackendReady(health.status === 'ok')
        setAiAvailable(health.ai_available === true)
        setAiMessage(typeof health.ai_message === 'string' ? health.ai_message : '')
        setOcrAvailable(typeof health.ocr_available === 'boolean' ? health.ocr_available : null)
        setOcrMessage(typeof health.ocr_message === 'string' ? health.ocr_message : '')
      })
      .catch(() => {
        if (!active) return
        setBackendReady(false)
        setAiAvailable(false)
        setAiMessage('')
        setOcrAvailable(null)
        setOcrMessage('')
      })
    return () => { active = false }
  }, [])

  function chooseFiles(nextFiles: File[]) {
    if (!nextFiles.length) return
    if (busy) {
      setError('Wait for the current file operation to finish before changing the upload.')
      return
    }
    if (nextFiles.length > MAX_BATCH_FILES) {
      setError(`Choose ${MAX_BATCH_FILES} files or fewer at a time.`)
      return
    }
    const unsupported = nextFiles.find((next) => !SUPPORTED_FILE.test(next.name))
    if (unsupported) {
      setError(`${unsupported.name}: choose a PDF, PNG, JPG, WEBP, TXT, or MD file.`)
      return
    }
    const tooLarge = nextFiles.find((next) => next.size > MAX_FILE_BYTES)
    if (tooLarge) {
      setError(`${tooLarge.name}: each file must be 12 MB or smaller.`)
      return
    }
    if (nextFiles.length > 1 && !nextFiles.every((next) => IMAGE_FILE.test(next.name))) {
      setError('Select one PDF or text file, or select multiple screenshots only.')
      return
    }
    const batchSize = nextFiles.reduce((total, next) => total + next.size, 0)
    if (batchSize > MAX_BATCH_BYTES) {
      setError('The selected files total more than 30 MB. Choose fewer or smaller screenshots.')
      return
    }
    setFiles(nextFiles)
    setExtraction(null)
    setExtractedText('')
    setAiConsent(false)
    setError('')
    setReport(null)
  }

  function removeFile(index: number) {
    const remaining = files.filter((_, current) => current !== index)
    setFiles(remaining)
    setExtraction(null)
    setExtractedText('')
    setAiConsent(false)
    setReport(null)
    setError('')
    if (!remaining.length && fileRef.current) fileRef.current.value = ''
  }

  function clearFiles() {
    setFiles([])
    setExtraction(null)
    setExtractedText('')
    setAiConsent(false)
    setReport(null)
    setError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  function moveFile(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= files.length) return
    const reordered = [...files]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    setFiles(reordered)
    setExtraction(null)
    setExtractedText('')
    setAiConsent(false)
    setReport(null)
    setError('')
  }

  async function prepareFiles() {
    if (!files.length) {
      setError('Choose a PDF, text file, or screenshots before extracting text.')
      return
    }
    setError('')
    setBusy(true)
    try {
      let result: ExtractionResult
      if (backendReady) {
        const form = new FormData()
        files.forEach((selected) => form.append('files', selected))
        const response = await fetch(apiUrl('/api/extract'), { method: 'POST', body: form })
        if (!response.ok) throw new Error(await apiErrorMessage(response, 'The API could not extract this file.'))
        result = await response.json() as ExtractionResult
      } else if (files.length === 1 && /\.(txt|md)$/i.test(files[0].name)) {
        const content = (await files[0].text()).trim()
        if (!content) throw new Error('This text file is empty.')
        if (content.length > MAX_TEXT_CHARS) throw new Error(`The extracted text is longer than ${MAX_TEXT_CHARS.toLocaleString()} characters. Split the document into smaller parts.`)
        result = { document_name: files[0].name, source_files: [files[0].name], extracted_text: content, page_count: 1, warnings: [] }
      } else {
        throw new Error(t.fileOffline)
      }

      if (!result.extracted_text?.trim()) throw new Error('No readable text was returned. Try a clearer file or paste the text instead.')
      setExtraction(result)
      setExtractedText(result.extracted_text)
      setAiConsent(false)
      setReport(null)
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'Could not extract text from the selected file(s).')
    } finally {
      setBusy(false)
    }
  }

  async function analyze() {
    setError('')
    if (backendReady && aiAvailable && !aiConsent) {
      setError(t.aiConsentRequired)
      return
    }
    const reviewText = inputMode === 'text' ? text.trim() : extractedText.trim()
    const documentName = inputMode === 'text' ? 'Pasted contract text' : extraction?.document_name
    if (!reviewText) {
      setError(inputMode === 'text' ? 'Paste contract text before starting the review.' : 'Extract the file text first, then review it.')
      return
    }
    if (reviewText.length > MAX_TEXT_CHARS) {
      setError(`Text must be ${MAX_TEXT_CHARS.toLocaleString()} characters or fewer. Split the document into smaller parts.`)
      return
    }

    setBusy(true)
    try {
      const form = new FormData()
      form.append('jurisdiction', jurisdiction)
      form.append('language', locale === 'hi' ? 'Hindi' : 'English')
      form.append('text', reviewText)
      form.append('ai_consent', String(backendReady && aiAvailable && aiConsent))
      if (documentName) form.append('document_name', documentName)

      if (backendReady) {
        const response = await fetch(apiUrl('/api/analyze'), { method: 'POST', body: form })
        if (!response.ok) throw new Error(await apiErrorMessage(response, t.loadingError))
        setReport(await response.json() as Report)
      } else {
        const localReport = localScan(reviewText, documentName || 'Pasted contract text', jurisdiction)
        if (inputMode === 'file' && extraction?.warnings.length) localReport.extraction_warning = extraction.warnings.join(' ')
        setReport(localReport)
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
    setAiConsent(false)
    setError('')
    window.setTimeout(() => document.getElementById('summary')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    chooseFiles(Array.from(event.dataTransfer.files))
  }

  function summaryFor(finding: Finding) {
    if (isHi && report?.analysis_mode === 'demo') return finding.plain_language_hi || finding.plain_language
    return finding.plain_language
  }

  function reasonFor(finding: Finding) {
    if (isHi && report?.analysis_mode === 'demo') return finding.why_it_matters_hi || finding.why_it_matters
    return finding.why_it_matters
  }

  function confidenceDetails(finding: Finding) {
    if (typeof finding.confidence === 'number') return `${Math.round(finding.confidence * 100)}% (pattern match)`
    const label = finding.confidence === 'high' ? t.confidenceHigh : finding.confidence === 'medium' ? t.confidenceMedium : t.confidenceLow
    return `${t.confidence}: ${label}`
  }

  const fileInput = <input ref={fileRef} className="visually-hidden" type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,application/pdf,image/png,image/jpeg,image/webp,text/plain" onChange={(event) => { chooseFiles(Array.from(event.target.files ?? [])); event.target.value = '' }} />
  const findings = report?.findings ?? []
  const reviewCount = findings.filter((finding) => finding.risk !== 'Informational').length

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Anugya Satyapak home">
          <span className="brand-mark"><Icon name="logo" size={23} /><img src={`${import.meta.env.BASE_URL}brand/logo-mark.svg`} alt="" onError={(event) => { event.currentTarget.style.display = 'none'; event.currentTarget.parentElement?.classList.add('brand-mark-fallback') }} /></span>
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
            <p className="hero-intro">{IS_LOCAL_APP ? t.localIntro : t.intro}</p>
            <div className="trust-row"><span><Icon name="shield" size={17} /> Prototype · no account</span><span><Icon name="check" size={17} /> Original wording preserved</span></div>
          </div>
          <div className="hero-note"><span className="note-spark"><Icon name="spark" size={18} /></span><p>Important terms shouldn’t hide in the fine print.</p><span className="note-caption">A first-pass review, in plain language.</span></div>
        </section>

        <section className="workspace-grid page-width" aria-label="Contract review">
          <div className="upload-panel panel">
            <div className="panel-heading">
              <div><span className="step-label">01 / START HERE</span><h2>{t.uploadTitle}</h2></div>
              <div className={`api-status ${!IS_LOCAL_APP || backendReady ? 'api-online' : ''}`} title={IS_LOCAL_APP && backendReady ? [aiMessage, ocrAvailable === false ? ocrMessage : ''].filter(Boolean).join(' ') : undefined}><span />{!IS_LOCAL_APP ? t.publicMode : !backendReady ? t.apiDemo : aiAvailable ? (ocrAvailable === false ? t.apiAiNoOcr : t.apiReady) : (ocrAvailable === false ? t.apiRulesNoOcr : t.apiRules)}</div>
            </div>
            {IS_LOCAL_APP && <div className="input-tabs" role="tablist" aria-label="Contract input type">
              <button className={inputMode === 'file' ? 'active' : ''} role="tab" aria-selected={inputMode === 'file'} disabled={busy} onClick={() => { setInputMode('file'); setAiConsent(false); setError('') }}><Icon name="upload" size={16} />{t.uploadTab}</button>
              <button className={inputMode === 'text' ? 'active' : ''} role="tab" aria-selected={inputMode === 'text'} disabled={busy} onClick={() => { setInputMode('text'); setAiConsent(false); setError('') }}><Icon name="file" size={16} />{t.pasteTab}</button>
            </div>}
            {IS_LOCAL_APP && inputMode === 'file' ? <>
              {fileInput}
              <div className={`dropzone ${dragging ? 'dragging' : ''} ${files.length ? 'has-file' : ''}`} onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
                {files.length ? <>
                  <div className="file-queue-heading"><div><strong>{files.length === 1 ? files[0].name : `${files.length} screenshots selected`}</strong><span>{formatBytes(files.reduce((total, selected) => total + selected.size, 0))} total · {files.length === 1 ? '1 file' : `${files.length} pages in selected order`}</span></div></div>
                  <ul className="selected-file-list">
                    {files.map((selected, index) => <li className="selected-file-row" key={`${selected.name}-${selected.size}-${selected.lastModified}-${index}`}>
                      <span className="file-badge"><Icon name="file" size={19} /></span>
                      <div className="selected-file"><strong>{files.length > 1 ? `${t.page} ${index + 1} · ` : ''}{selected.name}</strong><span>{formatBytes(selected.size)}</span></div>
                      {files.length > 1 && <div className="file-order-controls">
                        <button type="button" className="order-button" aria-label={`${t.moveUp}: ${selected.name}`} title={t.moveUp} disabled={index === 0 || busy} onClick={() => moveFile(index, -1)}>↑</button>
                        <button type="button" className="order-button" aria-label={`${t.moveDown}: ${selected.name}`} title={t.moveDown} disabled={index === files.length - 1 || busy} onClick={() => moveFile(index, 1)}>↓</button>
                      </div>}
                      <button type="button" className="text-button remove-file" aria-label={`${t.remove}: ${selected.name}`} onClick={() => removeFile(index)} disabled={busy}>{t.remove}</button>
                    </li>)}
                  </ul>
                  <div className="file-queue-actions"><button type="button" className="browse-button" onClick={() => fileRef.current?.click()} disabled={busy}>{t.browse}</button><button type="button" className="text-button" onClick={clearFiles} disabled={busy}>{t.clearFiles}</button></div>
                </> : <>
                  <span className="upload-icon"><Icon name="upload" size={23} /></span>
                  <strong>{t.drop}</strong><span className="or-line">{t.or}</span>
                  <button className="browse-button" onClick={() => fileRef.current?.click()}>{t.browse}<Icon name="arrow" size={16} /></button>
                  <small>{t.uploadHint}<br />{t.batchHint}</small>
                </>}
              </div>
              {!backendReady && <div className="inline-notice"><Icon name="shield" size={16} /><span>{t.fileOffline}</span></div>}
              {backendReady && ocrAvailable === false && <div className="inline-notice notice-warning"><Icon name="shield" size={16} /><span>{t.ocrUnavailable} {ocrMessage} Digital PDFs may still work when they contain selectable text.</span></div>}
              {files.length > 0 && <button className="primary-button full-button" onClick={prepareFiles} disabled={busy}>{busy ? <><span className="spinner" />{t.preparing}</> : <>{extraction ? t.reExtract : t.prepare}<Icon name="arrow" size={17} /></>}</button>}
              {extraction && <section className="extraction-preview" aria-labelledby="extraction-title">
                <div className="extraction-heading"><div><span className="step-label">02 / TEXT CHECK</span><h3 id="extraction-title">{t.extractedTitle}</h3></div><span className="page-count">{extraction.page_count} {extraction.page_count === 1 ? t.page.toLowerCase() : t.pages}</span></div>
                <p className="extraction-help">{t.extractedHint}</p>
                {extraction.warnings.map((warning, index) => <div className="warning-message" role="status" key={`${warning}-${index}`}><Icon name="shield" size={16} />{warning}</div>)}
                <label className="visually-hidden" htmlFor="extracted-contract-text">Correct extracted contract text</label>
                <textarea id="extracted-contract-text" className="contract-textarea extraction-textarea" value={extractedText} onChange={(event) => { setExtractedText(event.target.value); setAiConsent(false); setReport(null) }} maxLength={MAX_TEXT_CHARS} disabled={busy} />
                <div className="text-meta"><span>{extractedText.length.toLocaleString()} / {MAX_TEXT_CHARS.toLocaleString()} characters</span><span>{extraction.source_files.length} source {extraction.source_files.length === 1 ? 'file' : 'files'}</span></div>
                {backendReady && aiAvailable && <label className="ai-consent"><input type="checkbox" checked={aiConsent} onChange={(event) => setAiConsent(event.target.checked)} /><span>{t.aiConsent}</span></label>}
                <button className="primary-button full-button" onClick={analyze} disabled={busy || !extractedText.trim()}>{busy ? <><span className="spinner" />{t.analyzing}</> : <>{t.analyze}<Icon name="arrow" size={17} /></>}</button>
              </section>}
            </> : <>
              <label className="visually-hidden" htmlFor="contract-text">Paste contract text</label>
              <textarea id="contract-text" className="contract-textarea" placeholder={t.pastePlaceholder} value={text} onChange={(event) => { setText(event.target.value); setAiConsent(false); setReport(null) }} maxLength={MAX_TEXT_CHARS} disabled={busy} />
              <div className="text-meta"><span>{text.trim() ? `${text.trim().split(/\s+/).length} words · ${text.length.toLocaleString()} characters` : IS_LOCAL_APP ? t.localTextMeta : t.publicTextMeta}</span><span>Up to {MAX_TEXT_CHARS.toLocaleString()} characters</span></div>
              {backendReady && aiAvailable && <label className="ai-consent"><input type="checkbox" checked={aiConsent} onChange={(event) => setAiConsent(event.target.checked)} /><span>{t.aiConsent}</span></label>}
              <button className="primary-button full-button" onClick={analyze} disabled={busy || !text.trim()}>{busy ? <><span className="spinner" />{t.analyzing}</> : <>{t.analyze}<Icon name="arrow" size={17} /></>}</button>
              {!IS_LOCAL_APP && <div className="inline-notice local-files-notice"><Icon name="shield" size={16} /><span>{t.publicFilesNote} <a href="https://github.com/0blisake/Anugya-Satyapak#run-the-private-local-file-review">{t.publicFilesLink}</a></span></div>}
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
            <div className="privacy-card"><div className="privacy-heading"><Icon name="shield" size={18} /><strong>{t.privacy}</strong></div><p>{IS_LOCAL_APP ? t.privacyLocalText : t.privacyPublicText}</p><div className="privacy-foot"><span className="privacy-dot" />No account required</div></div>
          </aside>
        </section>

        {!report && <section className="below-fold page-width">
          <div className="below-heading"><span className="step-label">A BETTER FIRST READ</span><h2>Know where to look before you agree.</h2><p>Anugya Satyapak keeps the original wording close, then explains why a term could deserve a second look.</p></div>
          <div className="value-grid"><article><span className="value-number">01</span><h3>Spot the detail</h3><p>Find renewals, extra charges, exit conditions, and other terms that shape the real cost.</p></article><article><span className="value-number">02</span><h3>Understand the effect</h3><p>Get a short explanation beside the clause, so the practical impact is easier to see.</p></article><article><span className="value-number">03</span><h3>Keep a record</h3><p>Download the review with the source wording and references ready for a closer conversation.</p></article></div>
        </section>}

        {report && <section id="summary" className="report-section page-width">
          <div className="report-header">
            <div><span className="step-label">03 / REVIEW</span><div className="report-title-row"><h2>{t.resultEyebrow}</h2><span className={`mode-pill ${report.analysis_mode === 'demo' ? 'sample-pill' : ''}`}>{report.analysis_mode === 'demo' ? t.demoMode : report.analysis_mode === 'ai-assisted-prototype' ? t.aiMode : t.rulesMode}</span></div><p className="report-file"><Icon name="file" size={15} />{report.document_name}<span>·</span>{report.jurisdiction}</p></div>
            <div className="report-actions"><button className="secondary-button" onClick={() => downloadReport(report)}><Icon name="download" size={17} />{t.download}</button><button className="quiet-button" onClick={() => window.print()}>{t.print}</button></div>
          </div>
          <div className="prototype-banner"><span className="banner-icon"><Icon name="spark" size={18} /></span><div><strong>{report.analysis_mode === 'demo' ? 'You’re viewing a fictional sample contract.' : report.analysis_mode === 'ai-assisted-prototype' ? t.aiBannerTitle : t.rulesBannerTitle}</strong><p>{report.analysis_mode === 'demo' ? 'It demonstrates the report layout. The sample findings are illustrative and do not assess a real agreement.' : report.analysis_mode === 'ai-assisted-prototype' ? t.aiBannerText : t.rulesBannerText}</p></div></div>
          {report.extraction_warning && <div className="warning-banner"><Icon name="shield" size={18} />{report.extraction_warning}</div>}
          {report.analysis_warning && <div className="warning-banner"><Icon name="shield" size={18} />{report.analysis_warning}</div>}
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

          <div className="findings-heading"><div><span className="step-label">04 / THE DETAILS</span><h2>{t.full}</h2></div><span className="finding-count">{findings.length} findings</span></div>
          <div className="findings-list">
            {findings.map((finding, index) => <article id={`finding-${finding.id}`} key={finding.id} className="finding-card">
              <div className="finding-top"><span className="finding-index">{String(index + 1).padStart(2, '0')}</span><div className="finding-title"><span className="category-label">{finding.category}{finding.page ? ` · ${t.page} ${finding.page}` : ''}</span><h3>{finding.title}</h3></div><span className={`risk-pill risk-pill-${finding.risk.toLowerCase()}`}><span />{finding.risk === 'Informational' ? t.info : finding.risk === 'Moderate' ? t.moderate : t.review}</span></div>
              <div className="finding-body"><div className="clause-quote"><div className="body-label"><span className="quote-mark">“</span>{t.original}</div><blockquote>{finding.original_clause}</blockquote></div><div className="explanation-grid"><div><div className="body-label">{t.plain}</div><p>{summaryFor(finding)}</p></div><div><div className="body-label">{t.why}</div><p>{reasonFor(finding)}</p></div></div><div className="next-step"><span className="next-icon"><Icon name="check" size={15} /></span><p><strong>{t.next}:</strong> {finding.suggested_action}</p></div>{finding.uncertainties?.length ? <div className="uncertainty-note"><strong>{t.uncertainties}</strong><ul>{finding.uncertainties.map((uncertainty, uncertaintyIndex) => <li key={`${finding.id}-uncertainty-${uncertaintyIndex}`}>{uncertainty}</li>)}</ul></div> : null}</div>
              <div className="finding-footer"><span><Icon name="spark" size={14} />{confidenceDetails(finding)}</span>{finding.citations.length > 0 && <a href="#sources">View source <Icon name="arrow" size={14} /></a>}</div>
            </article>)}
          </div>

          <section id="sources" className="sources-section">
            <div className="sources-heading"><div><span className="step-label">05 / REFERENCE</span><h2>{t.sources}</h2></div><span className="source-count"><Icon name="link" size={15} />{report.citations.length} source{report.citations.length === 1 ? '' : 's'}</span></div>
            {report.citations.length ? <><p className="sources-intro">Legal references matched to selected findings. Open the official source to read the provision in context.</p><div className="source-list">{report.citations.map((citation) => <article className="source-card" key={citation.id}><div className="source-badge"><Icon name="file" size={18} /></div><div className="source-content"><span className="source-act">{citation.title}</span><h3>{citation.section}</h3><p>{citation.description}</p><div className="source-relevance"><strong>Why it appears</strong><span>{citation.relevance}</span></div></div><a className="source-link" href={citation.url} target="_blank" rel="noreferrer" aria-label={`Open ${citation.title} source`}><Icon name="arrow" size={17} /></a></article>)}</div><p className="citation-note"><Icon name="shield" size={17} />{t.citationNote}</p></> : <div className="no-sources"><span className="source-badge"><Icon name="link" size={18} /></span><div><strong>No specific legal source matched these findings.</strong><p>This prototype only displays citations from its reviewed source list. That does not mean no law applies.</p></div></div>}
          </section>
          {isHi && report.analysis_mode !== 'demo' && report.analysis_mode !== 'ai-assisted-prototype' && <p className="translation-note">अभी नियम-आधारित रिपोर्टों के लिए अनुवाद सुविधा उपलब्ध नहीं है। मूल अनुबंध का पाठ बिना बदलाव दिखाया गया है।</p>}
        </section>}

        <section id="contact" className="support-section page-width">
          <div className="support-card"><div className="support-icon"><Icon name="shield" size={23} /></div><div><span className="step-label">A NEXT STEP, WHEN YOU NEED IT</span><h2>{t.lawyerTitle}</h2><p>{t.lawyerText}</p></div><button className="support-button" disabled>{t.lawyerButton}<Icon name="arrow" size={16} /></button></div>
          <div className="contact-strip"><div><span className="step-label">GET IN TOUCH</span><h3>{t.contactTitle}</h3><p>{t.contactText}</p></div><span className="contact-mark">AS<span>·</span></span></div>
        </section>
      </main>

      <footer className="site-footer"><div className="footer-inner page-width"><a className="brand footer-brand" href="#top"><span className="brand-mark"><Icon name="logo" size={21} /><img src={`${import.meta.env.BASE_URL}brand/logo-mark.svg`} alt="" onError={(event) => { event.currentTarget.style.display = 'none'; event.currentTarget.parentElement?.classList.add('brand-mark-fallback') }} /></span><span>Anugya <span className="brand-strong">Satyapak</span></span></a><p>{t.footerLine}</p><span>© 2026 Anugya Satyapak · Prototype</span></div><div className="footer-disclaimer page-width"><Icon name="shield" size={15} />{t.disclaimer}</div></footer>
    </div>
  )
}

export default App
