# Rendering, progressive enhancement and composition boundaries

SPA/MPA describe navigation/application organization; CSR/SSR/SSG describe when/where HTML is produced; PWA features add browser capabilities. They are overlapping axes, not mutually exclusive products. An MPA can have rich client interaction and offline support; a SPA route can start with server-rendered HTML. Choose per user journey using measured device/network/server costs, crawlable content, freshness, authorization and failure recovery.

## Start with an operable HTML baseline

This catalogue search works through a server GET route even when enhancement JavaScript fails. The server must actually implement `/courses`, validate the query and return accessible results; the HTML alone does not create that endpoint. Never put secrets in GET query strings.

```html
<form action="/courses" method="get">
  <label for="course-query">Search public courses</label>
  <input id="course-query" name="q" maxlength="100">
  <button type="submit">Search</button>
</form>
<nav class="course-links" aria-label="Public courses">
  <a href="/courses/c1">Course one</a>
  <a href="/courses/c2">Course two</a>
</nav>
<p class="enhancement-status" role="status"></p>
```

```css
.course-links { display: block; }
.course-links a { display: block; padding: .75rem; overflow-wrap: anywhere; }
@supports (display: grid) {
  .course-links { display: grid; grid-template-columns: minmax(0, 1fr); gap: .5rem; }
  @media (min-width: 45rem) {
    .course-links { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
}
@media (prefers-reduced-motion: reduce) {
  .course-links { scroll-behavior: auto; }
}
```

Progressive enhancement means the baseline task remains possible without an optional capability; it is broader than adding columns at a large viewport. `@supports` chooses a layout enhancement while ordinary block links remain usable. Mobile-first CSS does not imply a touch-only device or an automatic performance win. Test content, keyboard/pointer input, zoom, reduced motion, forced colors and network failure. Do not hide an essential action merely to make a narrow screenshot tidy.

