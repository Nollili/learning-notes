# F05 — React state, effects and component identity

**Learner status: outstanding.**

## Prerequisites

F01–F04; React rendering/state/effects. Reuse P-328/P-329, including the existing controlled race schedules.

## Scope

Implement the same catalogue with stable row IDs, an editable draft, derived results and a bounded fetch Effect. Add the controlled tabs or narrow Button contract only after the native screen works.

## Observable acceptance

A dirty row stays attached to its entity through reorder. Replacement versus updater queues produce the predicted state. Superseded/unmounted work cannot commit. StrictMode setup/cleanup leaves one live subscription and zero after removal. Forms retain input on failure and distinguish unknown write outcome.

## Failure cases

Index/random keys, missing dependencies, stale callback, ignored abort, server conflict, contradictory controlled/default props, pending duplicate activation and removed focus target. Error boundaries do not replace async handler error handling.

## Evidence to record

Retain failing/corrected browser or DOM tests and keyboard observations. Profile one measured problem using the same workload before/after; no speed claim from render logs alone. Test production build as well as StrictMode. Screen-reader/zoom/device results remain separately required.

Return to [the sequence](./index.md) and [original P-328–P-330 specification](../frontend-project.md). Author verification never completes this stage.
