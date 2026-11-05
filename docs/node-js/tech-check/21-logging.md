---
outline: [2, 3]
---

# Structured logging and diagnostic context

Use Winston 3.18.3 on Node.js 24 for the worked logger. The primary deployment emits structured records to a controlled stream; collection/storage is configured separately. This extends the [production logging lesson](../module-10-production-ready-applications.md#_6-structured-logging), keeping its application lifecycle as the integration owner. References checked 2026-11-05.

## What should a log event say, and which level should it use? {#t21-q01}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Record a stable event name, safe context, outcome and useful timing at the boundary that owns the result. Choose a level by operational significance. **Logs should explain an event without becoming a copy of private request or database state.**

</div>

Application diagnostics, access/request logs, platform logs and security/audit records have different purposes and retention. A diagnostic event supports troubleshooting; an audit event may require durable accountability, restricted alteration and a transactionally reliable handoff. Ordinary console output is not automatically an audit trail.

| Level in the selected policy | Appropriate use | Common mistake |
|---|---|---|
| error | Operation/component failed unexpectedly | Logging every denied user input as an infrastructure outage |
| warn | Degraded/abnormal condition with a handled outcome | Alerting on every retry attempt independently |
| info | Lifecycle and selected successful boundary events | Logging every internal function call |
| debug | Bounded diagnostic detail under controlled access | Leaving sensitive verbose records permanently enabled |

Winston's default npm level ordering is numeric (`error`0, `warn`1, `info`2, then more verbose levels). A logger threshold permits levels at least as important under that ordering. Other libraries such as Pino use different level conventions; do not assume `fatal`/`trace` are Winston defaults. Console is useful for tiny local scripts; a structured logger adds consistent fields, level filtering and transport policy.

Define units and schemas: `duration_ms` is different from an epoch timestamp; a route template is different from a raw URL; a safe SQLSTATE is different from the SQL statement/parameter values. Use UTC timestamps, preserve correlation across services and account for clock skew. Request IDs help find related records; they do not establish a total order or prove identity.

<span class="notes-section-label">**Practice and acceptance**</span>

Design success, invalid input, unauthorized, dependency timeout and unexpected failure events for one API. Accept when another reader can identify boundary/outcome/severity without a password, token, full body or raw query. Reference: [OWASP logging](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html), [Winston levels](https://github.com/winstonjs/winston#logging-levels).

---

## How do you configure Winston with a safe structured schema? {#t21-q02}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Configure the level/format/transports once at composition, then emit allowlisted bounded fields. **Projection before logging is stronger than hoping every nested secret gets redacted later.** A transport's local finish event is not proof of remote durable storage.

</div>

This exact fixture captures two JSON records through Winston's Stream transport. Its allowlist ignores extra properties, and correlation/route values come from trusted server state in a real application. No production server or remote collector is created.

```js [structured-logging.mjs]
import assert from "node:assert/strict";
import { PassThrough } from "node:stream";
import { once } from "node:events";
import winston from "winston";
const sink = new PassThrough();
let captured = "",
  failures = 0;
sink.on("data", (chunk) => {
  captured += chunk.toString("utf8");
});
sink.on("error", () => {
  failures++;
});
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [new winston.transports.Stream({ stream: sink })],
});
logger.on("error", () => {
  failures++;
});
function completed(record) {
  const { requestId, method, route, status, durationMs } = record;
  if (
    typeof requestId !== "string" ||
    !/^[a-z0-9-]{1,64}$/.test(requestId) ||
    !["GET", "POST", "PATCH", "DELETE"].includes(method) ||
    !["/products/:id", "unmatched"].includes(route) ||
    !Number.isInteger(status) ||
    status < 100 ||
    status > 599 ||
    !Number.isFinite(durationMs) ||
    durationMs < 0 ||
    durationMs > 3_600_000
  ) {
    throw new TypeError("invalid log record");
  }
  logger.log({
    level: status >= 500 ? "error" : status >= 400 ? "warn" : "info",
    message: "request.completed",
    service: "products-api",
    event_version: 1,
    request_id: requestId,
    method,
    route,
    status,
    duration_ms: durationMs,
  });
}
logger.debug("not emitted at info");
completed({
  requestId: "r-1",
  method: "GET",
  route: "/products/:id",
  status: 200,
  durationMs: 4,
  authorization: "secret-token",
  body: { password: "secret-password" },
});
completed({
  requestId: "r-2",
  method: "POST",
  route: "unmatched",
  status: 503,
  durationMs: 8,
});
assert.throws(() => completed({ requestId: "forged\nline" }));
const finished = once(logger, "finish");
logger.end();
await finished;
sink.end();
const records = captured
  .trim()
  .split("\n")
  .map((line) => JSON.parse(line));
assert.equal(records.length, 2);
assert.equal(records[1].level, "error");
assert(records.every((record) => typeof record.timestamp === "string"));
assert(
  !captured.includes("secret-token") && !captured.includes("secret-password"),
);
assert.equal(failures, 0);
```

The unbounded string accumulator is only a two-event assertion sink; do not deploy it as a collector. Production needs bounded queues/batches, a policy for blocked output and a safe operational owner for transport failure. Never recursively send a logger failure back through the same failing logger. A global logger with no configured transports can also buffer unexpectedly; configure a deliberate destination.

Use JSON encoding to keep record boundaries unambiguous, but still limit strings and strip/project sensitive data before formatting. Error stack/cause objects can contain credentials or application data. Serialize classified error codes plus a safe stack only where policy permits, under restricted retention/access. Hashing a stable personal identifier does not automatically anonymize it.

<span class="notes-section-label">**Practice and acceptance**</span>

Test level thresholds, nested-secret attempts, newline/oversize fields, stream errors and blocked output. Accept with bounded memory, controlled diagnostic loss/unavailability policy, no secret in final bytes and an explicit close/flush contract. References: [Winston transport lifecycle](https://github.com/winstonjs/winston), [Node streams](https://nodejs.org/docs/latest-v24.x/api/stream.html).

---

## How do request, job and database logs keep the right context? {#t21-q03}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Establish trusted correlation at the entry point, propagate a narrow context and log each boundary once. **Context propagation does not make request-supplied fields authoritative or permission checks optional.**

</div>

Generate or validate a bounded incoming correlation value according to your trust policy. In Express, establish context before downstream async work; record request outcome on the appropriate finish/close event with a once-only guard. An error response, client disconnect and committed business operation can differ. In Nest, use compatible middleware/interceptor/provider scope rather than assuming a new logger instance is needed for every call.

```js [logging-context.mjs]
import assert from "node:assert/strict";
import { AsyncLocalStorage } from "node:async_hooks";
import { setImmediate as yieldTurn } from "node:timers/promises";
const context = new AsyncLocalStorage(),
  records = [];
async function service() {
  await yieldTurn();
  const current = context.getStore();
  if (!current) throw new Error("missing request context");
  records.push({ event: "service.completed", request_id: current.requestId });
}
await Promise.all(
  ["r-a", "r-b"].map((requestId) =>
    context.run(Object.freeze({ requestId }), service),
  ),
);
assert.deepEqual(records.map((r) => r.request_id).sort(), ["r-a", "r-b"]);
assert.equal(context.getStore(), undefined);
```

This checks async isolation for two owned tasks, not every callback library or worker boundary. Bind/inject context deliberately for APIs that lose it and avoid storing entire requests, database clients or large mutable objects in the context. Worker/process/queue messages need explicit safe propagation; an AsyncLocalStorage store is not shared across those boundaries.

For SQL, log operation name, safe error class/SQLSTATE, duration and retry attempt; omit connection URIs and raw parameter values. A failed attempt may later succeed, so link attempt-level diagnostics with one final operation outcome. Keep authorization failures distinct from dependency failures. Avoid logging the same exception at controller, service, repository and middleware as four independent incidents.

For jobs, retain operation/message ID, consumer name, attempt and safe outcome; use high-cardinality IDs in restricted logs/traces rather than metric labels. A traceparent header can correlate distributed work, but an untrusted caller must not control your sampling cost or tenant authority arbitrarily.

<span class="notes-section-label">**Practice and acceptance**</span>

Run concurrent real requests/jobs with distinct IDs, induce SQL retry and client disconnect, then reconstruct each outcome. Accept with no context leakage, no duplicate incident records and a safe explanation of committed-versus-responded behavior. Reference: [Node AsyncLocalStorage](https://nodejs.org/docs/latest-v24.x/api/async_context.html), [production request logging](../module-10-production-ready-applications.md#_7-request-logging-and-correlation-ids).

---

## How do Logstash and remote logging services change the operating contract? {#t21-q04}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Collection transports records; processing parses/enriches/routes them; storage indexes/retains them; a UI queries/visualizes them. Configure identity, capacity, privacy and delivery behavior across the whole path. **A successful local logger call does not guarantee a searchable remote event.**

</div>

Logstash uses input→filter→output pipelines. It is not the same component as Winston (application emission), Elasticsearch (index/storage) or Kibana (query/UI). Prefer structured JSON input over reparsing prose with fragile patterns. This local pipeline fragment demonstrates the shape; it is not a deployed collector or an authenticated network listener:

```text [logstash-study.conf]
input { stdin { codec => json_lines } }
filter {
  if ![service] { mutate { add_field => { "service" => "products-api" } } }
  mutate { remove_field => [ "password", "authorization" ] }
}
output { stdout { codec => json_lines } }
```

Removing two top-level fields is only defense in depth; it does not redact every nested secret. Validate the configuration with the matching Logstash distribution, feed a bounded owned JSON sample and inspect exact output before adding an Elasticsearch output with reviewed credentials/TLS/index mappings. Schema/type conflicts, timestamp parsing, rejected documents and full persistent queues need alerts and recovery policies.

For a managed backend such as CloudWatch Logs, configure the application stream/agent or platform integration, region/log group/stream, scoped write identity, retention, encryption and query permissions. Distinguish the platform execution identity from the application's ordinary user permissions. Configure budgets and access controls before exporting personal or sensitive data to any third party.

Batching/backpressure, rotation, disk limits and shutdown deadlines affect loss/latency. A local file inside a replaceable container is not durable centralized storage. A collector's retry can duplicate records; include stable event/operation IDs where deduplication matters. A security audit requirement may need a durable transactional outbox, integrity/access controls and an explicit fail-closed or recovery decision instead of best-effort diagnostics.

<span class="notes-section-label">**Practice and acceptance**</span>

In an owned collector or authorized service, verify ingestion/query timestamps, safe field mappings, denied access, retention and a network/disk outage. Accept with a bounded buffer/loss policy, observable dropped/rejected events and cleanup/cost evidence. The local Winston tests do not establish a remote delivery guarantee. References: [Logstash pipeline model](https://www.elastic.co/docs/reference/logstash/how-logstash-works), [CloudWatch Logs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/WhatIsCloudWatchLogs.html), [OWASP sensitive logging guidance](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html).

## Revision and mixed practice

1. A request times out after its database mutation commits. Should the log say the mutation failed?
2. A logger reports finish, but the collector is unreachable. Can you claim the audit event was stored?

<span class="notes-section-label">**Answer guide — attempt both cases first**</span>

1. Record the separate committed business outcome and failed/unknown response delivery under one operation ID; do not infer rollback from a timeout.
2. No. Check the destination's actual acknowledgment/durability contract and the policy for retained/failed delivery.
