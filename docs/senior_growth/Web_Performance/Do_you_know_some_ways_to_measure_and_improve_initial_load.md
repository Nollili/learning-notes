# Do you know some ways to measure and improve initial load?

## Measuring and Improving Initial Load Performance

Optimizing **initial load performance** is about reducing the time it takes for users to see and interact with your app after visiting your page for the first time.  

---

## 🧭 Key Metrics to Measure Initial Load

### 1. **TTFB (Time to First Byte)**
- Measures: Time for the server to respond to the browser’s initial request.  
- Indicates backend or network latency issues.  
- **Tools**:  
  - Chrome DevTools → Network tab  
  - Lighthouse → “Server response times”  
  - WebPageTest  

### 2. **FCP (First Contentful Paint)**
- Measures: Time until the browser renders the first visible content.  
- Optimized by reducing render-blocking resources and minimizing bundle size.

### 3. **LCP (Largest Contentful Paint)**
- Measures: Time for the main content (hero image, title, etc.) to appear.  
- Good field LCP is at most2.5s at the75th percentile; a single lab result is different evidence.

### 4. **Responsiveness diagnostics**
- Use lab TBT and interaction traces, plus field INP. TTI was removed from Lighthouse10; informal TTFI is not its standardized synonym.
- Rendering content does not prove correct listeners, hydration or low input latency.

### 5. **Speed Index**
- Measures: How quickly content is visually displayed during load.

---

## ⚙️ Tools to Measure

- **Chrome DevTools → Performance & Lighthouse tabs**
- **WebPageTest.org**
- **Lighthouse CI / PageSpeed Insights**
- **Core Web Vitals metrics via Google Search Console**
- **Performance APIs** (Navigation/Resource Timing entries and feature-detected `PerformanceObserver`; legacy performance.timing is deprecated)

---

## 🚀 Techniques to Improve Initial Load

### **1. Optimize Bundles**
- Use **code splitting** (`React.lazy`, dynamic `import()`)
- Apply **tree shaking** to remove unused code
- Use **minification & compression** (e.g., Terser, Gzip, Brotli)
- Remove **polyfills** not needed for modern browsers

### **2. Defer or Async Scripts**
- Use `<script defer>` for non-critical scripts (loads in parallel, executes after HTML parsing)
- Use `<script async>` for independent third-party scripts (analytics, ads)

### **3. Optimize Rendering Path**
- Inline **critical CSS**
- Keep essential CSS as a stylesheet; preload only fetches and prefetch is a speculative future hint. Neither applies CSS on its own. Noncritical async styling requires a consuming stylesheet and a tested no-script/CSP strategy.
- Choose a font-display policy deliberately; swap avoids prolonged invisible text but can cause shifts without matched fallback metrics.

### **4. Optimize Server Response**
- Use **HTTP/2 or HTTP/3**
- Apply **CDN** for static assets
- Cache responses effectively with **ETags** or **Cache-Control headers**

### **5. Optimize Images**
- Compress and resize appropriately
- Use modern formats like **WebP** or **AVIF**
- Lazy-load below-the-fold images (`loading="lazy"`)

### **6. Preloading & Prefetching**
- `<link rel="preload">` for critical resources
- `<link rel="prefetch">` or `<link rel="dns-prefetch">` for anticipated navigation

### **7. SSR or SSG**
- Consider SSR/SSG when earlier useful HTML justifies server/cache/hydration complexity; neither guarantees faster results.
- Example: Next.js, Remix, Astro

---

## 🧩 Example: React + Vite Optimization Checklist

| Area | Tool/Technique | Benefit |
|------|----------------|----------|
| Bundles | Bundler output analysis and configured HTTP compression; splitChunks is Webpack-specific | Smaller JS |
| Scripts | `defer` / `async` | No render blocking |
| CSS | Inline critical CSS | Faster first paint |
| Server | CDN, caching headers | Faster TTFB |
| Images | Responsive formats/dimensions; eager critical hero, lazy below fold | Appropriate bytes/discovery |
| Fonts | `font-display: swap` | Avoid blocking render |

---

## ✅ Summary

Improving initial load is about reducing **what must be loaded**, **when it’s loaded**, and **how efficiently it’s delivered**.  
Combining **bundle optimization**, **network tuning**, and **render path optimization** results in a visibly faster, more responsive first experience.

## Resource discovery: fetch priority is not application readiness

