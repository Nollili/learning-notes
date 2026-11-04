---
outline: [2, 3]
---

# Runtime fundamentals

Examples use Node24 and ES Modules (`.mjs`) unless stated otherwise. Only built-in modules are needed. Depth labels describe the question's intended study depth. Try each code question before reading its answer.

### What is Node.js, and what changes when JavaScript runs outside the browser? {#t01-q01}

*Study depth: Foundational*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Node.js is a JavaScript runtime: it provides an engine and host facilities to execute JavaScript outside a browser. **V8 executes JavaScript, while Node adds APIs** for files, processes, networking and other operating-system resources. That makes it useful for command-line programs, build tools and network services.

JavaScript language rules still apply, but the host is different: **ordinary Node programs have no page DOM**, and **code runs with the process's operating-system permissions**. Some web-compatible APIs exist in both environments, but identical names do not make browser security or lifecycle rules apply to Node.

</div>

<span class="notes-section-label">**Detailed explanation**</span>

A runtime is the environment that loads and executes a program and supplies APIs beyond the language. ECMAScript defines language features such as objects, functions and promises. It does not itself define an HTTP server, filesystem access or a browser document.

V8 is the engine Node uses to execute JavaScript and manage its JavaScript heap, including garbage collection. **Node is more than V8**: it supplies native bindings, standard-library APIs, integration with operating-system I/O and the libuv event/worker infrastructure. V8 does not implement the whole filesystem/networking stack. Later groups separate event-loop behavior, memory diagnosis and worker ownership.

In a browser you normally use JavaScript to react to user input and update a document under the browser's origin/permission model. A Node service instead receives network requests and may access configured files, sockets and databases under its deployment identity. Node can also finish a short CLI job without listening for requests.

“Server-side” describes a common use, not a requirement that every Node program be a web server.

| Concern | Browser page | Ordinary Node program |
|---|---|---|
| User interface | DOM, rendering and browser events | Terminal/network interface unless another environment supplies a UI |
| Host resources | Browser-governed web APIs/permissions | Node APIs plus OS/deployment permissions |
| Lifetime | Page/navigation/worker lifecycle | Process and owned resources; no active work can allow exit |
| Shared-looking APIs | Promise, URL, fetch, timers and others | Some compatible interfaces, with different operational/security context |
| Sensitive configuration | Anything delivered to the browser is visible to its user | Secrets can stay server-side, but can still leak through responses/logs/artifacts |

Cross-platform means supported Node distributions run on multiple operating systems. It does not make paths, file permissions, shell commands, signal behavior or native dependencies identical. Use portable APIs and test the deployment OS rather than concatenate a Windows or Unix path/shell command and assume universal behavior.

<span class="notes-section-label">**Example**</span>

Attempt this in a `.mjs` file on Node24, without DOM libraries or a bundler:

```js
console.log(typeof document);
console.log(typeof process);
console.log(typeof Buffer);
```

Expected output is `undefined`, `object`, `function`, on separate lines. `typeof` safely examines an absent identifier. `process` and `Buffer` are Node facilities; their availability is not evidence that browser-page code has the same facilities. Bundlers can insert polyfills, and browser workers have different globals from pages, so this is not a universal browser-output prediction.

<span class="notes-section-label">**Common mistakes**</span>

- Calling Node a programming language: the language is JavaScript; Node supplies its runtime/host.
- Treating V8 as the entire runtime: the engine and the host's I/O APIs have different responsibilities.
- Assuming Node's fetch enforces browser CORS as an authorization mechanism. A server must authenticate/authorize incoming requests and control outbound destinations itself.
- Treating `globalThis` or a browser-compatible API as proof that a DOM exists.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Can frontend JavaScript always be copied into Node?**</span> Pure language/data functions often can; code depending on document/window/rendering or browser-specific storage needs another adapter. Package/module/runtime support also matters.
2. <span class="notes-section-label">**Why is a server environment variable not automatically secret?**</span> It is only one configuration channel. Exposing it in JSON, logs, client bundles or process diagnostics can disclose it; scope and redact access deliberately.
3. <span class="notes-section-label">**Does cross-platform mean a shell script works everywhere?**</span> No. Prefer direct portable Node APIs for the task; subprocess executables and shell syntax still have platform requirements.

