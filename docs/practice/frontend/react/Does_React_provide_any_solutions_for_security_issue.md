# Practice: Does React provide any solutions for security issues?

**Status: outstanding learner practice.** Author checks do not complete these requirements.

Prerequisite: study the [worked lesson](../../../senior_growth/React/Does_React_provide_any_solutions_for_security_issue.md) and its linked foundations. Apply these focused cases to [P-328/P-329/P-330](../../frontend-project.md); retain only the cases relevant to the chosen increment.

## Scope and observable criteria

**Exercise acceptance:** render pending/anonymous/signed-in states, prove attacker text remains text, and attempt direct requests with absent identity and another user's/tenant's ID. Check server denial before mutation even if the UI gate is bypassed. Test missing/invalid CSRF proof for cookie-authenticated mutations and CSP in an allowed native browser. UI/port tests are not native CSP or deployed-authentication evidence; learner implementation remains required.

## Evidence

Record source revision, runtime/browser versions, expected versus observed result, one reproduced failure, correction and retest. Include exact commands or input sequence and artifacts. Mark unperformed keyboard, screen-reader, zoom, device and integration checks explicitly. Never record a supplied example as your completed practice.
