# Durable jobs and scheduled work

Node24, PostgreSQL16, amqplib0.10.9 and RabbitMQ4.1 form this concrete companion to Module12. The broker version is the tested fixture, not a recommendation to deploy an old release; select a supported patched version and rerun compatibility checks. Keep the modular monolith and PostgreSQL primary. A broker is justified when buffering/independent consumption is needed; an in-process EventEmitter does not supply durable delivery.

## Start one isolated broker and database

Use a disposable database; the schema below belongs to this exercise. The local broker fixture used `rabbitmq:4.1-alpine` resolved to `sha256:3dd4ce7606f9fbf2e2dbca90a02f29c19c5cdf66bf15cdf5237430e3614128ca`. Pin a reviewed digest in a reproducible fixture. Publish5672 to loopback only, use a unique container name, wait for broker health and remove only your owned container afterward. Guest credentials are solely for this isolated local tutorial. Hosted service requires TLS, scoped credentials/vhost, network restrictions, patched broker, capacity policies and backups.

Create these tables with a migration:

```sql
CREATE TABLE job_receipts(id uuid PRIMARY KEY);
CREATE TABLE job_effects(id uuid PRIMARY KEY, tenant text NOT NULL);
CREATE TABLE job_outbox(id uuid PRIMARY KEY, payload jsonb NOT NULL, published_at timestamptz);
```

The effect table represents a rebuildable local projection, not a payment/email implementation. Producers must commit business state and an outbox row together. Its payload is `{id: stableUUID, kind: 'catalogue.refresh', tenant: trustedTenant}`. The tenant is trusted producer state, never a model/client-selected authority. Real processing must also apply current policy where required.

Copy `docs/workbench/node-js/messaging/jobs-lab/rabbit.mjs` into an isolated ESM exercise with the pinned clients and Zod4.6.7:

<<< ../workbench/node-js/messaging/jobs-lab/rabbit.mjs

For a runnable one-process composition, import the module, create the configured pool, and keep publish ownership serialized:

```js
import pg from 'pg';
import {connect,applyOnce,relayOne} from './rabbit.mjs';
const pool=new pg.Pool({connectionString:process.env.DATABASE_URL,
  max:4,connectionTimeoutMillis:2000,statement_timeout:2000});
const broker=await connect(process.env.AMQP_URL,'study-catalogue');
const worker=await broker.worker(job=>applyOnce(pool,job));
try { await relayOne(pool,broker.publish); }
finally { await worker.stop();await broker.close();await pool.end(); }
```

This runs one relay pass and drains the worker; a service owner can repeat bounded passes while ready and cancel on shutdown. Do not add an uncontrolled loop to an Autocode submission. In separate producer/consumer processes, each owns its connections and closes them in its lifecycle. Do not reuse a confirm channel concurrently: the small return listener assumes one in-flight publication. For higher throughput implement per-publication correlation/confirm tracking with backpressure rather than weakening routing checks.

## Reason about each uncertain window

The relay locks one unpublished row, waits for publication confirmation and marks it published in its transaction. A crash after confirmation but before commit can publish again. The consumer commits its receipt and local effect together, then acknowledges. A crash between commit and acknowledgement causes redelivery without another local effect. **Keep stable IDs and unique receipts across restarts; an in-memory Set is insufficient.** If the commit reply is lost, redelivery checks that unique record. Distinct consumers need receipts keyed by `(consumer,id)`, not just one shared ID.

Transient failure republishes to a200ms retry queue, waits for confirmation, then acknowledges the original. Attempts0,1,2 cap effect invocations at3. Persistent failure becomes a minimal dead-letter diagnostic. Invalid schema/attempt goes directly to that path. A publish failure leaves the original unacknowledged and closes the consumer; an outer owner must mark unready and restart deliberately. No infinite nack/requeue loop or automatic busy reconnect is supplied. Alerts should include oldest age, attempts, dead letters, unacked count, safe IDs and outbox lag; never complete sensitive bodies or connection URLs.

