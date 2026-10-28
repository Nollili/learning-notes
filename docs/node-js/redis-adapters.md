# Redis Adapters: Cache Boundaries and Shared Limits

Redis is an additional dependency, not the primary source of truth for product data. This lab uses Node24, TypeScript5.9, Zod4.6 and the redis npm client6.3.0. Server commands target Redis8.10; pin/retest the deployed server patch independently. PostgreSQL remains the authoritative database. Do not add Redis to an application that does not need the measured benefit.

## Own connection and command lifetimes

Install the exact client in the application fixture and retain its lockfile. Attach an error listener before connect; an unhandled error event can terminate the process. Configure TLS/ACLs and secrets through authorized deployment configuration. Do not log the connection URL or arbitrary error text.

<<< ../workbench/node-js/database/redis/redis-connection.ts

This deliberately disables reconnect/offline queues: an optional cache can fail quickly while the service follows its fallback policy. A supervisor or a separately bounded reconnect owner can recreate the client. A queue worker requiring continuous broker availability needs a different owned reconnect policy. Avoid one set of client options for every workload.

In client6.3 use withCommandOptions({timeout:200}) for a bounded command wait. A timeout/abort does not prove the server did not apply a write. Do not automatically retry INCR or another non-idempotent effect after an uncertain reply. socketTimeout closes a stalled connection; it does not substitute for per-command and application budgets. On shutdown, stop intake, drain owned work, then close the client; the final application deadline still applies. See [ordered shutdown](./module-10-production-ready-applications.md#9-graceful-shutdown).

## Schema-checked cache-aside with bounded fallback

<<< ../workbench/node-js/database/redis/product-cache.ts

Cache bytes, version, fields and tenant/product identity are validated. Old/corrupt/mismatched data becomes a miss, never a trusted cast. Cache read/fill failure does not replace a successful authoritative read with an error. Source failure and invalid source data do propagate; do not hide an unavailable database behind an empty product. The metric adapter must be synchronous/nonthrowing and emit fixed low-cardinality labels.

At most eight distinct reads are owned per instance, with no waiting queue; same-key callers share one promise. Hold that slot until actual source work ends, even if an outer HTTP deadline has fired. A permanently stuck driver then consumes capacity instead of creating unlimited replacements; configure the actual driver deadline to recover the slot. Across replicas, sum the budgets against useful database capacity. This is per-instance single-flight, not a distributed lock.

TTL60 is a bounded-staleness policy only when writes/reads obey the assumed cache contract. Deleting after a database commit can race with an older concurrent fill; a stale value may reappear until its TTL. For strict freshness use the authoritative store or a versioned/coordinated protocol, not a longer explanation of cache invalidation. Cache only public projections suitable for the authorized tenant; never cache an authorization decision as a product field. Use a server memory budget/eviction policy as well as TTL, measure cardinality and avoid arbitrary key construction. This code does not negative-cache missing products.

## One atomic shared fixed-window limit

Separate GET/INCR/EXPIRE requests can race or leave a permanent counter if the process dies before expiry. This small Lua script performs the decision, increment and expiry within one Redis execution. It uses one key and no unbounded loop.

<<< ../workbench/node-js/database/redis/shared-limit.ts

This contract permits ten attempts over a ten-second window anchored by that subject's first attempt. It is not a sliding-window or token-bucket limiter; bursts around window boundaries are a deliberate trade-off. Denied attempts do not increment the count. A dedicated versioned namespace and ACL prevent unrelated writers changing counter type/value. The script repairs a missing expiry under that namespace's policy. Validate before mutation: Redis script atomicity means no interleaving, not automatic rollback of writes after a later script error. Keep scripts fast because they block Redis execution.

Both application instances must use the same Redis authority, namespace, subject derivation and policy. The key HMAC avoids raw identity strings in keys; it is not permission enforcement. Trust the tenant/user only after authentication. A client-supplied IP or header is not a verified identity; apply the actual proxy-trust policy when using network subjects.

Wire allowed=false to429 with Retry-After. A Redis timeout/error is an unavailable limit authority: for this sensitive invoice operation, fail closed with a safe503 and alert; do not silently switch each replica to an independent “ten more” allowance. The cache reader's fail-open policy is different because it is only an optimization. A timed-out limit operation may already have consumed a slot; conservative denial is acceptable here. Replication failover/eviction can reset counters, so this is abuse control rather than a strict financial invariant. Use database constraints/transactions for money or inventory correctness.

## Practice and acceptance

[Exercises and learner checklist](../practice/node-js/redis-adapters.md).
