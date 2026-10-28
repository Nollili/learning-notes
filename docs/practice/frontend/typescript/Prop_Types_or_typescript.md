# Practice: PropTypes vs TypeScript

**Status: outstanding learner practice.** Author checks do not complete these requirements.

Prerequisite: study the [worked lesson](../../../senior_growth/TypeScript/Prop_Types_or_typescript.md) and its linked foundations. Apply these focused cases to [P-328/P-329/P-330](../../frontend-project.md); retain only the cases relevant to the chosen increment.

## Scope and observable criteria

**Exercise:** migrate the legacy button above to the typed version and add a boundary parser for `{label: unknown}`. Acceptance: invalid label never reaches render; omitted onClick is supported; typed incorrect calls fail; production behavior does not depend on a console warning. Retain separate typecheck and runtime-test evidence. Learner implementation remains required.

**Acceptance:** accept/trim a valid label; reject null, arrays, missing/nonstring/blank/over80code-unit values; prove unrelated secrets are omitted. Render a label containing angle brackets and inspect escaped text, invoke an owned click callback, and support omitted onClick. Add a rejected typed call and show malformed unknown input fails at runtime in React19 without relying on PropTypes warnings. Keep checker, parser, React behavior and native accessibility evidence separate; learner practice remains required.

## Evidence

Record source revision, runtime/browser versions, expected versus observed result, one reproduced failure, correction and retest. Include exact commands or input sequence and artifacts. Mark unperformed keyboard, screen-reader, zoom, device and integration checks explicitly. Never record a supplied example as your completed practice.
