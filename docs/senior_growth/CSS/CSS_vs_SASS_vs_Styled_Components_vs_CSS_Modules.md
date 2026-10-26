# CSS vs SASS vs Styled Components vs CSS Modules?

Here’s a clear breakdown of **CSS, SASS, CSS Modules, and Styled Components**, with their pros, cons, and use cases. I’ll make it structured so it’s easy to compare — perfect for a senior frontend exam perspective.

---

## **1️⃣ CSS (Vanilla CSS)**

**Description:**

* The classic way to style web pages, using plain `.css` files.
* Styles are **global by default**.

**Pros:**

* Simple, no build step needed.
* Core CSS is widely available; check each newer feature against the declared support matrix.
* Easy for small projects.

**Cons:**

* Global namespace: risk of class name collisions.
* Requires explicit ownership/cascade conventions as the style surface grows.
* Global styles require an explicit cascade/ownership strategy. Native CSS has custom properties, nesting and built-in functions; compatibility depends on the chosen browser matrix.

**Use case:**

* Small websites, prototypes, or static pages.

---

## **2️⃣ SASS / SCSS**

**Description:**

* A **CSS preprocessor** that adds variables, nesting, mixins, functions, and more.
* Requires a build step to compile into CSS.

**Pros:**

* Nested selectors for cleaner code.
* Variables and mixins → reusable styles.
* Conditional logic and loops for dynamic styling.
* Wide adoption in medium to large projects.

**Cons:**

* Requires build tooling.
* Still global unless combined with CSS Modules.

**Use case:**

* Medium to large projects that need **scalable and maintainable CSS**.

---

## **3️⃣ CSS Modules**

**Description:**

* Each CSS file is treated as a **module**. Class names are **scoped locally** by default.
* Usually used with Webpack / Vite / React.

**Pros:**

* Local scoping prevents class name collisions.
* Native custom properties/nesting also work in `.module.css` when supported by the browser or transformed by the build. Sass is optional.
* Compatible with existing CSS ecosystem.

**Cons:**

* Still requires build tooling.
* Slightly more boilerplate when importing styles (`import styles from './Button.module.css'`).

**Use case:**

* React or Vue projects where **component-level style isolation** is needed.

---

## **4️⃣ Styled Components (CSS-in-JS)**

**Description:**

* A **CSS-in-JS library** for React. Styles are written inside JS/TS files.
* Supports dynamic styling via props.

**Pros:**

* Scoped to components automatically.
* Dynamic styles via props (`color={primary ? 'blue' : 'red'}`).
* No separate CSS files — everything colocated with components.
* Full JavaScript power (logic, loops, conditionals).

**Cons:**

* Adds runtime overhead.
* Larger bundle size compared to plain CSS.
* Learning curve for developers used to vanilla CSS.

**Use case:**

* React projects with **highly dynamic and component-scoped styles**.
* When you want to **co-locate styles with components**.

---

### **Comparison Table**

| Feature              | CSS    | SASS/SCSS | CSS Modules      | Styled Components |
| -------------------- | ------ | --------- | ---------------- | ----------------- |
| Scope                | Global | Global    | Local by default | Local by default  |
| Variables            | Runtime custom properties | Build-time Sass values + CSS properties | Native CSS properties | JS + CSS properties |
| Nesting              | Native, check browser support | Sass transform | Native or configured transform | Library syntax/transform |
| Dynamic styles       | Cascade/custom properties | Generated CSS can use custom properties | Same native CSS capabilities | JS props + native CSS |
| Build step           | No     | Yes       | Yes              | Yes               |
| Component colocation | No     | No        | Partial          | Yes               |
| Learning curve       | Low    | Medium    | Medium           | Medium/High       |
| Bundle size impact   | Low    | Low       | Low              | Medium/High       |

---

### **💡 Quick Decision Guide**

* **Small static site** → Vanilla CSS
* **Repeated build-time composition** → consider Sass; large projects can also use owned native CSS
* **Component-scoped CSS** → CSS Modules (+ SASS if needed)
* **Dynamic themes/values** → native custom properties first; CSS-in-JS is an alternative with integration costs

---


### **Text Diagram**

```
          ┌─────────────┐
          │   Vanilla   │
          │    CSS      │
          └─────────────┘
                 │
                 ▼
          ┌─────────────┐
          │   SASS/SCSS │
          │ (preprocessor)
          └─────────────┘
                 │
       ┌─────────┴─────────┐
       ▼                   ▼
┌─────────────┐       ┌─────────────┐
│ CSS Modules │       │ Styled Comp │
│  (scoped)   │       │ (CSS-in-JS) │
└─────────────┘       └─────────────┘
       │                   │
       ▼                   ▼
 Component-level      Component-level
  styling             styling + dynamic props
```

