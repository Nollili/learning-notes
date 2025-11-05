### Do you know some script tag properties to alter loading behavior? async vs defer

### Script Tag Loading Behavior — `async` vs `defer` (and others)

How the browser loads and executes JavaScript impacts **page performance** and **interactivity**.  
Knowing `<script>` tag attributes like `async` and `defer` helps optimize the **Critical Rendering Path** and improve **TTFI (Time To First Interaction)**.

---

## 🧩 Default Script Loading Behavior

### `<script src="main.js"></script>`
- **Blocking by default.**
- Browser **pauses HTML parsing**, downloads and executes the script, then continues.
- This **blocks rendering** — delaying FCP and interactivity.

🧠 *Use only for scripts that must run before the DOM loads.*

---

## ⚡ `async` Attribute

```html
<script src="script.js" async></script>
```
🔹 Behavior:
Script downloads while HTML is parsed.

When the script finishes downloading, HTML parsing pauses, script executes, then parsing resumes.

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
4	DOM is ready and interactivity can begin

✅ Use for:
Main scripts that depend on the DOM being ready.

Scripts that rely on others (executed in order they appear).

⚡ Bonus:
Execution order is preserved even with multiple deferred scripts.

Example:
```html
<script src="/vendor.js" defer></script>
<script src="/main.js" defer></script>
```
→ vendor.js executes before main.js, after DOM is parsed.

| Attribute        | Load During HTML Parse | Executes When           | Execution Order    | Blocks HTML Parsing? | Best For                          |
|------------------|-----------------------|-------------------------|--------------------|----------------------|------------------------------------|
| (none)           | ❌                    | Immediately (on fetch)  | In order           | ✅ Yes               | Critical inline or early scripts   |
| async            | ✅ (parallel)          | As soon as ready        | ❌ Unordered        | ⚠️ Yes (pauses parse) | Independent 3rd-party scripts      |
| defer            | ✅ (parallel)          | After DOM parsed        | ✅ Ordered          | ❌ No                | Main JS files depending on DOM     |
| type="module"    | ✅ (parallel)          | Deferred by default     | ✅ Ordered imports  | ❌ No                | ES Modules-based apps              |

🧠 Extra: type="module"
```html
<script type="module" src="app.js"></script>
```
#### `type="module"` Attribute

**Behavior:**  
- Treated as deferred by default—scripts download in parallel and execute after the DOM is parsed.
- Supports ES Modules (`import`/`export` syntax).
- Loads each module only once, respecting dependency order.

**Benefits:**  
- Non-blocking by default, improving page performance.
- Enables tree shaking and code splitting with modern bundlers.
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
    ```html
    <script src="cdn.js" integrity="sha256-abc..." crossorigin="anonymous"></script>
    ```

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
Always use defer for your main app scripts in modern SPAs:

```html
<script src="/main.js" defer></script>
```
- Use `async` only for independent scripts (e.g., analytics, ads, tracking pixels).
- Avoid blocking rendering with large synchronous scripts in `<head>`.
- Prefer `type="module"` for modern builds—automatic deferral and cleaner imports.

## Combine with preload for better prioritization:
```html
<link rel="preload" href="/main.js" as="script">
<script src="/main.js" defer></script>
```
Preloading scripts with `<link rel="preload" as="script">` is safe and recommended for performance. It tells the browser to fetch important JavaScript early, without executing it until the DOM is parsed (when using `defer`). This approach avoids blocking rendering and ensures scripts are available as soon as needed, improving load times and interactivity.  
Combine this with `defer` to ensure scripts are downloaded quickly and executed after the DOM is parsed, improving both load performance and interactivity.

### ✅ Summary
- **async**: Fast, non-blocking load — executes ASAP  
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