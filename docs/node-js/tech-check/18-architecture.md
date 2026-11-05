---
outline: [2, 3]
---

# Designing service architecture

Architecture is a set of decisions about **ownership, dependencies, state and failure**. These six questions extend the completed [design-pattern catalogue](./18-patterns.md); a catalogue of classes does not replace system design. Examples use Node.js 24 and the existing Express 5/PostgreSQL path. Distributed deployment is a design exercise until tested against real infrastructure.

## How do layers and feature modules fit together? {#t18-q24}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Organize modules around business capabilities; separate transport, application policy and persistence inside each capability. **Dependency direction matters more than directory names.** A service should receive the capabilities it needs rather than import an HTTP request or construct its own database connection.

</div>

A layer groups responsibilities: a controller translates HTTP, an application service runs a use case, a repository speaks to storage. A feature groups related change: `products/` owns its router, service, validation and repository. These are compatible choices, not competing architectures.

```text
products/
  router.mjs        HTTP parsing, status and response mapping
  service.mjs       use cases, permissions and transaction boundary
  repository.mjs    parameterized persistence
composition.mjs     creates dependencies and connects the modules
server.mjs          opens the listener and owns shutdown
```

A domain rule such as “price cannot be negative” belongs to the model/use case and is reinforced by a database constraint. JSON parsing belongs at the transport edge. Returning an ORM entity directly can accidentally expose internal fields and couple your API contract to schema changes.

<span class="notes-section-label">**Worked example — inject the storage capability**</span>

```js [product-service.mjs]
import assert from 'node:assert/strict';

function createProductService({ products }) {
  return {
    async rename({ actor, id, name }) {
      if (
        !Array.isArray(actor?.permissions) ||
        !actor.permissions.includes('products:write')
      ) {
        throw new Error('forbidden');
      }
      if (typeof name !== 'string' || !name.trim() || name.length > 80) {
        throw new TypeError('invalid name');
      }
      const updated = await products.renameOwned(id, actor.tenantId, name.trim());
      if (!updated) throw new Error('not found');
      return { id: updated.id, name: updated.name };
    },
  };
}

const calls = [];
const service = createProductService({
  products: {
    async renameOwned(...args) {
      calls.push(args);
      return { id: args[0], name: args[2], internalCost: 99 };
    },
  },
});
const actor = { tenantId: 'acme', permissions: ['products:write'] };
assert.deepEqual(await service.rename({ actor, id: 'p1', name: ' New ' }), {
  id: 'p1',
  name: 'New',
});
await assert.rejects(service.rename({ actor: null, id: 'p1', name: 'New' }));
assert.deepEqual(calls, [['p1', 'acme', 'New']]);
```

The fake proves dependency direction and DTO projection; it does not prove real tenant isolation. The SQL implementation must include tenant ownership in the update predicate. An interface per function adds ceremony when there is no genuine boundary; start with a small explicit object contract.

<span class="notes-section-label">**Examiner follow-up — where does a transaction belong?**</span>

At the use case that requires the invariant. Pass its transaction-scoped repository into each operation. Separate repository calls that each open their own transaction cannot make a multi-step use case atomic.

<span class="notes-section-label">**Practice and acceptance**</span>

