---
title: Node.js — runtime to backend services
description: A Node.js runtime course with explicit backend, database and deployment continuations.
outline: deep
---

# Node.js: runtime to backend services

**Start with the runtime course.** Learn how Node runs code and handles resources first. Add Express, databases, authentication and deployment later; you do not need a full-stack application to begin.

The goal is to explain the runtime, build programs with limits on input and work, diagnose common failures and clean up files, timers and connections. Some later chapters go deeper into security and reliability. Reading the material does not replace implementing and testing the exercises yourself.

## Prerequisites and boundaries

Before starting, learn JavaScript functions, scope, closures, arrays, objects, modules, basic promises and `try`/`catch`. You also need basic terminal and package-manager skills. Some examples use TypeScript annotations to describe expected inputs and outputs. Read [running the examples](./module-01-nodejs-foundations.md#javascript-examples-and-typescript-examples) before running them.

Use the [shared JavaScript references](./prerequisites-and-boundaries.md) to fill a specific gap when needed. You do not have to repeat a whole frontend course. Node and browsers provide different environments: a Node experiment cannot by itself prove how a browser renders a page, handles cookies or enforces CORS.

| Scope | Includes | Does not have to come first |
|---|---|---|
| Core Node.js | Modules/npm/process, async execution, errors, files, bytes/streams, raw HTTP, cancellation/cleanup, testing and runtime diagnostics | Express, ORM, database, cloud or broker |
| Backend service continuation | Express/use cases, current authorization, API schemas, application lifecycle | Microservices or multiple alternative frameworks |
| Persistence continuation | PostgreSQL/SQL/MikroORM; constraints, transactions, migrations and query diagnosis | MongoDB or Redis |
| Delivery/distribution continuation | Containers, restore/rollback, durable jobs, operational failure boundaries | AWS/Kubernetes administration or a deployed multi-service system |

## Recommended reading order

### Runtime foundations

- [Foundations](./module-01-nodejs-foundations.md): runtime, CJS/ESM, npm, scheduling, promises and bounded concurrency.
- [Standard library](./module-02-standard-library.md): errors, process/CLI, files/handles/paths, crypto and subprocess/worker ownership. Study worker pools and cluster in more depth later.
- [Events, buffers and streams](./module-03-events-buffers-streams.md): notifications, bytes/encoding, framing, backpressure, iteration and cleanup.
- [Testing](./module-04-testing.md): awaitable checks, useful assertions, controlled failures and open handles. Use its database and end-to-end sections when you add a service.
- [Networking](./module-05-networking.md): raw HTTP, request/response streams, bounded clients, TLS/DNS, deadlines and security boundaries. REST architecture and real-time alternatives can follow your first server.
- [Diagnostics](./module-11-performance-diagnostics.md): measure event-loop behavior, resource ownership, memory categories and one reproducible bottleneck. Database pool diagnosis belongs with persistence.
- [Lifecycle](./module-10-production-ready-applications.md): use configuration, startup, safe diagnostics, readiness and shutdown for your first long-running server. Use its deployment sections later.

Apply these ideas in the [small log-analyzer project](../practice/node-js/core-project.md), then practise more failure cases with [P-332](../practice/backend-project.md#p-332). Use the [chapter exercises](../practice/node-js/index.md) for your own implementation and checks. Reading an explanation does not complete its exercise.

### One backend and persistence path

- [Express and architecture](./module-06-express-architecture.md): ordered middleware, validation, use cases and persistence boundaries.
- [PostgreSQL and MikroORM](./module-08-postgresql-mikroorm.md): learn SQL/constraints before ORM behavior. The [SQL workbench](../workbench/node-js/database/sql-queries.md) supplies one coherent fixture.
- [Authentication and authorization](./module-09-authentication-authorization.md): sessions, CSRF, passwords, tokens and current owner/tenant policy. Its [runnable application reference](../workbench/node-js/backend/session-app.md) reuses existing source.
- Return to [production lifecycle](./module-10-production-ready-applications.md) and the database sections of [diagnostics](./module-11-performance-diagnostics.md) once those parts work together as a service.

[P-331](../practice/backend-project.md#p-331) describes how to combine these parts. Follow PostgreSQL and REST as the main path. Use [MongoDB/Mongoose](./module-07-mongodb-mongoose.md) as an optional comparison with document storage.

### Delivery and distributed failure

- [Resilient/distributed systems](./module-12-resilient-distributed-systems.md): unknown outcomes, duplicates, outbox, queues, caching and recovery. A modular monolith remains the starting point.
- [Container deployment](./container-deployment-lab.md), [backup/recovery](./database-recovery.md), [release compatibility](./release-artifact-compatibility.md) and [whole-stack local deployment](./full-stack-deployment.md) prepare [P-333](../practice/backend-project.md#p-333). A local example passing does not prove an authenticated hosted deployment works.

## Supplements by requirement

The sidebar groups these extra lessons into <span class="notes-section-label">**Backend and persistence continuation**</span> (database queries and calendar data), <span class="notes-section-label">**Security and data handling**</span> (uploads, deletion, callbacks and browser behavior), and <span class="notes-section-label">**API transports and adapters**</span> (live updates, alternative APIs and shared caches or limits). **Choose an extra lesson when your service needs it.** You do not need all of them before learning the runtime.

| Requirement | Reading/reference |
|---|---|
| Public API contract and drift | [REST/OpenAPI workbench](../workbench/node-js/backend/rest-contracts.md) |
| Ordered database feeds and calendar data | [Cursor pagination](./cursor-pagination.md), [dates/time zones](./dates-and-time-zones.md) |
| Private bounded text ingress | [Uploads and multipart variant](./safe-text-uploads.md), [expiry/deletion](./retention-and-deletion.md) |
| Provider callbacks | [Signed webhooks](./signed-webhooks.md) |
| Browser document/login boundaries | [CSP](./browser-csp.md), [OIDC/CSRF alternatives](./oidc-and-csrf-lab.md) |
| Real-time updates or alternative APIs | [SSE/polling/gRPC](./realtime-transports.md), [GraphQL](./graphql-basics.md) |
| Shared cache/abuse limits | [Redis adapters](./redis-adapters.md) |
| Durable work and schedules | [Jobs/scheduling](./jobs-and-schedules.md) |
| Cloud architecture awareness | [AWS slice](./aws-service-slice.md); Kubernetes awareness remains in the deployment continuation |

The [workbench home](../workbench/node-js/index.md) labels examples you can run directly, source examples you can connect to other code, and templates that need extra setup. Find project requirements, pass criteria and checklists in [practice](../practice/node-js/index.md). Keep any Autocode task's supplied build, Jest, database and coverage settings and restricted tests unchanged. Only the user may push repository changes.
