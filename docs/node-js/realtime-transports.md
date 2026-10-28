# SSE, Bounded Polling and gRPC: Choosing a Transport

## Start with the interaction and failure contract

Primary application stack remains HTTP JSON on Node24 with the [networking boundaries](./module-05-networking.md). Add SSE for one-way browser updates when a long-lived HTTP stream is useful. Use WebSocket when bidirectional message traffic justifies its connection protocol. Completion-driven polling is often enough for infrequent updates. gRPC is an alternative service-to-service RPC stack, introduced here for informed selection rather than a second mandatory backend framework.

| Choice | Strength | Operational cost/failure to test |
|---|---|---|
| Conditional HTTP polling | Ordinary HTTP/auth/cache tools | Repeated requests, stale interval, overlap/retry amplification |
| SSE/EventSource | One-way text events with native reconnection | Replay gaps, proxy buffering/idle timeout, slow clients |
| WebSocket | Bidirectional messages | Auth/subscriptions, heartbeat, message limits and queue ownership |
| gRPC | Typed cross-language RPC, streaming | Schema evolution, deadlines/status/trailers, HTTP2/proxy/browser integration |

## SSE is a framed UTF-8 HTTP response

Set Content-Type:text/event-stream, disable inappropriate storage and flush response headers. Events consist of fields terminated by a blank line. Multiple data lines join with newline; JSON.stringify of a projected object fits in one data line because embedded newlines are escaped. `id` updates EventSource's last event ID, `retry` suggests reconnection delay, and colon-prefixed comment lines can serve as heartbeats. Reconnection supplies Last-Event-ID; it does not implement replay storage or exactly-once effects for you. A204 response tells the native client to stop reconnecting. HTTP2 multiplexing changes connection constraints, not these event fields.

### A bounded in-memory progress log

```js
// progress-log.mjs — one already-authorized feed, never a global cross-tenant log
export function createProgressLog(capacity = 100) {
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 1_000)
    throw new RangeError('capacity must be 1–1000');
  let latest = 0;
  const records = [];
  const listeners = new Set();
  return {
    get latest() { return latest; },
    append(completed) {
      if (!Number.isSafeInteger(completed) || completed < 0)
        throw new TypeError('Invalid completion count');
      if (latest === Number.MAX_SAFE_INTEGER) throw new Error('Feed sequence exhausted');
      const event = Object.freeze({ id: ++latest, completed });
      records.push(event); if (records.length > capacity) records.shift();
      for (const listener of listeners) listener(event);
      return event;
    },
    after(cursor) {
      if (!Number.isSafeInteger(cursor) || cursor < 0 || cursor > latest)
        throw new RangeError('Invalid feed cursor');
      const oldest = records[0]?.id ?? latest + 1;
      return cursor < oldest - 1 ? null : records.filter(record => record.id > cursor);
    },
    subscribe(listener) {
      listeners.add(listener); return () => listeners.delete(listener);
    },
    get subscriberCount() { return listeners.size; }
  };
}
```

This bounded log illustrates replay, not durable delivery. A process restart loses the log/sequence; production needs a durable cursor domain or an epoch identifying a new log, plus a snapshot/reset protocol. Use one feed per authorized resource/tenant with a bound on the number of feeds/subscribers as well as entries. This example's synchronous subscribers must not throw; its network subscriber below catches transport failure. If arbitrary application subscribers are allowed, define their error policy separately.

### Stream with bounded queues, heartbeat and cleanup

