# Resilient Architecture and Distributed Systems

## Contents

1. [The distributed-systems mental model](#1-the-distributed-systems-mental-model)
2. [Choose boundaries before technologies](#2-choose-boundaries-before-technologies)
3. [Synchronous and asynchronous communication](#3-synchronous-and-asynchronous-communication)
4. [Queues and background jobs](#4-queues-and-background-jobs)
5. [Delivery guarantees and acknowledgements](#5-delivery-guarantees-and-acknowledgements)
6. [Idempotent producers and consumers](#6-idempotent-producers-and-consumers)
7. [Retries, backoff, jitter, and poison messages](#7-retries-backoff-jitter-and-poison-messages)
8. [Ordering, partitions, and competing consumers](#8-ordering-partitions-and-competing-consumers)
9. [The transactional outbox pattern](#9-the-transactional-outbox-pattern)
10. [Sagas and compensation](#10-sagas-and-compensation)
11. [Caching and invalidation](#11-caching-and-invalidation)
12. [Circuit breakers and bulkheads](#12-circuit-breakers-and-bulkheads)
13. [Eventual consistency and user-visible state](#13-eventual-consistency-and-user-visible-state)
14. [Distributed locks, leases, and fencing](#14-distributed-locks-leases-and-fencing)
15. [Operating message-driven services](#15-operating-message-driven-services)
16. [Architecture decision guide](#16-architecture-decision-guide)
17. [Failure-driven exercises](#17-failure-driven-exercises)
18. [Final review checklist](#18-final-review-checklist)

---

## 1. The distributed-systems mental model

Inside one process, a function call either returns, throws, or fails with the process. Across a network, the caller can also receive no answer and remain uncertain about what happened.

```text
request sent → connection times out

Possible realities:
1. The server never received the request.
2. The server received it but did not finish.
3. The server finished, but the response was lost.
```

The caller cannot distinguish these cases from the timeout alone. Retrying may be necessary, but it may also repeat completed work.

### Partial failure

A distributed operation can fail in only one part of the system:

- the application is running but the database is unavailable;
- a producer published a message but did not receive confirmation;
- one service version is old while another is new;
- a consumer completed a side effect but crashed before acknowledgement;
- one network route is slow while the rest of the system is healthy.

“The system is up” is therefore too broad. Ask which capability and which dependency are working.

### Important assumptions to reject

Do not assume:

- the network is reliable or instantaneous;
- messages arrive exactly once;
- messages always arrive in order;
- a timeout means that nothing happened;
- all instances see state changes at the same moment;
- clocks on different machines agree precisely;
- retries are free;
- a lock holder is still alive because its lease has not obviously expired.

Designing for these realities is resilience. Hiding them behind a library does not remove them.

### Define the consistency and failure boundary

Before implementation, answer:

- Which state changes must succeed atomically?
- Which effects may complete later?
- Can the operation be repeated safely?
- What does the caller see while work is incomplete?
- Which failures are retryable?
- Who owns recovery when automatic recovery ends?

---

## 2. Choose boundaries before technologies

Architecture begins with ownership and change boundaries, not with queues or containers.

### Modular monolith

A modular monolith is one deployable application with explicit internal modules.

```text
one deployment
├─ ordering module
├─ inventory module
├─ billing module
└─ notification module
```

**Benefits:** simple local transactions, direct calls, one deployment pipeline, easier debugging, and lower operational cost.

**Risk:** weak module boundaries can turn the codebase into tightly coupled shared state.

**Good default:** start here unless independent deployment, isolation, ownership, or scaling needs justify distribution.

### Microservices

Microservices are independently deployable services that own their behavior and usually their data.

**Potential benefits:** independent releases, team autonomy, isolated scaling, and failure containment.

**Costs:** network failures, distributed data, contract evolution, duplicated operational work, harder testing, and cross-service observability.

Do not split a system merely because it has several domain concepts. A service boundary should have a clear owner, stable purpose, and enough independence to justify its operational cost.

### Dependency direction

Business rules should depend on small interfaces, not directly on web frameworks, queue clients, or database libraries.

```ts
interface PaymentGateway {
  charge(command: {
    operationId: string;
    customerId: string;
    amountCents: number;
  }): Promise<{ paymentId: string }>;
}

class PlaceOrder {
  constructor(
    private readonly payments: PaymentGateway,
    private readonly orders: OrderRepository,
  ) {}
}
```

**What it does:** defines dependencies in terms of the use case. Infrastructure adapters implement these interfaces.

**When to use it:** use explicit boundaries around databases, queues, clocks, external APIs, and nondeterministic behavior. This makes policies testable and replacements local.

Dependency injection does not require a container. Constructor parameters are often enough.

---

## 3. Synchronous and asynchronous communication

### Synchronous request-response

The caller waits for the dependency to answer.

```text
API → inventory service → response → API response
```

**Use it when:** the caller needs the result immediately to continue or answer accurately.

**Costs:** dependency latency is added to request latency. Failure and capacity are coupled. Timeout and cancellation must be propagated.

### Asynchronous messaging

The producer records or publishes work and continues without waiting for final completion.

```text
API → durable message → consumer → later result
```

**Use it when:** work can complete later, bursts need buffering, several consumers react independently, or the producer should not wait for the slow operation.

**Costs:** duplicates, delayed results, ordering questions, retries, poison messages, and eventual consistency become application concerns.

### Do not use a queue to pretend synchronous work is asynchronous

If an HTTP request publishes a message and then blocks waiting for the consumer's answer, the queue may add complexity without removing temporal coupling. Sometimes this request-reply pattern is justified, but it needs the same timeout, correlation, capacity, and failure analysis as HTTP.

### A practical decision

Ask whether the caller can receive `202 Accepted` with an operation identifier:

```http
HTTP/1.1 202 Accepted
Location: /operations/op-123
Content-Type: application/json

{"operationId":"op-123","status":"pending"}
```

If yes, asynchronous processing may provide a clearer reliability model. The status resource must expose pending, completed, and failed outcomes.

---

## 4. Queues and background jobs

A durable queue separates producers from consumers in time.

```text
producer → broker queue → consumer
                      ↘ retry/dead-letter path
```

### What a queue can provide

- durable buffering across process restarts;
- independent producer and consumer scaling;
- controlled consumer concurrency;
- retry and dead-letter mechanisms;
- fan-out through multiple queues or subscriptions;
- reduced request latency when final work can happen later.

### What a queue does not automatically provide

- exactly-once business effects;
- unlimited capacity;
- global ordering;
- correct retry classification;
- a transaction spanning the database and broker;
- safe message schema evolution;
- business-level deduplication.

### Message design

A message should have a documented contract:

```ts
interface OrderPlacedV1 {
  messageId: string;
  type: 'order.placed.v1';
  occurredAt: string;
  correlationId: string;
  orderId: string;
  customerId: string;
  totalCents: number;
}
```

Include stable identifiers and a version. Do not place secrets or unnecessary personal data in messages. Messages may be retained, copied, replayed, or inspected by operators.

### Commands and events

- A **command** asks one logical owner to do something: `send-invoice.v1`.
- An **event** states that something happened: `order.placed.v1`.

An event should describe a completed fact. A consumer should not need to guess whether the producer expects a particular action.

### Queue depth is not enough

Monitor:

- age of the oldest ready message;
- publish and consume rates;
- unacknowledged messages;
- retry and dead-letter counts;
- processing duration;
- consumer errors and restarts.

A queue depth of ten may be serious if the oldest message is two hours old.

---

## 5. Delivery guarantees and acknowledgements

### At-most-once

A message is delivered zero or one time. Loss is possible, but duplicates are avoided by not retrying uncertain delivery.

**Suitable for:** low-value telemetry or replaceable updates where a missing item is acceptable.

### At-least-once

A message is retried until it is acknowledged or reaches a terminal policy. Loss is reduced, but duplicates are expected.

**Suitable for:** most durable business processing when consumers are idempotent.

### Exactly-once claims

Some systems provide exactly-once behavior within a narrow boundary. That does not automatically make an external email, payment, database, and queue update exactly once together.

At the business level, aim for **effectively-once effects** by combining durable delivery with idempotency, deduplication, and transactional state changes.

### Publisher confirmation

A producer should distinguish:

```text
send attempted
≠ broker accepted durably
≠ consumer processed
≠ business effect completed
```

Publisher confirms or equivalent broker acknowledgements tell the producer that the broker accepted responsibility according to its durability settings. They do not prove consumer success.

### Consumer acknowledgement timing

```ts
async function handleDelivery(delivery: Delivery): Promise<void> {
  try {
    const message = parseAndValidate(delivery.body);
    await processIdempotently(message);
    await delivery.ack();
  } catch (error) {
    await handleConsumerFailure(delivery, error);
  }
}
```

**What it does:** acknowledges only after durable processing succeeds.

**When to use it:** use this order for at-least-once processing. If the process crashes after the effect but before `ack`, the broker may redeliver. `processIdempotently` must therefore tolerate a duplicate.

Acknowledging before the effect risks message loss. Acknowledging after a non-idempotent effect risks duplication. There is no magic acknowledgement position that removes both risks across independent systems.

---

## 6. Idempotent producers and consumers

An operation is idempotent when repeating the same logical request has the same intended effect as performing it once.

### Idempotency key at an API boundary

```text
POST /payments
Idempotency-Key: checkout-7-payment-1
```

The server stores the key with the operation's outcome.

```ts
interface IdempotencyRecord {
  key: string;
  requestHash: string;
  status: 'processing' | 'completed' | 'failed';
  responseStatus?: number;
  responseBody?: unknown;
}
```

**What it does:** lets a caller repeat an uncertain request without creating another logical payment.

**When to use it:** use idempotency keys for important create or command operations that callers may retry.

Reject reuse of the same key with a different request payload. Otherwise one key can silently represent conflicting operations.

### Deduplicating a consumed message

Use a database uniqueness rule, not only an in-memory set:

```sql
CREATE TABLE consumed_messages (
  consumer_name text NOT NULL,
  message_id text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (consumer_name, message_id)
);
```

Then insert the deduplication marker and apply the business change in the same local transaction.

```text
BEGIN
  INSERT consumed_messages ...
  UPDATE business_state ...
COMMIT
acknowledge message
```

If the unique insert reports a duplicate, the consumer can acknowledge without applying the effect again.

### Natural idempotency

Some updates can be expressed as a target state:

```text
set order status to shipped
```

This is easier to repeat than:

```text
increment shipped-order counter
```

Even target-state operations need concurrency and state-transition rules. “Set shipped” should not move a cancelled order back to shipped.

### External effects

For a payment provider or email service, pass a stable operation identifier when the provider supports it. If it does not, record intent and outcome locally, then define a reconciliation process for uncertain results.

---

## 7. Retries, backoff, jitter, and poison messages

A retry is appropriate only when:

- the failure may be temporary;
- the operation is safe to repeat or protected by idempotency;
- enough time remains in the caller's budget;
- retry load will not worsen the failure.

### Classify failures

| Failure | Typical policy |
| --- | --- |
| Validation error | Do not retry |
| Authentication or permission failure | Do not retry without changed credentials/policy |
| Unique conflict caused by request | Usually do not retry unchanged request |
| Connection reset before known outcome | Retry only with idempotency and budget |
| Rate limit | Respect server guidance and retry later if allowed |
| Dependency overload | Back off; limit attempts; consider circuit breaker |
| Deadlock or serialization conflict | Retry the whole transaction a small bounded number of times |

### Exponential backoff with jitter

```ts
function retryDelayMs(attempt: number, baseMs = 100, capMs = 10_000): number {
  const exponentialCap = Math.min(capMs, baseMs * 2 ** attempt);
  return Math.floor(Math.random() * exponentialCap);
}
```

**What it does:** increases the possible delay after each failure and randomizes the actual delay.

**When to use it:** use backoff and jitter when many clients might retry the same recovering dependency. Randomization reduces synchronized retry waves.

The retry loop also needs:

- a maximum attempt count;
- an overall deadline;
- cancellation;
- retryable-error classification;
- attempt metrics and correlation;
- an idempotent operation.

### Retry amplification

If three layers each attempt a call three times, one user request can cause up to 27 dependency attempts. Choose one responsible retry layer where possible.

### Poison messages

A poison message repeatedly fails because its data or required assumption is invalid. Retrying forever blocks capacity and creates noise.

After a bounded policy, move or record it in a dead-letter path with:

- the original message and metadata;
- the classified failure;
- attempt count and timestamps;
- a safe operator workflow for inspection, repair, replay, or discard.

Dead-letter storage is not a final solution. Alert on it and assign ownership.

---

## 8. Ordering, partitions, and competing consumers

### Global ordering is expensive

A single ordered queue can limit parallelism. Many systems preserve order only within a partition or key.

```text
partition key = orderId

order-1 events → partition A → ordered for order-1
order-2 events → partition B → ordered for order-2
```

Choose a key that matches the state that must be serialized. A poor key can create a hot partition.

### Competing consumers

Several consumers can read from one work queue. Each message is handled by one consumer in the group.

**What it provides:** horizontal processing capacity and replacement when one consumer fails.

**What it changes:** completion order may differ from publication order. Shared external limits, database capacity, and partition keys still bound useful concurrency.

### Stale and reordered messages

Include a version, sequence, or state precondition when an older update must not overwrite a newer one.

```sql
UPDATE projections
SET status = $1, source_version = $2
WHERE entity_id = $3
  AND source_version < $2;
```

**What it does:** applies only a newer source version.

**When to use it:** use a monotonic version for projections and integrations that may receive delayed or reordered updates.

Do not use wall-clock timestamps as perfect ordering evidence across machines unless the architecture explicitly tolerates clock uncertainty.

### Consumer concurrency

Tune concurrency from the whole dependency chain:

```text
consumer instances × concurrency per instance
≤ useful database/API capacity
```

More consumers can increase queue throughput until a downstream resource saturates. Beyond that point they increase contention and retries.

---

## 9. The transactional outbox pattern

Consider a service that must update its database and publish an event.

```text
1. save order
2. publish order.placed
```

If the process crashes between the steps, one succeeds and the other does not. Reversing the order only reverses the inconsistency.

### Store the event with the business change

```sql
BEGIN;

INSERT INTO orders (id, customer_id, status)
VALUES ($1, $2, 'placed');

INSERT INTO outbox (id, event_type, aggregate_id, payload, occurred_at)
VALUES ($3, 'order.placed.v1', $1, $4, now());

COMMIT;
```

A separate relay reads unpublished outbox rows and publishes them.

```text
local transaction → committed outbox row → relay → broker → consumer
```

**What it does:** makes the business state and publication intent atomic within one database.

**When to use it:** use an outbox when a committed local change must eventually produce a message and no distributed transaction covers both systems.

### The relay can publish duplicates

The relay may publish successfully and crash before marking the row as published. On restart, it publishes the row again.

Therefore:

- every outbox event needs a stable ID;
- consumers must deduplicate or be naturally idempotent;
- the relay needs bounded batches and safe concurrency;
- old completed rows need an archival or deletion policy;
- outbox age and unpublished count need monitoring.

### Polling and change capture

A relay may poll rows with locking, or use database change-data-capture infrastructure. Polling is often simpler. Change capture can reduce delay and database polling but adds operational machinery.

Choose based on measured volume and latency requirements, not fashion.

---

## 10. Sagas and compensation

A local database transaction cannot atomically update independent services. A **saga** coordinates several local transactions.

```text
create order → reserve inventory → authorize payment → confirm order
```

If payment fails, the system may release the inventory reservation and cancel the order.

### Compensation is not rollback

A database rollback makes an uncommitted change invisible. A compensation is a new business action after earlier work was already visible.

It may fail. It may not perfectly erase the original effect. An email cannot be “unsent,” and a refund is not the same historical event as never charging.

### Orchestration

A central coordinator decides the next step.

**Benefits:** workflow state, timeouts, and recovery are visible in one place.

**Costs:** the coordinator needs durable state and can become coupled to many participants.

### Choreography

Services react to events without one central coordinator.

**Benefits:** loose direct coupling and natural event-driven integration.

**Costs:** the workflow can become difficult to see, debug, and change. Cycles and accidental dependencies are easy to create.

### Saga state

Persist:

- saga or operation ID;
- current step and status;
- completed steps;
- commands/events already handled;
- deadlines and attempt counts;
- compensation state;
- final outcome and reason.

The coordinator must survive restart. An in-memory chain of promises is not a durable saga.

### Prefer reservation before irreversible action

Where possible, use reversible states:

```text
inventory: available → reserved → committed
payment:    none → authorized → captured
```

Reservations need expiry and reconciliation. They reduce the need to compensate irreversible work.

---

## 11. Caching and invalidation

A cache trades freshness and complexity for lower latency or dependency load.

### Cache-aside

```ts
// Control-flow sketch; use the complete schema/budget adapter linked below.
async function findProduct(id: string): Promise<Product | null> {
  const key = productKey(verifiedTenantId, id);
  let cached: string | null = null;
  try { cached = await cache.get(key); } catch { cacheMetrics.unavailable(); }
  if (cached !== null) {
    const parsed = decodeProductEntry(cached, verifiedTenantId, id);
    if (parsed !== undefined) return parsed; // Runtime schema + tenant/id match, not a cast.
    cacheMetrics.corrupt(); // Treat malformed/old-version data as a miss.
  }
  const product = await boundedSourceLookup(verifiedTenantId, id);
  if (product !== null) {
    try { await cache.set(key, encodeProductEntry(product), { ttlSeconds: 60 }); }
    catch { cacheMetrics.writeFailed(); } // Optional optimization; authoritative read still succeeds.
  }
  return product;
}
```

**What it does:** validates a cache entry before use, treats optional-cache failure/corruption as a miss, bounds authoritative fallback, then attempts a nonessential fill. All helpers in this sketch require implementations; the [Redis adapter lab](./redis-adapters.md) supplies the concrete schema, client lifetime, bounded single-flight and atomic rate-limit path. Never replace decode with JSON.parse(...) as Product: parsing JSON does not validate the domain or tenant.

**When to use it:** use cache-aside for read-heavy data when bounded staleness is acceptable.

### Invalidation choices

- delete the cache entry after a successful write;
- update it after the source-of-truth commit;
- use a short TTL and accept bounded staleness;
- publish invalidation events;
- version keys when broad invalidation is simpler than enumeration.

Every choice has a failure window. Document which stale result is acceptable and for how long.

### Cache stampede

When a popular key expires, many requests may miss together and overload the source.

Controls include:

- single-flight request coalescing per key;
- TTL jitter so many keys do not expire together;
- stale-while-revalidate for safe data;
- concurrency limits around cache fills;
- prewarming a small set of known hot keys.

### Negative caching

Caching “not found” can protect the database from repeated misses. Use a short TTL because the object may be created soon.

### Cache failure

Decide whether the cache is:

- an optional optimization, where the app can fall back with bounded concurrency;
- required application state, where its failure should make the capability unavailable.

A sudden fallback from cache to database can overload the database. “Fail open” is not automatically safe.

### Local versus shared cache

An in-process cache is fast but differs across instances and disappears on restart. A shared cache improves cross-instance consistency but adds network latency and another dependency.

Bound every cache by size, TTL, or both. A cache without an eviction policy is a memory leak with a friendly name.

---

## 12. Circuit breakers and bulkheads

### Circuit breaker

A circuit breaker stops repeated calls to a dependency that is likely to fail.

```text
closed --failure threshold--> open --cooldown--> half-open
   ^                                               |
   └---------------- successful probes ------------┘
```

- **Closed:** calls flow normally and outcomes are measured.
- **Open:** calls fail quickly or use an approved fallback.
- **Half-open:** a limited number of probes test recovery.

**When to use it:** use a breaker when repeated calls to a failing dependency consume scarce time, connections, or threads and recovery can be probed safely.

### Retry and breaker are different

A retry helps one operation survive a temporary failure. A circuit breaker protects the service and dependency across many operations during sustained failure.

Combining them carelessly can create retry storms. Usually the retry count is small and the breaker observes final call outcomes.

### Breaker design questions

- Which failures count toward opening?
- Is the threshold based on a meaningful sample window?
- Which operation or dependency instance owns the breaker?
- How many half-open probes are allowed?
- What does the caller receive while open?
- Which metrics and state transitions are visible?

Do not use one global breaker for unrelated operations. A failing report endpoint should not necessarily block a healthy user lookup.

### Bulkhead

A bulkhead partitions capacity so one failing workload cannot consume everything.

Examples:

- separate connection pools for interactive and batch work;
- independent queues for high- and low-priority jobs;
- per-dependency concurrency limits;
- separate worker deployments for expensive reports;
- tenant-level quotas.

**What it does:** limits the blast radius of overload or failure.

**Trade-off:** reserved capacity can be idle while another partition is busy. Use evidence to choose partitions and sizes.

### Fallbacks must be truthful

A fallback may return cached data, a reduced response, or a queued operation. It must not silently claim that an important action succeeded when it did not.

---

## 13. Eventual consistency and user-visible state

With asynchronous propagation, different views may temporarily disagree.

```text
order accepted
  → order database committed
  → event published later
  → search projection updated later still
```

This is **eventual consistency** if the system is designed to converge when communication resumes.

### Make intermediate state explicit

Use statuses that match reality:

```text
pending → processing → completed
                    ↘ failed
```

Do not return “completed” merely because work was queued.

### Read-your-writes options

After a user changes state, they often expect to see it immediately. Options include:

- read the authoritative store for that workflow;
- return the accepted state in the command response;
- route temporarily using a version token;
- show a pending state until the projection catches up.

Each option has a cost. Choose it per user journey.

### Reconciliation

Retries handle expected transient failures. Reconciliation finds state that still diverged:

- accepted payments without confirmed orders;
- outbox rows not published within a threshold;
- expired reservations not released;
- projections behind their source version;
- messages in dead-letter storage.

Critical distributed workflows need a scheduled or operator-triggered reconciliation path.

---

## 14. Distributed locks, leases, and fencing

A local mutex protects only one process. Multiple processes need a shared coordination mechanism or, preferably, a storage-level correctness rule.

### Prefer atomic data operations

Before adding a distributed lock, consider:

- a unique constraint;
- a conditional update;
- optimistic version checking;
- a database row lock inside a transaction;
- partitioning work so one owner processes a key;
- an idempotency record.

These often bind the concurrency rule directly to the protected data.

### Lease-based locks

A distributed lock commonly has an expiry so a crashed owner does not hold it forever. This makes it a **lease**.

The owner can pause because of garbage collection, network delay, or process scheduling. Its lease may expire while it still believes it owns the resource. Another owner then acquires the lease.

Now two owners may act.

### Fencing tokens

A lock service can issue a monotonically increasing token:

```text
worker A obtains token 41
worker A pauses
lease expires
worker B obtains token 42 and writes
worker A resumes and attempts token 41
storage rejects token 41 because 42 is newer
```

The protected resource must validate the token. A token that is never checked provides no fencing.

### Lock design questions

- What exact invariant does the lock protect?
- What happens if the holder pauses past expiry?
- Can the protected store reject stale owners?
- How is ownership released after cancellation or crash?
- Is clock accuracy assumed?
- Can the operation instead be made idempotent or conditional?

Distributed locks coordinate access. They do not replace transactions, idempotency, or database constraints.

---

## 15. Operating message-driven services

### Consumer startup

Before declaring readiness:

- validate configuration and message schemas;
- connect to required storage and broker resources;
- verify required queues or subscriptions exist according to ownership policy;
- initialize deduplication and workflow stores;
- start consuming only when dependencies are ready.

### Graceful consumer shutdown

```text
termination signal
  → mark unready
  → stop receiving new deliveries
  → wait for bounded in-flight handlers
  → acknowledge completed work
  → requeue or abandon unfinished work according to broker semantics
  → close broker and database connections
  → exit
```

Do not acknowledge unfinished messages merely to make shutdown fast. Keep the shutdown deadline shorter than the platform's forced termination deadline.

### Observability

Record or measure:

- message ID, type, schema version, and correlation ID;
- publish confirmation latency and failures;
- queue depth and oldest-message age;
- processing and end-to-end age;
- retries, duplicate detections, and dead letters;
- consumer concurrency and saturation;
- outbox backlog and relay failures;
- saga step and compensation failures;
- breaker state and rejected calls.

Redact secrets and sensitive payload fields. Log identifiers and classifications rather than complete message bodies by default.

### Schema evolution

During rolling deployment, producers and consumers may run different versions.

Safer changes are usually additive:

- add optional fields with documented defaults;
- keep existing meanings stable;
- version when semantics break;
- let consumers tolerate fields they do not use;
- remove old fields only after all consumers migrate and retained messages expire.

Test old producers against new consumers and new producers against old consumers where compatibility is required.

### Replay

Replay is powerful for rebuilding projections or recovering from a defect. It also repeats every consumer side effect unless the design separates rebuildable state from external actions.

Before replay, define:

- the exact range and destination;
- idempotency behavior;
- whether notifications/payments are disabled;
- ordering and rate limits;
- checkpoints, monitoring, and rollback;
- who authorizes the replay.

---

## 16. Architecture decision guide

| Need | Likely starting point | Warning |
| --- | --- | --- |
| Simple business application | Modular monolith and one relational database | Keep module boundaries explicit |
| Immediate answer from another capability | Bounded synchronous call | Propagate timeout and cancellation |
| Slow work can finish later | Durable queue and operation status | Design duplicates and failure visibility |
| Database change must publish an event | Transactional outbox | Relay can publish duplicates |
| Repeated uncertain commands | Idempotency key and durable result | Bind key to request content and expiry policy |
| Multi-service business workflow | Saga with durable state | Compensation is not rollback |
| Hot, read-heavy data | Cache-aside with freshness policy | Plan invalidation and stampede control |
| Dependency fails for sustained periods | Circuit breaker plus bounded retries | Breakers need correct scope and observability |
| One workload exhausts shared capacity | Bulkhead or separate deployment | Partition sizes need measurement |
| Concurrent update to one record | Constraint, conditional update, or row lock | Distributed lock may be unnecessary |
| Cross-process exclusive lease | Lease plus fencing at protected resource | Expiry alone cannot prevent stale writers |
| Independent team release and scaling | Consider a service boundary | Count operational and consistency costs first |

### Questions before introducing distribution

1. Which concrete problem cannot be met by a modular monolith?
2. Who will own the new service in production?
3. What data does it own?
4. How are contracts versioned?
5. What happens during network partition and partial deployment?
6. How are requests, messages, and logs correlated?
7. How are duplicates, retries, reconciliation, and recovery tested?
8. Is the organization prepared to operate another deployable unit?

If these answers are vague, the boundary is not ready.

---

## 17. Failure-driven exercises

[Exercises and learner checklist](../practice/node-js/module-12-resilient-distributed-systems.md).

## 18. Final review checklist

[Exercises and learner checklist](../practice/node-js/module-12-resilient-distributed-systems.md).

### One-minute recap

Distribution introduces uncertain outcomes, duplicates, reordering, delayed visibility, and partial failure. Begin with a modular monolith unless independent deployment or isolation provides enough value to justify those costs. Use synchronous calls for immediate results and durable messaging for work that can complete later. Assume at-least-once delivery can duplicate work. Protect important effects with idempotency, acknowledgements after durable processing, and reconciliation. Use a transactional outbox to connect local commits to eventual publication.

Model cross-service workflows as durable sagas with explicit compensation. Caches require freshness and invalidation policies. Retries require deadlines, backoff, jitter, and classification. Circuit breakers stop repeated failing calls, while bulkheads limit their blast radius. Prefer data-store constraints to distributed locks; if leases protect correctness, fence stale owners. Make every intermediate state and recovery path observable.

### Further reading

- [RabbitMQ reliability guide](https://www.rabbitmq.com/docs/reliability)
- [RabbitMQ consumer acknowledgements and publisher confirms](https://www.rabbitmq.com/docs/confirms)
- [Azure Architecture Center: reliability patterns](https://learn.microsoft.com/en-us/azure/architecture/framework/resiliency/reliability-patterns)
- [Circuit Breaker pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker)
- [Bulkhead pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead)
- [Competing Consumers pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/competing-consumers)
- [Caching guidance](https://learn.microsoft.com/en-us/azure/architecture/best-practices/caching)
- [Microservice design patterns](https://learn.microsoft.com/en-us/azure/architecture/microservices/design/patterns)
