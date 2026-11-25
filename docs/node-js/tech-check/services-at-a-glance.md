---
outline: [2, 2]
---

# Designing Node.js Services at a glance

One short reminder for each of the **50 questions** in this section. Use the topic links to return to the full answers and diagrams.

## Architecture

- [Layers and feature modules](./18-architecture.md#t18-q24): **Features group business work; layers separate responsibilities within it.** Supply dependencies explicitly so business operations do not depend on HTTP objects or hidden connection setup.
- [Module contracts](./18-architecture.md#t18-q25): **A small public interface includes results, errors, state and cleanup rules.** Share one coherent responsibility rather than collecting unrelated helpers in a shared folder.
- [Monolith or microservices](./18-architecture.md#t18-q26): **Keep one deployment while it meets the requirements.** Separate services add independent release, network-failure and recovery responsibilities that need a concrete justification.
- [Outbox, idempotency and saga](./18-architecture.md#t18-q27): **Commit the business change and outbox together; deduplicate repeated delivery durably.** Saga compensation is another business action, not a global rollback.
- [Partitions and consistency](./18-architecture.md#t18-q28): **During a partition, linearizable results can require some requests to wait or fail.** Responding everywhere may allow stale or conflicting data; CAP is not ordinary uptime arithmetic.
- [Load-aware architecture](./18-architecture.md#t18-q29): **Scale the measured bottleneck and bound admitted work.** More API replicas can worsen pressure on an already saturated shared database.

## Database fundamentals

- [Database choice](./17-databases.md#t17-q01): **Choose from data rules, relationships, operations and recovery needs.** SQL versus NoSQL alone does not establish transaction guarantees.
- [Connection ownership](./17-databases.md#t17-q02): **Reuse bounded pools and release checked-out clients on every path.** Count all pools across processes and replicas; protect credentials and close pools during shutdown.
- [Safe CRUD](./17-databases.md#t17-q03): **Validate inputs, bind query values and enforce database constraints.** Parameters are not dynamic identifiers or permission checks; scope operations to trusted owner or tenant context.
- [Different SQL operations](./17-databases.md#t17-q04): **JOIN combines related columns; UNION combines result rows; upsert changes stored data; migration changes schema.** Clarify what “merge” means before choosing an operation.
- [Transactions and stock](./17-databases.md#t17-q05): **A transaction needs statements and constraints that protect the actual invariant.** Use one client throughout; retry whole known-aborted transactions, not uncertain committed writes.
- [ORM contexts](./17-databases.md#t17-q06): **MikroORM's identity map belongs to its request context.** Separate requests and jobs need appropriate contexts; ORM mapping does not replace authorization or SQL understanding.
- [Query diagnosis](./17-databases.md#t17-q07): **Measure pool wait, lock wait, SQL execution and result conversion separately.** Verify a targeted index or query change against representative plans and correct results.
- [Unhealthy database](./17-databases.md#t17-q08): **Bound admission, connections, statement duration and retries.** Classify failures and uncertain effects; adding replicas may amplify the outage rather than restore capacity.

## Authentication and authorization

- [Authentication and authorization](./13-authentication-and-authorization.md#t13-q01): **Identity answers who; authorization answers whether this action on this resource is allowed.** Enforce owner and tenant policy on the server for each protected operation.
- [Sessions and tokens](./13-authentication-and-authorization.md#t13-q02): **A browser session keeps login state server-side behind an opaque ID.** Choose sessions or tokens from client/trust/revocation needs, not a claim that JWTs are automatically safer.
- [JWT verification](./13-authentication-and-authorization.md#t13-q03): **Decoding is not verification.** Check trusted signature keys, allowed algorithms, issuer, audience, time and required claims, then authorize the requested operation separately.
- [Passport strategies](./13-authentication-and-authorization.md#t13-q04): **A strategy verifies its configured credential method and supplies a trusted principal.** The application still owns resource permissions, secure strategy setup and session lifecycle.
- [External and service identity](./13-authentication-and-authorization.md#t13-q05): **Each receiving service verifies a credential intended for it.** Provider login or a caller-supplied identity header does not grant local membership, roles or permissions.

## Concurrency

- [Processes and threads](./09-concurrency.md#t09-q01): **Processes have separate memory; worker threads have separate ordinary heaps within one process.** Cluster shares a listening endpoint, not an application heap.
- [Worker task completion](./09-concurrency.md#t09-q02): **A valid result and successful cleanup are separate milestones.** Own result, error, exit, timeout and abort paths; wait for termination before settling the task helper.
- [Copy, transfer, share](./09-concurrency.md#t09-q03): **Copy creates independent data; transfer moves ArrayBuffer ownership; shared memory keeps common bytes.** Coordinate shared access and remember every sender view can be detached by transfer.
- [Worker pools](./09-concurrency.md#t09-q04): **Limit workers, waiting tasks and message size separately.** Caller cancellation does not free a still-running worker; stop admission and supervise actual completion during shutdown.
- [Cluster ownership](./09-concurrency.md#t09-q05): **Each cluster worker has its own state and resources.** The primary coordinates readiness and shutdown; distinguish IPC disconnect, request completion and actual process exit.
- [Forked service lifetime](./09-concurrency.md#t09-q06): **A job result or stopped reply does not prove child closure.** Control authority and I/O, then observe real process and stream closure before declaring cleanup complete.
- [Repeated IPC requests](./09-concurrency.md#t09-q07): **Validate message shape and stage, then correlate replies to live request IDs.** A send callback is not task completion; cap active operations independently of channel buffering.
- [Concurrency diagnosis](./09-concurrency.md#t09-q08): **Choose async I/O, threads, processes or replicas for the measured constraint.** Include queueing, copying, permissions and cleanup; reconcile uncertain effects before retrying.
- [Event splitting](./09-concurrency.md#t09-q09): **Split a long operation into bounded chunks with scheduling opportunities between them.** This improves fairness, not parallel CPU execution; total work and active jobs still need limits.

## Docker

- [Images, containers and volumes](./23-containerization.md#t23-q01): **An image is packaged content; a container is an instance; a volume retains separate data.** A retained volume is not a backup or tested recovery plan.
- [Reproducible images](./23-containerization.md#t23-q02): **Build from reviewed inputs and the lockfile, then keep only runtime necessities.** Use the intended non-root identity and retest security updates to pinned content.
- [Compose readiness](./23-containerization.md#t23-q03): **Service names, ports, mounts and secret access need explicit configuration.** A started dependency is not necessarily ready, and initial ordering does not handle later outages.
- [Image identity](./23-containerization.md#t23-q04): **Tags can move; digests identify fixed content.** Deploy the tested digest and architecture, while still owning health, resource, state and shutdown policies.
- [Container diagnosis](./23-containerization.md#t23-q05): **Identify the failing stage before changing configuration.** Inspect daemon, build, process, health, network or file access evidence rather than granting broad privileges.

## Deployment

- [CI and packaged behavior](./24-deployment.md#t24-q01): **Required checks must report failures and test what will run.** Passing source tests does not prove the packaged application includes its runtime files or starts correctly.
- [Build once](./24-deployment.md#t24-q02): **Verify the exact artifact in a clean environment, then promote the same bytes.** Checksums need a trusted expected value; a matching untrusted hash proves no origin.
- [Environment management](./24-deployment.md#t24-q03): **Keep the release artifact separate from environment settings and secrets.** Validate before readiness and record a repeatable, limited-authority deployment procedure.
- [Health and shutdown](./24-deployment.md#t24-q04): **Readiness controls admission; liveness guides replacement.** Stop new work and close resources within a real shutdown budget rather than restarting healthy processes for dependency failures.
- [Database rollout](./24-deployment.md#t24-q05): **Old and new versions need a compatible schema during overlap.** Code rollback does not undo committed data; destructive migrations can end the rollback window.
- [Delivery handoff](./24-deployment.md#t24-q06): **Record exact release identity, actual checks, risks and recovery ownership.** Preparation, registry publication and deployment are separate actions; Git pushes remain for the user.

## Cloud

- [Cloud responsibilities](./30-cloud-fundamentals.md#t30-q01): **Managed infrastructure transfers specified operations, not application correctness or access policy.** Name which platform duties the provider handles and which your team retains.
- [VM recovery](./30-cloud-fundamentals.md#t30-q02): **A repeatable VM specification and a snapshot are only preparation for recovery.** Restore in isolation, verify usable application data and measure actual recovery time.
- [Storage interfaces](./30-cloud-fundamentals.md#t30-q03): **Object storage uses keys/APIs, block storage offers disk-like blocks, file storage exposes directories/files.** Choose needed semantics; object writes and database commits remain separate effects.
- [Managed database access](./30-cloud-fundamentals.md#t30-q04): **Network reachability, database privileges and verified TLS solve different boundaries.** Configure all three and cap combined pool demand across replicas.
- [Identity boundaries](./30-cloud-fundamentals.md#t30-q05): **Deployment, startup and runtime identities need different limited authority.** A compromised application should not inherit deployment administration or unrestricted secret access.
- [Cloud evidence](./30-cloud-fundamentals.md#t30-q06): **Prove permitted work succeeds and forbidden access fails in the intended environment.** Observe recovery, control cost and record cleanup or explicitly retained resources.

## Serverless

- [Function boundaries](./20-serverless.md#t20-q01): **Functions suit trigger-driven work within platform duration and resource constraints.** Serverless still needs durable state, authorization, duplicate handling and cost limits.
- [HTTP function adapter](./20-serverless.md#t20-q02): **The platform invokes the handler; the handler does not open its own HTTP listener.** Validate the event and trusted identity, await owned work and map the trigger-specific response.
- [Duplicate queue delivery](./20-serverless.md#t20-q03): **Commit a durable event receipt with its business effect.** Repeated delivery checks that record; an in-memory Set cannot coordinate restarts and multiple instances.
- [Function budgets](./20-serverless.md#t20-q04): **Invocation concurrency multiplies connections and downstream work.** Bound memory, time, permissions and dependencies; a longer timeout does not repair stuck work or duplicate effects.
- [Provider differences](./20-serverless.md#t20-q05): **Reuse business logic through provider-specific entry adapters.** Event formats, identities, concurrency, retry and acknowledgement behavior need tests for the chosen platform.

## Put it into practice

[Deploy a service](./progressive-projects.md#project-3-deployable-service): preserve the existing application contracts while adding PostgreSQL, identity, bounded report workers and a verified lifecycle. Advanced identity and data reminders continue in [Hardening and optimization](./hardening-at-a-glance.md).
