# Node.js: your immediate route

[Guide home](./) · [Exact project contract](../practice/node-js/core-project.md) · [Runtime workbench](../workbench/node-js/)

You are ready to begin when you can trace a small function that loops over objects, awaits a promise and catches an error. If promise ordering or module imports are uncertain, read that bounded part first and try a tiny trace. No Express, SQL, frontend, cloud or completed CS track is required.

The following is a recommended just-in-time reading plan. The linked project specification remains the authority for exact caps, statuses, failure cases and evidence. N-01 → N-02 → N-03 → N-04 → N-05 → N-06 is the integrated checkpoint order. Tests begin at N-01; N-05 strengthens them. You can read later explanations before implementing their prerequisite increments.

## N-01: first CLI

Read [Module 1](../node-js/module-01-nodejs-foundations.md), limited initially to runtime/module formats, package execution and errors; then [Module 2](../node-js/module-02-standard-library.md), limited to process arguments, paths, file handles and safe output ownership. Scan the [testing chapter](../node-js/module-04-testing.md) for awaiting checks and meaningful assertions.

**Attempt:** one synthetic NDJSON file → pure counts → CLI output. Keep import side effects separate. Read [N-01's exact acceptance](../practice/node-js/core-project.md#n-01-—-cli-modules-and-filesystem-ownership) before choosing exclusive creation versus replacement. Move on only after valid/empty/malformed/missing-input/output-conflict cases have the expected results, failures leave no partial success and handles close. Keep arguments, JSON, exit codes and protected-fixture observations. Do not treat a working happy path as completion.

## N-02: incremental bytes

Read [Module 3](../node-js/module-03-events-buffers-streams.md): bytes versus characters, UTF-8 decoding, physical framing, iteration, pipeline errors and backpressure. Return to Module 2's read/close boundaries. Predict split-code-point output before consulting the [runtime collection](../workbench/node-js/runtime/).

Implement the existing N-02 limits: 64 KiB chunks, 8 KiB physical records, 10,000 nonblank records and 2 MiB total input. Retain counters rather than full records. Move on after byte-split equivalence, malformed/oversize cases, source/destination failure and slow-consumer demand checks pass. Keep byte fixtures, split schedules, line numbers and bounded-work observations. A tiny fixture does not prove a universal memory ceiling.

## N-03: one HTTP lifetime

Read [Module 5](../node-js/module-05-networking.md): raw HTTP request/response streams, status/media/body validation, client body consumption, deadlines and disconnects. Read Module 10's configuration/startup sections when binding your first listener.

Reuse the analyzer behind loopback `POST /analyze`, plus shallow `GET /health/live`. The HTTP caller cannot choose an arbitrary filesystem path. Move on when valid/400/413/415 outcomes, stalled/disconnected peers, failed bind and delayed outbound body are handled under declared budgets. Retain safe HTTP observations, abort reasons, close/exit results. Browser cookie/CORS behavior is outside a Node-client check.

## N-04: cancellation and concurrency

Return to [Module 1](../node-js/module-01-nodejs-foundations.md) for bounded admission, result ordering, original errors and cooperative cancellation. Consult the [canonical limiter](../workbench/node-js/runtime/#bounded-concurrency) only after predicting a held-worker schedule; do not fork an incompatible helper.

Add at most two active local analyses with an item cap. Move on when controllable tasks prove failure stops admission, active peers drain, original `undefined` rejection survives and pre-abort starts nothing. Keep start/abort/drain sequences and effect counts. Cancellation cannot undo effects or kill an arbitrary promise.

## N-05: meaningful tests and diagnosis

Read [Module 4](../node-js/module-04-testing.md) for pure/integration boundaries, real failures, async assertions and open handles; then [Module 11](../node-js/module-11-performance-diagnostics.md) for event-loop delay/utilization, CPU and memory categories.

Strengthen prior checks rather than build a second app. Move on when an intentionally broken parser/forgotten await is caught, real temporary-file and HTTP failures are covered, and one controlled stall plus one leaked owner is diagnosed and corrected. Keep the exact workload, failing and passing results, revision/runtime/lock, traces and limits. Commands must terminate naturally.

## N-06: shutdown and choose a continuation

Read [Module 10](../node-js/module-10-production-ready-applications.md) for readiness, admission, draining and ordered cleanup; revisit Module 3's pipeline ownership. Deployment sections can wait.

Move on when new work is denied during shutdown, active work follows a stated policy, owners close after their last user, repeated shutdown shares its outcome and a stuck owner reaches the external deadline with an honest failure. Keep readiness/admission observations, shutdown order, output/effect state and exit status.

## After the analyzer

- Deepen controlled runtime failures in [P-332](../practice/backend-project.md#p-332). It follows the analyzer as a learning recommendation even though P-331 appears first in the shared project file.
- Add a service goal: [Express](../node-js/module-06-express-architecture.md) → [SQL/PostgreSQL](../node-js/module-08-postgresql-mikroorm.md) → [authorization](../node-js/module-09-authentication-authorization.md) → [P-331](../practice/backend-project.md#p-331). Read small SQL examples before implementing transaction races; full database reading is not required for your first query.
- Bring in frontend F01–F04 whenever you want a small public interface; wait for React/HTTP/server authority before F06 authenticated mutations.
- Study CS cost/representation alongside N-02 counters and queue pressure; correctness/invariants alongside N-04 admission/drain. The rest of CS can continue separately.
- Branch into [Python and RAG](./tracks.md#python-and-applied-ai) when your goal becomes answering from authorized notes. Workflow tools require explicit authority/receipt design; finishing RAG does not grant write permission.
- [P-333](../practice/backend-project.md#p-333) follows a working integrated service and recovery preparation. Redis, MongoDB, GraphQL, brokers, AWS and Kubernetes are requirement-driven continuations, not analyzer prerequisites.
