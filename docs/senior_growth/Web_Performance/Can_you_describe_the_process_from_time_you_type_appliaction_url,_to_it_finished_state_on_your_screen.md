# Can you describe the process from time you type appliaction url, to it finished state on your screen?

## What Happens From Typing a URL to Fully Loaded Page

Understanding this process shows **how browsers render a web application**, and helps identify **performance bottlenecks** at every stage.

---

## 1. URL Resolution & DNS Lookup

- You type the URL → e.g., `https://example.com`.
- The browser must find the **IP address** of the domain.
- It checks:
  - Browser cache
  - OS cache
  - Router cache
  - DNS resolver (ISP or configured server like Google DNS)
- If not cached, a **DNS query** is sent to get the IP (A or AAAA record).

🕑 *Typical latency: 20–120 ms*

---

## 2. TCP Handshake

- Browser opens a **TCP connection** to the server’s IP on port `80` (HTTP) or `443` (HTTPS).
- TCP 3-way handshake:
  1. SYN → from browser
  2. SYN-ACK → from server
  3. ACK → from browser

🕑 *Adds round-trip latency.*

---

## 3. TLS/SSL Handshake (HTTPS Only)

- Establishes an **encrypted session**.
- Browser and server:
  - Exchange certificates.
  - Negotiate encryption algorithms.
  - Derive shared keys.

🕑 *Usually adds another 1–2 round trips.*

---

## 4. Sending the HTTP Request

- Browser sends an **HTTP GET** request for the page (e.g. `/index.html`).
- Request includes:
  - Headers (cookies, authorization tokens, etc.)
  - Possibly compression or cache info (e.g., `If-Modified-Since`).

---

## 5. Server Processing

- The server:
  - Handles request.
  - May query a database or cache.
  - Returns a **response** (HTML or redirect).

🕑 *Server response time — can vary widely.*

---

## 6. Browser Receives HTML Response

- Browser starts **streaming HTML**.
- It immediately starts **parsing** and building the **DOM tree**.
- When it encounters:
  - `<link>` → CSS, starts fetching.
  - `<script>` → JS, may block parsing unless `async` or `defer` used.
  - `<img>`, `<video>`, etc. → fetched in parallel.

---

## 7. Building the Render Tree

1. **DOM Tree** from HTML.
2. **CSSOM Tree** from CSS.
3. Combine both → **Render Tree** (visual structure).

🧠 *Blocking: CSS is render-blocking until fully loaded and parsed.*

---

## 8. Layout (Reflow)

- Browser calculates **positions and sizes** of elements.
- This process is called **layout** or **reflow**.

---

## 9. Paint

- Browser paints **pixels** for each element to layers (background, borders, text, etc.)

---

## 10. Compositing

- The **GPU** (or compositor thread) combines layers and draws them on screen.
- This forms the first visible frame — your **First Contentful Paint (FCP)**.

---

## 11. JavaScript Execution

- Browser downloads and executes JS bundles:
  - Can manipulate DOM → triggers **reflows/repaints**.
  - Can request data → **network fetches**, **XHRs**, **GraphQL**, etc.
  - JS can block main thread if not optimized.

---

## 12. Loading Additional Resources

- Browser continues loading:
  - Fonts
  - Images
  - API data (hydration, SSR)
- May perform **lazy loading** or **code splitting**.

---

## 13. Interactivity Ready (TTI / TTFI)

- Once JS is executed and event listeners are attached → page becomes **interactive**.
- Metrics:
  - **TTI (Time To Interactive)**
  - **TTFI (Time To First Interaction)**

---

## 14. Idle State

- Page fully loaded, all critical assets cached.
- Background tasks or workers may continue (analytics, prefetching, hydration).

---

## 🔍 Common Performance Bottlenecks

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

## 🧩 Summary Flow

URL → DNS Lookup → TCP/TLS Handshake → HTTP Request
→ Server Response → Parse HTML → Build DOM & CSSOM
→ Render Tree → Layout → Paint → Composite → Interact

Each stage offers **profiling and optimization opportunities**, crucial for a senior front-end developer.

---