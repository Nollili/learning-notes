---
outline: [2, 3]
---

# Performance, memory and V8

Use Node.js 24.18 as the executable baseline and record its V8/OS/architecture with results. These seven questions cover all retained performance topics with measured examples and a practical optimization workflow. **A local fixture is not production capacity evidence.** Keep correctness, security and failure behavior constant when comparing an optimization. References checked 2026-11-05.

## What does V8 optimize, and what does node:v8 expose? {#t12-q01}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

V8 executes JavaScript using interpreter/compiler tiers and garbage collection; optimizations depend on observed behavior and engine version. `node:v8` exposes selected diagnostics/serialization APIs. **Engine internals and the public Node diagnostic API are different contracts.**

</div>

V8 can specialize frequently executed operations and invalidate assumptions when behavior changes. Object shapes/hidden classes and inline caches help explain why predictable access can matter, but a style rule such as “classes are always faster” is not a measurement. Runtime tiers and flags change across V8 versions. Do not spread engine-specific tricks through business code before locating a real hot path.

Use consistent data models when they also improve clarity. Prefer an algorithm with less unnecessary work or fewer database calls before a small property-access trick. Type changes, sparse arrays or dynamically changing object layouts can affect specialization, but the result depends on the complete workload. A profile's deoptimization event is evidence to investigate, not proof that the event dominates latency.

```js [engine-baseline.mjs]
import assert from 'node:assert/strict';
import { getHeapStatistics } from 'node:v8';
const heap = getHeapStatistics();
assert(Number.isFinite(heap.heap_size_limit) && heap.heap_size_limit > 0);
console.log({
  node: process.version,
  v8: process.versions.v8,
  platform: process.platform,
  arch: process.arch,
  heapLimitBytes: heap.heap_size_limit,
});
```

`node:v8` is not the C++ addon API. Native addons/Node-API and WebAssembly are specialized later topics, not prerequisites for profiling an Express route. A larger heap limit may postpone out-of-memory failure while increasing retained state/GC cost; it does not remove a leak. Avoid arbitrary `setFlagsFromString` tuning in application startup; use supported deployment configuration and repeatable evidence.

<span class="notes-section-label">**Practice and acceptance**</span>

