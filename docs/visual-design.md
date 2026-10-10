# Anugya Satyapak — Phase 3: visual design and brand assets

**Status:** The paper-and-green visual refresh and supplied brand mark are implemented. The TypeScript check passed in the 2026-10-10 audit. The Vite production build could not complete in this environment because its config bundler was denied a child-process spawn (`EPERM`). The refreshed page still needs a browser-based visual review at desktop and mobile widths.

## Design direction

The interface keeps the original cream, blue, and lime palette, while making botanical greens its main color family. It uses a lightly textured paper canvas, stronger green navigation and hero areas, restrained ribbon details, and layered paper-like cards. These changes are visual only; they preserve the upload, extraction, AI-consent, reporting, citations, and download flows.

| Color role | Value | Use |
|---|---|---|
| Forest green | `#183F32` | Navigation, hero, footer, primary brand field, and high-contrast text |
| Leaf green | `#286047` | Buttons, active controls, links, and key interface accents |
| Warm paper | `#F4F1DC` | Page canvas and paper surfaces |
| Original blue | `#87AECE` | Focus states and supporting accents |
| Sage-lime | `#B8D184` | Ribbons, badges, and small highlights |

The paper texture is made from CSS gradients rather than a large bitmap background. The hero and smaller cards use ribbon and folded-corner details to give the page a more distinctive identity without obscuring the contract-review controls.

## Reading and responsive layout

- The hero, upload workspace, report summary, findings, source cards, and support area use a consistent reading hierarchy and larger text than the compact v1 layout.
- Deep-green surfaces use cream text; long explanations and contract quotations remain on light paper surfaces for comfortable reading.
- Tablet and phone breakpoints keep the upload flow and report readable, with narrower content columns and stacked cards at small widths.
- Visible keyboard focus styling remains in place.
- Report wording and analysis behavior are unchanged by the design refresh.

## Brand artwork

The approved mark lives at `frontend/public/brand/logo-mark.svg`. The website uses it in the header and footer; a built-in shield remains as a fallback if the image cannot load. The brand name remains text, so it stays crisp and selectable. The SVG was normalized to remove an external DTD reference. See `frontend/public/brand/README.md` for the asset convention.

## Roadmap cross-check

| Requirement | Implementation | Status |
|---|---|---|
| Make the interface welcoming and distinct | Paper texture, dark-green hero/navigation, ribbon details, and paper-like cards | Implemented; visual review at desktop and phone widths remains pending |
| Use the original palette with green more prominent | Forest and leaf greens lead; cream is the paper canvas; blue and lime remain accents | Implemented |
| Improve readability | Larger text hierarchy and stronger contrast for report content and controls | Implemented; check on target devices before a public-use claim |
| Preserve current functionality | No changes to upload, extraction, consent, API, report, or download behavior | TypeScript check passes; production build remains unconfirmed in this environment due to the spawn restriction |
| Provide a place for the brand mark | `frontend/public/brand/` contains the SVG used by the header and footer | Implemented |
| Keep a responsive layout | Existing responsive layouts remain, with refreshed colors and surfaces | Code is present; visual viewport walkthrough remains pending |

## Files involved

- `frontend/src/brand-theme.css` — paper texture, palette, ribbons, surfaces, type sizing, responsive styling, and print adjustments.
- `frontend/src/App.tsx` — header and footer render the mark with a fallback.
- `frontend/index.html` — brand favicon and browser theme color.
- `frontend/public/brand/logo-mark.svg` — supplied vector mark used by the website.
- `frontend/public/brand/README.md` — logo placement and replacement instructions.
- `../README.md` and `project-scope.md` — public project description and current status.

## Verification and open checks

- Passed in the final review: TypeScript check and Vite production build.
- Passed in the final review: Python source compilation; extension JavaScript syntax checks and manifest JSON parsing; Git whitespace check.
- Not verified in this review: live backend/OpenAI calls, OCR on a real OCR-enabled host, Chrome installation/runtime flow, and browser-rendered visual review of the new paper/ribbon styling.
- `backend/examples/phase2_evaluation.json` is synthetic reference material; it is not an automated test suite.

**Outcome:** The green-led paper design and brand mark are connected to the site. Production compilation succeeds; owner-side browser and live-service review are still required.
