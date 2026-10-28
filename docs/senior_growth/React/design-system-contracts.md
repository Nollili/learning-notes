# Design Systems: Component Contracts and Token Outputs

## Why a component API is a product boundary

A design system combines reusable implementation, interaction rules, design decisions and ownership. A shared Button reduces duplication only when consumers can predict its behavior. Treat props, ref target, keyboard behavior, focus appearance, supported CSS hooks and exported types as compatibility contracts. Internal markup/class names remain private unless explicitly documented.

Primary stack: React 19, TypeScript, CSS Modules and semantic CSS custom properties. Examples assume React 19 typings (a function component can receive `ref` as a prop); React 18 libraries need a separately supported `forwardRef` implementation. Native buttons retain browser semantics instead of recreating activation with a clickable div.

## A deliberately narrow Button

<<< ../../workbench/frontend/react/design-system/Button.tsx{tsx}

<<< ../../workbench/frontend/react/design-system/Button.module.css{css}

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

<<< ../../workbench/frontend/react/design-system/tokens.mjs{js}

The generator accepts exactly five semantic keys in each theme, resolves one-level aliases and fails on missing/invalid values. It does not support recursive aliases, token groups or arbitrary units; a full transformer must detect cycles and validate type compatibility. CSS requires a deliberate initial theme attribute; until initialization, use the fallback root tokens in the theme lesson. Generated TS values are useful for canvas/chart integrations; they do not automatically update when a DOM theme attribute changes—select the active theme explicitly.

For native platforms, emit their supported color representation and dynamic-theme selection instead of sending CSS `var()` expressions. Spacing units require a documented platform conversion; browser `rem`, iOS points and Android dp are not interchangeable strings. A generator should reject unsupported transforms, not silently strip suffixes. Publish source and generated artifacts from the same revision; CI regenerates and rejects unexpected differences.

Design owns semantic intent and approved pairings; engineering owns schema/transforms and runtime integration; accessibility review verifies state pairings; named maintainers approve token removals. Document which tokens are public. An alias rename/removal can break consumer CSS even when TypeScript still compiles. Theme changes require reviewed contrast and focus checks in every supported state, not just identical token key sets.

## Contract lab and acceptance evidence

Use the [separate practice requirements and observation ledger](../../practice/frontend/react/design-system-contracts.md). All learner work remains outstanding.

