---
outline: [2, 3]
---

# Concurrency

Examples use **Node.js 24.18.0**, ES Modules and built-in APIs. These eight questions cover process/thread isolation, worker and data ownership, bounded pools, cluster, forked IPC sessions and production choices. Practical exercises remain separate.

## How do child processes, cluster workers and worker threads differ in isolation and communication? {#t09-q01}

*Study depth: Intermediate*

<span class="notes-section-label">**Example — predict the parent value and identity comparisons**</span>

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

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

**A child process is a separate OS process with its own JavaScript runtime/heap**. child_process.fork starts another Node module and supplies IPC; **it does not create a JavaScript thread**. cluster manages multiple Node worker processes, commonly for copies of a network service sharing a listening port. worker_threads executes JavaScript in separate isolates/threads within one OS process.

Ordinary objects are cloned across worker messages; explicit transfers or shared memory have different ownership rules. Choose from workload, isolation and lifecycle needs, not the generic word worker.

</div>

<span class="notes-section-label">**Detailed explanation**</span>

Output is `1 2 true true`. The worker changed its structured-cloned input, while the parent's object stayed 1. process.pid is shared because it is one OS process; threadId identifies the different worker thread. This proves the fixture's value/identity properties, not a speedup or race-free shared-memory program.

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

<span class="notes-section-label">**Common mistakes**</span>

- Calling fork or cluster a thread API, or assuming all workers share ordinary objects.
- Adding threads for already asynchronous I/O without evidence.
- Resolving on the first message while forgetting an active worker, or treating exit0 without a reply as a business result.
- Treating a process/thread as a security sandbox or spawning one per unbounded request.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Is worker_threads the native libuv pool?**</span> No. It executes JavaScript on explicit threads; the native pool supports particular runtime operations. They can still compete for CPU/native capacity.
2. <span class="notes-section-label">**Can a parent mutex protect an ordinary object in a different process?**</span> Not by sharing that JavaScript object reference; the process has separate memory. Use an explicit message/external-storage protocol appropriate to the required consistency.
3. <span class="notes-section-label">**What should a troubleshooting report record?**</span> Which boundary is in use, input/task ID, startup/message/error/exit observations, queue and time budget, runtime and resource measurements. Do not log confidential payloads to compensate for missing correlation.

::: tip Key takeaway
Identify the execution and ownership boundary before choosing communication, failure handling or scaling behaviour.
:::

### One-question learner exercise

- [ ] Predict and explain the fixture's output before running it; retain proof that the parent object is unchanged.
- [ ] Test worker startup failure, thrown error, malformed result, exit0 without a result and a worker that reports then stays alive. Every case must terminate under an external test watchdog.
- [ ] Explain why fork, cluster and worker_threads solve different problems, then choose an approach for a CPU-heavy report, an external executable and an I/O-bound request.

Acceptance: assert values/error paths and actual worker settlement; do not claim thread speedup from the tiny arithmetic example. Process/cluster integration, transfers/shared-memory correctness, reusable pools and cross-platform behaviour are not established by this fixture. Author checks do not complete learner practice.

