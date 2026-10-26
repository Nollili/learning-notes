### Do you know some script tag properties to alter loading behavior? async vs defer

### Script Tag Loading Behavior — `async` vs `defer` (and others)

How the browser loads and executes JavaScript impacts **page performance** and **interactivity**.  
Knowing `<script>` tag attributes like `async` and `defer` helps optimize the **Critical Rendering Path** and improve content delivery and interaction responsiveness. TTFI is informal; use appropriate LCP/INP/long-task diagnostics rather than a universal DOM-ready metric.

---

## 🧩 Default Script Loading Behavior

### `<script src="main.js"></script>`
- **Blocking by default.**
- Browser **pauses HTML parsing**, downloads and executes the script, then continues.
- Parser blocking/main-thread execution can delay content discovery or paint; it does not imply that no content was painted earlier.

Use an early blocking script only for a justified ordering requirement; it cannot assume later DOM nodes exist.

---

## ⚡ `async` Attribute

```html
<script src="script.js" async></script>
```
🔹 Behavior:
Script downloads while HTML is parsed.

When ready and the main thread can run it, an async classic can interrupt parsing for execution; fetching in parallel does not move its JavaScript to a worker.

Step | Description
--- | ---
1 | HTML parsing starts
2 | Script starts downloading (non-blocking)
3 | When script finishes downloading, HTML parsing pauses and script executes immediately
4 | HTML parsing resumes after script execution

✅ Use for:
Scripts that don’t depend on DOM or other scripts (e.g., analytics, ads, tracking pixels).

External, non-critical JS.

⚠️ Drawback:
Execution order is not guaranteed.
Scripts may run as soon as they finish downloading, out of order.

Example:
```html
<script src="https://www.googletagmanager.com/gtag/js" async></script>
```
🕓 defer Attribute
```html
<script src="main.js" defer></script>
```
🔹 Behavior:
Script downloads while HTML is parsed.

Execution is deferred until after HTML is fully parsed (just before DOMContentLoaded).

Step	Description
1	HTML parsing starts
2	Script starts downloading (non-blocking)
3	Script executes after parsing completes
4	Deferred classic scripts finish; this alone does not prove the app is responsive or its async data is ready

✅ Use for:
External classic scripts that need parsed DOM; modules have their own default deferred processing.

Scripts that rely on others (executed in order they appear).

⚡ Bonus:
Execution order is preserved even with multiple deferred scripts.

Example:
```html
<script src="/vendor.js" defer></script>
<script src="/main.js" defer></script>
```
→ vendor.js executes before main.js, after DOM is parsed.

The complete category table below also covers inline classic and async module scripts; do not apply an external-classic rule to every script element.

🧠 Extra: type="module"
```html
<script type="module" src="app.js"></script>
```
#### `type="module"` Attribute

**Behavior:**  
- Treated as deferred by default—scripts download in parallel and execute after the DOM is parsed.
- Supports ES Modules (`import`/`export` syntax).
- Resolves/evaluates modules through the document module map/dependency graph; top-level await and async roots require explicit readiness reasoning.

**Benefits:**  
- Non-blocking by default, improving page performance.
- Provides module boundaries; tree shaking is a build-tool analysis and dynamic import supports split/loading boundaries.
- Variables and functions are scoped to the module, avoiding global namespace pollution.

---

### 🧾 Other Useful Script Attributes
#### Other Useful Script Attributes

- **`nomodule`**  
    Loads fallback scripts in older browsers.  
    Example:  
    ```html
    <script src="legacy.js" nomodule></script>
    ```

- **`crossorigin`**  
    Controls CORS for external scripts.  
    Example:  
    ```html
    <script src="cdn.js" crossorigin="anonymous"></script>
    ```

- **`integrity`**  
    Enables Subresource Integrity (SRI) checks.  
    Example:  
    Use the exact-hash fixture below; a placeholder integrity value is not deployable.

- **`fetchpriority`**  
    Hints browser about loading priority.  
    Example:  
    ```html
    <script src="main.js" defer fetchpriority="high"></script>
    ```

- **`referrerpolicy`**  
    Controls referrer info sent with request.  
    Example:  
    ```html
    <script src="app.js" referrerpolicy="no-referrer"></script>
    ```

