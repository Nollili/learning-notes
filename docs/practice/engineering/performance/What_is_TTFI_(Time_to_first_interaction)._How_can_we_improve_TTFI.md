# Practice: What is TTFI (Time to first interaction). How can we improve TTFI?

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/Web_Performance/What_is_TTFI_%28Time_to_first_interaction%29._How_can_we_improve_TTFI.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Acceptance:** retain baseline and changed production traces under the same scenario; identify a causal stack/rendering cost; test rapid inputs, cancellation, slow network and keyboard focus; show correctness of the resulting data; compare repeated lab distributions and record field collection/cohort/sample-size plans. A lower TBT alone does not prove lower field INP. No learner trace or field improvement is claimed here.

**Acceptance:** explain why moving a full heavy job to one idle callback or async script still stalls input. Execute the chunk/cancel control-flow tests, then measure the actual browser interaction and correctness under the same scenario before/after. Keep the pure blocking-portions arithmetic, lab TBT, visit-level INP and navigation-to-custom-ready milestone distinct. Browser traces/field/learner evidence remains unperformed.

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
