# Backend, runtime and deployment integration project

Continue the same course/notes product with Node24/TypeScript5.9, Express5 and PostgreSQL16/MikroORM7. Use an isolated learner project or a disposable copy of `examples/node-textbook`; its README defines build/migration/test setup and destructive-test safeguards. Never point a practice reset/migration harness at a user database. Preserve the task's supplied credentials/configuration and never create/edit fixtures in restricted src/tests. Add independent exercise checks in an authorized checks directory instead.

The [relational module](../node-js/module-08-postgresql-mikroorm.md), [authentication module](../node-js/module-09-authentication-authorization.md), [production lifecycle](../node-js/module-10-production-ready-applications.md) and [distributed module](../node-js/module-12-resilient-distributed-systems.md) provide the implementations/concepts. The new upload/webhook/job/deployment labs supply concrete boundaries; this document defines the integration you still need to build and defend.

## P-331

**Deliverable:** an authenticated Express/PostgreSQL service that independently enforces ownership/tenant policy, transactional invariants, one secure ingress integration, bounded outbound work and a correctly owned lifecycle. A frontend's validated DTO or disabled button cannot grant server authority. Start as one modular service; no microservices/broker is required until its buffering/recovery need is explicit.

**Setup:** create two tenants, two users in one tenant and one in the other, plus synthetic courses/notes with stable UUIDs and optimistic versions. Use separate app/migration/test database identities with least required privileges; real integration checks run against a dedicated disposable database. Commit a reproducible lockfile and migrations. The standalone new labs use Express5.3.0/pg8.23.1/Zod4.6.7; the retained course fixture has its own reviewed lock and versions. Do not mix their package trees without an intentional compatibility check.

Implement a small vertical slice first: session/CSRF login → validated rename/create → service → parameterized repository → projected response. Keep actor/tenant from verified current identity, never body/query fields. A missing and foreign object should have the same chosen404 policy. Unauthorized credentials401 and dependency failures503/500 are distinct. Never serialize a database entity with password/token/internal fields.

Add a real business invariant such as course capacity. One transaction must create at most one enrollment per actor/course and decrement available places only for a successful new enrollment. Use a tenant/course/actor uniqueness rule plus a conditional decrement with `places > 0`, or a correctly scoped locked row; roll back the entire unit when capacity is unavailable. A prior read of available places is not the invariant. Composite tenant/resource foreign keys can prevent cross-tenant relationships even when application code makes a mistake. Do not implement money or externally irreversible effects merely to demonstrate a transaction.

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

Use the canonical `mapWithConcurrency` in the [foundations chapter](../node-js/module-01-nodejs-foundations.md), not a fresh incompatible limiter. With inputs0,1,2,3 and concurrency2, hold both initial workers; reject0 with `undefined`; observe abort on1 while holding its completion. No2/3 may start, and the aggregate must remain pending until1drains. Release1 and require rejection with the original undefined reason. This catches an implementation that only relies on Promise.all rejection or tests a truthy failure sentinel. Also cover pre-abort, result order, sparse/over-budget input and a mapper that needs its own deadline.

