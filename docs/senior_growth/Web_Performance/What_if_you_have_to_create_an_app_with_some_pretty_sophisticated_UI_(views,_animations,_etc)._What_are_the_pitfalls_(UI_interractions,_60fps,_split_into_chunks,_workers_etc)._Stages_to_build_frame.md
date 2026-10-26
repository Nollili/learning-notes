# What if you have to create an app with some pretty sophisticated UI (views, animations, etc). What are the pitfalls? (UI interractions, 60fps, split into chunks, workers etc). Stages to build frame?

## Building Sophisticated UI Apps — Performance Pitfalls and Best Practices

When building apps with advanced UI (views, animations, etc.), performance is a key concern.  
The goal is responsive interaction and stable presentation on supported devices. A 60Hz display offers about 16.7ms between refreshes; 120Hz offers about 8.3ms. These are whole-frame intervals, not exclusive JavaScript allowances.

---

## 🎯 Target Performance Budget

- **1 frame = 16.6ms**  
  - 60 FPS = 1000ms / 60 = ~16.6ms per frame  
- Rendering work shares the interval with other browser work. Parsing is load-dependent; unchanged frames may skip layout or paint. Refresh rate and scheduling vary.

---

## 🧩 The Rendering Pipeline (Frame Lifecycle)

When the browser renders a frame, it goes through these **stages**:

1. **JavaScript** – Run event handlers, animation logic, rendering, etc.  
2. **Style Calculation** – Compute CSS styles for elements.  
3. **Layout (Reflow)** – Figure out element sizes and positions.  
4. **Paint** – Fill pixels (colors, images, borders, text).  
5. **Composite** – Combine painted layers into the final frame.

Missing a presentation deadline can produce a repeated frame. Several individually short steps may together exceed the available time; a long task can also delay input independently of animation.

---

## ⚠️ Common Performance Pitfalls in Sophisticated UIs

### 1. Heavy JavaScript on the Main Thread

- Large bundle or complex UI logic blocks input responsiveness.
- JS competes with rendering tasks (same thread).

**Mitigations:**
- Use **Web Workers** for CPU-heavy tasks (e.g., data parsing, sorting).
- Keep main thread free for UI rendering.
- Use **OffscreenCanvas** for complex drawing.

---

### 2. Layout Thrashing (Frequent Reflows)

- Happens when JS reads and writes layout properties repeatedly:

  ```js
  const width = el.offsetWidth; // May flush layout if earlier work dirtied it.
  el.style.width = width + 10 + 'px'; // Invalidates layout; does not itself read it.
  ```

A read requires synchronous layout only when relevant geometry is stale. Repeated write/read pairs can repeatedly flush it. rAF alone does not prevent this ordering mistake.

**Mitigations:**
- Batch DOM reads before writes; coalesce visual writes in `requestAnimationFrame`.
- Avoid querying layout properties (`offsetWidth`, `scrollTop`) in loops.
- Minimize deep DOM manipulations.

---

### 3. Overdraw and Expensive Paints

- Too many overlapping layers or semi-transparent elements trigger costly painting.

**Mitigations:**
- Simplify layers; transform/opacity are often compositor-eligible, without guaranteeing GPU acceleration or avoiding all paint.
- Use CSS transforms (`translate3d`, `scale3d`) instead of `top`/`left` for movement.

---

### 4. Non-GPU-Friendly Animations

- Animating layout-affecting properties (`width`, `top`, `height`, `margin`) triggers reflow and repaint.

**Best practice:**  
Prefer `transform` and `opacity` when they express the intended effect; measure layout, paint and layer costs.

Only after profiling identifies a benefit, temporarily apply the `will-change` hint to a bounded set of imminent animations and remove it after completion/cancellation:

```css
.element {
  will-change: transform; /* Temporary owned class; remove after the effect. */
}
```

---

### 5. Monolithic Rendering Logic

- Large React components re-render on every state change.

**Mitigations:**
- Split components by ownership; profile before adding `React.memo`/`useCallback`. Stable callbacks help only where their identity matters.
- Use windowing libraries (e.g., `react-window`, `react-virtualized`) for large lists.
- Defer non-critical rendering (lazy load sections).

---

### 6. Heavy Data Processing in UI Thread

- Parsing JSON, filtering, sorting, or aggregating large data sets in main thread.

**Mitigations:**
- Move suitable CPU work to a browser Web Worker. WebAssembly on the main thread still blocks; worker messaging/copying has costs and workers cannot directly manipulate the DOM.
- Stream data incrementally rather than loading all at once.

---

### 7. Too Many Event Listeners / Frequent Repaints

- Scroll, mousemove, resize handlers firing excessively.

**Mitigations:**
- Use debounce/throttle for high-frequency events.
- Coalesce visual writes via `requestAnimationFrame`; callbacks still execute main-thread work.

---

## 🧱 Optimized Build Architecture (for Heavy UI Apps)

