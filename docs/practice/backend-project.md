# Backend, runtime and deployment integration project

Continue the same course/notes product with Node 24, TypeScript 5.9, Express 5 and PostgreSQL 16/MikroORM 7. Work in a separate practice project or disposable copy of `examples/node-textbook`; its README explains builds, migrations, tests and safeguards for destructive checks. **Never run a practice reset or migration harness against a user database.** Keep task-supplied credentials and configuration. Do not create or change files in restricted `src/tests`; put independent practice checks in an authorized checks directory.

The [relational module](../node-js/module-08-postgresql-mikroorm.md), [authentication module](../node-js/module-09-authentication-authorization.md), [production lifecycle](../node-js/module-10-production-ready-applications.md) and [distributed module](../node-js/module-12-resilient-distributed-systems.md) provide the implementations/concepts. The new upload/webhook/job/deployment labs supply concrete boundaries; this document defines the integration you still need to build and defend.

## P-331

<span class="notes-section-label">**Deliverable:**</span> build an authenticated Express/PostgreSQL service that checks ownership and tenant permissions itself. Protect business rules with transactions, add one secure incoming-data integration, limit outbound work, and manage startup and cleanup. **A validated frontend value or disabled button cannot enforce server permission.** Start with one modular service; add a broker or microservices only when a concrete buffering or recovery need justifies them.

**Setup:** create two tenants, two users in one tenant and one in the other, plus synthetic courses/notes with stable UUIDs and optimistic versions. Use separate app/migration/test database identities with least required privileges; real integration checks run against a dedicated disposable database. Commit a reproducible lockfile and migrations. The standalone new labs use Express5.3.0/pg8.23.1/Zod4.6.7; the retained course fixture has its own reviewed lock and versions. Do not mix their package trees without an intentional compatibility check.

Implement one complete path first: session/CSRF login → validated rename or create → service → parameterized repository → explicitly selected public response. Get actor and tenant from verified current identity, never body or query fields. Use the same chosen 404 behavior for missing and foreign-owned records. Distinguish invalid credentials (401) from dependency failures (503/500). **Never serialize password, token or internal database fields into a response.**

Choose a shared business rule, such as course capacity. In one transaction, create at most one enrollment per actor/course and consume a place only for a new enrollment. Combine tenant/course/actor uniqueness with `places > 0` in a conditional decrement, or use a correctly scoped row lock. Roll back the whole operation when no place is available. **Reading available places before writing is not sufficient protection.** Composite tenant/resource foreign keys can also block cross-tenant relationships. Money or irreversible external effects are unnecessary for this transaction exercise.

| Boundary | Positive check | Negative/interleaving check |
|---|---|---|
| HTTP/runtime schema | Valid owner write returns projected committed DTO | Malformed/unknown fields, private property injection, unsupported body/size |
| Identity/policy | Current authenticated owner succeeds | Missing/expired/revoked credential, wrong role/tenant/user, ownership changed since prior read |
| Transaction | One new enrollment consumes one place | Two clients race for last place; duplicate retry cannot consume twice; forced error rolls back receipt/effect |
| External HTTP | Valid bounded response used | Delayed body, oversize body, failed status/schema, abort/unmount, lost write response |
| Safe ingress | One chosen integration persists valid authorized data | Upload ownership/parser/expiry cases **or** webhook signature/replay/dedup cases |
| Lifecycle | Valid config/dependencies→ready | Bad startup config, failed bind/DB, operational outage, in-flight work during SIGTERM, failed cleanup |

Choose the [multipart text upload](../node-js/safe-text-uploads.md) **or** [signed webhook](../node-js/signed-webhooks.md) for the required ingress integration. They have different trust models: browser upload needs current session/permission/CSRF; provider webhook needs its exact raw-byte signature/scope. Do not combine incompatible parser middleware or trust the synthetic test actor header as real login. Add [durable jobs/outbox](../node-js/jobs-and-schedules.md) only for work that can complete later, with current policy, stable ID and status/recovery ownership.

