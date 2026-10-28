# Practice: What if we are facing performance issues because we have lots of requests?

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/Web_Performance/What_if_we_are_facing_performance_issues_because_we_have_lots_of_requests.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Exercise:** compare20sequential item reads, bounded-parallel reads and one capped batch endpoint. Acceptance: retain waterfall/protocol/connection evidence, transferred bytes, server workload and perceived partial-result behavior; simulate one slow/error item, rapid query changes and two users; demonstrate correct authorization/cache isolation, cancellation and bounded retries. Choose a topology from measured latency/failure trade-offs rather than the lowest request count. This is an unperformed learner lab, not a recorded benchmark.

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