::: tip Key takeaway
Node runs JavaScript with server/OS host facilities; V8 executes the language, and the host determines the available resources and boundaries.
:::


---

### What does event-driven, nonblocking execution mean, and does async move work off the main thread? {#t01-q02}

*Study depth: Intermediate*

<span class="notes-section-label">**Code question — attempt first**</span>

Predict the log order in a Node24 `.mjs` file. Does the arithmetic run on a separate JavaScript thread?

```js
console.log('start');
setTimeout(() => console.log('timer'), 0);
async function calculate() {
  let total = 0;
  for (let i = 0; i < 50_000; i++) total += i;
  return total;
}
const result = calculate();
console.log('end');
console.log(result instanceof Promise);
```

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Event-driven execution reacts to events such as incoming requests, completed I/O or timers. A nonblocking I/O API lets JavaScript initiate work and **return without waiting synchronously for completion**; the result is handled later. That lets a process serve other work while I/O is pending. It does not make all computation parallel or free.

JavaScript callbacks run on their execution thread, and **an async function runs synchronously until it yields**. **CPU-heavy work can therefore block unrelated requests** unless it is bounded, split appropriately or moved to a suitable worker/process.

</div>

<span class="notes-section-label">**Detailed explanation**</span>

A callback is a function called when some operation or notification is processed. The event loop coordinates opportunities to run such callbacks as the runtime makes progress. It does not interrupt a long-running JavaScript function to run another request handler in the middle of it.

Different Node APIs use different mechanisms. Network I/O commonly uses OS readiness/completion facilities. Filesystem operations commonly use libuv's worker pool. Workers/native libraries may perform work outside the JavaScript thread, but the JavaScript completion callback still needs a turn to execute.

“Every async operation runs on another thread” is therefore wrong, as is “the event loop performs all expensive work itself.” Exact mechanisms are API/platform-specific.

Concurrency means multiple operations have overlapping lifetimes. Parallelism means work executes simultaneously on execution resources. One JavaScript execution thread can coordinate many pending sockets concurrently without executing all their callbacks in parallel. Node also supports other threads/processes; group9 explains their isolation/communication trade-offs.

For a frontend comparison, a long synchronous browser handler can prevent input/render work. A long synchronous Node handler can prevent other callbacks on that execution thread. The browser additionally has rendering/frame scheduling; do not map Node loop phases to browser paints.

<span class="notes-section-label">**Example answer and reasoning**</span>

The expected logs are `start`, `end`, `true`, `timer`. The call to calculate executes its loop before returning a fulfilled promise. There is no await inside it and no worker creation. The timer callback cannot run until the current JavaScript work yields; **zero delay does not mean immediate interruption**. No exact elapsed delay is promised.

Changing a CPU-heavy function to `async`, or wrapping the calculation in Promise.resolve().then(...), does not move its CPU work to a worker thread. For small work, the loop is fine. For a large request computation, first measure and bound it, consider a better algorithm, then choose explicit worker execution or an asynchronous job when justified.

Do not spawn one unbounded worker per hostile request.

<span class="notes-section-label">**Common mistakes**</span>

- “Node is single-threaded, so it cannot handle concurrent requests”: this confuses one callback's execution with pending I/O and the whole process's threads.
- “async makes it nonblocking”: synchronous work before/between yield points still occupies its execution thread.
- “All slow requests mean the loop is blocked”: a remote dependency, queue or saturated pool can be slow while the loop itself remains responsive.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Does await always make a slow calculation safe?**</span> No. Evaluating the awaited expression can perform synchronous work; a resolved promise also does not offload subsequent computation.
2. <span class="notes-section-label">**What should you inspect when all requests pause during an endpoint call?**</span> Measure callback/CPU duration and event-loop delay, inspect synchronous parsing/loops/filesystem calls, then distinguish CPU contention from dependency/pool delay.
3. <span class="notes-section-label">**Can an event callback itself be asynchronous?**</span> It can start promise work, but whether its emitter waits for that promise is a separate API contract. EventEmitter's emit is not a general await-all-listeners mechanism.

::: tip Key takeaway
Nonblocking I/O permits progress while waiting; async syntax alone cannot prevent CPU work from blocking a JavaScript execution thread.
:::


---

