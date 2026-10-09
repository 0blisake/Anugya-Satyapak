# Anugya Satyapak prototype scope

This checklist maps the provided problem statement, solution outline, and final front-end diagram to the current project.

| Requirement | Project implementation | Current state |
|---|---|---|
| Upload PDF, photo, or text | File picker, drag/drop, pasted text, and a separate extraction preview; up to 10 ordered screenshots | Implemented in Phase 1; OCR requires Tesseract and English language data on the API host |
| Correct OCR text before review | Editable extracted-text preview with page markers and extraction warnings | Implemented in Phase 1; one combined editor rather than per-page editors |
| Diagnose photo API readiness | API health includes OCR runtime/language readiness and upload limits | Implemented in Phase 1; deployment host limits still need a live-host check |
| Short bullet summary | Summary area with count and first three findings | Implemented for sample and scan results |
| Readable, welcoming branded interface | Responsive theme with the requested navy, blue, cream, and lime palette; larger report typography; logo-ready asset folder | Implemented in Phase 3; TypeScript/build and local preview pass; 390 px view has no horizontal overflow |
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
- AI mode sends the corrected contract text to the backend and OpenAI after an explicit user acknowledgement. Provider and hosting terms still apply.
- OCR text can be inaccurate; the report warns users to compare OCR quotations with the source image.
- The sample contract and sample findings are fictional and illustrative.

## Phase implementation records

- Phase 1 intake and extraction: [implementation notes](../ANUGYA-SATYAPAK-PHASE-1-INTAKE.md).
- Phase 2 AI analysis: [pipeline implementation, roadmap cross-check, setup, and open verification items](ANUGYA-SATYAPAK-PHASE-2-AI-PIPELINE.md).
- Phase 3 website presentation: [palette, typography, responsive styling, and brand asset folder](ANUGYA-SATYAPAK-PHASE-3-VISUAL-DESIGN.md).
- Phase 4 browser extension: [capture flow, permission model, setup, and verification checklist](ANUGYA-SATYAPAK-PHASE-4-EXTENSION.md).
