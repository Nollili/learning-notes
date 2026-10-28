# What are the usual sources of problems with memory?

## Common Sources of Memory Problems in Front-End Applications

Memory problems in web applications often occur when **unused objects remain referenced**, preventing the **JavaScript garbage collector (GC)** from reclaiming memory.  
This can result in **memory leaks**, **increased heap size**, and **slower performance** — especially in long-running single-page applications (SPAs).

---

## 🧠 Quick Refresher: How Garbage Collection Works

- JavaScript engines use automatic, reachability-based garbage collection with implementation-specific generational/incremental/concurrent strategies; one simple mark-and-sweep model is a teaching approximation.
- The GC only removes objects that are **no longer reachable** from the root scope (like `window` or `document`).

A strong retaining path from a live root matters. An isolated unreachable cycle can be collected; a reference from another unreachable object does not make the cycle live. Weak collections have different retention semantics.

---

## ⚠️ Common Sources of Memory Problems

### 1. Forgotten Event Listeners

An element/listener cycle alone is not necessarily a leak after removal. A live window/document listener, timer, store or other root can retain a closure and its detached node. Diagnose that root path.

```js
function init() {
  const el = document.getElementById('btn');
  el.addEventListener('click', () => doSomething());
  // Removal alone does not establish a leak; inspect remaining root paths.
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

Assigning an undeclared name in sloppy classic-script code can create a global property. Strict mode and modules throw instead; explicitly retained globals still require ownership.

```js
function doSomething() {
  leakedVar = "oops"; // becomes window.leakedVar
}
```

**✅ Solution:**  
Always use strict mode (`'use strict'`) and declare variables explicitly.

---

### 3. Closures Holding References

A live closure can retain a captured value that its observable behavior needs; engines may optimize unused captures. Inspect the actual retaining path rather than assume the entire lexical environment is always retained.

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
Use a WeakMap when the semantic key is an object and entries should not keep that key alive; it is not a bounded string/query-key cache:

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
Place data with the owner whose lifetime needs it; component state becomes collectible after unmount if no other roots retain it. Moving data into a global store can prolong retention. Clear/evict long-lived caches and references deliberately; an unmount state update is not a cleanup requirement.

---

### 9. Large In-Memory Data Structures

Example: keeping all fetched API results in arrays/lists without pruning.  
Especially common in data-heavy apps (dashboards, grids).

**✅ Solution:**  
Paginate data.  
Virtualization reduces mounted DOM, not necessarily retained data. Bound fetched pages separately using pagination/eviction; choose policy for scroll restoration and refetch cost.

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
| Caches                | Unbounded retained entries/bytes | Bounded policy; WeakMap only for suitable object identity keys |
| 3rd-party libs        | Internal references         | Call .destroy() / .dispose()      |
| React/store ownership | Data retained beyond needed lifetime | Bound owner/cache lifetime |
| Large data | Unbounded retained pages | Paginate/evict data; virtualize DOM separately |

---

**🧠 Rule of thumb:**  
Memory leaks happen when you keep unintentional references to things that should’ve been forgotten.  
Always clean up listeners, timers, closures, and caches when the component or feature is no longer in use.
## Bounded cache: identity, eviction and limitations

```js
function createLru(maxEntries) {
  if (!Number.isSafeInteger(maxEntries) || maxEntries < 1) throw new RangeError('Positive capacity required');
  const entries = new Map();
  return {
    get(key) {
      if (!entries.has(key)) return { hit: false };
      const value = entries.get(key);
      entries.delete(key); entries.set(key, value);
      return { hit: true, value }; // Cached undefined differs from a miss.
    },
    set(key, value) {
      entries.delete(key); entries.set(key, value);
      if (entries.size > maxEntries) entries.delete(entries.keys().next().value);
    },
    clear() { entries.clear(); },
    get size() { return entries.size; }
  };
}
```

This bounds entry count, not bytes; a single value can still be huge. Decide maximum response bytes/items, TTL/freshness, user-scoped keys, in-flight cancellation and resource disposal separately. Map access order is explicit here; a read refreshes recency. WeakMap is not enumerable and supplies neither a deterministic size nor an LRU policy. Evicting a JS reference also does not automatically close a WebSocket, timer, worker or object URL; resource owners need teardown.


Official references checked2026-10-20: [Chrome memory diagnosis](https://developer.chrome.com/docs/devtools/memory-problems), [ECMAScript weak collections](https://tc39.es/ecma262/#sec-weakmap-objects), [React Effect cleanup](https://react.dev/reference/react/useEffect).


## Retaining-path investigation acceptance

Warm the exact page/workflow first, record a baseline, then repeat the same open/use/close cycle and compare equivalent settled states. Inspect retained objects and a path to a live root (window listener, timer, registry/store or developer-tool handle). A temporary allocation spike, sawtooth collection pattern or high one-time cache plateau is not by itself a leak. Distinguish retained bloat, repeated allocation/GC churn and a growing unintended owner.

Avoid accidentally retaining the subject in console variables, logged objects or a selected DevTools node. Use a comparison/dominator/retainer view appropriate to the browser version, identify the owner and remove its strong reference or dispose its resource. Repeat the same cycles and verify useful behavior remains. Do not assert that GC runs by a particular deadline or that a missing finalizer proves a leak. Heap snapshots can contain sensitive application data; keep a minimal synthetic reproduction and the artifact policy appropriate to the project.


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/performance/What_are_the_usual_source_of_problems_with_memory.md). All learner practice remains outstanding.