**Durability limit:** this local classic-queue TTL/DLX fixture demonstrates mechanics, not loss-free failover. Classic dead-letter transfer can lose a message when its destination is unavailable. For stronger guarantees choose and verify quorum queues with their documented at-least-once dead-letter policy, capacity/overflow and replication requirements, or use a durable database retry scheduler that confirms each handoff. Prefer operational policies to hardcoded x-arguments in real deployments. Persistent messages and confirms do not establish cross-database/broker exactly-once execution. Retain/reconcile outbox and operation status if durable completion is a business requirement. External effects need provider idempotency/receipts and reconciliation, not this projection transaction.

`prefetch(1)` allows one active handler per consumer. Stop cancels new intake, waits up to five seconds for active handlers, then closes the channel. Unacknowledged deliveries can be delivered again. **Closing a channel does not cancel arbitrary business code**, so effects need real database/network deadlines. The application closes the connection and pool and reports a failing exit if drain fails. Broker/channel closure must affect readiness. An empty error listener only prevents an uncaught emitter exception; it does not handle operational recovery.

## Scheduling without overlap or lost checkpoints

Store schedules durably rather than assuming only one replica runs a timer. A scheduler wakes the worker; database state determines which work is due. This implementation handles hourly UTC periods. **“09:00 Europe/Budapest” is a calendar rule, not a fixed interval.** It needs explicit handling of missing/repeated local times, zone-aware occurrence calculation and a stored next UTC instant.

<<< ../workbench/node-js/messaging/jobs-lab/schedule.mjs

Execute `scheduleSchema` as a migration; insert an owned schedule with `next_run` set to the first intended UTC occurrence. Invoke `tick(pool, work)` from a bounded process/cron. Its transaction locks one due schedule with SKIP LOCKED, so a second replica skips it. The run's slot/receipt, local SQL effect and next-run checkpoint commit together. Failure rolls everything back and leaves that period due. The callback must use the supplied client for bounded SQL only; never perform irreversible external work inside it. Insert an outbox intent for email/API work and let its worker own retry/idempotency.

Each invocation processes at most one period and advances from the previous scheduled time, not from completion time. This avoids drift and permits controlled catch-up. After a long outage, define how much backlog to process or skip, and alert on delay instead of looping through years of missed work. A repeatedly failing schedule remains due and needs a failure count, backoff and operator handling. Set transaction/connection deadlines and limit accepted jobs so one stuck task cannot occupy the whole scheduler.

Transaction locks release on connection loss; leases are unnecessary for this short local SQL transaction. Long external tasks need a different durable claim/lease/fencing contract.

## Failure checks and learner acceptance

Actual local validation2026-10-26: publisher confirms, one-row outbox relay, duplicate message with one PostgreSQL effect, transient failure twice then success on attempt3, poison failure3→dead-letter (including a falsy thrown transient failure), closing an unacked channel→redelivery flag, and orderly cancellation/drain passed against real RabbitMQ. A running100ms handler completed before stop returned. PostgreSQL scheduling checks used two concurrent clients: the second skipped a locked due row; failure rolled back its receipt/checkpoint; retry committed; a future schedule was not selected. Servers/connections were closed; this is not a replicated-broker, crash-process or external-effect test.

[Related practice](../practice/node-js/jobs-and-schedules.md).

**Cache reconciliation:** Module12's cache-aside example now treats JSON as untrusted, validates schema plus tenant/id, handles corruption as a miss and bounds authoritative fallback. Its concrete Redis adapter lesson remains the implementation home; broker coverage here closes the other half of that review qualification. Required authentication/rate-limit state must fail closed/unavailable rather than adopt optional-cache fallback.

Official references checked2026-10-26: [RabbitMQ acknowledgements/confirms](https://www.rabbitmq.com/docs/confirms), [dead-letter safety and policy](https://www.rabbitmq.com/docs/dlx), [amqplib channel API](https://amqp-node.github.io/amqplib/channel_api.html), [PostgreSQL locking/SKIP LOCKED](https://www.postgresql.org/docs/16/sql-select.html), [Node signal lifecycle](https://nodejs.org/api/process.html#signal-events). Consult versioned broker docs before using a policy introduced after the tested4.1 fixture.
