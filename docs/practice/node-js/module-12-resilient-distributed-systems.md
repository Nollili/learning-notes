# Resilient Architecture and Distributed Systems — practice

**Learner status: still required.** These tasks were separated from the textbook; no completion is credited.

[Textbook explanation](../../node-js/module-12-resilient-distributed-systems.md) · [Node.js practice map](./index.md)

## Failure-driven exercises {#_17-failure-driven-exercises}

### Exercise 1: Duplicate payment request

A client times out after the payment provider charges successfully. It repeats `POST /payments`.

Design:

- the idempotency-key contract;
- durable processing states;
- request-hash validation;
- provider operation identifiers;
- behavior while the first attempt is still processing;
- reconciliation for an unknown provider outcome.

### Exercise 2: Consumer crash after side effect

A consumer updates inventory and crashes before acknowledging the message. The broker redelivers it.

Implement a deduplication record in the same transaction as the inventory change. Explain why an in-memory set is insufficient.

### Exercise 3: Database commit plus event publication

An order exists in the database, but its event was lost during a broker outage.

Design an outbox table and relay. Define claim/locking behavior, stable event IDs, retry policy, cleanup, metrics, and consumer idempotency.

### Exercise 4: Retry storm

A dependency slows down. Three application layers each retry three times. Connection pools fill and the dependency receives more traffic while unhealthy.

Choose one retry owner. Add a deadline, jitter, a concurrency limit, and a circuit breaker. Define which errors remain retryable.

### Exercise 5: Cache stampede

A popular product key expires on 50 instances at once. All instances query the database.

Compare TTL jitter, per-instance single-flight, a shared refresh lock, and stale-while-revalidate. Explain the remaining failure cases.

### Exercise 6: Stale lock holder

A worker pauses past its lease, then resumes after another worker acquired the lock and wrote newer data.

Add fencing tokens enforced by the protected store, or redesign the write as a conditional state transition.

### Exercise 7: Multi-service order flow

Inventory reservation succeeds, payment authorization fails, and releasing inventory temporarily fails.

Model saga states, retries, compensation, deadlines, and the user-visible outcome. Add a reconciliation query for reservations stuck beyond their deadline.

For each exercise, identify the source of truth, the uncertain window, the recovery owner, and the evidence operators need.

---

## Final review checklist {#_18-final-review-checklist}

### Architecture and boundaries

- [ ] Explain why a modular monolith is often the best starting point.
- [ ] Justify a service boundary with ownership, scaling, isolation, or release needs.
- [ ] Keep business policy behind explicit interfaces.
- [ ] Identify consistency, trust, and failure boundaries.
- [ ] Choose synchronous communication only when the result is needed now.

### Messaging

- [ ] Explain at-most-once, at-least-once, and effectively-once effects.
- [ ] Distinguish publisher confirmation from consumer acknowledgement.
- [ ] Acknowledge only after durable processing.
- [ ] Make consumers idempotent with a durable uniqueness rule.
- [ ] Design bounded retries, backoff, jitter, and a dead-letter workflow.
- [ ] Choose partition keys and concurrency from real ordering and capacity needs.
- [ ] Version message contracts and test rolling compatibility.

### Data consistency

- [ ] Use an outbox when local state and publication intent must commit together.
- [ ] Expect the outbox relay to publish duplicates.
- [ ] Model sagas as durable state machines.
- [ ] Treat compensation as a new fallible business operation, not a rollback.
- [ ] Expose honest pending, completed, and failed states.
- [ ] Build reconciliation for important workflows.

### Resilience

- [ ] Set one responsible retry policy within a time budget.
- [ ] Scope circuit breakers to meaningful dependency operations.
- [ ] Isolate scarce capacity with bulkheads and concurrency limits.
- [ ] Define cache freshness, invalidation, size, failure, and stampede behavior.
- [ ] Prefer constraints and conditional writes over distributed locks.
- [ ] Use fencing when a stale lease holder could corrupt state.
- [ ] Drain message consumers safely during shutdown.
