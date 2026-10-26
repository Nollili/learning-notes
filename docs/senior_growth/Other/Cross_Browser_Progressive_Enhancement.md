# Cross-Browser Support and HTML-First Enhancement

Define a support policy from users, accessibility needs, operating systems and maintenance constraints. A proposed study matrix is desktop Chromium/Firefox/WebKit engine tests, real Safari+VoiceOver on macOS/iOS and real Firefox+NVDA on Windows where available, plus keyboard-only and narrow/zoomed layouts. These are proposed coverage targets, not evidence that any combination passed. Pin/record actual browser/OS/runner versions at execution time. Emulated mobile viewports and Playwright WebKit are useful coverage but do not establish real iPhone/Safari or assistive-technology behavior.

Distinguish syntax support, runtime API support, CSS/layout, permissions/privacy and input/accessibility. A compiler target can rewrite some syntax; lib declarations do not install APIs; a polyfill cannot recreate every browser security or native rendering capability. Feature-detect optional capabilities and preserve a meaningful HTML baseline. Do not serve a blank app and call its loading spinner a no-JavaScript fallback.

## Worked public note search: server HTML is the baseline

The isolated fixture uses Node24.18.0/Express5.3.0 and a fixed public corpus. It performs no persistence, authentication, external request or user messaging. Put the files below in a separate scratch application, not the mentoring submission's replaced src/tests directory. The GET form works without the optional module; server validation and safe output remain required even when client validation exists.

