# Practice: A Submission Intent from React to PostgreSQL

**Status: outstanding learner practice.** Author checks do not complete these requirements.

Prerequisite: study the [worked lesson](../../../senior_growth/React/Submission_Idempotency.md) and its linked foundations. Apply these focused cases to [P-328/P-329/P-330](../../frontend-project.md); retain only the cases relevant to the chosen increment.

## Scope and observable criteria

**Exercise acceptance:** run the form under StrictMode and send two same-tick submits, a double click, Enter and a manual retry. One active client attempt must render pending feedback; a lost reply retains key/title and replay returns the original ID. Run competing real database connections, not separate mocked maps. Force a failure between note insert and receipt update and prove neither remains; retry then succeeds once. Hold the key lock and prove the deadline terminates the attempt, then retry after release. Check account/tenant separation, changed payload, malformed key, current revoked authorization, safe error messages and connection cleanup. Retain browser keyboard/focus/announcement evidence separately. Explain retention, multiple tabs, reload and external effects.

## Evidence

Record source revision, runtime/browser versions, expected versus observed result, one reproduced failure, correction and retest. Include exact commands or input sequence and artifacts. Mark unperformed keyboard, screen-reader, zoom, device and integration checks explicitly. Never record a supplied example as your completed practice.
