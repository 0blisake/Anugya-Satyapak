# Anugya Satyapak brand assets

Place approved, original, or properly licensed brand artwork in this folder. The site uses `logo-mark.svg` in the header and footer, with a built-in shield mark as a fallback. The Anugya Satyapak wordmark remains editable text in the interface.

This is the folder to use for the logo: `frontend/public/brand/`. Files placed here are served from `/brand/` by the website. To change the displayed mark, replace `logo-mark.svg` with approved artwork that uses the same filename, or update the image path in `frontend/src/App.tsx`.

Suggested filenames:

- `logo-mark.svg` — compact symbol currently used in the website header and footer.
- `logo.svg` — complete logo with wordmark, for documents or wider placements.
- `wordmark.svg` — the Anugya Satyapak name without the symbol.
- `logo-source.jpeg` — optional original raster source, if you want to keep it alongside an optimized SVG.

Use SVG for the website when possible so the logo stays crisp at different sizes. Transparent PNG files are also supported for raster artwork. Keep originals in this folder, preserve transparent backgrounds, and use artwork that the project is authorized to use. Do not download or include an unrelated company's logo.
