# Browser public-search reference

Canonical files from the [HTML-first lesson](../../../senior_growth/Other/Cross_Browser_Progressive_Enhancement.md), displayed there through includes. The public corpus has two rows; there is no login, persistence or external action.

- `search-app.mjs`, `search.css`, `search-ui.mjs`: server baseline, layout and optional owned enhancement.
- `server.mjs`: loopback entry point, port 4173, signal cleanup.
- `playwright.config.ts`, `e2e/search.spec.ts`: authored multi-engine learner checks, including a screenshot that needs an independently reviewed baseline.

Install Express 5.3.0 in an isolated copy and run `node server.mjs`. For the authored suite, install the declared Playwright test version and matching browsers there; do not alter a mentoring submission template. See [verification](../../../frontend/verification.md) for exactly which author observations were performed. Source extraction is not a multi-engine test result.

[Practice F01/F02](../../../practice/frontend/) requires the full supported input/assistive/zoom matrix. All learner practice remains outstanding.
