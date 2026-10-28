# F03 — Closures, races and cleanup

**Learner status: outstanding.**

## Prerequisites

F01; execution, lexical scope, identity, promises and browser event propagation. Reuse P-329.

## Scope

Connect search through a controlled deferred adapter. Define event-time versus current selection semantics; give each route/search one disposable owner.

## Observable acceptance

Request A then B; resolve B then A: B remains visible. Repeat with an abort-ignoring adapter and a late rejection. Every promise rejection is observed; after dispose no result/status commits; timers/listeners/controllers are released. Pure transforms leave prior data unchanged.

## Failure cases

Reject after replacement, dispose twice, reject during body read, invalid DTO, timeout and account-scope change. A timeout does not prove a remote write was rolled back.

## Evidence to record

Retain exact schedules, assertions and listener/timer ownership evidence. Predict microtask/task order before running. Demonstrate a removed generation guard failing, then restore it. Link shared Node/CS concepts instead of duplicating implementations.

Return to [the sequence](./index.md) and [original P-328–P-330 specification](../frontend-project.md). Author verification never completes this stage.
