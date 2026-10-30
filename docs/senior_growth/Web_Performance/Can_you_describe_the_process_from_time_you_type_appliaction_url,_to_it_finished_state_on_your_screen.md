# Can you describe the process from time you type appliaction url, to it finished state on your screen?

## What Happens From Typing a URL to Fully Loaded Page

Understanding this process shows **how browsers render a web application**, and helps identify **performance bottlenecks** at every stage.

---

## URL Resolution & DNS Lookup {#_1-url-resolution-dns-lookup}

- You type the URL → e.g., `https://example.com`.
- The browser must find the **IP address** of the domain.
- It checks:
  - Browser cache
  - OS cache
  - Router cache
  - DNS resolver (ISP or configured server like Google DNS)
- If not cached, a **DNS query** is sent to get the IP (A or AAAA record).

Measure resolver/network/cache conditions; there is no universal DNS latency.

---

## Transport Connection: TCP or QUIC {#_2-transport-connection-tcp-or-quic}

- When a new HTTP/1.1 or HTTP/2 connection is needed, TCP is commonly used (HTTPS typically443). HTTP/3 uses QUIC over UDP with integrated TLS; it does not perform a TCP handshake. Existing connections, caches or a service worker may avoid a new network setup entirely.
- TCP 3-way handshake:
  1. SYN → from browser
  2. SYN-ACK → from server
  3. ACK → from browser

 *Adds round-trip latency.*

---

## TLS Handshake (HTTPS) {#_3-tls-handshake-https}

- Establishes an **encrypted session**.
- Browser and server:
  - Authenticate the server certificate/hostname/chain; client certificates are optional in relevant deployments.
  - Negotiate encryption algorithms.
  - Derive shared keys.

TLS version, resumption, transport and network conditions determine setup. TLS1.3 differs from1.2; QUIC integrates TLS. Do not charge DNS/TCP/TLS separately for each reused request.

---

## Sending the HTTP Request {#_4-sending-the-http-request}

- Browser sends an **HTTP GET** request for the page (e.g. `/index.html`).
- Request includes:
  - Headers (cookies, authorization tokens, etc.)
  - Possibly compression or cache info (e.g., `If-Modified-Since`).

---

## Server Processing {#_5-server-processing}

- The server:
  - Handles request.
  - May query a database or cache.
  - Returns a **response** (HTML or redirect).

 *Server response time — can vary widely.*

---

## Browser Receives HTML Response {#_6-browser-receives-html-response}

- Browser consumes the response body incrementally as bytes become available.
- It immediately starts **parsing** and building the **DOM tree**.
- When it encounters:
  - `<link>` → CSS, starts fetching.
  - `<script>` → JS, may block parsing unless `async` or `defer` used.
  - `<img>`, `<video>`, etc. → fetched in parallel.

---

## Building the Render Tree {#_7-building-the-render-tree}

1. **DOM Tree** from HTML.
2. **CSSOM Tree** from CSS.
3. Combine both → **Render Tree** (visual structure).

Matching critical stylesheets can delay rendering; media conditions, discovery and script/style dependencies affect the exact behavior. The preload scanner can discover resources ahead of the main parser.

---

## Layout (Reflow) {#_8-layout-reflow}

- Browser calculates **positions and sizes** of elements.
- This process is called **layout** or **reflow**.

---

## Paint {#_9-paint}

- Browser paints **pixels** for each element to layers (background, borders, text, etc.)

---

## Compositing {#_10-compositing}

- The rendering/compositing pipeline produces frames using browser/platform resources; GPU use is implementation-dependent.
- A first frame is not necessarily FCP: FCP requires eligible content. LCP is a separate later/largest eligible content milestone.

---

## JavaScript Execution Overlaps Earlier Stages {#_11-javascript-execution-overlaps-earlier-stages}

- JavaScript may execute while parsing, after parsing, or later; it is not a stage that always waits until after the first composite:
  - Can manipulate DOM → triggers **reflows/repaints**.
  - Can request data → **network fetches**, **XHRs**, **GraphQL**, etc.
  - JS can block main thread if not optimized.

---

## Loading Additional Resources {#_12-loading-additional-resources}

- Browser continues loading:
  - Fonts
  - Images
  - API data (hydration, SSR)
- May perform **lazy loading** or **code splitting**.

---

## Interaction and Ongoing Updates {#_13-interaction-and-ongoing-updates}

Native links/forms can work before hydration; client controls become available according to code/data/boundary readiness. A load event or attached handler does not prove responsiveness or correctness. Use actual interaction traces and field INP; TTI is a retired Lighthouse metric and TTFI is informal terminology.

---

## Idle State {#_14-idle-state}

- The load event does not mean every future resource is loaded/cached or that the application is permanently idle.
- Background tasks or workers may continue (analytics, prefetching, hydration).

---

## Common Performance Bottlenecks {#%F0%9F%94%8D-common-performance-bottlenecks}

| Stage | Problem | Example Fix |
|--------|----------|-------------|
| DNS | Slow lookup | DNS prefetching |
| TCP/TLS | Too many round trips | HTTP/2 or 3 |
| Server | Slow backend | Caching (Redis, CDN, SSR cache) |
| HTML parsing | Blocking scripts | `async` / `defer` |
| CSS | Large stylesheets | Minify, critical CSS |
| JS execution | Heavy bundles | Code splitting, tree-shaking |
| Rendering | Expensive layouts | Avoid forced reflows |
| Interactivity | JS blocking main thread | Web Workers, lazy hydration |

---

## Summary Flow {#%F0%9F%A7%A9-summary-flow}

URL → DNS Lookup → TCP/TLS Handshake → HTTP Request
→ Server Response → Parse HTML → Build DOM & CSSOM
→ Render/Update opportunities: Style → Layout → Paint → Composite

Network, parsing, script execution and rendering overlap/repeat; interaction may start before all resources finish.

Each stage offers **profiling and optimization opportunities**, crucial for a senior front-end developer.

---
## Debug the actual critical path

```js
const navigation = performance.getEntriesByType('navigation')[0];
if (navigation) {
  console.table({
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    connection: navigation.connectEnd - navigation.connectStart,
    requestToFirstByte: navigation.responseStart - navigation.requestStart,
    responseTransfer: navigation.responseEnd - navigation.responseStart,
    protocol: navigation.nextHopProtocol
  });
}
```

Zero intervals can mean cache/reuse/restricted timing, not an infinitely fast network. requestToFirstByte includes network/server work, not just server CPU. TLS timing can overlap the connection interval; do not add overlapping spans twice. Resource Timing cross-origin detail needs appropriate Timing-Allow-Origin permission. Capture timing after the event/window of interest and distinguish document navigation from SPA transitions or back-forward-cache restoration.


References checked2026-10-20: [HTTP/2](https://www.rfc-editor.org/rfc/rfc9113.html), [HTTP/3](https://www.rfc-editor.org/rfc/rfc9114.html), [Navigation Timing2](https://www.w3.org/TR/navigation-timing-2/), [Network tooling](https://developer.chrome.com/docs/devtools/network/reference).


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/performance/Can_you_describe_the_process_from_time_you_type_appliaction_url%2C_to_it_finished_state_on_your_screen.md). All learner practice remains outstanding.
