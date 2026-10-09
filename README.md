# Anugya Satyapak

Anugya Satyapak is a hackathon prototype for helping Indian consumers notice important terms in a contract and understand why they may deserve a closer read.

## Current status

This folder contains the Anugya Satyapak prototype, including Phase 1 intake reliability, the Phase 2 evidence-checked AI review path, and the Phase 3 visual refresh.

- The sample report demonstrates the intended consumer-facing report, separate citations, and downloadable output. It is fictional.
- Pasted text can be scanned in the browser with a small set of transparent keyword patterns.
- The FastAPI service can extract text from TXT/MD files and digital PDFs. It can process up to 10 screenshots in a selected/reordered page sequence. It uses Tesseract OCR for photos and scanned PDF pages when the API host has the Python dependencies, Tesseract application, and English language data installed.
- File uploads now have a separate extraction step. The site shows the extracted text, page count, source filenames, and OCR warnings so a user can correct OCR text before requesting a report.
- When `OPENAI_API_KEY` and `OPENAI_MODEL` are configured on the backend, the review uses the OpenAI Responses API. Otherwise, the existing transparent rule scan remains active. Neither mode decides whether a clause is unlawful, fair, or enforceable.
- The AI review works in overlapping document chunks, runs a separate coverage pass, checks each evidence quote against the supplied text, and only attaches citation details from the backend's approved source records. Rejected/unverifiable suggestions are omitted with a report warning. A configured AI review uses up to two model requests per chunk plus one summary request when findings are accepted, so API usage and response time grow with document length.
- The AI prompt requests English or Hindi explanation text based on the selected UI language. Original contract quotes are retained verbatim, and category names/source records remain canonical labels.
- `backend/examples/phase2_evaluation.json` contains synthetic positive, control, and edge-case examples for future manual quality review. It contains no beta-tester contracts and is not run automatically.
- The Phase 3 theme uses the agreed navy, blue, cream, and lime palette; increases interface/report text size; and keeps the upload and report layouts responsive. `frontend/public/brand/` is ready for approved logo artwork; the existing inline mark remains the fallback.
- Final verification: the frontend TypeScript check and production build passed; its local preview and sample report rendered without browser console errors; the 390 px mobile preview had no horizontal overflow. Python backend files compile, and the extension JavaScript/manifest pass syntax checks. A live API check could not run because this environment could not install the backend dependencies; a Chrome runtime check could not run because no Chrome browser surface is available in this session. See the Phase 4 record for the remaining owner-side checks.
- Lawyer referrals and team contact details are placeholders and need real, verified destinations before a public demo.

## Run locally

### Backend

In one terminal:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
notepad .env
python -m uvicorn app.main:app --reload --port 8000
```

In `backend/.env`, add your own `OPENAI_API_KEY`; the example uses `gpt-6-astra` as the starting model. Change `OPENAI_MODEL` to a model available to your API account if needed. This feature can create API usage charges; check your account's model access, budget, and usage limits before enabling it. Restart the API after changing `.env`. Keep this file private; `.gitignore` excludes it. If the API key/model is absent, the health endpoint reports that AI is not configured and the site stays in rules mode.

Create an OpenAI API key through the [official API quickstart](https://developers.openai.com/api/docs/quickstart). Use it only on the backend; never put it in a `VITE_*` variable, frontend file, browser extension, or GitHub Pages setting. API access and model availability depend on the OpenAI API account.

The API is available at `http://127.0.0.1:8000`. For photo OCR and scanned PDFs, install the Tesseract OCR application, its English (`eng`) language data, and make sure `tesseract.exe` is on `PATH` before starting the API. Text files and PDFs with selectable text can be extracted without OCR; image-only or scanned PDF pages need it. `GET /api/health` reports whether OCR and AI are ready and gives a setup diagnosis when they are not.

### Frontend

Use Node.js 20.19+ (or 22.12+) with npm.

In a second terminal:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

In PowerShell, use `npm.cmd` if `npm` produces an execution-policy error for `npm.ps1`. This calls the Windows command wrapper and does not require changing PowerShell's execution policy. You can also run `npm install` and `npm run dev` from Command Prompt.

Open the local URL printed by Vite (normally `http://localhost:5173`). The Vite development server forwards `/api` requests to the local FastAPI service. Without the backend, pasted text still uses the browser-based pattern scan and the fictional sample report remains available.

