# Practice: Change Detection in React

**Status: outstanding learner practice.** Author checks do not complete these requirements.

Prerequisite: study the [worked lesson](../../../senior_growth/React/Change_Detection_in_React.md) and its linked foundations. Apply these focused cases to [P-328/P-329/P-330](../../frontend-project.md); retain only the cases relevant to the chosen increment.

## Scope and observable criteria

**Exercise — prediction before profiling:** run both buttons, add a parent-only update, set the same object reference after mutation (deliberately broken), then repair with a new state object. Acceptance: explain+1/+2; never mutate the prior snapshot; distinguish component calls from commits and browser paint using React Profiler plus a browser trace; verify a context consumer updates through memo. Do not use render console counts alone as production performance evidence.

## Evidence

Record source revision, runtime/browser versions, expected versus observed result, one reproduced failure, correction and retest. Include exact commands or input sequence and artifacts. Mark unperformed keyboard, screen-reader, zoom, device and integration checks explicitly. Never record a supplied example as your completed practice.
