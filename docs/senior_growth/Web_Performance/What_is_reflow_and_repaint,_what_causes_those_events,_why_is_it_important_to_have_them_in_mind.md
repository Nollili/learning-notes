# What is reflow and repaint, what causes those events, why is it important to have them in mind?

---

## What Are Reflow and Repaint? {#%F0%9F%A7%A9-what-are-reflow-and-repaint}

When a browser renders a web page, it follows these steps:
1. **Parse HTML → Build DOM**
2. **Parse CSS → Build CSSOM**
3. **Create Render Tree**
4. **Layout (Reflow):** Calculate the size and position of elements
5. **Paint (Repaint):** Fill in pixels for visual appearance
6. **Composite:** Combine layers for final display

Reflow and repaint are **important for web performance**. If triggered too often, they can block the main thread and make the UI feel slow or unresponsive.

---

## Reflow (Layout) {#%F0%9F%94%81-reflow-layout}
**What is it?**  
Reflow (layout) is when the browser recalculates the position and size of elements in the document.

**Common triggers:**
- Adding or removing elements from the DOM
- Changing element size, margin, padding, border, font-size, etc.
- Resizing the window or changing device orientation
- Reading geometry such as offsetHeight/getBoundingClientRect can force a synchronous style/layout flush when needed after invalidating changes; not every read always performs layout.
- Modifying the DOM structure or updating classes that affect layout

**Why care?**  
Reflow is computationally expensive and can affect many elements, especially if changes are deep in the DOM tree.

---

## Repaint {#%F0%9F%8E%A8-repaint}
**What is it?**  
Repaint redraws the visual appearance of elements without affecting their layout.

**Common triggers:**
- Changing colors, backgrounds, visibility, or text decoration
- Updating outline or box-shadow
- CSS animations that only affect paint properties

**Why care?**  
Paint and layout costs depend on affected content, rasterization, invalidation and device; an expensive paint can dominate a small layout.

---

## Why It Matters {#%E2%9A%A0%EF%B8%8F-why-it-matters}

Frequent reflows and repaints:
- Slow down rendering, especially on less powerful devices
- Cause **layout thrashing** (rapid alternation between DOM reads and writes)
- Lower frame rates and responsiveness, resulting in a janky user experience

---

## How to Avoid Performance Issues {#%F0%9F%A7%A0-how-to-avoid-performance-issues}

|  Inefficient |  Better Practice |
|---------------|-------------------|
| Repeated dirty read/write cycles | Measure needed geometry together, then apply owned writes |
| Reading layout after changing styles | Separate read and write operations |
| Interleaved geometry reads and writes in loops | Separate phases; a DocumentFragment is not a guaranteed faster path |
| Expensive repeated geometry/layout work | Reduce scope/work and choose a deliberate event scheduling policy |
| Animating layout properties | Animate `transform` or `opacity` instead |

---

## How to Detect {#%F0%9F%A7%B0-how-to-detect}

- **Chrome DevTools → Performance tab:** Record and inspect “Layout” and “Paint” events
- **Lighthouse / Web Vitals:** Check INP and CLS metrics
- **APIs:** `getBoundingClientRect()`, `PerformanceObserver`

---

## Summary Table {#%F0%9F%9A%80-summary-table}

| Concept            | What It Does                | Cost      | Triggered By                       |
|--------------------|----------------------------|-----------|------------------------------------|
| **Reflow (Layout)**| Recalculates geometry      | Workload-dependent   | DOM/CSS changes affecting layout   |
| **Repaint (Paint)**| Redraws visual styles      | Workload-dependent | Visual (non-layout) changes        |
| **Composite**      | Merges painted layers      | Workload/layer-dependent    | GPU compositing                    |

---

### Optimization Tips {#%E2%9C%85-optimization-tips}
> Minimize layout changes, batch DOM updates, and use GPU-friendly CSS properties.

**In short:**  
> *Reflow rearranges pixels; repaint recolors them.*\
> Both can slow rendering if overused—optimize for smooth UI.


## Worked read/write ordering, with explicit ownership

```js
function lockMeasuredWidths(boxes) {
  const elements = Array.from(boxes);
  const previous = elements.map(box => ({ width: box.style.width, boxSizing: box.style.boxSizing }));
  const widths = elements.map(box => box.offsetWidth); // Physical border-box integer width; read phase.
  elements.forEach((box, index) => {
    box.style.boxSizing = 'border-box';
    box.style.width = widths[index] + 'px';
  });
  let disposed = false;
  return () => {
    if (disposed) return; disposed = true;
    elements.forEach((box, index) => {
      box.style.width = previous[index].width;
      box.style.boxSizing = previous[index].boxSizing;
    });
  };
}
```

This intentionally locks physical widths until teardown; it is not a general responsive-layout recommendation. offsetWidth includes border/padding and ignores transforms, with integer rounding; setting border-box width preserves that particular measurement approximately. Hidden elements can measure0. The function assumes one owner of these inline properties and stable supplied elements; another owner's later writes would be overwritten on restore. Prefer CSS layout when no measurement is needed.

A first geometry read can flush already dirty layout; subsequent reads without intervening invalidation may reuse it. The code's read-before-write order removes its own per-item alternation, not every possible layout in a browser frame. requestAnimationFrame schedules a callback before a rendering opportunity; reads after writes inside it can still force layout, and expensive work still blocks the main thread.

DocumentFragment batches insertion semantics but does not make eventual style/layout free or guarantee fewer/faster flushes. Transform/opacity can avoid layout in suitable animations, while layer promotion/raster/memory remain costs; will-change is not a universal acceleration switch.


Official guidance checked2026-10-22: [layout/forced-read diagnosis](https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing), [React render versus commit](https://react.dev/learn/render-and-commit).


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/performance/What_is_reflow_and_repaint%2C_what_causes_those_events%2C_why_is_it_important_to_have_them_in_mind.md). All learner practice remains outstanding.