Save the runtime baseline, identify one real hot function and propose a clarity-preserving change. Accept with identical results and repeated before/after profiles under the same workload; do not infer improvement from engine terminology alone. References: [Node24 v8 API](https://nodejs.org/download/release/v24.18.0/docs/api/v8.html), [V8 hidden classes](https://v8.dev/docs/hidden-classes).

---

## How do CPU profiles and load tests answer different questions? {#t12-q02}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

A load test measures externally observed service behavior; a CPU profile samples where execution time is spent. Correlate both with dependency and resource metrics. **A wide CPU frame is not proof of a slow database**, and an idle CPU does not prove the service is healthy.

</div>

Define input mix, payload/dataset, arrival model, connection reuse, warm-up, duration, concurrency and target latency/error budget. Report achieved throughput and p50/p95/p99 with failures, not only averages. A closed-loop client waits for responses and can hide overload by reducing offered requests; record offered load and queue/admission behavior. Run the generator separately when local CPU competition would distort results.

Use this bounded workload to learn profile acquisition, not to benchmark the Products API:

```js [profile-workload.mjs]
import assert from 'node:assert/strict';
function checksum(rounds) {
  let value = 0;
  for (let i = 0; i < rounds; i++) value = (Math.imul(value, 33) ^ i) >>> 0;
  return value;
}
const result = checksum(20_000_000);
assert(Number.isInteger(result));
console.log({ checksum: result });
```

```sh
# In an owned example directory; profiles can contain sensitive application data.
mkdir profiles
node --cpu-prof --cpu-prof-dir=./profiles profile-workload.mjs
```

Open the resulting `.cpuprofile` in a compatible DevTools performance viewer. Check self time versus inclusive time and the call chain. A sampled profile can miss short events and includes profiler overhead. A flame graph's width normally aggregates sampled work, not a chronological request trace. Use request/dependency spans to connect an expensive frame to a user operation. Protect inspector access; never expose a debug listener publicly.

For repeatable framework load tests, reuse [Testing's separate benchmark/load work](./15-testing.md#t15-q06) and record the exact tool/version. Compare multiple runs, interleave baseline/candidate when possible, preserve checksums/business invariants and explain variability. Do not turn one fastest iteration or a modified dataset into a performance claim.

<span class="notes-section-label">**Practice and acceptance**</span>

Acquire a real profile under an owned API workload, identify a candidate bottleneck, then test one change with the same request mix. Accept with the artifact, throughput/tails/errors, resource evidence, variance and an explanation of where the time moved. Reference: [Node profiling](https://nodejs.org/en/learn/getting-started/profiling), [CPU profile CLI](https://nodejs.org/download/release/v24.18.0/docs/api/cli.html#--cpu-prof).

---

## What do event-loop delay, utilization and request latency tell you? {#t12-q03}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Request latency includes queueing and dependencies; loop delay measures scheduling delay; loop utilization describes active versus idle loop time. **None is interchangeable with process CPU utilization.** Observe them together over the same interval.

</div>

High CPU plus high loop delay suggests JavaScript/native synchronous work; low CPU plus growing pool wait suggests a constrained dependency or admission issue. Memory/GC, slow clients and host throttling can complicate both. Measure process CPU deltas, RSS/heap, database wait/execution and request outcomes alongside loop signals.

```js [loop-metrics.mjs]
import assert from 'node:assert/strict';
import { monitorEventLoopDelay, performance } from 'node:perf_hooks';
import { setTimeout as sleep } from 'node:timers/promises';
const histogram = monitorEventLoopDelay({ resolution: 10 });
const baseline = performance.eventLoopUtilization();
const cpu = process.cpuUsage(),
  start = performance.now();
histogram.enable();
try {
  await sleep(50);
  const until = performance.now() + 25;
  while (performance.now() < until) {
    /* controlled blocking, not service code */
  }
  await sleep(50);
  const usage = performance.eventLoopUtilization(baseline);
  assert(histogram.count > 0);
  assert(usage.utilization >= 0 && usage.utilization <= 1);
  console.log({
    elapsedMs: performance.now() - start,
    loopP99Ms: histogram.percentile(99) / 1e6,
    loopUtilization: usage.utilization,
    cpuMicroseconds: process.cpuUsage(cpu),
  });
} finally {
  histogram.disable();
}
```

The histogram reports nanoseconds; convert explicitly. The fixture deliberately creates one blocking interval but does not assert an exact p99 or portable threshold. Reset/rotate observation windows and disable observers on shutdown. Keep metric cardinality bounded: a unique label per URL/user/request can exhaust a monitoring backend. Marks/measures and diagnostic listeners also need retention/cleanup.

<span class="notes-section-label">**Practice and acceptance**</span>

Compare a CPU-heavy route, a slow database and a slow response consumer under the same request envelope. Accept when you can distinguish time waiting from time executing, retain correct units and avoid claiming one metric identifies every cause. Reference: [Node performance APIs](https://nodejs.org/download/release/v24.18.0/docs/api/perf_hooks.html), [process CPU/memory](https://nodejs.org/download/release/v24.18.0/docs/api/process.html).

---

## How do memory retention, GC and Buffer ownership affect performance? {#t12-q04}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

A leak retains objects no longer needed by the application; GC only reclaims unreachable memory. Inspect heap, external allocations and RSS separately. **A small Buffer view can retain a large backing allocation**, and a copy changes ownership as well as cost.

</div>

`heapUsed` covers managed JavaScript heap; `external` includes selected externally held memory; `arrayBuffers` is included within external accounting, so do not add the fields as independent totals. RSS includes the resident process memory footprint, including native memory, code and stacks. Rising RSS with stable heap can have causes beyond JavaScript leaks, including native allocations/fragmentation.

```js [buffer-ownership-cost.mjs]
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
const source = Buffer.alloc(1024 * 1024, 7);
const view = source.subarray(0, 16),
  copy = Buffer.from(view);
source[0] = 9;
assert.equal(view[0], 9);
assert.equal(copy[0], 7);
assert.equal(view.buffer, source.buffer);
const run = (fn) => {
  const start = performance.now();
  let checksum = 0;
  for (let i = 0; i < 100_000; i++) checksum += fn(source)[0];
  return { elapsedMs: performance.now() - start, checksum };
};
// Warm both operations; do not infer interchangeable semantics from timings.
run((b) => b.subarray(0, 16));
run((b) => Buffer.from(b.subarray(0, 16)));
const samples = [];
for (let round = 0; round < 4; round++) {
  const modes = round % 2 ? ['copy', 'view'] : ['view', 'copy'];
  for (const mode of modes) {
    const result = run(
      mode === 'view'
        ? (b) => b.subarray(0, 16)
        : (b) => Buffer.from(b.subarray(0, 16)),
    );
    assert.equal(result.checksum, 900_000);
    samples.push({ mode, ...result });
  }
}
console.log({ samples, memory: process.memoryUsage() });
```

The view avoids a copy but aliases source data and can keep the 1 MiB allocation alive. The copy isolates 16 bytes but may use a pooled backing allocation. These micro-timings are observations, not a universal zero-copy speed claim. Do not expose `Buffer.allocUnsafe` bytes until every visible byte is initialized; an incomplete fill can disclose old memory. For large data, stream with bounded chunks instead of repeated growing `Buffer.concat` calls.

A healthy heap may rise and fall with GC. Compare post-workload retained object counts/retaining paths over repeated equivalent cycles, not just one before/after `memoryUsage()` sample. Full heap snapshots pause execution, can require substantial extra memory and may contain secrets; take them on a disposable/replaceable instance with a protected artifact location. Sampling allocation profiles have different overhead and cannot show every retaining path. Do not force GC in production as a leak fix.

<span class="notes-section-label">**Practice and acceptance**</span>

Create a controlled retained-listener/cache leak in an owned fixture, acquire before/after snapshots or allocation profiles and identify the retaining root. Fix ownership, repeat the workload and compare retained state. Accept with evidence, not a single decreasing RSS number. References: [Buffer semantics](https://nodejs.org/download/release/v24.18.0/docs/api/buffer.html), [heap snapshot safety](https://nodejs.org/en/learn/diagnostics/memory/using-heap-snapshot).

---

## Why does async syntax not solve CPU saturation or overload? {#t12-q05}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Async I/O can avoid blocking while waiting; synchronous JavaScript computation still occupies its executing thread. Scale the measured bottleneck and bound admission. **Wrapping CPU work in a Promise does not move it to another core.**

</div>

A synchronous configuration read before startup may be acceptable, while repeated synchronous disk/crypto work in request handling delays unrelated requests. JSON parse/stringify, regular expressions and decompression can be expensive even when surrounded by async functions. Limit input size/complexity and use known-safe algorithms; never demonstrate catastrophic regex inputs on an unbounded live service.

Break work into bounded chunks with real event-loop yielding when fairness is sufficient, or use a [bounded reusable CPU worker pool](./09-concurrency.md#t09-q04) when parallel execution justifies serialization/startup costs. `await Promise.resolve()` schedules a microtask and does not guarantee timers/I/O get a fair turn. Long microtask chains can starve other work. Workers still consume CPU/memory and need cancellation/error/shutdown ownership.

Performance asks how the system behaves for a workload; scalability asks how it changes with load/resources. More HTTP replicas help only if the shared database/service can sustain the added pressure. Little's law relates average throughput, time and in-flight work under appropriate stable conditions; it is not a tail-latency prediction or an overload-proof queue-sizing formula. Track offered load, queued age and rejected work as well as successful throughput.

Choose an overload response: reject bounded excess, shed optional work, apply backpressure or queue durably with a documented deadline. An unlimited in-memory queue converts overload into latency and memory failure. A timeout that only abandons waiting can leave expensive work alive and make the next retry worse.

<span class="notes-section-label">**Practice and acceptance**</span>

Implement equivalent bounded CPU work on the main loop, in yielding chunks and in the existing worker pool. Compare responsiveness, overhead and total work; test overload rejection/cancellation. Accept with identical output, measured tails/resources and no surviving owned workers/queues. Reference: [Node event-loop/worker-pool guidance](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop), [production model selection](./09-concurrency.md#t09-q08).

---

## How do you add a cache without losing correctness? {#t12-q06}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Define the authoritative source, key scope, freshness/invalidation, capacity and failure policy before caching. **A faster stale or cross-tenant answer is a regression.** Bound entries and work triggered by misses.

</div>

This synchronous local TTL/LRU fixture stores only validated immutable product DTOs. It demonstrates entry count, expiry and ownership, not Redis replication, a shared authorization cache or miss-load concurrency control.

```js [bounded-product-cache.mjs]
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
function createCache({ max = 2, ttlMs = 100, now = () => performance.now() } = {}) {
  if (
    !Number.isSafeInteger(max) ||
    max < 1 ||
    max > 1000 ||
    !Number.isSafeInteger(ttlMs) ||
    ttlMs < 1 ||
    ttlMs > 60_000 ||
    typeof now !== 'function'
  ) {
    throw new TypeError('invalid cache policy');
  }
  const entries = new Map();
  function key(tenant, id) {
    if (
      typeof tenant !== 'string' ||
      !tenant ||
      tenant.length > 40 ||
      !Number.isSafeInteger(id) ||
      id < 1
    )
      throw new TypeError('invalid cache key');
    return JSON.stringify([tenant, id]);
  }
  return {
    set(tenant, id, dto) {
      const k = key(tenant, id);
      if (
        !dto ||
        dto.id !== id ||
        typeof dto.name !== 'string' ||
        dto.name.length > 80
      ) {
        throw new TypeError('invalid DTO');
      }
      entries.delete(k);
      entries.set(k, {
        value: Object.freeze({ id, name: dto.name }),
        expires: now() + ttlMs,
      });
      while (entries.size > max) entries.delete(entries.keys().next().value);
    },
    get(tenant, id) {
      const k = key(tenant, id),
        entry = entries.get(k);
      if (!entry) return undefined;
      if (entry.expires <= now()) {
        entries.delete(k);
        return undefined;
      }
      entries.delete(k);
      entries.set(k, entry);
      return entry.value;
    },
    delete(tenant, id) {
      return entries.delete(key(tenant, id));
    },
  };
}
let clock = 0;
const cache = createCache({ now: () => clock });
const dto = { id: 1, name: 'Pen' };
cache.set('a', 1, dto);
dto.name = 'Changed';
assert.equal(cache.get('a', 1).name, 'Pen');
assert.equal(cache.get('b', 1), undefined);
cache.set('a', 2, { id: 2, name: 'Paper' });
cache.get('a', 1);
cache.set('a', 3, { id: 3, name: 'Ink' });
assert.equal(cache.get('a', 2), undefined);
clock = 100;
assert.equal(cache.get('a', 1), undefined);
assert.throws(() => cache.set('a', 3, { id: 4, name: 'Wrong ID' }));
```

Use a monotonic process-local clock for these TTL durations; its timestamps are not portable persistent expiry times. A tenant-scoped key is only one part of permission policy; authorize before returning a cached response and account for permission/resource versions. For cache-aside writes, commit the authoritative change, then invalidate/update under a documented race policy. “Invalidate after write” can still race with a slow old read repopulating stale data; use versions or a bounded freshness policy when that matters.

Prevent miss stampedes with bounded single-flight/loading admission, refresh jitter or a durable precomputation strategy. Limit both entries and payload bytes; this fixture's bounded small DTO makes a count cap meaningful. Negative caching needs short deliberate TTL and must not expose another user's existence. Optional cache outages can fall back only under bounded authoritative capacity; required session/rate-limit state needs a different fail-closed/unavailable policy. See the [real Redis adapter](../redis-adapters.md).

<span class="notes-section-label">**Practice and acceptance**</span>

Test expiry, eviction, tenant separation, mutation isolation, invalidation race and concurrent misses. Accept with bounded cache and loader capacity, a documented stale window and evidence that permissions remain current. References: [Redis cache patterns](https://redis.io/docs/latest/develop/use/client-side-caching/), [existing consistency notes](../module-12-resilient-distributed-systems.md).

---

## How do you optimize an Express or Nest application responsibly? {#t12-q07}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Profile the complete request path, fix repeated/oversized work and compare the same business operation before changing frameworks. **Framework overhead may be smaller than serialization, logging, queries or dependency wait.** Preserve guards, validation and cleanup while optimizing.

</div>

A useful route budget separates parsing/validation, identity/authorization, service logic, database acquisition/execution, mapping/serialization and response transfer. Count queries to reveal N+1; project required columns and use bounded pagination before replacing middleware. Bound logging and redact secrets; synchronous or huge logs can become the bottleneck. Compression trades CPU for transfer and may belong at the trusted proxy; avoid compressing secret-bearing responses together with attacker-controlled content without a reviewed threat model.

For Express5, use deliberate middleware order, production error handling, supported proxy/cache settings and [measured lifecycle gates](./16-advanced-api-frameworks.md#t16-q18). For Nest, understand singleton versus request-scoped providers and interceptor/guard/pipe overhead. An adapter change (for example Fastify) changes plugin/middleware behavior; verify compatibility and actual gains instead of treating it as a universal upgrade.

Disable no security control merely to improve a benchmark. Reuse clients under a clear lifecycle, remove unnecessary deep object conversion and stream large outputs with backpressure when the contract permits it. Reverse-proxy caching must preserve auth, tenant, cookie and `Vary` semantics. A static-asset optimization does not necessarily improve an authenticated database mutation.

<span class="notes-section-label">**Practice and acceptance**</span>

Use the advanced framework experiment to change one middleware/service operation, with both successful and unauthorized requests in the workload. Accept with repeated request distributions, query/resource counts, matching denial behavior and no changed response contract. Reference: [Express production performance](https://expressjs.com/en/advanced/best-practice-performance/), [Nest performance](https://docs.nestjs.com/techniques/performance).

## Revision and mixed practice

1. p99 rises while CPU is low and database pool wait grows. Should you tune V8 first?
2. A Buffer view is faster in a loop but keeps an 8 MiB upload alive for a 20-byte cache value. Is it necessarily better?

<span class="notes-section-label">**Answer guide — attempt both cases first**</span>

1. Investigate dependency capacity, client leaks, transaction duration and admission first. Correlate metrics and profile before changing runtime flags.
2. No. Compare retained memory, aliasing and lifetime as well as copying cost; a small independent copy can fit the ownership requirement better.

All workload, profile, tuning and cache exercises remain learner practice. Author checks establish bounded example behavior, not an SLO or a professional level.