### 🚀 Best Practices for Senior Developers
For an external classic app script, defer is a useful default when parsed DOM/document order is needed; framework module output follows its own contract:

```html
<script src="/main.js" defer></script>
```
- Use `async` only for independent scripts (e.g., analytics, ads, tracking pixels).
- Avoid blocking rendering with large synchronous scripts in `<head>`.
- Prefer `type="module"` for modern builds—automatic deferral and cleaner imports.

## Preload only a measured discovery bottleneck:
```html
<link rel="preload" href="/main.js" as="script">
<script src="/main.js" defer></script>
```
Preload fetches a resource but does not execute it or change the consuming script's execution semantics. A script already discovered early may gain nothing, and competing requests can delay an LCP image/font. Match URL/destination/CORS/credentials with the consumer to avoid duplicate/unused work. For an ES module use modulepreload as described below; measure before retaining hints.

### ✅ Summary
- **async**: Parallel fetch; execution can still occupy the main thread and affect parsing/paint  
    *Typical use*: Analytics, ads, tracking

- **defer**: Parallel download, executes after DOM ready  
    *Typical use*: App initialization scripts

- **type="module"**: Modern ES modules, auto-deferred  
    *Typical use*: Modular frontend apps

- **nomodule**: Legacy fallback  
    *Typical use*: Older browsers

- **None (blocking)**: Forces early execution  
    *Typical use*: Rare, critical inline code

### ✅ Senior-level takeaway:
Mastering async, defer, and type="module" lets you precisely control the JavaScript loading pipeline — balancing fast rendering, early interactivity, and predictable execution order.

## Script category and completion are separate axes

| Parser-inserted category | Fetch/evaluation policy | Important edge case |
|---|---|---|
| External classic, no flags | Parser waits for fetch/execution; preload scanner may discover other resources | Existing painted content is not erased by parser blocking |
| External classic defer | Parallel fetch, document-ordered execution after parsing | Deferred execution still consumes the main thread |
| External classic async | Parallel fetch, run when ready without document-order guarantee | async wins when both async/defer are present in modern browsers |
| Inline classic | Runs where encountered | async/defer do not turn an inline classic into a deferred file |
| Module without async | Fetch graph, evaluate after parsing with dependency rules | defer is ignored; top-level await affects evaluation completion |
| Module with async | Fetch graph, evaluate when ready, potentially before parsing completes | Do not infer order from script-tag position |

Dynamically inserted classic scripts have different default async behavior from parser-inserted ones; explicit async=false before insertion can request ordered execution for those classics. A framework/module loader may own this policy; avoid adding competing script elements or document.write. Module fetching uses CORS and strict script MIME handling; a classic script's historical cross-origin behavior is not a bypass for module CORS. A module identity is scoped to the module map/realm and resolved URL, not a promise of one global execution across workers/pages/query-string variants.

DOMContentLoaded follows parsing/deferred processing but is not "all application async work complete". Async scripts, dynamic imports and code resumed after an await can run after it. A module dependency's top-level await can delay its dependents; independent roots/data tasks still need explicit completion contracts. Use an owned ready promise/state when a feature needs both DOM and data. A late-loaded initializer must check readyState instead of registering only for an event that may already have fired.

```ts
// dom-ready.ts
export function onDomReady(doc: Document, run: () => void): () => void {
  let disposed = false;
  const start = () => { if (!disposed) run(); };
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
  return () => { disposed = true; doc.removeEventListener('DOMContentLoaded', start); };
}
```

This helper owns one DOM-ready registration only. It does not wait for requests, catch every initializer exception, reverse an already-run initializer or establish responsiveness. The feature owns any returned widget/network disposer separately.

## Small browser trace lab (not a benchmark)

Save these exact files in an isolated learner fixture and serve them using the project's permitted local development mechanism. No external analytics/CDN request is needed. A CSP-enabled app must authorize the inline bootstrap with its owned nonce/hash policy; do not disable a production policy to run a study fixture.

