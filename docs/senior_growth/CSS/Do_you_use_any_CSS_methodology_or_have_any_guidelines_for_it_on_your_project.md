# Do you use any CSS methodology or have any guidelines for it on your project?

## Example CSS Methodology and Guidelines {#%F0%9F%94%B9-example-css-methodology-and-guidelines}

The following is a proposed project policy. It is an interview/example narrative, not a claim that this repository has implemented or measured these practices.

---

## CSS Methodology Used {#_1%EF%B8%8F%E2%83%A3-css-methodology-used}

### 1.1 BEM (Block Element Modifier)

- **Naming convention** to make class names **self-descriptive** and avoid conflicts.
- Example:
```css
.button { }
.button__icon { }
.button--primary { }
```

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
* **PostCSS / Autoprefixer**: configured transformations/prefixes for selected targets; they do not supply every missing browser feature.

---

### Summary {#%E2%9C%85-summary}

* A project may combine BEM, CSS Modules and Sass where each solves a requirement; no project must adopt all three.
* Guidelines ensure:

  * Predictable structure
  * Reusable and modular styles
  * Collaboration without conflicts
  * Easier maintenance over time

> Senior Tip:
> Even if using modern frameworks or utility-first libraries like Tailwind, **having a methodology or guideline** improves **team consistency and long-term maintainability**.

## Turn a policy into reviewable evidence

Start with component ownership, the existing build and a documented browser support policy. Use CSS Modules for local classes where already supported; retain a small owned global/token layer. Sass remains optional for build-time composition. Set a specificity/nesting budget suited to the actual cascade; three nesting levels is an example limit, not a proof that selectors remain low-specificity.

The [BEM naming/collision/migration fixture](./Do_you_still_think_BEM_style_is_valid_nowadays_Main_benefits.md#executable-naming-policy) supplies an exact Stylelint configuration, a valid stylesheet and negative cases. Its policy is checked in a separate lab, not installed into this notes site's build or an Autocode template. Pair source linting with the [shared theme/cascade lesson](./CSS_vs_SASS_vs_Styled_Components_vs_CSS_Modules.md) and the browser support evidence matrix; a green lint result does not mean the theme is accessible or that no global selector leaks.


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/css/Do_you_use_any_CSS_methodology_or_have_any_guidelines_for_it_on_your_project.md). All learner practice remains outstanding; the worked examples above are explanatory material.
