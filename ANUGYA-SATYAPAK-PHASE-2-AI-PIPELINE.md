# Anugya Satyapak — Phase 2: AI review pipeline

**Status:** Implementation is in place for owner review. Live provider behavior and review quality are not yet verified.
**Product target:** Website full-review flow, with a stable analysis API that can later be shared by the browser extension.
**Provider choice for this prototype:** OpenAI Responses API, isolated behind a small provider interface. No API key was supplied or used while making these changes.

## 1. Phase objective

Replace the narrow keyword-only live review with an AI-assisted, evidence-led first pass that can notice indirect or unusual contract wording. The pipeline should show the exact wording that led to each candidate finding, expose uncertainty, and reject unsupported evidence and unapproved citations. It must not present a finding as a legal verdict or imply that an empty report proves the contract is safe.

The eight review categories are:

1. Renewal and cancellation.
2. Price, fees, and payments.
3. Refunds, termination, and lock-in.
4. Changes to terms and consent.
5. Disputes and complaint routes.
6. Liability, indemnity, and remedies.
7. Unusual or potentially one-sided terms.
8. Other material obligations and data use.

## 2. What was implemented

### 2.1 Provider adapter and configuration

- Added a provider interface and an OpenAI Responses API adapter in `backend/app/ai_review.py`.
- The adapter sends structured JSON output requests, sets `store` to `false`, applies a 90-second request timeout, limits generated output, and converts provider failures into readable API errors.
- Provider credentials and model selection are read only from backend environment variables: `OPENAI_API_KEY`, `OPENAI_MODEL`, and optional `OPENAI_BASE_URL`.
- The backend loads `backend/.env` explicitly. `backend/.env.example` shows the expected variables; the real `.env` remains ignored by Git.
- The sample model name is a starting value only. The owner must choose a model enabled for their API account. A model/API request was not made in this implementation session.

### 2.2 Bounded two-pass review

- Long text is split into chunks of up to 16,000 characters with a nominal 1,000-character overlap. Paragraph alignment can reduce the overlap by up to about 400 characters. The splitter prefers paragraph and line boundaries where it can do so without creating a very short chunk.
- Every chunk receives a first review against the eight categories. A separate coverage pass re-reads that chunk and is asked to find supported material the first pass omitted.
- For a single document review, provider concurrency is capped at two simultaneous requests. The second pass starts after the first pass returns, so each document uses up to two analysis calls per chunk. When findings are accepted, one additional summary request is made. This is a per-review limit, not a global service limit; concurrent users can create more provider requests, and the API still needs rate limits and a spend cap before public deployment.
- Contract text is explicitly treated as untrusted evidence. Prompts say to ignore embedded instructions, avoid inventing obligations, inspect exceptions and negation, and avoid legal conclusions.
- Findings use a strict schema for category, risk label, qualitative evidence clarity, exact quote, explanation, uncertainty, suggested check, and optional approved source IDs.

### 2.3 Evidence and citation checks

- The backend accepts a candidate only when its non-empty quote (up to 2,500 characters) occurs character-for-character in the chunk reviewed. The backend does not normalize OCR spelling or punctuation to make a quote pass.
- Quotes containing only page markers are disallowed by the prompt; page references are derived from `[Page n]` markers in the corrected document text.
- Repeated wording that makes a page reference ambiguous gets no page number and an uncertainty note.
- Candidates with unsupported categories, risk/confidence values, missing explanation fields, overlong display text, malformed uncertainty/source fields, or unsupported source IDs are filtered or have the unknown source ID discarded.
- Citation details are attached from the API's current source records only. The model cannot supply a URL, statute text, section, or citation details of its own.
- Findings are merged across overlapping chunks by category, page, and normalized quote. The final summary is requested only after evidence validation and uses only accepted findings. If summary generation fails, the API builds a cautious deterministic summary from those accepted findings.
- If a review candidate is discarded, the response includes a warning explaining that validation removed one or more suggestions.

### 2.4 API and website behavior

- `GET /api/health` reports whether AI is configured without returning the key, plus OCR status and upload limits.
- `POST /api/analyze` keeps its existing report shape and adds `analysis_mode`, `analysis_warning`, and `ai_consent` handling.
- When credentials are absent, the backend continues using the existing pattern scan and labels the report `rules-prototype`.
- When credentials are present, AI mode requires an explicit `ai_consent` acknowledgement. The backend enforces this even if a client bypasses the checkbox. Editing the text clears the website's acknowledgement so it must be checked again.
- The UI labels AI and rule-based reports separately and displays uncertainty notes and validation warnings. It tells users the corrected contract text is sent to the API and OpenAI in AI mode.
- If an AI request fails, the API returns an error; it does not silently label a rule scan as an AI result.

