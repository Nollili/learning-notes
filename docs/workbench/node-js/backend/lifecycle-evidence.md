# Lifecycle and error evidence reconciliation

The introductory `app.listen` snippet above demonstrates separation of app construction and listening; it is not the production startup owner. Use [module10 startup/listenReady](../../../node-js/module-10-production-ready-applications.md#_5-startup-and-application-lifecycle) and [coordinated shutdown](../../../node-js/module-10-production-ready-applications.md#_9-graceful-shutdown) instead of growing a second inconsistent implementation. Startup must reject both synchronous invalid bind arguments and asynchronous `error` events, and release every resource already handed over. A connection factory owns partially created resources until it returns successfully. Closing a listener is not the same as awaiting jobs, draining active requests or closing a database.

| Requirement | Retained/rechecked evidence | Limit |
|---|---|---|
| Known body-parser status mapping | B43 complete extracted Express API checks;2026-10-25 exact current classifier strict-compiled and actual Express malformed400/size413/charset415/encoding415 rechecked | Does not make arbitrary SyntaxError/TypeError a client error; wrong media type may skip the parser |
| Unexpected application failure | Current actual Express async TypeError returns safe500 without the synthetic private detail | Client projection is separate from an internal redacted diagnostics policy |
| Startup listener failure | Exact current `listenReady` strict-compiles; actual occupied loopback bind rejects EADDRINUSE and the handed-over resource closes; invalid port rejects synchronously | Database close in this new focused test is an explicit owned port, not a new real-driver run |
| Listener lifetime | Startup helper removes only its own error/listening listeners on failure | Node's existing `setupConnectionsTracking` listener is preserved; zero total listeners is the wrong assertion |
| Complete shutdown | Retained B48 real Node slow-response drain/new-connection denial, duplicate-promise ownership, jobs-before-DB ordering, failure matrix and child deadline exit1 | Not re-executed in this batch; no hosted load-balancer/production rollout evidence |
| Probe/driver boundary | Retained B48 isolated PostgreSQL timeout/slot-release/recovery and B165 actual container database-stall/readiness/liveness/shutdown | Not proof every dependency cancels when an HTTP deadline fires |

The current chapter was reread completely (1726 source lines before these edits) before reconciling the overlapping review finding. Existing substantive parser and lifecycle material supplies the shared requirement; a missing copy in one introductory snippet is not absence across the corpus. Raw error-object logging in the two small error-handler sketches was replaced by a fixed diagnostic code: parser/driver/program errors can carry bodies, credentials or private paths. A production diagnostics adapter can preserve reviewed cause categories and correlation under a declared redaction policy; do not silently dump the original exception.

[Related practice](../../../practice/node-js/module-06-express-architecture.md).