```js
// progress-sse.mjs — Node HTTP/1.x handler, after authentication/authorization
export function openProgressStream(request, response, log, cursor,
  { heartbeatMs = 15_000, maxQueuedBytes = 16_384 } = {}) {
  if (!Number.isInteger(heartbeatMs) || heartbeatMs < 10 || heartbeatMs > 60_000 ||
      !Number.isInteger(maxQueuedBytes) || maxQueuedBytes < 256 || maxQueuedBytes > 65_536)
    throw new RangeError('Invalid server stream limits');
  const replay = log.after(cursor); // Cursor validated before response headers.
  response.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no'
  });
  response.flushHeaders();
  if (replay === null) {
    response.end('event: reset\ndata: {"reason":"history-expired"}\n\n'); return;
  }
  let closed = false, blocked = false, queuedBytes = 0;
  const queue = [];
  let heartbeat;
  let unsubscribe = () => {};
  const cleanup = () => {
    if (closed) return;
    closed = true; clearInterval(heartbeat); unsubscribe();
    queue.length = 0; queuedBytes = 0;
    response.off('drain', onDrain); response.off('error', onError);
    response.off('close', cleanup);
  };
  const fail = () => { cleanup(); response.destroy(); };
  const flush = () => {
    while (!closed && !blocked && queue.length) {
      const frame = queue.shift(); queuedBytes -= Buffer.byteLength(frame);
      try { if (!response.write(frame)) blocked = true; }
      catch { fail(); }
    }
  };
  const enqueue = frame => {
    if (closed) return;
    const size = Buffer.byteLength(frame);
    if (queuedBytes + response.writableLength + size > maxQueuedBytes) { fail(); return; }
    queue.push(frame); queuedBytes += size; flush();
  };
  const push = record => enqueue(`id: ${record.id}\nevent: progress\ndata: ${JSON.stringify(record)}\n\n`);
  const onDrain = () => { blocked = false; flush(); };
  const onError = () => fail();
  response.on('drain', onDrain); response.on('error', onError);
  response.once('close', cleanup);
  // No await between replay snapshot and subscription in this in-process log.
  unsubscribe = log.subscribe(push);
  enqueue('retry: 3000\n\n');
  for (const record of replay) push(record);
  if (!closed) heartbeat = setInterval(() => {
    // Do not pile up heartbeat comments behind a slow client.
    if (!blocked) enqueue(': heartbeat\n\n');
  }, heartbeatMs);
  return () => { cleanup(); response.end(); };
}
```

Register this handler only after verifying the session and permission for that feed. Parse the cursor as a bounded decimal safe integer from Last-Event-ID on reconnect or a validated `after` query on first connection. Reject malformed/future IDs with400 before streaming. A cookie-based EventSource uses normal credential/CORS rules; it cannot set arbitrary Authorization headers through its native constructor. Choose an intentional same-origin session route or a separately implemented streaming fetch client; do not put long-lived bearer credentials in the URL.

The queue budget includes Node's currently buffered response bytes; if full, disconnect rather than retain unlimited events. Heartbeats do not prove client receipt and TCP buffering still exists. `X-Accel-Buffering:no` is an nginx-specific hint, not a universal proxy configuration. Disable inappropriate response buffering/compression for this route and test the real ingress idle/read timeouts. Admission must bound concurrent subscribers separately. A returned disposer ends the connection during shutdown; call all owned disposers and stop publishing before exiting. This small log/handler does not provide cross-instance pub/sub, durable replay or atomic business delivery.

### Browser consumer and reset protocol

