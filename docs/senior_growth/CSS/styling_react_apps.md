# Styling React applications

Choose an approach from component ownership, runtime/SSR requirements and the existing build. The comparisons below are options, not an instruction to adopt every tool.

---

## 🧠 **Overview**

In React, there are **several main ways to style components**, each with its pros and cons.
A senior dev should know **when and why** to use each.

---

### 1️⃣ **Inline styles**

```jsx
function Button() {
  return <button style={{ backgroundColor: 'blue', color: 'white' }}>Click</button>;
}
```

✅ **Pros:**

* Simple and scoped to the element
* No class name collisions
* Useful for dynamic styles (based on props)

❌ **Cons:**

* No pseudo-classes (`:hover`, `:focus`) or media queries
* Harder to maintain for larger apps
* Performance cost if used excessively

🧠 **Good for:** small dynamic changes, one-off components, prototyping.

---

### 2️⃣ **Traditional CSS / SCSS**

```scss
/* button.scss */
.button {
  background: blue;
  color: white;
}
```

```jsx
import './button.scss';

function Button() {
  return <button className="button">Click</button>;
}
```

✅ **Pros:**

* Familiar, supports everything (media queries, animations)
* SCSS allows nesting, variables, mixins
* Works with global design systems

❌ **Cons:**

* Risk of class name collisions (unless modularized)
* Styles are global unless scoped manually

🧠 **Good for:** large apps with an established global style system.

---

### 3️⃣ **CSS Modules**

```scss
/* Button.module.scss */
.button {
  background: blue;
  color: white;
}
```

```jsx
import styles from './Button.module.scss';

function Button() {
  return <button className={styles.button}>Click</button>;
}
```

✅ **Pros:**

* Automatic local scoping (no collisions)
* Works with SCSS
* Supported by common Vite and Next.js tooling; verify the project configuration

❌ **Cons:**

* Class name composition can get verbose
* Runtime values can use inherited custom properties or inline custom properties

🧠 **Good for:** mid/large-scale projects that need maintainable, isolated styles.

---

### 4️⃣ **CSS-in-JS (Styled Components, Emotion, etc.)**

```jsx
import styled from 'styled-components';

const Button = styled.button`
  background: blue;
  color: white;
  &:hover {
    background: darkblue;
  }
`;
```

✅ **Pros:**

* Scoped styles by default
* Can use props for dynamic styling
* No separate CSS files
* Great for design systems and theming

❌ **Cons:**

* Slight runtime overhead (though newer versions optimize this)
* Harder to extract CSS for SSR unless configured

🧠 **Good for:** design systems, component libraries, projects emphasizing encapsulation and theming.

---

### 5️⃣ **Utility-first frameworks (Tailwind CSS)**

```jsx
function Button() {
  return (
    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
      Click
    </button>
  );
}
```

✅ **Pros:**

* Fast to develop
* Utilities reduce authored CSS; a generated stylesheet is still delivered
* Consistent design and responsive utilities built-in

❌ **Cons:**

* Verbose markup
* Can be hard to read for complex components

🧠 **Good for:** modern React + Vite setups, quick iteration, consistent UI across teams.

---
### CSS-in-JS terminology

---

> **CSS-in-JS** means writing styles directly inside JavaScript files — usually inside the component itself — instead of separate `.css` or `.scss` files.
>
> It lets you use **props, themes, and dynamic values** in your styles, and ensures **automatic scoping** (no global class name conflicts).
>
> Common libraries are **styled-components**, **Emotion**, and newer **zero-runtime** ones like **vanilla-extract**.
>
> It’s great for design systems or component libraries, while native CSS Modules/custom properties are the primary path in these notes; performance depends on the actual product.

---

### CSS-in-JS trade-offs

---

### ✅ **Pros**

* **Scoped styles** — no class name collisions, styles tied to components
* **Dynamic styling** — can use React props and state inside styles
* **Theme support** — easy dark/light mode or brand themes via `ThemeProvider`
* **Great for design systems** — reusable styled components with shared tokens
* **No separate CSS files** — everything stays in one place

---

### ❌ **Cons**

* **Runtime overhead** (though less with zero-runtime libs like *vanilla-extract*)
* **Harder to debug** in browser dev tools (class names are hashed)
* **Build complexity** — more bundler setup, SSR extraction sometimes needed
* **Not ideal for global/layout CSS** — Tailwind or plain CSS handles that better

