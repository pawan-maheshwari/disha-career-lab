# DISHA Career Lab — Claude working guide

Static site on GitHub Pages → **dishacareerlab.com** (CNAME). 5-D student career
assessment, multi-country (India, Nepal, UAE, South Africa). No build step, no
package.json: what is committed is what is served. Owner: Pawan Maheshwari.

## Token rules (read first)
- `index.html` is **2.8 MB / 12.7k lines with 45 base64 lines**. Never `Read` it whole,
  never `cat`/`grep` it without clipping. Use `tools/claude/peek.sh` (clips every line).
- Find code via `docs/CODEMAP.md` (line-numbered anchors). Grep the map, don't read all of it.
- Ignore snapshot files (`index_bac*`, `index1608`, `index20sep`, `*20sep.js`,
  `index_indianV1.0`, `indexbac_02)7`). They are blocked in `.claude/settings.json`.
- Edit with small unique `Edit` anchors. Never `Write` over a big file.

## Architecture
- `index.html` = the app: a minified React bundle plus ~21 inline
  `<script id="disha-…">` layers that wrap it (`disha-elite-layer`, then
  `disha-v2-layer` "wraps, never replaces"; pay, consent, news, cutoff engine, etc.).
- **Module source files are mirrored inline.** `webinar-module.js`, `dimensions-module.js`,
  `earlybird-module.js`, `sample-module.js`, `disha-v2-layer.js`, `disha-elite-layer.js`,
  `disha-bank-500.js` are byte-identical to their `<script id="disha-…">` block.
  **Edit the .js file, then run `python3 tools/claude/sync_modules.py`.** This is the
  cheapest way to change behaviour — you never open index.html.
- Each module exposes one global (`window.DISHA_WEBINAR`, `DISHA_SAMPLE`, `DISHA_TOPNEWS`…)
  with an `.open(lang, …)` API; menu entries call it. Bilingual strings are `{en:…, hi:…}`.
- `gallery-module.js` is loaded by `<script src>` (not inlined). `app.js`, `content/*.js`
  (per-country packs) are standalone sources.
- `schools-directory-india.html` (1.9 MB) — separate directory app.
- `blog/` — static articles. `data/cutoffs.json` + `cutoff-review.md` — cut-off data.
- Backend: Supabase (`disha-supabase.json`, `webinar-schema.sql`), Google Apps Script
  webhook (`disha-webhook.gs`), OTP config `disha-otp.json`.
- `patch.py` = older pattern: scripted, anchor-asserted edits to the minified bundle
  (writes `index_patched.html`). Use the same idea for any edit inside the React bundle.

## Bots (pull before you push)
- `cutoff-watch.yaml` (Tue/Fri) commits `data/watch-state.json`, `cutoff-review.md`.
- `supabase-keepalive.yaml` pings only.

## Recipes
- **New feature** → new `xyz-module.js` exposing `window.DISHA_XYZ`; add an empty
  `<script id="disha-xyz-module"></script>` right after the other `disha-…` blocks once; register it in
  `tools/claude/sync_modules.py`; add a menu entry `{en:"…",hi:"…",fn:()=>window.DISHA_XYZ.open(e)}`
  next to the existing ones (grep `DISHA_TOPNEWS.open`).
- **New country** → copy `content/uae.js` shape into `content/<country>.js`.
- **Verify** → `python3 tools/claude/check_html.py index.html` (parses all 24 inline scripts)
  and `python3 tools/claude/sync_modules.py --check`.
- After structural changes → `python3 tools/claude/codemap.py`.

## Style
Brand colour `#8C1515` (cardinal). Keep everything mobile-first, bilingual EN/HI where
the surrounding UI is, and dependency-free (no new CDNs without asking).
Slash commands: `/feature <ask>`, `/fix <symptom>`.
