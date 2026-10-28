# How can you fit your website for different screen sizes? (css media queries, breakpoints)

## 🔹 Making Websites Responsive: Media Queries & Breakpoints

Ensuring your website looks good on **different screen sizes** is a key aspect of modern web development. This is achieved through **responsive design**, primarily using **CSS media queries** and **breakpoints**.

---

## 1️⃣ Media Queries

**Media queries** allow you to **apply CSS rules conditionally** based on media features such as viewport width/height, resolution, orientation and user preferences. Viewport CSS pixels are not hardware screen pixels.

### Syntax:
```css
/* Example: Apply styles for screens ≤ 768px */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
    padding: 1rem;
  }
}

/* Example: Apply styles for screens ≥ 1024px */
@media (min-width: 1024px) {
  .container {
    flex-direction: row;
    padding: 2rem;
  }
}
```

* **min-width** → styles apply **from this width and up** (mobile-first approach)
* **max-width** → styles apply **up to this width** (desktop-first approach)

---

## 2️⃣ Breakpoints

**Breakpoints** are **specific screen widths** where your layout changes to fit different devices.

### Illustrative historical buckets, not device detection:

| Device Type      | Width (px) |
| ---------------- | ---------- |
| Mobile (small)   | 320–480    |
| Mobile (large)   | 481–767    |
| Tablet           | 768–1023   |
| Laptop/desktop   | 1024–1440  |
| Large desktop/4K | 1441+      |

> Tip: Breakpoints should match **your design/content needs**, not just devices.

---

## 3️⃣ Mobile-First Approach

* Start with **base styles for mobile** (smallest screen)
* Use **min-width media queries** to add enhancements for larger screens.

```css
/* Base mobile styles */
.container {
  display: flex;
  flex-direction: column;
}

/* Tablet and up */
@media (min-width: 768px) {
  .container {
    flex-direction: row;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

---

## 4️⃣ Flexible Layout Techniques

* **Relative units:** `%, em, rem` instead of px
* **Flexbox:** for adaptable row/column layouts
* **CSS Grid:** for more complex responsive layouts
* **Image layout:** max-width/height prevent overflow; srcset/sizes/picture independently control source selection/art direction.
* **Viewport units:** `vw`, `vh` for scaling relative to screen size

---

## 5️⃣ Advanced Tips

* Combine **media queries with CSS variables** for scalable theming.

```css
:root {
  --spacing: 1rem;
}

@media (min-width: 1024px) {
  :root {
    --spacing: 2rem;
  }
}
```

* Use **container queries** (modern CSS) to adapt components based on **container size** instead of viewport size.

---

### ✅ Summary

* **Media queries** control styles based on device characteristics.
* **Breakpoints** define key points where layouts change.
* Use **mobile-first approach**, relative units, and flexible layouts to ensure your site looks great on all screen sizes.
* Modern techniques (CSS Grid, container queries, responsive images) enhance responsiveness and maintainability.

> 💡 Senior Tip:
> Focus on **content-driven breakpoints**, not just device widths. Adjust layout when the **design breaks**, not arbitrarily at device resolutions.

## Container-query example and fallback

```html
<div class="course-host">
  <article class="course-card"><h2>Browser fundamentals</h2><p>Learn event ownership.</p></article>
</div>
```

```css
.course-card { display: block; padding: 1rem; }
@supports (container-type: inline-size) {
  .course-host { container: course / inline-size; }
  @container course (min-width: 30rem) {
    .course-card { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 1rem; }
  }
}
```

The host establishes inline-size containment; its descendant card responds to available space even when embedded in a narrow sidebar on a wide viewport. The query does not style the container itself based on its own queried size. A usable block layout remains when queries are unavailable. Do not apply size containment indiscriminately: changing intrinsic sizing can collapse or alter a container that relies on its contents.

Custom properties can change inside a media/container rule, but var(--breakpoint) cannot substitute into an ordinary media-query condition. A build-time Sass variable or explicit query value is a different mechanism. Query container names prevent accidentally choosing an unrelated ancestor. Choose viewport media queries for page composition/preferences and container queries for reusable component space; neither is a universal replacement for the other.

Use min-content/long words, wrapped controls, translated labels, zoom and narrow parent contexts to decide breakpoints. Do not infer input capabilities from viewport width; pointer/hover preferences are hints, and a device can have multiple input modes.

Continue with [the worked layout and debugging lesson](./layout-and-responsive-design.md), including flex/grid intrinsic sizing, sticky/stacking, fallbacks and layout shifts. **Exercise:** place the same card in wide/narrow parents at one viewport width. Acceptance: only the wide instance gains columns, fallback remains readable, no horizontal overflow at320CSS-px/zoom, and keyboard/source order stays logical. Verify actual supported browser versions; no browser run is implied.

Official references: [CSS containment/container queries](https://www.w3.org/TR/css-contain-3/), [media queries](https://www.w3.org/TR/mediaqueries-5/). Checked2026-10-20.


## Responsive source selection and art direction

A max-width rule changes layout but does not independently choose a smaller downloaded resource. In the following learner fixture, provide the named assets at their stated dimensions; the notes do not supply those image files.

```html
<!-- Same 16:9 composition; choose a width candidate for the actual CSS slot. -->
<img class="course-image" src="/images/course-800.jpg"
     srcset="/images/course-400.jpg 400w, /images/course-800.jpg 800w, /images/course-1600.jpg 1600w"
     sizes="(min-width: 50rem) 40rem, calc(100vw - 2rem)"
     width="1600" height="900" alt="Course instructor demonstrating a browser timeline">
```

```css
.course-image { display: block; inline-size: min(100%, 40rem); block-size: auto; }
```

sizes describes the intended rendered slot for width descriptors; it must match the actual parent/layout, not merely the file width. Pixel density, cache/network and browser policy influence selection, so do not assert an exact request from viewport width alone. Keep all these candidates' aspect ratio/composition equivalent and reserve dimensions to reduce layout shifts. An above-the-fold LCP candidate should not be indiscriminately lazy-loaded.

For different crops, use picture and a source selection condition rather than list unrelated crops as width candidates:

```html
<picture>
  <source media="(max-width: 35rem)" srcset="/images/instructor-portrait.jpg" width="800" height="1000">
  <img class="course-image" src="/images/instructor-wide.jpg" width="1600" height="900"
       alt="Instructor pointing to the timeline's long task">
</picture>
```

The fallback img owns the alternative text; changing a crop must retain the described meaning. Source type can offer formats when supported; a source URL is not a guarantee a particular codec exists everywhere. A reusable container-sized card can have a slot narrower than viewport-based sizes predicts—test its actual embedding or choose a justified sizes policy rather than assume the container query controls image selection automatically.


Official reference checked 2026-10-22: [HTML responsive images, sizes and picture processing](https://html.spec.whatwg.org/multipage/images.html).


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/css/How_can_you_fit_your_website_for_different_screen_sizes_%28css_media_queries%2C_breakpoints%29.md). All learner practice remains outstanding; the worked examples above are explanatory material.
