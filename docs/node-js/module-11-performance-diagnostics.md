# Performance and Diagnostics

## Contents

1. [A performance investigation is an experiment](#_1-a-performance-investigation-is-an-experiment)
2. [Throughput, latency, concurrency, and saturation](#_2-throughput-latency-concurrency-and-saturation)
3. [Latency distributions and percentiles](#_3-latency-distributions-and-percentiles)
4. [Classifying the bottleneck](#_4-classifying-the-bottleneck)
5. [Measuring application work](#_5-measuring-application-work)
6. [Event-loop delay and utilization](#_6-event-loop-delay-and-utilization)
7. [Memory, garbage collection, and leaks](#_7-memory-garbage-collection-and-leaks)
8. [CPU profiles and flame graphs](#_8-cpu-profiles-and-flame-graphs)
9. [Worker threads and process scaling](#_9-worker-threads-and-process-scaling)
10. [Database and connection-pool diagnosis](#_10-database-and-connection-pool-diagnosis)
11. [Load testing without fooling yourself](#_11-load-testing-without-fooling-yourself)
12. [Logs, metrics, traces, and profiles](#_12-logs-metrics-traces-and-profiles)
13. [Diagnostic playbooks](#_13-diagnostic-playbooks)
14. [Common optimization mistakes](#_14-common-optimization-mistakes)
15. [Practice exercises](#_15-practice-exercises)
16. [Final review checklist](#_16-final-review-checklist)

---

## A performance investigation is an experiment {#_1-a-performance-investigation-is-an-experiment}

Performance work begins with a symptom, not an optimization idea.

```text
observe → define → measure → hypothesize → change one thing → measure again
```

Suppose users say that checkout is slow. That report is useful, but it is not yet measurable. Turn it into a concrete statement:

> During the normal evening workload, the checkout endpoint has a p95 latency above 800 ms. The target is below 300 ms without increasing its error rate.

The statement identifies:

- the operation;
- the workload;
- the metric and percentile;
- the current and desired behavior;
- a constraint that prevents a misleading improvement.

### Establish a baseline

Record the current behavior before changing code:

- requests or jobs completed per second;
- p50, p95, and p99 latency;
- error and timeout rates;
- CPU and memory usage;
- event-loop delay;
- database and connection-pool behavior;
- the exact application version and test conditions.

Without a baseline, an improvement is only a guess.

### Change one important variable

If you change the query, cache, concurrency limit, and runtime version together, you cannot tell which change mattered. Small experiments are easier to interpret and reverse.

### Protect correctness

A faster response is not an improvement if it returns stale, incomplete, or incorrect data. Performance tests should check response correctness and error rates as well as speed.

---

## Throughput, latency, concurrency, and saturation {#_2-throughput-latency-concurrency-and-saturation}

These terms describe different parts of system behavior.

| Term | Meaning | Example |
| --- | --- | --- |
| Throughput | Work completed per unit of time | 500 requests per second |
| Latency | Time one operation takes | 120 ms for one request |
| Concurrency | Work in progress at the same time | 80 active requests |
| Saturation | A resource is near or beyond useful capacity | All database connections are busy |
| Utilization | Fraction of a resource's capacity in use | CPU is busy 75% of the interval |

They affect one another, but they are not interchangeable.

### Little's Law as a useful approximation

For a stable system:

```text
concurrency ≈ throughput × average latency
```

If a service completes 100 requests per second and each request spends 0.2 seconds in the system, it has about 20 concurrent requests on average.

This is useful for capacity reasoning. It is not a promise about bursty traffic or an unstable overloaded system.

### The saturation curve

As offered load rises, throughput initially rises too. Near capacity, queues grow. Latency then increases sharply. Beyond capacity, throughput may stop improving while timeouts and errors rise.

```text
low load       near capacity        overloaded
fast replies → growing queues → timeouts, drops, failures
```

The goal is not to keep every resource at 100% utilization. A service needs headroom for bursts, retries, deployments, and instance failures.

### Backpressure and admission control

When work arrives faster than it can be completed, the system must slow producers, queue a bounded amount, reject work, or shed lower-priority work.

An unbounded queue hides overload temporarily. It converts a clear rejection into memory growth and extreme latency.

---

## Latency distributions and percentiles {#_3-latency-distributions-and-percentiles}

An average can hide a poor user experience.

Consider these request durations:

```text
40, 42, 44, 45, 46, 48, 50, 52, 55, 900 ms
```

Most requests are fast. One is extremely slow. The average does not explain that shape well.

### Common percentiles

- **p50:** half of observations are at or below this value.
- **p95:** 95% are at or below this value. The slowest 5% are worse.
- **p99:** 99% are at or below this value. This reveals tail behavior.

Percentiles should include a time window and enough samples. A p99 based on ten requests is not informative.

### End-to-end and component latency

Measure both:

```text
request latency
  = queue wait
  + application CPU time
  + database pool wait
  + database query time
  + downstream calls
  + response transmission
```

Optimizing a 5 ms function will not fix 700 ms spent waiting for a database connection.

### Coordinated omission

Some load generators wait for one response before scheduling the next request. When the service stalls, the generator also stops sending. The test then fails to record requests that real users would have attempted during the stall.

This is called **coordinated omission**. It can make tail latency look much better than reality.

Prefer a tool or mode that can schedule arrivals independently of response completion when testing a fixed arrival rate. Always understand the load model used by the tool.

---

## Classifying the bottleneck {#_4-classifying-the-bottleneck}

Do not assume that a slow Node.js service has a slow event loop. First classify the evidence.

| Likely limit | Typical evidence | Next investigation |
| --- | --- | --- |
| CPU | High CPU, event-loop delay, hot stack in profile | CPU profile; algorithm and serialization review |
| Event-loop blocking | Requests pause together; delay rises | Synchronous work, large callbacks, regular expressions |
| Memory or GC | Rising heap, longer GC pauses, OOM restart | Heap trend, allocation profile, retained objects |
| Database | Slow queries, locks, scans, pool wait | Query plans, indexes, lock waits, pool metrics |
| Downstream service | Span duration and timeouts point outward | Dependency latency, timeout budget, retry behavior |
| Connection pool | Queue wait rises before query begins | Pool utilization, acquisition duration, transaction length |
| Network | Connect/TLS/DNS time, packet loss, resets | Network and client timing metrics |
| Disk/filesystem | High I/O wait, slow file operations | Storage latency, access pattern, buffering |
| Overload | Queue depth, rejection, rising tail latency | Capacity, admission control, horizontal scaling |

### CPU-bound versus I/O-bound work

CPU-bound work spends time executing instructions:

- compression;
- image or document transformation;
- cryptographic computation;
- large JSON parsing or serialization;
- expensive regular expressions;
- complex in-memory algorithms.

I/O-bound work spends much of its lifetime waiting:

- database queries;
- network requests;
- filesystem operations;
- queue or cache access.

Asynchronous I/O prevents a single wait from blocking all other requests. It does not make CPU-heavy JavaScript parallel.

### A dependency can look like application slowness

If the request handler awaits a downstream API for two seconds, the Node.js process may show low CPU and a healthy event loop. End-to-end latency is still poor. This is why traces and dependency timing matter.

---

## Measuring application work {#_5-measuring-application-work}

Use a monotonic clock for durations. A monotonic clock is not affected by wall-clock corrections.

```ts
import { performance } from 'node:perf_hooks';

async function timed<T>(
  operation: string,
  task: () => Promise<T>,
): Promise<T> {
  const startedAt = performance.now();

  try {
    return await task();
  } finally {
    const durationMs = performance.now() - startedAt;
    console.log(JSON.stringify({ operation, durationMs }));
  }
}
```

**What it does:** measures an asynchronous operation even when it throws. `performance.now()` supplies a high-resolution monotonic timestamp.

**When to use it:** use a small wrapper at important boundaries such as database calls, remote calls, or job handlers. In production, send the observation to structured logs, metrics, or tracing instead of a raw console call.

**Limitation:** adding timers around every tiny function creates noise and overhead. Measure boundaries that can guide a decision.

### Marks and measures

```ts
import { performance } from 'node:perf_hooks';

performance.mark('report:start');
buildReport();
performance.mark('report:end');
performance.measure('build-report', 'report:start', 'report:end');

const [measurement] = performance.getEntriesByName('build-report');
console.log(measurement.duration);

performance.clearMarks();
performance.clearMeasures();
```

**What it does:** names points and calculates the duration between them.

**When to use it:** marks are useful when one operation has several phases. Clear entries after reading them in a long-running process so the performance timeline does not grow without bound.

### Sampling versus instrumentation

- **Instrumentation** records known boundaries. It answers questions such as “how long did pool acquisition take?”
- **Sampling** periodically records what code is running. A CPU profile is a common example.

Instrumentation explains known operations. Sampling finds unexpected hot paths. Mature diagnosis often uses both.

---

## Event-loop delay and utilization {#_6-event-loop-delay-and-utilization}

Node.js executes JavaScript callbacks on an event-loop thread. A long-running callback delays unrelated timers, requests, and promise continuations handled by that loop.

### Monitoring event-loop delay

<<< ../workbench/node-js/runtime/diagnostics/loop-diagnostics.ts

**What it does:** records how late the event loop wakes compared with when it was expected to wake. The histogram values are in nanoseconds, so the example converts them to milliseconds.

**When to use it:** expose event-loop delay as a metric for long-running services. It is especially useful when requests pause together or latency rises during CPU-heavy work.

**Interpretation:** a high value shows that the loop was delayed. It does not identify the responsible code. Use a CPU profile and traces next.

### Event-loop utilization

The owned helper above reports utilization and delay together from one timer. It returns stop, which clears the timer and disables histogram sampling; call it on application shutdown, replacement and failed startup. unref only allows process exit—it does not dispose the timer or histogram. stop is idempotent. An observation with no histogram samples reports null delay values instead of a made-up zero/NaN.

If the observation sink throws, the helper stops and exposes stopped=true; the owner must surface that diagnostic failure through an independent safe health path rather than assume reporting continues. The callback is synchronous and must not return a promise.

**What it does:** estimates the fraction of time the event loop was active during an interval.

**When to use it:** compare utilization with latency and event-loop delay. High utilization plus high delay suggests the loop is busy. Low utilization plus high request latency often points to waiting on dependencies or queues.

Do not turn one threshold into a universal rule. Baselines vary by workload, runtime version, hardware, and sampling interval.

### Typical blockers

- synchronous filesystem APIs in request paths;
- very large `JSON.parse()` or `JSON.stringify()` operations;
- large loops without yielding;
- pathological regular expressions;
- synchronous compression or cryptography;
- callbacks that process huge batches at once.

Fix the design before adding workers. Smaller batches, streaming, bounds, or a better algorithm may be simpler.

---

## Memory, garbage collection, and leaks {#_7-memory-garbage-collection-and-leaks}

Node.js memory is more than the JavaScript heap.

```ts
const usage = process.memoryUsage();

console.log({
  rssBytes: usage.rss,
  heapTotalBytes: usage.heapTotal,
  heapUsedBytes: usage.heapUsed,
  externalBytes: usage.external,
  arrayBuffersBytes: usage.arrayBuffers,
});
```

| Field | Meaning |
| --- | --- |
| `rss` | Resident memory held by the process |
| `heapTotal` | V8 heap currently allocated |
| `heapUsed` | V8 heap currently used by live and not-yet-collected objects |
| `external` | Memory associated with C++ objects bound to JavaScript |
| `arrayBuffers` | Memory used by `ArrayBuffer` and `Buffer` storage |

**What it does:** takes a current memory snapshot by category.

**When to use it:** export these values periodically as metrics. Trends are more useful than one reading.

These categories overlap: arrayBuffers is included in external, heapUsed is within heapTotal, and RSS covers resident process memory rather than an independent sum of those counters. Do not add rss+heap+external+arrayBuffers to invent a total. With worker threads, RSS is process-wide while other reported fields concern the current thread. Compare like-for-like snapshots/runtime/workload and retained ownership; these counters alone cannot prove a leak.

### Normal growth versus a leak

Heap usage often rises and falls in a sawtooth shape as garbage collection runs. A likely leak shows a rising post-collection baseline over repeated comparable workloads.

```text
normal:  /\/\/\/\  stable lower boundary
leak:    /\/\/\/\/  rising lower boundary
```

RSS may stay high after objects are collected because the allocator or runtime retains pages for reuse. RSS alone does not prove a JavaScript leak.

### Common retention causes

- a cache with no size or expiry bound;
- event listeners that are added but never removed;
- intervals or timers retaining closures;
- maps keyed by users, requests, or jobs that never delete entries;
- unresolved promises or abandoned request state;
- queues growing faster than consumers can drain them;
- buffering entire files or responses;
- native modules or `Buffer` allocations outside the V8 heap.

### Leak investigation workflow

1. Reproduce a stable workload.
2. Graph heap, RSS, external memory, request rate, and queue depth.
3. Allow warm-up and several garbage-collection cycles.
4. Take a baseline heap snapshot in a safe environment.
5. Run the suspicious workload.
6. Take another snapshot.
7. Compare retained objects and paths to garbage-collection roots.
8. Fix the owner that failed to release or bound the data.
9. Repeat the same workload to verify the post-GC baseline stabilizes.

### Heap-snapshot caution

Creating a heap snapshot pauses the main thread and may require substantial additional memory. On a large production process, that can cause a long outage or an out-of-memory termination.

Prefer a reproducible staging environment. If production evidence is essential, isolate the instance from traffic and ensure enough memory headroom first.

### Do not “fix” leaks by raising the heap limit

A larger heap may postpone the crash. It can also increase garbage-collection pause times. Find the retained ownership unless measurement proves that the workload legitimately needs more memory.

---

## CPU profiles and flame graphs {#_8-cpu-profiles-and-flame-graphs}

A CPU profile samples stack traces while the program runs. A flame graph visualizes the aggregated stacks.

In a flame graph:

- horizontal width represents how often a frame appeared in samples;
- vertical position represents call-stack depth;
- wide frames deserve investigation;
- color usually does not mean “bad” unless the tool documents that meaning.

### A practical workflow

1. Reproduce the slow operation under representative load.
2. Record a short profile that covers the problem period.
3. Find the widest application frames.
4. Inspect their callers, inputs, and frequency.
5. Change one cause.
6. repeat the same profile and workload.

Node can write a V8 CPU profile with runtime flags such as:

```bash
node --cpu-prof dist/server.js
```

The resulting profile can be inspected in compatible developer tools.

**When to use it:** use profiling when CPU or event-loop evidence suggests that JavaScript execution is the limiting resource.

**Safety:** profiling has overhead and profiles may expose function names or application structure. Use short, controlled captures and protect diagnostic artifacts.

### Optimize the caller, not only the leaf

A small helper may be hot because it is called millions of times. The better fix may be to call it less often, process less data, or move work outside the request path.

### Algorithmic improvements dominate micro-optimizations

Replacing repeated linear searches with an indexed lookup can matter more than rewriting syntax. First reduce work and improve complexity. Only then consider low-level tuning backed by a profile.

---

## Worker threads and process scaling {#_9-worker-threads-and-process-scaling}

Worker threads run JavaScript in parallel threads within one process. Each worker has its own JavaScript environment and event loop.

Use the [owned one-result worker implementation](./module-02-standard-library.md#promise-wrapper), including its runtime result parser, deadline, caller signal and awaited termination. Copy that implementation into a shared production helper when building the practice service; do not import Markdown as code.

```ts
// runWorker is the helper implemented in module02, in the practice project's worker-task.js.
import { runWorker } from './worker-task.js';
function parseCount(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0)
    throw new TypeError('Expected a nonnegative safe integer result');
  return value;
}
async function runCpuTask(input: unknown, signal: AbortSignal): Promise<number> {
  return runWorker(new URL('./cpu-worker.js', import.meta.url), input, parseCount,
    { signal, timeoutMs: 5_000 });
}
```

A successful worker exit without a result is a failed task, not success and not a promise to leave pending. Test that case alongside nonzero exit, thrown errors, invalid messages, timeout and abort. This shared helper terminates even a worker that posts one result and then keeps an interval alive. It cannot undo external side effects; use pure CPU work or explicitly designed effect protocols.

**What it does:** moves one CPU-heavy operation away from the main event loop.

**When to use it:** use workers for measured CPU-intensive JavaScript such as parsing, transformation, or computation. Ordinary asynchronous network and database I/O rarely benefits from a worker.

**Important limitation:** creating a worker for every request is expensive. Real services normally maintain a bounded pool.

### A worker pool needs policy

A safe pool defines:

- a maximum worker count;
- a bounded waiting queue;
- overload behavior when that queue is full;
- task timeouts and cancellation behavior;
- worker crash replacement;
- correlation between a task and its logs/traces;
- graceful shutdown that stops intake and drains or cancels work.

More workers than available CPU cores can increase context switching and memory usage. Benchmark the pool size under the real workload.

### Processes versus workers

| Choice | Isolation | Memory | Best fit |
| --- | --- | --- | --- |
| More service processes/containers | Stronger failure isolation | Separate heaps | HTTP throughput, availability, horizontal scaling |
| Worker threads | Share one process; can share selected memory | Separate V8 heaps plus process resources | CPU-heavy tasks inside a service |
| External job workers | Separate deployment and queue | Separate processes | Durable background work and independent scaling |

Do not use in-process workers as a durable job queue. A process crash loses in-memory queued work.

---

## Database and connection-pool diagnosis {#_10-database-and-connection-pool-diagnosis}

Database time has several components:

```text
database operation
  = wait for pool connection
  + network round trip
  + server parse/plan/lock/execute time
  + result transfer and application mapping
```

Measure pool acquisition separately from query execution.

<<< ../workbench/node-js/runtime/diagnostics/measured-db.ts

**What it does:** records both successful and failed acquisition/query durations separately. An acquisition failure emits no query sample and has no client to release. Query failure still releases exactly once; a throwing observation sink cannot leak an acquired connection or mask the original DB result. droppedObservations makes that telemetry loss visible. Query+release failure preserves both causes in an AggregateError; map them to safe categories rather than log raw statements, parameters or error objects. The observer must be synchronous; use fixed low-cardinality operation labels at the actual adapter.

This port does not cancel driver calls, enforce SQL parameterization inside an arbitrary query implementation or impose a DB deadline. Keep the real driver's statement/connection timeouts and owned client lifecycle. A duration wrapper cannot force a blocked promise to settle.

**When to use it:** use this distinction whenever the client library exposes pool lifecycle hooks. A “slow database call” may actually be pool starvation caused by long transactions or leaked connections.

### Query investigation

Check:

- the actual query and parameter shape;
- the execution plan on representative data;
- rows scanned versus rows returned;
- index selectivity and index order;
- lock waits and transaction duration;
- N+1 query patterns;
- result size and serialization cost;
- plan changes after data distribution changes.

Never add an index only because a column appears in a filter. Indexes cost storage and write time. Design them from real query patterns and verify the plan.

### Pool sizing

A larger pool is not automatically faster. Every application instance contributes connections:

```text
total possible connections
  = application instances × pool maximum per instance
  + admin and migration connections
```

If the database can usefully handle 100 active connections, ten instances with pools of 50 can overwhelm it. Start from the database capacity and divide a safe budget across instances.

Pool metrics should include:

- active and idle connections;
- pending acquisition count;
- acquisition latency and timeout count;
- transaction duration;
- connection errors and replacements.

---

## Load testing without fooling yourself {#_11-load-testing-without-fooling-yourself}

A load test is a controlled experiment. It is not simply “send as many requests as possible.”

### Define the workload

Document:

- endpoint or job mix;
- request and response sizes;
- authentication and data setup;
- arrival rate or virtual-user behavior;
- warm-up and measurement periods;
- test duration;
- expected cache state;
- dependency behavior;
- success criteria and resource limits.

Use representative data volume. A query that is fast with 100 rows may scan millions in production.

### Open and closed workload models

In a **closed model**, each virtual user waits for a response before sending its next request. Slower responses reduce the generated request rate.

In an **open model**, requests are scheduled at an intended arrival rate. Slow responses increase concurrency and expose queueing more realistically for many public services.

Neither model is universally correct. Choose the one that resembles the real producer.

### Useful test types

| Test | Purpose |
| --- | --- |
| Baseline | Measure normal traffic with ample headroom |
| Load | Verify expected traffic and service-level targets |
| Stress | Find the saturation point and failure behavior |
| Spike | Observe a sudden burst and recovery |
| Soak | Detect slow leaks, drift, and resource exhaustion |
| Failure | Observe behavior when a dependency slows or fails |

### Watch the generator too

The load generator can become the bottleneck. Monitor its CPU, network, errors, and ability to maintain the requested arrival rate.

### Safety

Run high-load tests only against systems you are authorized to test. Use isolated or controlled environments. Coordinate any production test, define a stop condition, and protect real user data.

### Interpret the whole curve

Plot offered load against:

- achieved throughput;
- p50, p95, and p99 latency;
- error and timeout rates;
- CPU, memory, event-loop delay, and garbage collection;
- pool wait and queue depth;
- dependency latency.

The point where latency accelerates or errors rise is more informative than one maximum requests-per-second number.

---

## Logs, metrics, traces, and profiles {#_12-logs-metrics-traces-and-profiles}

Each signal answers different questions.

| Signal | Best question | Example |
| --- | --- | --- |
| Logs | What discrete event happened? | Job failed with a classified error |
| Metrics | Is behavior changing across the system? | p99 latency and event-loop delay rose |
| Traces | Where did one request spend time? | 650 ms was in the inventory service |
| Profiles | Which code consumed CPU or allocated memory? | JSON serialization dominated samples |

### Metrics

Useful service metrics often follow four groups:

- **traffic:** request or job rate;
- **errors:** failures, timeouts, rejections;
- **latency:** end-to-end and dependency distributions;
- **saturation:** CPU, memory, queues, pools, event loop.

Avoid high-cardinality metric labels such as user IDs, request IDs, raw URLs, or arbitrary error messages. They create a new time series for each distinct value and can overwhelm the metrics system.

### Traces

A trace follows one operation across boundaries. It contains spans for important steps.

```text
POST /orders                   420 ms
├─ validate                      2 ms
├─ inventory.reserve          280 ms
├─ database transaction        90 ms
└─ response serialization      12 ms
```

Propagate trace context across HTTP, queues, and background jobs. A trace without dependency boundaries cannot explain distributed latency.

### Sampling

Recording every detailed trace or profile can be expensive. Sampling controls cost, but naive sampling may discard rare failures. Consider retaining errors and unusually slow traces at a higher rate.

### Correlation

Logs should carry trace and span identifiers when tracing is active. Metrics show where to look, traces narrow the request path, logs explain events, and profiles identify expensive code.

---

## Diagnostic playbooks {#_13-diagnostic-playbooks}

### The service becomes slow under load

1. Confirm the latency increase and affected operations.
2. Compare achieved throughput with offered load.
3. Check errors, timeouts, and queue depth.
4. Check CPU, event-loop delay, heap, garbage collection, and pool wait.
5. Inspect traces for the dominant span.
6. Profile only if evidence points to local CPU or allocation work.
7. Change one limiting factor.
8. Repeat the same load test.

### Memory grows until restart

1. Separate heap, external memory, buffers, and RSS.
2. Compare memory with traffic, jobs, caches, and queues.
3. Observe whether the post-GC heap baseline rises.
4. Reproduce in a safe environment.
5. Compare heap snapshots or allocation profiles.
6. Find the retaining owner.
7. Add lifetime or size bounds.
8. run a soak test to verify stability.

### CPU is high but throughput is flat

1. Check whether the process is saturated or throttled by its runtime environment.
2. Inspect event-loop utilization and delay.
3. Capture a CPU profile during the steady problem period.
4. Look for repeated parsing, serialization, compression, logging, or algorithms.
5. Reduce work before adding parallelism.
6. Test a worker pool only for remaining CPU-heavy work.

### Queries look fast but requests wait

1. Measure pool acquisition separately.
2. Find long transactions and unreleased clients.
3. Compare pool size across all instances with database capacity.
4. Check whether retries multiply demand.
5. Add bounded admission control instead of an unbounded application queue.

### Only p99 is poor

Look for:

- lock contention;
- cold caches or cold instances;
- garbage-collection pauses;
- occasional large inputs;
- slow dependency replicas;
- retry paths;
- queueing during bursts;
- noisy-neighbor or runtime throttling effects.

Do not dismiss tail latency because the average is good. One user workflow may call several services, so tail delays compound.

---

## Common optimization mistakes {#_14-common-optimization-mistakes}

| Mistake | Why it fails | Better approach |
| --- | --- | --- |
| Optimizing without a baseline | No proof that the changed code was important | Define a metric and reproduce the symptom |
| Using only average latency | Hides slow-tail behavior | Record latency histograms and percentiles |
| Benchmarking a toy data set | Misses scans, allocation, and payload costs | Use representative data volume and shapes |
| Increasing every pool size | Moves saturation to a dependency | Budget total connections and measure wait |
| Adding unlimited concurrency | Creates queues, memory pressure, and collapse | Bound concurrency and reject or defer excess work |
| Caching everything | Introduces stale data and unbounded memory | Cache measured hot reads with expiry and size limits |
| Moving all work to workers | Adds transfer, scheduling, and lifecycle cost | Use workers only for measured CPU-heavy work |
| Raising the heap limit first | Delays a likely leak and can lengthen pauses | Find retained ownership and bound memory |
| Testing only maximum throughput | Ignores latency, errors, and recovery | Study the full saturation curve |
| Comparing different test conditions | Produces invalid conclusions | Keep versions, data, load, and environment controlled |
| Profiling indefinitely | Adds cost and creates sensitive artifacts | Capture short windows around a reproducible symptom |

### Performance is a budget

An end-to-end target must be divided across work:

```text
300 ms request budget
  30 ms application work
  80 ms database
 120 ms downstream service
  40 ms network and serialization
  30 ms safety margin
```

A timeout longer than the caller's remaining budget cannot produce a useful answer. Budgeting also makes ownership clearer.

---

## Practice exercises {#_15-practice-exercises}

[Exercises and learner checklist](../practice/node-js/module-11-performance-diagnostics.md).

## Final review checklist {#_16-final-review-checklist}

[Exercises and learner checklist](../practice/node-js/module-11-performance-diagnostics.md).

### One-minute recap

Performance work is experimental. Begin with a measurable symptom and a reproducible baseline. Understand the relationship between throughput, latency, concurrency, and saturation. Use percentiles to see tail behavior. Classify whether time is spent on CPU, the event loop, memory management, queues, pools, databases, networks, or downstream services. Metrics reveal system trends. Traces show where one operation waited. Profiles reveal expensive code and allocations. Load tests must model real arrivals and data, then measure latency, errors, saturation, and recovery together. Optimize only the limiting resource, preserve correctness, and repeat the same measurement to prove the result.

### Further reading

- [Node.js Performance Measurement APIs](https://nodejs.org/api/perf_hooks.html)
- [Node.js Worker Threads](https://nodejs.org/api/worker_threads.html)
- [Node.js Diagnostics Guides](https://nodejs.org/en/learn/diagnostics)
- [OpenTelemetry signals](https://opentelemetry.io/docs/concepts/signals/)
- [OpenTelemetry for JavaScript](https://opentelemetry.io/docs/languages/js/)


## Executable lifecycle and failure checks

[Exercises and learner checklist](../practice/node-js/module-11-performance-diagnostics.md).
