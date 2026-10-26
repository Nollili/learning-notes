# What if we are facing performance issues because we have lots of requests?

## Handling Performance Issues Caused by Too Many Requests

When your app makes **lots of HTTP requests**, it can slow down **initial load**, hurt **runtime performance**, and strain your **server**.  
Requests consume bandwidth/server/scheduling capacity, but do not each require a new DNS/TCP/TLS setup. Reuse, multiplexing, caches, dependencies and payload/processing cost determine impact.

---

## ⚠️ Why Too Many Requests Are a Problem

| Impact                  | Description                                                                 |
|-------------------------|-----------------------------------------------------------------------------|
| **Increased Load Time** | New origins/connections can require setup; reused connections share setup across requests.        |
| **Blocked Rendering**   | CSS/JS requests can block the critical rendering path.                      |
| **Network Congestion**  | HTTP/1.1 connection limits are browser-specific; HTTP/2 and3 multiplex streams with negotiated limits and shared transport/resource constraints.         |
| **Server Load**         | Backend must handle many small requests instead of fewer, optimized ones.   |
| **Energy & Bandwidth**  | Especially bad for mobile or slow networks.                                 |

---

## 🔍 Step 1: Diagnose and Measure

Use the **Network tab in Chrome DevTools** or **WebPageTest** to check:
- Total number of requests
- Types of requests (JS, CSS, fonts, images, API)
- Timing (DNS, waiting, download)
- Unnecessary or duplicate requests

**Helpful Tools:**
- **Lighthouse** – “Reduce the impact of third-party code” & “Reduce payloads” audits  
- **Webpack Bundle Analyzer / Vite bundle visualizer**
- **DevTools → Coverage tab** – find unused JS/CSS

---

## 🧩 Step 2: Optimize Static Asset Requests

### 1. Bundle and Minify
- Combine small JS/CSS files into bigger bundles (but **don’t make one huge bundle**; code splitting is still important).
- Use **tree shaking** to remove unused code.
- Enable **Gzip** or **Brotli compression**.

### 2. Code Splitting
- Dynamically import only what’s needed:
  ```js
  const Chart = React.lazy(() => import('./Chart'));
  ```
- Load non-critical components after first render.

### 3. Asset Caching
- Use long-term caching with HTTP headers:
  ```http
  Cache-Control: max-age=31536000, immutable
  ```
- Version assets with file hashes (e.g. `main.abc123.js`).

### 4. Preload & Prefetch
- Use HTML resource hints:
  ```html
  <link rel="stylesheet" href="critical.css">
  <!-- Preload only if late discovery is proven; use as="style" and still consume it. -->
  <link rel="prefetch" href="next-page.js">
  ```

### 5. Serve Through a CDN
- Lower latency by serving from servers closer to users.
- Reduce load on your origin server.

---

## 🌐 Step 3: Optimize API Requests

### 1. Batch and Aggregate Requests
- Combine small API calls into one endpoint.
- Example: Instead of 10 `/user/{id}` calls, use `/users?ids=1,2,3,…`.

### 2. Use GraphQL or BFF (Backend-for-Frontend)
- A BFF can aggregate UI-specific data. GraphQL permits selection but does not automatically avoid over-fetching, N+1 work or authorization errors; enforce server budgets and data access rules.

### 3. Debounce or Throttle Frequent Requests
- Prevent flooding APIs from user input or scroll events.
  ```js
  const debouncedFetch = debounce(fetchData, 300);
  ```

### 4. Implement Caching Layers
- Client-side caching with React Query, SWR, or Redux Toolkit Query.
- Server-side caching (Redis, CDN edge cache).
- Use ETag or Last-Modified headers for conditional requests.

### 5. Lazy Load Non-Critical Data
- Load non-essential data after the main UI is interactive.
  ```js
  useEffect(() => {
    import('./analytics').then(m => m.init());
  }, []);
  ```

---

## 📱 Step 4: Image and Media Optimization

