# Do you use any CSS methodology or have any guidelines for it on your project?

## 🔹 CSS Methodology and Guidelines on Our Project

Yes, on our project we follow a **structured approach to writing CSS** to ensure **consistency, maintainability, and scalability**.

---

## 1️⃣ CSS Methodology Used

### 1.1 BEM (Block Element Modifier)

- **Naming convention** to make class names **self-descriptive** and avoid conflicts.
- Example:
```css
.button { }
.button__icon { }
.button--primary { }
````

* **Benefits:**

  * Predictable structure
  * Reusable components
  * Easy collaboration in large teams

---

### 1.2 CSS Modules

* Each component has its own **scoped CSS** file.

```tsx
import styles from './Button.module.css';

<button className={styles.button}>Click</button>
```

* **Benefits:**

  * Avoids global namespace collisions
  * Works well with React/Vite/TypeScript
  * Enables **component encapsulation**

---

### 1.3 Guidelines / Best Practices

1. **Use variables** for colors, fonts, and spacing (SASS variables or CSS custom properties).
2. **Keep nesting shallow** (≤3 levels) to avoid specificity issues.
3. **Favor reusable components** instead of copying styles.
4. **Use utility classes** sparingly; prefer semantic names.
5. **Organize files modularly**:

   ```
   /styles
     /variables
     /mixins
     /components
   ```
6. **Combine with automated linting**:

   * `stylelint` checks syntax and enforces style guides.
7. **Responsive design**:

   * Use **mobile-first approach** and **CSS grid/flexbox**.
8. **Documentation**:

   * Document **design tokens**, color palettes, spacing, and component styles.

---

### 1.4 Tools Supporting Guidelines

* **SASS / SCSS**: for variables, mixins, modularity.
* **CSS Modules**: scoped styling per component.
* **Stylelint**: enforce coding standards.
* **PostCSS / Autoprefixer**: browser compatibility.

---

### ✅ Summary

* We combine **BEM + CSS Modules + SASS** with **linting** to maintain **scalable and maintainable styles**.
* Guidelines ensure:

  * Predictable structure
  * Reusable and modular styles
  * Collaboration without conflicts
  * Easier maintenance over time

> 💡 Senior Tip:
> Even if using modern frameworks or utility-first libraries like Tailwind, **having a methodology or guideline** improves **team consistency and long-term maintainability**.
