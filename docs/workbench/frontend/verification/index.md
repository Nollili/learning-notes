# Author browser checks

These scripts retain the exact local author scenarios described in [the verification ledger](../../../frontend/verification.md). Install this manifest in an isolated copy. Set `FRONTEND_APP_DIR` to the corresponding installed/built browser, React or Next application copy; set `CHROME_EXECUTABLE` to the locally installed Chrome executable used for verification (otherwise Playwright uses its installed matching Chromium). Run the relevant `browser-search.mjs`, `react-browser.mjs` or `next-browser.mjs`. Each owns a loopback server and browser and closes both. Ports 4173–4175 must be available.

Screenshots are written under `/tmp/frontend-*`. These are headless desktop-browser and viewport checks, not real mobile, zoom, screen-reader, full auth/API or learner practice evidence. The separate original multi-engine/screenshot suite still requires matching browsers and reviewed baselines.
