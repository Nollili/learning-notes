# Practice: Modals in react, portal or not.md

**Status: outstanding learner practice.** Author checks do not complete these requirements.

Prerequisite: study the [worked lesson](../../../senior_growth/React/Modals_in_react%2C_portal_or_not.md) and its linked foundations. Apply these focused cases to [P-328/P-329/P-330](../../frontend-project.md); retain only the cases relevant to the chosen increment.

## Scope and observable criteria

**Exercise acceptance:** open/Tab/Shift+Tab/Escape/Close, click inside versus backdrop, remove the trigger before close, long/translated content, repeated mount/StrictMode, SSR first paint/hydration and zoom400%. Verify name, focus entry/containment/return, inert background, scroll lock restoration and no stale async success after route change. Retain browser/OS/screen-reader versions and actual results; this code has not received a manual accessibility pass. Test a missing/changed portal host and theme inheritance explicitly. No library installation or browser verification is implied by syntax checks.

**Focused regression acceptance:** simulate showModal/close and queued close-event delivery to prove that reopening survives an old event, a genuine current close requests closure, controlled cleanup restores owned overflow and the heading/opener/fallback policy is followed. These are control-flow tests only; a DOM shim does not implement the top layer, actual focus trapping, inertness, native Escape or mobile scrolling. Complete the existing native browser/reader matrix separately. For a mutation form, use the [worked async form/dialog contracts](../../../senior_growth/React/complex-forms-and-data.md) and preserve pending/errors/drafts until confirmed server success. Learner/browser practice remains required.

## Evidence

Record source revision, runtime/browser versions, expected versus observed result, one reproduced failure, correction and retest. Include exact commands or input sequence and artifacts. Mark unperformed keyboard, screen-reader, zoom, device and integration checks explicitly. Never record a supplied example as your completed practice.
