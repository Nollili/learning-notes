# Practice: Debouncing and throttling: timing, ownership and request freshness

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/Web_Performance/Can_you_describe_an_idea_of_debouncing%2C_throttling_When_we_need_them%2C_what_is_the_difference.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Exercise:** execute deterministic fake-clock tests for trailing replacement, leading-only suppression, both-edge isolated/burst calls, maxWait under sustained input, cancel, flush, callback reentrancy and invalid configuration. Test search A starts, B input invalidates A immediately, A resolves during B's300ms wait, and B wins even if A ignores abort or rejects later. Verify empty input, safe failure code, unmount before timer/after request, repeated cleanup and StrictMode remount. Mount a controlled React input and prove ordinary rerenders do not recreate a timer owner; retain actual browser typing/focus evidence separately. For throttle, specify whether the invariant is a burst window, average frequency or a minimum gap and test boundary calls. Writing these acceptance criteria does not establish learner practice completion.

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
