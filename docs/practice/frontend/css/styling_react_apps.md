# Practice: Styling React applications

**Status: outstanding learner practice.** Author checks do not complete these requirements.

Prerequisite: study the [worked lesson](../../../senior_growth/CSS/styling_react_apps.md) and its linked foundations. Apply these focused cases to [P-328/P-329/P-330](../../frontend-project.md); retain only the cases relevant to the chosen increment.

## Scope and observable criteria

**Exercise:** build one theme owner and a reusable Button/Card pair using the primary CSS Modules stack. Acceptance: light/dark/system changes affect all intended roots; nested scopes override semantic tokens correctly; missing-token and wrong-type cases are explained with computed styles; normal/hover/pressed/focus/error colors are measured; text meets applicable4.5:1 (3:1 for qualifying large text) and required UI indicators3:1; meaning is not color alone; forced colors and keyboard focus remain usable. Inactive controls have WCAG contrast exceptions, but usability still matters. Test SSR first paint if SSR is in scope; record browser/version and evidence rather than asserting compliance from palette values.

**Acceptance:** strict-typecheck required title/children, render escaped title text and matching IDs, hydrate without recoverable mismatch using one matching artifact and initial theme. Then verify actual CSS delivery, nested themes, system changes, CSP and first paint/contrast/focus in a native browser. The DOM/SSR fixture and Sass/CSS compilation are separate from those unperformed browser/deployment results. Learner implementation remains required.

## Evidence

Record source revision, runtime/browser versions, expected versus observed result, one reproduced failure, correction and retest. Include exact commands or input sequence and artifacts. Mark unperformed keyboard, screen-reader, zoom, device and integration checks explicitly. Never record a supplied example as your completed practice.
