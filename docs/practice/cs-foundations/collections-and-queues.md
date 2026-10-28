# Collections and bounded queues

**Learner status: still required.** Use the [shared evidence requirements](./index.md#evidence-for-every-checkpoint).

## CS-P04: bounded FIFO

**Prerequisites:** CS-P01, [structure selection](../../cs-foundations/data-structures.md), array indices, references and modulo arithmetic.

**Scope:** a fixed-capacity FIFO, capacity 1–200 for practice. Define enqueue/dequeue/size, reject full enqueue and empty dequeue, and permit undefined payloads by tracking occupancy separately. No resizing, async waiting or general linked-list package is required.

**Observable acceptance:**

- Capacity-3 sequence A/B/C → dequeue A → enqueue D drains B/C/D. Repeat wraparound many times and test capacity 1.
- Invalid capacity, full enqueue and empty dequeue reject without changing existing order/size.
- Mixed deterministic operations agree with a simple small array model; include object identity and undefined payloads.
- Maintain `0≤size≤capacity`, valid head and logical-to-physical slot mapping. Clear consumed slots so the queue does not retain removed payload references; inspect ownership deliberately rather than demanding a GC event at a fixed time.
- Explain construction O(capacity), per-operation O(1) in the fixed-array model, retained storage and difference from repeated shift/head-index queues.

**Failure cases:** stale tail after emptying a linked alternative; wraparound overwriting live entries; using undefined as both data and empty sentinel; accidental retention. Explain known-node deletion versus the O(n) search for a linked-list predecessor and when a deque would be appropriate.

**Evidence:** model traces, observed rejection/state, invariant/progress explanation and reference-lifetime reasoning. A queue does not limit bytes reachable from payloads or make consumers run concurrently.

## Cache extension

**Optional, existing exercise relocated from General ES6. Prerequisites:** Map equality, undefined/absence, mutation and ownership; no WeakMap GC timing requirement.

Implement a bounded Map cache with a documented FIFO or LRU policy. Acceptance: distinguish missing from stored undefined; show object identity and NaN/zero cases; verify object key order; reject unsupported serialized keys; enforce an entry limit and document hit promotion/eviction. Explain why WeakMap collection cannot be required at a deterministic time and verify symbol support against any chosen runtime matrix.

Test capacity 1, repeated updates, eviction order, clear and mutation after caching. Record the key/equality policy, stale-result counterexample/fix, runtime results and entry-count versus retained-byte limits. This reuses the [retained original requirements](./retained-exercises.md#existing-collection-exercise); it is not a second core assignment.
