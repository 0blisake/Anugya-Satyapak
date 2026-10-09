# Anugya Satyapak

**Understand the terms before you agree.**

Anugya Satyapak is a hackathon prototype for helping Indian consumers make a first pass through contracts and terms of service. It highlights wording that may deserve attention, quotes the supporting passage, and explains what a reader could check next.

> This is an issue-spotting prototype, not a lawyer or a legal decision system. It can miss important clauses, misread context, and show incomplete references. A clean report does not mean a contract is safe.

[Open the public prototype](https://0blisake.github.io/Anugya-Satyapak/) · [Browse the source](https://github.com/0blisake/Anugya-Satyapak) · [Report an issue](https://github.com/0blisake/Anugya-Satyapak/issues)

## Two ways to use the prototype

| Version | Available features | Where the review runs |
|---|---|---|
| Public website | Paste text or upload text files, PDFs, scanned PDFs, and screenshots; correct extracted text, run the scan, view or download the report | Text extraction, OCR, and the rules-based review run in the visitor's browser; contract content is not sent to an Anugya Satyapak server |
| Optional local API | Run AI-assisted analysis from a local development session after configuring a provider and consenting | Corrected text is sent to the API on the user's laptop, then to the configured AI provider only after consent |

The public website is static and does not call a hosted review API. Selectable PDF text is read in the browser with PDF.js; screenshots and scanned PDF pages use Tesseract.js OCR in the browser. First OCR use downloads the OCR engine and English/Hindi language data from public CDNs. Contract files and extracted text are not uploaded to those CDNs. OCR needs an internet connection the first time; digital PDFs with selectable text do not need OCR. The scan remains a limited, English-focused pattern checker, does not provide AI analysis on GitHub Pages, and may miss indirect wording. AI is optional for local development and requires a configured API key and explicit consent before text is sent to the chosen provider.

The interface uses a paper-inspired cream background and botanical greens, with blue and lime accents. Brand assets live in [frontend/public/brand/](frontend/public/brand/); see the [logo instructions](frontend/public/brand/README.md).

## Run the optional local AI review

The GitHub Pages site already supports file uploads and browser-based extraction. You do not need to install Python, Tesseract, or run a backend to use it. Run the local API only if you want to work on the project locally or try its optional AI-assisted analysis. In local development, the frontend extracts files in the browser and sends corrected text to the API at `127.0.0.1` only when you start a review.

### Requirements

- Node.js 20.19+ (or 22.12+) and npm
- Python 3.10+
- Internet access for installing project dependencies

Browser OCR downloads Tesseract's engine and English/Hindi language data from public CDNs on first use. The contract itself remains in the browser. The local backend still contains a separate OCR endpoint, but the website's upload flow does not depend on it.

### One-time setup on Windows

Clone the repository, then open two PowerShell windows in its folder:

```powershell
git clone https://github.com/0blisake/Anugya-Satyapak.git
cd Anugya-Satyapak
```

In the first window, install the frontend dependencies:

```powershell
cd frontend
npm ci --ignore-scripts
```

In the second window, set up the local API:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
if (!(Test-Path .env)) { Copy-Item .env.example .env }
```

No AI key is needed for browser-based file extraction or rules-based review. Keep the generated `backend/.env` private and do not commit it.

### Start a local review session

1. In the API window, from the `backend` folder, run:

   ```powershell
   .\.venv\Scripts\python.exe -m uvicorn app.main:app --port 8000
   ```

2. In the other window, from the `frontend` folder, run:

   ```powershell
   npm run dev
   ```

3. Open the local address printed by Vite, normally [http://localhost:5173](http://localhost:5173). Uploads are extracted in the browser. If the local API is running, corrected text can be sent to it for optional AI-assisted review; otherwise, the browser rules scan is used.

Keep the API window open only when using the optional local API. To stop it, press Ctrl+C in that window. Stop Vite in the other window when finished.

### Optional AI review

The local API can use AI if you add your own `OPENAI_API_KEY` and supported `OPENAI_MODEL` to `backend/.env`. The prototype asks for consent before sending corrected contract text for AI analysis. Provider API usage may incur charges. Never put an API key in frontend files, GitHub Pages variables, the extension, or the repository.

## Local Chrome extension showcase

The extension is a laptop-demo build for the project team. It is **not published in the Chrome Web Store**, and the current plan does not require developer registration or a Store submission. It runs locally in desktop Chrome, without the backend, an API key, or npm.

To prepare a presenter’s laptop, clone or download this repository, open `chrome://extensions` in desktop Chrome, turn on **Developer mode**, select **Load unpacked**, and choose the `extension/` folder that directly contains `manifest.json`. The extension guide has the complete steps and usage notes. Each laptop used for the demo must load the unpacked folder locally.

On a webpage, select a clause and click the extension. It preloads the selection when available; otherwise paste text or choose **Read visible page**. Review/edit the text and choose **Run local quick check**. If the button is disabled, the text box is empty; paste a clause, capture a selection, or choose **Read visible page**. For PDFs, photos, text correction, citations, or the full report, use the [website](https://0blisake.github.io/Anugya-Satyapak/).

The quick review is limited to 40,000 characters and uses a small set of English wording patterns. It does not make legal determinations. See the [extension guide](extension/README.md) for setup, use, privacy, and permissions. The public [extension privacy notice](https://0blisake.github.io/Anugya-Satyapak/extension-privacy.html) is deployed with the website.

## How the prototype is put together

| Part | Implementation |
|---|---|
| Public website | React, TypeScript, and Vite; PDF.js text extraction, Tesseract.js OCR, editable text review, and browser-based pattern scan |
| Optional local API | FastAPI analysis and extraction endpoints in `backend/`; the local Vite server proxies analysis requests to the API |
| AI review | Optional OpenAI-compatible Responses API adapter with quote validation in `backend/app/ai_review.py` |
| Legal references | Small curated seed in `backend/data/legal_sources.json`; coverage is limited and requires legal review |
| Browser extension | Chrome Manifest V3 quick-check flow in `extension/` |
| Hosting | GitHub Actions builds the static frontend and deploys it to GitHub Pages |

More detail: [project scope and requirements cross-check](ANUGYA-SATYAPAK-PROJECT-SCOPE.md), [AI pipeline notes](ANUGYA-SATYAPAK-PHASE-2-AI-PIPELINE.md), [visual and brand notes](ANUGYA-SATYAPAK-PHASE-3-VISUAL-DESIGN.md), and [extension notes](ANUGYA-SATYAPAK-PHASE-4-EXTENSION.md).

## Prototype boundaries and data handling

- The public rules scan looks for a limited set of English wording patterns. It does not understand every unusual or indirect clause, and it does not determine whether a term is fair, enforceable, or unlawful.
- Public pasted text, uploaded files, and OCR are processed in the visitor's browser. The website does not submit contract content to an Anugya Satyapak backend. OCR engine and language assets come from public CDNs on first use.
- In local development, corrected text is sent to the API running on the same laptop if it is available. OCR can introduce errors; compare extracted passages against the source document.
- AI is off by default. If enabled in the local API, text is sent to the configured AI provider only after the user consents. Provider terms, logs, and retention settings apply.
- Citations come only from a small curated source list. An absent citation does not mean no law applies.
- Do not submit confidential or sensitive contracts to an AI provider unless you have reviewed its terms and data handling.
- Lawyer referrals and contact destinations are placeholders in this prototype.

## Project status

This repository is a hackathon prototype. It includes public browser-based PDF and image extraction, English/Hindi OCR, an English-focused rules scan, English and Hindi interface options, an optional local AI-assisted path, a sample report, and a Chrome quick-check extension. The AI pipeline, legal source list, OCR quality, and live browser-extension flow need real-world evaluation before the project can support public-use claims.

There is no `LICENSE` file in this repository yet. Until a license is added, assume the source is shared for viewing and that reuse is not granted by default.