```js
// Browser-only; getSnapshot returns authorized {cursor, completed} from a real HTTP endpoint.
export async function watchProgress(getSnapshot, render, signal, onFailure = console.error) {
  let source;
  let generation = 0;
  const stop = () => { generation++; source?.close(); };
  signal.addEventListener('abort', stop, { once: true });
  async function connect() {
    const current = ++generation;
    const snapshot = await getSnapshot(signal);
    if (signal.aborted || current !== generation) return;
    if (!Number.isSafeInteger(snapshot.cursor) || snapshot.cursor < 0 ||
        !Number.isSafeInteger(snapshot.completed) || snapshot.completed < 0)
      throw new Error('Invalid progress snapshot');
    let last = snapshot.cursor;
    render(snapshot.completed);
    source = new EventSource(`/api/progress/events?after=${last}`);
    source.addEventListener('progress', event => {
      if (signal.aborted || current !== generation) return;
      try {
        const value = JSON.parse(event.data);
        if (!value || !Number.isSafeInteger(value.id) || value.id < 1 ||
            !Number.isSafeInteger(value.completed) || value.completed < 0 ||
            String(value.id) !== event.lastEventId) throw new Error('Invalid progress event');
        if (value.id <= last) return; // Deduplicate within this stream epoch.
        last = value.id; render(value.completed);
      } catch (error) { stop(); onFailure(error); } // Report a protocol failure to the owning UI.
    });
    source.addEventListener('reset', () => {
      if (signal.aborted || current !== generation) return;
      source.close(); void connect().catch(error => { stop(); onFailure(error); });
    });
    // Ordinary network errors use EventSource's reconnection and Last-Event-ID.
    // A real UI should expose reconnecting/stale/error state to the user.
  }
  try { if (!signal.aborted) await connect(); }
  catch (error) { stop(); signal.removeEventListener('abort', stop); throw error; }
  return () => { stop(); signal.removeEventListener('abort', stop); };
}
```

Snapshot and feed cursor must share one sequence/epoch contract; the server reads the header in preference to the initial query on automatic reconnect. The reset event closes this EventSource and obtains a fresh snapshot before constructing a new instance. Lost history/process epoch changes need that explicit reset; deduplication cannot recover missing business events. The consumer demonstrates a lifecycle, not a completed UI or authenticated snapshot endpoint.

Report protocol/snapshot failures rather than showing a permanent success state. For a side effect instead of a display, use durable idempotency keyed by event identity; an in-memory last ID is insufficient.

## Completion-driven polling with bounded backoff

Do not use setInterval(async...) when one request can outlive the interval. Schedule the next attempt after the previous attempt and its body processing complete. The example adapter `load(signal)` must implement status/schema/body-size checks and honor cancellation; the fetch boundary lesson supplies those concerns.

```js
export function startPolling(load, consume, {
  intervalMs = 5_000, maximumBackoffMs = 60_000, timeoutMs = 4_000,
  signal, retryable = () => false, random = Math.random, onError = console.error
} = {}) {
  for (const value of [intervalMs, maximumBackoffMs, timeoutMs])
    if (!Number.isInteger(value) || value < 1 || value > 2_147_483_647)
      throw new RangeError('Invalid polling delay');
  if (maximumBackoffMs < intervalMs) throw new RangeError('Backoff cap below interval');
  const owner = new AbortController();
  let timer, stopped = false, failures = 0;
  const stop = () => {
    if (stopped) return;
    stopped = true; clearTimeout(timer); owner.abort(); signal?.removeEventListener('abort', stop);
  };
  async function attempt() {
    if (stopped) return;
    let next = intervalMs;
    try {
      const requestSignal = AbortSignal.any([owner.signal, AbortSignal.timeout(timeoutMs)]);
      const value = await load(requestSignal);
      if (stopped) return;
      consume(value); failures = 0;
    } catch (error) {
      if (stopped) return;
      onError(error);
      if (!retryable(error)) { stop(); return; }
      failures = Math.min(failures + 1, 20);
      const cap = Math.min(maximumBackoffMs, intervalMs * 2 ** failures);
      const sample = random();
      if (!(sample >= 0 && sample < 1)) { stop(); return; }
      next = Math.max(1, Math.floor(cap * sample)); // Full jitter, bounded by the cap.
    }
    if (!stopped) timer = setTimeout(() => { void attempt(); }, next);
  }
  signal?.addEventListener('abort', stop, { once: true });
  if (signal?.aborted) stop(); else void attempt();
  return stop;
}
```

`retryable` defaults to false: classify transient failures deliberately. Authentication/schema errors should stop and surface action to the user; Retry-After and an overall retry/elapsed budget need an application policy rather than endless retries. This example caps individual backoff but can retry a transient failure indefinitely while its owner remains active; set a finite retry/elapsed budget for bounded jobs. Polling a continuously mounted live view can intentionally run until unmount.

