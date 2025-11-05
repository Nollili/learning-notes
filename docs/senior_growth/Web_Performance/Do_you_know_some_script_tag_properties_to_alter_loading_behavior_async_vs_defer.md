### Do you know some script tag properties to alter loading behavior? async vs defer

### Script Tag Loading Behavior — `async` vs `defer` (and others)

The way the browser loads and executes JavaScript greatly affects **page performance** and **interactivity**.  
Understanding `<script>` tag attributes like `async` and `defer` is essential for optimizing the **Critical Rendering Path** and improving **TTFI (Time To First Interaction)**.

---

## 🧩 Default Script Loading Behavior

### `<script src="main.js"></script>`
- **Blocking behavior** by default.
- Browser **stops parsing HTML**, downloads the script, executes it, then resumes.
- This **blocks rendering** — delaying FCP and interactivity.

🧠 *Use only for critical inline scripts that must run before the DOM loads.*

---

## ⚡ `async` Attribute

```html
<script src="script.js" async></script>
🔹 Behavior:
Script is downloaded in parallel with HTML parsing.

Once the script finishes downloading, it pauses HTML parsing, executes immediately, then resumes parsing.

Step	Description
1	HTML parsing starts
2	Script starts downloading (non-blocking)
3	When ready → parsing halts → script executes
4	Parsing resumes after execution

✅ Use for:
Independent scripts that don’t rely on DOM or other scripts (e.g., analytics, ads, tracking pixels).

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
Script is downloaded in parallel with HTML parsing.

Execution is deferred until after HTML is fully parsed (just before DOMContentLoaded).

Step	Description
1	HTML parsing starts
2	Script starts downloading (non-blocking)
3	Script executes after parsing completes
4	DOM is ready and interactivity can begin

✅ Use for:
Main application scripts that depend on the DOM being ready.

Scripts that rely on others (executed in order they appear).

⚡ Bonus:
Execution order is preserved even with multiple deferred scripts.

Example:
```html
<script src="/vendor.js" defer></script>
<script src="/main.js" defer></script>
```
→ vendor.js executes before main.js, after DOM is parsed.

⚖️ Comparison Table
Attribute	Load During HTML Parse	Executes When	Execution Order	Blocks HTML Parsing?	Best For
(none)	❌	Immediately (on fetch)	In order	✅ Yes	Critical inline or early scripts
async	✅ (parallel)	As soon as ready	❌ Unordered	⚠️ Yes (pauses parse to execute)	Independent 3rd-party scripts
defer	✅ (parallel)	After DOM parsed	✅ Ordered	❌ No	Main JS files depending on DOM
type="module"	✅ (parallel)	Deferred by default	✅ Ordered imports	❌ No	ES Modules-based apps

🧠 Extra: type="module"
```html
<script type="module" src="app.js"></script>
```
Behavior:
Treated as deferred by default.

Supports ES Modules (import/export) syntax.

Each module is loaded only once and in dependency order.

Benefits:
Automatically non-blocking.

Supports tree shaking and code splitting in bundlers.

Scoped variables (no global namespace pollution).

🧾 Other Useful Script Attributes
Attribute	Description	Example
nomodule	Used to load fallback scripts in older browsers	<script src="legacy.js" nomodule></script>
crossorigin	Controls CORS for external scripts	<script src="cdn.js" crossorigin="anonymous"></script>
integrity	Enables Subresource Integrity (SRI) checks	<script src="cdn.js" integrity="sha256-abc..." crossorigin="anonymous"></script>
fetchpriority	Gives hints to the browser for loading order	<script src="main.js" defer fetchpriority="high">
referrerpolicy	Controls referrer info sent with script request	<script src="app.js" referrerpolicy="no-referrer">

🚀 Best Practices for Senior Developers
Always use defer for your main app scripts in modern SPAs:

```html
<script src="/main.js" defer></script>
```
Use async only for independent scripts (analytics, ads).

Never block rendering with large synchronous scripts in <head>.

Leverage type="module" for modern builds (automatic deferral, cleaner imports).

Combine with preload for better prioritization:

```html
<link rel="preload" href="/main.js" as="script">
<script src="/main.js" defer></script>
```
✅ Summary
Attribute	Key Benefit	Typical Use Case
async	Fast, non-blocking load — executes ASAP	Analytics, ads, tracking
defer	Parallel download, executes after DOM ready	App initialization scripts
type="module"	Modern ES modules, auto-deferred	Modular frontend apps
nomodule	Legacy fallback	Older browsers
None (blocking)	Forces early execution	Rare, critical inline code

✅ Senior-level takeaway:

Mastering async, defer, and type="module" lets you precisely control the JavaScript loading pipeline — balancing fast rendering, early interactivity, and predictable execution order.