# Practice: Authentication and Authorization Mechanisms in Modern Web Apps {#practice-%F0%9F%94%90-authentication-and-authorization-mechanisms-in-modern-web-apps}

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/Communication_and_Security/What_authentication_authorization_mechanisms_do_you_use_on_your_project_Please_describe_how_they_work.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Exercise acceptance:** draw the cookie and Bearer flows separately, including who stores/reads/sends each credential. Use a provider test tenant and maintained OIDC integration to reject wrong state/nonce/PKCE verifier, issuer/audience/expiry and unregistered redirects as applicable. Verify session rotation/logout/revocation, cross-tenant denial and dependency-outage behavior; prove UI-hidden actions still fail server-side. Record what the integration actually checks rather than treating a checklist as test evidence. No provider login, token lifecycle or learner practice is claimed by this material.

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
