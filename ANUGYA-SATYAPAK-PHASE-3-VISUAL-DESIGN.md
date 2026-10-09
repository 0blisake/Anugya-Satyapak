# Anugya Satyapak — Phase 3: visual refresh and brand assets

**Status:** Visual implementation is in place for owner review. TypeScript and production build checks passed; the local preview was visually reviewed at the default and 390 px mobile widths, with no mobile horizontal overflow.
**Scope:** Website presentation and logo asset preparation. The review/API behavior and browser extension are outside this phase.

## 1. Phase objective

Make the full-review site easier to read and more welcoming while keeping its current upload, extraction, AI-consent, reporting, citation, and download flows intact. Use the palette and asset-folder requirements captured in the Phase 0 visual contract.

## 2. Palette and visual system

The new theme defines the requested brand colors as reusable CSS variables:

| Brand color | Value | Main use |
|---|---|---|
| Navy | `#1D2A62` | Primary text, headings, buttons, links, active controls, and brand marks |
| Blue | `#87AECE` | Supporting panels, input surfaces, borders, focus indication, and secondary accents |
| Cream | `#F5F3D8` | Page canvas, navigation surface, and warm background areas |
| Lime | `#AFD06E` | Small emphasis marks, selected status indicators, and success/highlight surfaces |

Additional neutral and warning shades remain for legibility and meaning. The light blue and lime are used as surfaces or accents; body text and controls use navy or another darker contrast-safe color. Existing warning/error colors remain recognizable as semantic states.

The theme changes the page canvas, sticky navigation, hero panel, upload workspace, side cards, report summary, evidence cards, sources panel, contact area, and footer. The footer uses a navy brand field to add a stronger visual endpoint. Keyboard focus remains visible with a blue focus ring.

## 3. Typography and reading hierarchy

- Added a separate `brand-theme.css` layer after the existing layout CSS, allowing visual rules to be maintained without moving or rewriting the React workflow.
- Increased the main hero copy to a 17 px desktop baseline and enlarged report text: summaries to 16 px, clause quotations to 16 px, explanations to 15 px, and source descriptions to 14 px. Most controls and secondary descriptions are now 12–15 px instead of the previous 8–11 px.
- Increased line height and spacing around summaries, quotations, explanations, and next-step checks.
- Preserved heading hierarchy for page title, section titles, finding headings, evidence labels, and source names.
- Added narrower breakpoints that reflow the upload, source, finding, contact, and footer sections. At very narrow phone widths, side cards stack into one column and navigation/control spacing is reduced.

The original font families and fallbacks remain in place; this phase changes the scale and contrast. Final legibility on actual devices awaits the visual inspection pass.

## 4. Logo asset folder

Created `frontend/public/brand/README.md` with accepted formats and suggested filenames:

- `logo.svg` for the complete mark and wordmark.
- `logo-mark.svg` for compact placements.
- `wordmark.svg` for the brand name alone.
- Transparent PNG is acceptable when approved vector artwork is unavailable.

No artwork was invented or copied. The UI continues to use its existing inline Anugya Satyapak icon and text wordmark until approved artwork is added.

## 5. Roadmap cross-check

| Phase 0 visual requirement | Implementation | Status |
|---|---|---|
| Apply the four-color brand palette | Exact requested values exposed as CSS variables and used across navigation, hero, panels, controls, findings, sources, and footer | Implemented; production build passed; screenshot/contrast verification remains pending |
| Increase report/body text from the compact v1 sizing | Paragraph, evidence, source, helper, and control sizes increased, with larger line height | Implemented; desktop/mobile readability still needs a browser review |
| Keep a clear hierarchy between summary, evidence, explanation, and source | Existing report component order is preserved and typography/spacing now reinforces those levels | Implemented without changing report behavior |
| Preserve responsive behavior | Added/adjusted tablet, mobile, and narrow-phone theme breakpoints | Code is present; runtime viewport checks remain pending |
| Preserve keyboard focus visibility | Theme adds a consistent visible focus ring to links, controls, text areas, and inputs | Implemented; keyboard walkthrough remains pending |
| Create a brand asset folder and fallback | Added `frontend/public/brand/README.md`; current inline logo/wordmark remains the fallback | Implemented; final brand artwork has not been supplied |

## 6. Changed files

- `frontend/src/brand-theme.css` — brand variables, color mapping, typography scale, component surfaces, focus styling, and responsive refinements.
- `frontend/src/main.tsx` — loads the theme after the existing stylesheet.
- `frontend/index.html` — updates the browser theme-color metadata to the brand cream.
- `frontend/public/brand/README.md` — logo naming, formats, and licensing guidance.
- `README.md` and `ANUGYA-SATYAPAK-PROJECT-SCOPE.md` — project status, structure, and phase links.

## 7. End-of-project verification

- Passed: TypeScript check and Vite production build.
- Passed: local in-app browser preview at the default 742 px viewport and at 390 px mobile width; no horizontal overflow at 390 px. The fictional sample report rendered its six findings and source cards without console errors.
- Not run: keyboard walkthrough and print/PDF visual review.

**Phase 3 outcome:** The brand theme and logo-ready folder are implemented, and the production frontend build succeeds. Device-level visual review remains an owner-side check. Phase 4 (browser extension) is documented in its separate implementation record.