### When should you use synchronous or asynchronous filesystem APIs? {#t01-q03}

*Study depth: Intermediate*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

A synchronous API keeps the current JavaScript thread waiting until it returns or throws. An asynchronous API returns control and reports completion later through its documented callback/promise contract. **Prefer asynchronous I/O on a request-serving path** so other callbacks can run while it is pending.

**A bounded synchronous operation can be reasonable** in a short-lived CLI or before a service accepts traffic. **Async does not guarantee faster completion** of one operation; it mainly changes scheduling and resource use. Both approaches still need errors, input limits and sensible concurrency.

</div>

<span class="notes-section-label">**Detailed explanation**</span>

With readFileSync, the next JavaScript statement waits for the read and decoding to finish. With the promise readFile, the function returns a promise; awaiting it suspends that async function, **not the whole JavaScript execution thread**. Other callbacks can run while the file read is outstanding. Afterward, synchronous parsing such as JSON.parse still runs on the JavaScript thread.

For a request-serving process, repeated blocking reads can delay unrelated clients. For a CLI inspecting one small trusted configuration file, adding asynchronous coordination may not improve the user's task or its clarity.

Startup code that runs before listening can deliberately use a bounded sync read; do not let an unexpected huge/network-mounted file make startup unbounded. Decide from workload, latency/throughput needs, file size and resource ownership.

Asynchronous reads also consume resources: unbounded Promise.all over thousands of files can overload storage/thread-pool capacity and accumulate buffers. Both readFile variants normally **read the whole file into memory**. For large/untrusted content choose bounded or streaming reads and backpressure, not just the async spelling of an unbounded allocation.

<span class="notes-section-label">**Example**</span>

Save as `read-small.mjs`; run `node read-small.mjs async example.txt` or replace async with sync. Use only a small trusted local text fixture for this comparison.

```js
import {readFile} from 'node:fs/promises';
import {readFileSync} from 'node:fs';
const [mode, file] = process.argv.slice(2);
if (!['sync', 'async'].includes(mode) || !file) {
  console.error('Usage: node read-small.mjs sync|async FILE');
  process.exitCode = 2;
} else {
  try {
    const text = mode === 'sync'
      ? readFileSync(file, 'utf8')
      : await readFile(file, 'utf8');
    console.log(text.length);
  } catch {
    console.error('Could not read the file');
    process.exitCode = 1;
  }
}
```

Both branches print the decoded string length in UTF-16 code units, not file bytes or user-visible grapheme count. Both handle failure; the sync branch throws directly, the async read rejects and is caught by await. This is a small-file teaching example, not a safe public upload/file endpoint.

Measure responsiveness under multiple requests before concluding one implementation is better for a service.

<span class="notes-section-label">**Common mistakes**</span>

- Comparing only one read's elapsed time and claiming async universally faster. Service responsiveness and total task duration are different measures.
- Returning a promise without observing/catching its rejection at an owned boundary.
- Reading asynchronously, then blocking on huge parsing/decompression and calling the whole endpoint nonblocking.
- Assuming asynchronous file writes are atomic transactions or that concurrent writes automatically serialize safely.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Would you use sync I/O in a request handler reading one tiny file?**</span> It may appear harmless under light load, but repeated/blocking storage latency couples all callbacks. Cache validated immutable data or use bounded async I/O based on the requirement.
2. <span class="notes-section-label">**Does a promise read need an explicit handle close?**</span> Convenience readFile owns its internal open/read/close when passed a path. A handle you opened yourself has a separate lifetime you must close, including on errors.
3. <span class="notes-section-label">**What if async is still slow?**</span> Inspect storage latency, thread-pool contention, excessive concurrent requests, memory pressure and decoding/parsing. Changing callbacks to promises does not fix the underlying capacity problem.

::: tip Key takeaway
Choose sync versus async from the program's waiting/concurrency needs, and budget work and resources in either case.
:::


---

### How do core modules support both a CLI tool and a service? {#t01-q04}

*Study depth: Intermediate*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Core modules ship with Node and expose host capabilities through imports such as node:fs/promises, node:path and node:http; **they do not need an npm installation**. A CLI usually reads arguments, performs a bounded task, writes results/errors and exits. **A service owns long-lived resources** such as a listening socket and keeps accepting work until shutdown.

