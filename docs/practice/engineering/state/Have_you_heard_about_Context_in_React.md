# Practice: Have you heard about Context in React?

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/State_management_and_Redux/Have_you_heard_about_Context_in_React.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Acceptance:** strict-typecheck children/theme/callbacks; assert a missing-provider failure, independent provider toggles, functional double toggles and stable value/action identity across unrelated rerenders. Then profile real consumers under combined versus split contexts, accounting for parent renders and StrictMode. Test focus/AT separately; a stable object is not proof of a faster application. React19.3.0/TypeScript5.9.3 baseline; learner practice remains required. [Official useContext identity/subscription contract](https://react.dev/reference/react/useContext), checked2026-10-22.

**Acceptance:** strict-typecheck the exact provider/consumer and reject unsupported configured locale; verify English1/2, all six Arabic count categories, explicit USD/date formatter output and invalid count/date/amount bounds. Render two different locale providers, switch one and assert the other stays unchanged; inspect lang/dir/bdi/time markup and missing-provider failure. In a browser, verify real fonts/Arabic shaping, logical-property layout, long strings, zoom, mixed-direction IDs, keyboard/focus and assistive-technology language behavior with a fluent reviewer. Node/SSR/jsdom checks establish formatting/markup only; browser/translation quality and learner practice remain required.

**Additional acceptance:** select Arabic by its option value, require the translated label/heading/action, section lang/ar-EG and dir/rtl, updated plural/currency/date text and preserved bidi-isolated reference. Switch back to English. Check logical-property stylesheet syntax and retain browser screenshots at narrow width, large text and long translations; assert no clipping and a meaningful keyboard sequence. Automated DOM tests can verify the state/markup contract, not Arabic shaping, visual overflow or translation quality. These browser/fluent-review tasks remain learner practice.

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