```js
// search-app.mjs
import express from 'express';
import { readFileSync } from 'node:fs';
const items = [{ id: 'cancel', title: 'Request cancellation' }, { id: 'css', title: 'CSS layers' }];
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function query(value) {
  return typeof value === 'string' && value.trim().length >= 1 && value.length <= 80 ? value.trim() : null;
}
function results(q) { return items.filter(item => item.title.toLowerCase().includes(q.toLowerCase())); }
export function page(q = '', found = [], error = '') {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1"><title>Study note search</title>
    <link rel="stylesheet" href="/search.css"><script type="module" src="/search-ui.mjs"></script></head>
    <body><a href="#main">Skip to main content</a><main id="main"><h1>Find a study note</h1>
    <form action="/search" method="get"><label for="q">Search notes</label>
    <input id="q" name="q" value="${escape(q)}" maxlength="80" required><button type="submit">Search</button></form>
    <p id="status" role="status">${escape(error || (q ? `${found.length} result${found.length === 1 ? '' : 's'}` : 'Enter a topic.'))}</p>
    <ul id="results">${found.map(item => `<li><a href="/notes/${item.id}">${escape(item.title)}</a></li>`).join('')}</ul>
    <a id="regular" hidden href="/search">Open regular results</a></main></body></html>`;
}
export function createSearchApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    res.set('Content-Security-Policy', "default-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");
    next();
  });
  app.get('/', (_req, res) => res.type('html').send(page()));
  app.get('/search', (req, res) => {
    const q = query(req.query.q);
    res.status(q ? 200 : 400).type('html').send(q ? page(q, results(q)) : page('', [], 'Enter 1–80 characters.'));
  });
  app.get('/api/search', (req, res) => {
    const q = query(req.query.q);
    if (!q) { res.status(400).json({ code: 'INVALID_QUERY' }); return; }
    res.json({ items: results(q) });
  });
  app.get('/search-ui.mjs', (_req, res) => res.type('text/javascript').send(readFileSync(new URL('./search-ui.mjs', import.meta.url), 'utf8')));
  app.get('/search.css', (_req, res) => res.type('css').send(readFileSync(new URL('./search.css', import.meta.url), 'utf8')));
  app.get('/notes/:id', (req, res) => {
    const item = items.find(item => item.id === req.params.id);
    if (!item) { res.status(404).type('text').send('Not found'); return; }
    res.type('html').send(`<!doctype html><html lang="en"><title>${escape(item.title)}</title><h1>${escape(item.title)}</h1><a href="/">Search</a></html>`);
  });
  app.use((_req, res) => res.status(404).type('text').send('Not found'));
  return app;
}
```

The corpus IDs are application-owned fixed route segments, not unvalidated URLs. HTML escaping prevents query/title markup injection; authorization would be separately required for a private corpus. Synchronous asset reads are acceptable only as a tiny local-fixture simplification, not a request-serving production asset strategy. Real deployments should serve built/cacheable assets appropriately. Keep status/404 and no-JavaScript content correct through routing/proxy changes.

```css
/* search.css */
body { font: 1rem/1.5 system-ui; margin: 1rem; color: #111; background: #fff; }
main { max-width: 65ch; }
form { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; }
input { min-width: 0; max-width: 100%; flex: 1 1 12rem; font: inherit; }
button { min-height: 2.75rem; font: inherit; }
:focus-visible { outline: 3px solid #174ea6; outline-offset: 3px; }
[hidden] { display: none !important; }
```

## Optional client enhancement has an owner and a fallback

```js
// search-ui.mjs
export function installSearch(doc, fetcher, Controller = globalThis.AbortController) {
  const form = doc.querySelector('form'), input = doc.querySelector('#q');
  const list = doc.querySelector('#results'), status = doc.querySelector('#status'), regular = doc.querySelector('#regular');
  if (!form || !input || !list || !status || !regular || typeof fetcher !== 'function' || !Controller) return () => {};
  let version = 0, active = null, activeTimer = null, stopped = false;
  const submit = async event => {
    const q = input.value.trim();
    if (!q || q.length > 80) return; // Keep ordinary form/server validation available.
    event.preventDefault();
    const current = ++version;
    active?.abort(); clearTimeout(activeTimer);
    const controller = new Controller(); active = controller;
    const timer = setTimeout(() => controller.abort(), 5000); activeTimer = timer;
    regular.href = '/search?' + new URLSearchParams({ q }); regular.hidden = true;
    status.textContent = 'Searching…'; list.replaceChildren();
    try {
      const response = await fetcher('/api/search?' + new URLSearchParams({ q }), { signal: controller.signal, credentials: 'same-origin', redirect: 'error' });
      if (!response.ok || response.headers.get('content-type')?.split(';')[0]?.trim() !== 'application/json') {
        await response.body?.cancel(); throw new Error('Unavailable');
      }
      const data = await response.json();
      if (!data || !Array.isArray(data.items) || data.items.length > 2 || data.items.some(item => !item ||
        typeof item.id !== 'string' || !['cancel', 'css'].includes(item.id) || typeof item.title !== 'string' || item.title.length > 80)) throw new Error('Invalid result');
      controller.signal.throwIfAborted();
      if (stopped || version !== current) return;
      const rows = data.items.map(item => {
        const row = doc.createElement('li'), link = doc.createElement('a');
        link.href = '/notes/' + item.id; link.textContent = item.title; row.append(link); return row;
      });
      list.replaceChildren(...rows); status.textContent = `${rows.length} result${rows.length === 1 ? '' : 's'}`;
    } catch {
      if (!stopped && version === current) { status.textContent = 'Search unavailable. Open regular results or try again.'; regular.hidden = false; }
    } finally { clearTimeout(timer); if (activeTimer === timer) activeTimer = null; if (active === controller) active = null; }
  };
  form.addEventListener('submit', submit);
  return () => { if (stopped) return; stopped = true; ++version; active?.abort(); clearTimeout(activeTimer); activeTimer = null; form.removeEventListener('submit', submit); };
}
if (typeof document !== 'undefined') {
  const dispose = installSearch(document, globalThis.fetch?.bind(globalThis));
  globalThis.addEventListener('pagehide', dispose, { once: true });
}
```

The controlled text input remains native and immediate. Results update a polite status region without forcing focus on every response. On failure the input is retained and the regular HTML link works without the JSON endpoint. No response supplies HTML or arbitrary navigation. A newer submit invalidates the old one immediately; an API ignoring abort cannot replace newer results. The five-second timer covers reading/parsing until the finally block, but cannot interrupt synchronous parsing. This tiny fixed-corpus fixture bounds result shape after parsing, **not pre-parser HTTP bytes**; use the tested bounded-response adapter policy for larger/untrusted endpoints. It is not a full hostile-response boundary.

Closing on pagehide is intentional; if the product restores from the back/forward cache, reinstall the enhancement on a persisted pageshow or retain a different owner policy. The regular form still works after this owner disposes. SPA integrations should call/dispose installSearch from the route owner rather than also running this standalone bootstrap. Feature detection cannot rescue an unparseable module; the HTML form remains useful if the module never runs.

## Exact browser-test configuration and cases

```js
// server.mjs
import { createSearchApp } from './search-app.mjs';
const server = createSearchApp().listen(4173, '127.0.0.1');
server.on('error', error => { console.error(error.code || 'SERVER_START_FAILED'); process.exitCode = 1; });
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => server.close());
```

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e', timeout: 10_000, retries: 0, workers: 1,
  use: { baseURL: 'http://127.0.0.1:4173', viewport: { width: 320, height: 640 }, trace: 'retain-on-failure' },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } }
  ],
  webServer: { command: 'node server.mjs', url: 'http://127.0.0.1:4173', timeout: 10_000, reuseExistingServer: false }
});
```

```ts
// e2e/search.spec.ts
import { test, expect } from '@playwright/test';
test.describe('HTML baseline', () => {
  test.use({ javaScriptEnabled: false });
  test('keyboard GET form works without JavaScript', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('textbox', { name: 'Search notes' }).fill('cancellation');
    await page.getByRole('textbox', { name: 'Search notes' }).press('Enter');
    await expect(page).toHaveURL(/\/search\?q=cancellation$/);
    await expect(page.getByRole('link', { name: 'Request cancellation' })).toBeVisible();
  });
});
test('enhanced keyboard result and narrow layout', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Search notes' }).fill('layers');
  await page.getByRole('textbox', { name: 'Search notes' }).press('Enter');
  await expect(page.getByRole('status')).toHaveText('1 result');
  await expect(page.getByRole('link', { name: 'CSS layers' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
test('JSON failure retains input and offers regular HTML', async ({ page }) => {
  await page.route('**/api/search?*', route => route.abort());
  await page.goto('/');
  const input = page.getByRole('textbox', { name: 'Search notes' });
  await input.fill('layers'); await input.press('Enter');
  await expect(input).toHaveValue('layers');
  const fallback = page.getByRole('link', { name: 'Open regular results' });
  await expect(fallback).toBeVisible(); await fallback.click();
  await expect(page).toHaveURL(/\/search\?q=layers$/);
  await expect(page.getByRole('link', { name: 'CSS layers' })).toBeVisible();
});
test('reviewed visual baseline', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await expect(page).toHaveScreenshot('search-320.png', { fullPage: true });
});
```

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
