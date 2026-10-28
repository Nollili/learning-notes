# Practice: What are your suggestions to someone who is hesitating to use SASS? What are the key feature that he/she should use?

**Status: outstanding learner practice.** Author checks do not complete these requirements.

Prerequisite: study the [worked lesson](../../../senior_growth/CSS/What_are_your_suggestions_to_someone_who_is_hesitating_to_use_SASS_What_are_the_key_feature_that_should_use.md) and its linked foundations. Apply these focused cases to [P-328/P-329/P-330](../../frontend-project.md); retain only the cases relevant to the chosen increment.

## Scope and observable criteria

**Exercise:** compile the three files, then migrate one old import-based theme. Acceptance: output contains1.5rem padding and no Sass import deprecation warning; two consumers do not duplicate module CSS; configuration is explicit; emitted selectors do not grow unexpectedly. Pin Sass in the scratch project's lockfile. The compilation and visual regression audit are learner practice until evidence is recorded.

**Additional acceptance:** compile both versions, inspect the exact selector lists/declaration duplication and compressed sizes, and test the real DOM states separately. Reuse the namespaced three-file module fixture above; no new framework is needed. A compiler pass cannot prove CSS cascade/visual correctness. References rechecked2026-10-22 against the official use/forward/extend documentation above; learner visual practice remains required.

## Evidence

Record source revision, runtime/browser versions, expected versus observed result, one reproduced failure, correction and retest. Include exact commands or input sequence and artifacts. Mark unperformed keyboard, screen-reader, zoom, device and integration checks explicitly. Never record a supplied example as your completed practice.
