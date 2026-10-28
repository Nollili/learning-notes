# Practice: RESTful API(HTTP) and WebSockets - why and when we need them. Limitations?

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/Communication_and_Security/RESTful_API_HTTP__and_WebSockets_-_why_and_when_we_need_them._Limitations.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Acceptance:** fake the socket constructor for deterministic ownership tests: open/valid message, invalid JSON/schema/binary/oversize, send while connecting, send failure, queued-byte overflow, close/error, repeated dispose and late events. Require fixed commands only, no consume after stop, removed listeners and at most one close. Then run a real authenticated server/browser exercise: reject hostile Origin and unauthorized subscriptions, expire the session, test slow consumers, queue limits, proxy timeout, reconnect with a cursor and duplicate/gap handling. Retain evidence; fake socket tests do not establish any of these server/browser protections.

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
