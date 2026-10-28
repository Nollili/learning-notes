# Practice: 🌍 HTTP Versions & Modern Web Protocols — Comparison and Performance Impact

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/Communication_and_Security/Could_you_compare_V1_and_V2_of_HTTP_Other_protocols.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Exercise acceptance:** record protocol/connection and comparable cold/reused runs for an allowed test endpoint, identify an application dependency waterfall separately from transport effects, and explain optional0RTT replay risk. A non-idempotent action must not be assumed safe merely because a transport permits early data; apply the server's explicit early-data/retry policy. Native packet-loss/network/h2/h3 and learner results remain unperformed. Use the [TLS lesson](../../../senior_growth/Communication_and_Security/HTTPS._Could_you_please_describe_advantages_and_disadvantages_of_this_protocol.md) for handshake concepts rather than inventing custom cryptography.

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
