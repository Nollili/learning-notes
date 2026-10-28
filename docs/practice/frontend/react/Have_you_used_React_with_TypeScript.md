# Practice: Have you used React with TypeScript?

**Status: outstanding learner practice.** Author checks do not complete these requirements.

Prerequisite: study the [worked lesson](../../../senior_growth/React/Have_you_used_React_with_TypeScript.md) and its linked foundations. Apply these focused cases to [P-328/P-329/P-330](../../frontend-project.md); retain only the cases relevant to the chosen increment.

## Scope and observable criteria

**Exercise:** finish the radio-group Picker API and use Action/FocusInput in a form. Acceptance: age0 renders the paragraph; invalid Action combinations fail with @ts-expect-error; one controlled selection per uniquely named group; labels/keyboard behavior work; deleted selection has an explicit policy; ref.focus works only after mount and does not expose extra methods. Parse network data before passing typed items. Retain typecheck and browser behavior evidence separately.

**Acceptance drill:** typecheck Picker inference with an object item and reject a nonexistent callback field; reject missing/contradictory Action props and a ready state without data. Add a new LoadState variant and observe the exhaustive switch diagnostic. In RTL, rerender a controlled Picker after a click, verify parent-owned selection, reorder/remove the chosen record, and render two instances with different group names. Test all LoadView states, including empty ready data, and show a new state cannot accidentally display stale success. React19.3.0/@types/react19 and TypeScript5.9.3 are the validated baseline. Simulated-DOM checks do not establish actual browser focus, screen-reader output or learner completion.

## Evidence

Record source revision, runtime/browser versions, expected versus observed result, one reproduced failure, correction and retest. Include exact commands or input sequence and artifacts. Mark unperformed keyboard, screen-reader, zoom, device and integration checks explicitly. Never record a supplied example as your completed practice.