The [canonical limiter source](../workbench/node-js/runtime/index.md#bounded-concurrency) is included in the foundations chapter and compiled by the [runtime workbench checks](../workbench/node-js/index.md). Use that source rather than extracting a fence or maintaining another copy. The persisted `backend-lab/limiter-check.mjs` can run beside its emitted `limiter.js`; the workbench check also verifies this controlled schedule. Cooperative cancellation cannot kill an arbitrary promise or undo completed effects.

For a smaller starting project, complete the [bounded log analyzer](./node-js/core-project.md). It applies files, bytes, HTTP, testing, cancellation and diagnostics before adding databases or deployment.

### UTF-8, framing and pipeline failure

The following executable Node24 check defines a narrow LF-delimited UTF-8 protocol: chunks≤1024bytes, frames≤16encoded bytes, mandatory final LF, strict malformed-UTF-8 rejection. It splits a multibyte euro sign across chunks, rejects oversized/incomplete/malformed frames, fails the destination and aborts an active pipeline. The async source's finally must run on both failure and cancellation.

<<< ./backend-lab/failure-check.mjs

Run `node failure-check.mjs` in an owned directory; only Node standard-library modules are needed. Actual checks passed and the process terminated normally. The decoder carries incomplete code points between chunks; decoding each chunk independently would corrupt a split character. This intentionally small parser is for a classroom protocol, not arbitrary TCP/WebSocket protocol handling. A single transform invocation can emit several bounded frames; readable highWaterMark is a pressure threshold, not an exact total memory ceiling. Chunk/frame caps bound each burst, while the full pipeline still includes its writable/readable queues and upstream buffering.

**Memory exercise:** generate a large stream incrementally rather than allocating a giant array/string first. Use a slow destination, record actual retained buffers/heap/RSS under a declared runtime and workload, and verify no growth proportional to total stream size. Compare honoring write(false)/drain against an intentionally broken producer. Do not claim a measured memory cap from a short correctness test; account for highWaterMark, per-object size, decoder remainder, output bursts and kernel/network buffers.

**Acceptance:** retain peak concurrency/start order, abort reason, drain completion, split-code-point exact output, oversized frame rejection before unbounded accumulation, destination failure propagation, client cancellation, listener/timer/resource counts and a bounded process-exit observation. Add invalid trailing UTF-8 and a slow/noncooperative producer with a termination deadline. An output failure must stop upstream admission; a timeout wrapper alone cannot cancel remote/source work. Use the [events/buffers/streams chapter](../node-js/module-03-events-buffers-streams.md) to explain each queue/owner and the distinction between binary bytes, decoded text and protocol frames.

## P-333

**Deliverable:** deploy the integrated frontend/API/database, exercise a failed release rollback and demonstrate a database restore. Reuse the [executed full-stack HTTPS runbook](../node-js/full-stack-deployment.md) and [artifact/schema compatibility lab](../node-js/release-artifact-compatibility.md). The local counter proves mechanics only; substitute your real authenticated product and preserve its controls before hosting.

**Setup and release record:** retain source revision, lock/runtime/image/platform identities, frontend/API artifact digests, migration revision, previous compatible digest and environment. Build/test once and promote those same artifacts. Run containers nonroot, exclude secrets from context/layers, inject secrets at runtime, restrict API→DB network and avoid public DB binding. Use an actual trusted HTTPS endpoint and narrowly configured proxy trust/Secure cookies. A local self-signed certificate tested by a scoped client does not establish public certificate/DNS readiness.

Apply schema expansion under one migration owner, backfill/reconcile, then promote code. Keep old/new application compatibility explicit. Do not run destructive migrations independently in every replica. Health/readiness/dependency probes and a green image build do not substitute for an authenticated business smoke covering allowed/denied behavior. Define one actual rollback trigger, e.g. unexpected403 on a previously authorized workflow or a schema-compatible candidate failing the business smoke; retain the failing evidence instead of silently rebuilding the current release until it passes.

**Recovery drill:** write a synthetic marker through the app, create a backup under the reviewed encryption/retention policy, restore into a separate isolated target and verify constraints/counts/application reads. Record backup timestamp, accepted-write timeline and observed restore duration; distinguish RPO from RTO. A backup file existing is not a proven restore. Do not overwrite a user database, expose restored credentials or mix a restored environment with live job/payment endpoints. After verification remove only the owned target through its explicit teardown policy.

**Failed release drill:** preserve the known-good artifact before building a deliberately broken candidate. Detect it with meaningful smoke, restore the exact prior compatible frontend/API artifacts, and prove accepted database writes remain. The supplied local exercise caught an unretained image rollback failure and corrected it; reproduce that lesson rather than assume a hash is recoverable forever. A destructive schema contract can make old binary rollback impossible; decide forward-fix/restore separately with explicit data-loss authority. Never equate `rollout undo` with database rollback.

**Operations evidence:** capture safe request/operation traces, errors/latency/saturation, dependency recovery, readiness/drain and actual shutdown status. Set declared CPU/memory/request/queue budgets and a cost/retention owner. For a hosted run verify current regional compute/storage/backup/egress rates and budget alerts rather than copying synthetic cost units from AI examples. Do not purchase or publish a service solely because the exercise lists deployment.

**Acceptance:** independently retain endpoint/TLS observations, artifact/schema release receipt, nonroot/secret/network checks, cross-user/tenant/CSRF smoke, restored-data verification, failed-candidate detection, exact rollback, accepted-write preservation, bounded shutdown and cleanup. Cloud account/cluster/native-browser/load/production operations are not inferred from the supplied local fixture. Actual learner deployment and recovery remain required.

Official references checked2026-10-26: [PostgreSQL transactions](https://www.postgresql.org/docs/16/tutorial-transactions.html), [Node stream pipeline/backpressure](https://nodejs.org/api/stream.html), [Node TextDecoder](https://nodejs.org/api/util.html#class-utiltextdecoder), [Docker multi-stage builds](https://docs.docker.com/build/building/multi-stage/), [PostgreSQL backup/restore](https://www.postgresql.org/docs/16/backup.html). The linked implementation lessons retain more specific version/security references and explicit test limitations.
