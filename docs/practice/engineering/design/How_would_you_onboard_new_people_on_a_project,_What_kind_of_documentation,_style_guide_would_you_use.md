# Practice: How would you onboard new people on a project? What kind of documentation/style guide would you use?

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/EngX_Quality/How_would_you_onboard_new_people_on_a_project%2C_What_kind_of_documentation%2C_style_guide_would_you_use.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Onboarding exercise:** locate the UI → application port → adapter path, explain who constructs the adapter and run both positive and negative boundary cases. Propose one justified exception, record the risk/owner/expiry and explain whether the rule or architecture should change. Then trace the title helper's [incremental migration and estimate](../../../senior_growth/EngX_Quality/How_would_you_approach_significant_refactoring.md#estimate-uncertainty-and-make-the-debt-decision-reviewable). Acceptance: a new reader can identify the decision, alternatives, forces, consequences, current status, evidence and revisit trigger without relying on undocumented chat history. The record is worked learning material; actual teammate onboarding, decision adoption and measured communication outcomes remain learner practice.

**Practice acceptance:** add an error/retry parent that always clears Busy in `finally`, preserves an accessible error message, and does not execute two writes. Add Ready/Disabled/Busy examples with long translated labels. Record Enter/Space, focus, screen-reader busy announcement and zoom observations in a browser. Propose a breaking prop rename and show both old and migrated consumers plus a version/changelog decision. Material completion is distinct from these still-required observations.

**Practice acceptance:** ask a real reviewer to reproduce the failure from the retained setup, submit a scoped local correction, map acceptance to actual checks, and record what the reviewer misunderstood and what documentation changed. Retain before/after results, unresolved risks and a follow-up receipt. Do not invent a reviewer, claim the example dialogue happened, or mark mentoring/stakeholder outcomes complete from authored prose. Actual human participation and measured onboarding effectiveness remain learner evidence.

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
