# Anugya Satyapak — Phase 4: browser extension

**Status:** The Chrome Manifest V3 prototype is implemented for owner review. Static extension checks pass. Browser and API runtime verification remains pending because this session has no Chrome browser surface and could not install the backend dependencies.
**Product role:** Quick, user-triggered checks on selected webpage text or the current webpage; the website remains the full review workspace.

## 1. Phase objective

Give a user a quick way to inspect contract terms on the page they are already viewing. Keep the extension thin: capture/edit text, send it to the same backend used by the website, and show a compact result. Do not create a separate prompt, model key, or citation system in the browser.

## 2. Capture and review flow

1. The user opens the toolbar popup.
2. They choose **Use selected text**, **Read page text**, or paste terms into the editable field.
3. The extension reads only after a capture button click. Page text is limited to 40,000 characters and remains editable in the popup.
4. The user checks a disclosure saying text will be sent to the configured Anugya Satyapak API and, when AI mode is active, OpenAI.
5. On **Review this text**, the popup posts the corrected text, English language, India · Central jurisdiction, a generic document label, and the consent field to `POST /api/analyze`.
6. It shows the analysis mode, summary, warnings, and up to eight evidence-backed findings. Source links are accepted only when they use HTTPS.
7. If configured, a link opens the full-review website. Captured text is not transferred; the site remains a separate full-review workflow.

The extension includes no independent rules scanner or AI integration. It uses the current shared API response shape and lets the backend retain responsibility for consent enforcement, finding validation, and citation selection.

## 3. Permission and data handling

- Manifest V3 declares `activeTab`, `scripting`, and `storage`; it does not declare persistent access to every webpage and has no always-running content script or service worker.
- Chrome access to the active tab is used only after the extension is invoked. The page extraction function returns text to the extension popup; it does not inject UI or modify the website.
- The API origin is configured in the options page. The manifest declares optional HTTPS API-host access plus local loopback patterns. The options page requests permission for the configured origin after the user clicks Save; a hosted API address is restricted to HTTPS.
- The configured API origin and optional full-site URL are the only values stored in `chrome.storage.local`. Page text stays in the open popup and is not stored in local storage.
- The report renderer uses DOM text nodes rather than interpreting model content as HTML. Source links are limited to HTTPS before they are made clickable.
- The extension never sends the current webpage URL or title to the analysis API.

This follows Chrome's user-invoked [`activeTab` model](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab) and optional origin-permission approach. Cross-origin API requests require the extension to hold permission for the API host; see Chrome's [cross-origin request guidance](https://developer.chrome.com/docs/extensions/develop/concepts/network-requests).

## 4. Phase 0 cross-check

| Phase 0 requirement | Implementation | Fit and remaining gap |
|---|---|---|
| Desktop Chrome first, Manifest V3 | `extension/manifest.json` uses Manifest V3 and a toolbar popup | Fits the first target. No Edge/Firefox check has been done. |
| User invokes review on current page or selection | Toolbar popup offers selected-text and page-text capture buttons | Fits. Capturing page text is bounded and editable. |
| Avoid persistent access to all websites | Uses `activeTab` plus `scripting`; no always-on content script | Fits the planned permission boundary. Runtime Chrome permission behavior still needs the final browser check. |
| Use the same backend as the website | Sends standard form fields to `/api/analyze` | Fits the shared report contract; hosted API integration remains dependent on owner backend configuration and allowed origin/network setup. |
| State what data is sent and allow selection-only fallback | Editable capture preview, selection button, and explicit send acknowledgement | Fits. The user can remove unrelated page text before sending. |
| Avoid storing page/contract text | Only API/website origins persist in Chrome storage; contract text stays in popup memory | Fits the extension's own persistence boundary. The backend/provider handling described in Phase 2 still applies after submit. |
| Handle restricted and image-only pages | Helpful capture failure text and manual paste path | Fits as a fallback. PDF viewer and embedded/canvas behavior varies by page/browser. |
| Refer heavy review to the website | Optional website URL setting and result link | Fits. No contract text is passed to the site; users paste/re-upload for a full report. |
| Load unpacked for working model | Setup steps documented for `chrome://extensions` | Fits; Web Store publication is deferred. |

## 5. Configuration and operation

The extension can be installed unpacked directly from the repository's `extension/` folder. Run the backend separately and set the backend origin in extension settings. For local development use `http://127.0.0.1:8000`; for a hosted backend use its HTTPS origin. A provider secret belongs only in the backend environment, never in extension settings or extension files.

The full website URL is optional and separate from the API origin. Set it after GitHub Pages or another website host publishes the site. The extension does not forward captured text to that website.

## 6. Final verification record

- Passed: TypeScript check and Vite production build for the website.
- Passed: Python syntax compilation for the backend modules.
- Passed: JavaScript syntax checks for the extension modules and JSON parsing of the Manifest V3 file.
- Passed: `git diff --check`; the branding scan found no outdated brand-name references.
- Not run: backend API smoke requests. The host has Python 3.14 but no backend dependencies; pip could not write downloaded wheel metadata even when its temporary directory was placed inside the writable project folder.
- Not run: Chrome installation, permission prompts, capture interaction, and extension-to-API request. The user approved the browser check, but this Codex session exposes only its in-app browser and no Chrome browser surface.

To finish runtime verification on the owner's computer, load `extension/` unpacked in desktop Chrome, start the backend, grant access to its configured API origin, and try selection, page-text, paste, and submission in rules mode. Repeat with AI configured only after adding a backend key privately and confirming the data disclosure. Check restricted pages, source links, the optional website link, and that reopening the popup does not restore contract text.

**Phase 4 outcome:** The shared-backend extension prototype and setup documentation are in place. Static checks passed; environment constraints prevented live API and Chrome runtime checks. The next action is to sync the completed project changes to the owner's existing GitHub repository.
