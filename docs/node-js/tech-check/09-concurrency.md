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

