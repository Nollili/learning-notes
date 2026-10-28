# Practice: verification-and-permissions

**Status: outstanding learner practice.** Prerequisite: [the worked lesson](../../../ai-assisted-engineering/verification-and-permissions.md) and [shared increments](../index.md).


## Additional observable requirements

**Practice acceptance:** review a candidate patch with at least one plausible semantic error and one nonexistent API. Identify the violated requirement before running tests; then show the appropriate compiler/runtime check rejects it. Challenge a generated test that copies the buggy expectation. Check the actual diff for scope/config/dependency changes and prepare a minimized context/error record containing no real secrets. Preserve a separate independent reviewer outcome when one actually occurs; do not invent it. Learner practice remains required.

Record actual versions, expected/observed behavior, failure→fix→retest and unperformed native/service/deployment checks.