Extract a product rename route into these boundaries. Accept only when the service imports no Express objects, unauthorized calls never reach persistence, the real query scopes by tenant and the response excludes internal fields. Add a failure test for a missing product. See [Express routing](https://expressjs.com/en/guide/routing.html) and [framework implementation](./16-frameworks.md).

---

## What makes a module maintainable and reusable? {#t18-q25}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

A module is maintainable when its public contract is small, its ownership is clear and changes remain local. **Reuse should preserve a coherent responsibility**, not gather unrelated functions into a shared folder.

</div>

Export use cases rather than raw mutable tables. Keep dependency construction in one composition root. Inject a clock, ID generator or remote client where deterministic behavior matters; do not inject every language operation. A repository contract must state not-found behavior, ordering, concurrency and error semantics as well as method names.

A practical contract for `reserve(productId, quantity)` says whether it atomically checks stock, which domain conflict represents insufficient stock, whether it accepts an idempotency key and whether a caller can safely retry. Without that detail, swapping SQL for an in-memory implementation may change correctness while preserving the TypeScript signature.

Use consumer contract tests when several implementations share the boundary. Unit tests check policy; integration tests check the real adapter; a small end-to-end test checks wiring. Avoid a circular dependency where the service imports its router and the router imports the service: move shared domain concepts inward, rather than patching initialization order.

<span class="notes-section-label">**Design decision**</span>

A shared `Money` value object can encode currency and integer minor units. A shared `BaseService` that assumes every feature uses the same authorization, retry and transaction rules is often brittle. Prefer composition until a stable repeated contract justifies abstraction. Document who may change that contract and how older consumers are migrated.

<span class="notes-section-label">**Examiner follow-up — is Flux a backend architecture?**</span>

Flux describes unidirectional UI data flow: action → dispatcher/store → view. It can explain state transitions but does not define database transactions or independently deployed services. Keep the ladder's Flux comparison, while choosing a modular backend architecture for this course. CQRS separates commands and queries; it neither requires event sourcing nor makes authorization optional.

<span class="notes-section-label">**Practice and acceptance**</span>

Write a one-page module contract and run the same success/not-found/conflict tests against a fake and the actual adapter. Accept only when semantics match and a circular-dependency check shows no feature importing another feature's private implementation. References: [Node package entry points](https://nodejs.org/docs/latest-v24.x/api/packages.html#package-entry-points), [testing contracts](./15-testing.md#t15-q02), [Meta Flux archive](https://github.com/facebookarchive/flux/tree/main/examples/flux-concepts).

---

## When should a modular monolith become microservices? {#t18-q26}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Start with a modular monolith when one deployment and local transactions meet the requirements. Split a capability when independent ownership, isolation or scaling justifies the operating cost. **A network boundary creates partial failures and contract obligations.**

</div>

A modular monolith deploys together but keeps capability interfaces. Microservices can deploy independently and own their data. SOA is a broader service-oriented style, often with larger integration services; it is not a synonym for a particular ESB product. Event-driven architecture connects producers and consumers through events and can exist inside a monolith or across services.

Before extracting invoicing, identify its owner, API/event contract, data ownership, migration/backfill plan and service-level objective. If every change requires synchronized deployment of six services sharing the same tables, you have gained network failure without useful autonomy.

| Concern | Direct in-process call | Remote service call |
|---|---|---|
| Failure | Return or throw; process may crash | Also timeout, partial response and unknown outcome |
| Contract | Compiler/tests within one release | Backward-compatible wire format across releases |
| State | Local transaction may span modules | Separate owners; explicit consistency workflow |
| Diagnosis | Stack trace and local logs | Correlation, trace propagation and dependency metrics |

Set outbound deadlines shorter than the caller's remaining budget. Retry only classified transient failures and only with safe operation semantics; cap attempts and add jitter. Use bulkheads to keep one dependency from consuming all sockets/work slots. A circuit breaker temporarily stops calls after failures; it is not a queue, a transaction or a cure for overload. Preserve a failure response rather than returning invented success.

Advanced introductions retained: service discovery locates healthy instances; an API gateway handles edge routing; a service mesh can add transport policy but increases operating cost. A strangler migration moves one route/capability at a time with observable rollback. You do not need Kubernetes or a mesh to demonstrate the basic boundary.

<span class="notes-section-label">**Examiner follow-up — can I share an authentication database?**</span>

Prefer a documented identity contract over arbitrary table access. Even when storage is initially shared, define ownership and compatible migrations; another service must not silently mutate your private schema. Authentication is covered in the [dedicated chapter](./13-authentication-and-authorization.md).

<span class="notes-section-label">**Practice and acceptance**</span>

Write an extraction ADR comparing one deployable with two. Include three concrete failure cases, timeout budget, contract versioning, migration and rollback, operating cost and evidence needed to reverse the choice. A diagram alone does not pass. Reference: [Microsoft microservices architecture](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/microservices), [resilient systems worked notes](../module-12-resilient-distributed-systems.md).

---

## How do outbox, idempotency and sagas preserve consistency? {#t18-q27}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Commit the business change and an outbox record in one local transaction; publish asynchronously and make consumers idempotent. **The outbox closes the local dual-write gap, not every duplicate-delivery gap.** A saga coordinates several local transactions and explicit compensations.

</div>

Writing an order, then publishing an event can crash between the two. Publishing first can announce an order that never commits. An outbox stores both records in the same database commit. A relay publishes pending events, then marks delivery. A crash after broker acceptance but before marking causes duplicates, so each consumer records the event ID in the same transaction as its own database effect.

```sql [outbox-boundary.sql]
BEGIN;
INSERT INTO orders (id, status) VALUES ('order-1', 'pending');
INSERT INTO outbox (id, aggregate_id, event_type, payload)
VALUES ('event-1', 'order-1', 'OrderPlaced', '{"orderId":"order-1"}'::jsonb);
COMMIT;
```

This fragment assumes tables and constraints already exist. A real relay needs bounded batches, claim/lease ownership, retry classification, poison-message handling and retention. A consumer uses a unique `(consumer_name, event_id)` receipt; if the receipt already exists it skips the database mutation. Do not mark the receipt first and perform the effect outside that transaction.

External payment or email cannot join that local transaction. Use the provider's idempotency mechanism, retain its operation ID and reconcile unknown outcomes. **A timeout does not prove the external effect failed.** Event ordering needs an aggregate version/sequence and a partitioning policy; timestamps from different machines are not a safe global order.

A saga example: reserve inventory → authorize payment → confirm order. If payment is rejected, release inventory. Compensation is a new business action, not a database rollback across services; releasing an already-shipped item is not meaningful. Persist saga state, retry safe transitions and send irrecoverable cases to a human reconciliation workflow.

<span class="notes-section-label">**Practice and acceptance**</span>

In an owned database/broker fixture, crash after publish but before marking delivery. Replay the event twice and prove one consumer mutation. Add a payment-timeout case that stays pending reconciliation rather than charging blindly again. Accept only with durable receipts, unique constraints and observed recovery. References: [AWS transactional outbox](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html), [AWS saga orchestration](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/saga-orchestration.html).

---

## What does availability versus consistency actually mean? {#t18-q28}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

During a network partition, a distributed system cannot simultaneously guarantee linearizable results and a successful response to every request at non-failing nodes. **CAP is about partition behavior**, not a menu where every application permanently chooses any two letters.

</div>

Linearizability means operations behave as if taking effect at one instant between invocation and response, respecting real-time order. CAP availability means every request to a non-failing node eventually receives a response; it is not the same as a monthly uptime percentage. Network partitions are possible, so specify which operations reject or wait and which may serve stale state.

For a public catalogue, a stale description may be acceptable with a freshness budget. For spending the last unit of stock, accepting conflicting writes on both sides can oversell; a single authoritative owner or coordinated transaction may reject requests during a partition. “Eventual” consistency promises convergence under the model's assumptions, not a bounded delay by itself.

Database ACID consistency concerns preservation of declared invariants. Transaction isolation concerns concurrent transaction effects. Neither is interchangeable with CAP consistency. PostgreSQL Read Committed takes a new snapshot per statement; Serializable may abort a transaction so the application can retry the complete unit. A replica read may be stale even after the primary committed.

<span class="notes-section-label">**Examiner follow-up — how do users read their own writes?**</span>

Route the follow-up read to the primary, use a causal/version token with a defined wait/fallback, or return the committed representation from the write. Do not promise immediate replica visibility without an observed replication contract.

<span class="notes-section-label">**Practice and acceptance**</span>

For catalogue, checkout and audit history, specify allowed staleness, conflict policy and behavior during a partition. Accept when every operation has a clear success/failure/pending meaning and an executable two-client concurrency test is proposed. References: [Gilbert/Lynch CAP proof](https://www.cs.princeton.edu/courses/archive/spr22/cos418/papers/cap.pdf), [PostgreSQL 18 isolation](https://www.postgresql.org/docs/18/transaction-iso.html).

---

## How do you design for load without guessing? {#t18-q29}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Define a workload and latency/error objective, measure the limiting resource, then change one bottleneck. **Scaling adds capacity only when the constrained resource can use it.** Bounded admission and backpressure protect dependencies as well as the Node process.

</div>

Performance is behavior for a given workload; scalability is how that behavior changes with more load and resources. Measure request rate, p50/p95/p99 latency, errors, loop delay, CPU, heap/RSS, pool wait, database time and external-service time together. Averages hide tail failures. A saturated database is not fixed by adding more HTTP replicas and multiplying its connections.

For a stable system, Little's law relates average in-flight work, throughput and average time in the measured boundary. It does not predict tail latency or a safe queue size under overload. CPU-heavy work may need a bounded worker pool; asynchronous database calls usually do not benefit from worker threads. See [concurrency capacity ownership](./09-concurrency.md#t09-q08).

Caches trade freshness and complexity for reduced repeated work. Bound size/TTL, include tenant/permission dimensions where required, prevent stampedes with single-flight or controlled refresh and define invalidation. A timeout or cache miss must not amplify unlimited backend calls. Never cache an authorization decision forever or share a user's response across tenants.

For stateful bottlenecks, examine query plans and lock duration before adding a cache. For stateless request handling, test horizontal replicas behind a health-aware load balancer. Track queue age as well as depth; a bounded queue still needs deadline handling, rejection and fair ownership. Autoscaling needs startup time, a maximum and a dependency budget.

<span class="notes-section-label">**Practice and acceptance**</span>

Record baseline load, dataset and hardware; impose one slow dependency; then compare a bounded-admission policy with uncontrolled queuing. Accept with latency/error/resource graphs and an explanation of rejected work. Do not claim a production SLO from a laptop run. Reference: [AWS compute load distribution](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_withstand_component_failures_load_balancing.html), [Node performance hooks](https://nodejs.org/docs/latest-v24.x/api/perf_hooks.html).

## Revision and practical checkpoint

Explain the ownership boundary before naming a pattern. For one Products API, draw the module dependencies, identify the transaction, choose one failure to reject, and show how a duplicate command is handled. Keep the monolith unless you can justify extraction with a concrete requirement. The acceptance criteria above are a learner backlog; authored material and local snippet checks do not complete it.

### Mixed practice

1. A product update commits, but the process dies before notifying billing. What changes?
2. The team proposes six services sharing one schema and one release. What evidence would justify this?

<span class="notes-section-label">**Answer guide — read after attempting both cases**</span>

1. Commit a business change plus outbox intent locally, relay with durable retry, and deduplicate the consumer effect. A crash after publication can still duplicate delivery; do not promise exactly-once external effects.
2. Require a concrete ownership/scaling/isolation need and an independent contract/recovery plan. Otherwise preserve explicit modules in one deployable rather than pay the network cost without autonomy.
