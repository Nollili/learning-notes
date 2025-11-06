# CSS vs SASS vs Styled Components vs CSS Modules?

Here’s a clear breakdown of **CSS, SASS, CSS Modules, and Styled Components**, with their pros, cons, and use cases. I’ll make it structured so it’s easy to compare — perfect for a senior frontend exam perspective.

---

## **1️⃣ CSS (Vanilla CSS)**

**Description:**

* The classic way to style web pages, using plain `.css` files.
* Styles are **global by default**.

**Pros:**

* Simple, no build step needed.
* Supported everywhere.
* Easy for small projects.

**Cons:**

* Global namespace: risk of class name collisions.
* Harder to maintain in large projects.
* No variables, nesting, or functions (without CSS custom properties).

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
* Can use variables and nesting if combined with SASS (`.module.scss`).
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
| Variables            | No     | Yes       | Yes (with SCSS)  | Yes, via JS       |
| Nesting              | No     | Yes       | Yes (with SCSS)  | Yes               |
| Dynamic styles       | No     | No        | Limited          | Yes, via JS props |
| Build step           | No     | Yes       | Yes              | Yes               |
| Component colocation | No     | No        | Partial          | Yes               |
| Learning curve       | Low    | Medium    | Medium           | Medium/High       |
| Bundle size impact   | Low    | Low       | Low              | Medium/High       |

---

### **💡 Quick Decision Guide**

* **Small static site** → Vanilla CSS
* **Maintainable large project** → SASS / SCSS
* **Component-scoped CSS** → CSS Modules (+ SASS if needed)
* **Dynamic styles in React** → Styled Components

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
CSS → SASS → (Branch) → CSS Modules OR Styled Components
```

* Top: plain CSS
* Middle: SASS adds variables/nesting
* Bottom branches:

  * CSS Modules: component-scoped CSS
  * Styled Components: component-scoped + dynamic props

