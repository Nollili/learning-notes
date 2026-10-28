# Practice: 🔐 Important Web Security Headers

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/Communication_and_Security/Do_you_remember_any_security_headers.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Exercise acceptance:** generate two responses and verify different nonces, exactly matching script/header values, fixed safe markup and selected report-only/enforced header. In an HTTPS browser lab, demonstrate intended script execution, a script without the nonce blocked under enforcement, report-only nonblocking behavior and allowed/denied framing. Inspect cross-origin referrer values without real secrets. Retain a rollout/rollback plan and assess third-party scripts, style policy and CSP reporting privacy. Node string checks do not prove browser enforcement or learner completion.

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
