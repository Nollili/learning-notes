# Practice: Do you know some script tag properties to alter loading behavior? async vs defer

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/Web_Performance/Do_you_know_some_script_tag_properties_to_alter_loading_behavior_async_vs_defer.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Measurement acceptance:** compare hint/no-hint under identical cold/warm conditions and target devices, including a critical image/font. Retain initiator/discovery/start/transfer timing, duplicate/unused preload warnings, protocol/cache state, long tasks/LCP and an actual interaction trace. Check that a byte saving or earlier script response actually improves the user outcome rather than shifting contention. Attribute execution order to the correct script category, not priority hints.

**Overall acceptance:** strict-typecheck dom-ready and test loading/already-ready/disposed ownership. Parse the HTML/files and verify declared paths/hash, then run the actual browser lab for parser/script/DCL/module/priority/SRI behavior, including a deliberately modified fixture rejected by the browser. Static hashing/Node module execution and simulated DOM tests are not browser network/order/performance proof. Browser checks and learner practice remain required; no real browser validation is claimed here.

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
