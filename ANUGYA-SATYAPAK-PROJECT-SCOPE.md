# Anugya Satyapak prototype scope

This checklist maps the provided problem statement, solution outline, and final front-end diagram to the current project.

| Requirement | Project implementation | Current state |
|---|---|---|
| Upload PDF, photo, or text | File picker, drag/drop, pasted text, and a separate extraction preview; up to 10 ordered screenshots | Browser-based extraction; selectable PDF text uses PDF.js, scanned PDF pages and photos use English/Hindi Tesseract.js OCR; PDF OCR is capped at 30 pages |
| Correct OCR text before review | Editable extracted-text preview with extraction warnings | Implemented; one combined editor rather than per-page editors |
| Keep public contract files client-side | Static GitHub Pages build extracts and scans files in the browser | Implemented; OCR engine and language data are downloaded from public CDNs on first OCR use; contract content is not uploaded |
| Short bullet summary | Summary area with count and first three findings | Implemented for sample and scan results |
| Readable, welcoming branded interface | Paper texture, green-led palette, ribbon details, larger report typography, responsive layout, and supplied logo in the header/footer | Implemented in Phase 3; TypeScript/build pass; refreshed browser/device visual review remains pending |
| Quick browser extension | Desktop Chrome Manifest V3 toolbar popup that reads selected or rendered page text, lets the user correct it, and submits to the shared analysis API | Implemented in Phase 4; JavaScript and manifest checks pass; Chrome install and live API flow remain unverified in this environment |
| Detailed contract review | Finding cards with exact evidence, plain-language explanation, next step, uncertainty, and a concise summary | Implemented in Phase 2 behind OpenAI configuration; rules scan remains the unconfigured fallback; dynamic quality review pending |
| Broad review checklist | Eight categories reviewed per document chunk, followed by an independent omission pass | Implemented in Phase 2; model recall and false positives still need evaluation |
| Evidence validation | Exact quote must appear in the supplied chunk; page comes from document markers | Implemented in Phase 2; invalid suggestions are omitted with a warning |
| Renewal and cancellation | AI checklist category plus existing keyword scan category | Implemented in both configured AI and rules fallback modes |
| Fees and penalties | AI checklist category; existing fee citations plus validated source-ID selection | Implemented, but citation coverage remains narrow and needs legal review |
| Refunds, termination, and lock-in | AI checklist category plus existing keyword scan category | Implemented in both configured AI and rules fallback modes |
| Unilateral changes | AI checklist category plus existing keyword scan category | Implemented in both configured AI and rules fallback modes |
| Disputes and arbitration | AI checklist category plus existing keyword scan category | Implemented in both configured AI and rules fallback modes |
| Liability limits | AI checklist category plus existing keyword scan category | Implemented in both configured AI and rules fallback modes |
| Potentially unfair or ambiguous terms | AI may surface unusual or one-sided wording as a review item; it does not classify legality | Implemented as cautious issue-spotting; no legal classification engine |
| Legal citations | Model returns approved source IDs; backend attaches canonical source details | Implemented with the current small source seed; legal reviewer validation remains outstanding |
| AI evaluation examples | Synthetic positive, control, and edge-case examples | Added in Phase 2; not automatically executed |
| Translation | English/Hindi UI and translated fictional sample report; AI prompts request the selected language | Partial; model language quality has not been manually reviewed |
| Downloadable report | Download as TXT; print page to save as PDF | Implemented |
| Legal disclaimer | Visible in report and footer | Implemented |
| Lawyer contact/referral | UI placeholder, disabled until verified destination exists | Placeholder |
| Contact us | Contact section with a setup placeholder | Placeholder |
| Discord authorization reference | Not in the front-end flow; no account or Discord gate is assumed for contract review | Deferred pending a defined use case |
| Full Indian law ingestion, state amendments, criminal-code mapping | Later-stage legal-data project | Deferred |

## Boundaries shown to users

- A rule match or AI suggestion is not an assessment that a clause is illegal, unfair, or unenforceable.
- No finding does not mean that no important clause or applicable law exists.
- AI findings are candidate review items; the API checks exact supporting quotes and attaches citations only from its narrow, manually curated source list.
- The current source list and model output still require legal and quality review before a public-use claim.
- The public site processes uploaded files, extracted text, and pasted text in the browser. First-time OCR downloads only the OCR engine and language assets from public CDNs.
- Local AI mode sends corrected contract text to the local backend and OpenAI after an explicit user acknowledgement. Provider and hosting terms still apply.
- OCR text can be inaccurate; the report warns users to compare OCR quotations with the source image.
- The sample contract and sample findings are fictional and illustrative.

## Phase implementation records

- Phase 1 intake and extraction are mapped in the requirements table above; the original standalone Phase 1 note is not included in this repository.
- Phase 2 AI analysis: [pipeline implementation, roadmap cross-check, setup, and open verification items](ANUGYA-SATYAPAK-PHASE-2-AI-PIPELINE.md).
- Phase 3 website presentation: [palette, typography, responsive styling, and brand asset folder](ANUGYA-SATYAPAK-PHASE-3-VISUAL-DESIGN.md).
- Phase 4 browser extension: [capture flow, permission model, setup, and verification checklist](ANUGYA-SATYAPAK-PHASE-4-EXTENSION.md).
