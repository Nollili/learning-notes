# Practice: Composition vs inheritance? Shared state vs immutability?

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/Coding_principles_patterns_conventions/Composition_vs_inheritance_Shared_state_vs_immutability.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Exercise acceptance:** reproduce the race with a controlled gate, repair it without timing sleeps, and explain why the repair does not synchronize two servers. Add a nested alias failure and a structural-sharing update; demonstrate the original remains unchanged. Record memory/behavior trade-offs before introducing a clone or state library. Learner practice remains required. References: [React queued state updates](https://react.dev/learn/queueing-a-series-of-state-updates), [ECMAScript Object.freeze](https://tc39.es/ecma262/multipage/fundamental-objects.html#sec-object.freeze).

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
