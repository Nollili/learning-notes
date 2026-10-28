# Practice: Please describe what is KISS, DRY, YAGNI

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/Coding_principles_patterns_conventions/Please_describe_what_is_KISS%2C_DRY%2C_YAGNI.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Exercise acceptance:** take two similar functions, name the domain rule each represents, change one requirement and show whether they should change together. Extract only shared knowledge; retain independent domain names. Record one rejected speculative abstraction and one reliability/security obligation that must remain. Run boundary and negative tests after the refactor. Learner practice remains required. For executable checks use the [official Node assertion API](https://nodejs.org/docs/latest-v24.x/api/assert.html); these principles guide decisions rather than providing a numerical correctness guarantee.

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
