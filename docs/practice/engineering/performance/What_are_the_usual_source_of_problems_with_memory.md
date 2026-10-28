# Practice: What are the usual sources of problems with memory?

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/Web_Performance/What_are_the_usual_source_of_problems_with_memory.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Exercise:** compare an infinite-scroll list with DOM virtualization alone versus bounded retained pages. Acceptance: demonstrate the two separate bounds, explain back-scroll/refetch trade-offs, test LRU replacement/refresh/cached-undefined/clear and large-value limits; verify user data does not survive logout in a shared cache. For memory, take comparable snapshots after repeated open/close cycles and inspect retainers; no deterministic GC timing/finalizer assertion is valid. Learner heap measurements remain unperformed.

**Acceptance:** execute the LRU replacement/read-refresh/cached-undefined/clear cases, then separately collect native before/after retaining-path evidence for one deliberately retained owner. Confirm both mounted DOM and fetched-page/cache bounds for a virtualized list. No native heap/GC result has been performed here; passing cache logic is not heap-profile evidence. [Official memory investigation guidance](https://developer.chrome.com/docs/devtools/memory-problems), checked2026-10-22.

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
