# What is reflow and repaint, what causes those events, why is it important to have them in mind?

---

## 🧩 What Are Reflow and Repaint?

When a browser renders a web page, it follows these steps:
1. **Parse HTML → Build DOM**
2. **Parse CSS → Build CSSOM**
3. **Create Render Tree**
4. **Layout (Reflow):** Calculate the size and position of elements
5. **Paint (Repaint):** Fill in pixels for visual appearance
6. **Composite:** Combine layers for final display

Reflow and repaint are **important for web performance**. If triggered too often, they can block the main thread and make the UI feel slow or unresponsive.

---

## 🔁 Reflow (Layout)
**What is it?**  
Reflow (layout) is when the browser recalculates the position and size of elements in the document.

**Common triggers:**
- Adding or removing elements from the DOM
- Changing element size, margin, padding, border, font-size, etc.
- Resizing the window or changing device orientation
- Accessing layout properties like `offsetHeight`, `scrollTop`
- Modifying the DOM structure or updating classes that affect layout

**Why care?**  
Reflow is computationally expensive and can affect many elements, especially if changes are deep in the DOM tree.

---

## 🎨 Repaint
**What is it?**  
Repaint redraws the visual appearance of elements without affecting their layout.

**Common triggers:**
- Changing colors, backgrounds, visibility, or text decoration
- Updating outline or box-shadow
- CSS animations that only affect paint properties

**Why care?**  
Repaints are less expensive than reflows but still consume CPU/GPU resources.

---

## ⚠️ Why It Matters

Frequent reflows and repaints:
- Slow down rendering, especially on less powerful devices
- Cause **layout thrashing** (rapid alternation between DOM reads and writes)
- Lower frame rates and responsiveness, resulting in a janky user experience

---

## 🧠 How to Avoid Performance Issues

| ❌ Inefficient | 💡 Better Practice |
|---------------|-------------------|
| Setting styles one by one | Batch DOM updates (use classes, `requestAnimationFrame`) |
| Reading layout after changing styles | Separate read and write operations |
| Manipulating the DOM inside loops | Use `DocumentFragment` or update off-DOM |
| Forcing layout in JavaScript | Debounce resize/scroll event handlers |
| Animating layout properties | Animate `transform` or `opacity` instead |

---

## 🧰 How to Detect

- **Chrome DevTools → Performance tab:** Record and inspect “Layout” and “Paint” events
- **Lighthouse / Web Vitals:** Check INP and CLS metrics
- **APIs:** `getBoundingClientRect()`, `PerformanceObserver`

---

## 🚀 Summary Table

| Concept            | What It Does                | Cost      | Triggered By                       |
|--------------------|----------------------------|-----------|------------------------------------|
| **Reflow (Layout)**| Recalculates geometry      | 🔴 High   | DOM/CSS changes affecting layout   |
| **Repaint (Paint)**| Redraws visual styles      | 🟠 Medium | Visual (non-layout) changes        |
| **Composite**      | Merges painted layers      | 🟢 Low    | GPU compositing                    |

---

### ✅ Optimization Tips
> Minimize layout changes, batch DOM updates, and use GPU-friendly CSS properties.

**In short:**  
> 💡 *Reflow rearranges pixels; repaint recolors them.*  
> Both can slow rendering if overused—optimize for smooth UI.

