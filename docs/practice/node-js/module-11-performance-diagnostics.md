# Performance and Diagnostics — practice

**Learner status: still required.** These tasks were separated from the textbook; no completion is credited.

[Textbook explanation](../../node-js/module-11-performance-diagnostics.md) · [Node.js practice map](./index.md)

## Practice exercises {#_15-practice-exercises}

### Exercise 1: Event-loop stall

A route parses a very large payload and performs a nested loop. Under load, unrelated health requests also become slow.

Investigate:

- which measurements prove event-loop blocking;
- which code appears in a CPU profile;
- whether bounds, a better algorithm, streaming, or workers are appropriate;
- how you will prove the fix.

### Exercise 2: The “database is slow” report

Application traces show 900 ms around a database helper. The database reports that the query executes in 25 ms.

Investigate pool acquisition, transaction duration, leaked clients, and total connections across instances. Explain why increasing the pool might make the system worse.

### Exercise 3: Slow memory growth

Heap usage rises by 30 MB each hour. Traffic stays constant. A map stores request status by correlation ID.

Find the ownership rule that is missing. Add deletion or a bounded expiry policy. Verify the fix with a soak test and post-GC heap trend.

### Exercise 4: Misleading load test

A closed-model test reports good p99 latency at 100 virtual users. Production receives a fixed burst of 2,000 events per second and develops a queue.

Explain the mismatch. Design a test that controls arrival rate and measures queue delay, rejection, and recovery.

### Exercise 5: Worker-pool design

PDF generation blocks the event loop for 400 ms. Design a bounded worker pool. Define queue capacity, timeout behavior, crash replacement, cancellation, correlation, and graceful shutdown.

For every exercise, include the evidence that would falsify your first hypothesis. A strong diagnosis can change direction when measurements disagree.

---

## Final review checklist {#_16-final-review-checklist}

### Measurement

- [ ] Turn a vague performance complaint into a measurable target.
- [ ] Record a reproducible baseline before changing code.
- [ ] Distinguish throughput, latency, concurrency, utilization, and saturation.
- [ ] Use p50, p95, and p99 instead of relying only on averages.
- [ ] Explain coordinated omission and open versus closed load models.

### Node.js runtime

- [ ] Distinguish CPU-bound work from asynchronous I/O waits.
- [ ] Measure event-loop delay and event-loop utilization.
- [ ] Recognize common event-loop blockers.
- [ ] Interpret RSS, heap, external memory, and buffers separately.
- [ ] Diagnose a leak from trends and retained ownership, not one memory reading.
- [ ] Use CPU and heap profiling safely.

### Dependencies and capacity

- [ ] Separate database pool wait from query execution time.
- [ ] Read query plans and investigate locks, result size, and N+1 patterns.
- [ ] Budget total database connections across all service instances.
- [ ] Bound queues and concurrency before overload consumes memory.
- [ ] Choose workers only for measured CPU-intensive JavaScript.

### Verification and observability

- [ ] Design representative baseline, load, stress, spike, soak, and failure tests.
- [ ] Monitor the load generator as well as the target.
- [ ] Correlate logs, metrics, traces, and profiles.
- [ ] Avoid high-cardinality metric labels.
- [ ] Re-run the same experiment after each focused change.
- [ ] Confirm correctness and error rates as well as speed.

## Executable lifecycle and failure checks

Node24.18.0/TypeScript5.9.3 baseline, official APIs checked2026-10-25. Extract loop-diagnostics.ts and measured-db.ts into the isolated practice project. Observe at least one real reporting tick, call stop twice and require no later observation; inject a throwing sink and require stopped=true/no further ticks. Treat measured values as smoke-test observations, not a workload benchmark or proof of CPU/GC behavior. Check invalid interval values and that shutdown disposes all owned diagnostics.

For the DB port test acquisition success/failure, query success/failure, throwing telemetry, release failure and combined query+release failure. Require phase labels/outcomes and nonnegative finite durations, one release per acquired connection and unchanged result/error identity except the documented AggregateError. No raw SQL/parameters/private error text may enter observation fields. Retain actual worker zero-exit/no-result, crash, invalid message, timeout, abort and post-result open-handle tests from the shared module02 helper; no duplicate broken worker wrapper belongs here.

**Learner practice:** instrument an actual owned service/DB adapter, reproduce a representative workload, measure pool versus query wait, collect a short protected CPU/heap profile only when evidence justifies it and run the same workload after a focused change. Native profiling/GC/leak conclusions, pool capacity sizing and production gain are not established by these lifecycle tests. Memory counters overlap and percentiles need enough samples. [Node24 perf_hooks](https://nodejs.org/download/release/v24.18.0/docs/api/perf_hooks.html), [memoryUsage categories](https://nodejs.org/download/release/v24.18.0/docs/api/process.html#processmemoryusage).
