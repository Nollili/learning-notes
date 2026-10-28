# Redis Adapters: Cache Boundaries and Shared Limits — practice

**Learner status: still required.** These tasks were separated from the textbook; no completion is credited.

[Textbook explanation](../../node-js/redis-adapters.md) · [Node.js practice map](./index.md)

## Practice and acceptance

Run only against an authorized isolated Redis instance with a bounded memory policy, no public listener and separate test credentials/namespace. Do not flush a shared server. Create two independent clients/adapters to represent two app replicas and close both even on failure.

**Acceptance:** many concurrent calls through both clients allow exactly ten total requests for one subject, deny the rest, return positive bounded TTL and reset after expiry. Different tenants/users are independent; the same subject maps to one key. Verify malformed counter/type handling and expiry repair in a fresh namespace. Stop the server during calls: operation returns503 under policy, connection errors are handled, command/offline queues remain bounded and shutdown terminates. Do not equate a client timeout with rollback of a consumed slot.

For cache-aside, test valid-hit/no-source-read, malformed JSON, oversized/old-version/wrong-tenant/wrong-ID entries, read outage, fill outage, source rejection and invalid source shape. Corrupt/optional-cache failures fall back once per coalesced key; eight distinct blocked reads consume the whole budget and the ninth rejects without querying the source. Release/fail a read and prove capacity is reclaimed. Demonstrate stale-fill-after-invalidation and explain why TTL permits bounded staleness rather than strong consistency. Retain actual server/client versions and observed multi-client results. A port-based fake can test control flow but cannot prove Redis Lua atomicity, TTL or failover behavior. Learner execution remains required.

References checked2026-10-21: [node-redis6.3 release](https://github.com/redis/node-redis/releases/tag/redis@6.3.0), [client configuration](https://github.com/redis/node-redis/blob/master/docs/client-configuration.md), [connection lifetime](https://redis.io/docs/latest/develop/clients/nodejs/connect/), [Redis Lua execution](https://redis.io/docs/latest/develop/programmability/eval-intro/), [INCR counter/limit patterns](https://redis.io/docs/latest/commands/incr/), [expiry semantics](https://redis.io/docs/latest/commands/expire/). Some general Redis client guides show older commandOptions/quit APIs; the primary snippets use the installed6.3 declarations and require retesting on a version change.