```html
<!-- script-lab.html -->
<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Script ordering lab</title>
<script>
window.scriptTrace = [];
document.addEventListener('DOMContentLoaded', () => window.scriptTrace.push('DOMContentLoaded'), { once: true });
</script>
<script src="./classic-a.js" defer></script>
<script src="./classic-b.js" defer></script>
<script type="module" src="./entry.js"></script>
</head><body><h1>Static content</h1><p>Inspect scriptTrace and the network/CPU trace.</p></body></html>
```

```js
// classic-a.js
window.scriptTrace.push('classic-a');
```

```js
// classic-b.js
if (!window.scriptTrace.includes('classic-a')) throw new Error('Classic dependency missing');
window.scriptTrace.push('classic-b');
```

```js
// dependency.js
window.scriptTrace.push('dependency');
export const dependencyReady = true;
```

```js
// entry.js
import { dependencyReady } from './dependency.js';
if (!dependencyReady) throw new Error('Module dependency missing');
window.scriptTrace.push('module-start');
await new Promise(resolve => setTimeout(resolve, 50));
window.scriptTrace.push('module-continuation');
```

Assert only supported guarantees: deferred classic-a before classic-b, dependency before module-start, module-start before its continuation. Record where DOMContentLoaded occurs; do not equate it with module-continuation/data readiness. Then vary the classic pair to async and the module root to async in separate runs with controlled delays/cache. Observe loss of document-order assumptions without writing a test that depends on one lucky network order. The50ms timer is a bounded teaching pause, not a workload or latency target.

## Resource hints and priority trade-offs

For a measured late-discovered **module**, use the module-aware hint with its normal consumer:

```html
<link rel="modulepreload" href="./entry.js">
<script type="module" src="./entry.js"></script>
```

modulepreload uses module fetch behavior and populates the module map; browsers may also fetch dependencies, but do not assume all graph dependencies were preloaded or that the link load event means the graph executed. A classic preload as=script instead populates preload machinery and does not execute anything. A prefetch targets a possible future navigation/resource and may be ignored or waste bytes. fetchpriority is a scheduling hint, not an execution-order guarantee or extra bandwidth; marking every script high can compete with content-critical work. A stylesheet preload still needs a stylesheet consumer to apply CSS.

**Measurement acceptance:** compare hint/no-hint under identical cold/warm conditions and target devices, including a critical image/font. Retain initiator/discovery/start/transfer timing, duplicate/unused preload warnings, protocol/cache state, long tasks/LCP and an actual interaction trace. Check that a byte saving or earlier script response actually improves the user outcome rather than shifting contention. Attribute execution order to the correct script category, not priority hints.

## An actual integrity hash, not a placeholder

```js
// integrity-fixture.js
window.integrityFixtureReady = true;
```

```html
<script src="./integrity-fixture.js" defer integrity="sha256-jiX3Ifk/fpggswAnfwfHp7jkjm2FiXakiSKrHqRf/1s=" crossorigin="anonymous"></script>
```

The SHA256 value covers the exact UTF-8 fixture bytes above, including the comment and final LF. Editing/minifying/line-ending changes require recomputing it from the deployed artifact. SRI verifies bytes, not that a script's behavior is safe; CSP, trusted dependencies and authorization are separate controls. Cross-origin SRI also needs an eligible CORS response; crossorigin=anonymous does not create server permission. Pin/update the expected artifact through the reviewed release mechanism rather than copy a digest for a different URL.

**Overall acceptance:** strict-typecheck dom-ready and test loading/already-ready/disposed ownership. Parse the HTML/files and verify declared paths/hash, then run the actual browser lab for parser/script/DCL/module/priority/SRI behavior, including a deliberately modified fixture rejected by the browser. Static hashing/Node module execution and simulated DOM tests are not browser network/order/performance proof. Browser checks and learner practice remain required; no real browser validation is claimed here.

Standards checked2026-10-22: [HTML script categories](https://html.spec.whatwg.org/multipage/scripting.html#the-script-element), [modulepreload](https://html.spec.whatwg.org/multipage/links.html#link-type-modulepreload), [DOMContentLoaded/late async continuation](https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event), [Subresource Integrity core](https://www.w3.org/TR/2016/REC-SRI-20160623/). Node24.18.0/TypeScript5.9.3 validate only the stated source/fixture boundaries; record real browser versions for loading conclusions.
