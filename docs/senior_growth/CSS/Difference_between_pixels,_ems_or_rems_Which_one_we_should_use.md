# Difference between pixels, ems or rems? Which one we should use?

## 🔹 CSS Units: px, em, rem

In CSS, **length units** define sizes for fonts, spacing, widths, etc. The most common units are **pixels (px), em, and rem**. Understanding their differences is crucial for **scalable, responsive design**.

---

## 1️⃣ Pixels (`px`)

- **Absolute CSS length unit**, defined by the CSS reference pixel. One CSS px is not necessarily one physical device pixel; device density and page zoom affect the mapping.
- Example:
```css
p {
  font-size: 16px;
}
```

* **Characteristics:**

  * Fixed size, not affected by parent element or root font size.
  * Good for precise layouts.
  * Less flexible for **responsive design or accessibility**.

---

## 2️⃣ Ems (`em`)

* On `font-size`, `em` resolves against the inherited parent font size; on properties such as padding, it resolves against the element's own computed font size.
* Example:

```css
div {
  font-size: 16px;
}

p {
  font-size: 1.5em; /* 1.5 * 16px = 24px */
}
```

* **Characteristics:**

  * Cascades: if parent’s font-size changes, `em` sizes change too.
  * Useful for **scaling components proportionally**.
  * Can cause **compound scaling issues** if nested too deeply.

---

## 3️⃣ Rems (`rem`)

* **Relative unit** based on **root (`<html>`) font size**, usually 16px by default.
* Example:

```css
html {
  font-size: 16px;
}

p {
  font-size: 1.5rem; /* 1.5 * 16px = 24px */
}
```

* **Characteristics:**

  * Not affected by parent elements.
  * Predictable and easier to maintain than `em`.
  * Ideal for **global font scaling** and spacing consistency.

---

## 4️⃣ Comparison Table

| Unit | Relative To      | Pros                                      | Cons                               | Use Case                           |
| ---- | ---------------- | ----------------------------------------- | ---------------------------------- | ---------------------------------- |
| px   | CSS reference pixel | Precise CSS length; page zoom scales it | Does not follow user default font size by itself            | Borders, icons, pixel-perfect UI   |
| em   | Parent for font-size; own font for other lengths | Scales with parent, component flexibility | Nested scaling can be confusing    | Component-based scaling            |
| rem  | Root font-size   | Predictable, scalable, responsive         | Less flexible for local variations | Global font sizes, spacing, layout |

---

## 5️⃣ Recommendations

1. **Use `rem` for:**

   * Base font sizes
   * Layout spacing (margins, paddings)
   * Consistent responsive design

2. **Use `em` for:**

   * Component-relative adjustments (e.g., button padding relative to button font size)

3. **Use `px` for:**

   * Borders or precise CSS lengths where following the component font is not intended; browser zoom still scales CSS px

4. **Tip:** Combine **`rem` for global scale + `em` for local component adjustments**.

---

### ✅ Summary

* **px** → CSS absolute length; browser zoom still scales it
* **em** → font-relative with property-dependent resolution; nested font sizes can compound
* **rem** → relative to **root**, consistent and predictable, best for global sizing

> 💡 Senior Tip:
> Font-relative units can follow user sizing preferences. Test wrapping, focus and clipping as well; choosing rem alone does not establish accessibility.

## Worked calculation and fluid layout

```css
html { font-size: 100%; } /* Respect the user's default; do not assume 16px. */
.panel { font-size: 1.25rem; }
.panel button {
  font-size: 0.8em;
  padding: 0.5em 1em;
}
.page {
  inline-size: min(100% - 2rem, 72rem);
  margin-inline: auto;
}
h1 { font-size: clamp(1.75rem, 1.2rem + 2vw, 3rem); }
.viewport { min-block-size: 100vh; min-block-size: 100dvh; }
```

If the root computes to20px, panel text is25px, button text20px, vertical padding10px and horizontal padding20px. The button padding uses20px, not25px. A `rem` is tied to root font size; percentages depend on the property (width percentages usually use a containing block, not font size).

`ch` follows the advance width of the font's zero glyph and is useful for an approximate readable measure (for example `max-inline-size: 65ch`); it is not an exact character count for proportional fonts. `ex` follows x-height and varies by font. Intrinsic sizing keywords such as `min-content`, `max-content` and `fit-content` are sizing modes, not length units.

`min` caps the page width; `max` can enforce a lower bound; `clamp(min, preferred, max)` bounds a fluid value. Pure viewport typography can resist text resizing, so retain font-relative bounds and test zoom. `dvh` follows the dynamic viewport and can resize as mobile browser chrome moves; `svh` favors the smaller stable viewport and `lvh` the larger one. A fallback declaration handles browsers without the newer unit.

**Debugging:** inspect computed font sizes from root to child and compare CSS pixels with `devicePixelRatio`; do not multiply every layout value by device pixel ratio. Test long translations and200% text/400% page zoom; rem units alone cannot prevent fixed-height clipping. Avoid disabling browser zoom. Pixel borders can be appropriate while text and component padding remain font-relative.


Official references: [CSS absolute/font-relative lengths and math](https://www.w3.org/TR/css-values-4/), [WCAG reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).

### An explicit max and viewport fallback

```css
.safe-page {
  padding-inline: 1rem;
  padding-inline: max(1rem, env(safe-area-inset-left));
  min-block-size: 100vh;
  min-block-size: 100dvh;
}
```

Here max chooses at least1rem of inline padding, or the physical left safe-area inset when larger. This simple symmetric rule is conservative for a left notch; a real layout should handle left/right and writing direction deliberately rather than assume a physical inset is a logical start inset. The first declarations remain useful when a later value is unsupported. Safe-area values may be zero; this is not a substitute for testing mobile browser chrome or the page's viewport configuration.

For an arithmetic self-check, root20px × panel1.25 × button0.8 = button20px; its0.5em padding is10px. A changed device-pixel ratio does not alter this CSS-unit calculation by itself. Actual computed layout/zoom/mobile viewport behavior still requires a browser; parsing or compiling this stylesheet proves neither reflow nor accessible sizing. Current examples are material, and the native audit remains learner practice.


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/css/Difference_between_pixels%2C_ems_or_rems_Which_one_we_should_use.md). All learner practice remains outstanding; the worked examples above are explanatory material.