| Layer            | Purpose                              | Optimization                                 |
|------------------|--------------------------------------|----------------------------------------------|
| UI Components    | React/Vue components for display     | Split into microcomponents, memoize, windowing |
| Animation Layer  | React Spring, Framer Motion, or CSS transforms | Measured compositor eligibility, owned cancellation |
| Data/Logic Layer | Browser Web Workers (Node worker_threads is a server API)        | Offload heavy tasks                          |
| Rendering Engine | Canvas/WebGL for complex visuals     | Use OffscreenCanvas, limit redraw regions    |
| Bundling         | Code splitting via Vite or Webpack   | Load UI chunks on demand                     |

---

## 🧪 Profiling and Testing

- Chrome DevTools → Performance tab  
  Identify long tasks, FPS drops, and “Layout” spikes.
- Rendering panel → Show paint flashing, layer borders.
- React Profiler → Identify excessive re-renders.
- Memory tab → Detect leaks over time.

---

## 🚀 Strategies to Keep 60 FPS

- Set a measured JavaScript budget for supported refresh rates and devices
- Prefer effects with low measured rendering cost
- Avoid layout recalculations mid-frame
- Split optional main-thread work into bounded units; `requestIdleCallback` schedules a callback but cannot preempt one expensive synchronous operation. Check `timeRemaining()`, cap units per callback and handle timeout/support/cancellation. Use a worker for indivisible heavy CPU work.
- Virtualize large DOM collections
- Use `IntersectionObserver` for lazy-rendering

---

## ✅ Summary

| Area                | Problem                       | Solution                        |
|---------------------|------------------------------|----------------------------------|
| Main thread blocking| Too much JS or data processing| Offload to Web Workers           |
| Rendering           | Frequent layout/paint cycles  | Prefer suitable transform/opacity; verify trace |
| React re-renders    | Large tree updates            | Memoization, windowing           |
| Initial load        | Large bundle                  | Code splitting, lazy loading     |
| Animation smoothness| Non-GPU props, jank           | Measured effects, device-specific frame budget    |

---

**🧠 Rule of thumb:**  
The refresh interval is shared, variable and smaller on high-refresh displays. Measure the actual bottleneck before choosing memoization, chunking, virtualization or a worker.

## Worked decision: process a large catalogue without blocking interaction

First profile parsing, filtering and rendering separately. Virtualization limits mounted DOM; it does not make an upfront sort cheap. Chunking keeps work on the main thread but yields between small units. A worker isolates suitable CPU work at the cost of serialization, startup and lifecycle complexity. Preserve selection/focus and accessible list semantics when windowing; measure memory and navigation as well as FPS.

This injectable timer scheduler processes at most 100 small units per turn. It is deliberately not a worker or a hard deadline. A single `visit` must already be cheap; neither timers nor idle callbacks can interrupt it. Repeated microtask/Promise yielding can starve rendering, so use task boundaries for this example.

```js
function processChunks(items, visit, schedule = setTimeout, unschedule = clearTimeout) {
  let index = 0;
  let handle;
  let stopped = false;
  function step() {
    handle = undefined;
    if (stopped) return;
    const end = Math.min(index + 100, items.length);
    while (!stopped && index < end) visit(items[index], index++);
    if (!stopped && index < items.length) handle = schedule(step, 0);
  }
  handle = schedule(step, 0);
  return () => {
    stopped = true;
    if (handle !== undefined) unschedule(handle);
    handle = undefined;
  };
}
```

The owner must cancel on replacement/navigation. Do not mutate the input during processing. Callback errors propagate to the scheduler; production UI should own an explicit error/result channel. Timer clamping and background throttling mean no latency guarantee. For user-visible async search, also guard result identity: immutability and cancellation alone do not prove freshness.

**Exercise:** process a 10,000-item fixture with a deliberately bounded visitor, then compare a worker implementation and a windowed result view. Acceptance: timer fixture proves ordered exactly-once visits, at most100 visits per scheduled turn, no visits after cancellation and harmless repeated disposal; worker results carry request identity and stale replies are ignored. In a real browser retain input responsiveness traces, layout/paint events and memory under repeated mount/dispose, with device/refresh/CPU settings. Demonstrate a dirty write/read loop versus reads-before-writes. Check reduced motion and focus retention. No browser measurements have been performed merely by providing this exercise.

Use the adjacent [animation lifecycle lesson](./What_is_the_best,_most_efficient_way_of_performing_animations_in_webpages.md) for cancellation and reduced-motion code rather than maintaining a second animation owner.

References checked2026-10-22: [Chromium rendering pipeline](https://www.chromium.org/developers/the-rendering-critical-path/), [Chrome layout thrashing guidance](https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing), [Chrome cooperative idle scheduling](https://developer.chrome.com/blog/using-requestidlecallback). Browser support and timing must be checked for the chosen deployment targets.
