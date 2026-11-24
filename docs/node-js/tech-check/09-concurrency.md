---
outline: [2, 3]
---

# Concurrency

<span class="notes-section-label">**Section 3 reading path:**</span> Async I/O, errors and cleanup are familiar from Sections 1–2. Start by running the supplied worker helper. Then inspect how it handles one task before trying the one-worker pool. Study the pool in stages: accepting work, assigning it, matching results, cancelling tasks and shutting down. Run its checks after each stage. Buffer transfer, shared memory, cluster and repeated IPC are later extensions. Project 3 requires one measured report pool with clear limits.

For unfamiliar technical terms, use the [Section 3 vocabulary guide](./index.md#section-3-vocabulary).

Examples use **Node.js 24.18.0**, ES Modules and built-in APIs. These eight questions cover process/thread isolation, worker and data ownership, bounded pools, cluster, forked IPC sessions and production choices. Practical exercises remain separate.

<!-- tech-check: t09-q01; level: 3 -->

## How do child processes, cluster workers and worker threads differ in isolation and communication?

*Study depth: Intermediate*

Level Up: L4 — Lead\
Tech Check level: ⭐⭐⭐

Source mapping: [R080](./requirements.md#r080).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

**A child process is a separate operating-system process with its own JavaScript memory.** `child_process.fork()` starts another Node program and adds IPC, a channel for sending messages between processes. It does not create a thread inside the parent process.

`cluster` manages several Node processes, often running copies of a server that share a listening port. **`worker_threads` runs JavaScript on separate threads inside one process**, with separate ordinary JavaScript heaps.

Worker messages copy ordinary objects using structured cloning. Buffer transfer and shared memory use different rules. Choose according to the work, required isolation, communication cost and cleanup needs. A library’s use of the word “worker” does not tell you whether it uses a process or a thread.

</div>

<span class="notes-section-label">**First experiment — use the supplied owner, then inspect it**</span>

You already know cancellation and cleanup from Section 2. The new idea is **JavaScript executing on another thread with its own ordinary objects**. First use the existing [one-task helper](../../workbench/node-js/runtime/worker.ts), saving its source as `worker.ts` beside these files. Node 24 can strip that helper's erasable type annotations; no new TypeScript build is needed for this experiment.

`first-thread.mjs`:

```js
import { workerData, parentPort } from 'node:worker_threads';
workerData.value += 1;
parentPort.postMessage({ value: workerData.value });
```

`first-thread-main.mjs`:

```js
import assert from 'node:assert/strict';
import { runWorker } from './worker.ts';

const original = { value: 1 };
const reply = await runWorker(
  new URL('./first-thread.mjs', import.meta.url), original,
  raw => {
    if (!raw || raw.value !== 2) throw new Error('Unexpected worker result');
    return raw;
  },
  { timeoutMs: 1000 }
);
assert.equal(original.value, 1);
assert.equal(reply.value, 2);
console.log(original.value, reply.value);
```

Run `node first-thread-main.mjs`: expect `1 2`. The worker changed its copy. The supplied helper validates the reply, observes failures and waits for cleanup; leave those safeguards intact. It stops the worker after a valid one-result message. The complete example below uses another deliberate policy—valid message followed by normal exit—so inspect that distinction next.

For the project, replace the small arithmetic example with a pure calculation on a snapshot of items the caller may access. Compare its report rows with the existing calculation, then compare the decompressed report output. Keep permission checks, database connections and HTTP responses outside the worker. Use a large enough test dataset before claiming better responsiveness. Ordinary database waiting does not need a worker thread.


:::: details Complete worker lifecycle and isolation example — inspect after the first experiment

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



<span class="notes-section-label">**Detailed explanation**</span>

The output is `1 2 true true`. The worker changed its copied input, while the parent’s value stayed `1`. Both have the same `process.pid` because they run in one process. Their `threadId` values differ. This example checks copying and identity. It does not prove a speed improvement or that a shared-memory algorithm is free of races.

The arithmetic is intentionally too small to justify creating a worker in a real application.

| Approach | Memory/execution boundary | Communication and typical reason |
|---|---|---|
| Ordinary asynchronous I/O | Current JavaScript thread coordinates waiting | Promises/callbacks for files/network/database operations; no extra JS worker required |
| spawn / execFile | Another OS process, possibly a non-Node executable | Controlled arguments and owned stdio; run an external tool |
| child_process.fork | Another Node process, separate heap and process identity | Node IPC messages; process separation for Node work |
| cluster worker | Another Node process under a primary | IPC plus coordinated listening; multiple service processes on one host |
| worker_threads Worker | Another JS isolate/thread in the same process | Structured clone, transfer lists or explicit shared memory; sustained CPU-heavy JS |

Structured cloning creates independent copies of supported data. It does not preserve every class, function or resource. Transferring an `ArrayBuffer` moves its storage to the receiver and removes the sender’s access. A `SharedArrayBuffer` lets both sides access the same bytes. Shared access needs coordination rules, often using `Atomics`.

These choices are not interchangeable performance switches. A library named worker pool might wrap threads or processes; inspect its actual boundary.

The helper checks its input and reply, handles worker errors and rejects an exit without a result. After a valid reply, it also requires the worker to exit normally. A worker that replies but stays alive reaches the deadline. The `finally` block stops the worker, waits for termination and removes its listeners before the caller’s promise finishes.

The [existing one-result wrapper](../module-02-standard-library.md#promise-wrapper) uses a different policy: it accepts a valid result and then stops the worker. Choose the completion rule explicitly. Do not mix the two helpers’ rules by accident. In this small `finally` block, a termination error can replace an earlier result or error. The next lesson explains how to preserve both failures.

A process separates some memory and failure behavior, but is not automatically a sandbox. It may still have the parent’s credentials and file/network permissions. Worker threads have separate ordinary JavaScript heaps, but share the process’s native failure risks and resource limits. A native crash or exhausted process resources can affect the whole service.

Separate worker heaps do not guarantee separate libuv pools for pool-backed APIs. Never send secrets or arbitrary executable paths merely because a message crosses a boundary.

For a CPU-heavy report, compare calculation time with the cost of starting a worker, copying data and scheduling work. Reusing a limited pool may help. For normal file, database or network waiting, start with async APIs and limits on accepted work.

Several processes or containers can distribute independent requests. They do not automatically speed up one operation that cannot be split. Cluster processes have separate in-memory sessions and caches. Decide where shared state lives, whether requests must return to the same process, and how shutdown/restart works.

Avoid unlimited worker creation and automatic crash respawn loops.

<span class="notes-section-label">**Common mistakes**</span>

- Calling fork or cluster a thread API, or assuming all workers share ordinary objects.
- Adding threads for already asynchronous I/O without evidence.
- Resolving on the first message while forgetting an active worker, or treating exit 0 without a reply as a business result.
- Treating a process/thread as a security sandbox or spawning one per unbounded request.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Is worker_threads the native libuv pool?**</span> No. It executes JavaScript on explicit threads; the native pool supports particular runtime operations. They can still compete for CPU/native capacity.
2. <span class="notes-section-label">**Can a parent mutex protect an ordinary object in a different process?**</span> Not by sharing that JavaScript object reference; the process has separate memory. Use an explicit message/external-storage protocol appropriate to the required consistency.
3. <span class="notes-section-label">**What should a troubleshooting report record?**</span> Which boundary is in use, input/task ID, startup/message/error/exit observations, queue and time budget, runtime and resource measurements. Do not log confidential payloads to compensate for missing correlation.

::: tip Key takeaway
Identify the execution and ownership boundary before choosing communication, failure handling or scaling behaviour.
:::

### One-question learner exercise {#one-question-learner-exercise}

- [ ] Predict and explain the fixture's output before running it; retain proof that the parent object is unchanged.
- [ ] Test worker startup failure, thrown error, malformed result, exit 0 without a result and a worker that reports then stays alive. Every case must terminate under an external test watchdog.
- [ ] Explain why fork, cluster and worker_threads solve different problems, then choose an approach for a CPU-heavy report, an external executable and an I/O-bound request.

Acceptance: check the returned values, errors and actual worker completion. The small calculation does not prove that threads are faster. This example also does not verify process/cluster integration, buffer transfers, shared-memory correctness, reusable pools or behavior on other operating systems.

Official references checked 2026-11-04: Node 24.18 [worker threads](https://nodejs.org/download/release/v24.18.0/docs/api/worker_threads.html), [cluster](https://nodejs.org/download/release/v24.18.0/docs/api/cluster.html), [child_process.fork](https://nodejs.org/download/release/v24.18.0/docs/api/child_process.html#child_processforkmodulepath-args-options). Earlier fork/IPC examples remain in [related explanation](./02-cli-and-processes.md#t02-q08); this question adds the process/thread comparison without duplicating that implementation.

::::

---

<!-- tech-check: t09-q02; level: 3 -->

## How should a worker task handle result validation, failure, timeout and caller cancellation?

*Study depth: Intermediate*

Level Up: L4 — Lead\
Tech Check level: ⭐⭐⭐

Source mapping: [R080](./requirements.md#r080).


<span class="notes-section-label">**Example — predict completion before running**</span>

Copy the helper below unchanged into a private test directory as `worker.ts`. Then create `sum-worker.mjs` and `run-worker.mjs`. Node 24.18 can remove this helper’s supported TypeScript annotations when loading it. **Removing types at runtime does not check them** or apply arbitrary `tsconfig` transformations.

No TypeScript dependency is needed for this stated runtime experiment.

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

**Define what counts as a finished task and which code handles every outcome.** A result, error, worker exit, timeout or cancellation can each end the wait. Validate incoming messages before accepting one as a successful result.

The helper used here accepts the first final outcome, removes its deadline and abort listener, stops the worker and waits for termination. It then removes its worker listeners and resolves or rejects the caller's promise. **Exiting successfully without a valid result still counts as failure.** An already aborted signal prevents startup; a later abort requests termination of this task's worker.

**Stopping a worker does not undo changes it already made.** A timer in the parent can also run late, so it cannot enforce an exact real-time execution limit.

</div>

<span class="notes-section-label">**Detailed explanation**</span>

The output is `6`, then `true`. A valid result selects success, but the helper waits for the worker to stop before resolving. This also removes its deliberately active interval. In the second call, cancellation happens while work is pending. After the worker stops, the caller receives the same Error object used as the cancellation reason.

Attaching catch immediately keeps that expected rejection observed. This is a per-task worker owner, not a cancellation mechanism for a shared pool worker running unrelated tasks.

The [previous example](#t09-q01) requires a valid reply followed by a normal exit. A worker that replies but hangs therefore times out. This helper accepts a valid one-result message as completion and then stops the worker itself.

Either completion policy can be valid. Mixing them can leave work running or report success too early. A worker must finish the required effects before sending a success message. Here it only calculates a number; no external transaction is involved.

Walk through the owner in stages:

1. Check the timer/parser arguments and any cancellation that happened before starting. If construction or input copying fails, reject without leaving a timer running.
2. Register handlers for messages, message-decoding errors, worker errors and exit. The synchronous parser must inspect the received value; a TypeScript assertion does not validate it.
3. The first final event sets `selected`. Later results, errors or cancellation cannot replace it. Which event is observed first may depend on timing.
4. Clear the deadline and remove the abort listener. Keep worker error/exit handlers while termination is in progress.
5. Await termination, remove the remaining listeners, then return the selected result or error. If termination fails, report an `AggregateError` containing the cleanup failure.

The input and result contracts are distinct: the worker rejects invalid numbers; the parent rejects malformed result shape. A structurally valid numeric reply still needs business-level tests for arithmetic/algorithm correctness.

This fixture accepts finite numbers and rejects a nonfinite total through parseSum; large numeric magnitudes, precision requirements or integer-only applications need a different domain contract.

Do not pass an async parser to this helper: its parser must return synchronously. Do not send progress messages on a channel that expects one final result. A protocol with several messages needs separate task, progress and result types.

A timeout means the parent observed the deadline before another final event and then started cleanup. The caller also waits for scheduling and termination. Synchronous code can delay the parent’s timer, and native code may take longer to stop. Use an external process supervisor when the deployment needs a final shutdown limit.

Throwing inside a worker normally reaches its error event; process/native resource failures need a broader recovery boundary. Cancellation cannot undo a write already committed by a worker, nor does it guarantee arbitrary in-worker finally cleanup finishes under forced termination.

For an active cancellation with an Error reason, this helper preserves that Error. If the active signal’s reason is `null` or `undefined`, it uses a fallback Error. Cancellation before startup and cancellation during work do not promise identical handling for every possible reason value. Document the cancellation behavior your application relies on.

In a pool, cancellation may remove queued work or stop the worker assigned to that task. Track task IDs and define when workers are replaced. Stopping a shared worker without checking its assigned work can destroy unrelated tasks.

<span class="notes-section-label">**Common mistakes**</span>

- Waiting forever after exit 0 without a reply, or treating online as a completed result.
- Using Promise.race to stop waiting while leaving the worker running.
- Accepting unknown messages with a type assertion or interpreting a progress message as final success.
- Removing error listeners before asynchronous termination completes, or claiming abort rolled back external effects.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**What if success arrives just before cancellation?**</span> Once success is selected, a later abort cannot replace it in this helper; termination still completes before resolution. Business effects need their own consistency rule.
2. <span class="notes-section-label">**Why keep the timer referenced?**</span> The owner deliberately requires pending tasks to remain supervised; an unreferenced timer alone need not keep the process alive. Clearing it at terminal selection prevents a later unrelated rejection attempt.
3. <span class="notes-section-label">**Does worker termination prove normal exit 0?**</span> No. Forced termination has its own exit behaviour. Here success means validated result plus completed termination, whereas Q01 requires natural exit 0 after its result.

::: tip Key takeaway
Select one outcome, validate its meaning and finish owned cleanup before reporting the task complete.
:::

### Learner exercise {#learner-exercise}

- [ ] Run the two-file example using the unchanged source helper and explain why its retained intervals do not leak.
- [ ] Test malformed result, worker throw, clean/nonzero exit without result, deadline, pre-abort and abort while the worker is active. Assert error identity where the contract preserves it and zero retained caller abort listeners.
- [ ] Exercise first-result-then-extra-message/late-error and explain the selected-outcome policy without relying on fragile millisecond races. Compare reply-then-hang under Q01 and Q02.

Acceptance: every worker must finish or be stopped. An external test timeout must still be able to stop a broken test. Record which result, error and cleanup paths you exercised. A normal thrown error does not test message-decoding failure or native termination failure.

Official references checked 2026-11-04: Node 24.18 [worker termination and events](https://nodejs.org/download/release/v24.18.0/docs/api/worker_threads.html), [AbortSignal reason](https://nodejs.org/download/release/v24.18.0/docs/api/globals.html#abortsignalreason), [TypeScript stripping limits](https://nodejs.org/download/release/v24.18.0/docs/api/typescript.html#type-stripping). The included implementation is the existing [source helper context](../module-02-standard-library.md#promise-wrapper); no second production helper was added.

<span id="next-small-batch"></span>


---

<!-- tech-check: t09-q03; level: 3 -->

## How do copying, transferring and shared memory change ownership between worker threads?

*Study depth: Intermediate; advanced shared-memory algorithms optional*

Level Up: L4 — Lead\
Tech Check level: ⭐⭐⭐

Source mapping: [R080](./requirements.md#r080).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

**Copying gives each side independent data.** Worker messages use structured cloning for supported values; not every function, class or resource can be copied this way.

**Transferring an `ArrayBuffer` gives its storage to the receiver.** The sender loses access through every view of that buffer, not just the view mentioned in the message. With `SharedArrayBuffer`, both sides access the same bytes instead.

**Shared memory needs rules for coordinating reads, writes and cleanup.** Sharing does not validate messages, undo effects after cancellation or save data durably across service instances.

</div>

<span class="notes-section-label">**Predict the ownership change**</span>

The parent initializes one integer to 7 and the worker changes it to 8. Which parent still sees 7, which loses its usable buffer, and which sees 8? Does transferring one typed-array view leave another view of the same backing buffer usable?

| Choice | Sender after communication | Receiver | Appropriate starting point |
|---|---|---|---|
| Structured clone | Retains independent supported data | Receives a separate representation | Small messages or independent ownership on both sides |
| ArrayBuffer transfer | Backing buffer detached; aliases lose access too | Receives ownership of the transferred storage | Large binary data whose sender relinquishes ownership |
| SharedArrayBuffer | Retains access to shared bytes | Can access the same storage | A measured need with a defined synchronization protocol |

A message containing a transferred buffer still has other fields; transferring the buffer does not avoid copying all message data. The receiver needs a reference to the buffer in the payload. Do not put a shared buffer in a transfer list. Functions and class behavior are not copied like ordinary data. Use explicit message fields and validate them.

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

If construction or cloning fails, no deadline has been created yet. After startup, error handlers remain until termination finishes. A reply followed by a hang cannot produce success in this helper. A termination failure is reported separately. Forced termination cannot guarantee normal worker cleanup or undo earlier effects. The optional filename is for controlled tests, not for paths supplied by an untrusted caller.

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

Run `node ownership-demo.mjs`. Here `null` means the parent no longer has a usable transferred value. It does not mean the worker wrote null. Do not use a detached view or assume that another view of the same buffer still works. If the worker fails, the sender does not regain that buffer automatically. Keep a separate recoverable input when the operation may need to be repeated.

<span class="notes-section-label">**Why the shared case uses Atomics**</span>

`counter[0]++` reads a value, changes it and writes it back. Concurrent writers can overwrite each other’s updates. `Atomics.add` makes this one integer update atomic. It does not make several fields, a queue or an entire business operation atomic. This test has one writer, so it checks visibility under that protocol. It does not test competing writers or prove a general race-free algorithm.

A shared queue needs rules for slot ownership, when data becomes visible, size limits, waiting, cancellation and failure recovery. Do not block the service’s main event loop with `Atomics.wait`. Advanced shared-memory queues remain optional. Prefer messages when their cost is acceptable and their ownership rules are easier to explain.

<span class="notes-section-label">**Buffers and subviews need extra care**</span>

A typed array or Buffer is a view, not necessarily the owner of its entire backing store. A subview can refer to a larger allocation; moving that whole allocation may move more data than intended. For this reason the example allocates a dedicated four-byte ArrayBuffer rather than transferring an arbitrary incoming Buffer's `.buffer`.

Node Buffer pooling adds version-specific copy/transfer restrictions. A small Buffer may share a larger allocation rather than own a separate transferable buffer. Do not send an entire pool to work around a transfer error. When needed, copy only the intended bytes into a separate buffer. Check the Node 24 guidance for the Buffer creation method you use.

<span class="notes-section-label">**Choose and measure**</span>

Measure worker startup, data copying, queue wait, calculation time, memory and responsiveness together. Copying large inputs can be expensive, but shared-memory coordination may cost more than the copying it avoids. Set separate limits for payload bytes and task count. Shared memory does not prevent an unlimited queue. A reusable pool still needs task IDs and cleanup rules.

For an image transform where the caller gives up its original bytes, transfer can fit. For a small report request retained for retries, a copy may be clearer. Shared counters may help a measured local need; a database remains responsible for state shared across process replicas. These are design choices, not a measured performance result from this fixture.

<span class="notes-section-label">**Common mistakes**</span>

- Expecting a copied function or class instance to keep all its behavior.
- Transferring a buffer, then continuing to use another view of that buffer.
- Assuming a failed worker automatically returns transferred data to the sender.
- Updating shared memory without agreed coordination rules.
- Treating local shared memory as a persistent distributed store.
- Accidentally changing when an existing helper considers a task complete.

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

[Node 24.18 worker messages, transfer lists and Buffer considerations](https://nodejs.org/download/release/v24.18.0/docs/api/worker_threads.html#portpostmessagevalue-transferlist), [Atomics.add specification](https://tc39.es/ecma262/multipage/structured-data.html#sec-atomics.add), [Atomics.wait and event-loop implications](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics/wait). The existing [source ownership introduction](../module-02-standard-library.md#message-copying-transfer-and-shared-memory) remains useful context. Runtime/version-specific details checked 2026-11-04; the examples above do not rely on later worker lock APIs.

---

<!-- tech-check: t09-q04; level: 3 -->

## How does a bounded reusable worker pool own admission, cancellation and shutdown?

*Study depth: Intermediate; multi-worker tuning and automatic recovery optional extensions*

Level Up: L4 — Lead\
Tech Check level: ⭐⭐⭐

Source mapping: [R080](./requirements.md#r080).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

A worker pool reuses a limited number of workers instead of creating a new one for every request. **Limit worker count, waiting tasks and message size separately.** A small worker count alone does not stop a waiting queue from filling memory.

Give tasks IDs so replies reach the correct caller, and track assigned work until it actually finishes. **A caller cancelling its wait does not automatically make the worker available.** During shutdown, stop accepting tasks, allow active work a limited time to finish, then stop remaining workers and wait for cleanup.

</div>

<span class="notes-section-label">**Predict admission and cancellation**</span>

With one worker and two waiting places, submit four tasks synchronously. Which one is rejected? If the running task's caller aborts, can the next task safely use that same worker immediately? What if the abandoned task never returns?

Use the complete implementation below first; then inspect and extend it in these stages while retaining its failure/cleanup checks:

| Stage | Observable check |
|---|---|
| Admission | One worker plus two waiting places rejects the fourth simultaneous task |
| Dispatch and correlation | Each result settles the caller with the matching task ID |
| Cancellation | Removing queued work differs from stopping/replacing a worker running a task |
| Failure | A malformed reply or worker exit fails the affected task without inventing success |
| Shutdown | Stop admission, finish or fail accepted tasks under a deadline, then observe worker closure |

Map these checks to Project 3’s existing report-job states. A successful message is not permission to mark an artifact completed before publication. Keep the report calculation and output schema unchanged while replacing its execution mechanism.

This experiment has **one reusable worker**. That makes task assignment and queue behavior easier to observe. The pool has clear limits, but it does not demonstrate several CPU workers running in parallel. Its small calculation tests the protocol, not performance.

| Boundary | Explicit policy in this lab |
|---|---|
| Worker capacity | One assigned task at a time, worker reused for later tasks |
| Queue capacity | Configurable 0–16 waiting places, FIFO; default 2 |
| Payload | At most 1000 integers, each 0–1000; copied snapshot on admission |
| Result | Tagged result, matching monotonic task ID, bounded integer |
| Queued cancel/deadline | Remove from queue; reject caller and release its place |
| Running cancel/deadline | Reject caller; keep physical slot occupied until result/failure |
| Protocol/worker failure | Fail closed, reject affected work, terminate; no automatic respawn |
| Close | Stop admission, drain accepted work; force termination if close budget expires |

There is no single correct worker count or queue length. Choose them from available CPU, other native work and the number of application instances. Measure queue wait, useful calculation time, memory and event-loop responsiveness. More workers or a larger queue can increase slow-request latency and resource use.

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

Save `sum-pool.mjs` beside the worker. Follow each task through acceptance → queue → worker assignment → matching reply → caller result. The filename option is for controlled tests. Do not accept executable paths from an HTTP request.

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

The first task starts immediately, two wait and the fourth rejects. Callers must handle these rejected promises. Every accepted task receives a new ID. The pool accepts a reply only when its ID and shape match the assigned task. An unknown, duplicate or wrong-ID reply fails the pool instead of completing another caller’s task. Checking the reply’s shape does not prove the calculation is correct; the result tests check that.

Each task retains a copied bounded input rather than a mutable caller array. Sparse/invalid arrays are rejected. Queue capacity does not bound every runtime allocation, but fixed worker count, bounded payloads and waiting places constrain the main retained workload. Global admission across process replicas is a separate control.

<span class="notes-section-label">**Cancellation is two different operations**</span>

Cancelling a queued task removes work that has not started. Its timer and abort listener are removed, and its queue place becomes available. Cancelling a running task rejects the caller’s promise but leaves the worker busy. The pool still checks its eventual reply before assigning another task. `snapshot().running` reports that actual running work, including tasks whose callers have stopped waiting.

This policy **does not stop a running calculation when its deadline expires**. A stuck worker can stay busy until the application closes the pool and reaches its shutdown deadline. Every example therefore awaits `close()` in `finally`. A production pool may instead check cancellation inside the calculation or stop and replace the assigned worker. Limit replacements and define what happens to the task’s result. A caller timeout must not free a still-busy worker slot.

Cooperative messages cannot interrupt a worker stuck in a synchronous loop that never checks them. Shared cancellation flags/checkpoints or forceful retirement have different costs and guarantees. Neither undoes a remote effect already committed. Before requeueing abandoned work, establish replay safety and know who owns the original outcome.

<span class="notes-section-label">**Drain, failure and resource ownership**</span>

Repeated `close()` calls return the same promise. New tasks reject while accepted tasks finish. When no tasks are queued or running, the pool stops its idle worker and waits for termination. `{ drained: true }` means the accepted work finished before cleanup. It does not mean the worker exited naturally with code 0.

If the shutdown deadline expires, queued and running callers reject. The pool waits for forced termination and returns `{ drained: false }`. Cleanup has finished, but the work did not finish normally. Worker or protocol failure rejects pending tasks and the close promise. A termination error is reported as a cleanup failure. The internal catch observes an automatically started close; callers still await `close()` to receive its failure.

Keep error/exit handlers until termination finishes, then remove them. An unexpected exit is a failure even with code 0. This lab stops accepting work after failure and never restarts the worker automatically. A real replacement policy needs restart limits, delays, readiness checks and clear responsibility for queued tasks. Distinguish failure to start from a crash after startup; both need cleanup.

A timer cannot preempt blocked parent JavaScript or guarantee a native thread stops immediately. The close budget initiates forceful termination; awaiting that termination can take longer. An external process supervisor remains the final deployment deadline. `unref()` is not graceful shutdown and does not establish task completion.

<span class="notes-section-label">**Diagnostics and alternatives**</span>

Record task IDs, queue wait, execution time, rejected tasks, busy slots and forced shutdowns. Keep private payloads out of logs. These IDs match requests to results; linking all related async diagnostic records is a separate integration. Node recommends `AsyncResource` for that tooling when building pools. This teaching pool does not implement it.

For a real service, compare a maintained pool library against these same admission, cancellation, worker-failure and shutdown requirements. For ordinary asynchronous I/O, start with the existing async APIs rather than adding CPU workers. For stronger process isolation or independently scaled jobs, a process/broker architecture may fit, with different delivery and persistence requirements.

<span class="notes-section-label">**Common mistakes**</span>

Creating unlimited workers, accepting an unbounded queue, sharing mutable input, resolving the next caller from an old result, freeing a running slot on caller cancellation, blindly respawning crashing workers, or reporting a forced shutdown as a completed drain. A Promise.race timeout by itself implements none of the underlying ownership rules.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Can a cancelled running task still use CPU?**</span> Yes under this policy. The caller has stopped waiting, while physical work retains the worker slot until its valid result, failure or pool teardown.
2. <span class="notes-section-label">**Why not immediately assign the next task to the same worker?**</span> The previous work has not finished. Reuse before its terminal protocol risks overlapping work, stale replies and incorrect capacity accounting.
3. <span class="notes-section-label">**Does queue size 2 mean only two total tasks?**</span> No. This pool can retain one assigned task plus two waiting tasks; payload and caller/output retention have separate costs.
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

Acceptance: verify results and promised error identities, keep work within its limits, and leave no worker, listener or timer running after close. Distinguish the caller’s promise finishing from the calculation finishing. Production performance, native termination errors and persistent external effects need separate tests.

<span class="notes-section-label">**Official references**</span>

[Node 24.18 worker pools and AsyncResource recommendation](https://nodejs.org/download/release/v24.18.0/docs/api/worker_threads.html), [worker termination](https://nodejs.org/download/release/v24.18.0/docs/api/worker_threads.html#workerterminate), [AsyncResource pool example](https://nodejs.org/download/release/v24.18.0/docs/api/async_context.html#using-asyncresource-for-a-worker-thread-pool), [existing bounded-work source introduction](../module-02-standard-library.md#_11-worker-pools-and-bounded-cpu-work). Checked 2026-11-04; this one-worker teaching implementation is deliberately narrower than a production scheduling library.

---

<!-- tech-check: t09-q05; level: 3 -->

## What does cluster share, and who owns service-process readiness and shutdown?

*Study depth: Intermediate; deployment-specific scheduling/replacement tuning optional*

Level Up: L4 — Lead\
Tech Check level: ⭐⭐⭐, ⭐⭐⭐⭐

Source mapping: [R037](./requirements.md#r037), [R080](./requirements.md#r080).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

`cluster` runs several separate Node server processes that can accept connections through a shared listening endpoint. **Sharing a port does not share application memory.** Each process has its own sessions and caches unless you deliberately use an external shared store.

The primary process coordinates starting workers, checking readiness, handling failures and stopping new work during shutdown. Each worker closes its own server resources. **An IPC disconnect, a process exit and a completed request are different events.** Observe the event that actually proves the outcome your protocol requires.

</div>

<span class="notes-section-label">**Reason through the topology**</span>

A primary starts two service workers. Each has its own JavaScript heap and local counter. A request reaches one worker; another worker cannot read that counter by ordinary reference. External/shared storage and intentional session routing are needed when the domain requires common state.

Cluster distributes connections using its scheduling policy; it does not promise an equal share of individual requests. One keep-alive connection can carry many requests. A long CPU operation still occupies the process handling it. Cluster does not split that operation across processes. Containers, an external load balancer or a process supervisor may provide the distribution you need. Account for total capacity before combining several layers.

<span class="notes-section-label">**Owned two-process service fixture**</span>

Save `cluster-lab.mjs` and run it with Node 24. It binds only loopback and uses an ephemeral port. Under cluster, these matching listen(0) calls share an allocated endpoint; they are not two independently selected ports. The fixed two-worker count is a lab policy, not a sizing recommendation.

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

The ready line appears after both workers report listening on the same port. Request `GET /` and inspect the responding PID and local count. Count requests separately for each PID. The test does not prove a global shared counter or a particular traffic ratio. A worker’s `online` event or PID alone does not prove readiness; a real service must also check its dependencies.

After the check, send SIGTERM to this lab’s primary process. It stops starting work and asks workers to finish accepted requests and disconnect. A deadline kills any remaining workers. The stopped line appears after their observed exits. The forced flag and exit status distinguish normal shutdown from forced cleanup. This lab has no database, jobs or WebSockets; real workers must close those resources too.

Unexpected worker loss makes this lab stop the remaining workers. It never restarts them automatically. Production replacement needs retry limits, delays and readiness checks. Distinguish a planned deployment stop from a crash, and avoid repeatedly restarting a broken release. A killed worker may lose its response after a remote write committed. Check the operation’s actual outcome before retrying.

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

[Node 24.18 cluster operation and lifecycle](https://nodejs.org/download/release/v24.18.0/docs/api/cluster.html), [HTTP service closure](https://nodejs.org/download/release/v24.18.0/docs/api/http.html#serverclosecallback). Version-specific sharing/scheduling details checked 2026-11-04. The [source cluster introduction](../module-02-standard-library.md#_7-cluster) remains its broader runtime context.

---

<!-- tech-check: t09-q06; level: 3 -->

## How should a service own a forked process from startup through actual closure?

*Study depth: Intermediate*

Level Up: L4 — Lead\
Tech Check level: ⭐⭐⭐

Source mapping: [R080](./requirements.md#r080), [R117](./requirements.md#r117).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

A forked Node child has its own JavaScript memory and an IPC messaging channel. **Explicitly control its permissions, inputs, output, errors and lifetime.** Starting a separate process does not automatically make it a secure sandbox.

A child may return a job result and remain available for more jobs. That result does not mean the process has ended. **A “stopped” reply is also not proof that the child has closed.** The parent must follow the agreed shutdown messages and observe actual process and output-stream closure before reporting cleanup complete.

</div>

<span class="notes-section-label">**Reuse the existing foundation, extend the lifecycle**</span>

The [one-request fork example](./02-cli-and-processes.md#t02-q08) already waits for the child to close. Here the child handles several requests. A result finishes one calculation; a separate stop → stopped → disconnect/close sequence ends the child process. The next question provides the shared session implementation.

Use fixed, reviewed module paths and runtime flags. This test passes an empty environment and does not inherit inspector arguments. That reduces accidental configuration changes, but the child still has the user’s OS permissions. A real child may need a selected set of environment variables, a working directory and runtime flags. Do not pass caller-selected executables or shell commands to this API.

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

Malformed input exits this fixture with code 2 after disconnecting. The parent treats a missing result or unclean session closure as failure. A returned PID is a useful diagnostic in this owned channel, not authentication for arbitrary external messages. The arithmetic and bounds are intentionally tiny and do not justify process startup in a real request path.

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

This example deliberately ignores stdout/stderr because the protocol does not use them for data. A real integration must read or forward output with size limits and safe diagnostic fields. An unread pipe can fill and block the child. Process exit and output-stream closure are separate events. The session’s close promise settles from the `close` event, after those streams close.

A request deadline stops this child because it has only one assigned job and no queue. It does not stop unrelated work in a shared process pool. If a child creates more processes, managing that process tree needs OS-specific handling. SIGKILL is forced POSIX cleanup, not a portable normal-shutdown guarantee. A parent timer also cannot guarantee immediate OS termination.

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

[Node 24.18 fork and ChildProcess events](https://nodejs.org/download/release/v24.18.0/docs/api/child_process.html#child_processforkmodulepath-args-options), [close semantics](https://nodejs.org/download/release/v24.18.0/docs/api/child_process.html#event-close), [process lifecycle context](./02-cli-and-processes.md#t02-q05).

---

<!-- tech-check: t09-q07; level: 3 -->

## How do repeated IPC requests enforce correlation, flow control and terminal ownership?

*Study depth: Intermediate*

Level Up: L4 — Lead\
Tech Check level: ⭐⭐⭐

Source mapping: [R117](./requirements.md#r117).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

IPC carries messages; your application defines what they mean. **Check the message version, type, request ID, payload and whether it is valid at the current stage.** Match each reply to its request so a late or duplicate reply cannot complete another task.

**A send callback does not prove the task finished.** It reports progress in sending the message. Limit how many application requests may be active independently of the channel's internal buffering. Assign clear responsibility for each result, failure and shutdown path, so every pending operation finishes exactly as the protocol promises.

</div>

<span class="notes-section-label">**One assigned request, no hidden waiting queue**</span>

The session accepts one request at a time and rejects another while busy. IDs increase within a maximum of 100 jobs per session. Each reply must match the current request ID, expected calculation and child PID. Messages contain no caller-selected executable path or permission fields. A real service must validate its own message schema and check permissions at the protected operation.

The session sends one small request and waits for its result before accepting another. Node’s `send` can return false when the channel is closed or has too much buffered data. Do not immediately resend the command. Handle callback errors and stop submitting work until the protocol allows it. Supporting several pending requests needs byte/message limits and separate state for each task. The channel’s buffer limit is not an application queue limit.

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

The request timer includes child startup and the wait for a reply. An unexpected or duplicate reply fails the session rather than completing another task. The close timer limits how long the owner waits before forced cleanup. The close promise still waits for the process and its output streams to close. Repeated close calls return the same promise.

An internally attached rejection handler observes an automatically failed closure, but callers still await close to receive that failure. Ignored stdio is deliberate in this fixture; it does not provide diagnostic output guarantees. The code does not exercise the native saturated-buffer branch or handle passing, and does not claim them from ordinary small-message tests.

A valid reply can arrive before a later session failure. If the child writes data but its reply is lost, the caller cannot assume that the write was rolled back. Persistent operation IDs and saved outcomes allow safe retry decisions. This child only remembers IDs in memory during one session. After restart it has no record of earlier effects.

Default serialization, explicit advanced serialization and worker-thread transfer/shared-memory rules are different contracts. Choose supported values deliberately, test the actual mode and avoid reserved internal message conventions. Passing a socket/handle is a separate capability handoff with buffered-data, ownership and platform concerns; use it only when justified, rather than smuggling it into an ordinary data schema.

<span class="notes-section-label">**Common mistakes and debugging**</span>

Do not treat `send` returning true or its callback running as a job result. Do not resend simply because `send` returns false. Reject stale or duplicate replies, limit queued work, and finish required replies before disconnecting. Record request IDs, protocol stages and queue pressure without private payloads. A request ID grants no permission.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Why reject a duplicate result even if its number looks valid?**</span> It violates the phase/ID contract and can otherwise complete an unrelated operation.
2. <span class="notes-section-label">**Would a window of 10 need more than 10 IDs?**</span> It needs explicit active/pending ownership, byte limits, timeouts and cancellation/outcome policy, not just a counter.
3. <span class="notes-section-label">**Does disconnect flush a durable business log?**</span> No. Transport closure and durable commit are separate responsibilities.

::: tip Key takeaway
Correlate application outcomes, bound producers independently, and wait for the resource owner’s terminal protocol.
:::

<span class="notes-section-label">**Practice — learner work still required**</span>

- [ ] Verify busy rejection and invalid input without creating an application queue.
- [ ] Inject wrong/duplicate replies and clean exit without a reply; assert that another task cannot receive that result.
- [ ] Test request and shutdown deadlines, then design a bounded two-request window with explicit out-of-order matching before implementing it.

Acceptance: each promise must finish according to the documented protocol stage, repeated close calls must be safe, and every child must close. Sending a message is not proof of a committed business result. Saturated send buffers and handle passing need their own integration tests.

<span class="notes-section-label">**Official references**</span>

[Node 24.18 send/callback/flow-control semantics](https://nodejs.org/download/release/v24.18.0/docs/api/child_process.html#subprocesssendmessage-sendhandle-options-callback), [serialization modes](https://nodejs.org/download/release/v24.18.0/docs/api/child_process.html#advanced-serialization). Version-sensitive details checked 2026-11-04; the [existing single-request IPC owner](./02-cli-and-processes.md#t02-q08) remains the simpler starting point.

---

<!-- tech-check: t09-q08; level: 3 -->

## How do you choose and troubleshoot a production concurrency model?

*Study depth: Intermediate; representative infrastructure measurements remain practical work*

Level Up: L4 — Lead\
Tech Check level: ⭐⭐⭐

Source mapping: [R119](./requirements.md#r119), [R101](./requirements.md#r101).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

**Choose the mechanism that addresses the measured bottleneck.** Async I/O lets Node do other work while waiting. Worker threads can run CPU-heavy JavaScript in parallel. Child processes run separate programs or provide process separation. Service replicas distribute independent requests across instances.

Also consider permissions, shared-state correctness, failure handling and shutdown. Limit accepted work and retained data across all instances, not just one process. Measure where time goes: queueing, calculation, message copying or waiting for a dependency.

**A timeout or crash can leave a business outcome unknown.** Keep a way to identify the operation and check whether its effect happened before retrying it.

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

In this example, three application copies with two processes each create 24 CPU workers and allow up to 60 database connections. A rolling deployment can briefly run old and new copies together, so include that overlap in the budget. One process’s limit is not a global limit. Use the actual CPU quota and available resources, not just the host’s core count. Memory, sockets, native work and dependency capacity also matter.

<span class="notes-section-label">**A reproducible diagnostic sequence**</span>

1. Define the symptom: request/job latency percentile, error rate, queue depth and admission rejection over a stated workload, not only average throughput.
2. Separate queue wait, execution, serialization and downstream wait. Identify the actual PID/thread/topology and correlate safe task IDs.
3. Inspect event-loop delay and CPU profiles for synchronous work. Check memory/GC and retained payloads if queues grow. For DB slowness, distinguish acquisition wait, locks and execution plans.
4. Change one resource/policy at a time under the same representative test. Keep correctness, errors, recovery and resource retention in the comparison.
5. Test overload, worker loss, timeout, cancellation and shutdown. Record whether the caller’s outcome is known and whether all physical work actually settled.

For example, high queue wait with CPU workers fully occupied can justify admission rejection, smaller work or measured capacity changes. High DB acquisition wait with low CPU is a different bottleneck: inspect leaked connections/long transactions and total connection demand before adding threads. A timer that fires late during parent blocking is not evidence that its configured number was ignored by a worker scheduler.

<span class="notes-section-label">**Failure and delivery decisions**</span>

Define cancellation for queued and assigned tasks separately. Decide who retries work, how operations are identified, and how repeated bad input or crashes are handled. A retry after a lost reply can duplicate a remote effect. A crash loses local caches, sessions and duplicate-ID records. Verify identity and permissions where the protected operation happens. A process or thread boundary grants neither.

During a rolling replacement, stop accepting work, give accepted tasks a deadline, then close resources and wait for threads/processes to stop. Forced termination is a separate outcome. Use an external supervisor if JavaScript or native cleanup cannot finish. An unreferenced worker or an abandoned promise does not prove that work finished.

<span class="notes-section-label">**Common mistakes**</span>

Common mistakes include adding threads for I/O waiting, enlarging every pool at once, ignoring the number of application copies, treating a small local benchmark as a service guarantee, and testing only success. Diagnostics must show queued and actually running work, not only rejected promises.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**What measurement justifies more workers?**</span> Representative useful CPU work/queue saturation with available capacity, plus a same-workload comparison that preserves latency, errors and retention.
2. <span class="notes-section-label">**What remains after all local examples pass?**</span> Actual dependency/proxy/topology limits, platform behavior, recovery and learner operational practice.
3. <span class="notes-section-label">**Can forced termination mean an operation failed?**</span> Not necessarily. A remote effect may already be committed; reconcile it through the operation’s outcome protocol.

::: tip Key takeaway
Choose the bottleneck and ownership boundary first; measure the full topology and test its failure outcomes.
:::

<!-- tech-check: t09-q09; level: 3 -->

## What does Event Splitting mean in this high-load preparation path?

*Study depth: Intermediate*

Level Up: L3 — Senior\
Tech Check level: ⭐⭐⭐

Source mapping: [R176](./requirements.md#r176).



The supplied chart names “Event Splitting” but does not define it. This lesson uses an **explicit interpretation: dividing a long operation into limited chunks across event-loop turns**. It is not a Node API name. The L3 audience is also this guide’s choice; the chart gives no separate career target for this entry.

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Here, “Event Splitting” means dividing a long operation into small chunks. Run one chunk, then schedule the next with a mechanism such as `setImmediate()` so the event loop can handle other callbacks in between.

**Chunking creates opportunities for other work to run; it does not create parallel CPU execution.** Each chunk still blocks its thread while running. Limit the total input, chunk size and number of active jobs. If measurements show sustained CPU-heavy work needs a separate thread, use a limited worker pool with explicit task and cleanup handling.

</div>

<span class="notes-section-label">**Run a bounded example**</span>

Save as `event-splitting.mjs` and run `node event-splitting.mjs` with Node 24. This example sums integers rather than accepting arbitrary callback work whose duration could be unbounded.

```js [event-splitting.mjs]
import assert from 'node:assert/strict';
import { setImmediate as yieldTurn } from 'node:timers/promises';

async function sumPartitioned(count, { chunkSize = 1000, signal } = {}) {
  if (!Number.isSafeInteger(count) || count < 0 || count > 1000000)
    throw new RangeError('count');
  if (!Number.isSafeInteger(chunkSize) || chunkSize < 1 || chunkSize > 10000)
    throw new RangeError('chunkSize');
  signal?.throwIfAborted();
  let sum = 0;
  for (let start = 0; start < count; start += chunkSize) {
    signal?.throwIfAborted();
    const end = Math.min(start + chunkSize, count);
    for (let i = start; i < end; i++) sum += i;
    if (end < count) await yieldTurn(undefined, { signal });
  }
  return sum;
}

let observedOtherWork = false;
const marker = yieldTurn().then(() => { observedOtherWork = true; });
assert.equal(await sumPartitioned(10000, { chunkSize: 100 }), 49995000);
assert.equal(observedOtherWork, true);
await marker;
assert.equal(await sumPartitioned(0), 0);
await assert.rejects(sumPartitioned(5, { chunkSize: 0 }), RangeError);
const controller = new AbortController();
const pending = sumPartitioned(1000000, { signal: controller.signal });
controller.abort();
await assert.rejects(pending, { name: 'AbortError' });
console.log('Partitioned result, interleaving and cancellation pass.');
```

<span class="notes-section-label">**Why this changes responsiveness**</span>

Without awaiting the immediate, the loop keeps the JavaScript thread until it finishes. With the await, later chunks run on later event-loop turns. `await Promise.resolve()` only schedules a microtask and can still prevent timers and I/O from running. `EventEmitter.emit()` does not solve this either: ordinary listeners run synchronously.

The marker assertion shows that another scheduled immediate ran before this calculation finished. It does not guarantee timer order, fairness between clients or a latency target. Counting iterations works here because each iteration has a similar small cost. Chunking cannot interrupt one long regular expression, JSON parse or synchronous native call. A time check between items also cannot interrupt an item that is already running.

<span class="notes-section-label">**Choose the right boundary**</span>

| Need | Approach | Remaining responsibility |
|---|---|---|
| Keep a moderate operation responsive | Partition and yield between chunks | Measure chunk duration and total latency |
| Run CPU work in parallel | Bounded worker-thread pool | Admission, transfer, cancellation and worker termination |
| Defer a durable business operation | Queue with an explicit job contract | Idempotency, retries and delivery semantics |
| Process a large incoming sequence | Stream with backpressure | Bound buffering and the work per chunk |

**Per-job chunking does not bound the number of admitted jobs.** Thousands of yielding jobs can still exhaust memory/CPU. Use the [worker admission/lifecycle lesson](#t09-q04) and [load-measurement lesson](./12-performance-and-v8.md#t12-q05) to decide between rejection, chunking and offloading. Cancelling a partial computation cannot undo effects already committed; keep this example's intermediate sum private until success.

<span class="notes-section-label">**Practice and acceptance**</span>

Compare a synchronous sum, this partitioned sum and a worker implementation under the same finite input. Record correct results, total time, loop delay and concurrent health-request latency. Try several chunk sizes, pre-abort and abort during a yield. Accept only with bounded admission and cleanup; report scheduling overhead and retain a slower result. No fixed timing threshold belongs in this functional fixture.

Reference: [Node.js partitioning and offloading guidance](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop).

---

## Concurrency revision

| Boundary | Retained material |
|---|---|
| Isolation and per-task ownership | Questions 1–2: process/thread differences, result/error/exit/cancel semantics |
| Data ownership and reusable CPU work | Questions 3–4: clone/transfer/shared memory, bounded queue and physical occupancy |
| Service/process topology | Questions 5–7: cluster, forked session, correlated bounded IPC and actual closure |
| Production choice | Question 8: workload, capacity multiplication, diagnosis and recovery decisions |

- [ ] Reproduce the worker ownership and pool failure checks with an external watchdog.
- [ ] Run cluster and fork sessions, provoke worker/child loss, and retain PID/readiness/closure evidence.
- [ ] Choose a concurrency model for one actual service and compare a rejected alternative using representative measurements.
- [ ] Demonstrate overload, cancellation and rolling shutdown without treating unknown remote outcomes as failures to retry blindly.

Learning material covers all five listed concurrency source items. Every exercise is still your practical work; none of the local checks establishes production capacity or professional readiness.

Official references: [Node 24.18 worker threads](https://nodejs.org/download/release/v24.18.0/docs/api/worker_threads.html), [cluster](https://nodejs.org/download/release/v24.18.0/docs/api/cluster.html), [child processes](https://nodejs.org/download/release/v24.18.0/docs/api/child_process.html), [performance diagnosis source](../module-11-performance-diagnostics.md). Last verification:2026-11-05.
