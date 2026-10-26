# Design Systems: Component Contracts and Token Outputs

## Why a component API is a product boundary

A design system combines reusable implementation, interaction rules, design decisions and ownership. A shared Button reduces duplication only when consumers can predict its behavior. Treat props, ref target, keyboard behavior, focus appearance, supported CSS hooks and exported types as compatibility contracts. Internal markup/class names remain private unless explicitly documented.

Primary stack: React 19, TypeScript, CSS Modules and semantic CSS custom properties. Examples assume React 19 typings (a function component can receive `ref` as a prop); React 18 libraries need a separately supported `forwardRef` implementation. Native buttons retain browser semantics instead of recreating activation with a clickable div.

## A deliberately narrow Button

```tsx
// Button.tsx
import type { ComponentPropsWithRef } from 'react';
import styles from './Button.module.css';

export type ButtonProps = Omit<ComponentPropsWithRef<'button'>, 'children'> & {
  children: string;
  variant?: 'primary' | 'secondary';
};
export function Button({ children, variant = 'primary', type = 'button',
  className, ref, ...native }: ButtonProps) {
  return <button {...native} ref={ref} type={type}
    className={[styles.button, styles[variant], className].filter(Boolean).join(' ')}>
    {children}
  </button>;
}
```

```css
/* Button.module.css */
.button { font: inherit; padding: .5rem 1rem; border: 2px solid currentColor; }
.primary { background: var(--action-bg); color: var(--action-text); }
.secondary { background: var(--surface); color: var(--text); }
.button:focus-visible { outline: 3px solid var(--focus-ring); outline-offset: 3px; }
.button:disabled { cursor: not-allowed; }
@media (forced-colors: active) {
  .button { border-color: ButtonText; }
  .button:focus-visible { outline-color: Highlight; }
}
```

Text children make the visible-label contract simple; icon-only controls require a separate reviewed component with a required accessible name. TypeScript cannot ensure a nonempty meaningful string or stop JavaScript callers passing unsupported values. Validate runtime inputs at external boundaries; these internal props assume trusted application code. Do not allow remote JSON to supply arbitrary native props.

`type="button"` avoids accidental submission inside forms. Consumers opt into `type="submit"`; `disabled` uses native semantics and removes the button from sequential focus. If an operation must remain discoverable/focusable, design an explicit `aria-disabled` variant with event suppression and explanation; `aria-disabled` alone does not block clicks. This example deliberately does not implement that second contract. Pending state and durable duplicate-write prevention belong to the form/server workflow, not a CSS spinner.

The ref points to the actual button for focus restoration. Native handlers/ARIA/data attributes pass through; supplied classes augment internal classes. Allowing `className`/`style` permits customization but does not guarantee every override remains accessible. Publish supported token overrides and state which internals consumers must not target. A generic `as` prop can change native semantics and ref typing; prefer separate Link and Button APIs until a demonstrated use case justifies polymorphism. Use composition for content regions; use a headless primitive when its tested interaction model fits, while still verifying the integration.

## State and extension decisions

| Contract | Decision and failure to test |
|---|---|
| Button | Stateless activation; consumer owns business state; Enter/Space use native behavior |
| Text input | Controlled `value` + change callback **or** uncontrolled `defaultValue`; never switch modes mid-lifetime |
| Disclosure | Parent-owned `open` + `onOpenChange`, or internal initial `defaultOpen`; document who commits changes |
| Compound tabs | Shared state/context may coordinate parts, but enforce roles, IDs, focus order and keyboard behavior |
| HOC | Preserve consumer prop/ref requirements; avoid swallowing handlers or repeatedly creating wrapper types during render |
| Slot | Define allowed element/props and event composition order; never silently replace consumer focus/handlers |

Controlled means the parent is authoritative, not that the child both stores a duplicate value and overwrites it in an effect. Uncontrolled defaults apply at initialization; later default changes are not a reset protocol. Choose an explicit reset API/remount policy. For an expandable API, reject contradictory props with a discriminated union and document JavaScript runtime behavior. Reuse the [form ownership examples](./complex-forms-and-data.md) and [composition patterns](./Composition_and_Higher-Order_Components_%28HOCs%29_in.md).

## Tokens: source, transformation and ownership

Use three levels: primitive (`blue.700`), semantic (`action.background`) and component (`button.background`, only when an independent extension point is needed). Component tokens should not mirror every CSS declaration. The [theme lesson](../CSS/styling_react_apps.md) explains runtime inheritance, nested alias scope, system preference, contrast and SSR first paint.

