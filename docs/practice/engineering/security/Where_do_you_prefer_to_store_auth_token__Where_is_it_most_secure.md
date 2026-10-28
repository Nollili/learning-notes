# Practice: Where do you prefer to store auth token? Where is it most secure?

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/Communication_and_Security/Where_do_you_prefer_to_store_auth_token__Where_is_it_most_secure.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Exercise acceptance:** inspect the helper's outgoing method/path/body/credentials/CSRF header/signal and confirm no Bearer/Cookie token is synthesized by JavaScript. Mock204/failure/abort without raw diagnostic leakage. In an HTTPS browser/server lab confirm the HttpOnly cookie is absent from document.cookie yet accompanies an eligible request; then prove an invalid CSRF token/cross-tenant body fails with no mutation. Test logout/server invalidation, reload, cookie scope and cross-origin settings separately. A mock RequestInit check does not prove browser cookie sending or a secure server; learner practice remains required.

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
