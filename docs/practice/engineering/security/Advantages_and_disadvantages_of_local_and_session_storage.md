# Practice: 🗄️ LocalStorage vs SessionStorage — Advantages and Disadvantages

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/Communication_and_Security/Advantages_and_disadvantages_of_local_and_session_storage.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Exercise acceptance:** integrate this codec with the [worked multistep wizard](../../../senior_growth/React/complex-forms-and-data.md), test blank/partial values, v1 migration, v2 round-trip, malformed/future/oversized payloads, expiry boundary, other-user data, disabled/quota storage, restored version conflicts, two tabs and save-response ambiguity. Show Restore/Discard/recovery failure UI and associated validation errors; no token/private fields persisted. Native/browser/session-restoration behavior needs actual platform tests; a pure codec test does not prove end-to-end recovery.

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.


## Additional observable requirements

**Acceptance:** exercise access denial, quota failure, malformed/future formats, migration, cached partial drafts and two-tab conflicts while preserving in-memory editing. Native quota/eviction/session restoration and cross-tab behavior remain unperformed until tested in the selected browsers. Neither shorter storage lifetime nor later clearing creates an XSS or authorization boundary.

Record actual versions, expected/observed behavior, failure→fix→retest and unperformed native/service/deployment checks.
