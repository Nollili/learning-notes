# Practice: What "Strict NULL check mode" means?

**Status: outstanding learner practice.** Author checks do not complete these requirements.

Prerequisite: study the [worked lesson](../../../senior_growth/TypeScript/What_%22Strict_NULL_check_mode%22_means.md) and its linked foundations. Apply these focused cases to [P-328/P-329/P-330](../../frontend-project.md); retain only the cases relevant to the chosen increment.

## Scope and observable criteria

**Exercise:** implement a profile PATCH function with absent/clear/replace cases and an empty-array lookup. Acceptance: strict typecheck passes; a present undefined key is rejected at compile time; omission leaves the field unchanged; null clears it; empty text follows an explicit domain rule; zero/false are not accidentally replaced. Run the runtime cases as well as compile-time cases. Practice remains required.

## Evidence

Record source revision, runtime/browser versions, expected versus observed result, one reproduced failure, correction and retest. Include exact commands or input sequence and artifacts. Mark unperformed keyboard, screen-reader, zoom, device and integration checks explicitly. Never record a supplied example as your completed practice.
