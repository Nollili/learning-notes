---
title: Node.js — runtime to backend services
description: A Node.js runtime course with explicit backend, database and deployment continuations.
outline: deep
---

# Node.js: runtime to backend services

**Start with the runtime course.** Express, databases, authentication and deployment are continuations, so you can learn Node.js without first building a complete full-stack product.

The material targets independent intermediate Node.js work: explain the runtime, implement a bounded program, diagnose common failures and own its resources. Selected service chapters go deeper into security and reliability. Finalized material and ready-to-use specifications do not establish completed learner practice or professional mastery.

## Prerequisites and boundaries

You need JavaScript functions, scope/closures, arrays/objects, modules, basic promises and `try`/`catch`; basic terminal and package-manager use is enough to begin. TypeScript annotations describe contracts in many examples. See [running the examples](./module-01-nodejs-foundations.md#javascript-examples-and-typescript-examples) before executing them.

The [shared JavaScript references](./prerequisites-and-boundaries.md) fill specific prerequisite needs. Read them when needed rather than repeat a whole frontend track. Browser rendering, DOM workers and browser CORS enforcement are different host concerns; Node output is not evidence of a browser paint or cookie decision.

| Scope | Includes | Does not have to come first |
|---|---|---|
| Core Node.js | Modules/npm/process, async execution, errors, files, bytes/streams, raw HTTP, cancellation/cleanup, testing and runtime diagnostics | Express, ORM, database, cloud or broker |
| Backend service continuation | Express/use cases, current authorization, API schemas, application lifecycle | Microservices or multiple alternative frameworks |
| Persistence continuation | PostgreSQL/SQL/MikroORM; constraints, transactions, migrations and query diagnosis | MongoDB or Redis |
| Delivery/distribution continuation | Containers, restore/rollback, durable jobs, operational failure boundaries | AWS/Kubernetes administration or a deployed multi-service system |

## Recommended reading order

### Runtime foundations

- [Foundations](./module-01-nodejs-foundations.md): runtime, CJS/ESM, npm, scheduling, promises and bounded concurrency.
- [Standard library](./module-02-standard-library.md): errors, process/CLI, files/handles/paths, crypto and subprocess/worker ownership. Worker pools and cluster are later depth.
- [Events, buffers and streams](./module-03-events-buffers-streams.md): notifications, bytes/encoding, framing, backpressure, iteration and cleanup.
- [Testing](./module-04-testing.md): awaitable checks, useful assertions, controlled failures and open handles. Its database/E2E sections become relevant with a service.
- [Networking](./module-05-networking.md): raw HTTP, request/response streams, bounded clients, TLS/DNS, deadlines and security boundaries. REST architecture and real-time alternatives can follow your first server.
- [Diagnostics](./module-11-performance-diagnostics.md): measure event-loop behavior, resource ownership, memory categories and one reproducible bottleneck. Database pool diagnosis belongs with persistence.
- [Lifecycle](./module-10-production-ready-applications.md): use configuration, startup, safe diagnostics, readiness and shutdown for your first long-running server. Its deployment-specific sections are a continuation.

Apply these in the [small log-analyzer project](../practice/node-js/core-project.md), then deepen failure handling with [P-332](../practice/backend-project.md#p-332). The [chapter exercises](../practice/node-js/index.md) are separate from the explanations; every learner task remains outstanding until independently performed.

### One backend and persistence path

- [Express and architecture](./module-06-express-architecture.md): ordered middleware, validation, use cases and persistence boundaries.
- [PostgreSQL and MikroORM](./module-08-postgresql-mikroorm.md): learn SQL/constraints before ORM behavior. The [SQL workbench](../workbench/node-js/database/sql-queries.md) supplies one coherent fixture.
- [Authentication and authorization](./module-09-authentication-authorization.md): sessions, CSRF, passwords, tokens and current owner/tenant policy. Its [runnable application reference](../workbench/node-js/backend/session-app.md) reuses existing source.
- Return to [production lifecycle](./module-10-production-ready-applications.md) and the database sections of [diagnostics](./module-11-performance-diagnostics.md) for the integrated service.

[P-331](../practice/backend-project.md#p-331) is the ready-to-use integration specification. PostgreSQL/REST is the primary path; [MongoDB/Mongoose](./module-07-mongodb-mongoose.md) is an optional document-model comparison.

### Delivery and distributed failure

- [Resilient/distributed systems](./module-12-resilient-distributed-systems.md): unknown outcomes, duplicates, outbox, queues, caching and recovery. A modular monolith remains the starting point.
- [Container deployment](./container-deployment-lab.md), [backup/recovery](./database-recovery.md), [release compatibility](./release-artifact-compatibility.md) and [whole-stack local deployment](./full-stack-deployment.md) prepare [P-333](../practice/backend-project.md#p-333). A fixture run is distinct from an authenticated hosted deployment.

## Supplements by requirement

The sidebar groups these supplements into **Backend and persistence continuation** (database queries and calendar data), **Security and data handling** (uploads, deletion, callbacks and browser boundaries), and **API transports and adapters** (real-time updates, alternative APIs and shared cache/limits). Choose them when your service needs the capability; they are not additional runtime prerequisites.

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

All substantial collections have a [workbench home](../workbench/node-js/index.md). It distinguishes runnable fixtures, composable source examples and adaptation templates with additional environment requirements. Project requirements, acceptance criteria and learner checklists live in [practice](../practice/node-js/index.md). Preserve any Autocode task's supplied build/Jest/database/coverage configuration and restricted tests. Only the user may push repository changes.
