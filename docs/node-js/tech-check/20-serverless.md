---
outline: [2, 3]
---

# Serverless functions and workflows

<span class="notes-section-label">**Section 3 reading path:**</span> Start with the [scheduled-report adapter](#scheduled-report-adapter) calling the existing application operation. Test it locally, then test the real report generation and persistent duplicate-protection records. HTTP Lambda and SQS show other trigger types. Project 3’s local/design checkpoint does not require a broker deployment or another cloud provider.

For unfamiliar technical terms, use the [Section 3 vocabulary guide](./index.md#section-3-vocabulary).

AWS Lambda is the primary function platform here, alongside the existing long-running Express/Fargate API. Use Node.js 24 (`nodejs24.x`) for the examples; verify runtime availability in the chosen region before deployment. Azure Functions and Google Cloud Run functions remain bounded alternatives. References checked 2026-11-05; no provider deployment is implied by the local handler checks.

### First scheduled-report adapter {#scheduled-report-adapter}

**Adapt the existing report operation rather than invent another report.** Start here after the local service works. The HTTP Lambda and SQS examples below remain useful trigger comparisons; neither is a prerequisite for this scheduled-event experiment.

Save `scheduled-report.mjs`. Supply the application’s `runReportOnce` function through dependency injection. That function verifies service identity, records each schedule occurrence persistently to prevent duplicate effects, runs the existing owner-scoped report and waits for the output file/object to be published. This adapter only reads the trigger and adds a deadline. The deployment entry creates it with the real operation and exports the returned `handler`. The local check uses a stub.

```js [scheduled-report.mjs]
export function createScheduledReportHandler({ scheduleId, runReportOnce }) {
  if (typeof scheduleId !== 'string' || !scheduleId || typeof runReportOnce !== 'function') {
    throw new TypeError('Schedule configuration required');
  }
  return async function handler(event) {
    if (event?.source !== 'aws.events' || event['detail-type'] !== 'Scheduled Event' ||
        typeof event.time !== 'string' || !Number.isFinite(Date.parse(event.time))) {
      throw new TypeError('Unsupported schedule event');
    }
    const occurrence = new Date(event.time).toISOString();
    return await runReportOnce({
      operationId: `${scheduleId}:${occurrence}`,
      signal: AbortSignal.timeout(2000)
    });
  };
}
```

Read `scheduleId` from trusted deployment configuration. The application operation supplies the owner and permissions; do not take them from event fields. This example accepts EventBridge scheduled-rule events, not every scheduler format. Allow only the intended rule to invoke the deployed function. Repeated deliveries for one scheduled time produce the same operation ID.

Save `check-scheduled-report.mjs`:

```js [check-scheduled-report.mjs]
import assert from 'node:assert/strict';
import { createScheduledReportHandler } from './scheduled-report.mjs';

const seen = [];
const handler = createScheduledReportHandler({
  scheduleId: 'daily-progress',
  async runReportOnce(request) {
    seen.push(request.operationId);
    assert.equal(request.signal.aborted, false);
    return { reportId: 'report-1' };
  }
});
const event = { source: 'aws.events', 'detail-type': 'Scheduled Event',
  time: '2026-11-23T09:00:00Z' };
assert.deepEqual(await handler(event), { reportId: 'report-1' });
await handler(event);
assert.deepEqual(seen, [
  'daily-progress:2026-11-23T09:00:00.000Z',
  'daily-progress:2026-11-23T09:00:00.000Z'
]);
await assert.rejects(handler({ ...event, source: 'unknown' }));
const failing = createScheduledReportHandler({ scheduleId: 'daily-progress',
  async runReportOnce() { throw new Error('Report failed'); } });
await assert.rejects(failing(event), /Report failed/);
```

Run `node check-scheduled-report.mjs`. It checks stable operation IDs, awaited results and error propagation. Its stub deliberately records both calls: **it does not prove persistent duplicate protection**. Next connect the real report/receipt implementation. Submit the same occurrence twice, restart the adapter and submit it again. Verify that it reuses one published artifact or reports a pending outcome that requires reconciliation, without repeating effects. Compare the decompressed rows with the direct report.

The application operation must respond to the signal; a timeout does not automatically roll back work. Leave enough invocation time for both work and cleanup. Store output in authorized persistent storage rather than Lambda’s temporary directory. Save incomplete attempts so they can be recovered. The local two-second deadline is a teaching setting, not a recommended cloud limit. Reuse the [persistent receipt/workflow notes](../jobs-and-schedules.md) and the [Project 3 handoff](./progressive-projects.md#project-2-to-project-3-handoff).


<!-- tech-check: t20-q01; level: 3 -->

## When is a function a good service boundary?

*Study depth: Foundational*

Level Up: L3 — Senior\
Tech Check level: ⭐⭐⭐

Source mapping: [R057](./requirements.md#r057), [R182](./requirements.md#r182).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

A serverless function runs code when the platform receives a trigger, such as an HTTP request, queue message or scheduled event. The provider manages the execution infrastructure. **Functions can suit limited-duration event work and changing traffic.** Compare the trigger, job duration and resource needs before choosing one over a long-running service.

**Serverless changes who operates the infrastructure; it does not remove state, retries, security or cost.** Your code still needs durable data where required, permission checks and safe handling of repeated or failed invocations.

</div>

An HTTP trigger supplies a request event. A queue trigger supplies a batch. A schedule starts work at a planned time. Their responses and retry rules differ. Keep business logic separate from these event formats so it can be tested locally. A `statusCode` response is not appropriate for every trigger.

The platform may reuse an execution environment. Shared database/SDK clients can reduce setup time, but never keep one user’s mutable state for the next invocation. Temporary files can remain during reuse, yet disappear when the environment ends. They are not persistent storage shared across invocations. A cold start means a new environment must initialize; package size, networking and setup work affect its duration.

Prefer the existing long-running API for an always-on Express service that already needs predictable connection ownership and a familiar deployment. A report transformation or queue consumer is a reasonable first function. Long jobs, heavy sustained throughput, custom runtimes or long-lived connections may fit containers better. Compare actual limits and cost rather than rewriting every service into functions.

<span class="notes-section-label">**Practice and acceptance**</span>

Choose one bounded report task and compare function versus container on trigger, duration, concurrency, database connections, failure recovery and price drivers. Accept with a clear state owner and an upper bound, not “it scales automatically.” References: [Lambda Node runtime](https://docs.aws.amazon.com/lambda/latest/dg/lambda-nodejs.html), [Lambda best practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html).

---

<!-- tech-check: t20-q02; level: 3 -->

## How do you write and test an HTTP Lambda handler?

*Study depth: Intermediate*

Level Up: L3 — Senior\
Tech Check level: ⭐⭐⭐

Source mapping: [R056](./requirements.md#r056), [R182](./requirements.md#r182).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Check that the incoming event matches the trigger's expected format. Obtain caller identity from the configured trusted authorizer, validate the request and return the response format that trigger expects. **Await work the invocation is responsible for before reporting completion.**

For an API Gateway proxy invocation, the platform calls your exported handler. **You do not start your own HTTP listener inside that handler.** Test the event-to-response behavior locally, and distinguish those checks from testing the real provider's routing and authentication.

</div>

This API Gateway HTTP API payload-v2 example expects a configured JWT authorizer. Protect the deployed route with the correct issuer/audience settings. An untrusted caller must not be allowed to invoke the function directly with fabricated identity fields. The example calculates a square and saves no data.

```js [http-function.mjs]
export async function handler(event) {
  const reply = (statusCode, value) => ({
    statusCode,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    body: JSON.stringify(value),
  });
  if (event?.version !== '2.0' || event?.requestContext?.http?.method !== 'POST') {
    return reply(400, { error: 'unsupported event' });
  }
  const claims = event.requestContext.authorizer?.jwt?.claims;
  if (typeof claims?.sub !== 'string' || !claims.sub) {
    return reply(401, { error: 'authentication required' });
  }
  const scopes = event.requestContext.authorizer.jwt.scopes;
  if (!Array.isArray(scopes) || !scopes.includes('compute:run')) {
    return reply(403, { error: 'permission denied' });
  }
  if (
    event.isBase64Encoded ||
    typeof event.body !== 'string' ||
    Buffer.byteLength(event.body) > 1024
  ) {
    return reply(400, { error: 'invalid body' });
  }
  let input;
  try {
    input = JSON.parse(event.body);
  } catch {
    return reply(400, { error: 'invalid JSON' });
  }
  if (
    !input ||
    typeof input !== 'object' ||
    Array.isArray(input) ||
    Object.keys(input).length !== 1 ||
    !Number.isSafeInteger(input.value) ||
    input.value < 0 ||
    input.value > 1000
  ) {
    return reply(400, { error: 'invalid value' });
  }
  return reply(200, { result: input.value ** 2 });
}
```

Save as `http-function.mjs` and configure handler `http-function.handler`. Add a package/lock only for dependencies actually required; package tested SDK dependencies explicitly rather than relying on a runtime-included SDK version. An HTTP fixture can supply the envelope directly:

```js [check-http-function.mjs]
import assert from 'node:assert/strict';
import { handler } from './http-function.mjs';
const event = {
  version: '2.0',
  isBase64Encoded: false,
  body: '{"value":7}',
  requestContext: {
    http: { method: 'POST' },
    authorizer: { jwt: { claims: { sub: 'u1' }, scopes: ['compute:run'] } },
  },
};
assert.equal((await handler(event)).statusCode, 200);
assert.equal(JSON.parse((await handler(event)).body).result, 49);
assert.equal((await handler({ ...event, body: '{' })).statusCode, 400);
assert.equal((await handler({ ...event, body: '{"value":-1}' })).statusCode, 400);
assert.equal(
  (await handler({ ...event, requestContext: { http: { method: 'POST' } } }))
    .statusCode,
  401,
);
const denied = structuredClone(event);
denied.requestContext.authorizer.jwt.scopes = [];
assert.equal((await handler(denied)).statusCode, 403);
```

Local events validate adapter logic but cannot prove API Gateway's actual routing/authentication policy. Treat downstream timeouts as failures or pending outcomes according to the operation; do not return success before a durable mutation completes. Log safe request/operation IDs and timings, not entire authorizer events or bodies.

<span class="notes-section-label">**Practice and acceptance**</span>

Prepare the ZIP/package and infrastructure configuration for one protected route, then in a sandbox test valid, absent and wrong-audience credentials plus malformed/base64/oversized bodies. Accept with a real authorizer-denial result and logs containing no tokens. Reference: [HTTP API Lambda payload format](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html), [Lambda handler](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-handler.html).

---

<!-- tech-check: t20-q03; level: 3 -->

## How do queue retries avoid repeating business effects?

*Study depth: Intermediate*

Level Up: L3 — Senior\
Tech Check level: ⭐⭐⭐

Source mapping: [R056](./requirements.md#r056).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

**A queue can deliver the same business event more than once.** Save a durable receipt identifying the processed event in the same local transaction as its business change. A later delivery can check that receipt and avoid repeating the effect. Then acknowledge according to the trigger's rules.

**An in-memory `Set` cannot provide durable duplicate protection**, because it is lost on restart and is not shared across instances. For batches, report failed records correctly; an overall success must not conceal work that failed. External effects need their own safe-retry and outcome-checking design.

</div>

For this SQS standard-queue integration, enable `ReportBatchItemFailures` and return IDs for failed messages. Successful records can then be removed while failed ones retry. The adapter handles records one at a time. It assumes a trusted SQS event mapping and an injected `applyOnce` operation that validates business data and saves the effect with a duplicate-protection receipt in one transaction.

```js [queue-function.mjs]
export function createHandler({ applyOnce }) {
  return async function handler(event) {
    if (!Array.isArray(event?.Records) || event.Records.length > 10) {
      throw new TypeError('unsupported batch');
    }
    // Validate every delivery identity before performing any effects.
    for (const record of event.Records) {
      if (
        record.eventSource !== 'aws:sqs' ||
        typeof record.messageId !== 'string' ||
        !record.messageId
      ) {
        throw new TypeError('invalid delivery');
      }
    }
    const batchItemFailures = [];
    for (const record of event.Records) {
      try {
        const job = JSON.parse(record.body);
        await applyOnce(job); // business event ID, not delivery ID, owns deduplication
      } catch {
        batchItemFailures.push({ itemIdentifier: record.messageId });
      }
    }
    return { batchItemFailures };
  };
}
```

Use the [persistent outbox/receipt implementation](../jobs-and-schedules.md) for real duplicate protection. Two delivery IDs can refer to the same business event, so use the stable business operation ID. Limit retries of malformed or repeatedly failing messages. Route them to a dead-letter destination and assign someone to inspect/replay them. External effects also need the provider’s idempotency and outcome checks.

Use a batch size of at most 10 for this adapter. Set visibility timeout from the function duration, batching and retry policy, and keep concurrency within dependency capacity. This example is for a standard queue. FIFO processing must stop after the first failure and report later unprocessed records to preserve order. HTTP retries, ordinary asynchronous Lambda invocations and SQS triggers have different rules.

<span class="notes-section-label">**Practice and acceptance**</span>

Locally test success/failure ID selection, then run the real durable adapter against a database. In a sandbox queue, redeliver a committed event and inject a crash before acknowledgment. Accept with one business effect, visible bounded poison handling and no swallowed failed record. References: [Lambda with SQS](https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html), [SQS error handling and partial batches](https://docs.aws.amazon.com/lambda/latest/dg/services-sqs-errorhandling.html).

---

<!-- tech-check: t20-q04; level: 3 -->

## Which configuration and operating limits matter first?

*Study depth: Intermediate*

Level Up: L3 — Senior\
Tech Check level: ⭐⭐⭐

Source mapping: [R057](./requirements.md#r057), [R093](./requirements.md#r093).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Configure the runtime, memory, timeout and concurrency, plus execution permissions, trigger access, networking, logs and metrics. **More concurrent function invocations can multiply database connections and external effects.** Set limits based on what those dependencies can handle.

**Increasing the timeout does not fix a stuck dependency or duplicate writes.** Apply appropriate downstream deadlines, safe retries and durable duplicate protection separately. Make failures visible without logging credentials or sensitive payloads.

</div>

Memory settings also affect available CPU. Benchmark the actual handler instead of choosing the smallest setting only by price. Set maximum concurrency and calculate total database connections across reused environments. Reuse a small client when supported and recover stale connections. A managed proxy may help, subject to its limits. Private-subnet functions still need network routes to dependencies; adding a VPC does not automatically provide internet access.

Give each dependency a deadline shorter than the invocation’s remaining time, with time left for reporting and cleanup. Await work the invocation is responsible for. Work left after the response may be paused or interrupted. Racing a timeout does not cancel arbitrary remote work. Do not store request credentials, user data or a changing tenant identity in reusable global variables.

Limit the execution role to required actions/resources. Restrict who may invoke the function or change its trigger. Use a managed secret/configuration mechanism with defined rotation and caching. Never log secrets or commit them as environment settings. Record invocation errors, duration, rejected/throttled calls, concurrency and queue delays with request/operation IDs.

Later options include published versions/aliases for stable release references and controlled traffic changes. Provisioned concurrency pays for prepared environments to reduce startup variation. Event destinations and workflow tools can help recovery. None replaces compatible database and event contracts. Deploy the tested package, record its version and define how rollback affects events already waiting.

<span class="notes-section-label">**Practice and acceptance**</span>

Prepare a configuration table with values and reasons, then measure cold/warm duration and throttling against a controlled sandbox workload. Demonstrate a downstream outage without a retry storm. Accept with bounded connections, alarm ownership and cleanup. References: [Lambda concurrency](https://docs.aws.amazon.com/lambda/latest/dg/lambda-concurrency.html), [execution environments](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html), [versions](https://docs.aws.amazon.com/lambda/latest/dg/configuration-versions.html).

---

<!-- tech-check: t20-q05; level: 3 -->

## How do Azure Functions and Google Cloud functions compare?

*Study depth: Intermediate*

Level Up: L3 — Senior\
Tech Check level: ⭐⭐⭐

Source mapping: [R057](./requirements.md#r057), [R181](./requirements.md#r181).



<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

AWS Lambda, Azure Functions and Google Cloud's function platform all run code in response to triggers. Their registration APIs, event formats, identities, concurrency and retry rules differ.

**Reuse the business logic, but adapt and test the platform-specific entry point.** Do not assume that one provider's HTTP response or queue acknowledgement works on another. You can explain these differences without building three production implementations; this guide keeps AWS as its primary implementation.

</div>

Azure Functions’ Node programming model v4 registers handlers through `app.http()` or other functions from `@azure/functions` 4.x. This model version is separate from the Functions host/runtime version. Use compatible runtime/package versions. Do not mix v3 `function.json` registration with v4 code registration in one app. Bindings simplify service connections, but do not automatically provide transactions or duplicate protection. Managed identity can replace fixed cloud keys.

Google's current documentation uses **Cloud Run functions** for the functions platform; older material calls it Cloud Functions. Node functions register HTTP or CloudEvent handlers using the Functions Framework, then deploy with the selected entry point/runtime and invoker/service identity. Do not assume its per-instance concurrency or event retry configuration matches Lambda. A CloudEvent ID identifies an event; the effect still needs durable deduplication and authorization.

| Adapter concern | AWS example | What to re-check on alternatives |
|---|---|---|
| HTTP envelope | API Gateway v2 event/response | Request/response types, routing and body limits |
| Event trigger | SQS mapping and partial batch IDs | Trigger delivery/retry/ordering and acknowledgment |
| Authority | Execution role plus invocation policy | Managed identity/service account and invoker rules |
| Capacity | Per-function concurrency and DB budget | Plan/instance concurrency, scaling and connection multiplication |

<span class="notes-section-label">**Practice and acceptance**</span>

Write an adapter comparison for the same pure computation without deploying another provider. Identify registration, runtime, trigger retry, secret identity, maximum concurrency and cleanup. Optional hands-on: implement one alternative locally with its official framework and retain the same business tests. References: [Azure Node developer reference](https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference-node), [Google Cloud Run functions](https://docs.cloud.google.com/run/docs/write-functions).

## Revision and practical checkpoint

Explain the trigger’s input/output contract before discussing retries. Run local format and validation tests, then distinguish them from real-provider authentication, queue delivery, persistent effects and cold-start measurements. Cloud exercises remain untested until you have execution evidence.

### Mixed practice

1. One standard-queue record fails after another succeeded. What does the enabled partial-batch adapter report?
2. A function caches the last tenant in a module variable and reuses it on the next request. Is warm reuse safe?

<span class="notes-section-label">**Answer guide — read after attempting both cases**</span>

1. Report only the failed delivery ID under ReportBatchItemFailures; keep durable business-event deduplication because even successful work can redeliver. Apply the separate stop-on-failure policy for FIFO.
2. No. Reuse infrastructure clients, not request identity. Derive a fresh trusted principal per invocation and enforce its permission on the current resource.
