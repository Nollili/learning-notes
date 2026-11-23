---
outline: [2, 3]
---

# Serverless functions and workflows

AWS Lambda is the primary function platform here, alongside the existing long-running Express/Fargate API. Use Node.js 24 (`nodejs24.x`) for the examples; verify runtime availability in the chosen region before deployment. Azure Functions and Google Cloud Run functions remain bounded alternatives. References checked 2026-11-05; no provider deployment is implied by the local handler checks.

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

An HTTP trigger adapts a request into an event; a queue trigger delivers a batch; a schedule wakes work at intended times. Each has different response/retry semantics. Keep business logic independent of the envelope so it can be tested without a cloud account. Do not use the same `statusCode` response contract for every trigger.

Execution environments may be reused. Module-level clients can reduce setup work, but mutable per-user state must not leak between invocations. Local temporary files are ephemeral and may survive warm reuse; never rely on them as authoritative cross-invocation storage. Initialization/cold starts affect tail latency, especially with large packages, networking and expensive startup.

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

This standalone API Gateway HTTP API payload-v2 fixture expects a configured JWT authorizer. Deployment must enforce that authorizer on the route with the correct issuer/audience; a caller must not have arbitrary direct invocation authority to fabricate an event. The sample only computes a square and does not persist data.

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
Tech Check level: Related ⭐⭐⭐

Source mapping: [R056](./requirements.md#r056).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

**A queue can deliver the same business event more than once.** Save a durable receipt identifying the processed event in the same local transaction as its business change. A later delivery can check that receipt and avoid repeating the effect. Then acknowledge according to the trigger's rules.

**An in-memory `Set` cannot provide durable duplicate protection**, because it is lost on restart and is not shared across instances. For batches, report failed records correctly; an overall success must not conceal work that failed. External effects need their own safe-retry and outcome-checking design.

</div>

For an SQS standard-queue event source mapping, enable `ReportBatchItemFailures` and return failed message IDs. Successful records can be removed while failed ones retry. The adapter below processes sequentially to keep concurrency bounded; it assumes a trusted mapping supplies the SQS envelope and an injected durable `applyOnce` validates the business payload and performs receipt/effect atomically.

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

Use the [durable outbox/receipt implementation](../jobs-and-schedules.md), not a new toy Set for production. Two delivery IDs can represent the same business event; deduplicate the stable business operation. Malformed/poison messages need a bounded receive/redrive policy, a dead-letter destination, monitoring and an operator/replay owner. An external effect needs the provider's idempotency/receipt contract as well.

Configure batch size 10 or less for this adapter, visibility timeout according to function timeout/batching/retry policy, and maximum concurrency within downstream capacity. The snippet is for a standard queue. FIFO requires stopping after the first failure and reporting subsequent unprocessed records appropriately to preserve order; do not reuse this continuation policy blindly. HTTP client retries and asynchronous Lambda invocations have different semantics from an SQS mapping.

<span class="notes-section-label">**Practice and acceptance**</span>

Locally test success/failure ID selection, then run the real durable adapter against a database. In a sandbox queue, redeliver a committed event and inject a crash before acknowledgment. Accept with one business effect, visible bounded poison handling and no swallowed failed record. References: [Lambda with SQS](https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html), [SQS error handling and partial batches](https://docs.aws.amazon.com/lambda/latest/dg/services-sqs-errorhandling.html).

---

<!-- tech-check: t20-q04; level: 3 -->

## Which configuration and operating limits matter first?

*Study depth: Intermediate*

Level Up: L3 — Senior\
Tech Check level: Related ⭐⭐⭐

Source mapping: [R057](./requirements.md#r057), [R093](./requirements.md#r093).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Configure the runtime, memory, timeout and concurrency, plus execution permissions, trigger access, networking, logs and metrics. **More concurrent function invocations can multiply database connections and external effects.** Set limits based on what those dependencies can handle.

**Increasing the timeout does not fix a stuck dependency or duplicate writes.** Apply appropriate downstream deadlines, safe retries and durable duplicate protection separately. Make failures visible without logging credentials or sensitive payloads.

</div>

Memory allocation also affects available CPU; benchmark the actual handler rather than choosing the smallest setting solely on price. Reserve a maximum concurrency/budget and size database pools across warm environments. Reuse a small client where supported, recover stale connections and consider a managed proxy with its documented constraints. A function in private subnets needs a deliberate path to databases and external services/endpoints; attaching a VPC does not provide internet egress by itself.

Keep each downstream deadline within remaining invocation time, leaving time to report/clean up. Await owned promises; work started after response may be frozen or interrupted. A deadline race does not cancel an arbitrary remote operation. Avoid request-specific credentials/user data in reusable globals and never mutate a global tenant context.

Use an execution role limited to exact resources/actions; restrict who may invoke the function and who may configure its trigger. Secrets belong in a reviewed secret/config mechanism with rotation/cache behavior. Environment variables are configuration, not an excuse to log secrets or commit them. Capture invocation errors, duration, throttles, concurrency and queue age/dead letters, with correlation IDs.

Optional advanced configuration: published versions/aliases support a stable release reference and controlled traffic shifts; provisioned concurrency trades cost for reduced startup variability; event destinations and workflow orchestration make recovery explicit. They do not replace compatible schema/event contracts. Deploy the same tested package, record the version and define rollback behavior for already queued events.

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

Azure Functions' Node programming model v4 registers code with `app.http()` or another trigger-specific registration from `@azure/functions` 4.x. That programming-model version is different from the Functions host/runtime version. Use the documented matching runtime/package requirements and do not mix v3 `function.json` registration with v4 code registration in one app. Bindings can connect services declaratively, but transactional/idempotency guarantees still need examination. Managed identity can replace static cloud credentials.

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

Name the trigger contract before explaining retries. Demonstrate local envelope/validation tests, then distinguish them from real provider auth, queue delivery, durable effects and cold-start measurements. All cloud exercises remain learner work until evidence exists.

### Mixed practice

1. One standard-queue record fails after another succeeded. What does the enabled partial-batch adapter report?
2. A function caches the last tenant in a module variable and reuses it on the next request. Is warm reuse safe?

<span class="notes-section-label">**Answer guide — read after attempting both cases**</span>

1. Report only the failed delivery ID under ReportBatchItemFailures; keep durable business-event deduplication because even successful work can redeliver. Apply the separate stop-on-failure policy for FIFO.
2. No. Reuse infrastructure clients, not request identity. Derive a fresh trusted principal per invocation and enforce its permission on the current resource.
