# Practice: next-app-router

**Status: outstanding learner practice.**

Prerequisite: [the worked lesson](../../../senior_growth/React/next-app-router.md) and [the staged sequence](../index.md).


## Practical implementation and debugging acceptance

Build this read-only fixture in a separate pinned Next application. Check every file import/relative path, then run that app's typecheck, tests and production build/start. This repository's VitePress build validates the learning document, not Next route semantics.

- **Boundary lab:** inspect emitted client assets and initial HTML/RSC data; only the filter needs client behavior, no server credentials/data module code is serialized; compare no-JS and hydrated navigation.
- **State lab:** test valid/malformed/missing IDs, slow read, transient failure, deterministic failure and retry; record direct/client navigation, focus, live announcements and status codes before/after streaming.
- **Cache lab:** replace fixture reads with an instrumented upstream; compare two requests before/after the freshness interval, explicit invalidation and clean deployment; retain actual counters/build output, not assumptions from dev HMR.
- **Mismatch lab:** intentionally introduce a time/storage-dependent initial render, reproduce the warning, fix deterministic data ownership and show it disappears without global suppression.

Acceptance requires correct content/states, bounded operations, safe projected data, documented cache consistency and real retained artifacts. These exercises are **still required**; no Next runtime/application, browser behavior or learner capability is claimed by completed material. Continue with [server security and mutations](../../../senior_growth/React/next-server-security.md); deployment is a separate exercise.
