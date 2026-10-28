# Practice: What is the callback hell? How can you avoid it?

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/Other/What_is_the_callback_hell_How_can_you_avoid_it.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Acceptance:** test callback success/error/synchronous throw/duplicate callback, undefined success and receiver ownership; require one promise settlement. Run the exact workflow with empty orders (no details/notify), success, and failure at each stage (no downstream side effects). Use deferred fakes to prove each dependency starts only after its predecessor resolves. Assert no real email/network call occurs in the lab. Demonstrate observed rejection versus fire-and-forget and document uncertain notification recovery. Learner implementation and real adapter integration remain required.

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
