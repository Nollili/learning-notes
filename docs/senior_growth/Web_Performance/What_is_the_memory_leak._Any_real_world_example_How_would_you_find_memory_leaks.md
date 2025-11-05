### What is the memory leak. Any real world example? How would you find memory leaks?

What Is a Memory Leak?

A **memory leak** occurs when an application **keeps references to memory that is no longer needed**, preventing the garbage collector (GC) from reclaiming it.  
Over time, this leads to **increasing memory usage**, degraded performance, and eventually browser or tab crashes.

In frontend development, memory leaks usually happen in **JavaScript**, **event listeners**, or **DOM references** that persist unintentionally.

---

## ⚙️ How Garbage Collection Works

JavaScript uses **automatic garbage collection** — it frees memory occupied by objects that are no longer *reachable* from the root (like `window`).

However:
> 🧩 If you keep a reference to an object (directly or indirectly), it’s considered *reachable* and **won’t be collected**, even if you no longer use it.

Example:
```js
let cache = {};
function storeData(key, value) {
  cache[key] = value;
}
storeData("user", { name: "Lili" });
// Even if we don’t need "user" anymore, it remains in memory until we delete it
🧨 Real-World Examples of Memory Leaks
1. Forgotten Event Listeners
If you attach an event listener to an element that gets removed from the DOM but don’t remove the listener, the element stays in memory.
```js
function addHandler() {
  const button = document.createElement("button");
  button.addEventListener("click", () => console.log("Clicked!"));
  document.body.appendChild(button);
  // Later...
  document.body.removeChild(button); // ❌ Leak: listener still references button
}
```
✅ Fix:

```js
button.removeEventListener("click", handleClick);
```
2. Closures Holding References
Closures can accidentally capture and hold large objects in memory.

```js
function setup() {
  const bigData = new Array(1000000).fill("x");
  return function logSomething() {
    console.log(bigData[0]); // bigData is now permanently referenced
  };
}
const leaky = setup();
```
✅ Fix: Avoid unnecessary outer references or isolate scopes.

3. Detached DOM Nodes
If a DOM node is removed but still referenced in JS, it remains in memory.

```js
let cachedElement;
function createElement() {
  const el = document.createElement("div");
  document.body.appendChild(el);
  cachedElement = el; // keeps reference
  document.body.removeChild(el); // ❌ Leak
}
```
✅ Fix: Set references to null when elements are removed.

4. Timers and Intervals
Intervals or timeouts that keep references alive.

```js
setInterval(() => {
  console.log("Leaky interval");
}, 1000); // ❌ Keeps function + scope alive forever
```
✅ Fix:

```js
const id = setInterval(...);
clearInterval(id);
```
5. Global Variables
Accidentally leaking variables into the global scope.

```js
function leak() {
  leaked = "I’m global now"; // ❌ no 'let' or 'const'
}
```
✅ Fix: Always use let, const, or var to scope variables properly.

🧰 How to Detect Memory Leaks
🧪 1. Chrome DevTools → Performance & Memory Panels
a. Performance Recording
Open Performance tab

Record a session while interacting with the page

Watch for steadily increasing memory usage that never drops → leak suspicion.

b. Memory Tab
Take Heap Snapshots before and after actions.

Compare snapshots to identify retained objects.

Look for Detached DOM trees or unexpected retained closures.

c. Allocation Timeline
Shows memory allocations over time.

Repeated allocations without GC recovery → leak.

🧩 2. Chrome Task Manager
Open Chrome Task Manager (Shift + Esc) and watch Memory Footprint.
If your tab’s memory keeps growing while idle, you have a leak.

🧠 3. Performance APIs or Tools
Performance.memory (experimental)

WebPageTest / Lighthouse → detects potential unbounded resource usage.

React Developer Tools Profiler → check component unmounting and retained state.

⚡ In React Applications
Common leak sources:

Not cleaning up side effects in useEffect().

Keeping stale references in closures.

Not aborting fetch calls when unmounted.

Example:
```js
useEffect(() => {
  const controller = new AbortController();
  fetch("/api/data", { signal: controller.signal })
    .then(res => res.json())
    .then(setData);

  return () => controller.abort(); // ✅ cleanup on unmount
}, []);
```

✅ Prevention Checklist
Practice	Why
Always clean up event listeners	Avoid dangling references
Clear timers and intervals on unmount	Prevent orphaned callbacks
Use AbortController for fetch calls	Stop async operations
Nullify references when no longer needed	Help GC
Use React’s cleanup functions (useEffect)	Manage lifecycle properly
Monitor heap size during development	Early detection

🧩 Summary
Concept	Description	Impact
Memory Leak	Unreleased memory due to lingering references	Gradual slowdown, possible crash
Typical Causes	Event listeners, closures, global vars, timers, DOM refs	Persistent memory growth
Detection Tools	Chrome DevTools (Memory, Performance), React Profiler	Identify retained objects
Prevention	Cleanups, scoping, lifecycle awareness	Keeps performance stable

🔑 Key Takeaway
💡 A memory leak is like leaving the tap running — it’s not a problem immediately,
but over time it floods your app.
Detect early, clean up listeners and timers, and validate via DevTools snapshots.