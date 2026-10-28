# Practice: 🌐 CORS and CSRF — Understanding the Difference and Mitigation

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/Communication_and_Security/What_is_CORS__Can_proper_CORS_configuration_protect_against_CSRF_attacks__What_other_measures_can_be_taken_to_mitigate_CSRF_attacks.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Exercise acceptance:** in an isolated two-origin HTTPS lab, show a denied response read while a safelisted form request still reaches a harmless test endpoint; verify the protected write rejects it without state change. Test allowed/disallowed/null origins, missing/invalid/session-mismatched CSRF tokens, JSON preflight, credentialed wildcard failure and same-site sibling-origin behavior. Inspect server-side mutation counts, not only browser console errors. Include missing provenance and nonbrowser clients in the policy tests. No browser-network enforcement, production CSRF middleware or learner practice is proven by these request descriptions.

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
