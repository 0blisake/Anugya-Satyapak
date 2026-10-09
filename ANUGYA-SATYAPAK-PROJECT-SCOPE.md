# Anugya Satyapak prototype scope

This checklist maps the provided problem statement, solution outline, and final front-end diagram to the current project.

| Requirement | Project implementation | Current state |
|---|---|---|
| Upload PDF, photo, or text | File picker, drag/drop, pasted text; API extraction for PDF and images | Implemented; OCR requires local Tesseract |
| Short bullet summary | Summary area with count and first three findings | Implemented for sample and scan results |
| Detailed contract review | Finding cards with original passage, plain-language note, and next step | Implemented as a rule-based prototype |
| Renewal and cancellation | Keyword scan category | Implemented, pattern-based |
| Fees and penalties | Keyword scan category with limited source matching | Implemented, narrow prototype mapping |
| Refunds, termination, and lock-in | Keyword scan category | Implemented, pattern-based |
| Unilateral changes | Keyword scan category | Implemented, pattern-based |
| Disputes and arbitration | Keyword scan category | Implemented, pattern-based |
| Liability limits | Keyword scan category | Implemented, pattern-based |
| Potentially unfair or ambiguous terms | Cautious review labels and a small source seed | Partial; no legal classification engine |
| Legal reasoning and citations | Separate source section and links to the official act PDF | Partial; seeded references need legal review |
| Translation | English/Hindi UI and translated fictional sample report | Partial; live scan translation is not connected |
| Downloadable report | Download as TXT; print page to save as PDF | Implemented |
| Legal disclaimer | Visible in report and footer | Implemented |
| Lawyer contact/referral | UI placeholder, disabled until verified destination exists | Placeholder |
| Contact us | Contact section with a setup placeholder | Placeholder |
| Discord authorization reference | Not in the front-end flow; no account or Discord gate is assumed for contract review | Deferred pending a defined use case |
| Full Indian law ingestion, state amendments, criminal-code mapping | Later-stage legal-data project | Deferred |

## Boundaries shown to users

- A keyword match is not an assessment that a clause is illegal or unenforceable.
- No match does not mean that no important clause or applicable law exists.
- Citations are tied to a narrow, manually curated source list and require human review.
- OCR text can be inaccurate; the report warns users to compare OCR quotations with the source image.
- The sample contract and sample findings are fictional and illustrative.