### Chrome extension

1. Start the backend as described above.
2. In desktop Chrome, open `chrome://extensions`, turn on **Developer mode**, select **Load unpacked**, and choose this repository's `extension/` folder.
3. Open the extension's settings and leave the API origin as `http://127.0.0.1:8000` for local work. For a hosted backend, enter its HTTPS origin. Select **Save and allow this API** and approve the origin-specific permission request.
4. Optionally set the URL of the deployed full-review website. The extension does not transfer its captured text to that site.
5. Open Quick Check on a webpage, choose selected text or rendered page text, review/edit it, acknowledge the send notice, and submit. You can also paste text. The quick-review limit is 40,000 characters.

See [extension setup and limits](extension/README.md) for permission details and browser restrictions. Chrome grants temporary active-tab access when the user invokes the extension; access to the configured API origin is requested separately as an optional host permission. [Chrome activeTab guide](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab), [optional permission guide](https://developer.chrome.com/docs/extensions/reference/api/permissions).

## 5. Send the project to GitHub

These steps use Git from PowerShell. Use the project root folder—the one containing `.github`, `backend`, `frontend`, `.gitignore`, and this `README.md`. Do not run these commands from inside `frontend` or `backend`.

### Create the GitHub repository

1. Sign in to [GitHub](https://github.com/) or create an account.
2. Select **New repository** and name it `anugya-satyapak`.
3. Choose **Public** if you want to publish through GitHub Pages on the free plan.
4. Leave **Add a README**, **.gitignore**, and **license** unchecked. The project already has its own README and `.gitignore`.
5. Select **Create repository** and keep the page open. Copy the HTTPS repository address; it looks like `https://github.com/YOUR-USERNAME/anugya-satyapak.git`.

### Install Git and upload the project

1. If `git --version` is not recognized in PowerShell, install **Git for Windows** from [git-scm.com](https://git-scm.com/download/win), then close and reopen PowerShell.
2. In File Explorer, open the project root folder—the one containing `.github`, `backend`, `frontend`, `.gitignore`, and this `README.md`. Click the address bar, type `powershell`, and press Enter. This opens PowerShell at the correct folder, whatever its local folder name is.

3. Start Git and make the first commit:

   ```powershell
   git init -b main
   git add .
   git commit -m "Initial Anugya Satyapak prototype"
   ```

4. Connect the local project to the empty GitHub repository. Replace `YOUR-USERNAME` with your GitHub username:

   ```powershell
   git remote add origin https://github.com/YOUR-USERNAME/anugya-satyapak.git
   git push -u origin main
   ```

5. If Git asks for your name and email before committing, set them and repeat the commit command:

   ```powershell
   git config --global user.name "Your Name"
   git config --global user.email "YOUR-GITHUB-EMAIL"
   git commit -m "Initial Anugya Satyapak prototype"
   ```

When GitHub authentication opens in a browser, sign in and authorize it. The included `.gitignore` excludes installed dependencies, virtual environments, and `.env` files. Do not upload real contracts, passwords, API keys, or other private data.

## Publish the frontend with GitHub Pages

GitHub Pages can publish the static React frontend. It cannot run the Python API, so the sample report and browser-based pasted-text scan work on Pages, while PDF/photo analysis needs the API hosted separately.

1. In the `anugya-satyapak` repository, open **Settings → Pages** and set the publishing source to **GitHub Actions**.
2. Open the **Actions** tab. The push to `main` should start **Build and deploy Anugya Satyapak to GitHub Pages**. Open that run and wait for it to finish successfully.
3. GitHub Pages will show the published URL in the workflow deployment summary. For a project repository it will usually look like `https://YOUR-USERNAME.github.io/anugya-satyapak/`.

The Vite config uses relative asset paths so the site can load under the repository subpath.

### Connect a separately hosted API (optional)

1. Deploy `backend/` to a Python host that can run FastAPI and, for scanned files/photos, Tesseract OCR.
2. In the GitHub repository, add an Actions variable named `VITE_API_BASE_URL` whose value is the API origin, such as `https://api.example.com` (no trailing slash and no `/api` suffix).
3. On the API host, set `ANUGYA_SATYAPAK_ALLOWED_ORIGINS` to the Pages origin, such as `https://<username>.github.io` (do not include the repository path).
4. Re-run the Pages workflow so the API origin is included in the frontend build.

Do not put API credentials in `VITE_*` variables: those values are bundled into public frontend files. Never commit `.env` files or contract documents. Until the API and its data handling have been reviewed, tell demo users to use fictional/sample documents rather than confidential contracts.

## Project structure

```text
anugya-satyapak/
  frontend/                 React + TypeScript user interface
    src/App.tsx              Upload, sample report, review UI, and report download
    src/mockReport.ts        Fictional sample contract findings
    src/styles.css           Responsive styling and print layout
    src/brand-theme.css      Brand palette, typography, and visual refresh
    public/brand/            Approved logo assets and placement guidance
  extension/                Chrome Manifest V3 quick-review prototype
    manifest.json            Toolbar popup and scoped permissions
    popup.js                 Capture and compact report flow
    options.js               API and full-site URL settings
  backend/
    app/main.py              FastAPI extraction and review endpoints
    app/ai_review.py         OpenAI adapter and evidence-checked review pipeline
    data/legal_sources.json  Small reviewed-source seed for prototype matching
    requirements.txt         Python dependencies
```

## Report behavior

The frontend calls `POST /api/extract` with one PDF, image, TXT, or MD file, or with multiple screenshots under the repeated `files` field. The response includes extracted text, source filenames, page count, and warnings. For a screenshot batch, the API processes images in the order sent by the browser. The user can inspect and edit that text before the site calls `POST /api/analyze` with the corrected text and document name. When AI is configured, the UI and API both require explicit acknowledgement that corrected text will be sent to the backend and OpenAI. The analysis endpoint still accepts the previous single-file `file` field for compatibility, as well as the multiple-file field. `GET /api/health` reports API, OCR, and AI readiness plus the configured upload limits.

Upload limits for this prototype are 10 files per batch, 12 MB per file, 30 MB total, and 250,000 extracted/pasted characters. Multiple-file batches must contain screenshots only; upload a PDF or text file by itself. If one screenshot fails, the batch reports the affected filename and the user can remove or replace that image and retry. Text/TXT/MD input can still be reviewed in browser demo mode; PDF and photo extraction need the API.

In rules mode, the report preserves passages matched by the current patterns. In AI mode, the model proposes findings, but the API keeps only findings whose exact quote occurs in the supplied document chunk. The API derives page references from page markers and attaches canonical citation data only when the model selected a known source ID. Quotes that fail exact-text validation are omitted, and the report says when suggestions were discarded. Neither no findings nor no citation establishes that a contract is safe or that no law applies.

## Data and privacy notes

The app does not save contracts to its own database. The backend reads uploads in memory for extraction and analysis, and the OpenAI request sets `store` to `false`. The corrected contract text is still transmitted to OpenAI when AI mode is enabled, under the configured API account; this setting is not a promise about all provider processing or retention. Review the API account terms and the hosting provider's logging/retention settings. Use fictional or non-confidential documents for a public demo until that review is complete.

## Before a public or judge-facing deployment

1. Have a legal reviewer validate the source list, section matches, and sample findings.
2. Review the OpenAI account, model access, data-handling terms, usage limits, and deployment secrets. Keep source retrieval deterministic and do not accept model-invented citations.
3. Add OCR language selection, document cleanup, and extraction-confidence feedback.
4. Add reviewed Hindi translations for live results.
5. Replace contact and lawyer-referral placeholders with verified options.
6. Add rate limits, file scanning, deployment secrets, and a clear disclosure of external AI processing. Configure `OPENAI_API_KEY` and `OPENAI_MODEL` only as private API-host secrets.

The broader statutory crawler, PostgreSQL/vector search, state-amendment coverage, and criminal-code mapping are intentionally deferred until the core consumer-contract flow is validated.

## Phase records

- [Phase 0: scope and architecture](../ANUGYA-SATYAPAK-PHASE-0-SCOPE.md)
- [Phase 1: intake and extraction reliability](../ANUGYA-SATYAPAK-PHASE-1-INTAKE.md)
- [Phase 2: AI review pipeline](ANUGYA-SATYAPAK-PHASE-2-AI-PIPELINE.md)
- [Phase 3: visual refresh and brand assets](ANUGYA-SATYAPAK-PHASE-3-VISUAL-DESIGN.md)
- [Phase 4: Chrome extension](ANUGYA-SATYAPAK-PHASE-4-EXTENSION.md)
