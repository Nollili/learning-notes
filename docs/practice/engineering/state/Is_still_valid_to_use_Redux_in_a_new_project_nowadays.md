# Practice: Is still valid to use Redux in a new project nowadays? Pros/cons?

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/State_management_and_Redux/Is_still_valid_to_use_Redux_in_a_new_project_nowadays.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Acceptance:** execute the adapter and assert exact IDs, changed/unchanged references, previous-state preservation and unknown-ID no-op; compare a selected record after a normalized update. Run the linked versioned codec/adapter exercises with corrupt/future data and storage failure before persisting a real feature. Explain why normalization, mutation control, async race handling and persistence each need different checks. These notes improve implementation guidance without establishing completed learner practice. [Official entity adapter contract](https://redux.js.org/toolkit/api/createEntityAdapter), [Recoil archive](https://github.com/facebookexperimental/Recoil), checked2026-10-22.

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
