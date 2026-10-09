# Anugya Satyapak

Anugya Satyapak is a hackathon prototype for helping Indian consumers notice important terms in a contract and understand why they may deserve a closer read.

## Current status

This folder contains the first working project scaffold and interface.

- The sample report demonstrates the intended consumer-facing report, separate citations, and downloadable output. It is fictional.
- Pasted text can be scanned in the browser with a small set of transparent keyword patterns.
- The FastAPI service can extract text from TXT/MD files and digital PDFs. It uses Tesseract OCR for photos and scanned PDF pages when the local OCR dependency is installed.
- The live scan is rule-based. It is **not connected to an LLM** and does not decide whether a clause is unfair, enforceable, or unlawful.
- Hindi UI translations and the sample report are included. Live findings remain in English until a reviewed translation service is connected.
- Lawyer referrals and team contact details are placeholders and need real, verified destinations before a public demo.

## Run locally

### Backend

In one terminal:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

The API is available at `http://127.0.0.1:8000`. For photo OCR and scanned PDFs, install the Tesseract OCR application and make sure `tesseract.exe` is on `PATH` before starting the API. Digital PDFs and text files do not need OCR.

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
  backend/
    app/main.py              FastAPI extraction and pattern-scan endpoints
    data/legal_sources.json  Small reviewed-source seed for prototype matching
    requirements.txt         Python dependencies
```

## Report behavior

The frontend calls `POST /api/analyze` with either pasted text or one uploaded file. The API accepts PDF, image, TXT, or MD input and returns the structured report consumed by the UI. `GET /api/health` reports whether the API is running.

The report preserves quoted contract wording, flags pattern matches, and includes a citation only for the narrow fee/penalty patterns connected to the prototype source list. A source match is a possible reference point, not a legal conclusion. No matching clause or citation does not establish that the contract is safe or that no law applies.

## Data and privacy notes

The prototype does not save contracts to a database. The backend reads each upload into memory for extraction and analysis; request contents are not written to logs by this app. Avoid using sensitive real contracts in a public demo. Review the hosting provider’s request logging and retention settings before deployment.

## Before a public or judge-facing deployment

1. Have a legal reviewer validate the source list, section matches, and sample findings.
2. Connect an LLM only behind the API and validate its responses against the report schema. Keep source retrieval deterministic and do not accept model-invented citations.
3. Add OCR language selection, document cleanup, and extraction-confidence feedback.
4. Add reviewed Hindi translations for live results.
5. Replace contact and lawyer-referral placeholders with verified options.
6. Add rate limits, file scanning, deployment secrets, and a clear disclosure of any external AI processing.

The broader statutory crawler, PostgreSQL/vector search, state-amendment coverage, and criminal-code mapping are intentionally deferred until the core consumer-contract flow is validated.
