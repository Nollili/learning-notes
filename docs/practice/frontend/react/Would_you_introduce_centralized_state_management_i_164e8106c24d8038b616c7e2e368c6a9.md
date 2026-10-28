# Practice: Would you introduce centralized state management in a React project which does not have it, and how?

**Status: outstanding learner practice.** Author checks do not complete these requirements.

Prerequisite: study the [worked lesson](../../../senior_growth/React/Would_you_introduce_centralized_state_management_i_164e8106c24d8038b616c7e2e368c6a9.md) and its linked foundations. Apply these focused cases to [P-328/P-329/P-330](../../frontend-project.md); retain only the cases relevant to the chosen increment.

## Scope and observable criteria

**Acceptance:** verify the current named export in a pinned scratch app; a setUser action updates selected user while the action reference remains stable; unrelated state changes do not change selected primitives. Test independent store instances before adopting SSR. Start with one feature and compare before/after render traces, race behavior and ownership, rather than migrate every local state variable. The [versioned safe preference adapter](../../../senior_growth/React/React_state_management_and_tools.md#versioned-persistence-is-a-boundary-not-a-dump-of-the-store) supplies storage validation/migration/disposal; do not persist a full store. Learner browser/profile measurements remain required.

## Evidence

Record source revision, runtime/browser versions, expected versus observed result, one reproduced failure, correction and retest. Include exact commands or input sequence and artifacts. Mark unperformed keyboard, screen-reader, zoom, device and integration checks explicitly. Never record a supplied example as your completed practice.
