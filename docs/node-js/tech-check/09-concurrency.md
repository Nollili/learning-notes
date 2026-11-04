---
outline: [2, 3]
---

# Concurrency

Examples use **Node.js 24.18.0**, ES Modules and built-in APIs. These questions introduce process/thread isolation, communication and worker cancellation. Cluster implementation and reusable worker pools will be covered separately.

### How do child processes, cluster workers and worker threads differ in isolation and communication? {#t09-q01}

*Study depth: Intermediate*

**Example — predict the parent value and identity comparisons**

Save these two files together in an owned temporary directory. Run `node clone-main.mjs`. Does changing workerData change the original object? Does this worker have a different process ID?

`clone-worker.mjs`:

```js
import { workerData, parentPort, threadId } from 'node:worker_threads';
workerData.value += 1;
parentPort.postMessage({ value: workerData.value, pid: process.pid, threadId });
```

`clone-main.mjs`:

```js
import { Worker } from 'node:worker_threads';
export async function cloneOnce(input, filename = new URL('./clone-worker.mjs', import.meta.url),
  timeoutMs = 1000) {
  if (!input || !Number.isSafeInteger(input.value) || input.value < 0 || input.value > 1000 ||
      !Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 60_000) {
    throw new TypeError('invalid fixture input or deadline');
  }
  const expectedValue = input.value + 1;
  const worker = new Worker(filename, { workerData: input });
  let timer;
  try {
    return await new Promise((resolve, reject) => {
      let received = false, result;
      timer = setTimeout(() => reject(new Error('worker deadline')), timeoutMs);
      worker.once('error', reject);
      worker.once('messageerror', reject);
      worker.once('message', raw => {
        if (!raw || raw.value !== expectedValue || raw.pid !== process.pid ||
            !Number.isInteger(raw.threadId) || raw.threadId < 1) {
          reject(new Error('invalid worker result')); return;
        }
        received = true; result = raw;
      });
      worker.once('exit', code => {
        if (code !== 0 || !received) reject(new Error(`worker exited without valid result: ${code}`));
        else resolve(result);
      });
    });
  } finally {
    clearTimeout(timer);
    await worker.terminate();
    worker.removeAllListeners(); // This helper owns this worker and its subscriptions.
  }
}
const original = { value: 1 };
const result = await cloneOnce(original);
console.log(original.value, result.value, result.pid === process.pid, result.threadId > 0);
```

**Short exam answer**

A child process is a separate OS process with its own JavaScript runtime/heap. child_process.fork starts another Node module and supplies IPC; it does not create a JavaScript thread. cluster manages multiple Node worker processes, commonly for copies of a network service sharing a listening port. worker_threads executes JavaScript in separate isolates/threads within one OS process.

Ordinary objects are cloned across worker messages; explicit transfers or shared memory have different ownership rules. Choose from workload, isolation and lifecycle needs, not the generic word worker.

**Detailed explanation**

Output is `1 2 true true`. The worker changed its structured-cloned input, while the parent's object stayed1. process.pid is shared because it is one OS process; threadId identifies the different worker thread. This proves the fixture's value/identity properties, not a speedup or race-free shared-memory program.

The arithmetic is intentionally too small to justify creating a worker in a real application.

| Approach | Memory/execution boundary | Communication and typical reason |
|---|---|---|
| Ordinary asynchronous I/O | Current JavaScript thread coordinates waiting | Promises/callbacks for files/network/database operations; no extra JS worker required |
| spawn / execFile | Another OS process, possibly a non-Node executable | Controlled arguments and owned stdio; run an external tool |
| child_process.fork | Another Node process, separate heap and process identity | Node IPC messages; process separation for Node work |
| cluster worker | Another Node process under a primary | IPC plus coordinated listening; multiple service processes on one host |
| worker_threads Worker | Another JS isolate/thread in the same process | Structured clone, transfer lists or explicit shared memory; sustained CPU-heavy JS |

Structured cloning produces independent ordinary object data; it does not retain every class prototype, function or resource. A transferable ArrayBuffer can move ownership and detach the sender's usable view. SharedArrayBuffer deliberately permits shared bytes and requires an appropriate synchronization protocol, often with Atomics.

These choices are not interchangeable performance switches. A library named worker pool might wrap threads or processes; inspect its actual boundary.

The helper validates its small input and expected reply, observes worker errors, rejects a clean exit without a result and requires normal exit after that result. A worker that posts and then stays alive reaches the deadline. finally terminates/reaps its owned worker before the caller settles and releases its own listeners.

