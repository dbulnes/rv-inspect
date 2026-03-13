# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Self-contained PWA for pre-purchase inspection of a 2021 Winnebago Micro Minnie 1708FB travel trailer. No build tools, no dependencies, no framework — just static files served directly.

## Running Locally

```bash
python3 -m http.server 8080
# Open http://localhost:8080
```

A service worker (`sw.js`) caches assets for offline use. **Bump `CACHE_NAME` in `sw.js`** whenever you change `index.html` or `manifest.json`, otherwise returning users will see stale cached versions.

## Architecture

Everything lives in a single `index.html` file with inline CSS and JS:

- **CSS** (top of file): Dark theme with CSS custom properties in `:root`. Uses `env(safe-area-inset-*)` for iOS notch/home-bar safe areas.
- **`SECTIONS` array** (in `<script>`): The checklist data model — 23 sections, each with items that can be plain strings or objects with `{text, critical, input, inputLabel}` properties. This is the source of truth for all checklist content.
- **State object**: `{ info, checks, notes, inputs, summary }` — serialized to localStorage for auto-save and named saves.
- **Check cycle**: Each item cycles through `unchecked → ok → issue → na` on tap.
- **Two views**: Checklist (main) and Summary, switched via bottom nav tabs.
- **Save/load modal**: Named saves stored under `rv_inspect_saves` localStorage key; auto-save under `rv_inspect_autosave`.

Supporting files:
- `manifest.json` — PWA manifest for home screen install
- `sw.js` — Service worker with cache-first strategy
- `Micro Minnie Inspection Checklist.pdf` — Source PDF the checklist was derived from

## Key Conventions

- All commits must use author: `dbulnes <bulnes.david@gmail.com>`
- No build step — edit files directly and test in browser
- Keep it self-contained: no external CDNs, npm packages, or API calls
- Mobile-first: test changes at phone viewport widths
