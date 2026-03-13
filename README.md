# Micro Minnie 1708FB Inspection Checklist

A mobile-friendly progressive web app (PWA) for conducting a pre-purchase inspection of a 2021 Winnebago Micro Minnie 1708FB travel trailer.

## Features

- **23 inspection sections** covering exterior, interior, plumbing, electrical, propane, appliances, and more
- **Tap to cycle** each item: unchecked → ✓ pass → ✗ issue → — N/A
- **Notes and measurements** on any item (temperatures, voltages, tire pressures, etc.)
- **Auto-save** — progress saves automatically to your device
- **Named saves** — save, load, overwrite, and delete multiple inspections
- **Summary view** — see pass/issue/pending counts, all flagged issues, set overall condition and recommended action
- **Export** — share or copy a full text summary of findings
- **Offline support** — works without internet via service worker
- **Install to home screen** — runs as a standalone app on iOS and Android

## Install on iPhone

1. Open the GitHub Pages URL in **Safari**
2. Tap the **Share button** (square with arrow)
3. Tap **"Add to Home Screen"**
4. Done — launches fullscreen like a native app

## Run Locally

```bash
# Any static file server works
python3 -m http.server 8080
# Open http://localhost:8080
```

## Based On

The checklist is based on the included [Micro Minnie Inspection Checklist.pdf](Micro%20Minnie%20Inspection%20Checklist.pdf), a comprehensive pre-purchase inspection guide for the 2021 Winnebago Micro Minnie 1708FB.

## License

MIT