### 2.5 Synthetic evaluation material

Added `backend/examples/phase2_evaluation.json` with 24 positive examples (three per category), 12 controls, and six edge examples covering negation, an exception, related wording across page boundaries, multiple obligations in one paragraph, OCR-like spelling variation, and repeated wording. These examples are fictional, manually labelled starter material. They do not establish model accuracy, are not legal conclusions, and are not automatically executed by the application.

## 3. Roadmap cross-check

| Approved Phase 0 requirement | Phase 2 result | Fit and remaining gap |
|---|---|---|
| Move from keyword-only analysis to AI issue spotting | Configurable server-side AI path; rules path remains available | Fits the architecture. Detection quality still needs evaluation; the system cannot promise to catch every subtle term. |
| Review indirect/unusual wording across a full document | Eight categories, overlapping chunks, and an independent coverage pass | Fits the intended approach. The two model passes can still miss content or misunderstand context. |
| Preserve evidence and uncertainty | Exact-quote validation, page derivation, uncertainty notes, and warnings | Fits. Exact text matching proves only that the quote exists, not that the explanation is correct. |
| Keep citations constrained | Source IDs must match the approved source seed; details come from backend records | Fits. The current legal-source set is small and needs legal review; citation filtering does not establish that the source is complete or applicable. |
| Keep the provider key on the backend | Environment-only credentials and a private `.env.example` workflow | Fits. The owner still needs to configure a private key on the local or hosted API server. |
| Preserve the existing report/API contract for the future extension | Existing report fields remain, with additive mode/warning/consent fields | Fits at this code level. The extension does not exist yet and will need its own integration review. |
| Use a controlled evaluation set before making performance claims | Synthetic positives, controls, and edge examples added | Partially fits. The 90% recall target recorded in Phase 0 has not been measured; no precision/recall result is claimed. |
| Disclose external AI processing and do not store contracts in the app | UI acknowledgement, backend consent gate, no application database, and `store:false` request setting | Partially fits. The provider and hosting terms/logs still need review; `store:false` is not a promise about every provider processing or retention practice. |

## 4. Setup when the owner is ready to enable AI

From PowerShell in `backend/`:

```powershell
Copy-Item .env.example .env
notepad .env
```

Set the private API key and a model enabled for the account, then install the backend requirements and restart the API. Keep `.env` out of Git and never put the key in a `VITE_*` variable. `GET /api/health` should then report that AI is configured. The site will show the consent checkbox before an AI review can begin.

AI use can incur provider charges. Each document uses up to two model requests per chunk plus one summary request when supported findings exist; longer documents therefore require more requests and may take substantially longer. The API currently has no per-user rate limit or per-review spend cap. Keep the prototype on fictional or non-confidential documents until provider account terms, hosting logs, and deployment secrets have been reviewed.

## 5. Explicitly unverified and deferred

- No API key was available; no real provider call, live report, or account billing behavior was checked.
- No test suite or production build was run. The code and UI changes were inspected statically only.
- The synthetic evaluation set has not been executed against any model. False positive rate, recall, latency, and consistency are unknown. The Phase 0 90% target remains an evaluation target, not a result.
- Hindi generation has not been manually reviewed. The model is asked for the selected language, but quality is not established.
- The source seed needs legal review and does not cover all Indian consumer law, state amendments, or every relevant section.
- No authentication, rate limiting, spending ceiling, asynchronous job/progress UI, contract persistence, or production privacy review was added in this phase.
- The website typography/palette/logo-folder work and the browser extension remain later phases. Phase 3 has not started.

## 6. Changed project files

- `backend/app/ai_review.py` — provider adapter, chunking, prompts, validation, merge, citations, summary.
- `backend/app/main.py` — AI configuration health and report-mode/consent integration.
- `backend/requirements.txt` and `backend/.env.example` — environment configuration support.
- `backend/examples/phase2_evaluation.json` — synthetic evaluation starter set.
- `frontend/src/App.tsx`, `frontend/src/types.ts`, and `frontend/src/styles.css` — mode status, consent, evidence-clarity display, uncertainty, and warnings.
- `README.md` and `ANUGYA-SATYAPAK-PROJECT-SCOPE.md` — setup and implementation status.

**Phase 2 outcome:** The AI review path is implemented behind backend configuration, with evidence gates, a cautious rules fallback, and explicit consent. It is ready for a code owner review and later key-enabled manual evaluation; it is not yet verified for live AI quality. Phase 3 should begin only after owner approval.
