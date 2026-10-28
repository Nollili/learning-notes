# Cross-Browser Support and HTML-First Enhancement

Define a support policy from users, accessibility needs, operating systems and maintenance constraints. A proposed study matrix is desktop Chromium/Firefox/WebKit engine tests, real Safari+VoiceOver on macOS/iOS and real Firefox+NVDA on Windows where available, plus keyboard-only and narrow/zoomed layouts. These are proposed coverage targets, not evidence that any combination passed. Pin/record actual browser/OS/runner versions at execution time. Emulated mobile viewports and Playwright WebKit are useful coverage but do not establish real iPhone/Safari or assistive-technology behavior.

Distinguish syntax support, runtime API support, CSS/layout, permissions/privacy and input/accessibility. A compiler target can rewrite some syntax; lib declarations do not install APIs; a polyfill cannot recreate every browser security or native rendering capability. Feature-detect optional capabilities and preserve a meaningful HTML baseline. Do not serve a blank app and call its loading spinner a no-JavaScript fallback.

## Worked public note search: server HTML is the baseline

The isolated fixture uses Node24.18.0/Express5.3.0 and a fixed public corpus. It performs no persistence, authentication, external request or user messaging. Use the canonical files in [the browser workbench](../../workbench/frontend/browser/index.md), copied into a separate scratch application, not the mentoring submission's replaced src/tests directory. The GET form works without the optional module; server validation and safe output remain required even when client validation exists.

<<< ../../workbench/frontend/browser/search-app.mjs{js}

The corpus IDs are application-owned fixed route segments, not unvalidated URLs. HTML escaping prevents query/title markup injection; authorization would be separately required for a private corpus. Synchronous asset reads are acceptable only as a tiny local-fixture simplification, not a request-serving production asset strategy. Real deployments should serve built/cacheable assets appropriately. Keep status/404 and no-JavaScript content correct through routing/proxy changes.

<<< ../../workbench/frontend/browser/search.css{css}

## Optional client enhancement has an owner and a fallback

<<< ../../workbench/frontend/browser/search-ui.mjs{js}

The controlled text input remains native and immediate. Results update a polite status region without forcing focus on every response. On failure the input is retained and the regular HTML link works without the JSON endpoint. No response supplies HTML or arbitrary navigation. A newer submit invalidates the old one immediately; an API ignoring abort cannot replace newer results. The five-second timer covers reading/parsing until the finally block, but cannot interrupt synchronous parsing. This tiny fixed-corpus fixture bounds result shape after parsing, **not pre-parser HTTP bytes**; use the tested bounded-response adapter policy for larger/untrusted endpoints. It is not a full hostile-response boundary.

Closing on pagehide is intentional; if the product restores from the back/forward cache, reinstall the enhancement on a persisted pageshow or retain a different owner policy. The regular form still works after this owner disposes. SPA integrations should call/dispose installSearch from the route owner rather than also running this standalone bootstrap. Feature detection cannot rescue an unparseable module; the HTML form remains useful if the module never runs.

## Exact browser-test configuration and cases

<<< ../../workbench/frontend/browser/server.mjs{js}

<<< ../../workbench/frontend/browser/playwright.config.ts{ts}

<<< ../../workbench/frontend/browser/e2e/search.spec.ts{ts}

In an approved learner browser environment, pin `@playwright/test@1.64.1`, install its matching browser binaries, run type checks separately and run the projects. The native runs here are **unperformed**; only runner discovery/type checks and nonbrowser fixture checks are claimed. No screenshot baseline is supplied or approved: generate/review it on the fixed browser/OS/font environment and investigate changes before accepting updates. An unreviewed --update-snapshots run can bless a regression. Do not run these snippets to bypass an environment's browser/URL restrictions.

Playwright roles, keyboard assertions, DOM overflow and screenshots catch different problems; none alone proves accessibility. Add automated axe checks in a supported test setup where appropriate, then test native screen-reader announcements, reading order, error recovery, zoom/reflow, contrast, reduced motion where relevant and touch/keyboard focus. This fixture has no animation; a reduced-motion emulation flag alone would prove little.

## Support and assistive-technology evidence matrix

| Target/configuration | Required observation | Current evidence |
|---|---|---|
| Chromium/Firefox/WebKit,320×640, JS on/off | Search, failure fallback, input retention, no horizontal overflow | Config/tests authored; native runs required |
| Real macOS/iOS Safari+VoiceOver | Label/control role, reading order, status announcement, fallback link, focus after navigation | Manual learner run required |
| Real Windows Firefox+NVDA | Same task with keyboard/screen reader and error recovery | Manual learner run required |
| Keyboard only,200%/400%zoom and wider viewport | Visible focus, usable labels/controls, reflow, no hidden required action | Manual learner run required |
| Slow/failed module or JSON request | Meaningful HTML path survives; no stale result or duplicate owner | Nonbrowser control flow checked; native run required |
| Private mode/storage/permissions as applicable | Clear denial/recovery; no capability-presence assumption | Outside this search fixture; storage lesson supplies separate cases |

Retain exact environment, expected/actual behavior, test/trace identifiers, failing case, diagnosis and retest evidence. A support matrix with every cell saying “supported” is a policy assertion, not a test report. Separate browser-engine regression coverage from real OS/device/assistive-technology checks. If one feature cannot be supported, explain the user outcome and scope explicitly rather than hide it in a transpiler configuration.

**Exercise acceptance:** assemble the exact scratch app, verify direct HTML/JSON validation/status/escaping, run the authored browser projects in an allowed environment and retain reviewed screenshots/traces. Block the module as well as JSON transport and prove the HTML workflow remains usable. Exercise API denial/malformed/stale responses, repeated install/dispose and back/forward ownership. Complete at least the manual combinations required by the chosen product's support policy and record limitations. Material/tests are supplied; native-browser/AT/screenshot/learner implementation remain required and no professional readiness is inferred.

Official references checked2026-10-22: [Playwright projects](https://playwright.dev/docs/test-projects), [emulation limits](https://playwright.dev/docs/emulation), [accessibility testing](https://playwright.dev/docs/accessibility-testing), [visual baselines](https://playwright.dev/docs/test-snapshots), [HTML forms](https://html.spec.whatwg.org/multipage/forms.html). This is one coherent Playwright path; Selenium/Cypress/cloud grids are alternatives when the actual support policy justifies them.