---

### 🗣️ **Short interview answer**

> “CSS-in-JS gives great encapsulation and dynamic styling, but it adds runtime and build complexity.
> It’s excellent for component libraries and theming, but for global or layout styles I’d use Tailwind or CSS Modules instead.”

---

### 🧩 **What to say in your senior assessment**

> “React supports multiple styling approaches.
> For small or dynamic tweaks, inline styles are fine.
> For larger projects, CSS Modules or SCSS give structure and maintainability.
> In design system or component-library contexts, I often use CSS-in-JS solutions like Styled Components or Emotion because they allow prop-based dynamic styling and theming.
> And for rapid development or consistent design, Tailwind CSS is also very popular today.”

---

### 🗣️ **30-second interview answer**

> “React allows different styling strategies — from inline styles to SCSS, CSS Modules, or CSS-in-JS.
> I usually prefer **CSS Modules or Styled Components** for scoped, maintainable styling, and use **Tailwind** when the project favors utility-first design.
> The key is balancing reusability, performance, and consistency with the team’s tech stack.”

---


## Choosing a primary approach

For these notes, use React with CSS Modules and a small global semantic-token layer. Sass is optional build-time tooling; Tailwind, runtime CSS-in-JS and extracted CSS-in-JS are alternatives. No combination is universally best. Choose based on existing ownership, SSR/streaming integration, bundle/runtime cost, team familiarity and migration constraints; verify the installed library version. A component library still requires interaction/accessibility testing.

The following hybrid example illustrates an alternative; it is not an additional mastery requirement.

### 🧩 Typical modern setup (React + Vite)

* **Tailwind CSS** → for spacing, layout, colors, responsive utilities
* **CSS Modules** or **Vanilla Extract** → for component-level styling logic
* **Radix UI / Headless UI** → for accessible base components (modals, dropdowns)
* **Framer Motion** → for animations

The primary worked Card uses CSS Modules alone; the alternative stack above is not needed to run it.

```tsx
// Card.tsx
import { useId, type ReactNode } from 'react';
import styles from './Card.module.css';
export type CardProps = Readonly<{ title: string; children: ReactNode }>;
export function Card({ title, children }: CardProps) {
  const heading = useId();
  return <section className={styles.card} aria-labelledby={heading}>
    <h2 id={heading}>{title}</h2>{children}
  </section>;
}
```

```css
/* Card.module.css */
.card { background: var(--surface); color: var(--text); padding: 1rem; border-radius: .75rem; }
.card > h2 { margin-block-start: 0; }
```

The build must provide CSS Modules and matching declarations/class maps. This isolated compiler fixture uses the actual class key and allowArbitraryExtensions; generated per-file declarations are preferable to silently accepting every misspelled class. Deliver the emitted stylesheet too—an imported mapping alone does not paint a styled component.

```ts
// Card.module.d.css.ts — paired with Card.module.css in this type fixture
declare const styles: { readonly card: string };
export default styles;
```

A Vite application can use its configured CSS declaration mechanism; do not replace working template configuration with this standalone fixture by default.

---

## Semantic tokens and runtime theme ownership

Primitive tokens name raw choices; semantic tokens name purpose; component tokens expose a deliberately limited extension point. Avoid scattering raw brand colors through components. A global theme owner defines shared purpose values; components consume them rather than redefining application policy.

```css
/* global tokens.css */
:root {
  color-scheme: light;
  --color-ink-900: #17212f;
  --surface: #ffffff;
  --text: var(--color-ink-900);
  --action-bg: #173d70;
  --action-text: #ffffff;
  --focus-ring: #a83500;
}
:root[data-theme="dark"] {
  color-scheme: dark;
  --surface: #17212f;
  --text: #f5f7fa;
  --action-bg: #b7d3ff;
  --action-text: #102442;
  --focus-ring: #ffca80;
}
body { background: var(--surface); color: var(--text); }
/* Button.module.css */
.button {
  background: var(--button-bg, var(--action-bg));
  color: var(--action-text);
  border: 2px solid transparent;
}
.button:focus-visible { outline: 3px solid var(--focus-ring); outline-offset: 3px; }
@media (forced-colors: active) {
  .button { border-color: ButtonText; }
  .button:focus-visible { outline-color: Highlight; }
}
```

