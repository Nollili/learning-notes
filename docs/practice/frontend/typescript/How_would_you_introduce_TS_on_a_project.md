# Practice: How would you introduce TS on a project?

**Status: outstanding learner practice.** Author checks do not complete these requirements.

Prerequisite: study the [worked lesson](../../../senior_growth/TypeScript/How_would_you_introduce_TS_on_a_project.md) and its linked foundations. Apply these focused cases to [P-328/P-329/P-330](../../frontend-project.md); retain only the cases relevant to the chosen increment.

## Scope and observable criteria

**Exercise acceptance:** remove each @ts-expect-error and confirm its diagnostic; deliberately change the runtime export or null behavior and confirm the runtime check fails. Restore consistency, add a Unicode length boundary test and state that this example's limit counts JavaScript UTF-16 code units, not user-perceived characters. For an actual vendor package record its installed version, export mode and the subset you verified. Prefer a narrow adapter with unknown input/runtime parsing when trusting the vendor's output is inappropriate. Existing Autocode task configuration and src/tests must remain unchanged; use a separate lab.

## Evidence

Record source revision, runtime/browser versions, expected versus observed result, one reproduced failure, correction and retest. Include exact commands or input sequence and artifacts. Mark unperformed keyboard, screen-reader, zoom, device and integration checks explicitly. Never record a supplied example as your completed practice.