**Both need validation, error handling and cleanup**. A framework can compose these primitives, but it is not required to start a small Node program.

</div>

<span class="notes-section-label">**Detailed explanation**</span>

The `node:` prefix explicitly identifies a built-in module. An ordinary package name such as express is a separate dependency with installation/version/lifecycle decisions. Importing a core API does not grant unlimited authority: an fs call can fail under OS permissions, and a network bind can fail because an address is occupied or forbidden.

A small file-inspection CLI can read a bounded byte sample without loading an entire file. A service instead acquires a socket, responds per request, and releases that socket on termination. These programs have different lifetimes even though both use the same JavaScript language.

Neither should dump raw private errors or abruptly exit before buffered output/cleanup finishes. A server listening successfully is also not proof its future database, authorization or deployment works.

<span class="notes-section-label">**Example — bounded CLI**</span>

Save as `inspect-file.mjs`; run `node inspect-file.mjs example.txt`. This is a trusted local path chosen by the CLI user, not a caller-controlled HTTP filesystem service.

```js
import {open} from 'node:fs/promises';
import {basename} from 'node:path';
const file = process.argv[2];
if (!file) {
  console.error('Usage: node inspect-file.mjs FILE');
  process.exitCode = 2;
} else {
  let handle;
  try {
    handle = await open(file, 'r');
    if (!(await handle.stat()).isFile()) throw new Error('Regular file required');
    const sample = Buffer.alloc(1024);
    const {bytesRead} = await handle.read(sample, 0, sample.length, 0);
    console.log(JSON.stringify({name: basename(file), sampledBytes: bytesRead}));
  } catch {
    console.error('Could not inspect the file');
    process.exitCode = 1;
  } finally {
    if (handle) {
      try { await handle.close(); }
      catch { console.error('Could not close the file'); process.exitCode = 1; }
    }
  }
}
```

The sample allocation is fixed at1024bytes. A read may return fewer bytes, so bytesRead describes this one sample, not a guaranteed complete file size. No arbitrary binary sample is decoded as independent UTF-8 here. The finally owns the opened handle even when stat/read fails.

An attacker-controlled path or mutable filesystem would require a stronger authorization/containment design; **basename is display formatting, not containment**.

<span class="notes-section-label">**Example — small HTTP teaching service**</span>

Save as `health-service.mjs`; run `PORT=3000 node health-service.mjs` using your shell's environment-setting syntax. Alternatively omit PORT for3000. `PORT=0` asks the OS for an available port, which is printed after successful binding.

```js
import http from 'node:http';
const raw = process.env.PORT ?? '3000';
if (!/^\d{1,5}$(?![\s\S])/.test(raw) || Number(raw) > 65535) {
  console.error('Invalid PORT');
  process.exitCode = 2;
} else {
  const server = http.createServer((req, res) => {
    if (req.method !== 'GET') {
      res.writeHead(405, {Allow: 'GET', Connection: 'close'}).end();
      return;
    }
    if (req.url !== '/health') { res.writeHead(404).end(); return; }
    res.writeHead(200, {'Content-Type': 'application/json', 'Cache-Control': 'no-store'});
    res.end(JSON.stringify({status: 'ok'}));
  });
  server.headersTimeout = 3000;
  server.requestTimeout = 5000;
  server.keepAliveTimeout = 1000;
  let stopping = false;
  function stop() {
    if (stopping) return;
    stopping = true;
    const hard = setTimeout(() => {
      process.exitCode = 1;
      server.closeAllConnections();
    }, 2000);
    hard.unref();
    server.close(error => {
      clearTimeout(hard);
      if (error) process.exitCode = 1;
    });
  }
  server.on('error', () => {
    console.error('Server error'); process.exitCode = 1;
    if (server.listening) stop();
  });
  process.once('SIGTERM', stop);
  process.once('SIGINT', stop);
  server.listen(Number(raw), '127.0.0.1', () => {
    console.log(JSON.stringify({port: server.address().port}));
  });
}
```

This loopback-only service returns200 for GET/health,404 for other GET paths and405 for other methods. It owns startup errors and bounded HTTP shutdown. The callback prints the actual port only after listening, not before successful binding. `/health` is shallow process health, not continuous dependency readiness.