```html
<!-- Critical CSS is applied normally, with a no-JavaScript baseline. -->
<link rel="stylesheet" href="/assets/site.css">
<!-- Preload only a measured critical font, matching the consuming URL/type/CORS. -->
<link rel="preload" href="/fonts/study-latin.woff2" as="font" type="font/woff2" crossorigin>
<!-- Hero is in initial HTML; do not lazy-load a likely LCP image. -->
<img src="/images/course-960.webp"
     srcset="/images/course-480.webp 480w, /images/course-960.webp 960w"
     sizes="(min-width: 60rem) 48rem, 100vw"
     width="960" height="540" fetchpriority="high"
     alt="Course instructor demonstrating a layout inspector">
```

Paths are exercise assets, not files delivered by these notes. Verify the selected srcset candidate and rendered slot. Preload competes with other downloads; do not preload every font/image/script. A wrong URL/CORS mode or unused font can waste bandwidth. Compression must be served with correct Content-Encoding/Vary behavior; producing a compressed artifact alone does not enable it. Module scripts defer by default; async/defer change scheduling, not the CPU cost of execution. Trace discovery, queueing, transfer, decode and rendering before choosing a hint.

## Typography, fallback metrics and subsets

```css
@font-face {
  font-family: Study;
  src: url('/fonts/study-latin.woff2') format('woff2');
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  /* Match these ranges to the actual subset; preserve needed accents/scripts. */
  unicode-range: U+0000-00FF, U+0100-024F;
}
.article {
  font-family: Study, system-ui, sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  max-inline-size: 65ch;
  margin-inline: auto;
  overflow-wrap: anywhere;
}
.article h1 { font-size: clamp(1.75rem, 1rem + 2vw, 3rem); line-height: 1.15; }
```

Unitless line-height scales with each descendant's font size; ch approximates a glyph-based measure and does not count actual characters. The65ch/1.6 choices are starting design values, not WCAG rules. Test long translations, zoom, text-spacing overrides, headings and narrow screens. Do not lock a text container to a height that clips enlarged content or disable zoom. Relative units help but do not alone prove accessibility.

A font subset removes unused glyphs from the binary; unicode-range only declares coverage and selects faces, it does not physically shrink the font file. Include Hungarian accents and every supported script/combining sequence; test fallback mixing. Variable fonts may replace multiple files, but a broad variable font can exceed a tightly chosen static subset. Validate font licensing and desired axes/weights rather than preloading all variants.

Compare font-display swap (early fallback with later replacement) against optional (may retain fallback for the visit) and a system-only stack. Brand fidelity, legibility, bytes and shift risk are trade-offs. Fallback adjustment can use @font-face size-adjust plus ascent-override/descent-override/line-gap-override where supported. Values must be derived for the specific font pair; copying a percentage from another project can worsen line wrapping.

```css
/* Calibration demonstration only: replace all percentages with measured values. */
@font-face {
  font-family: 'Study fallback';
  src: local('Arial');
  size-adjust: 100%;
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
}
.article-calibration { font-family: Study, 'Study fallback', sans-serif; }
```

Arial availability is platform-dependent. Compare actual fallback and loaded glyph widths/line metrics with font loading blocked/delayed, then calibrate using the chosen font's metrics and representative text. size-adjust scales outlines/metrics; metric overrides control line layout, not arbitrary glyph shape/width equality. They cannot guarantee identical wrapping. Verify relevant browser support instead of assuming every draft Fonts5 feature ships.

**Exercise:** supply real font/image assets, create a typography specimen and measure cold/warm initial load. Acceptance: fallback is readable with failed font requests; supported accents/scripts remain correct; no clipped text with200% zoom and relevant text-spacing overrides; capture font-request discovery/bytes, line wrapping and layout-shift attribution before/after calibration; explain swap versus optional/system decisions; critical image is discoverable/eager with reserved geometry; baseline CSS works without script. Repeat identical conditions and record field-monitoring plan separately. No font binaries, browser measurements or learner results are supplied here.

References checked2026-10-20: [font loading strategies](https://web.dev/articles/font-best-practices), [font subsetting](https://web.dev/learn/performance/optimize-web-fonts), [CSS Fonts5 metrics](https://www.w3.org/TR/css-fonts-5/), [responsive images](https://html.spec.whatwg.org/multipage/images.html), [Navigation Timing2](https://www.w3.org/TR/navigation-timing-2/).

For emitted module graphs, side-effect preservation, conditional exports and a measured eager/lazy bundle fixture, use the [worked production analysis](./What_are_some_general_practices_and_techniques_to_optimize_in_the_area_Explain_tree_shaking%2C_code_splitting_and_bundling%2C_minimizing%2C_data_caching..md#worked-production-analysis-module-contracts-before-chunk-tuning). Its byte-size evidence is separate from browser responsiveness or field percentiles.
