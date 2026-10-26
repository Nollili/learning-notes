#  **PropTypes vs TypeScript**

### 1️⃣ **PropTypes — legacy React integration**

Version scope: React 19+ removes automatic `propTypes` checks; checked against the official upgrade guide on 2026-10-20. The example below documents React 18 and earlier behavior, not a validation strategy for React 19.

* **Runtime type checking** for props in React components.
* `prop-types` is a separate package. Older React versions invoked component validators in development; React 19 silently ignores component `propTypes`.
* Useful when maintaining an older JS codebase; do not introduce it as automatic React 19 runtime enforcement.

**Example:**

```jsx
import PropTypes from 'prop-types';

function Button({ label, onClick }) {
  return <button onClick={onClick}>{label}</button>;
}

Button.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};
```

✅ **Pros:**

* Simple for JS projects
* Warned in development when integrated with older React; warnings did not reject invalid input.

❌ **Cons:**

* Only runtime checking → errors appear during execution, not compile-time
* Less powerful than TypeScript (no interfaces, enums, generics)

---

### 2️⃣ **TypeScript**

* **Compile-time type checking** using interfaces/types.
* Catches type errors **before runtime**, during development.
* Works for props, state, hooks, and the whole codebase.

**Example:**

```tsx
type ButtonProps = {
  label: string;
  onClick?: () => void;
};

function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}
```

✅ **Pros:**

* Compile-time safety → fewer runtime bugs
* Works everywhere: props, state, context, hooks, API responses
* Supports advanced typing: unions, generics, mapped types

❌ **Cons:**

* Learning curve if team is new to TS
* Initial setup takes slightly longer than JS

---

### 🧩 **Primary choice for these notes: TypeScript + runtime boundary parsing**

> Use TypeScript for checked component contracts, and parse external values at entry points. This is a project choice, not a requirement for every React application.
> PropTypes may still appear in legacy JS projects, but TypeScript provides stronger guarantees, better IDE support, and safer refactoring.

---

### 🗣️ **Interview-ready 30-second answer**

> “I use TypeScript for checked props and runtime schemas for external data. Legacy React invoked PropTypes in development, but React 19 removed those checks. Neither static declarations nor development warnings replace input validation or authorization.”

---


| Feature                | PropTypes                       | TypeScript                                         |
| ---------------------- | ------------------------------- | -------------------------------------------------- |
| **Type checking**      | Legacy development warnings                         | Compile-time                                       |
| **When errors appear** | During app execution (dev mode) | During development / build                         |
| **Scope**              | Only component props            | Props, state, context, hooks, entire codebase      |
| **Syntax**             | JS, simple                      | Requires TS setup, types/interfaces                |
| **Advanced typing**    | Limited                         | Full TypeScript features (unions, generics, enums) |
| **Tooling support**    | Basic (warnings in console)     | IDE autocomplete, refactoring, intellisense        |
| **Best for**           | Legacy JS React projects        | Modern React projects, enterprise apps             |
| **Performance**        | Legacy development validation   | Erased annotations; emitted JS features may have cost                                    |


## Migration decisions, failures, and exercise

For an internal component, use typed props and run a separate typecheck in CI. For untrusted configuration or network values, parse first, then pass the parsed result to the component. Do not validate repeatedly on every render unless changing external input actually requires it. Type assertions and `any` can bypass the checks.

JavaScript-only consumers of a component package need published declarations for editor help and, where the boundary warrants it, explicit runtime validation. Removing `propTypes` is not permission to remove domain validation. A reusable component can use default parameters for optional function props; explicit `null` does not trigger a default.

**Exercise:** migrate the legacy button above to the typed version and add a boundary parser for `{label: unknown}`. Acceptance: invalid label never reaches render; omitted onClick is supported; typed incorrect calls fail; production behavior does not depend on a console warning. Retain separate typecheck and runtime-test evidence. Learner implementation remains required.

[Official React 19 migration guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#removed-proptypes-and-defaultprops-for-functions).

For the mapped-type capability mentioned above, work through [mapped/modifier transformations and the applied patch/handler contract](./Generics.md#applied-public-contracts-exact-patches-and-contextual-callbacks). It demonstrates -readonly/-?, optional dirty flags, safe utility composition and public callback typing; these static transformations do not replace the runtime boundary parser in this lesson.

## An actual runtime label boundary

```tsx
// safe-button.tsx
export type ButtonProps = Readonly<{ label: string; onClick?: () => void }>;
export function parseButtonLabel(value: unknown): Pick<ButtonProps, 'label'> {
  if (typeof value !== 'object' || value === null || Array.isArray(value) ||
      !('label' in value) || typeof value.label !== 'string' ||
      !value.label.trim() || value.label.length > 80) throw new TypeError('Invalid button label');
  return { label: value.label.trim() };
}
export function ParsedButton({ label, onClick }: ButtonProps) {
  return <button type="button" onClick={onClick}>{label}</button>;
}
```

Parse JSON-style configuration once at the boundary; the projected result retains only a bounded nonblank label. Callbacks come from trusted application code, never JSON. Treat an invalid configuration as a controlled load/error state rather than pass it into rendering or fabricate success. Bound body size before parsing JSON and handle syntax errors separately; this helper does not authorize an action or sanitize arbitrary objects with hostile getters/proxies. React text rendering escapes the label; do not reinterpret it through dangerouslySetInnerHTML.

**Acceptance:** accept/trim a valid label; reject null, arrays, missing/nonstring/blank/over80code-unit values; prove unrelated secrets are omitted. Render a label containing angle brackets and inspect escaped text, invoke an owned click callback, and support omitted onClick. Add a rejected typed call and show malformed unknown input fails at runtime in React19 without relying on PropTypes warnings. Keep checker, parser, React behavior and native accessibility evidence separate; learner practice remains required.
