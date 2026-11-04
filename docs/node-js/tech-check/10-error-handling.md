---
outline: [2, 3]
---

# Error handling

An application needs a deliberate failure contract as well as a success contract. These questions use **Node.js 24.18.0 and ES Modules**, with no package installation needed for the first examples.

Read the examples before their explanations. Error text, paths, payloads and nested causes can contain sensitive data; the examples print only fixed diagnostic fields. The seven questions cover error categories, custom causes, async ownership, diagnosis, recovery policy, Express boundaries and database retries. A revision and separate learner checklist follow.

### What does an Error object tell you, and how do you choose a built-in error type? {#t10-q01}

*Study depth: Intermediate*

**Example — predict the categories**

Save as **`error-types.mjs`**. Which failures indicate invalid JSON syntax, a wrong value type and a value outside the endpoint's range?

```js
export function parseQuantity(text) {
  if (typeof text !== 'string') {
    throw new TypeError('Quantity input must be JSON text');
  }
  const value = JSON.parse(text);
  if (typeof value !== 'number') {
    throw new TypeError('Quantity must be a number');
  }
  if (!Number.isSafeInteger(value) || value < 1 || value > 100) {
    throw new RangeError('Quantity must be an integer from 1 to 100');
  }
  return value;
}

for (const input of ['3', '{', '"3"', '0']) {
  try {
    console.log('value', parseQuantity(input));
  } catch (error) {
    console.log('failure', error instanceof Error ? error.name : 'NON_ERROR');
  }
}
```

**Short exam answer**

An `Error` represents a failure and usually provides a name, human-readable message and stack for diagnosis. Choose a built-in subtype for a meaningful category: `TypeError` for an invalid type/operation, `RangeError` for a value outside its accepted bounds, and `SyntaxError` for invalid syntax. Use documented codes or application-owned classes for handling decisions; do not depend on the wording of messages.

**Example answer**

The output is **`value 3`**, then **`failure SyntaxError`**, **`failure TypeError`** and **`failure RangeError`**. Parsing `"3"` as JSON succeeds but produces a string, which violates this function's contract. Valid syntax is not the same as valid application input.

**Anatomy and interpretation**

| Field or category | Useful meaning | Limitation |
|---|---|---|
| `name` | Human-readable error category | Can be changed; not an authenticated or exhaustive classification |
| `message` | Diagnostic explanation | Can change or contain secrets; unsuitable as a machine contract |
| `stack` | Diagnostic call-site context | Runtime-dependent text; not a stable parsing/authorization interface |
| `code` | Documented machine-readable category on many Node/application errors | Not present on every Error; scope it to the known operation |
| `cause` | Earlier failure retained when adding context | Can have any type; is not necessarily safe to serialize |

`ReferenceError` concerns unavailable identifiers; a syntax error can also prevent a module from loading before its code executes. A catch block inside that invalid module cannot repair its own parse failure. A dependency imported during startup can fail before your service starts listening.

A **system error**, such as `ENOENT` from a file operation, includes operation-specific information. Branch on the documented `code` within that adapter, not a substring of the message. Missing an optional cache file and missing a required deployment file can have the same OS code but require different application responses.

“Operational” versus “programmer” error is a **contextual distinction**, not a reliable mapping from constructor names. A `TypeError` caused by an unchecked request may indicate missing validation; a `TypeError` caused by dereferencing an impossible internal state may reveal a bug. Neither should be silently turned into a successful empty result.

**Catch only where you can do something useful**

A boundary may validate, recover under a defined policy, translate a failure, release resources or report it to an owner. A catch that merely returns `undefined` changes the contract and hides the failure. A catch that repeats `throw error` adds no context by itself, though its surrounding `finally` may still matter.

JavaScript can throw **any value**, including `null` or a string. That is why a catch variable is not automatically an Error. Prefer throwing Error objects in code you own. When receiving failures from other boundaries, narrow the value before reading properties; do not assume a cast makes it safe.

**Common mistakes**

- Treating every `SyntaxError` as a bad user request, even if it came from internal code.
- Matching `error.message` text to decide whether a database failure is retryable.
- Returning an empty collection when the data store failed, hiding the difference between “empty” and “unavailable.”
- Sending the raw Error or stack to a client.

**Examiner follow-ups**

1. **Does constructing an Error throw it?** No. `new Error()` creates a value; `throw` or promise rejection delivers the failure.
2. **Is `JSON.stringify(new Error('failed'))` a useful error response?** Usually not: important standard Error properties are non-enumerable. Custom enumerable fields can still leak; explicitly project a reviewed response.
3. **Can a catch safely read `error.message` without checking?** No. A rejection or throw can contain any value. Narrow it or use a fixed fallback category.

::: tip Key takeaway
An error category helps diagnosis; the operation's contract determines how the application should respond.
:::

**Practice — learner work still required**

Extend the input cases with a boolean, `null`, a fractional number and the valid boundaries 1 and 100. **Acceptance:** predict each outcome before running, distinguish parsing from type/range validation, and retain the failing operation's context without exposing raw input in logs.