Unregistered custom properties inherit and participate in the runtime cascade; Sass variables are substituted during compilation. Theme attributes therefore affect descendants without generating new CSS. Define semantic aliases at the scope where their primitive values are chosen: a root alias resolves there, so overriding only a primitive on a descendant need not recompute an inherited alias. Override the semantic token at that scope when required.

`var(--x, fallback)` handles an absent/invalid custom-property value, not arbitrary type errors after substitution. With `--x:20px; color:var(--x, red)`, the defined token is substituted and the color becomes invalid at computed-value time; red is not selected. The property falls back according to invalid-computed-value rules, often inheritance/initial, rather than reviving a prior declaration. Cycles are invalid. `@property` can add syntax/initial/inheritance constraints where supported; weigh that contract against simpler unregistered tokens.

Theme policy has three preferences: explicit light, explicit dark and system. A small client owner can map system preference to the same root attribute, listen for system changes only while in system mode and remove listeners on disposal. If persisting preference, validate the stored allowlisted value and handle unavailable storage. For SSR, choose a compatible initial server/client policy and deliberate early-theme strategy to avoid a flash or hydration mismatch; do not read window during server render. A theme switch must have an accessible name and communicate its state. React Context is useful for application preference state, but CSS inheritance handles the colors themselves.

**Trade-offs:** global semantic tokens make themes cheap and consistent but form an API requiring ownership/versioning. Component overrides enable embedding but can break paired foreground/background contrast; expose pairs or constrain overrides. CSS Modules scope class names, not inheritance or all selectors. Static extraction reduces runtime style generation; runtime CSS-in-JS can offer dynamic composition with additional integration and performance obligations. Measure the actual product.

**Exercise:** build one theme owner and a reusable Button/Card pair using the primary CSS Modules stack. Acceptance: light/dark/system changes affect all intended roots; nested scopes override semantic tokens correctly; missing-token and wrong-type cases are explained with computed styles; normal/hover/pressed/focus/error colors are measured; text meets applicable4.5:1 (3:1 for qualifying large text) and required UI indicators3:1; meaning is not color alone; forced colors and keyboard focus remain usable. Inactive controls have WCAG contrast exceptions, but usability still matters. Test SSR first paint if SSR is in scope; record browser/version and evidence rather than asserting compliance from palette values.

Official references checked2026-10-20: [custom properties](https://www.w3.org/TR/css-variables-1/), [color adjustment](https://www.w3.org/TR/css-color-adjust-1/), [WCAG2.2](https://www.w3.org/TR/WCAG22/). No theme/contrast browser run has been performed for this material.


## Server and first client theme agreement

Use a server-known allowlisted initial theme, independent of whether preference later follows the system. This small helper defaults unknown/system values to light for the first render; a later system-preference owner may update it deliberately.

```ts
// initial-theme.ts
export type InitialTheme = 'light' | 'dark';
export function initialTheme(value: unknown): InitialTheme {
  return value === 'dark' ? 'dark' : 'light';
}
```

The server renders Card with a known root html data-theme attribute and serializes the same light/dark value into a nonsecret data-initial-theme attribute on its application host. The client validates that attribute with initialTheme and applies the same root theme before hydrateRoot. Keep Card props, useId identifierPrefix, emitted CSS-module mapping and asset revision identical between server and first client render. Do not guess theme from window/matchMedia during server rendering or use suppressHydrationWarning to hide an avoidable data mismatch. A nonce/hash-based early-theme script, if chosen, must satisfy the deployed CSP; adding unsafe-inline to silence a violation is not the design goal.

**Worked check:** render the exact Card to HTML with its title/child content, install that markup in a host, hydrate the same tree and record recoverable errors. It should retain the section/heading identity and usable content. This checks a controlled hydration contract; it does not prove the production stylesheet is loaded before first paint or that theme contrast/flash is acceptable. Unknown preference fallback and post-hydration system changes need a product policy.

**Acceptance:** strict-typecheck required title/children, render escaped title text and matching IDs, hydrate without recoverable mismatch using one matching artifact and initial theme. Then verify actual CSS delivery, nested themes, system changes, CSP and first paint/contrast/focus in a native browser. The DOM/SSR fixture and Sass/CSS compilation are separate from those unperformed browser/deployment results. Learner implementation remains required.

Official reference checked 2026-10-22: [hydrateRoot matching output and identifierPrefix](https://react.dev/reference/react-dom/client/hydrateRoot), [CSS Modules class contract](https://github.com/css-modules/css-modules).
