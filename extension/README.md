# Anugya Satyapak Quick Check — Chrome prototype

This is a Manifest V3 unpacked Chrome extension for quick, user-triggered checks of selected contract text or text rendered on the active webpage. It sends text to the same FastAPI `POST /api/analyze` endpoint as the website. The backend key is never placed in the extension.

## Load it in desktop Chrome

1. Start the Anugya Satyapak backend by following the backend steps in the repository README. The local address is normally `http://127.0.0.1:8000`.
2. Open `chrome://extensions` in Chrome and turn on **Developer mode**.
3. Select **Load unpacked** and choose this `extension/` folder.
4. Pin **Anugya Satyapak — Quick Check** from Chrome's Extensions menu if you want it beside the address bar.
5. Open the extension's settings from its popup. Keep the default local API address for a local backend, or enter the origin of your hosted API. A hosted API must use HTTPS. Select **Save and allow this API** and approve the origin Chrome presents.
6. Optionally enter the full-review website URL, such as the GitHub Pages URL shown after deployment. The extension opens that URL from a report, but it does not copy the captured text into the site.
7. Open a webpage with contract terms and click the extension. Choose **Use selected text** or **Read page text**, review/edit the text, acknowledge the send notice, and select **Review this text**. You can also paste text directly.

The Quick Check shows the first eight findings. Use the website for longer documents, file/OCR extraction, and the complete downloadable report.

## Privacy and permissions

- `activeTab` and `scripting` let the extension read selection/page text after the user opens Quick Check and clicks one of its capture buttons. It does not continuously monitor tabs or run an always-on content script.
- API host access is optional and requested for the origin entered in extension settings. Hosted origins must use HTTPS. Chrome's [`activeTab` permission](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab) provides temporary access after a user invokes the extension, and [optional host permissions](https://developer.chrome.com/docs/extensions/reference/api/permissions) let the user approve the configured API origin at runtime.
- The captured text remains in popup memory until the user explicitly submits it. The consent notice explains that the text goes to the Anugya Satyapak API and also to OpenAI when the backend reports AI mode.
- Extension local storage holds only the configured API origin and optional website URL. It does not save captured page or contract text.
- No API key, provider secret, website login, or browser cookie is stored in this extension.

## Prototype limits

- English interface and English review requests only.
- The quick-review input is limited to 40,000 characters. For a longer document, use the full website.
- Page capture reads text rendered in the active document. Review the capture before sending it; pages can include navigation, notices, or unrelated copy.
- Chrome-internal/restricted pages, some built-in PDF viewers, image-only pages, canvas content, and inaccessible embedded frames may not expose readable text. Select/copy and paste available text, or use the website's PDF/image extraction route.
- The extension reports candidate review items, not legal advice or a conclusion that an agreement is lawful, unfair, enforceable, or safe.
- Chrome Web Store submission, a privacy policy, stable published extension ID, and browser-family compatibility review are not part of this prototype.

## Source files

- `manifest.json` — Manifest V3 action, permissions, and popup/options pages.
- `popup.html`, `popup.css`, `popup.js` — capture controls and compact report view.
- `options.html`, `options.css`, `options.js` — API origin and optional website configuration.
- `shared.js` — URL validation and extension settings helpers.
