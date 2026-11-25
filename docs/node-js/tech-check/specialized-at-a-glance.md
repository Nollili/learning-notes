---
outline: [2, 2]
---

# Specialized Node.js Systems at a glance

One short reminder for each of the **25 questions** in this section. Use the topic links to return to the full answers and diagrams.

## Queues and message-driven systems

- [Message contracts](./19-messaging.md#t19-q01): **A command requests work; an event reports something that happened.** Define version, payload, ordering and recovery; keep business-operation identity distinct from delivery-attempt identity.
- [Confirms and acknowledgements](./19-messaging.md#t19-q02): **Publisher confirm means broker acceptance; consumer acknowledgement permits delivery removal.** Commit outbox intent locally and handle repeats around publication and effect/acknowledgement crash windows.
- [Retry and dead letters](./19-messaging.md#t19-q03): **Delay and bound replay-safe temporary retries; separate permanent failures.** Immediate requeue loops worsen outages; dead letters need durable recovery state and a responsible owner.
- [Kafka offsets](./19-messaging.md#t19-q04): **Kafka retains partition records; consumers track progress rather than deleting each message.** Offset-before-effect can skip work; effect-before-offset can repeat it, so plan durable duplicate handling.
- [SQS and SNS](./19-messaging.md#t19-q05): **SQS queues work; SNS distributes notifications.** Separate subscriber queues allow independent backlogs, but receipt still does not prove durable business completion.
- [Broker compatibility](./19-messaging.md#t19-q06): **ActiveMQ Classic and Artemis are different products.** Verify exact product, protocol and Node-client acknowledgement, security, flow-control and failure contracts.

## WebSockets and Socket.IO

- [Transport choice](./08-networking.md#t08-q05): **Polling checks occasionally, SSE pushes server-to-client, WebSocket carries both directions.** Socket.IO adds its own protocol; none automatically recovers missed business messages.
- [WebSocket sessions](./08-networking.md#t08-q06): **A handshake opens a connection, not permanent permission or a bounded work queue.** Validate and authorize messages, limit queues and detect dead peers and session expiry.
- [Socket.IO guarantees](./08-networking.md#t08-q07): **Default delivery is at most once; acknowledgements mean what the handler defines.** Reconnects and retries need durable command identity when duplicate effects matter.
- [Real-time operations](./08-networking.md#t08-q08): **Budget connections, messages, work, queues and recovery before traffic.** Replaying missed updates or obtaining a fresh authorized snapshot is separate from reconnecting.

## Structured logging

- [Useful log records](./21-logging.md#t21-q01): **Record the known operation outcome with stable safe fields and appropriate level.** Avoid copying credentials, private bodies or database contents into diagnostics.
- [Structured Winston logs](./21-logging.md#t21-q02): **Select and bound allowed fields before emitting to configured transports.** Define buffering, destination failure and flush behavior; local finish does not prove remote durable storage.
- [Log context](./21-logging.md#t21-q03): **Propagate a safe correlation ID while keeping concurrent operations separate.** Record each important outcome once and pass context explicitly across process and queue boundaries.
- [Remote logging path](./21-logging.md#t21-q04): **Collection, processing, storage and search are distinct stages.** Verify ingestion and retention policies; a successful local log call does not prove a searchable remote record.

## Monitoring and diagnostic signals

- [Service health signals](./22-monitoring.md#t22-q01): **Start with user-operation success, then explain it through metrics, logs, traces and profiles.** Missing measurements differ from zero failures.
- [Metrics and labels](./22-monitoring.md#t22-q02): **Counters accumulate, gauges show current values, histograms describe distributions.** Count completion once, balance active gauges and keep labels bounded rather than using raw URLs or user IDs.
- [Prometheus and alerts](./22-monitoring.md#t22-q03): **Scraping collects samples, PromQL evaluates them, Alertmanager routes notifications.** Distinguish failures, low traffic and missing data; test rules and the notification path.
- [Dashboard trust](./22-monitoring.md#t22-q04): **Grafana queries data sources; Kibana explores Elasticsearch data.** Check ingestion, query, time range and access before interpreting a blank panel as no events.
- [Observability alternatives](./22-monitoring.md#t22-q05): **Graphite, Zabbix and New Relic occupy different monitoring roles.** Choose a concrete need and verify actual collection, access, retention and failure detection.

## Advanced real-time sessions

- [Multi-server real-time identity](./specialized-systems.md#t08-q12): **Each connection, protected action and subscription needs current permission policy.** Cross-instance adapters and room membership deliver data; they do not grant permanent access.
- [Slow clients and replay](./specialized-systems.md#t08-q13): **Bound each client's buffers and recover gaps without silently advancing the cursor.** If history expired, use an authorized resynchronization or snapshot policy.
- [Reconnect storms and shutdown](./specialized-systems.md#t08-q14): **Connection recovery, session-state recovery and heartbeat are separate concerns.** Spread and limit reconnects; close sessions, adapters and timers within shutdown deadlines.

## Native modules and WebAssembly

- [Native addons](./specialized-systems.md#t12-q08): **Node-API stability does not remove platform or library compatibility requirements.** Native code shares host authority and can crash the process or block its calling thread.
- [WebAssembly exchange](./specialized-systems.md#t12-q09): **Agree on encoding, pointer/length, bounds and allocation ownership.** Wasm integer rules and memory-growth behavior differ from ordinary JavaScript values and stable views.
- [Specialist execution choices](./specialized-systems.md#t12-q10): **Compare the complete useful workload, including conversion, startup, queues and copying.** Native or Wasm execution does not automatically improve requests or secure hostile inputs.

## Put it into practice

[Operate a specialized service](./progressive-projects.md#project-5-operated-specialized-service): retain the hardened contracts while adding broker dispatch, authorized live status, correlated telemetry and one measured specialist adapter.
