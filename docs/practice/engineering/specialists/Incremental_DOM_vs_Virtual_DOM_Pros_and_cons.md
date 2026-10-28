# Practice: Incremental DOM vs Virtual DOM? Pros and cons

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/Other/Incremental_DOM_vs_Virtual_DOM_Pros_and_cons.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Introductory acceptance:** trace initial render, text update, keyed reorder and removal through the two models. Identify where identity, subscriptions and cleanup are owned. In the primary React app, verify stable keys and preserved input state, then inspect a browser trace to determine whether computation/reconciliation or browser layout dominates. A native trace is still unperformed here. Installing/building a historical Incremental DOM app and controlled cross-renderer benchmarks remain explicitly deferred optional advanced practice; no performance or memory ranking is claimed.

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
