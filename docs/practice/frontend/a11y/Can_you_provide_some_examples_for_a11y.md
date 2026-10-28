# Practice: Can you provide some examples for accessibility?

**Status: outstanding learner practice.** Author checks do not complete these requirements.

Prerequisite: study the [worked lesson](../../../senior_growth/A11y/Can_you_provide_some_examples_for_a11y.md) and its linked foundations. Apply these focused cases to [P-328/P-329/P-330](../../frontend-project.md); retain only the cases relevant to the chosen increment.

## Scope and observable criteria

**Exercise — complete contact flow:** implement this example with visible focus and responsive dialog sizing. Acceptance: the dialog's name and input label are exposed; Tab/Shift+Tab stay within the modal; Escape/Cancel restore focus; background cannot be operated; invalid submission focuses a readable summary and associates the error; valid submission announces the truthful outcome; zoom400% and long text do not obscure essential controls. Verify with a real screen reader/browser pair and record results. Add a server adapter only after distinguishing validation success from saving success. This exercise remains learner practice.

**Image exercise:** supply two sizes/crops and implement this in the matching layout. Acceptance: record viewport/density/currentSrc/transfer size; narrow crop and wide image communicate equivalent meaning; dimensions prevent avoidable shift; slow network does not delay the hero through lazy loading; meaningful alt and keyboard-linked-image names are verified. Do not infer selection from filename or DOM src alone.

**Media exercise:** create a short recording, valid captions and a descriptive transcript, then test failed-media and keyboard paths. Acceptance: captions accurately synchronize and include meaningful sounds; essential visual actions are described; native controls have usable names/focus; no forced autoplay; alternatives remain available if video fails. Record the actual reader/browser checks. These assets/exercises are not claimed as completed by the learner.

## Evidence

Record source revision, runtime/browser versions, expected versus observed result, one reproduced failure, correction and retest. Include exact commands or input sequence and artifacts. Mark unperformed keyboard, screen-reader, zoom, device and integration checks explicitly. Never record a supplied example as your completed practice.


## Manual evidence record: fill with actual observations

| Flow | Expected behavior | Required evidence |
|---|---|---|
| Open modal | Named dialog, intentional initial focus, background unavailable | Browser/OS/reader versions, focus/announcement observation |
| Keyboard close | Tab containment, Escape/Cancel, logical restore/fallback | Keyboard trace and removed-trigger case |
| Invalid local/server form | Summary focused, links focus fields, errors described | Actual announcement/reading order; no duplicate assertive announcements |
| Slow save/cancel/error | Truthful status, usable controls, draft retained, no false success | Adapter/HTTP result plus keyboard/reader observation |
| Confirmed success | Close only after persistence; surviving region announces result | Real committed result and observed announcement |
| Zoom/reflow/motion | Essential controls/errors visible/operable, no blocked focus | Narrow/400%/preferences test artifacts |

Every evidence cell is **unperformed learner practice**, not a pass. Automated DOM/name/role checks can detect some defects but cannot substitute for these observations. Record expected versus actual, severity, correction/retest and residual support limits. Avoid claiming an entire product conforms because this fixture works in one reader/browser pair.

Official references checked2026-10-21: [WAI form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/), [WAI modal pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), [AccName1.2 draft](https://www.w3.org/TR/accname-1.2/), [WCAG2.2](https://www.w3.org/TR/WCAG22/). Accessible names/descriptions and announcement timing need the declared platform matrix; syntax validation supplies no manual pass.
