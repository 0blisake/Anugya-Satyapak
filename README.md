# Anugya Satyapak

**Understand the terms before you agree.**

Anugya Satyapak is a hackathon prototype for helping Indian consumers make a first pass through contracts and terms of service. It highlights wording that may deserve attention, quotes the supporting passage, and explains what a reader could check next.

> This is an issue-spotting prototype, not a lawyer or a legal decision system. It can miss important clauses, misread context, and show incomplete references. A clean report does not mean a contract is safe.

[Open the web prototype](https://0blisake.github.io/Anugya-Satyapak/) · [Browse the source](https://github.com/0blisake/Anugya-Satyapak) · [Report an issue](https://github.com/0blisake/Anugya-Satyapak/issues)

The web prototype is published with GitHub Pages. If it is temporarily unavailable, check the repository’s **Actions** tab for the latest Pages deployment. The Pages version is a static frontend; AI analysis and file extraction require a separately running or hosted API.

## What you can try

- **Review contract text:** paste terms into the website, or use its fictional sample report without configuring a backend.
- **Upload documents:** submit a PDF, text file, or a sequence of screenshots. The extraction preview lets you correct OCR text before analysis. File extraction requires the API; scanned pages and photos also require Tesseract OCR on the API host.
- **Read a structured report:** see a quick summary and detailed findings with quoted wording, plain-language explanations, suggested checks, uncertainty notes, and available source references.
- **Use AI-assisted review:** when configured, the API reviews overlapping document sections, checks findings against the source text, and attaches citations only from its curated source list. Otherwise, the prototype uses a smaller rules-based scan.
- **Save the result:** download a text report or print/save the report as a PDF.
- **Check text on the go:** load the experimental Chrome extension to review selected or rendered webpage text after explicitly invoking it. It shares the review API with the website.
- **Switch interface language:** the website includes English and Hindi UI options. Live AI translation quality has not been independently validated.

The interface uses a paper-inspired cream background and botanical greens, with the project’s blue and lime tones as accents. The supplied brand mark is used in the header and footer. Brand assets live in [`frontend/public/brand/`](frontend/public/brand/); see its [logo instructions](frontend/public/brand/README.md).

## Try the website locally

### Requirements

- Node.js 20.19+ (or 22.12+) and npm
- Python 3.10+ only if you also want to run the backend

Clone the repository and start the frontend:

```bash
git clone https://github.com/0blisake/Anugya-Satyapak.git
cd Anugya-Satyapak/frontend
npm ci
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`. Without the backend, the sample report and browser-based pattern scan for pasted text remain available. PDF/photo extraction and AI review are not available in frontend-only mode.

## Run the API (optional)

The FastAPI backend handles file extraction and can provide AI-assisted analysis when configured. Open a second terminal from the repository root:

```bash
cd backend
python -m venv .venv
```

Activate the environment, install dependencies, and copy the example settings file:

```powershell
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

```bash
# macOS / Linux
source .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env
```

To enable AI review, set `OPENAI_API_KEY` and a model available to your API account in `backend/.env`, then start the service:

```bash
python -m uvicorn app.main:app --reload --port 8000
```

The local frontend proxies `/api` requests to `http://127.0.0.1:8000`. Photo and scanned-PDF OCR additionally requires the Tesseract application and English (`eng`) language data installed on the API host. Check `http://127.0.0.1:8000/api/health` to see which backend features are ready.

OpenAI API usage may incur charges. Keep API keys in the backend environment only; never put them in frontend files, `VITE_*` variables, the extension, or the repository. If AI is not configured, the API can still use the rules-based fallback.

## Load the Chrome extension

The extension is an unpacked desktop Chrome prototype and is not currently distributed through the Chrome Web Store.

1. Start the backend using the steps above.
2. In desktop Chrome, open `chrome://extensions` and turn on **Developer mode**.
3. Select **Load unpacked** and choose this repository’s `extension/` folder.
4. Open the extension settings and keep `http://127.0.0.1:8000` for a local API, or configure your own hosted HTTPS API origin. Approve Chrome’s optional host permission when prompted.
5. Open the extension on a webpage, choose selected text or rendered page text, check/edit the captured text, then submit it for review.

The quick review is limited to 40,000 characters and shows a compact result. Use the website for file extraction and the full report. See the [extension guide](extension/README.md) for permissions and browser limitations.

## How the prototype is put together

| Part | Implementation |
|---|---|
| Website | React, TypeScript, and Vite in `frontend/` |
| API | FastAPI file extraction and analysis endpoints in `backend/` |
| AI review | OpenAI-compatible Responses API adapter with quote validation in `backend/app/ai_review.py` |
| Legal references | Small curated seed in `backend/data/legal_sources.json`; coverage is limited and requires legal review |
| Browser extension | Chrome Manifest V3 quick-check flow in `extension/` |
| Hosting | GitHub Actions workflow builds the static frontend and deploys it to GitHub Pages |

More detail: [project scope and requirements cross-check](ANUGYA-SATYAPAK-PROJECT-SCOPE.md), [AI pipeline notes](ANUGYA-SATYAPAK-PHASE-2-AI-PIPELINE.md), [visual and brand notes](ANUGYA-SATYAPAK-PHASE-3-VISUAL-DESIGN.md), and [extension notes](ANUGYA-SATYAPAK-PHASE-4-EXTENSION.md).

## Prototype boundaries and data handling

- The rules mode looks for a limited set of wording patterns; it does not understand every unusual or indirect clause.
- AI suggestions are candidates for human review. Exact quote matching helps ensure a suggested passage occurs in the supplied text, but does not establish whether it is fair, lawful, or enforceable.
- Citations come only from a small curated source list. An absent citation does not mean no law applies.
- The website and extension do not save contract text to an application database. When AI mode is enabled, text submitted for review is sent to the configured API and OpenAI. Hosting and provider terms, logs, and retention settings still apply.
- Do not submit confidential or sensitive contracts to a public demo. Use fictional or non-confidential material unless you have reviewed the deployment and data-handling setup.
- OCR can introduce errors. Compare extracted passages against the source document before relying on a report.
- Lawyer referrals and contact destinations are placeholders in this prototype.

## Project status

This repository is a hackathon prototype. English and Hindi interface options, document intake, a rules-based fallback, an AI-assisted path, a sample report, and a Chrome quick-check extension are represented in the code. The AI pipeline, legal source list, OCR setup, and live browser-extension flow still need real-world evaluation before the project can support public-use claims.

There is no `LICENSE` file in this repository yet. Until a license is added, assume the source is shared for viewing and that reuse is not granted by default.