The following **application-specific teaching schema is not DTCG JSON**. It keeps a small deterministic generator executable without a token toolchain. For interoperability, adopt DTCG Format 2025.10 and a validating transformer; do not label arbitrary JSON compliant. That publication is a Community Group report, not a W3C Recommendation.

```js
// tokens.mjs — build-time input, never populated from untrusted requests
export const palette = Object.freeze({
  white: '#ffffff', ink: '#17212f', blue: '#173d70', paleBlue: '#b7d3ff',
  paleInk: '#f5f7fa', deepBlue: '#102442', orange: '#a83500', yellow: '#ffca80'
});
export const themes = {
  light: { surface: 'white', text: 'ink', 'action-bg': 'blue',
    'action-text': 'white', 'focus-ring': 'orange' },
  dark: { surface: 'ink', text: 'paleInk', 'action-bg': 'paleBlue',
    'action-text': 'deepBlue', 'focus-ring': 'yellow' }
};
export function buildTokens(palette, themes) {
  const names = ['surface', 'text', 'action-bg', 'action-text', 'focus-ring'];
  const output = {};
  for (const mode of ['light', 'dark']) {
    const source = themes[mode];
    if (!source || Object.keys(source).length !== names.length)
      throw new Error(`Invalid theme ${mode}`);
    output[mode] = Object.fromEntries(names.map(name => {
      const alias = source[name];
      if (!Object.hasOwn(palette, alias)) throw new Error(`Unknown token ${name}`);
      const color = palette[alias];
      if (!/^#[0-9a-f]{6}$/i.test(color)) throw new Error(`Invalid color ${name}`);
      return [name, color];
    }));
  }
  const css = Object.entries(output).map(([mode, values]) =>
    `:root[data-theme="${mode}"] {\n` +
    Object.entries(values).map(([name, value]) => `  --${name}: ${value};`).join('\n') +
    '\n}').join('\n');
  // Generated TS retains literal theme/token keys for consumers.
  const ts = `export const colors = ${JSON.stringify(output, null, 2)} as const;\n`;
  return { css, ts };
}
```

The generator accepts exactly five semantic keys in each theme, resolves one-level aliases and fails on missing/invalid values. It does not support recursive aliases, token groups or arbitrary units; a full transformer must detect cycles and validate type compatibility. CSS requires a deliberate initial theme attribute; until initialization, use the fallback root tokens in the theme lesson. Generated TS values are useful for canvas/chart integrations; they do not automatically update when a DOM theme attribute changes—select the active theme explicitly.

For native platforms, emit their supported color representation and dynamic-theme selection instead of sending CSS `var()` expressions. Spacing units require a documented platform conversion; browser `rem`, iOS points and Android dp are not interchangeable strings. A generator should reject unsupported transforms, not silently strip suffixes. Publish source and generated artifacts from the same revision; CI regenerates and rejects unexpected differences.

Design owns semantic intent and approved pairings; engineering owns schema/transforms and runtime integration; accessibility review verifies state pairings; named maintainers approve token removals. Document which tokens are public. An alias rename/removal can break consumer CSS even when TypeScript still compiles. Theme changes require reviewed contrast and focus checks in every supported state, not just identical token key sets.

## Contract lab and acceptance evidence

Build Button in a small consumer form and toolbar. Add a controlled/uncontrolled disclosure API with mutually exclusive props and an explicit reset decision. Acceptance: type fixtures reject unsupported variants and contradictory state props; native submit/default-button behavior is observed; keyboard activation fires once; disabled blocks activation; ref focus works; custom class/native handler survive; server/client initial theme agrees. Try long translated text, 200% text zoom, forced colors and both themes. Do not infer those results from source inspection.

Run the generator twice and compare byte-identical output. Delete one key, add an unknown alias and inject an invalid color: each must fail. Compile generated TS and consume a token from a chart fixture. Review every foreground/background/focus pairing with measured evidence and record browser/version. Learner implementation and browser evidence remain required.

References checked 2026-10-21: [React DOM common props](https://react.dev/reference/react-dom/components/common), [React refs](https://react.dev/learn/manipulating-the-dom-with-refs), [DTCG Format 2025.10](https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/), [WCAG 2.2](https://www.w3.org/TR/WCAG22/).
