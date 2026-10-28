# Practice: What is a Memory Leak? Real-World Examples & Detection

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/Web_Performance/What_is_the_memory_leak._Any_real_world_example_How_would_you_find_memory_leaks.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Exercise:** run the fixture with and without disposal for repeated cycles, plus the collectible isolated node/listener case. Acceptance: identify a real root path, show registration count returns to baseline after disposal, compare retained objects after equivalent settling/collection observations, and document remaining owners. Also test aborted/failed/slow requests for handled errors and stale-state suppression. No forced-GC timing or browser snapshot result is claimed by the notes.

**Acceptance drill:** use deferred promises to resolve routeA after routeB and verify A cannot replace B. Make an adapter ignore its signal; after cleanup resolve its account and assert its projects call never starts. Repeat with old projects already pending; reject after unmount and confirm no unhandled rejection. Test current failure, malformed/mismatched account, duplicate/invalid projects, empty success, deadline and late success after deadline. Under StrictMode expect setup→cleanup→setup in development and show the discarded setup cannot commit. Change tenant and session revision as well as account, and verify ready data disappears immediately. Finally use a real browser/network adapter for navigation, focus policy, actual abort/response-body limits and heap observations. Typechecking/RTL simulated-DOM ownership tests do not establish those results or learner practice.

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