**Logging and operations:** emit safe request/operation IDs, outcome/error category and duration; redact credentials and bodies. Readiness reflects essential bounded dependency checks; liveness stays shallow. On shutdown mark unready/stop admission, drain accepted requests/jobs, close HTTP/pools/clients before the hard platform deadline. A timeout does not prove remote rollback. A committed-but-lost response needs an idempotency key/receipt or explicit reconciliation, not blind write retry.

**Acceptance:** run production build and the existing Jest/test configuration, plus real-database API/concurrency/rollback/tenant-negative checks. Retain exact failing/passing schedules, SQL state and safe HTTP results; close every connection/server/timer. Module4 coverage remains Cobertura when applicable. A mocked repository cannot prove transaction isolation/constraint behavior. Supply one diagram/decision record tracing who owns identity, invariant, database transaction and external effect. Review a permission change and a dependency outage separately. No supplied lab result marks this integrated service complete for you.

## P-332

**Deliverable:** a failure-driven concurrency/streaming lab that explains ordering, cancellation, backpressure, framing and owned termination. Use controllable work rather than vague timing assumptions. Retain both an intentionally broken baseline and a passing correction where practical.

### Worker failure and drain

Use the maintained `mapWithConcurrency` from the [foundations chapter](../node-js/module-01-nodejs-foundations.md). Supply inputs 0, 1, 2, 3 with concurrency 2. Hold both first tasks, reject task 0 with `undefined`, and observe cancellation of task 1 while keeping it unfinished. Tasks 2 and 3 must not start; the combined promise must remain pending until task 1 finishes. Then release task 1 and expect the original `undefined` rejection. **This catches early rejection and truthiness-based failure bugs.** Also test pre-abort, result order, sparse/over-limit input and a mapper needing its own deadline.

