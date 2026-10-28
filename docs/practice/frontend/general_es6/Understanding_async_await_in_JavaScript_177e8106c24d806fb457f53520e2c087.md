# Practice: Understanding async/await in JavaScript

**Status: outstanding learner practice.** Author checks do not complete these requirements.

Prerequisite: study the [worked lesson](../../../senior_growth/General_ES6/Understanding_async_await_in_JavaScript_177e8106c24d806fb457f53520e2c087.md) and its linked foundations. Apply these focused cases to [P-328/P-329/P-330](../../frontend-project.md); retain only the cases relevant to the chosen increment.

## Scope and observable criteria

**Exercise:** use controlled fetch doubles/local responses for success, HTTP error, invalid JSON, delayed body and pre-aborted parent. Acceptance: both independent jobs start before either is awaited; first failure aborts/drains its peer; no stale result is committed; errors reach the caller; ESM top-level await works and classic-script top-level await fails parsing. Record runtime and cleanup evidence; syntax alone does not prove these cases.

## Evidence

Record source revision, runtime/browser versions, expected versus observed result, one reproduced failure, correction and retest. Include exact commands or input sequence and artifacts. Mark unperformed keyboard, screen-reader, zoom, device and integration checks explicitly. Never record a supplied example as your completed practice.
