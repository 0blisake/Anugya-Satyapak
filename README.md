# Anugya Satyapak

**Understand the terms before you agree.**

Anugya Satyapak is a hackathon prototype for helping Indian consumers make a first pass through contracts and terms of service. It highlights wording that may deserve attention, quotes the supporting passage, and explains what a reader could check next.

> This is an issue-spotting prototype, not a lawyer or a legal decision system. It can miss important clauses, misread context, and show incomplete references. A clean report does not mean a contract is safe.

[Open the public text prototype](https://0blisake.github.io/Anugya-Satyapak/) · [Browse the source](https://github.com/0blisake/Anugya-Satyapak) · [Report an issue](https://github.com/0blisake/Anugya-Satyapak/issues)

## Two ways to use the prototype

| Version | Available features | Where the review runs |
|---|---|---|
| Public website | Paste contract text, run a rules-based scan, view the sample report | In the visitor's browser; pasted text is not sent to an Anugya Satyapak API |
| Private local version | Paste text or extract PDFs, scanned PDFs, and photos; correct extracted text before review | The file extraction API runs on the user's own laptop |

The public website is static and does not call a hosted review API. Its text scan is a limited, English-focused pattern scan; it does not provide AI analysis and may miss indirect wording. The local version can use the same rules-based review. AI is an optional local setting that requires the user's own API key and explicit consent before sending corrected text to the configured provider.

The interface uses a paper-inspired cream background and botanical greens, with blue and lime accents. Brand assets live in [frontend/public/brand/](frontend/public/brand/); see the [logo instructions](frontend/public/brand/README.md).

## Run the private local file review

The GitHub Pages site does not accept file uploads. To review PDFs or photos, run the frontend and API on your laptop. Files are sent to the API at `127.0.0.1` on that same laptop; they are not sent to a hosted Anugya Satyapak server.

### Requirements

- Node.js 20.19+ (or 22.12+) and npm
- Python 3.10+
- Tesseract OCR for photos and scanned PDF pages, with English (`eng`) language data
- Internet access for installing project dependencies

Tesseract's Windows builds are provided by [UB Mannheim](https://github.com/UB-Mannheim/tesseract/wiki). Add its installation folder to the Windows `PATH` if the installer does not do this. Digital PDFs with selectable text do not need OCR; scanned pages and photos do.

### One-time setup on Windows

Clone the repository, then open two PowerShell windows in its folder:

```powershell
git clone https://github.com/0blisake/Anugya-Satyapak.git
cd Anugya-Satyapak
```

In the first window, install the frontend dependencies:

```powershell
cd frontend
npm ci
```

In the second window, set up the local API:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
if (!(Test-Path .env)) { Copy-Item .env.example .env }
```

No AI key is needed for local file extraction or rules-based review. Keep the generated `backend/.env` private and do not commit it.

### Start a local review session

1. In the API window, from the `backend` folder, run:

   ```powershell
   .\.venv\Scripts\python.exe -m uvicorn app.main:app --port 8000
   ```

2. In the other window, from the `frontend` folder, run:

   ```powershell
   npm run dev
   ```

3. Open the local address printed by Vite, normally [http://localhost:5173](http://localhost:5173). The local version shows the file upload tab and sends files to the API running on your laptop.

Keep both windows open while using the local version. To stop the services, press Ctrl+C in each window.

After installing Tesseract, open a new terminal and confirm that `tesseract --version` works and `tesseract --list-langs` includes `eng`. The local API's [health page](http://127.0.0.1:8000/api/health) reports whether OCR is ready.

### Optional AI review

The local API can use AI if you add your own `OPENAI_API_KEY` and supported `OPENAI_MODEL` to `backend/.env`. The prototype asks for consent before sending corrected contract text for AI analysis. Provider API usage may incur charges. Never put an API key in frontend files, GitHub Pages variables, the extension, or the repository.

## Load the Chrome extension

The extension is an unpacked desktop Chrome prototype and is not currently distributed through the Chrome Web Store. It remains a separate feature from the public website's browser-only text scan.

1. Start the local API using the steps above.
2. In desktop Chrome, open `chrome://extensions` and turn on **Developer mode**.
3. Select **Load unpacked** and choose this repository's `extension/` folder.
4. Keep its API setting at `http://127.0.0.1:8000` and approve Chrome's optional host permission when prompted.
5. Open the extension on a webpage, choose selected text or rendered page text, check/edit the captured text, then submit it for review.

The quick review is limited to 40,000 characters and shows a compact result. See the [extension guide](extension/README.md) for permissions and browser limitations.

## How the prototype is put together

| Part | Implementation |
|---|---|
| Public website | React, TypeScript, and Vite static frontend; browser-based pattern scan for pasted text |
| Local file review | FastAPI extraction and analysis endpoints in `backend/`; the local Vite server proxies requests to the API |
| AI review | Optional OpenAI-compatible Responses API adapter with quote validation in `backend/app/ai_review.py` |
| Legal references | Small curated seed in `backend/data/legal_sources.json`; coverage is limited and requires legal review |
| Browser extension | Chrome Manifest V3 quick-check flow in `extension/` |
| Hosting | GitHub Actions builds the static frontend and deploys it to GitHub Pages |

More detail: [project scope and requirements cross-check](ANUGYA-SATYAPAK-PROJECT-SCOPE.md), [AI pipeline notes](ANUGYA-SATYAPAK-PHASE-2-AI-PIPELINE.md), [visual and brand notes](ANUGYA-SATYAPAK-PHASE-3-VISUAL-DESIGN.md), and [extension notes](ANUGYA-SATYAPAK-PHASE-4-EXTENSION.md).

## Prototype boundaries and data handling

- The public rules scan looks for a limited set of English wording patterns. It does not understand every unusual or indirect clause, and it does not determine whether a term is fair, enforceable, or unlawful.
- Public pasted text is scanned in the visitor's browser. The website does not submit it to an Anugya Satyapak backend.
- In the local version, files and pasted text are sent to the API running on the same laptop for review. OCR can introduce errors; compare extracted passages against the source document.
- AI is off by default. If enabled in the local API, text is sent to the configured AI provider only after the user consents. Provider terms, logs, and retention settings apply.
- Citations come only from a small curated source list. An absent citation does not mean no law applies.
- Do not submit confidential or sensitive contracts to an AI provider unless you have reviewed its terms and data handling.
- Lawyer referrals and contact destinations are placeholders in this prototype.

## Project status

This repository is a hackathon prototype. It includes public browser-based text scanning, private local file intake, English and Hindi interface options, a rules-based fallback, an optional AI-assisted path, a sample report, and a Chrome quick-check extension. The AI pipeline, legal source list, OCR quality, and live browser-extension flow need real-world evaluation before the project can support public-use claims.

There is no `LICENSE` file in this repository yet. Until a license is added, assume the source is shared for viewing and that reuse is not granted by default.
