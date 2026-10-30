# Practice: When to Use (or Not Use) a Centralized Store {#practice-%E2%9A%96%EF%B8%8F-when-to-use-or-not-use-a-centralized-store}

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/State_management_and_Redux/When_should_we_use-not_use_centralized_stores.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Acceptance:** with the actual QueryClient/QueryObserver, show one persist call, monotonic detail updates, active detail/list refetch, inactive-list staleness, unaffected other-user scope and failed-mutation reconciliation. Run the pure A/B pending-overlay cases from the shared lesson; never restore a stale whole-cache snapshot. API/database, browser and learner implementation remain required. Checked baseline: TanStack Query5.104.5, TypeScript5.9.3/Node24.18.0.

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