---

### **Workflow / Usage Notes**

1. **Vanilla CSS**

   * Write `.css` files → `<link>` or import → global styles.

2. **SASS / SCSS**

   * Write `.scss` files → compile → `.css` → global or modular styles.

3. **CSS Modules**

   * `.module.css` or `.module.scss` → imported into JS/TS → scoped class names.

4. **Styled Components**

   * Write styles directly in JS/TS → scoped & dynamic → bundled via build tool.

---

### **Graphical Suggestion (Optional)**

If you want to **draw it for your notes**, imagine a **funnel diagram**:

```
CSS platform; optional build transform (Sass); optional class scoping (Modules); alternative authoring (CSS-in-JS)
```

* Top: plain CSS
* Middle: Sass adds build-time modules, mixins, loops and functions beyond native CSS
* Bottom branches:

  * CSS Modules: component-scoped CSS
  * Styled Components: component-scoped + dynamic props


## Runtime theme versus build-time generation

Primary approach in this learning path: native CSS with CSS Modules for React component class names; add Sass only when its compile-time features solve a real need. These are independent choices, not a required progression through all four tools. CSS Modules renames classes; inherited values, element selectors and the cascade still apply.

```css
:root { --surface: white; --text: #18202a; --space: 1rem; }
[data-theme="dark"] { --surface: #18202a; --text: white; }
.card {
  color: var(--text);
  background: var(--surface);
  padding: calc(var(--space) * 1.5);
  & > h2 { margin-block-start: 0; }
}
```

Custom properties participate in inheritance and can change without recompiling. Sass variables are substituted during compilation; they do not respond to a later theme attribute unless the emitted CSS contains runtime tokens. Native nesting has selector/specificity rules and is not a full Sass parser. Built-in CSS functions such as `calc`, `min`, `max` and `clamp` solve many responsive calculations without JavaScript.

**Failure cases and choices:** an undefined/invalid variable may invalidate a declaration at computed-value time; `var(--missing, fallback)` does not repair every invalid value. Deep nesting can create fragile specificity. User-selected themes need contrast checks and a stable initial server/client theme to avoid flashes or hydration mismatch. Runtime CSS-in-JS adds injection/SSR ordering and CSP integration considerations; extracted/static CSS reduces runtime styling work but still requires stylesheet delivery. Measure bundle/render costs instead of ranking tools universally.

**Exercise:** implement a themed card with the CSS above, then scope its class using the existing build's CSS Modules support. Acceptance: theme switches without a rebuild; fallback works when a token is absent; styles do not accidentally target unrelated headings; server HTML and first client theme agree; contrast/focus are checked in each theme. Compare compiled CSS before selecting Sass. Learner browser validation remains required.

Official references (checked2026-10-20): [custom properties](https://www.w3.org/TR/css-variables-1/), [native nesting](https://www.w3.org/TR/css-nesting-1/), [CSS Modules contract](https://github.com/css-modules/css-modules), [styled-components SSR](https://styled-components.com/docs/advanced#server-side-rendering).


## Cascade order and a bounded component API

```css
@layer reset, components, utilities;
@layer components {
  .course-card { color: var(--text, #18202a); padding: 1rem; }
}
@layer utilities {
  .compact { padding: .5rem; }
}
```

For normal declarations in the same origin, later layers beat earlier layers before selector specificity is compared across those layers. Unlayered normal author declarations beat layered normal author declarations. Important declarations reverse layer precedence, and other cascade stages/origins also matter; do not infer that a high-specificity selector always wins. CSS Modules names remain subject to these rules and inherited tokens. Keep utility/component ownership deliberate rather than add important to every conflict.

The [typed Card and initial-theme contract](./styling_react_apps.md#server-and-first-client-theme-agreement) turns the shared native-token approach into a concrete SSR/client boundary. It does not require Sass or runtime style generation. **Acceptance:** predict the layered padding, add an unlayered conflicting rule and inspect the actual computed result, then remove the unintended conflict. Verify theme/state/focus and server/client class-map agreement in the production build; stylesheet compilation alone is not native cascade/paint evidence. Learner browser/SSR-deployment work remains required.

Official references checked 2026-10-22: [cascade layers and order](https://www.w3.org/TR/css-cascade-5/), [React hydration contract](https://react.dev/reference/react-dom/client/hydrateRoot).
