# Practice: ECMAScript features from ES2018 to ES2020 {#practice-significant-features-introduced-in-es9-2018-es10-2019-and-es11-2020}

**Status: outstanding learner practice.** Author checks do not complete these requirements.

Prerequisite: study the [worked lesson](../../../senior_growth/General_ES6/Significant_features_introduced_in_ES9_%282018%29%2C_ES1_177e8106c24d80cbab6bddd5aaa88bad.md) and its linked foundations. Apply these focused cases to [P-328/P-329/P-330](../../frontend-project.md); retain only the cases relevant to the chosen increment.

## Scope and observable criteria

**Exercise:** instrument request start times to compare eager map versus the sequential producer without calling public services. Acceptance: sequential peak concurrency1; bounded variant respects its configured cap; every rejection is handled immediately; signal abort releases active body work; iterator break runs cleanup; regex matches exclude digits at offsets0/5. Add a hostile near-match performance case in an isolated worker/process with a deadline, never an unbounded regex on the request thread.

**Additional acceptance:** exact match groups/indices0and5, m/s behavior, lastIndex cycling, literal punctuation/leading digits/Unicode cases, missingescape support and input bounds are tested. Show that matchAll requires g for a RegExp and does not turn captures into full matches. Record safe child-process timeout termination for a hostile near-match separately from ordinary unit timings. User regex execution, advanced parser support and learner performance evidence remain separate decisions.

## Evidence

Record source revision, runtime/browser versions, expected versus observed result, one reproduced failure, correction and retest. Include exact commands or input sequence and artifacts. Mark unperformed keyboard, screen-reader, zoom, device and integration checks explicitly. Never record a supplied example as your completed practice.
