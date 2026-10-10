# Anugya Satyapak — Phase 4: browser extension

**Status:** The extension is a local-first quick check intended for a laptop showcase by the project team. Its design follows the website's paper texture, forest-green palette, and ribbon details. It is loaded unpacked in desktop Chrome; no Chrome Web Store publication or developer registration is planned.

## 1. Product role

The extension is a small, optional checkpoint for contract text on a webpage. It is for a short passage or quick first look while browsing. The website remains the full review workspace for long text, PDFs, photos, OCR, text correction, citations, and the complete report.

The extension is deliberately not a second full product. Its local scan uses the same six English pattern categories as the website's browser scan, but it does not provide AI, citations, or a legal conclusion.

## 2. User flow

1. The user selects a passage on a webpage and clicks the extension.
2. The popup attempts to preload the selection. If no text is selected, the user can paste a clause or explicitly choose **Read visible page**.
3. The user reviews and edits the captured text. Page capture may include navigation, notices, or unrelated copy.
4. **Run local quick check** evaluates the text in the extension popup. It does not call a server or send the text anywhere.
5. The popup shows the matching passage and a short explanation for each of the six supported categories: renewal/cancellation, additional charges, refunds/termination, changes to terms, disputes, and liability.
6. If a longer review is needed, **Copy text** and **Open full website** are separate, explicit actions. The user pastes the copied text into the website; there is no automatic transfer.

If the review button is disabled, the text box is empty. The popup now shows an instruction to paste text, capture a selection, or read visible page text. The button becomes enabled when text is present; no API or consent checkbox is involved.

The quick-check field accepts up to 40,000 characters. The extension returns at most one first matching passage per category, so it is intentionally less detailed than the site report.

## 3. Local scan and boundaries

- `extension/local-scan.js` contains the English pattern rules and explanatory text, aligned with the website's browser-based pattern scan.
- The extension reports wording to read closely. A match is not a legal finding, and no matches do not establish that an agreement is safe or complete.
- It does not translate Hindi or other languages, infer jurisdiction, provide citations, run AI analysis, extract PDFs/photos, or create a downloadable report.
- The extension and website each package their own browser-side rules for deployment. If the categories or rule wording change, keep both implementations aligned.

## 4. Permissions and data handling

The Manifest V3 extension requests only:

- `activeTab` so the user-invoked popup can refer to the active tab;
- `scripting` to read a selection or visible text after the user opens the popup; and
- `clipboardWrite` for the explicit **Copy text** button.

There are no persistent page-host permissions, API-host permissions, options page, background service worker, or always-running content script. The extension does not store captured text, inspect other tabs, or send contract text to a server. The full website is opened only when the user chooses its link.

## 5. Fit against the project requirements

| Requirement | Implementation | Fit |
|---|---|---|
| Quick use while browsing | Popup preloads selected text when available; paste and visible-page capture are alternatives | Fits the lightweight extension role |
| Keep the site for heavy use | Website link directs users to PDF/photo OCR, correction, citations, and the full report | Keeps the two surfaces distinct |
| Avoid API setup and user keys | Removed API address settings, API health checks, network submission, and backend requirement | Extension works without configuring a service |
| Keep page access user-triggered | `activeTab` and `scripting`; no persistent hosts or background page reader | Limited to the active, invoked popup flow |
| Keep contract text private by default | Local pattern scan; text is not sent or saved | Fits the intended browser-only quick check |
| Let users continue on the website | Copy and website navigation are separate actions; user pastes the text | Explicit handoff with no text embedded in the URL |
| Explain prototype limits | English pattern scope, 40,000-character limit, restricted-page notes, and no-safety conclusion are shown/documented | Prevents the quick check from appearing comprehensive |
| Laptop showcase | Presenter loads the unpacked `extension/` folder in desktop Chrome | Fits the no-fee showcase plan; each demo laptop must load the folder locally |

## 6. Loading and manual browser review

1. Open `chrome://extensions` in desktop Chrome and enable **Developer mode**.
2. Choose **Load unpacked** and select the repository's `extension/` folder, the one containing `manifest.json`.
3. On a contract webpage, select a passage and open the popup. Confirm the selected text appears without pressing a capture button.
4. Run a local check; confirm the report appears without a backend running or API settings.
5. Repeat by pasting text, reading visible page text, clearing the popup, and using a restricted browser page.
6. Try **Copy text**, then open the website and paste. Confirm the website only receives text after the user pastes and submits there.
7. Confirm the field-empty state clearly explains why **Run local quick check** is disabled and that pasting or capturing text enables it.

After changing the code, use **Reload** for this extension on `chrome://extensions`. If Chrome continues showing the previous options/API flow, remove the previous unpacked entry and load this `extension/` folder again.

**Phase 4 outcome:** The extension follows the local-first quick-check role and shares the site's visual design language. It is for a presenter-installed laptop showcase, not global Store distribution. Load it through Chrome's **Developer mode → Load unpacked** flow using the folder containing `manifest.json`. The site links to those setup instructions.
