# Node.js practice

**Learner status: still required for every task.** These specifications apply the explanations; supplied example checks do not complete independent practice.

Start with the [Node.js course](../../node-js/index.md). JavaScript values, functions, scope, arrays/objects and basic promises are prerequisites. Runtime exercises need Node and a terminal, not Express, a database or cloud access.

Start with [the bounded log analyzer](./core-project.md): a small CLI, then one loopback HTTP service, with explicit checkpoints for files, streams, cancellation, testing, diagnostics and shutdown. Its N-01–06 criteria are independent learner work and feed the existing P-332 project.

## Topic-to-practice map

Core prerequisites are the JavaScript basics above plus each preceding runtime chapter. Backend rows additionally require HTTP/validation; persistence rows require SQL and an authorized disposable database; delivery rows require a working service and an explicitly owned environment. Read the linked specification's exact setup before executing a destructive fixture.

Every row uses the shared evidence record below plus its specific observable acceptance/failure criteria. Parent projects reuse one coherent application; these are focused exercises, not a requirement for 30 unrelated products.

| Topic | Ready-to-use exercises | Integration and scope |
|---|---|---|
| A Minimal AWS Service Slice: Topology, IAM and Cost | [Specification](./aws-service-slice.md) | P-333; delivery/recovery continuation, cloud/cluster optional |
| Browser CSP: Nonces, Reports and Deployment Evidence | [Specification](./browser-csp.md) | P-331; focused API/data/security extension |
| An Executed Node/PostgreSQL Container Lab | [Specification](./container-deployment-lab.md) | P-333; delivery/recovery continuation, cloud/cluster optional |
| Deterministic Cursor Pagination | [Specification](./cursor-pagination.md) | P-331; focused API/data/security extension |
| PostgreSQL Backup, Restore and Recovery | [Specification](./database-recovery.md) | P-333; delivery/recovery continuation, cloud/cluster optional |
| Dates, Instants, Time Zones and Calendar Rules | [Specification](./dates-and-time-zones.md) | P-331; focused API/data/security extension |
| Deploy, restore and roll back a small complete stack | [Specification](./full-stack-deployment.md) | P-333; delivery/recovery continuation, cloud/cluster optional |
| GraphQL: a bounded catalogue query | [Specification](./graphql-basics.md) | P-331/P-332; requirement-driven alternative, not core prerequisite |
| Durable jobs and scheduled work | [Specification](./jobs-and-schedules.md) | P-331/P-333; optional durable-work continuation |
| Node.js Foundations | [Specification](./module-01-nodejs-foundations.md) | P-332 / N-01–06; core runtime, HTTP, tests or diagnosis |
| Node.js Standard Library | [Specification](./module-02-standard-library.md) | P-332 / N-01–06; core runtime, HTTP, tests or diagnosis |
| EventEmitter, Buffers, and Streams | [Specification](./module-03-events-buffers-streams.md) | P-332 / N-01–06; core runtime, HTTP, tests or diagnosis |
| Testing Node.js Applications | [Specification](./module-04-testing.md) | P-332 / N-01–06; core runtime, HTTP, tests or diagnosis |
| Networking in Node.js | [Specification](./module-05-networking.md) | P-332 / N-01–06; core runtime, HTTP, tests or diagnosis |
| Express and Layered Architecture | [Specification](./module-06-express-architecture.md) | P-331; backend/persistence/identity continuation |
| NoSQL Databases, MongoDB, and Mongoose | [Specification](./module-07-mongodb-mongoose.md) | P-331/P-332; requirement-driven alternative, not core prerequisite |
| Relational Databases, PostgreSQL, and MikroORM | [Specification](./module-08-postgresql-mikroorm.md) | P-331; backend/persistence/identity continuation |
| Authentication and Authorization | [Specification](./module-09-authentication-authorization.md) | P-331; backend/persistence/identity continuation |
| Production-Ready Node.js Applications | [Specification](./module-10-production-ready-applications.md) | N-06 / P-331 and P-333; lifecycle first, deployment later |
| Performance and Diagnostics | [Specification](./module-11-performance-diagnostics.md) | P-332 / N-01–06; core runtime, HTTP, tests or diagnosis |
| Resilient Architecture and Distributed Systems | [Specification](./module-12-resilient-distributed-systems.md) | P-331/P-333; optional durable-work continuation |
| OIDC Login Transactions and Signed CSRF Tokens | [Specification](./oidc-and-csrf-lab.md) | P-331/P-332; requirement-driven alternative, not core prerequisite |
| SSE, Bounded Polling and gRPC: Choosing a Transport | [Specification](./realtime-transports.md) | P-331/P-332; requirement-driven alternative, not core prerequisite |
| Redis Adapters: Cache Boundaries and Shared Limits | [Specification](./redis-adapters.md) | P-331/P-332; requirement-driven alternative, not core prerequisite |
| Build Artifacts and Database Rollback Compatibility | [Specification](./release-artifact-compatibility.md) | P-333; delivery/recovery continuation, cloud/cluster optional |
| REST contracts: OpenAPI, runtime schemas and drift checks | [Specification](./rest-contract-workbench.md) | P-331; focused API/data/security extension |
| Retention, Expiry and Enforced Deletion | [Specification](./retention-and-deletion.md) | P-331; focused API/data/security extension |
| A Bounded Text Upload and Its Threat Model | [Specification](./safe-text-uploads.md) | P-331; focused API/data/security extension |
| Verify signed webhooks before applying effects | [Specification](./signed-webhooks.md) | P-331; focused API/data/security extension |
| SQL Query Workbench: From Rows to Reports | [Specification](./sql-query-workbench.md) | P-331; focused API/data/security extension |

## Evidence and progression

Use a disposable learner directory, synthetic fixtures and the chapter's runtime assumptions. Keep application/template scripts and database configuration unchanged; never change restricted `src/tests`.

For each task record the actual source revision, runtime/lockfile, expected and observed result, failing counterexample, correction, resource cleanup and unperformed checks. Do not prefill success. See the [evidence record](../learning-projects.md#retain-a-real-evidence-record).

The [backend project](../backend-project.md) already specifies **P-332** for integrated runtime/stream failure practice, **P-331** for a separate authenticated API/database continuation and **P-333** for deployment/recovery. Their learner status remains outstanding.
