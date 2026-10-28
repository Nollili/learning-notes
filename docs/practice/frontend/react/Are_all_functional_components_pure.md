# Practice: Are all functional components pure?

**Status: outstanding learner practice.** Author checks do not complete these requirements.

Prerequisite: study the [worked lesson](../../../senior_growth/React/Are_all_functional_components_pure.md) and its linked foundations. Apply these focused cases to [P-328/P-329/P-330](../../frontend-project.md); retain only the cases relevant to the chosen increment.

## Scope and observable criteria

**Exercise:** compare a render-time global counter with state updated by an event handler. Then rapidly switch FetchData user IDs using delayed responses. Acceptance: render has no external mutation; no stale user's name is displayed; HTTP/invalid JSON/invalid shape failures have UI; cleanup prevents late state use; Strict Mode replay leaves no duplicate subscription. A network call during development replay is not by itself evidence of a production double-write.

## Evidence

Record source revision, runtime/browser versions, expected versus observed result, one reproduced failure, correction and retest. Include exact commands or input sequence and artifacts. Mark unperformed keyboard, screen-reader, zoom, device and integration checks explicitly. Never record a supplied example as your completed practice.
