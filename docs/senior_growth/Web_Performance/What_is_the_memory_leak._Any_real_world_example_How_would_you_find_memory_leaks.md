## What is a Memory Leak? Real-World Examples & Detection

## What is a Memory Leak?

A **memory leak** occurs when a program fails to release memory that is no longer needed, causing its memory usage to grow over time. In JavaScript applications, this typically happens when objects are unintentionally kept alive by lingering references, preventing the garbage collector from reclaiming that memory.

Common causes in frontend development include forgotten **event listeners**, **DOM references**, and **closures** that retain large objects.

---

## How Garbage Collection Works

JavaScript relies on automatic garbage collection: memory is reclaimed when objects become unreachable.  
If you keep a reference to an object, it stays in memory.

**Example:**
```js
let cache = {};
function storeData(key, value) {
  cache[key] = value;
}
storeData("user", { name: "Lili" });
// "user" remains in memory until removed from cache
```

---

## Real-World Memory Leak Examples

1. **Forgotten Event Listeners**
   - Adding an event listener to an element and removing the element from the DOM without removing the listener keeps the element in memory.
   ```js
   function addHandler() {
     const button = document.createElement("button");
     button.addEventListener("click", () => console.log("Clicked!"));
     document.body.appendChild(button);
     document.body.removeChild(button); // ❌ Leak: listener keeps reference
   }
   // ✅ Fix: button.removeEventListener("click", handler);
   ```

2. **Closures Holding References**
   - Closures can capture large objects and prevent them from being garbage collected.
   ```js
   function setup() {
     const bigData = new Array(1000000).fill("x");
     return function logSomething() {
       console.log(bigData[0]);
     };
   }
   const leaky = setup();
   // bigData is never released
   ```

3. **Detached DOM Nodes**
   - Removing a DOM node but keeping a JS reference prevents garbage collection.
   ```js
   let cachedElement;
   function createElement() {
     const el = document.createElement("div");
     document.body.appendChild(el);
     cachedElement = el;
     document.body.removeChild(el); // ❌ Leak
   }
   // ✅ Fix: cachedElement = null;
   ```

4. **Timers and Intervals**
   - Unstopped intervals keep references alive.
   ```js
   const id = setInterval(() => {
     console.log("Leaky interval");
   }, 1000);
   // ✅ Fix: clearInterval(id);
   ```

5. **Global Variables**
   - Accidentally leaking variables into global scope.
   ```js
   function leak() {
     leaked = "I’m global now"; // ❌ no 'let' or 'const'
   }
   // ✅ Fix: use let/const/var
   ```

---

## How to Find Memory Leaks

- **Chrome DevTools**
  - *Performance Tab*: Record and watch for memory usage that never drops.
  - *Memory Tab*: Take heap snapshots before/after actions, compare retained objects.
  - *Allocation Timeline*: Shows allocations over time; persistent growth signals leaks.

- **Chrome Task Manager**
  - (Shift + Esc) → Watch Memory Footprint for tabs.

- **Performance APIs & Tools**
  - `performance.memory` (experimental)
  - WebPageTest, Lighthouse, React DevTools Profiler

---

## React-Specific Leaks

- Not cleaning up effects in `useEffect`
- Stale references in closures
- Not aborting fetch calls on unmount

**Example:**
```js
useEffect(() => {
  const controller = new AbortController();
  fetch("/api/data", { signal: controller.signal })
    .then(res => res.json())
    .then(setData);

  return () => controller.abort(); // ✅ cleanup
}, []);
```

---

## Prevention Checklist

| Practice                                 | Why                                 |
|-------------------------------------------|-------------------------------------|
| Clean up event listeners                  | Avoid dangling references           |
| Clear timers/intervals on unmount         | Prevent orphaned callbacks          |
| Use AbortController for fetch calls       | Stop async operations               |
| Nullify references when not needed        | Help GC                             |
| Use React cleanup functions (`useEffect`) | Manage lifecycle properly           |
| Monitor heap size during development      | Early detection                     |

---

## Summary

| Concept      | Description                                   | Impact                        |
|--------------|-----------------------------------------------|-------------------------------|
| Memory Leak  | Unreleased memory due to lingering references | Gradual slowdown, possible crash |
| Causes       | Event listeners, closures, global vars, timers, DOM refs | Persistent memory growth      |
| Detection    | Chrome DevTools, React Profiler               | Identify retained objects     |
| Prevention   | Cleanups, scoping, lifecycle awareness        | Keeps performance stable      |

**Key Takeaway:**  
A memory leak is like leaving the tap running—over time, it floods your app.  
Detect early, clean up listeners/timers, and validate with DevTools.

