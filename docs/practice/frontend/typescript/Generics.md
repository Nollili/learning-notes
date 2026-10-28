# Practice: What are generics in TS?

**Status: outstanding learner practice.** Author checks do not complete these requirements.

Prerequisite: study the [worked lesson](../../../senior_growth/TypeScript/Generics.md) and its linked foundations. Apply these focused cases to [P-328/P-329/P-330](../../frontend-project.md); retain only the cases relevant to the chosen increment.

## Scope and observable criteria

**Exercise — typed configuration and events:** implement a keyed getter and a typed event contract; derive a public update type, mapped dirty flags and inferred callback argument tuple. Acceptance: wrong keys/payloads and narrow unsafe callbacks fail with @ts-expect-error; selected values retain the exact return type; mixed-array distribution behaves as above; demonstrate one overload ambiguity and simplify it; runtime parser rejects malformed input. Compare API readability before adopting advanced transformations.

**Acceptance drill:** typecheck all positive and @ts-expect-error cases; removing a directive must expose the intended diagnostic. Add a third event and ensure the mapped handler table requires it. Run applyPatch with empty patch, false, changed title and a variable containing unrelated fields; assert projected keys and unchanged input. Build a parser for the real external patch separately and reject unknown keys/invalid fields. Explain optional absence versus an explicitly nullable field before designing deletion semantics.

**Acceptance:** run the positive/negative fixture with strict/noUncheckedIndexedAccess/exactOptionalPropertyTypes; call the exported getter separately at runtime and confirm attempts0 and absent nicknameundefined. Remove each directive to expose the expected diagnostic. Explain why Object.keys returns external runtime strings rather than proving every key of a structural object type, and avoid a blanket assertion that bypasses validation. The getter performs no JSON parsing, ownership checks or runtime key allowlisting. Prefer direct property access when abstraction adds no useful relationship.

## Evidence

Record source revision, runtime/browser versions, expected versus observed result, one reproduced failure, correction and retest. Include exact commands or input sequence and artifacts. Mark unperformed keyboard, screen-reader, zoom, device and integration checks explicitly. Never record a supplied example as your completed practice.
