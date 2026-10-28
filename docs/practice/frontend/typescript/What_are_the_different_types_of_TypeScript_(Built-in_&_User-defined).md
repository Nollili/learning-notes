# Practice: What are the different types of TypeScript (Built-in & User-defined)?

**Status: outstanding learner practice.** Author checks do not complete these requirements.

Prerequisite: study the [worked lesson](../../../senior_growth/TypeScript/What_are_the_different_types_of_TypeScript_%28Built-in_%26_User-defined%29.md) and its linked foundations. Apply these focused cases to [P-328/P-329/P-330](../../frontend-project.md); retain only the cases relevant to the chosen increment.

## Scope and observable criteria

**Exercise:** design a user DTO, unknown-input parser and readonly view. Acceptance: fresh literal typo rejected; variable with extra properties is structurally compatible but DTO projection removes them; unknown cannot be used before parsing; Error-only guard cannot authorize errno access; demonstrate nested and aliased mutation; retain positive and @ts-expect-error negative type cases. Use discriminated states from the never lesson for loading/error/success UI.

**Acceptance:** execute the shallow/alias cases and inspect Object.isFrozen on the outer and nested objects; show that as const does not call Object.freeze. Explain which references a shallow spread shares. For an actual state update, create a new outer and changed nested object while preserving untouched references, then verify both old data and equality behavior. Record typecheck and runtime evidence separately; learner practice remains required.

**Acceptance:** typecheck those exact positive/negative cases with strict/noUncheckedIndexedAccess/exactOptionalPropertyTypes. Show that an invalid key and explicit undefined patch fail, a false patch value is preserved, an untouched input remains unchanged and unrelated runtime fields are omitted from output. Explain one conditional-distribution choice and prefer the simplest readable public API. This is the advanced follow-through for the utility-type list above; learner implementation remains required.

## Evidence

Record source revision, runtime/browser versions, expected versus observed result, one reproduced failure, correction and retest. Include exact commands or input sequence and artifacts. Mark unperformed keyboard, screen-reader, zoom, device and integration checks explicitly. Never record a supplied example as your completed practice.