Official references checked2026-11-04: Node24.18 [worker threads](https://nodejs.org/download/release/v24.18.0/docs/api/worker_threads.html), [cluster](https://nodejs.org/download/release/v24.18.0/docs/api/cluster.html), [child_process.fork](https://nodejs.org/download/release/v24.18.0/docs/api/child_process.html#child_processforkmodulepath-args-options). Earlier fork/IPC examples remain in [related explanation](./02-cli-and-processes.md#t02-q08); this question adds the process/thread comparison without duplicating that implementation.

---

## How should a worker task handle result validation, failure, timeout and caller cancellation? {#t09-q02}

*Study depth: Intermediate*

<span class="notes-section-label">**Example — predict completion before running**</span>

Use the existing source helper below unchanged. In an owned temporary directory, save it as `worker.ts`, then create sum-worker.mjs and run-worker.mjs. Node24.18 can strip this helper's erasable TypeScript syntax when imported; **runtime stripping does not type-check it** or implement arbitrary tsconfig transforms.

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

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

A worker task needs a defined terminal protocol and one owner for result, error, exit, deadline and caller cancellation. Validate messages at runtime before accepting success.

**The reused helper selects the first terminal outcome**, removes its deadline/abort subscription, awaits worker termination, releases its listeners and only then settles the caller's promise. **A clean exit without a valid result rejects**. An already aborted signal prevents startup; later abort requests termination of this owned worker.

**Termination is not rollback** and a parent timer is not a hard real-time execution limit.

</div>

<span class="notes-section-label">**Detailed explanation**</span>

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

<span class="notes-section-label">**Common mistakes**</span>

- Waiting forever after exit0 without a reply, or treating online as a completed result.
- Using Promise.race to stop waiting while leaving the worker running.
- Accepting unknown messages with a type assertion or interpreting a progress message as final success.
- Removing error listeners before asynchronous termination completes, or claiming abort rolled back external effects.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**What if success arrives just before cancellation?**</span> Once success is selected, a later abort cannot replace it in this helper; termination still completes before resolution. Business effects need their own consistency rule.
2. <span class="notes-section-label">**Why keep the timer referenced?**</span> The owner deliberately requires pending tasks to remain supervised; an unreferenced timer alone need not keep the process alive. Clearing it at terminal selection prevents a later unrelated rejection attempt.
3. <span class="notes-section-label">**Does worker termination prove normal exit0?**</span> No. Forced termination has its own exit behaviour. Here success means validated result plus completed termination, whereas Q01 requires natural exit0 after its result.

::: tip Key takeaway
Select one outcome, validate its meaning and finish owned cleanup before reporting the task complete.
:::

### Learner exercise

- [ ] Run the two-file example using the unchanged source helper and explain why its retained intervals do not leak.
- [ ] Test malformed result, worker throw, clean/nonzero exit without result, deadline, pre-abort and abort while the worker is active. Assert error identity where the contract preserves it and zero retained caller abort listeners.
- [ ] Exercise first-result-then-extra-message/late-error and explain the selected-outcome policy without relying on fragile millisecond races. Compare reply-then-hang under Q01 and Q02.

Acceptance: every owned worker must settle/terminate and the external test watchdog must remain able to stop a broken case. Record which terminal/cleanup branches were actually exercised; message-deserialization and native termination failures cannot be inferred from an ordinary thrown error. Author checks do not complete learner practice.

Official references checked2026-11-04: Node24.18 [worker termination and events](https://nodejs.org/download/release/v24.18.0/docs/api/worker_threads.html), [AbortSignal reason](https://nodejs.org/download/release/v24.18.0/docs/api/globals.html#abortsignalreason), [TypeScript stripping limits](https://nodejs.org/download/release/v24.18.0/docs/api/typescript.html#type-stripping). The included implementation is the existing [source helper context](../module-02-standard-library.md#promise-wrapper); no second production helper was added.

<span id="next-small-batch"></span>


---

## How do copying, transferring and shared memory change ownership between worker threads? {#t09-q03}

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

## How does a bounded reusable worker pool own admission, cancellation and shutdown? {#t09-q04}

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

---

## What does cluster share, and who owns service-process readiness and shutdown? {#t09-q05}

*Study depth: Intermediate; deployment-specific scheduling/replacement tuning optional*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Cluster runs separate Node service processes that can share a listening endpoint. **A shared port does not mean shared application memory or one global session/cache.** The primary owns worker startup, readiness, failure and drain policy; workers own their service resources. **Disconnect, process exit and successful request completion are distinct observations.**

</div>

<span class="notes-section-label">**Reason through the topology**</span>

A primary starts two service workers. Each has its own JavaScript heap and local counter. A request reaches one worker; another worker cannot read that counter by ordinary reference. External/shared storage and intentional session routing are needed when the domain requires common state.

Cluster distributes connections according to its supported scheduling policy; do not promise perfect per-request fairness. A long keep-alive connection can carry many requests, and a long-running CPU operation still occupies the worker handling it. Cluster does not divide one indivisible operation among processes. Containers/orchestrators or a process supervisor with an external load balancer are alternatives; avoid multiplying all these layers without a capacity budget.

<span class="notes-section-label">**Owned two-process service fixture**</span>

Save `cluster-lab.mjs` and run it with Node24. It binds only loopback and uses an ephemeral port. Under cluster, these matching listen(0) calls share an allocated endpoint; they are not two independently selected ports. The fixed two-worker count is a lab policy, not a sizing recommendation.

```js
// file: cluster-lab.mjs
import cluster from 'node:cluster';
import { createServer } from 'node:http';
if (cluster.isPrimary) {
  const workers = new Map();
  const addresses = new Map();
  let stopping = false, forced = false, finished = false, drainTimer;
  const startupTimer = setTimeout(() => { process.exitCode = 1; stop(); }, 3000);
  function stop() {
    if (stopping) return;
    stopping = true; clearTimeout(startupTimer);
    for (const worker of workers.values()) {
      if (worker.isConnected()) worker.disconnect();
    }
    drainTimer = setTimeout(() => {
      forced = true; process.exitCode = 1;
      for (const worker of workers.values()) worker.process.kill('SIGKILL');
    }, 1500);
    if (!workers.size) finish();
  }
  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(startupTimer); clearTimeout(drainTimer);
    process.removeListener('SIGTERM', stop); process.removeListener('SIGINT', stop);
    console.log(JSON.stringify({ event: 'stopped', forced }));
  }
  for (let i = 0; i < 2; i++) {
    let worker;
    try { worker = cluster.fork(); } catch { process.exitCode = 1; stop(); break; }
    workers.set(worker.id, worker);
    worker.on('error', () => { process.exitCode = 1; stop(); });
    worker.on('listening', address => {
      if (stopping) return;
      addresses.set(worker.id, address.port);
      if (addresses.size === 2) {
        clearTimeout(startupTimer);
        if (new Set(addresses.values()).size !== 1) { process.exitCode = 1; stop(); return; }
        console.log(JSON.stringify({ event: 'ready', port: address.port,
          pids: [...workers.values()].map(w => w.process.pid) }));
      }
    });
    worker.on('exit', () => {
      workers.delete(worker.id); addresses.delete(worker.id);
      if (!stopping) { process.exitCode = 1; stop(); }
      if (!workers.size) finish();
    });
  }
  process.on('SIGTERM', stop); process.on('SIGINT', stop);
} else {
  let count = 0;
  const server = createServer((req, res) => {
    if (req.method !== 'GET' || req.url !== '/') { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ pid: process.pid, count: ++count }));
  });
  server.keepAliveTimeout = 250;
  server.headersTimeout = 1000; server.requestTimeout = 2000;
  server.on('error', () => {
    process.exitCode = 1;
    cluster.worker.disconnect();
  });
  server.listen(0, '127.0.0.1');
}
```

The ready line appears only after both owned workers report listening on the same port. Request `GET /` there; JSON reports the responding PID and its local count. Count requests separately by PID. This proves neither a shared global counter nor a particular distribution ratio. `online` or a forked PID alone would not establish application readiness; a real service must also verify required dependencies.

Send SIGTERM to the owned primary after the check. It stops initiating new work and asks workers to disconnect/drain; a deadline kills remaining owned workers. The stopped line follows observed worker exits. Its forced flag and exit status distinguish graceful completion from escalation. The local fixture has no database/jobs/upgraded WebSocket connections; those resources need additional worker-owned close logic.

Unexpected worker loss fails this lab closed and stops the rest. It never respawns automatically. Production can replace a failed worker, but must bound retries/backoff, distinguish deployment drain from a crash, wait for readiness and avoid a crash loop that hides a bad artifact. Killing a worker can lose in-flight responses even if an external effect committed; reconnect/retry requires the domain’s outcome policy.

<span class="notes-section-label">**Common mistakes and debugging**</span>

Storing login sessions only in each worker, using an unbounded worker count, reporting ready before dependencies initialize, or treating IPC disconnect as proof that every accepted operation completed. Compare per-process PID/metrics, active connections/work, dependency pools and exit causes. Do not use process.exit to conceal leaked handles. A primary/supervisor failure is another failure boundary, not solved by a healthy worker counter.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Can cluster increase throughput for several CPU-bound requests?**</span> It can distribute them across available processes/CPU, but it does not speed up one indivisible request automatically. Measure under the actual limits.
2. <span class="notes-section-label">**Is worker.disconnect equivalent to a clean business drain?**</span> No. Own service work and resources, observe exit, and retain a final deadline/outcome policy.
3. <span class="notes-section-label">**Must a production app use cluster?**</span> No. An external deployment/process topology may already provide the required process distribution. Choose one coherent ownership model.

::: tip Key takeaway
Cluster shares a service endpoint; application state, capacity and lifecycle remain explicitly owned.
:::

<span class="notes-section-label">**Practice — learner work still required**</span>

- [ ] Observe distinct worker PIDs and separate counts through the shared endpoint; avoid asserting a universal request-distribution ratio.
- [ ] Stop the primary and verify every owned worker exits. Provoke one worker loss and explain the fail-closed policy before designing bounded replacement.
- [ ] Add a deliberately retained connection/work item and verify drain versus escalation. Use an external watchdog and close only owned processes.

Acceptance: readiness after both listeners, per-process state, bounded shutdown, no orphaned workers and explicit limits about sessions/proxies/databases. Local POSIX checks do not establish Windows behavior, production capacity or deployment readiness.

<span class="notes-section-label">**Official references**</span>

[Node24.18 cluster operation and lifecycle](https://nodejs.org/download/release/v24.18.0/docs/api/cluster.html), [HTTP service closure](https://nodejs.org/download/release/v24.18.0/docs/api/http.html#serverclosecallback). Version-specific sharing/scheduling details checked2026-11-04. The [source cluster introduction](../module-02-standard-library.md#_7-cluster) remains its broader runtime context.

---

## How should a service own a forked process from startup through actual closure? {#t09-q06}

*Study depth: Intermediate*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

A forked Node process has its own heap and an IPC channel. **Own the child’s authority, inputs, outputs, failure and lifetime independently.** An application result can finish one job while the child intentionally remains reusable. **A stopped acknowledgement is not actual process closure; the owner must observe both under its chosen protocol.**

</div>

<span class="notes-section-label">**Reuse the existing foundation, extend the lifecycle**</span>

The [one-shot fork example](./02-cli-and-processes.md#t02-q08) already owns one request and waits for child close. This session extends the same principle to repeated work: a result completes one calculation, while an explicit stop → stopped → disconnect/close sequence disposes the reusable child. The owner implementation is in the next question so there is one shared session implementation rather than competing helpers.

Choose fixed reviewed module paths and runtime flags. This fixture uses an empty environment and no inherited inspector arguments to reduce accidental configuration inheritance; it still runs with the user’s OS authority and is not a sandbox. A real child may require an explicit environment allowlist, working directory and reviewed flags. Do not pass a client-supplied executable or shell command through this API.

<span class="notes-section-label">**Child protocol — bounded pure work, explicit stop**</span>

Save `session-child.mjs`. Each accepted integer is squared synchronously before its result is emitted. A small seen-ID set rejects repeated requests within this session. That memory is lost on process failure; it is not durable idempotency or a payment-retry design.

```js
// file: session-child.mjs
const seen = new Set();
function disconnect(code = 0) {
  process.exitCode = code;
  if (process.connected) process.disconnect();
}
process.on('error', () => disconnect(1));
process.on('disconnect', () => process.removeListener('message', onMessage));
function onMessage(message) {
  if (message?.v === 1 && message.kind === 'stop' && Object.keys(message).length === 2) {
    process.send({ v: 1, kind: 'stopped' }, (error) => disconnect(error ? 1 : 0));
    return;
  }
  if (
    !message ||
    message.v !== 1 ||
    message.kind !== 'square' ||
    Object.keys(message).length !== 4 ||
    typeof message.id !== 'string' ||
    !/^j[1-9][0-9]{0,2}$/.test(message.id) ||
    seen.has(message.id) ||
    seen.size >= 100 ||
    !Number.isSafeInteger(message.value) ||
    message.value < 0 ||
    message.value > 1000
  ) {
    disconnect(2);
    return;
  }
  seen.add(message.id);
  process.send(
    { v: 1, kind: 'result', id: message.id, value: message.value ** 2, pid: process.pid },
    (error) => {
      if (error) disconnect(1);
    },
  );
}
process.on('message', onMessage);
```

After the final result, the message listener keeps the session available for more jobs. On a valid stop request, the child sends a stopped acknowledgement and disconnects. The disconnect handler removes its message subscription. There are no fixture timers, servers or external resources left to keep it alive. Real children must close their own pools/files/subscriptions too; IPC disconnection cannot do that for them.

Malformed input exits this fixture with code2 after disconnecting. The parent treats a missing result or unclean session closure as failure. A returned PID is a useful diagnostic in this owned channel, not authentication for arbitrary external messages. The arithmetic and bounds are intentionally tiny and do not justify process startup in a real request path.

<span class="notes-section-label">**Run the reusable session**</span>

Save the `fork-session.mjs` owner from the next question beside the child, then run this `session-demo.mjs`. The two jobs use the same child PID, distinct from the parent. A final accepted job is drained before clean closure; new work is rejected once close starts.

```js
// file: session-demo.mjs
import assert from 'node:assert/strict';
import { createForkSession } from './fork-session.mjs';
const session = createForkSession();
try {
  const first = session.run(6);
  await assert.rejects(session.run(7), /busy/);
  const one = await first,
    two = await session.run(7);
  assert.equal(one.value, 36);
  assert.equal(two.value, 49);
  assert.equal(one.pid, two.pid);
  assert.notEqual(one.pid, process.pid);
  const final = session.run(8);
  const closed = session.close();
  assert.equal(session.close(), closed);
  await assert.rejects(session.run(9), /unavailable/);
  assert.equal((await final).value, 64);
  assert.deepEqual(await closed, { closed: true });
} finally {
  await session.close();
}
assert.equal(session.snapshot().closed, true);
console.log(
  'Repeated fork requests, busy rejection, PID isolation, correlated results and actual clean close pass.',
);
```

<span class="notes-section-label">**Stdio, process events and limits**</span>

This teaching protocol has no stdout/stderr data contract, so those streams are ignored deliberately. A real integration needs bounded draining or forwarding with safe diagnostic fields; unread pipes can block a child. Avoid collecting unbounded output or logging credentials. Process exit and stdio closure are distinct observations; the owner below settles its close promise from close.

A request deadline terminates this direct owned child because there is only one assigned job and no queue. It does not kill unrelated work in a shared process pool. A child can spawn descendants; supervising a process tree needs its own platform-specific boundary. SIGKILL here is forceful POSIX cleanup, not a cross-platform graceful-shutdown guarantee, and a parent timer is not an instantaneous OS termination guarantee.

<span class="notes-section-label">**Common mistakes and debugging**</span>

Resolving the whole session on its first job, confusing channel disconnection with process exit, ignoring output pipes, inheriting an inspector port, or assuming a process inherits only harmless authority. Diagnose startup, send, reply, disconnect and close separately; preserve safe exit/signal/phase evidence rather than only the word “failed.”

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Why does a result not close this child automatically?**</span> The protocol deliberately reuses it for more jobs; the session owner must close it in finally.
2. <span class="notes-section-label">**Does env:{} remove filesystem authority?**</span> No. Environment filtering and OS isolation solve different problems.
3. <span class="notes-section-label">**Why reuse the foundation lesson?**</span> It preserves one-shot fundamentals while making the new repeated-session lifetime and closure contract explicit.

::: tip Key takeaway
A forked process is an owned resource, not merely a promise that happens to return a value.
:::

<span class="notes-section-label">**Practice — learner work still required**</span>

- [ ] Reproduce repeated results, busy rejection, shared child PID and final clean close.
- [ ] Provoke module-load failure, a child throw, missing result and a child that replies but never handles stop. Observe actual closure in every case.
- [ ] Add a bounded stderr diagnostic policy without leaking a private payload; document the process-tree/platform boundary.

Acceptance: no child/channel remains after owned close, results and lifecycle failures are distinct, and forceful cleanup does not masquerade as successful work or rollback.

<span class="notes-section-label">**Official references**</span>

[Node24.18 fork and ChildProcess events](https://nodejs.org/download/release/v24.18.0/docs/api/child_process.html#child_processforkmodulepath-args-options), [close semantics](https://nodejs.org/download/release/v24.18.0/docs/api/child_process.html#event-close), [process lifecycle context](./02-cli-and-processes.md#t02-q05).

---

## How do repeated IPC requests enforce correlation, flow control and terminal ownership? {#t09-q07}

*Study depth: Intermediate*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

IPC is a transport for a defined application protocol. **Validate message version, kind, ID, payload and lifecycle phase.** A send callback is transport progress, not business completion. **A bounded application window must remain separate from transport buffering**, and every result/failure/close path needs one owner.

</div>

<span class="notes-section-label">**One assigned request, no hidden waiting queue**</span>

The session admits at most one request and rejects another while busy. IDs increase within a100-job session limit. Replies match the active ID, expected tiny arithmetic result and owned child PID. The fixed message schemas contain no caller-supplied file path, role or tenant authority. For a real service, validate its actual schema and authorize at the trusted operation boundary.

This design sends one small bounded request and then waits for its result before accepting another. Node send can return false when the channel is closed/backlogged; that is not an instruction to immediately resend the same command. Keep a callback error owner, stop producing further application work and respect the outcome/deadline contract. A larger window needs both finite message/byte budgets and correlated per-task state; a transport backlog threshold is not your business queue limit.

<span class="notes-section-label">**Shared session owner**</span>

Save `fork-session.mjs` beside the child/demo from the previous question. Read the state transitions as accepting → active result → accepting again, or closing → drain active → stop → stopped → close. Failure moves toward teardown instead of silently reusing an uncertain peer.

```js
// file: fork-session.mjs
import { fork } from 'node:child_process';
export function createForkSession({
  filename = new URL('./session-child.mjs', import.meta.url),
  timeoutMs = 1000,
} = {}) {
  if (
    !(filename instanceof URL) ||
    !Number.isInteger(timeoutMs) ||
    timeoutMs < 1 ||
    timeoutMs > 60_000
  ) {
    throw new TypeError('Invalid session options');
  }
  const child = fork(filename, [], {
    env: {},
    execArgv: [],
    stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
  });
  let active,
    sequence = 0,
    closing = false,
    closed = false,
    failure,
    stopSent = false,
    stopped = false;
  let closeTimer, resolveClose, rejectClose;
  const closure = new Promise((resolve, reject) => {
    resolveClose = resolve;
    rejectClose = reject;
  });
  closure.catch(() => {}); // Observe automatic failure; callers still await close().
  function fail(error) {
    if (failure || closed) return;
    failure = error;
    if (active) {
      clearTimeout(active.timer);
      active.reject(error);
      active = undefined;
    }
    child.kill('SIGKILL'); // Only this owned direct child; not a process-tree supervisor.
  }
  function send(message) {
    try {
      return child.send(message, (error) => {
        if (error) fail(error);
      });
    } catch (error) {
      fail(error);
      return false;
    }
  }
  function stopWhenIdle() {
    if (!closing || active || stopSent || failure || closed) return;
    stopSent = true;
    send({ v: 1, kind: 'stop' });
  }
  child.on('error', fail);
  child.on('message', (message) => {
    if (closed || failure) return;
    if (
      message?.v === 1 &&
      message.kind === 'stopped' &&
      Object.keys(message).length === 2 &&
      stopSent &&
      !active
    ) {
      stopped = true;
      return;
    }
    if (
      !active ||
      !message ||
      message.v !== 1 ||
      message.kind !== 'result' ||
      Object.keys(message).length !== 5 ||
      message.id !== active.id ||
      message.value !== active.input ** 2 ||
      message.pid !== child.pid
    ) {
      fail(new Error('Invalid IPC result'));
      return;
    }
    const task = active;
    active = undefined;
    clearTimeout(task.timer);
    task.resolve({ value: message.value, pid: message.pid });
    stopWhenIdle();
  });
  child.once('close', (code, signal) => {
    closed = true;
    clearTimeout(closeTimer);
    if (active) {
      clearTimeout(active.timer);
      active.reject(failure ?? new Error('Child closed before result'));
      active = undefined;
    }
    child.removeAllListeners();
    if (failure || code !== 0 || signal || !closing || !stopped) {
      rejectClose(failure ?? new Error('Child closed without clean session shutdown'));
    } else resolveClose({ closed: true });
  });
  return Object.freeze({
    run(value) {
      if (closing || closed || failure)
        return Promise.reject(failure ?? new Error('Session unavailable'));
      if (!Number.isSafeInteger(value) || value < 0 || value > 1000)
        return Promise.reject(new TypeError('Input'));
      if (active) return Promise.reject(new Error('Session busy'));
      if (sequence >= 100) return Promise.reject(new Error('Session task budget'));
      return new Promise((resolve, reject) => {
        active = { id: `j${++sequence}`, input: value, resolve, reject };
        active.timer = setTimeout(() => fail(new Error('IPC deadline')), timeoutMs);
        send({ v: 1, kind: 'square', id: active.id, value });
      });
    },
    snapshot() {
      return { pid: child.pid, active: Boolean(active), closing, closed };
    },
    close() {
      if (!closing && !closed && !failure) {
        closing = true;
        closeTimer = setTimeout(
          () => fail(new Error('Session shutdown deadline')),
          timeoutMs,
        );
        stopWhenIdle();
      }
      return closure;
    },
  });
}
```

The request timer includes child startup and waiting for its business reply. Unexpected/duplicate replies fail the session closed rather than completing another job. The close timer bounds the waiting period before forceful cleanup; the close promise still waits for observed process/stdio closure. Repeated close returns the same promise.

An internally attached rejection handler observes an automatically failed closure, but callers still await close to receive that failure. Ignored stdio is deliberate in this fixture; it does not provide diagnostic output guarantees. The code does not exercise the native saturated-buffer branch or handle passing, and does not claim them from ordinary small-message tests.

A successful reply can precede a later session failure. If the child commits a write then loses its reply, the caller cannot infer rollback. Persist a stable operation identity and outcome where side effects require safe retries. This child’s in-memory seen-ID set only prevents repeated IDs during its own bounded lifetime; after restart it knows nothing about previous effects.

Default serialization, explicit advanced serialization and worker-thread transfer/shared-memory rules are different contracts. Choose supported values deliberately, test the actual mode and avoid reserved internal message conventions. Passing a socket/handle is a separate capability handoff with buffered-data, ownership and platform concerns; use it only when justified, rather than smuggling it into an ordinary data schema.

<span class="notes-section-label">**Common mistakes and debugging**</span>

Treating send=true or its callback as a result; resending on send=false; interpreting duplicate/stale replies as the current job; accepting an unbounded queue; or disconnecting before required replies have drained. Record bounded correlation/phase evidence and queue pressure. A request ID is not a secret or permission grant.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Why reject a duplicate result even if its number looks valid?**</span> It violates the phase/ID contract and can otherwise complete an unrelated operation.
2. <span class="notes-section-label">**Would a window of10 need more than10 IDs?**</span> It needs explicit active/pending ownership, byte limits, timeouts and cancellation/outcome policy, not just a counter.
3. <span class="notes-section-label">**Does disconnect flush a durable business log?**</span> No. Transport closure and durable commit are separate responsibilities.

::: tip Key takeaway
Correlate application outcomes, bound producers independently, and wait for the resource owner’s terminal protocol.
:::

<span class="notes-section-label">**Practice — learner work still required**</span>

- [ ] Verify busy rejection and invalid input without creating an application queue.
- [ ] Inject wrong/duplicate replies and clean exit without a reply; assert that another task cannot receive that result.
- [ ] Test request and shutdown deadlines, then design a bounded two-request window with explicit out-of-order matching before implementing it.

Acceptance: each promise settles according to its phase, repeated close is stable, all owned children close, and transport acknowledgements remain distinct from durable business outcomes. Native send saturation/handle passing require their own integration tests before claiming support.

<span class="notes-section-label">**Official references**</span>

[Node24.18 send/callback/flow-control semantics](https://nodejs.org/download/release/v24.18.0/docs/api/child_process.html#subprocesssendmessage-sendhandle-options-callback), [serialization modes](https://nodejs.org/download/release/v24.18.0/docs/api/child_process.html#advanced-serialization). Version-sensitive details checked2026-11-04; the [existing single-request IPC owner](./02-cli-and-processes.md#t02-q08) remains the simpler starting point.

---

## How do you choose and troubleshoot a production concurrency model? {#t09-q08}

*Study depth: Intermediate; representative infrastructure measurements remain practical work*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Choose from the work, isolation, authority, consistency and lifecycle requirements. **Async I/O, CPU threads, subprocesses and service replicas solve different bottlenecks.** Bound admission and retention across every replica, measure the phase that is actually slow, and **preserve business outcomes when cancellation or crashes make replies uncertain**.

</div>

<span class="notes-section-label">**Worked choices and rejected alternatives**</span>

| Requirement | Initial design | Why / rejected alternative |
|---|---|---|
| Wait for an ordinary SQL query | Async driver plus bounded DB pool | A CPU worker does not remove DB locks, network wait or pool starvation |
| Compute a large pure report | Bounded reusable thread pool after measurement | One thread per unbounded request amplifies startup/memory pressure |
| Run an external executable | Fixed executable/arguments, bounded stdio and owned subprocess | A shell string assembled from user input changes the security boundary |
| Run a native integration needing process separation | Controlled child process and explicit IPC | Separate JS heaps in threads do not isolate a process-wide native crash |
| Serve many independent requests | Intentional process/replica topology and external state | Cluster does not parallelize one indivisible request or share local sessions |
| Durable jobs that survive a service restart | Broker/outbox/outcome ownership and worker service | An in-memory thread pool is not durable job storage |

These are starting decisions, not measured universal winners. State useful CPU time, payload copying, queue wait, startup, dependency latency and operational constraints. Reject a concurrency mechanism when it adds cost without addressing the observed limit.

<span class="notes-section-label">**Budget across the actual topology**</span>

This arithmetic makes multiplication visible; it does not recommend these values. Save/run `production-budget.mjs`:

```js
// file: production-budget.mjs
import assert from 'node:assert/strict';
export function budget({ replicas, processesPerReplica, cpuWorkersPerProcess, dbConnectionsPerProcess }) {
  for (const n of [replicas, processesPerReplica, dbConnectionsPerProcess]) {
    if (!Number.isSafeInteger(n) || n < 1 || n > 32) throw new RangeError('Budget input');
  }
  if (!Number.isSafeInteger(cpuWorkersPerProcess) || cpuWorkersPerProcess < 0 || cpuWorkersPerProcess > 32) {
    throw new RangeError('Worker count');
  }
  const processes = replicas * processesPerReplica;
  return { processes, cpuWorkers: processes * cpuWorkersPerProcess,
    dbConnections: processes * dbConnectionsPerProcess };
}
assert.deepEqual(budget({ replicas: 3, processesPerReplica: 2,
  cpuWorkersPerProcess: 4, dbConnectionsPerProcess: 10 }),
{ processes: 6, cpuWorkers: 24, dbConnections: 60 });
assert.throws(() => budget({ replicas: -1 }), RangeError);
console.log('Capacity multiplication fixture passes; no capacity benchmark is implied.');
```

Three replicas with two processes each create24 CPU workers and up to60 configured DB connections in this fixture. Rolling deployments can temporarily add old and new replicas; capacity planning must include that overlap. A bound in one process does not establish a global limit. CPU quotas and available resources matter more than the host’s nominal core count. Shared native work, memory, sockets and dependency capacity still compete.

<span class="notes-section-label">**A reproducible diagnostic sequence**</span>

1. Define the symptom: request/job latency percentile, error rate, queue depth and admission rejection over a stated workload, not only average throughput.
2. Separate queue wait, execution, serialization and downstream wait. Identify the actual PID/thread/topology and correlate safe task IDs.
3. Inspect event-loop delay and CPU profiles for synchronous work. Check memory/GC and retained payloads if queues grow. For DB slowness, distinguish acquisition wait, locks and execution plans.
4. Change one resource/policy at a time under the same representative test. Keep correctness, errors, recovery and resource retention in the comparison.
5. Test overload, worker loss, timeout, cancellation and shutdown. Record whether the caller’s outcome is known and whether all physical work actually settled.

For example, high queue wait with CPU workers fully occupied can justify admission rejection, smaller work or measured capacity changes. High DB acquisition wait with low CPU is a different bottleneck: inspect leaked connections/long transactions and total connection demand before adding threads. A timer that fires late during parent blocking is not evidence that its configured number was ignored by a worker scheduler.

<span class="notes-section-label">**Failure and delivery decisions**</span>

Define queued versus assigned cancellation, retry ownership, stable operation identity, poison-input/crash-loop handling and deployment drain. An automatic retry can duplicate an external effect after a lost reply. A crash can invalidate local cache/session/deduplication state. Authentication and resource authorization must remain valid at the authoritative operation; a child/thread boundary grants neither.

For rolling replacement, stop new admission, let accepted work settle under a budget, then close owned resources and await process/thread termination. Escalation is a distinct result. Use an external supervisor for a final bound when JavaScript/native cleanup cannot progress. Never report an unreferenced worker, a hidden process exit or an abandoned promise as successful drain.

<span class="notes-section-label">**Common mistakes**</span>

Adding threads to I/O wait, increasing every pool simultaneously, forgetting replica multiplication, interpreting a local microbenchmark as an SLA, or testing only the happy path. Observability must show queue and physical ownership, not merely which promises have already rejected.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**What measurement justifies more workers?**</span> Representative useful CPU work/queue saturation with available capacity, plus a same-workload comparison that preserves latency, errors and retention.
2. <span class="notes-section-label">**What remains after all local examples pass?**</span> Actual dependency/proxy/topology limits, platform behavior, recovery and learner operational practice.
3. <span class="notes-section-label">**Can forced termination mean an operation failed?**</span> Not necessarily. A remote effect may already be committed; reconcile it through the operation’s outcome protocol.

::: tip Key takeaway
Choose the bottleneck and ownership boundary first; measure the full topology and test its failure outcomes.
:::

## Concurrency revision

| Boundary | Retained material |
|---|---|
| Isolation and per-task ownership | Questions1–2: process/thread differences, result/error/exit/cancel semantics |
| Data ownership and reusable CPU work | Questions3–4: clone/transfer/shared memory, bounded queue and physical occupancy |
| Service/process topology | Questions5–7: cluster, forked session, correlated bounded IPC and actual closure |
| Production choice | Question8: workload, capacity multiplication, diagnosis and recovery decisions |

- [ ] Reproduce the worker ownership and pool failure checks with an external watchdog.
- [ ] Run cluster and fork sessions, provoke worker/child loss, and retain PID/readiness/closure evidence.
- [ ] Choose a concurrency model for one actual service and compare a rejected alternative using representative measurements.
- [ ] Demonstrate overload, cancellation and rolling shutdown without treating unknown remote outcomes as failures to retry blindly.

Learning material covers all five listed concurrency source items. Every exercise is still your practical work; none of the local checks establishes production capacity or professional readiness.

Official references: [Node24.18 worker threads](https://nodejs.org/download/release/v24.18.0/docs/api/worker_threads.html), [cluster](https://nodejs.org/download/release/v24.18.0/docs/api/cluster.html), [child processes](https://nodejs.org/download/release/v24.18.0/docs/api/child_process.html), [performance diagnosis source](../module-11-performance-diagnostics.md). Last verification:2026-11-05.
