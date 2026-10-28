# Practice: Can we test/measure a11y somehow?

**Status: outstanding learner practice.** Author checks do not complete these requirements.

Prerequisite: study the [worked lesson](../../../senior_growth/A11y/Can_we_test%2C_measure_a11y_somehow.md) and its linked foundations. Apply these focused cases to [P-328/P-329/P-330](../../frontend-project.md); retain only the cases relevant to the chosen increment.

## Scope and observable criteria

**Exercise:** audit the worked form/dialog in the examples note. Acceptance: retain a state-by-state table with keyboard and screen-reader observations, criterion IDs, defects, fixes and rerun results; include at least one manual defect an automated scan missed. No result is recorded as passed until actually executed. Use the WAI evaluation guidance to define scope and limitations.

**Audit exercise acceptance:** execute this automated flow in an actual app, retain full results including incomplete checks, then add at least one meaningful manual-only finding, a scoped correction and recorded retest across the relevant states. Include slow/error/cancelled actions, a removed trigger, keyboard-only use, reader announcements, zoom/reflow/preferences and both themes. Distinguish authored tests, executed tests, observed pass/fail and unperformed work in the evidence ledger. No Playwright/axe/browser/screen-reader execution was performed for these notes; the snippet has only syntax validation here.

**Acceptance:** retain a checklist separating authored versus executed checks and browser/OS/reader/fixture revisions. Complete keyboard and reader task observations, visual baseline review and scoped failure/fix/retest rather than replace them with a percentage score. These native/manual steps remain unperformed here; the learning material includes their procedures and expected evidence.

## Evidence

Record source revision, runtime/browser versions, expected versus observed result, one reproduced failure, correction and retest. Include exact commands or input sequence and artifacts. Mark unperformed keyboard, screen-reader, zoom, device and integration checks explicitly. Never record a supplied example as your completed practice.
