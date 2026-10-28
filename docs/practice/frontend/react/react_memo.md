# Practice: React.Memo and Performance Optimization

**Status: outstanding learner practice.** Author checks do not complete these requirements.

Prerequisite: study the [worked lesson](../../../senior_growth/React/react_memo.md) and its linked foundations. Apply these focused cases to [P-328/P-329/P-330](../../frontend-project.md); retain only the cases relevant to the chosen increment.

## Scope and observable criteria

**Exercise:** change data.value while retaining id, change callback behavior without changing visible text, then update local state/context. Acceptance: every change behaves correctly; unchanged primitive props can skip parent-driven work; a stale comparator test fails before the fix. Profile comparison versus render cost under representative rows. No speed improvement is claimed until measured.

## Evidence

Record source revision, runtime/browser versions, expected versus observed result, one reproduced failure, correction and retest. Include exact commands or input sequence and artifacts. Mark unperformed keyboard, screen-reader, zoom, device and integration checks explicitly. Never record a supplied example as your completed practice.
