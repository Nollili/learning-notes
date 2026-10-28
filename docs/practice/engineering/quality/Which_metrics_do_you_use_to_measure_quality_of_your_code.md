# Practice: Which metrics do you use to measure quality of your code?

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/Clean_code_and_Code_Quality/Which_metrics_do_you_use_to_measure_quality_of_your_code.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Exercise acceptance:** choose one risk, record a baseline and a candidate threshold with denominator/exclusions, add a defect that a meaningful assertion catches, then show how the metric and actual behavior differ. Retain first-run failures, tool/version/config and a reasoned improvement decision. Do not report a tool's debt-hours as an engineering estimate; estimate the actual change with dependencies and uncertainty. Learner practice remains required. [Jest's official threshold configuration](https://jestjs.io/docs/configuration#coveragethreshold-object) explains enforceable gates; it does not choose an appropriate risk policy for the team.

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
