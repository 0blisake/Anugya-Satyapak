# Inactive Chrome Web Store draft

> **Not part of the current plan:** Anugya Satyapak will not be published globally in the Chrome Web Store. This prototype is for a project-team laptop showcase, loaded through **Developer mode → Load unpacked**. Do not follow the draft submission sequence below. The listing copy and artwork are retained temporarily and are not needed to run the local demo; they can be removed during the planned repository cleanup.

The notes below are inactive historical preparation material. For the current local showcase steps, use [`README.md`](README.md).

## Product details

- **Name:** Anugya Satyapak — Quick Check
- **Short purpose:** A local first-pass scan of selected contract text while browsing.
- **Category:** Productivity
- **Language:** English
- **Single-purpose statement:** This extension lets a user capture or paste a short passage of contract text and run a small English wording-pattern scan in the extension popup.
- **Description:** Select a short passage on a webpage, open Anugya Satyapak Quick Check, and review the wording in context. The extension checks a limited set of English patterns covering renewal and cancellation, additional charges, refunds and termination, changes to terms, disputes, and liability. The scan runs locally in the popup. It does not use an AI service, call a review API, or transfer text to the Anugya Satyapak website. For long agreements, PDFs, photos, OCR, citations, or a full report, use the Anugya Satyapak website. This prototype can miss important terms and is not legal advice.
- **Homepage:** https://0blisake.github.io/Anugya-Satyapak/
- **Support:** https://github.com/0blisake/Anugya-Satyapak/issues
- **Privacy policy:** https://0blisake.github.io/Anugya-Satyapak/extension-privacy.html
- **Price:** Free prototype.
- **Distribution:** Decide in the dashboard. This prototype is English-only and does not make jurisdiction-specific findings.

## Permission justifications

- **`activeTab`:** Provides temporary access to the current tab after the user opens the extension popup so the popup can capture the current selection or, after a separate button click, visible page text.
- **`scripting`:** Runs the small text-capture function in the current tab after the user invokes the extension. It does not install an always-running content script.
- **`clipboardWrite`:** Copies text only after the user chooses **Copy text** in the popup.
- **Remote code:** None. All executable code is packaged in the extension ZIP.
- **Data use:** Disclose website content and user-provided contract text in the dashboard's data-use section (field names may vary). The text is processed locally in the popup, is not transmitted to the developer or a third party, and is not retained after the popup closes. It is not used for advertising, analytics, or profiling. Ensure the dashboard declarations and limited-use certification match the actual uploaded build and this privacy notice.
- **Support note:** The GitHub issue tracker is public; do not invite users to post contracts, personal details, or other sensitive content there.

## Store images and demo

- **Store icon:** `icons/icon128.png` (also included in the extension package).
- **Small promotional tile:** `store-assets/promo-small.png` (440 × 280 px).
- **Screenshot:** Still required. Capture at least one actual 1280 × 800 screenshot of the updated popup in Chrome after loading and exercising this exact build. Do not use a mockup in the screenshot slot.
- **Promotional video:** Optional for this prototype. If supplied, it should show the real extension and accurately describe the limited local scan.
- **Marquee tile:** Optional; no separate marquee asset is prepared.

## Archived publish sequence — do not use for the current project

1. Push the approved source changes and deploy the website so the privacy policy URL above is live.
2. Load the packaged ZIP or this extension folder in desktop Chrome and verify capture, manual paste, enabled/disabled button states, scan results, copy, and unsupported-page messaging.
3. Capture the actual 1280 × 800 popup screenshot after that check.
4. Register/sign in to the Chrome Web Store developer account. Google currently requires a one-time registration fee and 2-Step Verification before publishing/updating.
5. In the Chrome Developer Dashboard, upload the ZIP from the task outputs folder.
6. Complete the listing details, icon, promo tile, screenshot, distribution, single-purpose, permission, remote-code, and data-use/privacy fields. Keep every disclosure consistent with the packaged code and privacy notice.
7. Review the generated Store listing, then submit it for review from the account owner’s dashboard.
8. Archived and superseded: no Store URL will be added. The website now links to the local laptop-showcase instructions in `extension/README.md`.

The project owner must perform account registration, dashboard submission, and the final review confirmation. No account credentials are stored in this project.
