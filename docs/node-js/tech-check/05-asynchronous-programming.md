---
outline: [2, 3]
---

# Asynchronous programming

This chapter covers callback contracts, promises, async/await and error ownership. Examples are standalone `.mjs` files on Node.js 24.18.0, with no external dependencies. It also covers bounded control flow, combinators, cancellation and async iteration, completing the five supplied subtopics as study material.

This chapter complements the [foundations explanation](../module-01-nodejs-foundations.md#_6-asynchronous-programming-patterns).

For the chart’s basic Generators topic, start with [synchronous generators](#t05-q09); return to [async iteration](#t05-q08) after learning promises.

<span class="notes-section-label">**First pass:**</span> work through the short callback, promise and async/await examples in questions 1–3. Then learn why a later error needs its own handler (question 4) and compare sequence with a small `Promise.all` (question 5). Custom worker pools, combinator edge cases, cancellation and async iterators are a second pass. Read the synchronous generator introduction in question 9 before async generators in question 8.

The expandable deeper explanations preserve the additional examples and interview follow-ups. **You can return to them after you can explain and change the starter example.** Career labels describe the eventual assessment target, not what you must master on your first reading.

<!-- tech-check: t05-q01; level: 1 -->

### What is an error-first callback contract, and why do timing and exactly-once completion matter?

*Study depth: Foundational to intermediate*

Level Up: L1 — Junior\
Tech Check level: ⭐

Source mapping: [R008](./requirements.md#r008).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

A callback is a function you pass to another function. **A callback is not necessarily asynchronous**: the receiving function may call it immediately or later. Many Node APIs use `callback(error, result)`: on success, the error is `null` and the result contains the value; on failure, the error contains an `Error`.

**An operation that promises one result should call its callback exactly once.** After reporting an error, return so the success code cannot run too. Document when the callback can run. A `try/catch` around the original call cannot catch an exception thrown later in an asynchronous callback. Handle errors inside that callback, or use a suitable promise-based API.

</div>

<span class="notes-section-label">**Start here — one working example**</span>

Create a small `message.txt` containing `Hello`, then save this as `read-callback.mjs` in the same folder:

```js
import { readFile } from 'node:fs';

readFile('message.txt', 'utf8', (error, text) => {
  if (error) {
    console.error('Could not read the file');
    process.exitCode = 1;
    return;
  }
  console.log(text);
});
console.log('Read requested');
```

Run `node read-callback.mjs` from that folder. `Read requested` appears before `Hello`: the callback runs after the file operation reports its result. Its first argument describes a failure; on success it is `null`. Rename the file and run again. The `return` stops the error branch from also printing a success result.

:::: details Deeper explanation and additional examples — optional on your first pass

<span class="notes-section-label">**Example — predict before reading the answer**</span>

Save as `callbacks.mjs`. Which lines run, and can invalid input reach the success path?

```js
export function doubleLater(value, callback) {
  if (typeof callback !== 'function') throw new TypeError('callback required');
  queueMicrotask(() => {
    if (!Number.isFinite(value)) {
      callback(new TypeError('finite number required'));
      return;
    }
    const doubled = value * 2;
    if (!Number.isFinite(doubled)) {
      callback(new RangeError('result overflow'));
      return;
    }
    callback(null, doubled);
  });
}

doubleLater(3, (error, result) => {
  if (error) { console.log(error.name); return; }
  console.log('result', result);
});
doubleLater(NaN, (error) => console.log('invalid', error.name));
console.log('scheduled');
```

<span class="notes-section-label">**Detailed explanation**</span>

The output is `scheduled`, `result 6`, `invalid TypeError`. Both operation outcomes use the same deferred timing. A missing callback is a synchronous programmer-contract error; invalid numeric input is the example's asynchronous operation error. This distinction is explicit, rather than claiming every callback API reports every possible error the same way.

Real APIs can throw synchronously for invalid arguments and later report I/O failures through their callback.

Exactly-once completion is an API obligation, not something JavaScript enforces for ordinary functions. Calling the callback twice can send two HTTP responses or apply a side effect twice. A guard may suppress duplicate delivery, but it cannot undo duplicated database writes. Multi-event subscriptions have a different contract and should not be confused with one-shot completion.

A common timing defect is returning a cached value synchronously but delivering a cache miss asynchronously. Callers can observe different initialization/reentrancy behavior.

Prefer a consistent documented asynchronous boundary for such an API. queueMicrotask is used here only to demonstrate that boundary: it does not send arithmetic to another CPU thread, provide a time budget or make a large computation nonblocking.

Avoid wrapping the entire callback invocation in a catch that invokes the same callback again: if the consumer callback throws, that pattern can misreport a consumer bug as an operation failure and call the consumer twice. Error conversion should surround the operation that can fail, then deliver the result outside that conversion block.

<span class="notes-section-label">**Common mistakes**</span>

- Saying every function passed as an argument runs later: Array.map callbacks run synchronously.
- Continuing after callback(error), or throwing the same operation error after delivering it.
- Expecting return result inside the callback to return from doubleLater.
- Assuming deferred CPU-heavy work cannot block the main thread.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Can try/catch around doubleLater catch a later consumer throw?**</span> No. That invocation has returned when the microtask runs. It can catch the missing-callback argument error.
2. <span class="notes-section-label">**Is the callback's return value the asynchronous result?**</span> Not in this contract. The result is delivered through its arguments.
3. <span class="notes-section-label">**What replaces nested callbacks?**</span> Named functions can clarify legacy code; native promise APIs and async/await simplify composition. Changing syntax does not remove dependency or cleanup obligations.

::: tip Key takeaway
Specify error delivery, timing and completion count before composing a callback API.
:::

::::

---

<!-- tech-check: t05-q02; level: 1 -->

### What does a promise represent, and how do chaining and callback adaptation work?

*Study depth: Intermediate*

Level Up: L1 — Junior\
Tech Check level: ⭐

Source mapping: [R009](./requirements.md#r009).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

A promise represents one result that may arrive later. It starts pending, then becomes fulfilled with a value or rejected with a reason. **Every `.then()` returns a new promise.** Returning a value supplies the next result; returning a promise makes the chain wait for it; throwing makes the next promise reject.

**Promise handlers run later, but a `new Promise()` executor runs immediately.** Return or await work that the caller needs to wait for, including its errors. Prefer built-in promise APIs when available. `promisify()` can adapt a compatible error-first callback API, but not an arbitrary stream of events. A promise does not create a worker thread or automatically cancel work.

</div>

<span class="notes-section-label">**Start here — one working example**</span>

Save as `promise.mjs`:

```js
const result = Promise.resolve(3);

result
  .then(value => value * 2)
  .then(value => console.log(value));

console.log('Waiting for the result');
```

Run `node promise.mjs`. It prints `Waiting for the result`, then `6`. `Promise.resolve(3)` creates a fulfilled promise. The first handler returns `6`, which becomes the next handler's input. Both handlers run after the current synchronous code.

For a real operation that can fail, attach a `.catch()` handler. The next question shows the same error handling using `try/catch` and `await`. Learn this simple chain before studying callback adaptation or promise executor timing below.

:::: details Deeper explanation and additional examples — optional on your first pass

<span class="notes-section-label">**Example — predict both results**</span>

Save beside callbacks.mjs as `promises.mjs`.

```js
import { promisify } from 'node:util';
import { doubleLater } from './callbacks.mjs';

const double = promisify(doubleLater);
console.log('double', await double(4));
const recovered = await double(Infinity)
  .then(value => value + 1)
  .catch(error => { console.log('caught', error.name); return 0; })
  .then(value => value + 1);
console.log('recovered', recovered);

const calls = [];
const once = new Promise((resolve, reject) => {
  calls.push('executor');
  resolve(2);
  reject(new Error('ignored settlement'));
  calls.push('after resolve');
});
const next = once.then(value => { calls.push('handler'); return value * 3; });
calls.push('sync');
console.log('chain', await next, calls.join(','));
```

<span class="notes-section-label">**Detailed explanation**</span>

Importing callbacks.mjs also executes its demonstration, so its three lines appear first. Then this file prints `double 8`, `caught TypeError`, `recovered 1` and `chain 6 executor,after resolve,sync,handler`. The catch returns 0, deliberately recovering the chain. Logging without returning or rethrowing would recover with undefined; the next stage must not interpret that as valid data accidentally.

Settled means fulfilled or rejected. Resolved means locked to a value or another promise/thenable's eventual outcome, so a promise resolved to a still-pending promise can remain pending. Only the first resolving/rejecting action takes effect; resolve does not return from the executor, and ignored later settlement does not prevent later side effects.

A promise does not fix an underlying API that writes twice or never calls back.

A fulfillment handler that starts a request but forgets to return its promise creates floating work. Its child chain can finish too early and its rejection can escape that chain's catch. Also, then(onSuccess, onFailure) handles rejection of the preceding promise; onFailure does not handle a throw inside its sibling onSuccess. A subsequent catch observes that resulting rejection.

promisify assumes the final argument is an error-first callback. Bind an object method to its receiver when it needs this, and check nonstandard multiple-result/custom-promisify contracts. Prefer node:fs/promises over wrapping an existing promise API or manually reconstructing its behavior.

Do not use an async executor inside new Promise: the executor's returned promise is ignored, so rejection after await can become detached while the outer promise remains pending.

<span class="notes-section-label">**Common mistakes**</span>

- Equating resolve with immediate fulfillment or execution stopping.
- Returning nothing from a necessary chain stage or adding new Promise around an already promise-returning API.
- Treating catch as logging-only when its normal return actually changes failure into success.
- Assuming a promise timeout or rejection cancels the underlying operation.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Can multiple consumers await one promise?**</span> Yes. Each can observe the same settlement; this does not rerun the original operation.
2. <span class="notes-section-label">**Does throwing inside the executor reject?**</span> A synchronous executor throw rejects if not already resolved. A throw in a later unrelated callback is outside that executor call stack.
3. <span class="notes-section-label">**Does awaiting a stored promise start its work?**</span> Often work already started when the API was called. A function returning a promise can be used as a task factory when you need to defer starting it.

::: tip Key takeaway
Keep the completion chain connected; adaptation must preserve the original API's contract.
:::

::::

---

<!-- tech-check: t05-q03; level: 1 -->

### What does async/await change, and how should errors and cleanup be structured?

*Study depth: Intermediate*

Level Up: L2 — Software Engineer\
Tech Check level: ⭐

Source mapping: [R032](./requirements.md#r032).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

**An `async` function always returns a promise.** `await` pauses that function until a value or promise has an outcome, while other JavaScript work can run. If the promise rejects, `await` throws the rejection reason, which a surrounding `try/catch` can handle.

**`await` does not move calculations to another thread.** Long synchronous calculations can still block other requests. Use `finally` for cleanup that must run after either success or failure. When you start opening resources yourself, the deeper example explains how to wait for both the operation and its cleanup.

</div>

<span class="notes-section-label">**Start here — one working example**</span>

Create a small `message.txt` containing `Hello` and save this beside it as `read-await.mjs`:

```js
import { readFile } from 'node:fs/promises';

async function printMessage() {
  const text = await readFile('message.txt', 'utf8');
  console.log(text);
}

try {
  await printMessage();
} catch {
  console.error('Could not read the message');
  process.exitCode = 1;
}
```

Run `node read-await.mjs` from that folder. `readFile` returns a promise; `await` lets the next line use its completed value. If the read fails, execution jumps to `catch`. Rename the file to see that path. Unlike the callback version, the successful steps read from top to bottom.

The file API handles its internal file resource here. When your own code opens a resource explicitly, learn the `finally` cleanup pattern below.

:::: details Deeper explanation and additional examples — optional on your first pass

<span class="notes-section-label">**Example — identify each observable outcome**</span>

Save as `await.mjs`. The injected acquire function makes resource ownership visible without opening a real database.

```js
export async function readAndClose(acquire) {
  const resource = await acquire();
  try {
    return await resource.read();
  } finally {
    await resource.close();
  }
}

export async function contextual(load) {
  try {
    return await load();
  } catch (cause) {
    throw new Error('Could not load configuration', { cause });
  }
}

let closed = false;
const result = await readAndClose(async () => ({
  async read() { return 'data'; },
  async close() { closed = true; }
}));
console.log(result, closed);
try {
  await contextual(async () => { throw new TypeError('invalid fixture'); });
} catch (error) {
  console.log(error.message, error.cause.name);
}
```

<span class="notes-section-label">**Detailed explanation**</span>

The example prints `data true`, then `Could not load configuration TypeError`. Resource acquisition is before the try: if it rejects before transferring ownership, this function has no acquired resource to close. The acquire implementation must handle its own partially acquired resources.

After successful acquisition, finally executes for both read success and rejection, including a return inside try.

Here return await keeps read inside the protected lifetime. Changing it to return resource.read() runs finally before that promise settles. The resource may close while the read is still using it.

Likewise, contextual must await load inside its try if it wants to wrap an asynchronous rejection; simply returning load() would let that rejection bypass its local catch. This is a semantic ownership question, not a blanket rule to add or remove await everywhere.

If close throws or rejects, finally replaces a pending return or throw with the cleanup failure. Sometimes that is the chosen contract; sometimes retain both failures in an AggregateError or preserve the primary error with a recorded cleanup cause. State the policy and test it. Never return from finally merely to suppress failures.

This teaching example deliberately propagates a close failure; it is not a complete database transaction helper.

Execution before the first await is synchronous. Even awaiting a nonpromise value resumes through promise scheduling; that is not a guarantee of fairness to I/O. CPU-heavy JSON parsing or an infinite loop still blocks other callbacks.

Dependency order also remains real: await user then fetch permissions when permissions need the user ID; starting independent operations concurrently requires a separate failure/limit policy, addressed in async control flow.

<span class="notes-section-label">**Common mistakes**</span>

- Forgetting to await a call inside try and expecting its later rejection to be caught there.
- Catching all failures and returning a success-shaped fallback without a business rule.
- Closing a resource too early or ignoring an asynchronous close promise.
- Assuming async functions synchronously throw to their caller, or await creates a worker.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**What does an async function with no explicit return fulfill with?**</span> undefined, unless it throws/rejects.
2. <span class="notes-section-label">**Does finally run on process termination?**</span> It is a language control-flow mechanism, not a guarantee after forced termination or a crash. Durable work needs a separate design.
3. <span class="notes-section-label">**Should every error be wrapped?**</span> No. Add useful stable context at a meaningful boundary and retain cause. Avoid leaking secrets or wrapping so often that diagnosis loses the original code/details.

::: tip Key takeaway
Use await to express completion and ownership, including the error and cleanup paths.
:::

::::

---

<!-- tech-check: t05-q04; level: 1 -->

### Why can asynchronous failures escape a surrounding try/catch?

*Study depth: Intermediate*

Level Up: L1 — Junior\
Tech Check level: ⭐⭐

Source mapping: [R016](./requirements.md#r016).


<span class="notes-section-label">**Example — find the owner of each rejection**</span>

Save as `ownership.mjs`. Is emit's return value a completion promise?

```js
import { EventEmitter } from 'node:events';

const bus = new EventEmitter();
const failures = [];
let finish;
const finished = new Promise(resolve => { finish = resolve; });
async function handleJob(id) {
  if (id !== 1) throw new Error('unknown job');
  return 'done';
}
bus.on('job', id => {
  void handleJob(id).catch(error => {
    failures.push(error.message);
  }).finally(() => finish());
});
console.log('listener present', bus.emit('job', 2));
await finished;
console.log('handled', failures.join(','));
```

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

**`try/catch` catches errors thrown while its code runs, including failures from promises it awaits.** It does not automatically catch errors in a callback that runs later, or a rejection from a promise you started without awaiting or catching it.

Handle a later callback's errors in that callback. Return, await or catch promises so some part of the application handles their failures. **`EventEmitter.emit()` does not wait for async listeners.** Handle their rejected promises explicitly, or use a correctly configured `captureRejections` approach. Process-level error handlers can report serious failures, but they do not replace error handling for an individual request.

</div>

<span class="notes-section-label">**Detailed explanation**</span>

The output is `listener present true`, then `handled unknown job`. The true value means a listener was present, not that its asynchronous job succeeded. The wrapper owns handleJob's rejection immediately, records a controlled fixture message and resolves the completion latch in finally.

The demonstration uses one event and infallible in-memory handling; a real job system needs explicit correlation, bounded concurrency, shutdown and recovery contracts. Await a direct promise-returning application function when the caller actually needs its result rather than relying on this latch as a general event protocol.

Writing an async listener with await inside it does not make emit await the listener. Wrapping emit in try/catch can catch a synchronous listener throw, but an async function converts a throw into rejection of its returned promise.

Default EventEmitter behavior ignores that return value. captureRejections is an opt-in mechanism that routes supported listener rejections to an error path; it does not transform emit into an awaitable job API or remove the need to handle error events.

The void operator discards a value; it does not catch errors. The example is safe for its stated fixture because its catch/finally callbacks do not throw. If a real logging or cleanup handler can fail, the derived promise also needs an owner and an appropriate terminal policy.

Likewise, starting two promises and awaiting them one at a time can leave the second rejection temporarily unobserved; attach combined handling promptly rather than assuming eventual await is always early enough.

For a CLI, use an awaited main with a terminal catch that reports a safe diagnostic and sets process.exitCode. For a server request, propagate to the framework's documented error boundary. Detached tasks require their own supervision and lifetime. A promise alone does not keep a process alive without active supporting resources.

None of these patterns prove retries are safe: duplicate writes need idempotency and transaction reasoning.

<span class="notes-section-label">**Common mistakes**</span>

- Using void doWork() as if it handled rejection.
- Awaiting emit and interpreting the boolean as a job result.
- Throwing from an asynchronous callback expecting an earlier try/catch to catch it.
- Swallowing failures globally and continuing with potentially corrupted state.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Does catch always end the error chain?**</span> No. It returns a new promise; its handler can throw or return a rejecting promise.
2. <span class="notes-section-label">**How should a deliberate crash example be tested?**</span> In an owned child process with bounded execution; assert its exit and diagnostic without installing a handler that hides the failure.
3. <span class="notes-section-label">**What should you inspect first in a floating-promise bug?**</span> Who started the operation, which promise is returned, where a handler attaches, and whether that boundary lives long enough to observe completion.

::: tip Key takeaway
Every started operation needs an owner for its result, failure and lifetime.
:::

## practice — learner work remains required {#b08-practice--learner-work-remains-required}

- [ ] Implement a compatible callback API and prove success, invalid input and overflow each call back once, always after the caller's synchronous statement.
- [ ] Adapt it with promisify and demonstrate fulfillment, rejection, recovery and rethrow. Explain why suppressing a second settlement does not undo repeated side effects.
- [ ] Inject a delayed read and assert close happens only after read settles, on success and failure. Test acquisition and cleanup failures separately; document the chosen precedence.
- [ ] Demonstrate an unobserved async-listener rejection in an isolated child, then repair it with explicit ownership. Explain why emit still returns a boolean.

Acceptance: assertions cover actual values, ordering, call counts, error identity/cause and cleanup; all promises/child processes terminate. An expected-failure case must fail for the intended reason. Writing these criteria or running the author's fixture does not establish that the learner performed the exercises.

Official references checked 2026-11-04: Node.js 24.18 [error propagation](https://nodejs.org/download/release/v24.18.0/docs/api/errors.html#error-propagation-and-interception), [promisify](https://nodejs.org/download/release/v24.18.0/docs/api/util.html#utilpromisifyoriginal), [EventEmitter](https://nodejs.org/download/release/v24.18.0/docs/api/events.html#capture-rejections-of-promises); ECMAScript [promise objects and reactions](https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-promise-objects), [async functions](https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-async-function-objects). The versioned Node baseline is explicit; these examples do not rely on later runtime APIs.



---

<!-- tech-check: t05-q05; level: 1 -->

### How do you choose sequential, concurrent and bounded control flow?

*Study depth: Intermediate*

Level Up: L3 — Senior\
Tech Check level: ⭐

Source mapping: [R031](./requirements.md#r031).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

**Run operations in sequence when each needs the previous result.** Independent I/O operations can run concurrently: several can be waiting for results during the same period. For a large collection, limit how many operations may run at once.

**`Promise.all()` does not limit how much work starts.** If you start thousands of reads before passing their promises to it, those reads have already started. The pool below limits active operations, keeps results in input order and stops starting new items after it notices a failure. It waits for active operations to finish before rejecting. Choose a limit your database, filesystem or other dependency can handle; concurrent waiting does not itself mean parallel JavaScript execution.

</div>

<span class="notes-section-label">**Start here — one working example**</span>

Save as `sequence.mjs`:

```js
async function double(value) {
  return value * 2;
}

const first = await double(2);
const second = await double(first);
console.log(second);

const independent = await Promise.all([double(3), double(4)]);
console.log(independent);
```

It prints `8`, then an array containing `6` and `8`. The first two operations run in sequence because the second needs the first result. The two calls inside `Promise.all` are started before waiting for their combined result. This arithmetic example shows composition, not a speed improvement or separate CPU threads.

Use `Promise.all` for a small known set of independent operations. It rejects if an input rejects, but does not cancel the others. For many inputs, limit how many operations start at once; implementing that worker pool is an optional next step below.

:::: details Deeper explanation and additional examples — optional on your first pass

<span class="notes-section-label">**Example — predict the result and peak active count**</span>

Save as `bounded.mjs`. Inputs are a finite, dense, application-owned array; mapper returns when its owned work finishes.

```js
export async function mapBounded(items, limit, mapper) {
  if (!Array.isArray(items) || !Number.isInteger(limit) || limit < 1 ||
      typeof mapper !== 'function') throw new TypeError('invalid arguments');
  const results = new Array(items.length);
  let cursor = 0, failed = false, failure;
  async function worker() {
    while (!failed) {
      const index = cursor++;
      if (index >= items.length) return;
      try {
        results[index] = await mapper(items[index], index);
      } catch (error) {
        if (!failed) { failed = true; failure = error; }
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  if (failed) throw failure;
  return results;
}

let active = 0, peak = 0;
const output = await mapBounded([3, 1, 2], 2, async value => {
  active++; peak = Math.max(peak, active);
  try { await Promise.resolve(); return value * 2; }
  finally { active--; }
});
console.log(output.join(','), peak, active);
```

<span class="notes-section-label">**Detailed explanation**</span>

Output is `6,2,4 2 0`. Multiple workers claim indices synchronously before yielding at await, so no two workers claim the same index on this one JavaScript thread. Each stores its result at the original index, independently of completion order. The finite result array still uses O(n) memory; limiting active work does not make the entire input/output streaming or bounded in size.

Failure policy matters as much as the limit. A separate failed flag retains even an unusual falsy rejection such as undefined. The first observed error is retained; later active errors are caught too. No new mapper starts after failed becomes true, but work can start before that rejection is observed. Active work is drained, not cancelled or rolled back.

A mapper that hangs prevents completion. Q07 adds cooperative cancellation concepts; a production queue also needs admission limits, fairness, deadlines and shutdown rules.

Avoid items.forEach(async ...): forEach ignores callback promises. Promise.all(items.map(mapper)) observes results but immediately starts all mapping calls, including their synchronous work. Dependency-aware for...of is often clearer than a pool for small serial workflows.

Libraries such as p-limit or a job queue can provide different scheduling features; inspect their abort/queue/error semantics rather than assuming every limiter drains or cancels identically.

<span class="notes-section-label">**Common mistakes**</span>

- Limiting promises after the network requests have already started.
- Treating database connection-pool capacity as unlimited application admission control.
- Assuming first failure undoes writes or cancels siblings.
- Increasing concurrency for CPU-bound JavaScript and expecting more CPU threads.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Why not mutate items during execution?**</span> This teaching contract assumes stable dense input. Snapshot or validate externally supplied collections and define mutation semantics explicitly.
2. <span class="notes-section-label">**What limit should a database importer use?**</span> Start below the available connection/service capacity, reserve room for other traffic and measure latency, saturation and errors. No universal number fits every dependency.
3. <span class="notes-section-label">**What if every failure must be reported?**</span> Keep assigning and return per-item outcomes under an explicit all-results policy; this implementation instead stops assignment after observed failure.

::: tip Key takeaway
Control when work starts and define what happens to active work when one item fails.
:::

::::

---

<!-- tech-check: t05-q06; level: 1 -->

### Which promise combinator matches the required outcome?

*Study depth: Intermediate*

Level Up: L2 — Software Engineer\
Tech Check level: ⭐

Source mapping: [R009](./requirements.md#r009), [R031](./requirements.md#r031).


<span class="notes-section-label">**Example — predict order, outcomes and empty-input behavior**</span>

Save as `combinators.mjs`. Both operations below are already started.

```js
const bad = Promise.reject(new Error('fixture failure'));
const good = Promise.resolve('ok');
const all = Promise.all([good, bad]).catch(error => error.message);
const settled = Promise.allSettled([bad, good]);
const any = Promise.any([bad, good]);
const race = Promise.race([bad, good]).catch(error => error.message);
console.log(await all, await any, await race);
console.log((await settled).map(item => item.status).join(','));
console.log((await Promise.all([])).length);
try { await Promise.any([]); }
catch (error) { console.log(error.name, error.errors.length); }
```

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Choose according to the result you need:

- **`Promise.all()` needs every input to succeed.** It returns results in input order and rejects as soon as it observes a rejection.
- **`Promise.allSettled()` waits for every outcome**, then reports which inputs fulfilled or rejected.
- **`Promise.any()` returns the first successful result.** It rejects with `AggregateError` if every input rejects.
- **`Promise.race()` returns the first outcome**, whether success or failure.

**None of these cancels the remaining work.** Handle failures promptly, limit how many operations you start and separately control their time and resource use.

</div>

<span class="notes-section-label">**Detailed explanation**</span>

The lines are `fixture failure ok fixture failure`, `rejected,fulfilled`, `0`, and `AggregateError 0`. Attaching all combinators before yielding gives each rejected input an observer immediately. With these already settled inputs, reaction registration/input traversal makes the first rejected element win race; do not extrapolate this controlled example to arbitrary I/O ordering.

all preserves input order, not completion order. Rejection of all is an early notification, not proof every sibling has stopped or settled. allSettled waits for every outcome, so one pending input can prevent the report forever.

It fulfills with descriptors for ordinary input rejection; iteration/setup failures can still reject the combinator itself. any's AggregateError.errors follows input order. race is useful for a deadline notification but needs separate cancellation/cleanup ownership.

Empty inputs are edge cases: all and allSettled fulfill with empty arrays, any rejects with an empty AggregateError, and race remains pending forever. Even reactions to already settled promises run asynchronously. None of these methods transforms a CPU-heavy loop into parallel computation or automatically retries failures.

In an independent dashboard fan-out, all may fit if all data is mandatory, while allSettled can support visible partial failure. any can select the first successful mirror, but all started mirrors still cost resources and may perform side effects. Do not race writes as if losing meant they never committed.

Sequential dependencies are still sequential; a combinator cannot manufacture an ID that the previous operation has not returned.

<span class="notes-section-label">**Common mistakes**</span>

- Choosing race when the requirement is first successful response.
- Treating allSettled statuses as success without inspecting each descriptor.
- Assuming all is a transaction or all inputs have completed when it rejects.
- Forgetting empty collections and promises that never settle.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Can all reject while another operation later succeeds?**</span> Yes. The combined promise's rejection does not cancel that operation.
2. <span class="notes-section-label">**Should errors be replaced by null before all?**</span> Only with an explicit, distinguishable fallback contract. Otherwise the resulting array conceals failure as normal data.
3. <span class="notes-section-label">**How do you prove completion ordering?**</span> Use controlled promises you settle explicitly; avoid tests that depend on tiny timer delays or external network speed.

::: tip Key takeaway
Aggregation chooses an outcome; scheduling, cancellation and side-effect safety remain separate decisions.
:::


---

<!-- tech-check: t05-q07; level: 1 -->

### How do cancellation and deadlines differ from racing a timeout?

*Study depth: Intermediate*

Level Up: L2 — Software Engineer\
Tech Check level: ⭐

Source mapping: [R031](./requirements.md#r031).


<span class="notes-section-label">**Example — explain what actually stops**</span>

Save as `cancellation.mjs`. This helper accepts an optional caller signal and owns its deadline timer. It waits for cooperative operation completion, not a guaranteed hard wall-clock cutoff.

```js
import { setTimeout as sleep } from 'node:timers/promises';

export async function withDeadline(operation, milliseconds, callerSignal) {
  if (typeof operation !== 'function' || !Number.isInteger(milliseconds) ||
      milliseconds < 1 || milliseconds > 2_147_483_647) {
    throw new TypeError('invalid deadline');
  }
  const controller = new AbortController();
  const relay = () => controller.abort(callerSignal.reason);
  if (callerSignal?.aborted) relay();
  else callerSignal?.addEventListener('abort', relay, { once: true });
  const timer = setTimeout(() => {
    controller.abort(new Error('deadline exceeded'));
  }, milliseconds);
  try {
    controller.signal.throwIfAborted();
    const value = await operation(controller.signal);
    controller.signal.throwIfAborted();
    return value;
  } finally {
    clearTimeout(timer);
    callerSignal?.removeEventListener('abort', relay);
  }
}

console.log(await withDeadline(async () => 'fast', 1000));
const caller = new AbortController();
const pending = withDeadline(signal => sleep(60_000, 'late', { signal }),
  60_000, caller.signal);
caller.abort(new Error('caller stopped'));
try { await pending; }
catch (error) { console.log(error.name, error.cause?.message); }
```

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

**A timeout says “stop waiting”; cancellation asks the work to stop.** Racing an operation against a timeout with `Promise.race()` chooses which result you receive. It does not stop the other operation.

`AbortController` provides a signal you can pass to APIs that support cancellation. Pass that signal through your functions, handle signals that are already aborted, and remove timers and listeners in `finally`. **Cancellation needs the operation's cooperation and does not undo completed changes.** Use the API's documented error or reason to distinguish a deadline, a caller's cancellation and an ordinary failure.

</div>

<span class="notes-section-label">**Detailed explanation**</span>

Output is `fast`, then `AbortError caller stopped`. Node's promise timer rejects with AbortError and retains the signal reason as cause. Other APIs can expose a different reason/error shape. The helper forwards a caller signal into its own controller and aborts that controller on timer expiry. It never aborts the caller's controller.

The first abort reason remains authoritative. The final signal check rejects an operation that ignored abort but eventually returned, rather than presenting that late value as timely success.

A signal is not forced termination. If operation ignores it forever, this helper also waits forever; a synchronously blocked event loop prevents its deadline callback from running on time. Even a cooperative API needs time to unwind.

To stop waiting promptly while supervising unfinished work, design an explicit response-versus-background-completion boundary; a hard execution boundary may require a worker/process and termination policy. Do not advertise Promise.race as resource cleanup.

For simple cases, AbortSignal.timeout and AbortSignal.any can compose a timeout and parent signal on this Node baseline. This explicit helper instead demonstrates ownership of a clearable timer and removable caller listener. Neither design is a transaction, a distributed deadline propagation protocol, or a retry policy.

Persisted writes may succeed just before cancellation is observed; retry needs idempotency/reconciliation. Reuse a remaining end-to-end budget across layers rather than granting a fresh full timeout at each hop.

<span class="notes-section-label">**Common mistakes**</span>

- Forgetting pre-aborted signals or leaving deadline timers/listeners alive after success.
- Matching only error.message to decide whether an abort was expected.
- Retrying cancelled writes without checking whether the first attempt committed.
- Claiming a timer can interrupt synchronous CPU work or undo remote effects.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Why check after operation returns?**</span> A signal-ignoring operation may fulfill after cancellation; the helper's contract rejects that late result. It still cannot undo its effects.
2. <span class="notes-section-label">**Why cap milliseconds?**</span> Node timer delays have a supported range; oversized values can be normalized unexpectedly. Validate rather than pretending an enormous number creates an enormous deadline.
3. <span class="notes-section-label">**Should cleanup share an already aborted signal?**</span> Not automatically. Cleanup may need a separately bounded budget to release resources; otherwise cancellation can prevent the cleanup itself.

::: tip Key takeaway
A deadline is a policy, an abort is a request, and cleanup needs an owner.
:::


---

<!-- tech-check: t05-q08; level: 3 -->

### How do async iterators and generators control demand and cleanup?

*Study depth: Intermediate*

Level Up: L4 — Lead\
Tech Check level: ⭐⭐⭐

Source mapping: [R070](./requirements.md#r070), [R170](./requirements.md#r170), [R171](./requirements.md#r171).


<span class="notes-section-label">**Example — predict which values are requested and when close runs**</span>

Save as `iteration.mjs`. The cursor is an injected teaching fixture, not a live database driver.

```js
export async function* cursorValues(open, signal) {
  signal?.throwIfAborted();
  const cursor = await open(signal);
  try {
    while (true) {
      signal?.throwIfAborted();
      const item = await cursor.next(signal);
      signal?.throwIfAborted();
      if (item.done) return;
      yield item.value;
    }
  } finally {
    await cursor.close();
  }
}

const events = [];
let index = 0;
const source = cursorValues(async () => ({
  async next() { events.push('next'); return { value: ++index, done: index > 3 }; },
  async close() { events.push('close'); }
}));
for await (const value of source) {
  events.push(`use ${value}`);
  if (value === 2) break;
}
console.log(events.join(','));
```

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

An async iterator provides values through a `next()` method that returns a promise containing `value` and `done`. An async iterable provides that iterator through `Symbol.asyncIterator`. An async generator, written with `async function*`, makes this easier: use `yield` to provide values.

**`for await...of` finishes the current loop body before asking for the next value.** This lets the consumer control when it requests more data. When you break out, the loop calls and awaits the iterator's `return()` method if it has one. In the example, this runs `finally` and closes the cursor. Still handle errors and cancellation: the underlying data source may buffer values even while your loop is waiting.

</div>

<span class="notes-section-label">**Detailed explanation**</span>

Output is `next,use 1,next,use 2,close`. Calling cursorValues constructs a lazy generator; it does not open the cursor until iteration starts. Each yield suspends the generator until the consumer asks again. The consumer's break initiates iterator closing, so no third value is requested.

A normal exhausted source also closes through finally; a cursor.next rejection inside the generator likewise unwinds it. Acquisition failure remains the opener's responsibility for partial resources.

The result of next is not just a raw value: done distinguishes exhaustion, and undefined can itself be valid data. for await also accepts synchronous iterables through an adapter and awaits their yielded values. That does not make synchronous production nonblocking or repair every cleanup trap in a custom synchronous generator yielding rejected promises.

Use the actual async protocol for this resource-owning asynchronous producer.

There are limits to closing guarantees. If an arbitrary custom async iterator's next rejects, do not assume the consumer will call its return as well; this generator closes because its own try/finally sees the rejection. A manually abandoned iterator stays suspended after yield until the owner resumes or calls return.

Calling return while the generator is awaiting an uncooperative next does not interrupt that await; pass a supported signal to the underlying operation. A finally block that yields more data also changes closing behavior; do not yield from resource cleanup in this pattern.

The sequential loop body naturally limits requests made by this consumer. A database driver, stream adapter or push-to-pull queue may still prefetch or buffer internally. Inspect those limits and use a bounded pipeline when adding concurrency.

For a Node stream, consider its async iterator lifecycle and stream.pipeline for coordinated stream errors/backpressure; stream-specific APIs remain in their own topic group.

<span class="notes-section-label">**Common mistakes**</span>

- Treating the iterator as an array or calling next repeatedly without observing its promises.
- Forgetting to close an iterator manually abandoned after a partial read.
- Assuming break interrupts an already pending network read immediately.
- Claiming for await guarantees constant memory for any producer or consumer.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**What if the consumer throws in the loop body?**</span> for await attempts iterator closing; this generator's finally closes its cursor. Forced process termination remains outside that guarantee.
2. <span class="notes-section-label">**Does a generator resume when you call the generator function again?**</span> No. That creates a separate iterator. Resume the existing instance with next.
3. <span class="notes-section-label">**What if close rejects?**</span> A close rejection replaces a normal break in this pattern. When the loop body has already thrown, iterator-closing semantics preserve that original throw even if return/cleanup rejects. A producer error inside the generator can instead be replaced by its own finally failure. Define and test each path; both errors are not automatically preserved.

::: tip Key takeaway
Async iteration expresses demand and lifetime; cancellation and producer buffering still need explicit contracts.
:::

<!-- tech-check: t05-q09; level: 1 -->

### How does a synchronous generator pause, resume and finish?

*Study depth: Foundational*

Level Up: L1 — Junior\
Tech Check level: ⭐

Source mapping: [R152](./requirements.md#r152).



Level Up is the intended career target for this question and answer; the supplied table gives this chart topic no separate Level Up proficiency. Read this Foundations question before the [async generator lesson](#t05-q08).

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Calling a function declared with `function*` creates an iterator. **The function body starts on the first `next()` call.** Each `yield` supplies a value and pauses the function. Another `next()` resumes it. The returned object contains `value` and `done`, which tells you whether the iterator has finished.

**A synchronous generator does not let the event loop run just because it reaches `yield`.** The caller controls what happens next. Expensive work between yields still runs synchronously on the caller's thread.

</div>

<span class="notes-section-label">**Predict, then run**</span>

Save as `generators.mjs` and run `node generators.mjs`. It needs no packages.

```js [generators.mjs]
import assert from 'node:assert/strict';
const events = [];
function* numbers() {
  events.push('start');
  try {
    yield 10;
    yield 20;
    return 99;
  } finally {
    events.push('close');
  }
}
const iterator = numbers();
assert.deepEqual(events, []);
assert.deepEqual(iterator.next(), { value: 10, done: false });
assert.deepEqual(iterator.next(), { value: 20, done: false });
assert.deepEqual(iterator.next(), { value: 99, done: true });
assert.deepEqual(iterator.next(), { value: undefined, done: true });
assert.deepEqual(events, ['start', 'close']);

// for...of consumes yielded values, excluding the terminal return value.
assert.deepEqual([...numbers()], [10, 20]);
events.length = 0;
for (const value of numbers()) {
  assert.equal(value, 10);
  break;
}
assert.deepEqual(events, ['start', 'close']);

const manual = numbers();
manual.next();
assert.deepEqual(manual.return('stopped'), { value: 'stopped', done: true });
console.log('Generator progression and early closing pass.');
```

<span class="notes-section-label">**Detailed explanation**</span>

Each call to `numbers()` owns a separate suspended execution. The generator object is both an iterator (`next`) and iterable (`Symbol.iterator` returns itself). An iterable such as an array can instead create a fresh iterator on each traversal. Reusing an exhausted generator produces no more yielded values.

`done: true` identifies completion even when `value` is meaningful. A yielded `undefined` still has `done: false`; do not test the value alone. `next(input)` supplies the value of the suspended `yield` expression; the first `next` argument has no suspended yield to receive it. `throw(error)` raises an exception at the suspension point and can be handled inside the generator.

Breaking a `for...of` loop invokes an available `return()` method. In this example it enters `finally`; manual consumers must close abandoned iterators themselves. Calling `return()` before the first `next()` does not start the body or its `finally`. Acquire resources inside the generator when iteration begins, and avoid yielding from cleanup if callers rely on one closing call finishing it. The [Iterator pattern](./patterns/behavioral-data.md#t18-q18) develops resource-owning traversal further.

A generator is useful for lazy sequences and traversal. Spreading it into an array materializes all results; spreading an infinite generator never finishes. `yield` hands control to the consumer, which may immediately call `next()` again. Compare `async function*`, whose iteration results are promises, with this synchronous protocol.

<span class="notes-section-label">**Practice and acceptance**</span>

Write a finite `range(start, end)` generator with an exclusive end. Predict its first two results, exhaustion and reuse. Test empty input, early break and manual `return()`. Then add a `try/finally` event log and explain why an unstarted iterator closes differently. Accept when the output matches the protocol and you can explain why a CPU-heavy generator can still block HTTP requests.

References: [ECMAScript generator objects](https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-generator-objects), [generator declarations](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*).

---

## Revision {#group-5-revision}

Callbacks, promises and async/await express completion with different contracts. Keep every operation's result and rejection connected to an owner. Choose dependency order, aggregation outcome and start limits independently. Cancellation requests cooperation; cleanup and side-effect reconciliation are separate.

Async generators make a sequence demand-driven while preserving a place to release acquired resources.

<span class="notes-section-label">**What you should be able to explain or implement**</span>

- [ ] Explain callback timing/count, promise chaining and async error ownership.
- [ ] Test return-await resource lifetime and acquisition/read/cleanup failure paths.
- [ ] Choose serial work, independent fan-out or a bounded pool with an explicit failure policy.
- [ ] Explain all/allSettled/any/race, empty inputs and pending/losing work.
- [ ] Propagate parent cancellation and deadline expiry; remove owned listeners/timers.
- [ ] Consume an async generator incrementally and close on exhaustion, break and failure.

<span class="notes-section-label">**async control flow practical exercise — learner work required**</span>

Build an importer from an injected async cursor to an injected save function. Keep a finite maximum number of active saves, preserve a per-input outcome record, and propagate a caller signal and remaining budget. Define whether an observed failure stops assignment or collects all outcomes.

Acceptance: assert the peak limit, no assignment after observed failure under the chosen policy, active-work settlement, pre-abort and mid-flight abort, cursor close on break/error, and cleanup precedence. Include empty input and a rejection reason of undefined.

State that cancellation cannot undo a committed save and demonstrate an idempotency/reconciliation strategy. Never use real production data for this exercise.

<span class="notes-section-label">**Mixed practice — attempt all before reading the answers**</span>

1. A pool receives promises from 1000 already-started requests and sets limit 4. What has it failed to limit?
2. all rejects while a sibling write is still active. Has that write been rolled back?
3. Which combinator produces the first successful mirror result, and what happens if every mirror fails?
4. A timeout wins race but the request API ignores its signal. What still needs an owner?
5. A consumer breaks after two values from cursorValues. How many next calls occur in the fixture, and what releases the cursor?
6. The owner stores an iterator after one next call and never resumes or closes it. Is cleanup guaranteed?

<span class="notes-section-label">**Practice answers**</span>

1. Request starts and resource admission. Give the scheduler task factories or inputs so it controls invocation.
2. No. Aggregation rejection is not cancellation or a transaction. Observe the sibling outcome and reconcile side effects.
3. any; all failures produce AggregateError with input-ordered errors. Losing work is not automatically cancelled.
4. The unfinished request, its eventual failure/success and resources. A response deadline does not imply completed cleanup.
5. Two; the loop calls the iterator's return during early closing, entering the generator's finally and awaiting close.
6. No. The iterator can remain suspended at yield. The owner must call return or consume it through a construct with an appropriate closing path.

Additional official references checked 2026-11-04: Node.js 24.18 [promise timers and cancellation](https://nodejs.org/download/release/v24.18.0/docs/api/timers.html#timers-promises-api), [AbortController and AbortSignal](https://nodejs.org/download/release/v24.18.0/docs/api/globals.html#class-abortcontroller); ECMAScript [Promise combinators](https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-promise.all), [async generator objects](https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-asyncgenerator-objects), [for-in/of evaluation and closing](https://tc39.es/ecma262/multipage/ecmascript-language-statements-and-declarations.html#sec-for-in-and-for-of-statements).

<span id="next-batch-checkpoint"></span>