### 1. Use Responsive Images
- Use HTML:
  ```html
  <img srcset="..." sizes="..." src="..." alt="..." />
  ```
- Or use Next.js `<Image>` to serve the right size for each device.

### 2. Lazy Loading
- Use `loading="lazy"` to defer off-screen image requests.

### 3. Choose Icon Delivery Deliberately
- SVG sprites or a small icon subset can share bytes; inline SVG avoids a request but enlarges HTML. Icon fonts have loading/semantics trade-offs. Label meaningful controls and hide decorative icons appropriately.

---

## ⚙️ Step 5: Architectural Strategies

| Technique           | Description                                                      |
|---------------------|------------------------------------------------------------------|
| HTTP/2 or HTTP/3    | Multiplexes — multiple requests per connection.                  |
| Domain Sharding     | Used for HTTP/1.1 to parallelize requests (not needed for HTTP/2).|
| Service Workers     | Cache assets & responses offline; avoid redundant network hits.  |
| Edge Functions      | Pre-render and serve from CDN edge locations.                    |

---

## ✅ Summary

| Problem                    | Solution                                 |
|----------------------------|------------------------------------------|
| Too many JS/CSS files      | Bundle + minify + tree shake             |
| Too many API calls         | Batch or aggregate calls                 |
| Duplicate requests         | Cache at client/server/CDN               |
| Unnecessary early requests | Lazy load, prefetch smartly              |
| Network overhead           | HTTP/2 + CDN + compression               |

---

## 🧠 Rule of Thumb

Set route/device-specific budgets from a baseline and user outcomes;100requests/2MB is not a universal target. Prioritize critical-path bytes, dependency waterfalls, duplication and server cost rather than request count alone.

---

## 🧾 Example Summary Workflow

1. Measure with Lighthouse or DevTools.
2. Find redundant or late-loaded assets.
3. Group and bundle JS/CSS.
4. Defer/lazy load non-critical modules.
5. Cache according to freshness/privacy and invalidation requirements (client, CDN, server).
6. Monitor continuously (Lighthouse CI, Sentry Performance, Datadog RUM).
## Request topology and failure contract

HTTP/2 multiplexes over TCP, so packet loss can stall multiple streams at the transport layer. HTTP/3 uses QUIC streams and avoids that same cross-stream transport head-of-line blocking, but still shares congestion/bandwidth and server constraints. More concurrency is not unlimited throughput. Domain sharding can add DNS/TLS cost and lose reuse; measure rather than carrying an HTTP/1.1 workaround into a multiplexed deployment.

A batch endpoint reduces round trips but needs maximum IDs/body size, per-item authorization, predictable partial-failure semantics and a deadline. It can delay every result behind the slowest dependency. Parallel independent requests can expose useful data sooner; dependent requests create waterfalls. A GraphQL/BFF choice changes server ownership and observability, not physics.

For client query caches, define keys including all data-affecting inputs/user scope, stale policy, invalidation and bounded retention. Deduplicate in-flight equivalent reads where appropriate; abort obsolete searches and reject stale responses. Debounce alone does not cancel an already running request. Retry only classified transient failures with bounded backoff and safe/idempotent semantics; request reduction must not leak one user's private cached data to another.

**Exercise:** compare20sequential item reads, bounded-parallel reads and one capped batch endpoint. Acceptance: retain waterfall/protocol/connection evidence, transferred bytes, server workload and perceived partial-result behavior; simulate one slow/error item, rapid query changes and two users; demonstrate correct authorization/cache isolation, cancellation and bounded retries. Choose a topology from measured latency/failure trade-offs rather than the lowest request count. This is an unperformed learner lab, not a recorded benchmark.

References checked2026-10-20: [HTTP/2](https://www.rfc-editor.org/rfc/rfc9113.html), [HTTP/3](https://www.rfc-editor.org/rfc/rfc9114.html), [HTTP caching](https://www.rfc-editor.org/rfc/rfc9111.html), [Network tooling](https://developer.chrome.com/docs/devtools/network/reference).
