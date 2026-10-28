# Practice: TDD - pros and cons(red, green, refactor?)?

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/Testing/TDD_-_pros_and_cons%28red%2C_green%2C_refactor%29.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Exercise acceptance:** reproduce red failure for the documented reason, green, then a behavior-preserving refactor. Add one missing edge case and demonstrate it fails the relevant defective implementation. Retain commands, exit status, failing/passing names and actual diff. Explain parser-unit versus filesystem-integration scope and ensure cleanup runs on failure. Learner practice remains required. References: [Node24 test runner, hooks and async activity](https://nodejs.org/docs/latest-v24.x/api/test.html), [Jest coverage thresholds](https://jestjs.io/docs/configuration#coveragethreshold-object).

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
