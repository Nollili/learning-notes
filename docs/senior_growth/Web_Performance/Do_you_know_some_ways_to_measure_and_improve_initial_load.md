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
- Should be **under 2.5s** for good UX.

### 4. **TTI (Time to Interactive)**
- Measures: When the page becomes fully usable (scripts loaded, no main thread blocking).  
- Closely related to **TTFI**.

### 5. **Speed Index**
- Measures: How quickly content is visually displayed during load.

---

## ⚙️ Tools to Measure

- **Chrome DevTools → Performance & Lighthouse tabs**
- **WebPageTest.org**
- **Lighthouse CI / PageSpeed Insights**
- **Core Web Vitals metrics via Google Search Console**
- **Performance APIs** (`performance.timing`, `PerformanceObserver`)

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
- Load non-critical CSS asynchronously (`<link rel="preload">`, `<link rel="prefetch">`)
- Avoid large, blocking fonts; use `font-display: swap`

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
- Use **Server-Side Rendering (SSR)** or **Static Site Generation (SSG)** for faster perceived load.
- Example: Next.js, Remix, Astro

---

## 🧩 Example: React + Vite Optimization Checklist

| Area | Tool/Technique | Benefit |
|------|----------------|----------|
| Bundles | `vite-plugin-compression`, `splitChunks` | Smaller JS |
| Scripts | `defer` / `async` | No render blocking |
| CSS | Inline critical CSS | Faster first paint |
| Server | CDN, caching headers | Faster TTFB |
| Images | WebP, lazy load | Smaller payload |
| Fonts | `font-display: swap` | Avoid blocking render |

---

## ✅ Summary

Improving initial load is about reducing **what must be loaded**, **when it’s loaded**, and **how efficiently it’s delivered**.  
Combining **bundle optimization**, **network tuning**, and **render path optimization** results in a visibly faster, more responsive first experience.
