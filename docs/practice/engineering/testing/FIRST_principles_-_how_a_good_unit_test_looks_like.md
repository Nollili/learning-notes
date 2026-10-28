# Practice: FIRST principles - how a good unit test looks like?

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/Testing/FIRST_principles_-_how_a_good_unit_test_looks_like.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Acceptance:** run the eight-case linked suite in an owned directory, show expected red failure and green/refactor success, verify temporary files are removed even on a forced assertion failure, and add an async rejection case without sleeps. Explain what the test does not cover. Existing restricted `src/tests` must remain untouched; use project-approved locations/configuration. The exact authored fixture passed locally; learner execution and cleanup-failure demonstration remain required. [Official Node test hooks/activity guidance](https://nodejs.org/docs/latest-v24.x/api/test.html) documents the APIs; use [Jest lifecycle hooks](https://jestjs.io/docs/setup-teardown) when the template uses Jest.

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