WCAG2.2 AA target-size criterion2.5.8 uses24×24 **CSS pixels** or qualifying spacing/exception rules. The enhanced AAA criterion2.5.5 uses44×44 with its own exceptions. A48×48 design target can be useful but is not a universal WCAG minimum. Record the actual criterion, rendered hit area and spacing rather than relying on a CSS declaration. [WCAG2.2 target-size rules](https://www.w3.org/TR/WCAG22/#target-size-minimum) and [CSS feature queries](https://www.w3.org/TR/css-conditional-3/#at-supports) are the authoritative references.

## Worked public offline fallback

A service worker is an event-driven worker whose lifetime is controlled by the browser, not an always-running background daemon. Registration needs a secure context and appropriate origin/path scope. Installation is not the same as activation/control of an already open page. Cache API storage is separate from ordinary HTTP cache semantics and can be evicted; offline capability must be designed and tested, not inferred from a manifest or service-worker registration.

This complete **policy example** assumes a separately deployed public `/offline.html` and immutable `/assets/site-v1.css`. Its namespace is owned by this app. It precaches only those public files with credentials omitted, never stores fetched account/API HTML, and falls back to a generic offline document on navigation network failure. The offline document must contain no private data and explain that private actions are unavailable.

```js
const CACHE = 'study-public-v1';
const PUBLIC = ['/offline.html', '/assets/site-v1.css'];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const existed = (await caches.keys()).includes(CACHE);
    try {
      const cache = await caches.open(CACHE);
      await cache.addAll(PUBLIC.map(path => new Request(new URL(path, self.location.origin), {credentials: 'omit', cache: 'reload'})));
    } catch (error) {
      if (!existed) await caches.delete(CACHE);
      throw error;
    }
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith('study-public-') && key !== CACHE) await caches.delete(key);
    }
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    // Never save authenticated HTML. Only a generic public offline fallback is cached.
    event.respondWith(fetch(request).catch(async () => {
      const cache = await caches.open(CACHE);
      return (await cache.match('/offline.html')) ?? new Response('Offline. Private data is unavailable.', {status: 503});
    }));
  } else if (!url.search && PUBLIC.includes(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      return (await cache.match(url.pathname)) ?? fetch(new Request(request, {credentials: 'omit'}));
    })());
  }
});
```

Register from an owned client entrypoint, with a useful failure state instead of breaking the baseline:

```js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/offline-worker.js').catch(() => {
    document.querySelector('.enhancement-status').textContent = 'Offline support is unavailable; online navigation still works.';
  });
}
```

The deployment must serve the matching worker/assets and an accessible offline page; the sample does not silently invent them. Change cache/versioned asset names as a coherent release. It intentionally avoids `skipWaiting`/`clients.claim`: force-activating a new worker against old pages can mix incompatible assets. Default waiting/activation needs a documented user-update flow. Clean only your own namespace, and coordinate cleanup with any explicitly supported old clients.

Do not add broad cache-first handling for authenticated responses or write requests. Network HTTP401/404/500 is not automatically an offline exception; handle those statuses according to the page's contract.

**Actual local check:** a Node24.18 VM with controlled Cache/fetch/event adapters passed credential-free public precache, namespace cleanup, POST/cross-origin/private-API/query bypass, generic navigation fallback without runtime storage and failed-install cleanup. This checks policy branches, not native install/activation/eviction or a deployed offline application. Native browser registration, updates, offline/reconnect and storage eviction remain practice. [The service-worker specification](https://www.w3.org/TR/service-workers/) defines lifecycle and fetch/cache behavior; check supported browser APIs for your target devices.

## Optional microfrontend contract: one versioned custom element

Independent ownership/release needs may justify microfrontends; multiple frameworks are not a requirement. Prefer a modular single application unless independent releases provide enough value to pay for shared routing/auth/design contracts, duplicated runtime cost, coordinated compatibility and observability. Server/route composition can produce an MPA; microfrontends are not inherently SPAs.

A small client-only custom element can expose a versioned **event contract** without passing an application's internal store across module boundaries. This introductory example snapshots attributes when connected; changing them later is not an update API. Disconnect/reconnect is supported. It renders the label as text and aborts its owned listener on disconnect.

```js
export class CourseCardV1 extends HTMLElement {
  #button;
  #lifetime;
  constructor() {
    super();
    this.#button = document.createElement('button');
    this.#button.type = 'button';
    this.attachShadow({mode: 'open'}).append(this.#button);
  }
  connectedCallback() {
    this.#lifetime?.abort();
    this.#lifetime = new AbortController();
    const id = this.getAttribute('course-id') ?? '';
    this.#button.textContent = this.getAttribute('label') ?? 'Choose course';
    this.#button.disabled = !/^[a-z0-9-]{1,40}$/.test(id) || id.trim() !== id;
    this.#button.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('course-select-v1', {
        detail: {version: 1, courseId: id}, bubbles: true, composed: true
      }));
    }, {signal: this.#lifetime.signal});
  }
  disconnectedCallback() {this.#lifetime?.abort();}
}
export function acceptedSelection(detail, allowed) {
  if (typeof detail !== 'object' || detail === null || Array.isArray(detail)) return null;
  const keys = Object.keys(detail);
  if (keys.length !== 2 || !keys.includes('version') || !keys.includes('courseId')) return null;
  if (detail.version !== 1 || typeof detail.courseId !== 'string' || !allowed.has(detail.courseId)) return null;
  return detail.courseId;
}
if (!customElements.get('course-card-v1')) customElements.define('course-card-v1', CourseCardV1);
```

The host listens for `course-select-v1`, calls `acceptedSelection` with its **current application allowlist**, and then routes a validated ID or sends an authorized server request. The server rechecks actual permission; the UI allowlist is not an authorization boundary. Render the ordinary course links until the reviewed module loads successfully; on import/mount failure keep them usable and announce an optional enhancement failure. Use an allowlisted build URL/version and a reviewed integrity/deployment policy, not a remote URL supplied by event detail.

Same-page custom elements, Shadow DOM and Module Federation run JavaScript with page authority. They are not sandboxes against malicious code or data export. Shadow DOM helps style/DOM encapsulation, not isolation of credentials/global APIs. A truly untrusted widget needs a separately reviewed origin/sandbox/permissions/message contract; iframe messaging must validate source, origin and payload. Do not assume a custom event came from a trusted module or that independent deployment guarantees compatibility.

**Actual local check:** Vitest5/JSDOM30 verified text-only label rendering, event delivery, exact version/key/current-ID acceptance, rejection of an extra field/unknown ID/version, listener disposal and a single listener after reconnect. This is not a native accessibility test or independently deployed remote-module system. Reusing an existing custom-element tag also needs an explicit compatibility policy; a name alone does not verify a component's implementation.

## Practice acceptance and decision record

1. Implement the HTML route, disable JavaScript and complete the search/navigation task. Enable enhancement, fail its import and show that the same task remains possible.
2. On actual browsers/devices, test320CSS-pixel reflow,200%/400% zoom, keyboard/touch, screen-reader labels/focus, reduced motion and target spacing. Retain observations and repair failures; no such native run is claimed here.
3. Deploy the public worker/assets in an owned secure-context fixture. Prove install failure, first load versus controlled reload, update waiting, offline fallback/reconnect and eviction recovery. Verify no private record or write is available from cache after logout/account change.
4. If microfrontends are justified, document shell/child owners, versioned props/events, auth/route/locale/design-system contracts, error fallback and rollback compatibility. Reproduce the custom-element tests and fail an incompatible version. An advanced independently deployed federation/iframe project remains optional.
5. Write an ADR comparing one coherent primary React app with the relevant alternative. Include expected workload and measured evidence, not generic “SPA fast/MPA slow/PWA offline” scores.

Learner practice remains **still required**. This material provides worked implementations and bounded local checks without claiming native browser, deployment or professional readiness. Official references: [HTML custom-element lifecycle](https://html.spec.whatwg.org/multipage/custom-elements.html), [HTML event dispatch model](https://dom.spec.whatwg.org/#dispatching-events).
