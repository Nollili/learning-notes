# Practice: Which tools and metrics would you use to profile and measure performance?

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/Web_Performance/Which_tools_and_metrics_would_you_use_to_profile_and_measure_performance.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Exercise:** instrument a representative route and produce a baseline/change report with raw traces, scenario/config, at least several repeated lab runs, variance, causal finding and regression guard. Acceptance: correctly distinguish lab versus field, INP versus TBT, transfer size versus parsed bytes, React render versus browser paint; no invented p75 or readiness conclusion. Record missing API support and telemetry privacy constraints. Learner measurement remains required.

**Acceptance:** select the relevant outcome/diagnostic and explain its scope, units and missing-data behavior; retain baseline/change traces and the artifact/environment/cohort contract above. Show how the same code-level read/write ordering could have negligible or material impact depending on dirty state, DOM complexity and device. Native/field measurements remain explicitly unperformed until collected. Do not declare a renderer/library universally faster from these study examples.

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
