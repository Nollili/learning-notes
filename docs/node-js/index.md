---
title: Node.js — Zero to Strong Medior
description: A structured Node.js backend learning path from runtime foundations to production diagnostics and distributed systems.
outline: deep
---

# Node.js: Zero to Strong Medior

This learning path starts with the Node.js runtime and gradually builds toward independent ownership of production backend services.

The modules explain four sides of each important concept:

- **Mechanics:** what the API or pattern does.
- **Selection:** when it is appropriate and what the alternatives are.
- **Failure modes:** how it breaks and how to diagnose it.
- **Production consequences:** how it affects performance, security, reliability, and maintenance.

The chapters are designed to be read in order. Experienced developers can also use them as standalone references.

## Learning path

### Foundations

1. [Node.js Foundations](./module-01-nodejs-foundations.md) — the runtime, modules, npm, asynchronous JavaScript, and the event loop.
2. [Node.js Standard Library](./module-02-standard-library.md) — processes, files, child processes, clustering, and worker threads.
3. [EventEmitter, Buffers, and Streams](./module-03-events-buffers-streams.md) — events, binary data, streaming, backpressure, cancellation, and cleanup.
4. [Testing Node.js Applications](./module-04-testing.md) — test design, Jest, isolation, integration tests, concurrency, and flaky-test diagnosis.

### Building backend services

5. [Networking in Node.js](./module-05-networking.md) — HTTP, REST, TLS, clients, WebSockets, timeouts, retries, and idempotency.
   - [SSE, Bounded Polling and gRPC](./realtime-transports.md) — replay, heartbeat, slow consumers, cancellation and transport selection.
6. [Express and Layered Architecture](./module-06-express-architecture.md) — controllers, services, repositories, dependency boundaries, transactions, and request context.
7. [MongoDB and Mongoose](./module-07-mongodb-mongoose.md) — document modeling, indexes, aggregation, transactions, concurrency, and schema evolution.
8. [PostgreSQL and MikroORM](./module-08-postgresql-mikroorm.md) — relational modeling, SQL, transactions, locking, migrations, and query diagnosis.

   - [SQL Query Workbench](./sql-query-workbench.md) — parameterized CRUD, reporting grain, grouping, subqueries, CTEs and window functions.

   - [Deterministic Cursor Pagination](./cursor-pagination.md) — scoped signed cursors, microsecond precision and live-feed consistency.

   - [Dates and Time Zones](./dates-and-time-zones.md) — strict boundaries, calendar versus elapsed arithmetic, DST and Intl.

   - [Database Recovery](./database-recovery.md) — logical restore, PITR, recovery verification and RPO/RTO.

### Security and production ownership

9. [Authentication and Authorization](./module-09-authentication-authorization.md) — passwords, sessions, tokens, OAuth/OIDC, permissions, browser security, and application attack surfaces.
10. [Production-Ready Node.js Applications](./module-10-production-ready-applications.md) — configuration, logging, health checks, graceful shutdown, error handling, and API hardening.
11. [Performance and Diagnostics](./module-11-performance-diagnostics.md) — latency, saturation, event-loop health, memory, profiling, database pools, and load testing.
12. [Resilient Architecture and Distributed Systems](./module-12-resilient-distributed-systems.md) — messaging, idempotency, retries, outbox workflows, sagas, caching, circuit breakers, and distributed consistency.

## Worked boundary labs and alternatives

These complement the primary modules; links are navigation, not additional completion evidence.

- [REST contract workbench](./rest-contract-workbench.md) — generated OpenAPI/runtime schemas with actual endpoint/error/permission and drift checks.
- [GraphQL catalogue](./graphql-basics.md) — a bounded alternative API with actual schema/query/authorization-scope and batched-loading checks; REST remains primary.
- [Release artifact compatibility](./release-artifact-compatibility.md) — exact package identities and real PostgreSQL expand/contract/rollback boundaries.
- [Container deployment lab](./container-deployment-lab.md) — actual image/Compose/database/readiness/shutdown/persistence checks.
- [AWS service slice](./aws-service-slice.md) — scoped infrastructure/IAM/cost-model material with static validation, not a claimed cloud deployment.
- [React query ownership](../senior_growth/EngX_Quality/Large_Data_Workflow.md) — the frontend counterpart to complete-body deadlines and stale-response protection.

Use PostgreSQL/MikroORM as the primary relational path; MongoDB, GraphQL and other tools are alternatives to compare when the requirement justifies them. Keep Autocode's supplied build/Jest scripts, database settings and restricted test directory unchanged. Only the user may push repository changes.

## How to study

For each chapter:

1. Read the concept and restate it in your own words.
2. Run or rewrite the small examples.
3. Complete the failure-driven exercises without copying the suggested approach.
4. Explain why your solution is appropriate and when you would choose another design.
5. Return to the final checklist and identify anything you cannot yet explain clearly.

Reading creates recognition. Independent implementation, failure diagnosis and defended design decisions require separate practice/evidence; completed learning material does not establish professional readiness.