Pause/resume on visibility/offline state only if the product defines how stale data and resumption work. Conditional requests with ETag/If-None-Match can reduce unchanged payload bytes;304 is a successful “no new representation” outcome, not malformed JSON to parse.

The adapter must settle after abort/deadline; AbortSignal.timeout does not forcibly settle an arbitrary noncooperative promise. A stuck adapter prevents overlap (this scheduler will not start a second request) but still needs transport/resource cancellation. consume and onError are synchronous trusted callbacks in this teaching contract; async processing needs to be awaited and explicitly owned, and error reporting must not throw. Do not blindly retry writes merely because this read-polling scheduler retries classified failures.

## gRPC/protobuf awareness: a worked contract

Traditional gRPC commonly carries Protocol Buffer messages over HTTP2. A .proto service describes RPC methods and messages; supported toolchains generate stubs or load descriptors. Node typically uses the pure-JS `@grpc/grpc-js` implementation with compatible protobuf tooling; do not introduce the deprecated native `grpc` package as the default.

```proto
syntax = "proto3";
package learning.v1;
service ProgressService {
  rpc GetProgress(GetProgressRequest) returns (ProgressReply);
  rpc WatchProgress(GetProgressRequest) returns (stream ProgressReply);
}
message GetProgressRequest { string course_id = 1; }
message ProgressReply {
  string course_id = 1;
  uint32 completed = 2;
  string revision = 3;
}
```

GetProgress is unary; WatchProgress is server-streaming. Other RPC forms are client-streaming and bidirectional streaming; HTTP2 transport alone does not force every method to stream. Validate course_id and authorization server-side: generated schema types are not permissions or business validation. Use explicit representations for large integer revisions/64-bit values across JavaScript; do not assume every protobuf integer is safely representable as a JS Number. Add new compatible field numbers, preserve meaning and reserve removed numbers/names rather than reusing them for another purpose. Follow the schema toolchain's compatibility rules when evolving optionality/enums/defaults.

```js
// Node client shape after constructing/loading the generated service client.
// client is a real authenticated grpc-js service stub, not implemented in this notes site.
const call = client.getProgress({ courseId: 'c1' }, {
  deadline: new Date(Date.now() + 1_500)
}, (error, reply) => {
  if (error) {
    // Inspect the stable gRPC status code; report/translate it at the boundary.
    console.error(error.code); return;
  }
  console.log(reply);
});
// Owner cancellation: call.cancel(); close the client/channel on application shutdown.
```

The runtime field naming depends on generated/loader options (for example keepCase); align the JS request shape with the selected toolchain and type declarations. An actual example requires generated code/descriptors and server setup from the official Node tutorial. This is introductory contract/readability coverage; a full deployed gRPC service is optional practice for this target.

A gRPC call completes with its own status, often carried in trailing metadata; a transport HTTP200 is not proof of RPC success. Distinguish INVALID_ARGUMENT, UNAUTHENTICATED, PERMISSION_DENIED, NOT_FOUND, UNAVAILABLE and DEADLINE_EXCEEDED, and translate them deliberately at an HTTP/browser gateway. Clients need deadlines—do not assume a useful default—and the server/downstream work must cooperate with cancellation. A timed-out write can have committed, so retries still require idempotency and a total budget. Flow control does not remove application message-size/queue/concurrency limits.

Browsers do not expose the same raw HTTP2/trailer interface as a Node gRPC client. gRPC-Web or a suitable gateway/alternative is a separate deployment/client contract with supported streaming modes; do not promise all bidirectional gRPC functionality through ordinary browser fetch. For a public browser CRUD app, HTTP JSON plus SSE can be simpler. gRPC is attractive when typed cross-language service contracts, generated clients and streaming justify its infrastructure/tooling cost. Compare debuggability, schema ownership, proxies and operational support—not a blanket “binary always faster” claim.

## Practice and acceptance evidence

[Exercises and learner checklist](../practice/node-js/realtime-transports.md).