**Official references:** [Node 24 error classes and system codes](https://nodejs.org/download/release/v24.18.0/docs/api/errors.html), [JavaScript throw semantics](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/throw).

### When should you create a custom error, and how do you preserve its cause safely? {#t10-q02}

*Study depth: Intermediate*

**Example — predict the error boundary**

Save as **`product-errors.mjs`**. Both operations fail, but one has a valid “not found” result and the other cannot obtain a result at all. Which failure should preserve an underlying cause? Which information may leave the application?

```js
export class ProductNotFoundError extends Error {
  constructor() {
    super('Product was not found');
    this.name = 'ProductNotFoundError';
    this.code = 'APP_PRODUCT_NOT_FOUND';
  }
}

export class ProductLookupError extends Error {
  constructor(cause) {
    super('Product lookup failed', { cause });
    this.name = 'ProductLookupError';
    this.code = 'APP_PRODUCT_LOOKUP_FAILED';
  }
}

export async function lookupProduct(id, findById) {
  if (typeof id !== 'string' || !/^[a-z0-9-]{1,32}$/.test(id) ||
      typeof findById !== 'function') {
    throw new TypeError('Invalid lookup arguments');
  }
  let product;
  try {
    product = await findById(id);
  } catch (cause) {
    throw new ProductLookupError(cause);
  }
  if (product === null) throw new ProductNotFoundError();
  if (!product || typeof product !== 'object' || Array.isArray(product) ||
      product.id !== id || typeof product.name !== 'string') {
    throw new TypeError('Invalid product adapter result');
  }
  return { id: product.id, name: product.name };
}

export function publicFailure(error) {
  if (error instanceof ProductNotFoundError) {
    return { code: 'PRODUCT_NOT_FOUND', message: 'Product not found' };
  }
  return { code: 'UNEXPECTED_FAILURE', message: 'Request could not be completed' };
}

const original = new Error('fixture-private-diagnostic');
for (const findById of [
  async () => null,
  async () => { throw original; }
]) {
  try {
    await lookupProduct('p1', findById);
  } catch (error) {
    console.log(error.name, error.code, error.cause === original);
    console.log(JSON.stringify(publicFailure(error)));
  }
}
```

**Short exam answer**

Create a custom error when callers need a meaningful application category beyond a generic built-in exception. Extend Error, set an explicit name and stable code, and retain an earlier failure with `cause` when adding context. Keep internal diagnostic information separate from a deliberately projected public response. A code or custom class describes a failure; it does not automatically make it recoverable, retryable or safe to expose.

**Example answer**

The first operation throws **ProductNotFoundError**, code **APP_PRODUCT_NOT_FOUND**, with a false cause comparison. The second throws **ProductLookupError**, code **APP_PRODUCT_LOOKUP_FAILED**, and the cause comparison is true. Its safe public projection uses **UNEXPECTED_FAILURE**, not the original diagnostic text.

A repository returning `null` has completed a lookup and found no product. A repository rejecting has not established absence. Returning 404 or an empty result for both would conceal an outage or implementation failure.

**Designing a useful custom error**

Keep the class close to the application contract it represents. `ProductNotFoundError` expresses a meaningful result for the use case; it does not contain an Express response or database-driver type. Later, an HTTP adapter can map it to an intentional status/body, while a job consumer can apply a different reporting policy.

The helper validates its own arguments before calling the dependency. It also rejects an invalid adapter result rather than treating `undefined` or an object with the wrong identity as a missing product. These are explicit contracts, not proof that an arbitrary external service is trustworthy.

The catch around `findById()` adds operation context and preserves **the exact original value** as cause. A library can reject with a non-Error value; retaining that value does not require inventing its message or assuming it has a stack. A cause can itself refer to other objects or failures, so serializers need bounds, cycle handling and redaction.

**Wrapping is not recovery.** The dependency failure might be a network interruption, permissions problem or a bug. This wrapper supplies a product-operation category but deliberately does not label all failures transient or retry them. Classification and safe retry policy belong at a boundary with enough knowledge of the operation and its effects.

**Class identity and stable codes**

Within this process/module instance, `instanceof` recognizes the application-owned class. Serialized JSON or another copy of the class does not automatically share that identity. At an IPC/HTTP boundary, validate a defined error-envelope schema rather than accepting any object with a matching code as authoritative.

Codes should be scoped and documented. Renaming an internal class may be possible while preserving a public code, but changing a code consumers depend on is a contract change. Avoid one enormous “AppError” with an arbitrary client-selected status and message.

**Safe output is an explicit projection**

`publicFailure()` returns only fixed fields approved for this teaching boundary. It ignores unknown `.code`, `.message`, stack and cause values. The example does not log the raw original error. A real service can record reviewed, bounded internal evidence and a correlation ID under its logging policy; public details require a separate decision.

Extending Error alone does not sanitize anything. Standard fields may be non-enumerable, but custom enumerable properties, logger serializers and nested objects can still reveal sensitive values. Never rely on `JSON.stringify(error)` as the security boundary.

**Common mistakes**

- Catching every dependency failure and reclassifying it as “not found.”
- Wrapping without `cause`, losing the useful earlier failure.
- Wrapping at every layer without adding information, creating a noisy cause chain.
- Exposing an internal message because the error has a familiar code.
- Assuming a custom error proves it is safe to retry the operation.

**Examiner follow-ups**

1. **Must cause always be an Error?** No. Preserve and narrow it as an unknown value. `null`, strings or structured data are possible.
2. **Does setting `name` recreate the original stack?** No. The wrapper has its own diagnostic context; cause retains the earlier value. Stack display and formatting remain runtime-dependent.
3. **Why not put HTTP status directly in every service error?** The use case can be called from HTTP, jobs or other adapters. Keep transport translation at the transport boundary unless the error is specifically an HTTP-layer concern.

::: tip Key takeaway
Custom errors define application meaning; cause preserves diagnostic history; a separate projection controls what clients receive.
:::

**Practice — learner work still required**

Inject a valid product, `null`, a rejected Error, a rejected `null`, and an invalid product result. Add a private sentinel to the nested failure. **Acceptance:** success returns the intended fields; absence remains distinct from lookup failure; original cause identity is retained; no projected response contains the sentinel, stack or raw dependency message. Explain why retry behavior is still undecided.

**Official references, checked 2026-11-04:** [Node 24 Error and cause](https://nodejs.org/download/release/v24.18.0/docs/api/errors.html#class-error), [cause accepts arbitrary values](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause), [Error subclasses](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#custom_error_types).

### Who owns a failure from a promise, callback or event, and why can try/catch miss it? {#t10-q03}

*Study depth: Intermediate*

**Example — predict which boundary catches each failure**

Save as **`async-error-ownership.mjs`**. The callback producer below deliberately runs later. Does the promise constructor catch the JSON parser's exception automatically, or does the callback need its own conversion boundary?

```js
import { EventEmitter, once } from 'node:events';

export function parseFromCallback(start) {
  return new Promise((resolve, reject) => {
    start((error, text) => {
      if (error !== null && error !== undefined) {
        reject(error);
        return;
      }
      try {
        resolve(JSON.parse(text));
      } catch (parseError) {
        reject(parseError);
      }
    });
  });
}

const original = new Error('fixture failure');
for (const [label, run] of [
  ['sync', () => JSON.parse('{')],
  ['promise', async () => { throw original; }],
  ['callback', () => parseFromCallback(done => {
    queueMicrotask(() => done(null, '{'));
  })]
]) {
  try {
    await run();
  } catch (error) {
    console.log(label, error === original ? 'same reason' : error.name);
  }
}

const emitter = new EventEmitter();
const waiting = once(emitter, 'ready');
queueMicrotask(() => emitter.emit('error', original));
try {
  await waiting;
} catch (error) {
  console.log('event', error === original);
}
console.log('listeners', emitter.listenerCount('ready'), emitter.listenerCount('error'));
```

**Short exam answer**

A synchronous throw is caught while the relevant call stack is executing. A rejected promise is handled by its returned/awaited chain. A later callback must report through its callback contract or explicitly convert its own failures into a rejection. An EventEmitter has its own error delivery contract. Register the appropriate observer before starting work and keep an owner for the operation's whole lifetime.

**Example answer**

The output is **`sync SyntaxError`**, **`promise same reason`**, **`callback SyntaxError`**, **`event true`**, then **`listeners 0 0`**.

The local `try` observes the synchronous failure from `run()` and the rejected promise through `await`. The callback adapter catches `JSON.parse()` inside the later callback and rejects the promise. Without that inner catch, the parser would throw in the microtask's execution rather than reject the already-returned adapter promise.

`events.once(emitter, 'ready')` temporarily observes the special `error` event while waiting for `ready`. The error rejects that wait with the original reason and removes its temporary listeners. This fixture emits exactly that one terminal event; the wait does not supervise an emitter forever afterward.

**Match the failure channel to the operation**

| Channel | Owner | Frequent mistake |
|---|---|---|
| Synchronous throw | Caller on the current stack | Expecting a catch around registration to catch a future callback |
| Promise rejection | Caller awaiting/returning the chain, or an explicit task supervisor | Starting a promise without observing its result |
| Error-first callback | Callback checks failure before using its result | Throwing from a later callback instead of completing the declared failure path |
| EventEmitter `error` | Registered error listener or a suitable event/stream owner | Assuming a surrounding async function automatically owns emitted errors |

The adapter is a **small JSON conversion example**, not a general cancellation wrapper. It assumes a producer with one completion callback and no separately owned socket/timer to clean up. A producer that never calls back leaves its promise pending; a deadline, cancellation and cleanup contract must be added when that can happen. A Promise's single settlement does not stop an underlying producer or dispose its resources.

For a standard Node callback API, prefer its built-in promise variant or an appropriate `promisify()` adapter when available. Neither automatically covers a producer's unrelated events or work you start inside the callback. Reuse the [callback and promise foundations](./05-asynchronous-programming.md#t05-q01) instead of introducing several competing adapters.

**Returning a promise and catching it locally are different decisions**

Save this separate prediction as **`return-versus-await.mjs`**:

```js
const original = new Error('fixture failure');

async function forward() {
  try {
    return Promise.reject(original);
  } catch {
    return 'locally recovered';
  }
}

async function recoverLocally() {
  try {
    return await Promise.reject(original);
  } catch {
    return 'locally recovered';
  }
}

try {
  await forward();
} catch (error) {
  console.log('caller', error === original);
}
console.log(await recoverLocally());
```

The output is **`caller true`**, then **`locally recovered`**. Returning a promise transfers its eventual outcome to the caller; it does not throw that promise's later rejection through the local catch. `return await` makes that outcome pass through the local try/catch. It also matters when a local `finally` must run after the asynchronous operation finishes, as covered in the [cleanup explanation](./05-asynchronous-programming.md#t05-q03).

**Events do not automatically await async listeners**

Ordinary EventEmitter listeners are invoked synchronously by `emit()`, but a returned promise is not automatically awaited. An `async` listener can therefore reject after `emit()` has returned. `try { await emitter.emit(...) }` awaits the boolean return value, not all listener work.

Either use a promise-based operation whose completion you can await, explicitly supervise listener work, or deliberately configure the emitter's supported rejection-capture policy. `captureRejections` routes rejected listener promises into the documented error path; it does not supply task joining, cancellation or backpressure. Keep its error handler synchronous to avoid another rejection cycle. See the [event ownership examples](./06-events-and-event-loop.md#t06-q01).

An `error` listener also does not catch an arbitrary exception thrown by a different listener. If a normal listener throws synchronously during `emit()`, it follows the active call stack. Different APIs such as EventTarget have different rules; do not generalize EventEmitter behavior to every event interface.

**An intentionally failing counterexample**

Run this only as a separate disposable process, **`unowned-callback.mjs`**. It is expected to exit unsuccessfully:

```js
try {
  setImmediate(() => {
    throw new Error('FIXTURE_CALLBACK_FAILURE');
  });
} catch {
  console.log('OUTER_CATCH_RAN');
}
```

The registration call returns normally. Its catch is no longer active when the callback runs; `OUTER_CATCH_RAN` is not printed. The later exception has no owner in this process.

Likewise, `void someAsyncOperation()` does not handle rejection. If background work is intentional, give it an explicit supervisor that observes failures, bounds active work and participates in shutdown. A reporting handler can itself fail, so ownership must extend to the reporting path too. A process-level unhandled-rejection or uncaught-exception hook is a last-resort lifecycle boundary, not request recovery.

**Common mistakes**

- Using `new Promise(async (...) => ...)`, creating an executor promise whose rejection the outer Promise constructor does not automatically adopt.
- Forgetting to return a promise from a chain handler, losing the connection to its outcome.
- Starting work first and attaching an error/event observer afterward.
- Turning a rejected operation into a fulfilled promise by logging in `.catch()` without rethrowing or returning an intentional recovery value.
- Assuming `Promise.all()` cancels sibling work after its first rejection. Observe/drain active work under the explicit cancellation policy.

**Examiner follow-ups**

1. **Can the Promise executor catch a synchronous throw from `start()`?** Yes. The constructor converts a throw while executing that executor into rejection. It cannot automatically intercept arbitrary future callback throws.
2. **Does an emitted error always terminate the process?** Not necessarily. An error listener or event wait may handle it; emitting an Error without such a listener throws, and an uncaught throw terminates under the normal process policy. A directly enclosing synchronous catch can intercept that throw.
3. **Is logging and continuing always a valid handler?** No. The caller still needs the promised outcome, owned resources need cleanup, and broken process state may require termination under the application's policy.

::: tip Key takeaway
Follow the actual failure channel. Every asynchronous operation needs an owner for completion, rejection and cleanup—not just a try/catch near where it starts.
:::

**Practice — learner work still required**

Inject callback success, callback failure, invalid JSON and a synchronous registration throw. Test the event wait with success, an error and explicit abort. **Acceptance:** preserve original failure identity where applicable; remove temporary event/abort listeners after settlement; show the return-versus-await difference; run the failing callback only in an isolated, time-bounded child and assert its nonzero exit and absent outer-catch message. Keep a producer that never completes out of an unbounded test.

**Official references, checked 2026-11-04:** [Node error delivery](https://nodejs.org/download/release/v24.18.0/docs/api/errors.html#error-propagation-and-interception), [events.once and cancellation](https://nodejs.org/download/release/v24.18.0/docs/api/events.html#eventsonceemitter-name-options), [EventEmitter rejection capture](https://nodejs.org/download/release/v24.18.0/docs/api/events.html#capture-rejections-of-promises), [unhandled-rejection modes](https://nodejs.org/download/release/v24.18.0/docs/api/cli.html#--unhandled-rejectionsmode).

### How do you diagnose a runtime failure without guessing or leaking sensitive data? {#t10-q04}

*Study depth: Intermediate*

**Example — locate the failing phase before changing code**

Save as **`diagnose-settings.mjs`**. All files belong to a disposable local fixture. Each failure has the same broad symptom—settings could not load—but a different cause. Predict which file fails during reading, parsing or validation.

```js
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const codes = Object.freeze({
  read: 'SETTINGS_READ_FAILED',
  parse: 'SETTINGS_PARSE_FAILED',
  validate: 'SETTINGS_SCHEMA_INVALID'
});

export class SettingsError extends Error {
  constructor(phase, cause) {
    if (!Object.hasOwn(codes, phase)) throw new TypeError('Unknown settings phase');
    super('Settings could not be loaded', { cause });
    this.name = 'SettingsError';
    this.phase = phase;
    this.code = codes[phase];
  }
}

export async function loadSettings(file, readText = readFile) {
  let text;
  try {
    text = await readText(file, 'utf8');
  } catch (cause) {
    throw new SettingsError('read', cause);
  }
  let value;
  try {
    value = JSON.parse(text);
  } catch (cause) {
    throw new SettingsError('parse', cause);
  }
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      !Number.isSafeInteger(value.limit) || value.limit < 1 || value.limit > 100 ||
      Object.keys(value).some(key => key !== 'limit')) {
    throw new SettingsError('validate', new TypeError('Invalid settings shape'));
  }
  return Object.freeze({ limit: value.limit });
}

const directory = await mkdtemp(join(tmpdir(), 'settings-diagnosis-'));
try {
  const cases = [
    ['missing.json', undefined],
    ['malformed.json', '{'],
    ['invalid.json', '{"limit":"3"}'],
    ['valid.json', '{"limit":3}']
  ];
  for (const [name, text] of cases) {
    const file = join(directory, name);
    if (text !== undefined) await writeFile(file, text, { flag: 'wx' });
    try {
      const settings = await loadSettings(file);
      console.log(name, 'loaded', settings.limit);
    } catch (error) {
      if (!(error instanceof SettingsError)) throw error;
      console.log(name, error.code);
    }
  }
} finally {
  await rm(directory, { recursive: true, force: true });
}
```

**Short exam answer**

Capture the failure's operation, phase, reproducible conditions and reviewed diagnostic fields. Read the stack and cause in the matching build, distinguish the observed symptom from the underlying failure, and test one hypothesis at a time. Reduce the problem to an owned example, make the smallest justified correction, then add a regression check that fails before the correction and passes afterward.

**Example answer**

The output is:

```text
missing.json SETTINGS_READ_FAILED
malformed.json SETTINGS_PARSE_FAILED
invalid.json SETTINGS_SCHEMA_INVALID
valid.json loaded 3
```

For the first case, `error.cause.code` is `ENOENT`: no file was available at this fixture path. The next retains a `SyntaxError` from the parser. The third parsed successfully but failed this application's schema. Its cause is the application-created `TypeError`, not a filesystem failure.

This distinction changes the next action. Restoring a required file does not repair malformed JSON; changing permissions does not turn a string into a valid numeric limit. The fixed codes identify the **phase**, while retained causes provide deeper evidence. None of these codes by itself declares that retrying is appropriate.

**A diagnosis workflow you can repeat**

1. **Define expected versus actual behavior.** Record the operation and its contract, such as “load a required file containing one integer limit.” Distinguish a failed startup from one failed request.
2. **Capture the environment that matters.** Runtime version, installed lockfile/build revision, launch command, module mode, relevant validated configuration and working directory can change behavior. Record secret names/presence, not secret values.
3. **Read the original failure and context.** Locate the first relevant application frame, identify the failing operation and inspect its cause. A wrapper's top frame may show where context was added, not where the underlying operation failed.
4. **Form a falsifiable hypothesis.** “The relative path resolves from a different working directory” predicts a read failure before JSON parsing. Check that prediction before editing the schema or retry policy.
5. **Reduce and reproduce.** Use a tiny non-sensitive fixture and the same runtime/module settings. Remove unrelated components while retaining the failure. Synthetic injected errors isolate a boundary but do not prove the real adapter fails the same way.
6. **Correct one cause and verify the boundary.** Keep a test for the original failure, its fixed behavior and a nearby invalid case. Confirm that the fix preserves errors rather than hiding them with a default result.

**Read stacks and causes as evidence**

An Error's stack describes where that Error was created; wrapping produces new context while `cause` retains the earlier value. Stack text is runtime-dependent and does not establish every native or asynchronous step. A frame in a dependency may be where a bad argument was detected, not where your application created it.

For generated JavaScript, match the stack to the **actual deployed artifact**. Node's `--enable-source-maps` can map positions when usable source maps are available. It cannot reconstruct absent or mismatched maps. Check build identity and map availability before assuming a line in your editor is the line that ran.

A small local debugger session can help when observation is insufficient. Run `node --inspect-brk=127.0.0.1:9229 diagnose-settings.mjs`, attach a supported debugger, and enable **pause on caught exceptions**: this example catches its expected failures, so pausing only on uncaught exceptions can miss them. Inspect `phase`, the known fixture path and the retained cause before continuing. Stop the debugging process when finished, and keep the inspector on loopback.

This is a debugging exercise to perform yourself; runnable fixture checks are not evidence that you have used the debugger. More extensive inspector, remote and memory-leak workflows remain in the Debugging topic.

**A common path-related hypothesis**

A relative filesystem path such as `./settings.json` resolves from the process's working directory. Moving the launch command can therefore change its target without any change to the JavaScript module. If the contract means a file shipped beside a module, an ES-module-relative URL such as `new URL('./settings.json', import.meta.url)` expresses that intent. If it means an operator-selected configuration file, validate an explicit configured location instead.

Choose the correction from the ownership contract. Silently searching several directories or creating an empty settings file can conceal a deployment mistake. Path normalization alone does not establish permission to read arbitrary files.

**Keep diagnostic evidence separate from public output**

The example prints only fixed fixture names and application-owned codes; the original errors remain available in memory for controlled diagnosis. Do not dump the whole environment, request body, error cause chain or stack into a public response. Filesystem errors can contain paths, parser messages may include input fragments, and logger serializers can traverse nested causes.

Useful operational records can include an application-owned operation/phase, build version, reviewed error category and correlation identifier. Bound their size and retention, and treat client-supplied identifiers as untrusted. Full diagnostic access requires an explicit internal logging/debugging policy; a generic serializer is not supplied by this lesson.

The fixture reads **tiny files it created itself**. `readFile()` is not a general memory-bound configuration loader for arbitrary untrusted files. Cleanup failure would fail this fixture rather than count as a successful run; real multi-resource owners must also define how cleanup and primary failures are preserved.

**Common mistakes**

- Applying random code changes before finding the failing phase.
- Reporting the wrapper's message as the complete root cause.
- Testing with a different build or working directory and concluding the failure is irreproducible.
- Catching a missing required file and supplying empty defaults that let startup appear healthy.
- Adding repeated logging that exposes the data which triggered the failure.
- Calling an injected `EACCES` object a real filesystem-permission integration test.

**Examiner follow-ups**

1. **Does `ENOENT` prove a bad working directory?** No. It supports “a path component was unavailable” in that operation. Wrong configuration, missing deployment artifacts and races are other hypotheses; inspect the intended target.
2. **Does preserving cause mean it is safe to print?** No. Cause preserves diagnostic evidence, including potentially sensitive values. Project reviewed fields and control access to deeper evidence.
3. **What makes a regression test useful?** It reproduces the contract violation before the fix and verifies the corrected behavior afterward, with an adjacent failure case so silent suppression does not pass.

::: tip Key takeaway
Diagnose the phase, preserve the evidence, test a specific hypothesis and verify the correction against the original failure.
:::

**Practice — learner work still required**

Run the fixture, then reproduce a required-file failure by launching a relative-path loader from two different working directories. State the intended file ownership before choosing an explicit configured path or module-relative URL. **Acceptance:** show the failing reproduction, one justified correction, a regression check, and a still-rejected malformed/invalid file. In a local debugger, pause on a caught SettingsError and inspect its cause without publishing raw paths or input. Keep permission simulations labeled as simulations.

**Official references, checked 2026-11-04:** [Node Error stacks, codes and causes](https://nodejs.org/download/release/v24.18.0/docs/api/errors.html), [Node debugging and inspector access](https://nodejs.org/en/learn/getting-started/debugging), [source-map support](https://nodejs.org/download/release/v24.18.0/docs/api/cli.html#--enable-source-maps), [filesystem path resolution](https://nodejs.org/download/release/v24.18.0/docs/api/fs.html#file-paths).

### How do you decide whether to recover, retry, escalate or stop the process? {#t10-q05}

*Study depth: Intermediate*

**Decision exercise — attempt first**

Classify these failures before reading the policy: an invalid quantity, an unavailable optional recommendations service, a failed required database read, a payment timeout after submission, and a broken invariant that makes shared process state unsafe. Should all five be retried? Should all five restart the service?

**Short exam answer**

An error criticality matrix is an **application-specific recovery policy**, not a Node API or universal grading system. Consider the failure's scope, user impact, state safety, dependency role, repeatability and remaining budget. Separate the response to one operation from service health and human escalation. Retry only when the operation is safe to replay, the failure is classified as transient, and bounded attempt/time budgets permit it.

**A practical starting matrix**

| Situation | Immediate action | Retry or fallback | Operational follow-up |
|---|---|---|---|
| Invalid request data | Reject that request with a stable client-facing explanation | Do not retry the unchanged input | Count/rate-limit where appropriate; investigate unusual patterns |
| Optional dependency unavailable | Use a documented fallback if it preserves the feature contract | Bound fallback cost and allowed staleness | Track degradation; escalate sustained user impact |
| Required dependency read fails | Fail that operation if recovery cannot fit its budget | A transient, replay-safe read may have a bounded retry | Evaluate dependency health and readiness from observed impact |
| Side-effecting request has an unknown outcome | Preserve an explicit uncertain/pending outcome | Reconcile by operation ID; do not blindly repeat | Track unresolved outcomes and repair them under an owner |
| Request-local implementation bug | Return a safe failure; keep diagnostic evidence | Do not automatically retry the same faulty path | Investigate; aggregate and escalate according to impact |
| Required startup configuration invalid | Fail startup before admitting traffic | Do not retry unchanged bad configuration indefinitely | Correct configuration/build; avoid a silent healthy fallback |
| Process integrity is known to be unsafe | Stop new work and terminate under the fatal policy | Replace the process; preserve durable work externally | Incident investigation and supervisor-controlled replacement |

A failure can move between rows as evidence changes. One failed database read does not automatically mean every endpoint is unhealthy. Conversely, repeated failures of a required dependency can make a ready-looking instance unable to serve its promised traffic.

**Worked policy — predict each returned action**

Save as **`failure-policy.mjs`**. This is a pure decision function over **trusted, application-classified facts**. It does not inspect a raw client-supplied error, run retries, send responses or terminate a process.

```js
const kinds = new Set([
  'invalid-input', 'optional-dependency', 'required-dependency',
  'unknown-outcome', 'request-bug', 'startup-config', 'process-unsafe'
]);

export function decideFailure({
  kind, fallbackAllowed = false, replaySafe = false, transient = false,
  attemptsLeft = 0, remainingMs = 0, nextAttemptBudgetMs = 0
}) {
  if (!kinds.has(kind) ||
      [fallbackAllowed, replaySafe, transient].some(value => typeof value !== 'boolean') ||
      !Number.isInteger(attemptsLeft) || attemptsLeft < 0 || attemptsLeft > 3 ||
      !Number.isInteger(remainingMs) || remainingMs < 0 || remainingMs > 60_000 ||
      !Number.isInteger(nextAttemptBudgetMs) || nextAttemptBudgetMs < 0 ||
      nextAttemptBudgetMs > 60_000) {
    throw new TypeError('Invalid classified failure context');
  }
  if (kind === 'process-unsafe') return { action: 'terminate', retry: false };
  if (kind === 'startup-config') return { action: 'fail-startup', retry: false };
  if (kind === 'invalid-input') return { action: 'reject-request', retry: false };
  if (kind === 'unknown-outcome') return { action: 'reconcile', retry: false };
  if (kind === 'optional-dependency' && fallbackAllowed) {
    return { action: 'approved-fallback', retry: false };
  }
  if (kind === 'required-dependency' && replaySafe && transient &&
      attemptsLeft > 0 && nextAttemptBudgetMs > 0 &&
      nextAttemptBudgetMs <= remainingMs) {
    return { action: 'bounded-retry', retry: true };
  }
  return { action: 'fail-request', retry: false };
}

for (const context of [
  { kind: 'invalid-input' },
  { kind: 'optional-dependency', fallbackAllowed: true },
  { kind: 'required-dependency', replaySafe: true, transient: true,
    attemptsLeft: 1, remainingMs: 500, nextAttemptBudgetMs: 200 },
  { kind: 'unknown-outcome', replaySafe: true, transient: true,
    attemptsLeft: 1, remainingMs: 500, nextAttemptBudgetMs: 200 },
  { kind: 'process-unsafe' }
]) {
  console.log(decideFailure(context).action);
}
```

**Example answer**

The actions are **reject-request**, **approved-fallback**, **bounded-retry**, **reconcile** and **terminate**. The unknown-outcome branch is evaluated before retry conditions: setting a generic replay flag does not erase uncertainty about a submitted side effect.

The upper bounds of three remaining attempts and 60 seconds are this **teaching policy's limits**, not recommended defaults for every service. `nextAttemptBudgetMs` must reserve the delay plus the bounded attempt's cost. Equality is allowed by this pure arithmetic example; a real owner needs scheduling/cleanup margin and a deadline check again before dispatch.

The caller must decrement the remaining attempts, update time from a monotonic deadline, propagate cancellation and supervise active work. Returning `bounded-retry` repeatedly with an unchanged context would not enforce a budget. This lesson deliberately does not create another generic retry loop; database-specific retry implementation follows in the database-errors question.

**Recovery must preserve the contract**

“Approved fallback” can mean omitting optional recommendations or serving a cache entry within a declared freshness window. It cannot mean skipping authentication, ignoring tenant boundaries, silently inventing a payment success or returning an empty inventory as if it were authoritative.

Consider the fallback's own capacity. If every failed cache lookup sends a new database query, the fallback can overload the dependency that is already struggling. Bound active work, shed optional work and define when to reject instead. A circuit breaker can reduce attempts against a failing dependency but does not make replay safe or restore lost data; its state and recovery probes need an owner.

**Retry safety and retry usefulness are separate**

A read can be safe to repeat but unlikely to succeed if credentials are invalid. A transient timeout can be likely to disappear but unsafe to replay after a payment may have committed. Require both a replay-safe operation and a classified recoverable failure, then apply finite budgets, backoff and jitter where appropriate.

Choose one retry owner for a call path. Three layers each making three total attempts can amplify one operation into as many as 27 downstream attempts. Count the initial attempt consistently and avoid stacking framework, client and application retries without a shared policy. Client cancellation and an exhausted operation deadline should stop optional further attempts.

**Request failure, health and alert severity are different decisions**

A rejected input does not normally make the instance unready. A failed optional feature can produce a degraded response while the core service remains usable. A required dependency outage may justify readiness changes, but repeatedly restarting healthy application processes will not repair that dependency.

An application-owned **log level** describes an event record. An **incident severity** describes impact and urgency. A **page** asks a human to act now. These do not need a one-to-one mapping: one safely contained 500 need not page someone, while a sustained correctness issue with few exceptions may be critical. Define thresholds from user impact, error rates, saturation and an actionable response. Keep correlation fields bounded and avoid raw payloads in alerts.

**When termination is appropriate**

A known unsafe process state or an uncaught exception requires a fatal lifecycle policy, not a catch-and-continue response. Node explicitly warns against resuming normal operation after an uncaught exception. A last-resort handler may perform minimal synchronous reporting/cleanup before termination; an external supervisor replaces the process.

For a controlled shutdown while the process can still run safely, stop admission, drain within a deadline and close owned resources. Do not assume asynchronous cleanup will finish inside an uncaught-exception handler. The pure function's `terminate` result does none of this; integrating it with the actual lifecycle owner is separate work. Never install process-wide fatal handlers inside an imported utility just to demonstrate this matrix.

**Common mistakes**

- Deciding “fatal” from an Error constructor name alone.
- Retrying invalid credentials, malformed input or an ambiguous payment write automatically.
- Calling fallback successful without checking authorization, freshness or correctness.
- Treating every log entry as an immediate human page.
- Restarting instances for every remote outage, creating a reconnect storm.
- Treating a decision table as proof that cleanup, deadlines or recovery actually run.

**Examiner follow-ups**

1. **Can an operational failure be high severity?** Yes. A recoverable dependency failure can affect all customers; severity depends on impact and duration, not whether the exception was expected.
2. **Must every programmer error terminate the process?** No. A contained request failure and an unsafe shared-state failure require different lifecycle decisions. An uncaught exception is a separate fatal boundary; do not generalize a safe local catch into permission to resume after it.
3. **What if an optional dependency becomes business-critical?** Revisit the feature contract and policy. “Optional” is an application decision that must match the current product behavior, not a permanent property of a package.

::: tip Key takeaway
Choose recovery from scope, safety, impact and budget. Keep operation handling, process lifecycle and human escalation explicit.
:::

**Practice — learner work still required**

Create a matrix for a Products API with inventory, recommendations and payment dependencies. Test every policy branch, exhausted attempt/time budgets and an unknown payment outcome. **Acceptance:** justify optional versus required behavior; show that unsafe replay never selects retry; identify the real owner for decrementing budgets, cancellation and shutdown; define one actionable alert and one non-paging metric. Demonstrate a fallback's correctness constraints before labeling it safe.

**Official references, checked 2026-11-04:** [Node uncaught-exception guidance](https://nodejs.org/download/release/v24.18.0/docs/api/process.html#event-uncaughtexception), [SRE overload and graceful degradation](https://sre.google/sre-book/handling-overload/), [SRE monitoring and alerting](https://sre.google/sre-book/monitoring-distributed-systems/). The matrix and code above are this guide's teaching policy, not an official Node or exam rubric.

### How should Express translate failures into safe HTTP responses? {#t10-q06}

*Study depth: Intermediate*

**Example — predict the response before running**

Use **Express 5.2.1 on Node.js 24.18.0** in a separate lab with `npm install --save-exact express@5.2.1`. Copy the earlier `product-errors.mjs` example into that directory; its exported lookup function and error class are reused below. Its prediction loop may print during import but opens no listener.

Save this as **`error-app.mjs`**. Predict the difference between a missing product, a failed product lookup, malformed JSON, an unknown route and a failure after response headers have been sent.

```js
import express from 'express';
import { lookupProduct, ProductNotFoundError } from './product-errors.mjs';

const parserFailures = Object.freeze({
  'entity.parse.failed': [400, 'MALFORMED_JSON', 'Malformed JSON'],
  'entity.too.large': [413, 'BODY_TOO_LARGE', 'Request body too large'],
  'charset.unsupported': [415, 'UNSUPPORTED_CHARSET', 'Unsupported charset'],
  'encoding.unsupported': [415, 'UNSUPPORTED_ENCODING', 'Unsupported encoding']
});

export function errorBoundary(error, _req, res, next) {
  if (res.headersSent) {
    next(error);
    return;
  }
  let response = [500, 'INTERNAL_ERROR', 'Request could not be completed'];
  if (error instanceof ProductNotFoundError) {
    response = [404, 'PRODUCT_NOT_FOUND', 'Product not found'];
  } else if (error && typeof error.type === 'string' &&
      Object.hasOwn(parserFailures, error.type) &&
      error.status === parserFailures[error.type][0]) {
    response = parserFailures[error.type];
  }
  const [status, code, message] = response;
  res.status(status).json({ error: { code, message } });
}

export function createErrorApp(findById = async id =>
  id === 'p1' ? { id, name: 'Book' } : null) {
  const app = express();
  app.set('env', 'production');
  app.disable('x-powered-by');
  app.use(express.json({ limit: '1kb', inflate: false }));
  app.get('/products/:id', async (req, res) => {
    if (!/^[a-z0-9-]{1,32}$/.test(req.params.id)) {
      res.status(400).json({ error: { code: 'INVALID_ID', message: 'Invalid product ID' } });
      return;
    }
    const product = await lookupProduct(req.params.id, findById);
    res.json(product);
  });
  app.post('/echo', (req, res) => {
    if (!req.is('application/json')) {
      res.status(415).json({ error: { code: 'JSON_REQUIRED', message: 'JSON required' } });
      return;
    }
    if (!req.body || typeof req.body.message !== 'string' ||
        req.body.message.length > 100 ||
        Object.keys(req.body).some(key => key !== 'message')) {
      res.status(400).json({ error: { code: 'INVALID_BODY', message: 'Invalid message' } });
      return;
    }
    res.json({ message: req.body.message });
  });
  // Deliberately broken fixture endpoint; not an application feature.
  app.get('/partial', async (_req, res) => {
    res.type('text/plain').write('started\n');
    throw new Error('Fixture partial response failure');
  });
  app.use((_req, res) => {
    res.status(404).json({ error: { code: 'ROUTE_NOT_FOUND', message: 'Route not found' } });
  });
  app.use(errorBoundary);
  return app;
}
```

This file **exports an application**, not a listening server. Use the owned HTTP server/startup/shutdown pattern from [framework foundations](./16-frameworks.md#t16-q03), importing `createErrorApp()` instead of `createApp()`. Bind the lab to loopback. The intentionally failing `/partial` endpoint belongs only in the disposable fixture.

**Short exam answer**

Register a four-argument error middleware **after** parsers, routes and the terminal not-found handler. Translate known application/parser failures into deliberate status codes and fixed public fields. Return a generic 500 for unknown failures. In Express 5, a route's returned/rejected promise enters the error pipeline automatically. When headers are already sent, delegate with `next(error)` instead of attempting another JSON response.

**Example answer**

- `GET /products/p1` returns **200** and projected product data.
- `GET /products/missing` returns **404 PRODUCT_NOT_FOUND**; the lookup completed with no product.
- An injected rejected lookup returns **500 INTERNAL_ERROR**. The earlier wrapper does not prove the dependency failure is temporary, so it is not automatically mapped to a retryable 503.
- Invalid JSON with the JSON media type returns **400 MALFORMED_JSON**. A body above the parser limit returns **413**.
- A non-JSON echo request returns **415**. A parsed body that violates the endpoint contract returns **400 INVALID_BODY**.
- An unmatched path returns **404 ROUTE_NOT_FOUND** through ordinary middleware.
- `/partial` cannot become a new JSON 500: the response has already started. The delegated failure reaches the downstream/default error owner, which closes the connection; the client must not treat the partial content as a complete successful result.

**The ordering is part of the contract**

The parser must run before handlers that inspect `req.body`. A parser can fail before a route starts, so its errors still need the final error boundary. A nonmatching media type can cause the parser to skip the body; it does not guarantee a parser exception. The endpoint therefore checks its required media type separately.

The terminal 404 handler runs when no earlier handler produced a response. A missing route is not an exception automatically delivered to error middleware. The error middleware has four declared arguments even when it does not need the request object; changing it to a three-argument function changes how Express recognizes it.

**Unknown errors remain server failures**

The parser mapping checks a known `type` and matching status from the trusted parser boundary. It does not treat every `SyntaxError` as malformed client input or accept an arbitrary `error.status` as authority. Errors thrown by application code may be bugs even when their names resemble parser failures.

Return only fields chosen for the public contract. Never spread the original error into JSON: body-parser failures can carry the original request body, and database errors can carry SQL details. Add reviewed internal diagnostics/correlation under a separate logging policy. This small lab deliberately omits an operational logger.

The Express default error handler may also log errors, including late-response failures. A production reporting policy must account for that downstream owner; setting production mode does not establish that all internal log output is sanitized. The HTTP response projection alone is what this example controls.

**Promise ownership still matters**

Express 5 observes a handler's returned promise. It does not adopt unrelated detached promises or arbitrary later callback throws. Return/await the actual work, or forward callback failures with `next(error)`. Do not both call `next(error)` and reject the same returned promise, delivering one failure twice.

Express 4 needs explicit promise rejection forwarding, such as a reviewed async wrapper or try/catch with `next(error)`. Check the installed major version rather than assuming a copied pattern has the same behavior. Keep all four error-handler parameters and avoid sending a response followed by `next()`.

**Common mistakes**

- Registering error middleware before the route that fails.
- Treating an unmatched route as an automatic exception.
- Sending a second response after `headersSent` becomes true.
- Mapping every dependency exception to a client error or a retryable status.
- Exposing parser bodies, stack traces or nested causes in the response.
- Forgetting that a started 200 response can still be truncated by a later failure.

**Examiner follow-ups**

1. **Should the handler use the existing `res.statusCode` to classify a failure?** No. It may still be the default 200. Choose the status from the known failure contract before committing headers.
2. **Why delegate after headers are sent?** The status/headers cannot be replaced normally. A downstream error owner must finish or abort the transport correctly; attempting JSON can cause another headers-already-sent error.
3. **Does a generic 500 mean restart the process?** Not by itself. Use the earlier scope/state-safety policy. A contained request rejection differs from an uncaught exception or unsafe shared state.

::: tip Key takeaway
One HTTP boundary translates known failures, hides internals and respects the response lifecycle. It cannot replace ownership of the work that failed.
:::

**Practice — learner work still required**

Exercise all response cases with real loopback HTTP requests. Inject a dependency message containing a private sentinel. **Acceptance:** no public error JSON contains that sentinel, stack or raw cause; malformed/oversized/wrong-media inputs keep their distinct statuses; unknown application SyntaxError remains 500; an unmatched route remains a normal 404. Confirm the partial response is incomplete/aborted and `next` receives the original error when headers are already committed. Close every listener and client.

**Official references, checked 2026-11-04:** [Express error handling](https://expressjs.com/en/guide/error-handling/), [404 behavior](https://expressjs.com/en/starter/faq/#how-do-i-handle-404-responses), [parser errors and limits](https://expressjs.com/en/resources/middleware/body-parser/). Baseline: Express5.2.1; parser dependency versions come from the lab lockfile.

### How do you classify database failures and retry a complete transaction safely? {#t10-q07}

*Study depth: Intermediate*

**Decision exercise — attempt first**

A product write fails with a unique-constraint violation. Another transaction loses a serialization conflict. A connection disappears while COMMIT is in flight. Which operation can be repeated automatically, and what evidence is still missing?

**Short exam answer**

Classify database errors using documented driver/server fields at the persistence boundary. A constraint violation, transaction conflict, cancellation and connection failure have different meanings. For a known retryable transaction abort, roll back, release the client and repeat the **whole business transaction**, including its reads and decisions, under a finite attempt policy. Do not blindly replay a write whose commit outcome is unknown.

**PostgreSQL examples, not universal driver codes**

| Evidence | Likely interpretation | Deliberate action |
|---|---|---|
| `23505` unique violation | A database invariant rejected the write | Map a known constraint to a business conflict; do not retry every unique violation |
| `23503` foreign-key violation | Referenced state is absent or a relationship forbids the change | Translate the known operation's rule; investigate unexpected integrity failures |
| `40001` serialization failure | This transaction could not safely commit under its snapshot | Retry its complete logic when it contains only replay-safe transactional work |
| `40P01` deadlock detected | PostgreSQL chose an aborted participant | Roll back and consider a bounded whole-transaction retry; improve lock ordering |
| `57014` query canceled | Timeout or cancellation stopped a statement | Check its origin and operation budget; do not automatically classify it as retryable |
| Authentication/configuration failure | The connection cannot be used as configured | Correct the configuration; repeated immediate retries do not fix it |
| Connection lost during COMMIT | The application may not know whether the transaction committed | Reconcile durable operation identity/outcome before replay |

A SQLSTATE identifies a server condition. The adapter still needs the table/constraint and operation context to decide whether a public 409, validation response or internal failure is appropriate. A unique violation can sometimes arise from a retryable application allocation race, but that needs an explicit operation-specific policy; it is not this example's default.

**Worked transaction owner**

This example uses **PostgreSQL 16 and node-postgres (`pg`) 8.16.3**. In a separate database lab, install `npm install --save-exact pg@8.16.3`. Save this file as **`transaction-retry.mjs`**. It exports helpers and does not connect during import.

```js
import pg from 'pg';
import { setTimeout as delay } from 'node:timers/promises';
const { DatabaseError } = pg;
const retryableStates = new Set(['40001', '40P01']);

export class RetryableTransactionError extends Error {
  constructor(cause) {
    super('Transaction was aborted and rolled back', { cause });
    this.name = 'RetryableTransactionError';
    this.code = 'APP_TRANSACTION_RETRYABLE';
  }
}

export async function transactionAttempt(pool, work) {
  const client = await pool.connect();
  let began = false;
  let phase = 'begin';
  let discard = false;
  try {
    await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    began = true;
    phase = 'setup';
    await client.query("SET LOCAL statement_timeout = '1000ms'");
    phase = 'work';
    const value = await work(client);
    phase = 'commit';
    await client.query('COMMIT');
    began = false;
    return value;
  } catch (error) {
    const knownAbort = error instanceof DatabaseError &&
      retryableStates.has(error.code) && (phase === 'work' || phase === 'commit');
    // Conservative lab policy: discard for non-server failures or failed BEGIN.
    discard = !(error instanceof DatabaseError) || !began;
    if (began) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        discard = true;
        throw new AggregateError([error, rollbackError], 'Transaction and rollback failed');
      }
    }
    if (knownAbort) throw new RetryableTransactionError(error);
    throw error;
  } finally {
    client.release(discard);
  }
}

export async function withTransactionRetry(pool, work, {
  maxAttempts = 3, signal
} = {}) {
  if (typeof work !== 'function' || !Number.isInteger(maxAttempts) ||
      maxAttempts < 1 || maxAttempts > 3) {
    throw new TypeError('Invalid transaction work or attempt limit');
  }
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    signal?.throwIfAborted();
    try {
      return await transactionAttempt(pool, work);
    } catch (error) {
      if (!(error instanceof RetryableTransactionError) || attempt === maxAttempts) {
        throw error;
      }
      signal?.throwIfAborted();
      const ceilingMs = 20 * 2 ** (attempt - 1);
      await delay(Math.floor(Math.random() * ceilingMs), undefined, { signal });
    }
  }
}
```

**What this implementation owns**

Every attempt acquires **one client** and uses it for BEGIN, all work, COMMIT and any ROLLBACK. Calling `pool.query()` for individual statements inside this transaction could select different sessions and break that ownership. The client is released before the outer retry waits or reacquires a client.

Only a driver-recognized PostgreSQL serialization/deadlock abort, followed by successful rollback, becomes this module's retryable wrapper. A plain object carrying `code: '40001'`, an unrelated application exception, a canceled query, a unique violation or an uncertain connection failure is not enough. The transaction callback is trusted application code: do not accept client-supplied classifications or have it manufacture this wrapper to force retries.

When rollback itself fails, an AggregateError retains both failures and the client is discarded. The retry loop does not treat that aggregate as a confirmed clean abort. `release(true)` removes a client rather than returning a questionable session to the pool. This teaching implementation conservatively discards for other non-server exceptions too; a more selective reuse policy needs its own verified driver/session-state contract.

The attempt limit includes the **initial attempt**, so three means at most three transaction executions. Backoff uses a small randomized delay and no connection is held while waiting. These are lab settings, not service-wide tuning recommendations.

**Use only with a replay-safe callback**

In an owned scratch database, create this table and starting row once:

```sql
CREATE TABLE inventory (
  id integer PRIMARY KEY,
  sku text NOT NULL UNIQUE,
  stock integer NOT NULL CHECK (stock >= 0)
);
INSERT INTO inventory (id, sku, stock) VALUES (1, 'BOOK', 5);
```

With an already configured `pool`, a reservation callback can read and update the same row:

```js
const stock = await withTransactionRetry(pool, async client => {
  const result = await client.query('SELECT stock FROM inventory WHERE id = $1', [1]);
  if (result.rowCount !== 1 || result.rows[0].stock < 1) {
    throw new Error('Inventory cannot satisfy this reservation');
  }
  const nextStock = result.rows[0].stock - 1;
  await client.query('UPDATE inventory SET stock = $1 WHERE id = $2', [nextStock, 1]);
  return nextStock;
});
```

This fragment assumes `withTransactionRetry` is imported and the caller owns the pool. Configure that pool using the lab's deliberately supplied host/user/database settings. Keep connection acquisition and driver waits bounded, for example a reviewed `connectionTimeoutMillis` and `query_timeout`, and handle the pool's idle-client `error` event under the application's reporting policy. Call `pool.end()` when the lab ends.

A retried transaction must **re-read stock and recompute** its update. Reissuing only the last SQL statement can reuse a stale decision. A transaction rollback protects transactional database changes; it does not undo an email, a payment call, a message already published or an ordinary sequence allocation. Use an outbox committed with the business change, plus appropriate consumer/provider idempotency, for external effects.

The example's per-statement server timeout does not bound the whole callback, pool wait, rollback or complete operation. The AbortSignal prevents new attempts and can interrupt backoff; it does **not** cancel an already-running node-postgres query here. A real deadline owner must budget each phase, supervise cancellation and verify the final outcome. Do not use a Promise race as proof the underlying transaction stopped.

**Unknown commit outcomes need reconciliation**

If the server commits and its reply is lost, a client-side failure can coexist with a durable write. A later successful ROLLBACK does not reverse a commit that already happened. This code retries only known server-aborted transactions; generic connection failures propagate without automatic replay.

For side-effecting API operations, store a stable operation key, normalized payload identity and outcome under a database uniqueness/transaction contract. A retry can then look up or safely claim the operation rather than create a second business effect. Retention, key reuse conflicts, concurrent requests and crash recovery must be designed and tested; merely adding a header or UUID does not implement idempotency.

**Translate and log at the right boundary**

The repository can translate a known product-SKU constraint into an application conflict, retaining the driver error as cause. The HTTP boundary then chooses a safe status/code. Do not return the raw SQLSTATE, query text, connection string, constraint details or driver stack automatically. Internal records can include a reviewed operation/category, attempt number and duration under bounded/redacted logging.

A query returning zero rows is different from a rejected query. Never catch every database error and return `null`: that incorrectly turns outages or bugs into a missing-record result. Likewise, returning a released client or a still-pending query lets work escape the transaction owner.

**Common mistakes**

- Retrying all database failures or every SQLSTATE class indiscriminately.
- Repeating only the failed statement instead of the transaction's reads and decisions.
- Using different pooled clients for statements that must be atomic.
- Returning a client with an aborted transaction to the pool without rollback.
- Retrying after a failed rollback or ambiguous COMMIT as though absence of success proves failure.
- Sending an external effect from inside a callback that may run several times.

**Examiner follow-ups**

1. **Why not retry every unique violation?** It may be a persistent business conflict. Only a documented operation-specific race warrants that policy; the default here propagates it once.
2. **Can an exhausted serialization retry still fail?** Yes. A finite policy limits work; it does not promise eventual success. Surface an intentional failure and retain safe internal evidence.
3. **Does releasing a client close the pool?** No. It returns or discards that client; the application owns the pool and must end it at the appropriate lifecycle boundary.

::: tip Key takeaway
Retry a confirmed aborted transaction as a whole, with one client per attempt and explicit cleanup. Reconcile uncertain commits instead of guessing.
:::

**Practice — learner work still required**

In a disposable PostgreSQL database, coordinate two serializable reservations so both initially read the same stock. **Acceptance:** one transaction aborts with 40001, its full callback is retried, both reservations succeed without losing a decrement, and final stock reflects exactly two committed operations. Separately verify a unique violation is not retried and earlier updates roll back. Simulate rollback failure and an uncertain COMMIT at the adapter boundary, checking both causes/discard behavior and absence of automatic replay. Keep simulations labeled; do not interrupt a real database to mimic an outage.

**Official references, checked 2026-11-04:** [PostgreSQL 16 transaction retry semantics](https://www.postgresql.org/docs/16/mvcc-serialization-failure-handling.html), [SQLSTATE codes](https://www.postgresql.org/docs/16/errcodes-appendix.html), [node-postgres transaction/client ownership](https://node-postgres.com/features/transactions), [pool ownership](https://node-postgres.com/features/pooling). The executable database baseline for author checks is PostgreSQL16.13 with pg8.16.3, not a claim about the newest versions.

## Revision

**Keep the contracts separate:** the Error value describes a failure; the asynchronous owner delivers its outcome; the diagnostic workflow finds its cause; the recovery policy chooses an action; HTTP and database adapters translate and supervise their own boundaries.

| Question area | You should be able to explain and demonstrate |
|---|---|
| Error categories | Parsing, type, range and system failures; why context changes their handling |
| Custom errors | Stable application categories, original causes and a separate public projection |
| Async ownership | Which caller, promise chain, callback or event observer owns completion/failure |
| Diagnosis | Reproduce a failure, inspect safe evidence, test a hypothesis and retain a regression |
| Criticality | Distinguish request scope, replay safety, process integrity and human escalation |
| Express | Ordered parser/routes/404/error boundaries, safe responses and headersSent delegation |
| Database | One client per transaction, rollback/release, full replay and uncertain commit reconciliation |

**Learner checklist — still to perform**

- [ ] Run the error type and custom-cause examples, including non-Error rejection values.
- [ ] Verify callback/event ownership and cleanup; confine deliberately unhandled failures to bounded child processes.
- [ ] Reproduce the two-working-directory settings bug and inspect a caught error in a local debugger.
- [ ] Defend a recovery matrix for your own API, with a safe fallback and a non-retryable uncertain write.
- [ ] Exercise the Express lab over real HTTP, including parser rejection, unknown failures and an aborted partial response.
- [ ] Coordinate a real serialization conflict, observe the complete transaction retry and verify final data plus released clients.
- [ ] Explain which checks were simulated, which used real infrastructure, and which remain untested.

**Mixed practice — answer all before opening the explanations**

1. A product lookup rejects and the controller returns 404 for every rejection. Which distinction has been lost?
2. An async EventEmitter listener rejects, but code awaits `emit()`. Who observes the returned promise?
3. Express starts sending a successful response and then a dependency fails. Can error middleware replace that response with JSON500?
4. A PostgreSQL serialization failure happens after the application reads stock. Why is retrying only UPDATE insufficient?
5. A database connection disappears after COMMIT was sent. Why does a client-side error not prove rollback?
6. Your test reproduces the failure by constructing an EACCES-shaped object. What can it establish, and what cannot it establish?

::: details Practice explanations
1. A completed lookup with no record differs from failure to obtain a result. Translate the known absence separately and preserve other failures.
2. Ordinary EventEmitter does not await returned listener promises; `emit()` returns a boolean. An explicit operation/supervisor or configured rejection path must own the failure.
3. No. The response is committed. Delegate to the downstream error/transport owner; the client must detect an incomplete or aborted response.
4. The earlier read and business decision can be stale. Roll back and repeat the entire replay-safe transaction, with bounded attempts and cleanup.
5. The server may already have committed before its reply was lost. Reconcile a durable operation identity/outcome rather than blindly repeating the write.
6. It can verify classification and adapter policy for a supplied failure shape. It does not prove real permissions, driver behavior or an actual denied filesystem operation.
:::

The seven Errors questions now have written material and author checks. **Your practice remains separate:** completing these notes does not establish that you have implemented, debugged or demonstrated every scenario yourself.
