# What are the usual sources of problems with memory?

## Common Sources of Memory Problems in Front-End Applications

Memory problems in web applications often occur when **unused objects remain referenced**, preventing the **JavaScript garbage collector (GC)** from reclaiming memory.  
This can result in **memory leaks**, **increased heap size**, and **slower performance** — especially in long-running single-page applications (SPAs).

---

## 🧠 Quick Refresher: How Garbage Collection Works

- JavaScript uses **automatic garbage collection** with a **mark-and-sweep** algorithm.
- The GC only removes objects that are **no longer reachable** from the root scope (like `window` or `document`).

💡 **If something is still referenced**, even indirectly, it will **not be collected**.

---

## ⚠️ Common Sources of Memory Problems

### 1. Forgotten Event Listeners

Event handlers attached to DOM elements that are later removed can stay in memory if not properly detached.

```js
function init() {
  const el = document.getElementById('btn');
  el.addEventListener('click', () => doSomething());
  // If el is removed later → listener still references it
}
```

**✅ Solution:**  
Remove listeners when components unmount or elements are deleted:

```js
el.removeEventListener('click', handleClick);
```

In React, use cleanup in `useEffect()`:

```js
useEffect(() => {
  window.addEventListener('resize', onResize);
  return () => window.removeEventListener('resize', onResize);
}, []);
```

---

### 2. Unintended Global Variables

Omitting `let`, `const`, or `var` creates a property on the global object (`window`), which persists until the page reloads.

```js
function doSomething() {
  leakedVar = "oops"; // becomes window.leakedVar
}
```

**✅ Solution:**  
Always use strict mode (`'use strict'`) and declare variables explicitly.

---

### 3. Closures Holding References

Inner functions capture outer variables — if those variables reference large data, they stay in memory.

```js
function setup() {
  const bigArray = new Array(1000000).fill('data');
  return () => console.log(bigArray[0]); // closure keeps `bigArray` alive
}
const leak = setup();
```

**✅ Solution:**  
Avoid keeping large data in closures unless necessary.  
Nullify or reassign references when no longer needed.

---

### 4. Detached DOM Nodes

When DOM nodes are removed from the document but still referenced by JS variables or listeners.

```js
let node = document.getElementById('item');
document.body.removeChild(node); // removed from DOM
// Still in memory because `node` references it
```

**✅ Solution:**  
Set `node = null` after removal if it’s no longer needed.

---

### 5. Timers and Intervals

`setInterval()` and `setTimeout()` keep references to their callbacks, which may capture state or DOM references.

```js
setInterval(() => {
  console.log(document.querySelector('#data').innerText);
}, 1000);
```

**✅ Solution:**  
Always clear timers:

```js
const id = setInterval(doWork, 1000);
clearInterval(id);
```

Clean up intervals when components unmount (React `useEffect` cleanup).

---

### 6. Caching Gone Wrong

Storing large data in memory caches (like Redux, Context, or custom JS objects) without eviction logic.

```js
const cache = {};
function addToCache(key, value) {
  cache[key] = value; // grows indefinitely
}
```

**✅ Solution:**  
Use weak maps/sets for automatic GC on key objects:

```js
const cache = new WeakMap();
```

Implement cache limits or LRU (Least Recently Used) eviction.

---

### 7. Third-Party Libraries or Listeners

Some libraries (especially older DOM manipulation ones) attach global listeners or store references internally.

**✅ Solution:**  
Check library docs for cleanup methods (e.g., `destroy()`, `dispose()`).  
Wrap them inside lifecycle hooks for proper teardown.

---

### 8. Over-retained React State

State or refs holding large data (arrays, objects) that persist across re-renders or pages.

**✅ Solution:**  
Reset component state when unmounted or when route changes.  
Don’t store heavy data directly in React state — use external store or cache that can be cleared.

---

### 9. Large In-Memory Data Structures

Example: keeping all fetched API results in arrays/lists without pruning.  
Especially common in data-heavy apps (dashboards, grids).

**✅ Solution:**  
Paginate data.  
Keep only visible/active portions in memory (e.g., virtualization with `react-window`).

---

## 🧰 How to Detect and Diagnose Memory Leaks

1. **Chrome DevTools → Performance & Memory Tabs**  
   - Use Performance → record, look for steady heap growth.  
   - Use Memory → “Heap snapshot” or “Allocation instrumentation on timeline.”

2. **Identify Detached DOM Elements**  
   - In Memory tab, filter by “Detached HTML elements” to see uncollected nodes.

3. **Performance Profilers**  
   - Tools: Chrome DevTools, Lighthouse Performance, Sentry Performance, React Profiler

---

## ✅ Summary Table

| Problem Source         | Why It Leaks                | How to Fix                        |
|-----------------------|-----------------------------|-----------------------------------|
| Event listeners       | Object references persist   | Remove listeners on cleanup       |
| Global variables      | Persistent global scope     | Use let/const + strict mode       |
| Closures              | Capture large references    | Nullify or avoid large captures   |
| Detached DOM nodes    | Referenced after removal    | Remove references manually        |
| Timers/Intervals      | Keep references alive       | Clear on unmount                  |
| Caches                | Unbounded memory growth     | WeakMaps / eviction logic         |
| 3rd-party libs        | Internal references         | Call .destroy() / .dispose()      |
| React state           | Persisting large objects    | Reset on unmount                  |
| Large data            | No pruning/pagination       | Paginate or virtualize data       |

---

**🧠 Rule of thumb:**  
Memory leaks happen when you keep unintentional references to things that should’ve been forgotten.  
Always clean up listeners, timers, closures, and caches when the component or feature is no longer in use.