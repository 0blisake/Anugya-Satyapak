# Anugya Satyapak Quick Check

This is a Chrome Manifest V3 prototype for a fast first-pass check of text on a webpage. It is intended as a **local laptop showcase for the project team**, not as a Chrome Web Store release. The scan runs inside the extension in the browser. It does not need a backend, API address, AI provider, or API key, and it does not send the contract text over the network.

The full website remains the place for PDFs, photos, text correction, and the longer report: [Anugya Satyapak](https://0blisake.github.io/Anugya-Satyapak/).

## Load it in desktop Chrome

1. On each laptop that will run the showcase, download or clone this repository and unzip it if needed. If the team shares the standalone extension ZIP, extract it first; the extracted package folder directly contains `manifest.json`. No backend or npm command is required to use the extension.
2. In desktop Chrome, open `chrome://extensions` and turn on **Developer mode**.
3. Select **Load unpacked** and choose the folder that directly contains `manifest.json`: the repository's `extension/` folder, or the extracted standalone package folder.
4. Pin **Anugya Satyapak — Quick Check** from Chrome's Extensions menu if you want it beside the address bar.
5. On a webpage, select a clause and click the extension. The selected text is preloaded when the browser permits it. Otherwise, paste text or choose **Read visible page**.
6. Check and edit the captured text, then select **Run local quick check**. The compact report appears in the popup.

If **Run local quick check** is disabled, the text box is empty. Paste text, use **Capture selection**, or choose **Read visible page**; the button becomes available as soon as text is present. If Chrome blocks capture on a browser-internal page or PDF viewer, copy and paste the text instead.

For a full website review, select **Copy text** and then **Open full website**. Paste the copied text into the website yourself; the extension does not transfer it automatically. The website also supports PDF and photo extraction in the browser.

## What the quick scan checks

The extension uses the website's limited English pattern checks for renewal/cancellation, additional charges, refunds/termination, changes to terms, disputes, and liability. It returns the first matching passage it finds for each category. It is a short issue-spotting aid, not a comprehensive contract analysis, jurisdiction-specific legal opinion, or decision about whether a term is fair, enforceable, unlawful, or safe. A result with no matches does not mean there are no important terms.

The quick scan is intentionally self-contained and does not provide the website's citations, AI-assisted analysis, PDF/photo OCR, or downloadable full report. Use the website for those workflows.

## Privacy and permissions

- `activeTab` and `scripting` allow the extension to read selected text or visible page text after you open the popup. It does not continuously monitor tabs or run a background content script.
- The extension has no API host access, does not call a review server, and does not store page or contract text.
- `clipboardWrite` is used only when you click **Copy text**. The website link is a separate action, and the extension does not pass text in the link.
- Text stays in the open popup and is discarded when the popup closes. Browser-internal pages and some PDF viewers, image-only pages, canvas content, or embedded frames may block text capture; paste available text or use the website's file workflow.
- Public policy: [Extension privacy notice](https://0blisake.github.io/Anugya-Satyapak/extension-privacy.html).

## Prototype limits

- English wording patterns only; the extension does not translate Hindi text.
- The quick-check field is limited to 40,000 characters. For longer documents, use the website.
- Visible page text can contain navigation, notices, and unrelated copy. Review it before scanning.
- The scan can miss indirect, unusual, or context-dependent wording. It may flag harmless wording as well.
- The extension is loaded unpacked by the presenter in desktop Chrome. There is no Chrome Web Store listing, public install link, or developer-dashboard submission in the current project plan.

## Source files

- `manifest.json` — Manifest V3 action and narrow, user-invoked permissions.
- `popup.html`, `popup.css`, `popup.js` — capture, local quick scan, and compact report interface.
- `local-scan.js` — browser-local English pattern checks used by the popup.
- `icons/` — Chrome-compatible PNG sizes plus the SVG source.
