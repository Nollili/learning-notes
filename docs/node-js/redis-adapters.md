# Redis Adapters: Cache Boundaries and Shared Limits

Redis is an additional dependency, not the primary source of truth for product data. This lab uses Node24, TypeScript5.9, Zod4.6 and the redis npm client6.3.0. Server commands target Redis8.10; pin/retest the deployed server patch independently. PostgreSQL remains the authoritative database. Do not add Redis to an application that does not need the measured benefit.

## Own connection and command lifetimes

Install the exact client in the application fixture and retain its lockfile. Attach an error listener before connect; an unhandled error event can terminate the process. Configure TLS/ACLs and secrets through authorized deployment configuration. Do not log the connection URL or arbitrary error text.

<<< ../workbench/node-js/database/redis/redis-connection.ts

This example disables reconnect and offline queues so an optional cache fails promptly and the application can follow its fallback policy. A supervisor or a reconnect component with explicit limits can recreate the client. A queue worker that needs continuous broker availability requires a different reconnect design. **Choose client settings for the workload instead of copying one configuration everywhere.**

In client6.3 use withCommandOptions({timeout:200}) for a bounded command wait. A timeout/abort does not prove the server did not apply a write. Do not automatically retry INCR or another non-idempotent effect after an uncertain reply. socketTimeout closes a stalled connection; it does not substitute for per-command and application budgets. On shutdown, stop intake, drain owned work, then close the client; the final application deadline still applies. See [ordered shutdown](./module-10-production-ready-applications.md#9-graceful-shutdown).

## Schema-checked cache-aside with bounded fallback

<<< ../workbench/node-js/database/redis/product-cache.ts

Validate cached bytes, version, fields and tenant/product identity. Old, damaged or mismatched data counts as a cache miss, not a trusted type assertion. **An optional cache failure must not replace a successful database read with an error.** Database failure or invalid database data still propagates; do not turn an outage into an empty product. The metrics callback must be synchronous, nonthrowing and use a small fixed set of labels.

Each instance manages at most eight distinct source reads, with no waiting queue. Callers for the same key share one promise. **Keep the slot occupied until the source operation actually ends**, even after the HTTP deadline. A stuck driver consumes capacity rather than spawning unlimited replacement reads; configure a real driver deadline to release it. Count limits across all replicas against database capacity. This combines repeated reads within one instance, often called single-flight; it is not a distributed lock.

TTL60 is a bounded-staleness policy only when writes/reads obey the assumed cache contract. Deleting after a database commit can race with an older concurrent fill; a stale value may reappear until its TTL. For strict freshness use the authoritative store or a versioned/coordinated protocol, not a longer explanation of cache invalidation. Cache only public projections suitable for the authorized tenant; never cache an authorization decision as a product field. Use a server memory budget/eviction policy as well as TTL, measure cardinality and avoid arbitrary key construction. This code does not negative-cache missing products.

## One atomic shared fixed-window limit

Separate GET/INCR/EXPIRE requests can race or leave a permanent counter if the process dies before expiry. This small Lua script performs the decision, increment and expiry within one Redis execution. It uses one key and no unbounded loop.

<<< ../workbench/node-js/database/redis/shared-limit.ts

This contract permits ten attempts over a ten-second window anchored by that subject's first attempt. It is not a sliding-window or token-bucket limiter; bursts around window boundaries are a deliberate trade-off. Denied attempts do not increment the count. A dedicated versioned namespace and ACL prevent unrelated writers changing counter type/value. The script repairs a missing expiry under that namespace's policy. Validate before mutation: Redis script atomicity means no interleaving, not automatic rollback of writes after a later script error. Keep scripts fast because they block Redis execution.

Both application instances must use the same Redis authority, namespace, subject derivation and policy. The key HMAC avoids raw identity strings in keys; it is not permission enforcement. Trust the tenant/user only after authentication. A client-supplied IP or header is not a verified identity; apply the actual proxy-trust policy when using network subjects.

Map `allowed: false` to 429 with `Retry-After`. For this sensitive invoice operation, a Redis timeout or error means the shared limiting authority is unavailable: return a safe 503 and alert. **Do not give each replica a fresh independent allowance as a fallback.** This differs from an optional cache, where fallback can be appropriate. An uncertain limiter operation may already have consumed a slot, so conservative denial is acceptable. Failover or eviction can reset counters; use database constraints and transactions, not this abuse limiter, for financial or stock correctness.

## Practice and acceptance

[Exercises and learner checklist](../practice/node-js/redis-adapters.md).