The timeout settings do not interrupt synchronous CPU work and do not configure production authentication, TLS, quotas or load-balancer drain. Signal behavior differs across platforms; the POSIX signal test is not a Windows portability guarantee.

<span class="notes-section-label">**Common mistakes**</span>

- Installing a package named fs to use Node's filesystem API rather than importing the built-in module.
- Starting to accept traffic before required configuration/dependencies are validated.
- Leaving an open handle/server after a CLI finishes its apparent work, or calling process.exit immediately instead of owning cleanup.
- Exposing a local teaching service publicly or calling a health response proof of secure production readiness.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**When would Express help?**</span> When routing, middleware and reusable HTTP conventions improve maintainability. It does not replace Node's underlying sockets/streams or application error/resource ownership.
2. <span class="notes-section-label">**Why does the CLI end but the service stays alive?**</span> The listening server is an active resource. Process lifetime depends on referenced runtime resources; an unresolved promise alone is not a universal keep-alive mechanism.
3. <span class="notes-section-label">**Why bind loopback and allow an ephemeral port?**</span> Loopback limits this fixture to the local machine; an ephemeral port avoids assuming a fixed development/test port is free. Container/hosted binding policy is a separate design.

::: tip Key takeaway
Core modules provide the building blocks; a program's interface, lifetime and owned resources determine whether it behaves as a CLI or a service.
:::

## Revision {#group1-revision}

Node is a runtime using V8 plus host/native/OS facilities. The host differs from a browser even when language syntax and some APIs overlap. Nonblocking I/O overlaps waiting, while synchronous JavaScript can still delay unrelated callbacks.

Sync APIs can suit bounded startup/CLI tasks; async I/O normally suits request paths but still needs memory/concurrency budgets. Core modules can implement both short-lived tools and long-running services with explicit cleanup.

<span class="notes-section-label">**What you should be able to explain or implement**</span>

- [ ] Explain runtime versus engine versus language, and browser versus Node authority.
- [ ] Explain cross-platform limitations without confusing OS differences with JavaScript syntax.
- [ ] Predict the blocking/async-function example and explain why no worker was created.
- [ ] Justify a sync/async choice for a startup CLI versus a request-serving path.
- [ ] Run the bounded file CLI and explain byte count/handle ownership and error exit codes.
- [ ] Run the local health service, verify its routes and stop it without an orphan process.

These are learner checks, not completed learner evidence.

<span class="notes-section-label">**Mixed practice — attempt all questions first**</span>

1. A frontend helper uses document.querySelector. Why does importing it into Node fail when it runs, even though its JavaScript syntax is valid?
2. An endpoint awaits a resolved promise, then parses a200MiB JSON string. Does await prevent a service-wide pause? What would you change?
3. A file-inspection CLI prints sampledBytes1024 for a5MiB file. Is it reporting the file size correctly?
4. A health server prints “started” before calling listen. Another process already owns the port. Which contract is wrong and how would you fix it?

<span class="notes-section-label">**Practice answers**</span>

1. Ordinary Node has no document/DOM host. Keep DOM access in a browser adapter or provide an explicitly appropriate environment; a language parser accepting the file does not provide the missing host API.
2. No. JSON.parse is synchronous CPU/memory work. Bound accepted bytes before parsing, reconsider format/streaming, measure cost and move genuinely expensive work to an owned worker/job when appropriate. Merely adding async/await is not offloading.
3. No. It intentionally reports only the bytes returned by one bounded sample read. Use stat for a point-in-time size when that is the requirement, remembering files can change; do not relabel a sample as total size.
4. It reports success before the resource is acquired. Observe the error event and emit success from the listening callback; a bind failure must produce a controlled failure outcome.

## References

Official sources checked2026-11-04: [Node introduction](https://nodejs.org/en/learn/getting-started/introduction-to-nodejs), [browser differences](https://nodejs.org/en/learn/getting-started/differences-between-nodejs-and-the-browser), [do not block the loop/worker pool](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop), [Node24 filesystem](https://nodejs.org/docs/latest-v24.x/api/fs.html), [Node24 HTTP](https://nodejs.org/docs/latest-v24.x/api/http.html). The runnable examples are original teaching fixtures, not copied production applications.

<span id="batch-b01-progress"></span>