This is intentionally different from the [source one-result wrapper](../module-02-standard-library.md#promise-wrapper), which selects a valid result and then terminates immediately. Protocol completion must be explicit rather than copied accidentally between helpers. A termination failure can replace an earlier outcome in this small finally; richer error-preservation/cancellation protocols remain for the following batch.

A process provides a different failure/resource boundary, but not an automatic sandbox: it may inherit credentials and filesystem/network authority. Threads share the process's overall native fate and resource pressure even though ordinary heaps are separate. A native crash or process-wide resource exhaustion can affect the entire service.

Separate worker heaps do not guarantee separate libuv pools for pool-backed APIs. Never send secrets or arbitrary executable paths merely because a message crosses a boundary.

For a CPU-heavy report, measure whether useful work exceeds startup, serialization and scheduling overhead; a bounded reusable pool may fit. For ordinary database/network waiting, start with asynchronous APIs and admission limits.

For serving more traffic, multiple processes/containers can distribute requests, but do not accelerate one indivisible slow operation automatically. In-memory sessions/caches differ across cluster processes; shared state, affinity where needed and shutdown/restart policy belong to the service design.

Avoid unlimited worker creation and automatic crash respawn loops.

**Common mistakes**

- Calling fork or cluster a thread API, or assuming all workers share ordinary objects.
- Adding threads for already asynchronous I/O without evidence.
- Resolving on the first message while forgetting an active worker, or treating exit0 without a reply as a business result.
- Treating a process/thread as a security sandbox or spawning one per unbounded request.

**Examiner follow-ups**

1. **Is worker_threads the native libuv pool?** No. It executes JavaScript on explicit threads; the native pool supports particular runtime operations. They can still compete for CPU/native capacity.
2. **Can a parent mutex protect an ordinary object in a different process?** Not by sharing that JavaScript object reference; the process has separate memory. Use an explicit message/external-storage protocol appropriate to the required consistency.
3. **What should a troubleshooting report record?** Which boundary is in use, input/task ID, startup/message/error/exit observations, queue and time budget, runtime and resource measurements. Do not log confidential payloads to compensate for missing correlation.

::: tip Key takeaway
Identify the execution and ownership boundary before choosing communication, failure handling or scaling behaviour.
:::

## One-question learner exercise

- [ ] Predict and explain the fixture's output before running it; retain proof that the parent object is unchanged.
- [ ] Test worker startup failure, thrown error, malformed result, exit0 without a result and a worker that reports then stays alive. Every case must terminate under an external test watchdog.
- [ ] Explain why fork, cluster and worker_threads solve different problems, then choose an approach for a CPU-heavy report, an external executable and an I/O-bound request.

Acceptance: assert values/error paths and actual worker settlement; do not claim thread speedup from the tiny arithmetic example. Process/cluster integration, transfers/shared-memory correctness, reusable pools and cross-platform behaviour are not established by this fixture. Author checks do not complete learner practice.

Official references checked2026-11-04: Node24.18 [worker threads](https://nodejs.org/download/release/v24.18.0/docs/api/worker_threads.html), [cluster](https://nodejs.org/download/release/v24.18.0/docs/api/cluster.html), [child_process.fork](https://nodejs.org/download/release/v24.18.0/docs/api/child_process.html#child_processforkmodulepath-args-options). Earlier fork/IPC examples remain in [related explanation](./02-cli-and-processes.md#t02-q08); this question adds the process/thread comparison without duplicating that implementation.

### How should a worker task handle result validation, failure, timeout and caller cancellation? {#t09-q02}

*Study depth: Intermediate*

**Example — predict completion before running**

Use the existing source helper below unchanged. In an owned temporary directory, save it as `worker.ts`, then create sum-worker.mjs and run-worker.mjs. Node24.18 can strip this helper's erasable TypeScript syntax when imported; that does **not** type-check it or implement arbitrary tsconfig transforms.

No TypeScript dependency is needed for this stated runtime experiment. Preserve an Autocode template's compiler/Jest configuration rather than replacing it with this fixture setup.

<<< ../../workbench/node-js/runtime/worker.ts

`sum-worker.mjs`:

```js
import { parentPort, workerData } from 'node:worker_threads';
const { numbers, wait = false } = workerData;
if (!Array.isArray(numbers) || numbers.length > 1000 ||
    numbers.some(value => typeof value !== 'number' || !Number.isFinite(value))) {
  throw new TypeError('invalid numbers');
}
if (!wait) {
  parentPort.postMessage({ kind: 'result', value: numbers.reduce((sum, value) => sum + value, 0) });
}
setInterval(() => {}, 1000); // Deliberately stays alive so the owner must terminate it.
```

`run-worker.mjs`:

```js
import { runWorker } from './worker.ts';
export function parseSum(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) ||
      raw.kind !== 'result' || typeof raw.value !== 'number' || !Number.isFinite(raw.value)) {
    throw new TypeError('invalid sum result');
  }
  return raw.value;
}
const workerFile = new URL('./sum-worker.mjs', import.meta.url);
console.log(await runWorker(workerFile, { numbers: [1, 2, 3] }, parseSum, { timeoutMs: 1000 }));

const controller = new AbortController();
const pending = runWorker(workerFile, { numbers: [1], wait: true }, parseSum,
  { signal: controller.signal, timeoutMs: 1000 });
const observed = pending.catch(error => error);
const reason = new Error('caller stopped');
controller.abort(reason);
console.log((await observed) === reason);
```

Does the first call time out because its worker retains an interval? Does aborting the second call merely abandon the promise while that interval keeps running?

**Short exam answer**

A worker task needs a defined terminal protocol and one owner for result, error, exit, deadline and caller cancellation. Validate messages at runtime before accepting success.

The reused helper selects the first terminal outcome, removes its deadline/abort subscription, awaits worker termination, releases its listeners and only then settles the caller's promise. A clean exit without a valid result rejects. An already aborted signal prevents startup; later abort requests termination of this owned worker.

Termination is not rollback and a parent timer is not a hard real-time execution limit.

**Detailed explanation**

Output is6, then true. The first valid result selects success, but the helper does not resolve immediately: it waits for termination of the worker, including its deliberately retained interval. The second call is still pending when its caller aborts; the Error object supplied as reason is preserved after termination.

Attaching catch immediately keeps that expected rejection observed. This is a per-task worker owner, not a cancellation mechanism for a shared pool worker running unrelated tasks.

The completion policy differs from [related explanation](#t09-q01). Q01 requires a valid reply followed by normal worker exit, so reply-then-hang times out. This source helper regards a validated one-result message as the task's terminal result and actively stops the worker.

Both policies can be intentional; mixing them accidentally causes either leaked work or premature success. The worker must not post success before finishing the effects that success is meant to confirm. Here the only meaningful result is a small arithmetic value; there is no external transaction.

Walk through the owner in stages:

1. Validate timer/parser arguments and check pre-aborted input before constructing a worker. A constructor/startup clone failure must reject rather than leave a live deadline with no task.
2. Attach message, deserialization-error, worker-error and exit handlers. The parser is synchronous and must actually inspect unknown data; a TypeScript assertion alone does not validate a message.
3. The first observed terminal callback sets selected. Later messages, exits, aborts and errors cannot replace it. This is event observation order, not a claim that simultaneous events have a universal winning order.
4. Clear the referenced deadline and remove the abort listener. Retain worker error/exit listeners while termination is still in progress, so expected teardown events do not become unhandled failures.
5. Await terminate, remove the owned worker listeners, then deliver the chosen outcome. If termination itself rejects, surface an AggregateError containing the cleanup failure rather than silently claiming successful cleanup.

The input and result contracts are distinct: the worker rejects invalid numbers; the parent rejects malformed result shape. A structurally valid numeric reply still needs business-level tests for arithmetic/algorithm correctness.

This fixture accepts finite numbers and rejects a nonfinite total through parseSum; large numeric magnitudes, precision requirements or integer-only applications need a different domain contract.

Do not use an async parser with this synchronous validation helper or send progress notifications on its one-result channel; a multi-message protocol needs tagged task/result/progress handling.

A timeout means the parent observed its deadline before another terminal outcome, then began cleanup. It includes scheduling and termination latency. Synchronous parent blocking can delay the timer, and native/uninterruptible work can delay worker termination, so use an external process supervisor for a final deployment limit.

Throwing inside a worker normally reaches its error event; process/native resource failures need a broader recovery boundary. Cancellation cannot undo a write already committed by a worker, nor does it guarantee arbitrary in-worker finally cleanup finishes under forced termination.

This helper uses the caller's reason for ordinary Error-object aborts and a fallback Error for a nullish reason in its active-abort path; it does not promise identical arbitrary-reason behaviour for every pre-abort/active-abort path. Use a documented error/cancellation contract when integrating it.

For a pool, cancellation often needs to remove queued work or stop only the assigned task, with task IDs and worker replacement rules; calling terminate on a shared worker indiscriminately can destroy unrelated work.

**Common mistakes**

- Waiting forever after exit0 without a reply, or treating online as a completed result.
- Using Promise.race to stop waiting while leaving the worker running.
- Accepting unknown messages with a type assertion or interpreting a progress message as final success.
- Removing error listeners before asynchronous termination completes, or claiming abort rolled back external effects.

**Examiner follow-ups**

1. **What if success arrives just before cancellation?** Once success is selected, a later abort cannot replace it in this helper; termination still completes before resolution. Business effects need their own consistency rule.
2. **Why keep the timer referenced?** The owner deliberately requires pending tasks to remain supervised; an unreferenced timer alone need not keep the process alive. Clearing it at terminal selection prevents a later unrelated rejection attempt.
3. **Does worker termination prove normal exit0?** No. Forced termination has its own exit behaviour. Here success means validated result plus completed termination, whereas Q01 requires natural exit0 after its result.

::: tip Key takeaway
Select one outcome, validate its meaning and finish owned cleanup before reporting the task complete.
:::

## Learner exercise

- [ ] Run the two-file example using the unchanged source helper and explain why its retained intervals do not leak.
- [ ] Test malformed result, worker throw, clean/nonzero exit without result, deadline, pre-abort and abort while the worker is active. Assert error identity where the contract preserves it and zero retained caller abort listeners.
- [ ] Exercise first-result-then-extra-message/late-error and explain the selected-outcome policy without relying on fragile millisecond races. Compare reply-then-hang under Q01 and Q02.

Acceptance: every owned worker must settle/terminate and the external test watchdog must remain able to stop a broken case. Record which terminal/cleanup branches were actually exercised; message-deserialization and native termination failures cannot be inferred from an ordinary thrown error. Author checks do not complete learner practice.

Official references checked2026-11-04: Node24.18 [worker termination and events](https://nodejs.org/download/release/v24.18.0/docs/api/worker_threads.html), [AbortSignal reason](https://nodejs.org/download/release/v24.18.0/docs/api/globals.html#abortsignalreason), [TypeScript stripping limits](https://nodejs.org/download/release/v24.18.0/docs/api/typescript.html#type-stripping). The included implementation is the existing [source helper context](../module-02-standard-library.md#promise-wrapper); no second production helper was added.

<span id="next-small-batch"></span>


---

### How do copying, transferring and shared memory change ownership between worker threads? {#t09-q03}

*Study depth: Intermediate; advanced shared-memory algorithms optional*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Copying gives each side independent supported data. Transferring an owned ArrayBuffer moves its backing storage and **detaches every sender-side view of that buffer**. SharedArrayBuffer permits access to the same bytes; **sharing requires an explicit synchronization and lifetime protocol**. None of these choices provides validation, cancellation rollback or distributed persistence.

</div>

<span class="notes-section-label">**Predict the ownership change**</span>

The parent initializes one integer to7 and the worker changes it to8. Which parent still sees7, which loses its usable buffer, and which sees8? Does transferring one typed-array view leave another view of the same backing buffer usable?

| Choice | Sender after communication | Receiver | Appropriate starting point |
|---|---|---|---|
| Structured clone | Retains independent supported data | Receives a separate representation | Small messages or independent ownership on both sides |
| ArrayBuffer transfer | Backing buffer detached; aliases lose access too | Receives ownership of the transferred storage | Large binary data whose sender relinquishes ownership |
| SharedArrayBuffer | Retains access to shared bytes | Can access the same storage | A measured need with a defined synchronization protocol |

An object containing a transferable buffer still has a message envelope; not every part becomes zero-copy. Transferring a buffer that is absent from the payload does not magically give the receiver a reference to it. A shared buffer is not placed in a transfer list. Prototype/class behavior and arbitrary functions are not preserved like ordinary data; keep messages explicit and validate them.

<span class="notes-section-label">**Worked bounded experiment**</span>

Save these three files together in an owned lab. This uses one worker per tiny experiment to make ownership visible, not to claim that a four-byte operation benefits from parallelism.

```js
// file: ownership-worker.mjs
import { workerData, parentPort } from 'node:worker_threads';
const { mode, storage } = workerData;
if (!['copy', 'transfer', 'shared'].includes(mode) ||
    (mode === 'shared' ? !(storage instanceof SharedArrayBuffer) : !(storage instanceof ArrayBuffer)) ||
    storage.byteLength !== Int32Array.BYTES_PER_ELEMENT) {
  throw new TypeError('Invalid ownership fixture');
}
const values = new Int32Array(storage);
if (mode === 'shared') Atomics.add(values, 0, 1);
else values[0] += 1;
parentPort.postMessage({ kind: 'result', mode,
  value: mode === 'shared' ? Atomics.load(values, 0) : values[0] });
```

The owner below requires a validated result and normal exit, like the first question. It deliberately does not silently extend the existing one-result helper with a transfer-list contract.

```js
// file: ownership-owner.mjs
import { Worker } from 'node:worker_threads';
export async function ownershipCase(mode, {
  filename = new URL('./ownership-worker.mjs', import.meta.url), timeoutMs = 1000
} = {}) {
  if (!['copy', 'transfer', 'shared'].includes(mode) || !(filename instanceof URL) ||
      !Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 60_000) {
    throw new TypeError('Invalid ownership case');
  }
  const storage = mode === 'shared' ? new SharedArrayBuffer(4) : new ArrayBuffer(4);
  const values = new Int32Array(storage);
  const alias = new Uint8Array(storage);
  if (mode === 'shared') Atomics.store(values, 0, 7);
  else values[0] = 7;
  const worker = new Worker(filename, {
    workerData: { mode, storage }, transferList: mode === 'transfer' ? [storage] : []
  });
  const afterStartup = { bytes: storage.byteLength, aliasLength: alias.length };
  let timer, outcome;
  try {
    const reply = await new Promise((resolve, reject) => {
      let result;
      timer = setTimeout(() => reject(new Error('Ownership deadline')), timeoutMs);
      worker.once('error', reject);
      worker.once('messageerror', reject);
      worker.once('message', raw => {
        if (!raw || raw.kind !== 'result' || raw.mode !== mode || raw.value !== 8) {
          reject(new TypeError('Invalid ownership result')); return;
        }
        result = raw;
      });
      worker.once('exit', code => {
        if (code !== 0 || !result) reject(new Error('Worker exited without normal result'));
        else resolve(result);
      });
    });
    outcome = { ok: true, value: {
      mode, ...afterStartup, workerValue: reply.value,
      parentValue: mode === 'transfer' ? null :
        mode === 'shared' ? Atomics.load(values, 0) : values[0]
    } };
  } catch (error) { outcome = { ok: false, error }; }
  clearTimeout(timer);
  try { await worker.terminate(); }
  catch (cleanupError) {
    throw new AggregateError(outcome.ok ? [cleanupError] : [outcome.error, cleanupError],
      'Ownership worker cleanup failed');
  } finally { worker.removeAllListeners(); }
  if (!outcome.ok) throw outcome.error;
  return outcome.value;
}
```

A constructor/clone failure occurs before a deadline is created. Later errors keep their handlers until termination settles. The helper never reports a successful result from a reply-then-hanging worker. Termination failure is surfaced separately; forced termination cannot guarantee arbitrary worker cleanup or undo effects. The optional filename is an owned test seam, not an API for executing paths supplied by an untrusted caller.

```js
// file: ownership-demo.mjs
import assert from 'node:assert/strict';
import { ownershipCase } from './ownership-owner.mjs';
const rows = [];
for (const mode of ['copy', 'transfer', 'shared']) rows.push(await ownershipCase(mode));
assert.deepEqual(rows, [
  { mode: 'copy', bytes: 4, aliasLength: 4, workerValue: 8, parentValue: 7 },
  { mode: 'transfer', bytes: 0, aliasLength: 0, workerValue: 8, parentValue: null },
  { mode: 'shared', bytes: 4, aliasLength: 4, workerValue: 8, parentValue: 8 }
]);
console.table(rows);
```

Run `node ownership-demo.mjs`. Here null explicitly means that the parent no longer owns a usable transferred value, not that the receiver wrote null. Do not continue using a detached sender view or assume a second alias kept the bytes alive. If the receiving worker dies, the detached sender buffer does not automatically become usable again; retain a separate recoverable source when the business requirement needs replay.

<span class="notes-section-label">**Why the shared case uses Atomics**</span>

A shared counter update such as `counter[0]++` is a read/modify/write sequence; multiple participants can overwrite one another's changes. `Atomics.add` makes this one integer operation atomic. It does not make a group of fields, a queue, authorization or a whole business operation atomic. Our one-writer fixture demonstrates visibility under the stated protocol; it does not establish a general race-free algorithm or demonstrate contention.

An actual shared queue needs ownership of slots, publication/visibility rules, bounds, wakeup/timeout/cancellation and recovery from a failed participant. Avoid blocking the service's main event loop with `Atomics.wait`; advanced lock-free queues and shared-memory tuning remain optional. Prefer message passing when its cost is acceptable and ownership is easier to explain.

<span class="notes-section-label">**Buffers and subviews need extra care**</span>

A typed array or Buffer is a view, not necessarily the owner of its entire backing store. A subview can refer to a larger allocation; moving that whole allocation may move more data than intended. For this reason the example allocates a dedicated four-byte ArrayBuffer rather than transferring an arbitrary incoming Buffer's `.buffer`.

Node Buffer pooling introduces version-sensitive clone/transfer restrictions. Do not assume a small Buffer owns a dedicated transferable allocation, and do not widen the payload to an entire pool to avoid a transfer error. Copy the exact intended byte range into dedicated owned storage when needed. Check the Node24 transfer/Buffer guidance before integrating a particular Buffer creation path.

<span class="notes-section-label">**Choose and measure**</span>

Compare end-to-end startup, serialization, queue wait, useful CPU work, memory and responsiveness. Copying costs can matter for large inputs, but extra synchronization or ownership complexity can outweigh a nominal copy reduction. Bound payload bytes and task counts independently. Sharing does not reduce an unbounded task queue, and a reusable pool still needs per-task correlation and lifecycle rules.

For an image transform where the caller gives up its original bytes, transfer can fit. For a small report request retained for retries, a copy may be clearer. Shared counters may help a measured local need; a database remains responsible for state shared across process replicas. These are design choices, not a measured performance result from this fixture.

<span class="notes-section-label">**Common mistakes**</span>

Sending a function/class instance and expecting its behavior to survive; transferring an aliased buffer then using its other view; assuming transfer returns ownership after failure; using a shared read/modify/write without a protocol; calling shared memory a distributed store; or changing an existing helper's completion semantics accidentally.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Does transferring a typed array transfer the view object itself?**</span> The transferable resource is its backing ArrayBuffer; all sender views over that buffer are affected.
2. <span class="notes-section-label">**Does one atomic increment make a shared queue correct?**</span> No. Publication, slot ownership, multi-field invariants and failure recovery still need a design and tests.
3. <span class="notes-section-label">**Why not change the existing runWorker helper?**</span> Its current input/completion contract is already documented. A transfer-aware API must make surrendering input ownership explicit; it should not be introduced silently while reusing a generic parameter.

::: tip Key takeaway
Copy for independence, transfer for explicit ownership handoff, and share only under a protocol you can explain and test.
:::

<span class="notes-section-label">**Practice — learner work still required**</span>

- [ ] Predict and reproduce all three rows, including alias detachment.
- [ ] Send a subview of a larger allocation and explain the backing-store risk; replace it with an exact dedicated copy.
- [ ] Test invalid mode, malformed reply, startup/worker failure, normal exit without reply and reply-then-hang under an external watchdog. Every owned worker must terminate.
- [ ] Explain recovery if a transferred-input worker crashes and identify the separate durable source/outcome policy.

Acceptance: retain results/error branches, cleanup evidence and a reasoned copy/transfer/shared choice. No performance, contention, lock-free correctness or learner-mastery claim follows from the four-byte experiment. Worker-pool, cluster and IPC source tasks remain open until their own scope is addressed.

<span class="notes-section-label">**Official references**</span>

[Node24.18 worker messages, transfer lists and Buffer considerations](https://nodejs.org/download/release/v24.18.0/docs/api/worker_threads.html#portpostmessagevalue-transferlist), [Atomics.add specification](https://tc39.es/ecma262/multipage/structured-data.html#sec-atomics.add), [Atomics.wait and event-loop implications](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics/wait). The existing [source ownership introduction](../module-02-standard-library.md#message-copying-transfer-and-shared-memory) remains useful context. Runtime/version-specific details checked2026-11-04; the examples above do not rely on later worker lock APIs.

---

### How does a bounded reusable worker pool own admission, cancellation and shutdown? {#t09-q04}

*Study depth: Intermediate; multi-worker tuning and automatic recovery optional extensions*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

A pool reuses a bounded set of workers instead of creating one per request. **Worker count, waiting-queue capacity and payload size are separate limits.** Match replies to task IDs and retain ownership until the assigned work actually finishes. **Cancelling the caller does not automatically free a running worker slot.** Stop admission, drain under a budget, then terminate leftovers and await cleanup.

</div>

<span class="notes-section-label">**Predict admission and cancellation**</span>

With one worker and two waiting places, submit four tasks synchronously. Which one is rejected? If the running task's caller aborts, can the next task safely use that same worker immediately? What if the abandoned task never returns?

This experiment deliberately has **one reusable worker**. It makes queue/ownership behavior visible without hiding it behind scheduling across several workers. It is still a bounded pool, but it does not demonstrate parallel throughput across multiple CPU workers. The tiny arithmetic is for observable protocol checks, not a speed benchmark.

| Boundary | Explicit policy in this lab |
|---|---|
| Worker capacity | One assigned task at a time, worker reused for later tasks |
| Queue capacity | Configurable0–16 waiting places, FIFO; default2 |
| Payload | At most1000 integers, each0–1000; copied snapshot on admission |
| Result | Tagged result, matching monotonic task ID, bounded integer |
| Queued cancel/deadline | Remove from queue; reject caller and release its place |
| Running cancel/deadline | Reject caller; keep physical slot occupied until result/failure |
| Protocol/worker failure | Fail closed, reject affected work, terminate; no automatic respawn |
| Close | Stop admission, drain accepted work; force termination if close budget expires |

A production system must choose those policies; there is no universal correct queue length or worker count. Size CPU pools against available capacity, account for all application replicas and native work, and measure queue wait/useful work/memory/event-loop response. More workers or a larger queue can worsen tail latency and resource pressure.

<span class="notes-section-label">**Worker protocol**</span>

Save `pool-worker.mjs` in a separate learning directory. It accepts one kind of pure calculation and posts success only after that calculation is complete. It does not perform a remote write or promise transactional cancellation.

```js
// file: pool-worker.mjs
import { parentPort } from 'node:worker_threads';
parentPort.on('message', message => {
  if (!message || message.kind !== 'sum' || !Number.isSafeInteger(message.id) ||
      message.id < 1 || !Array.isArray(message.numbers) || message.numbers.length > 1000 ||
      Array.from(message.numbers).some(n => !Number.isSafeInteger(n) || n < 0 || n > 1000)) {
    throw new TypeError('Invalid sum task');
  }
  parentPort.postMessage({ kind: 'result', id: message.id,
    value: message.numbers.reduce((sum, n) => sum + n, 0) });
});
```

<span class="notes-section-label">**Pool owner — read by lifecycle stage**</span>

Save `sum-pool.mjs` alongside it. Follow admission → queue → assigned task → matched reply → caller settlement. The trusted filename option exists for owned test fixtures; do not accept executable paths from an HTTP payload.

```js
// file: sum-pool.mjs
import { Worker } from 'node:worker_threads';
export function createSumPool({ maxQueued = 2,
  filename = new URL('./pool-worker.mjs', import.meta.url) } = {}) {
  if (!Number.isInteger(maxQueued) || maxQueued < 0 || maxQueued > 16 ||
      !(filename instanceof URL)) throw new TypeError('Invalid pool options');
  const worker = new Worker(filename);
  let state = 'open', active = null, queue = [], nextId = 0, failure;
  let closePromise, resolveClose, rejectClose, closeTimer;
  function closingPromise() {
    if (!closePromise) {
      closePromise = new Promise((resolve, reject) => { resolveClose = resolve; rejectClose = reject; });
      closePromise.catch(() => {}); // Auto-failure is observed here; close() still exposes rejection.
    }
    return closePromise;
  }
  function settle(task, ok, value) {
    if (task.settled) return;
    task.settled = true;
    clearTimeout(task.timer);
    task.signal?.removeEventListener('abort', task.onAbort);
    ok ? task.resolve(value) : task.reject(value);
  }
  function stop(reason) {
    closingPromise();
    if (state === 'stopping' || state === 'closed') return;
    state = 'stopping'; clearTimeout(closeTimer);
    const abandoned = [...queue, ...(active ? [active] : [])];
    queue = []; active = null;
    for (const task of abandoned) settle(task, false, reason ?? new Error('Pool closed'));
    Promise.resolve().then(() => worker.terminate()).then(() => {
      state = 'closed'; worker.removeAllListeners();
      failure ? rejectClose(failure) : resolveClose({ drained: !reason });
    }, cleanupError => {
      state = 'closed'; worker.removeAllListeners();
      rejectClose(new AggregateError(failure ? [failure, cleanupError] : [cleanupError],
        'Pool cleanup failed'));
    });
  }
  function fail(error) {
    if (state === 'stopping' || state === 'closed') return;
    failure = error; stop(error); // Fail closed; this teaching pool never auto-respawns.
  }
  function pump() {
    if (state === 'stopping' || state === 'closed' || active) return;
    if (!queue.length) { if (state === 'draining') stop(); return; }
    active = queue.shift();
    try { worker.postMessage({ kind: 'sum', id: active.id, numbers: active.numbers }); }
    catch (error) { fail(error); }
  }
  function cancel(task, reason) {
    const index = queue.indexOf(task);
    if (index >= 0) queue.splice(index, 1);
    else if (active !== task) return;
    settle(task, false, reason);
    // An assigned task retains its physical slot until a valid result or worker failure.
    pump();
  }
  worker.on('message', raw => {
    if (state === 'stopping' || state === 'closed') return;
    if (!active || !raw || raw.kind !== 'result' || raw.id !== active.id ||
        !Number.isSafeInteger(raw.value) || raw.value < 0 || raw.value > 1_000_000) {
      fail(new Error('Invalid pool result')); return;
    }
    const task = active; active = null;
    settle(task, true, raw.value); pump();
  });
  worker.on('error', fail);
  worker.on('messageerror', fail);
  worker.on('exit', () => {
    if (state !== 'stopping' && state !== 'closed') fail(new Error('Unexpected pool worker exit'));
  });
  return Object.freeze({
    run(numbers, { signal, timeoutMs = 1000 } = {}) {
      if (state !== 'open') return Promise.reject(failure ?? new Error('Pool not accepting'));
      if (!Array.isArray(numbers) || numbers.length > 1000 ||
          Array.from(numbers).some(n => !Number.isSafeInteger(n) || n < 0 || n > 1000) ||
          !Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 60_000 ||
          (signal !== undefined && !(signal instanceof AbortSignal))) {
        return Promise.reject(new TypeError('Invalid task'));
      }
      if (signal?.aborted) return Promise.reject(signal.reason);
      if ((active || queue.length) && queue.length >= maxQueued) {
        return Promise.reject(new Error('Pool overloaded'));
      }
      if (nextId === Number.MAX_SAFE_INTEGER) return Promise.reject(new Error('Task IDs exhausted'));
      return new Promise((resolve, reject) => {
        const task = { id: ++nextId, numbers: [...numbers], resolve, reject, signal, settled: false };
        task.onAbort = () => cancel(task, signal.reason);
        task.timer = setTimeout(() => cancel(task, new Error('Task deadline')), timeoutMs);
        queue.push(task);
        signal?.addEventListener('abort', task.onAbort, { once: true });
        if (signal?.aborted) task.onAbort();
        pump();
      });
    },
    snapshot() { return { state, running: active ? 1 : 0, queued: queue.length }; },
    close({ timeoutMs = 1000 } = {}) {
      if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 60_000) {
        throw new TypeError('Invalid close deadline');
      }
      if (closePromise) return closePromise;
      closingPromise(); state = 'draining';
      closeTimer = setTimeout(() => stop(new Error('Pool shutdown deadline')), timeoutMs);
      pump();
      return closePromise;
    }
  });
}
```

<span class="notes-section-label">**Run the normal path**</span>

Save the demo beside the other files, then run `node pool-demo.mjs`. Submitting without awaiting each call fills the owned capacity before worker messages can be processed.

```js
// file: pool-demo.mjs
import assert from 'node:assert/strict';
import { createSumPool } from './sum-pool.mjs';
const pool = createSumPool({ maxQueued: 2 });
try {
  const first = pool.run([1, 2]);
  const second = pool.run([3, 4]);
  const third = pool.run([5, 6]);
  await assert.rejects(pool.run([7]), /overloaded/);
  assert.deepEqual(await Promise.all([first, second, third]), [3, 7, 11]);
  assert.equal(await pool.run([10]), 10); // Same owned worker is reused.
} finally {
  const result = await pool.close();
  assert.equal(result.drained, true);
}
await assert.rejects(pool.run([1]), /not accepting/);
console.log('Bounded admission, correlated results, reuse and drained shutdown pass.');
```

<span class="notes-section-label">**Admission and correlation**</span>

The first task is assigned immediately; two others wait and the fourth rejects. Rejections are promises, so callers must observe them. Every accepted task gets a new ID; the owner accepts a reply only for the currently assigned ID and expected shape. Unknown, duplicate or mismatched replies fail the pool rather than resolve another caller accidentally. Shape validation does not prove arithmetic correctness; the demo and behavior checks do that for their cases.

Each task retains a copied bounded input rather than a mutable caller array. Sparse/invalid arrays are rejected. Queue capacity does not bound every runtime allocation, but fixed worker count, bounded payloads and waiting places constrain the main retained workload. Global admission across process replicas is a separate control.

<span class="notes-section-label">**Cancellation is two different operations**</span>

A queued cancellation removes work that has not been assigned. Its deadline and abort listener are released, and another request can occupy that queue place. A running cancellation rejects the caller but leaves the task assigned. Its eventual reply still must match the ID before the worker can serve another task. `snapshot().running` reports this physical occupancy, including work whose caller already stopped waiting.

This policy does **not** stop CPU execution on a running deadline. A hung worker can remain occupied until the application closes the pool and its shutdown budget escalates. That limitation is explicit: every example owns and awaits `close()` in a `finally` path. A production design can instead implement cooperative checkpoints or retire/replace the assigned worker, with bounded replacement and outcome policies. Do not terminate an entire shared pool or release a slot merely because one caller timed out.

Cooperative messages cannot interrupt a worker stuck in a synchronous loop that never checks them. Shared cancellation flags/checkpoints or forceful retirement have different costs and guarantees. Neither undoes a remote effect already committed. Before requeueing abandoned work, establish replay safety and know who owns the original outcome.

<span class="notes-section-label">**Drain, failure and resource ownership**</span>

`close()` returns one stable promise. New tasks reject while accepted tasks drain. When the queue and assigned task are empty, the owner terminates its idle message-listening worker and awaits termination. `{ drained: true }` means accepted physical work finished before teardown; it does not mean the worker exited naturally with code0.

If the close budget expires, queued/running callers are rejected and termination is awaited; the result is `{ drained: false }`. That is completed forced teardown, not a successful drain. A worker/protocol failure rejects pending work and the close promise. Termination rejection is surfaced as a cleanup failure rather than silently reported as success. The internal catch observes an automatically initiated close rejection; callers still need to await `close()` to receive it.

Keep error/exit handling until termination settles, then remove the owned listeners. Unexpected exits are failures even with code0. This lab fails closed and never respawns; a real replacement policy needs limits/backoff, readiness, queued-task ownership and crash-loop protection. Constructor startup/module-load failure and a later worker crash are different observations but both need cleanup.

A timer cannot preempt blocked parent JavaScript or guarantee a native thread stops immediately. The close budget initiates forceful termination; awaiting that termination can take longer. An external process supervisor remains the final deployment deadline. `unref()` is not graceful shutdown and does not establish task completion.

<span class="notes-section-label">**Diagnostics and alternatives**</span>

Record bounded task IDs, queue wait, execution duration, rejected admission, occupied slots and forced drains without logging private payloads. A task ID matches this protocol; full async diagnostic-context correlation is a separate integration. Node recommends AsyncResource when implementing pools for diagnostic tooling; this didactic owner does not claim that integration.

For a real service, compare a maintained pool library against these same admission, cancellation, worker-failure and shutdown requirements. For ordinary asynchronous I/O, start with the existing async APIs rather than adding CPU workers. For stronger process isolation or independently scaled jobs, a process/broker architecture may fit, with different delivery and persistence requirements.

<span class="notes-section-label">**Common mistakes**</span>

Creating unlimited workers, accepting an unbounded queue, sharing mutable input, resolving the next caller from an old result, freeing a running slot on caller cancellation, blindly respawning crashing workers, or reporting a forced shutdown as a completed drain. A Promise.race timeout by itself implements none of the underlying ownership rules.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Can a cancelled running task still use CPU?**</span> Yes under this policy. The caller has stopped waiting, while physical work retains the worker slot until its valid result, failure or pool teardown.
2. <span class="notes-section-label">**Why not immediately assign the next task to the same worker?**</span> The previous work has not finished. Reuse before its terminal protocol risks overlapping work, stale replies and incorrect capacity accounting.
3. <span class="notes-section-label">**Does queue size2 mean only two total tasks?**</span> No. This pool can retain one assigned task plus two waiting tasks; payload and caller/output retention have separate costs.
4. <span class="notes-section-label">**Does the demo prove a multi-worker speedup?**</span> No. It proves bounded admission, result correlation, reuse and owned lifecycle for one worker; representative CPU/load measurements remain separate.

::: tip Key takeaway
Bound accepted work, retain physical ownership after caller cancellation, and distinguish drained shutdown from forced cleanup.
:::

<span class="notes-section-label">**Practice — learner work still required**</span>

- [ ] Reproduce overload and FIFO results; mutate the submitted array and verify the admitted snapshot remains independent.
- [ ] Cancel queued and assigned tasks separately; verify abort-listener cleanup and physical occupancy until the assigned work returns.
- [ ] Test queued/running deadlines, wrong task ID, worker throw/startup failure/unexpected exit, and a worker that never replies. Every owner must close under an external watchdog.
- [ ] Demonstrate graceful drain and forced `{ drained: false }` closure, then explain why the latter is not successful task completion.
- [ ] Before extending to multiple workers, define dispatch/fairness, per-worker active IDs, total admission, replacement and measurement criteria. Advanced tuning remains optional.

Acceptance: exact results, failure identities where promised, bounded retained work, no leaked workers/listeners/timers after owned closure, and a clear distinction between caller and physical completion. Production performance, native termination-failure handling and durable side effects need separate evidence.

<span class="notes-section-label">**Official references**</span>

[Node24.18 worker pools and AsyncResource recommendation](https://nodejs.org/download/release/v24.18.0/docs/api/worker_threads.html), [worker termination](https://nodejs.org/download/release/v24.18.0/docs/api/worker_threads.html#workerterminate), [AsyncResource pool example](https://nodejs.org/download/release/v24.18.0/docs/api/async_context.html#using-asyncresource-for-a-worker-thread-pool), [existing bounded-work source introduction](../module-02-standard-library.md#_11-worker-pools-and-bounded-cpu-work). Checked2026-11-04; this one-worker teaching implementation is deliberately narrower than a production scheduling library.