The [canonical limiter source](../workbench/node-js/runtime/index.md#bounded-concurrency) is included in the foundations chapter and compiled by the [runtime workbench checks](../workbench/node-js/index.md). Use that source rather than extracting a fence or maintaining another copy. The persisted `backend-lab/limiter-check.mjs` can run beside its emitted `limiter.js`; the workbench check also verifies this controlled schedule. Cooperative cancellation cannot kill an arbitrary promise or undo completed effects.

For a smaller starting project, complete the [bounded log analyzer](./node-js/core-project.md). It applies files, bytes, HTTP, testing, cancellation and diagnostics before adding databases or deployment.

### UTF-8, framing and pipeline failure

This executable Node 24 check uses a narrow protocol: UTF-8 records separated by LF, chunks no larger than 1,024 bytes, frames no larger than 16 encoded bytes and a required final LF. It rejects malformed UTF-8. Tests split a euro sign across chunks, reject oversized, incomplete and malformed frames, fail the destination and cancel an active pipeline. **The source's `finally` must run after both failure and cancellation.**

<<< ./backend-lab/failure-check.mjs

Run `node failure-check.mjs` in an owned directory; only Node standard-library modules are needed. Actual checks passed and the process terminated normally. The decoder carries incomplete code points between chunks; decoding each chunk independently would corrupt a split character. This intentionally small parser is for a classroom protocol, not arbitrary TCP/WebSocket protocol handling. A single transform invocation can emit several bounded frames; readable highWaterMark is a pressure threshold, not an exact total memory ceiling. Chunk/frame caps bound each burst, while the full pipeline still includes its writable/readable queues and upstream buffering.

**Memory exercise:** generate a large stream incrementally rather than allocating a giant array/string first. Use a slow destination, record actual retained buffers/heap/RSS under a declared runtime and workload, and verify no growth proportional to total stream size. Compare honoring write(false)/drain against an intentionally broken producer. Do not claim a measured memory cap from a short correctness test; account for highWaterMark, per-object size, decoder remainder, output bursts and kernel/network buffers.

**Acceptance:** retain peak concurrency/start order, abort reason, drain completion, split-code-point exact output, oversized frame rejection before unbounded accumulation, destination failure propagation, client cancellation, listener/timer/resource counts and a bounded process-exit observation. Add invalid trailing UTF-8 and a slow/noncooperative producer with a termination deadline. An output failure must stop upstream admission; a timeout wrapper alone cannot cancel remote/source work. Use the [events/buffers/streams chapter](../node-js/module-03-events-buffers-streams.md) to explain each queue/owner and the distinction between binary bytes, decoded text and protocol frames.

## P-333

**Deliverable:** deploy the integrated frontend/API/database, exercise a failed release rollback and demonstrate a database restore. Reuse the [executed full-stack HTTPS runbook](../node-js/full-stack-deployment.md) and [artifact/schema compatibility lab](../node-js/release-artifact-compatibility.md). The local counter proves mechanics only; substitute your real authenticated product and preserve its controls before hosting.

**Setup and release record:** retain source revision, lock/runtime/image/platform identities, frontend/API artifact digests, migration revision, previous compatible digest and environment. Build/test once and promote those same artifacts. Run containers nonroot, exclude secrets from context/layers, inject secrets at runtime, restrict API→DB network and avoid public DB binding. Use an actual trusted HTTPS endpoint and narrowly configured proxy trust/Secure cookies. A local self-signed certificate tested by a scoped client does not establish public certificate/DNS readiness.

Use one migration owner to expand the schema, backfill and reconcile data before promoting the code. Keep compatibility between old and new application versions explicit; do not let every replica run destructive migrations independently. **A green build or health probe does not replace an authenticated business smoke test.** Check allowed and denied actions. Define an actual rollback trigger, such as an unexpected 403 on an authorized flow or a compatible candidate failing smoke checks. Keep the failing evidence instead of repeatedly rebuilding until it disappears.

**Recovery drill:** write a synthetic marker through the app, create a backup under the reviewed encryption/retention policy, restore into a separate isolated target and verify constraints/counts/application reads. Record backup timestamp, accepted-write timeline and observed restore duration; distinguish RPO from RTO. A backup file existing is not a proven restore. Do not overwrite a user database, expose restored credentials or mix a restored environment with live job/payment endpoints. After verification remove only the owned target through its explicit teardown policy.

<span class="notes-section-label">**Failed release drill:**</span> retain the known-good package or image before building a deliberately broken candidate. Detect the failure with meaningful smoke checks, restore the exact previous compatible frontend/API versions, and prove accepted database writes remain. The supplied example first failed because the old image had not been retained; reproduce that lesson. **A destructive schema change can make old code unsafe to restore.** Plan forward repair or database recovery separately, with explicit authority for any data loss. `rollout undo` is not database rollback.

**Operations evidence:** capture safe request/operation traces, errors/latency/saturation, dependency recovery, readiness/drain and actual shutdown status. Set declared CPU/memory/request/queue budgets and a cost/retention owner. For a hosted run verify current regional compute/storage/backup/egress rates and budget alerts rather than copying synthetic cost units from AI examples. Do not purchase or publish a service solely because the exercise lists deployment.

**Acceptance:** independently retain endpoint/TLS observations, artifact/schema release receipt, nonroot/secret/network checks, cross-user/tenant/CSRF smoke, restored-data verification, failed-candidate detection, exact rollback, accepted-write preservation, bounded shutdown and cleanup. Cloud account/cluster/native-browser/load/production operations are not inferred from the supplied local fixture. Actual learner deployment and recovery remain required.

Official references checked2026-10-26: [PostgreSQL transactions](https://www.postgresql.org/docs/16/tutorial-transactions.html), [Node stream pipeline/backpressure](https://nodejs.org/api/stream.html), [Node TextDecoder](https://nodejs.org/api/util.html#class-utiltextdecoder), [Docker multi-stage builds](https://docs.docker.com/build/building/multi-stage/), [PostgreSQL backup/restore](https://www.postgresql.org/docs/16/backup.html). The linked implementation lessons retain more specific version/security references and explicit test limitations.
