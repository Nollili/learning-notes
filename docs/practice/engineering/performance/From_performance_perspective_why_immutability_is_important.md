# Practice: From a performance perspective, why is immutability important?

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/Web_Performance/From_performance_perspective_why_immutability_is_important.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Exercise:** implement rename plus an independent settings change and a delayed A/B search fixture. Acceptance: untouched branches preserve identity; previous snapshots remain unchanged; no-op returns original state; the newest search wins under reversed response order; stale callbacks/dependency errors are explained; profiling compares actual calculation/component cost rather than merely rerender counts. Retain learner implementation/evidence separately. Runtime validation uses a separate scratch environment; this note does not add dependencies to the project.

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
