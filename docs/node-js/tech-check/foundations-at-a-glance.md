---
outline: [2, 2]
---

# Node.js Foundations at a glance

One short reminder for each of the **56 questions** in the Foundations explanation pages. Read a topic, recall the idea, then use its link if you need the full answer or diagram. Deeper topics are included too; follow each chapter's first-pass guidance when deciding what to practise next.

## Core JavaScript

- [Object references and copies](./core-javascript.md#t26-q01): **Assignment shares the same object.** Spread creates a new outer object, but nested objects can still be shared.
- [Function calls and `this`](./core-javascript.md#t26-q02): **An ordinary function gets `this` from how it is called; an arrow gets it from its surrounding scope.** Use `bind()` or a wrapper to preserve a method's receiver.
- [Closures](./core-javascript.md#t26-q03): **A closure keeps access to its surrounding variables.** Functions from one outer call can share state; separate outer calls create separate local state.

## Runtime fundamentals

- [Runtime: Node and the browser](./01-runtime-fundamentals.md#t01-q01): **A runtime is the environment that runs your code and provides APIs it can use.** In Node, V8 executes JavaScript; Node adds file, process and networking APIs, without a browser page or DOM by default.
- [Nonblocking execution](./01-runtime-fundamentals.md#t01-q02): **Other work can progress while I/O waits.** Adding `async` does not move a calculation to another thread.
- [Sync versus async files](./01-runtime-fundamentals.md#t01-q03): **Sync file calls block the current JavaScript thread.** Prefer async calls in request handlers; a small sync startup or CLI read can be reasonable.
- [CLI versus service](./01-runtime-fundamentals.md#t01-q04): **A CLI usually finishes one task; a service keeps accepting work.** Both can use built-in modules without installing packages and must close their resources.

## CLI and process management

- [Flags and arguments](./02-cli-and-processes.md#t02-q01): **Node options usually go before the script; application arguments go after it.** `execArgv` holds runtime options; `argv` includes the executable, script and application arguments.
- [Environment configuration](./02-cli-and-processes.md#t02-q02): **Environment values are strings: validate and convert them at startup.** Missing may mean default; invalid means failure. `Boolean('false')` is `true`.
- [REPL](./02-cli-and-processes.md#t02-q03): **The interactive prompt remembers previous inputs.** Reproduce important findings in a fresh file or test with explicit setup.
- [Standard streams](./02-cli-and-processes.md#t02-q04): **stdin reads input, stdout carries results, stderr carries diagnostics.** A failed CLI also needs a nonzero exit status.
- [Process lifetime](./02-cli-and-processes.md#t02-q05): **Active referenced resources can keep Node running; a pending promise alone does not.** `exitCode` allows natural completion; `exit()` may interrupt output and cleanup.
- [Process diagnostics](./02-cli-and-processes.md#t02-q06): **Working directory differs from module location; elapsed time differs from CPU time.** JavaScript heap use is only part of process memory.
- [Starting programs](./02-cli-and-processes.md#t02-q07): **`spawn` streams output; `execFile` normally buffers it; `exec` adds a shell.** Prefer direct executable arguments when shell features are unnecessary, and observe failures and closure.
- [Fork and IPC](./02-cli-and-processes.md#t02-q08): **`fork()` creates another Node process with a message channel.** Validate replies and observe completion; sending a message does not prove the task finished.

## Modules

- [Import specifiers](./03-modules.md#t03-q01): **Built-in, relative-file and package imports use different lookup rules.** A relative import starts from the importing file, not the working directory.
- [CommonJS and ESM](./03-modules.md#t03-q02): **CommonJS uses `require`/`module.exports`; ESM uses `import`/`export`.** `.cjs` and `.mjs` make the format explicit; `.js` depends on package/runtime context.
- [Scope and cache](./03-modules.md#t03-q03): **Module-private state can still be shared by callers of the same cached instance.** Separate processes have separate caches and memory.
- [`exports` assignment](./03-modules.md#t03-q04): **`module.exports` is what `require()` receives.** Changing `exports.name` can update it; reassigning the local `exports` variable does not replace it.
- [Package entry points](./03-modules.md#t03-q05): **`exports` takes priority over `main`** in supported Node package resolution. Conditions can select different entries; `imports` defines package-local `#` shortcuts.
- [Async module loading](./03-modules.md#t03-q06): **Dynamic `import()` returns a promise; top-level `await` delays module readiness.** A dependency graph containing top-level await cannot finish through synchronous `require()`.
- [Loading failures](./03-modules.md#t03-q07): **Finding a module and successfully running it are different stages.** Check the actual runtime, file format, selected entry, exports and initialization failure.
- [Cycles and reloading](./03-modules.md#t03-q08): **Cycles can expose partial CommonJS exports or uninitialized ESM bindings.** Clearing a cache does not close old sockets, pools or timers.

## Package management

- [Manifest and runtime](./04-package-management.md#t04-q01): **`package.json` declares contracts; npm installs dependencies; Node loads code.** `"private": true` prevents accidental npm publication, not access to files.
- [Install versus clean install](./04-package-management.md#t04-q02): **`npm install` can change the dependency graph; `npm ci` recreates a compatible lockfile's graph.** The build stage may need development tools absent from the runtime stage.
- [npm configuration](./04-package-management.md#t04-q03): **Flags, environment and configuration files all affect npm.** Inspect the effective nonsecret settings and failure stage before changing them.
- [Scripts and hooks](./04-package-management.md#t04-q04): **An npm script does what its configured command says.** `--` forwards arguments; pre/post hooks can add work, but post hooks are not guaranteed cleanup.
- [Versions and ranges](./04-package-management.md#t04-q05): **A range allows versions; a lockfile records a specific resolution.** Caret rules tighten before 1.0, prereleases need care, and `ci` does not automatically upgrade.
- [Registries and packages](./04-package-management.md#t04-q06): **Inspect the tarball consumers actually receive.** Tags can move; integrity checks verify expected bytes, not whether the code is trustworthy.
- [Build artifacts](./04-package-management.md#t04-q07): **npm orchestrates tools; the configured tools build the output.** Check the emitted artifact that will run, including missing or stale files.
- [Dependency debugging](./04-package-management.md#t04-q08): **Find the failing stage and change one cause at a time.** Deleting the lockfile or forcing upgrades can hide the original problem.

## Asynchronous programming

- [Callbacks](./05-asynchronous-programming.md#t05-q01): **An error-first callback reports `(error, result)` and a one-result operation should complete once.** Callbacks can run immediately or later; document timing and return after reporting failure.
- [Promises](./05-asynchronous-programming.md#t05-q02): **Every `.then()` creates a new promise.** Return values or promises to keep the chain connected; throws reject it. The executor runs now; handlers run later.
- [`async` and `await`](./05-asynchronous-programming.md#t05-q03): **`await` pauses the async function, not the whole JavaScript thread.** Await owned work inside `try` and await required cleanup in `finally`.
- [Async error ownership](./05-asynchronous-programming.md#t05-q04): **A surrounding catch does not own every later callback or detached promise.** Handle each failure channel explicitly; `emit()` does not await async listeners.
- [Control flow](./05-asynchronous-programming.md#t05-q05): **Sequence dependent work; overlap independent I/O; limit large collections before starting them.** `Promise.all()` does not limit concurrency.
- [Promise combinators](./05-asynchronous-programming.md#t05-q06): **`all`: every success; `allSettled`: every outcome; `any`: first success; `race`: first outcome.** None automatically cancels the other operations.
- [Timeout and cancellation](./05-asynchronous-programming.md#t05-q07): **A timeout ends a wait; cancellation asks cooperative work to stop.** Pass supported abort signals, clean up timers/listeners and remember that completed effects remain.
- [Async iteration](./05-asynchronous-programming.md#t05-q08): **`for await` requests the next value after the current body finishes.** Early break calls an available iterator `return()`; the producer still needs a sound cleanup contract.
- [Synchronous generators](./05-asynchronous-programming.md#t05-q09): **`next()` starts or resumes the generator; `yield` pauses it; `done` marks completion.** Yielding does not itself give event-loop callbacks a turn.

## Core APIs

- [Console](./07-core-apis.md#t07-q01): **`log`/`info` use stdout; `warn`/`error` use stderr.** `console.assert()` reports rather than throws; logging can affect timing and expose secrets.
- [File completion](./07-core-apis.md#t07-q02): **Callbacks and promises report the same asynchronous work differently.** Await writes before further writes to the same target; close handles you open. Without a text encoding, `readFile` returns a Buffer.
- [Paths](./07-core-apis.md#t07-q03): **Path helpers transform strings, not filesystem permissions.** A normalized path can still be missing, unauthorized or redirected by a symbolic link.
- [OS information](./07-core-apis.md#t07-q04): **Host facts are hints, not a resource allowance.** System memory differs from the JavaScript heap limit; choose concurrency using deployment limits and measurements.
- [Buffers](./07-core-apis.md#t07-q05): **Text length differs from encoded byte length.** `Buffer.from(buffer)` copies; Buffer `subarray()` and `slice()` share storage, so edits and memory retention can be shared.
- [Chunked text](./07-core-apis.md#t07-q06): **A character can span byte chunks; `StringDecoder` keeps incomplete bytes until more arrive.** Flush with `end()`; tolerant decoding is not strict input validation.
- [Timers](./07-core-apis.md#t07-q07): **Delay means earliest eligibility, not exact execution time.** `unref()` does not cancel; `setInterval()` does not await async work and can overlap runs.
- [URLs](./07-core-apis.md#t07-q08): **Parse with `URL` and handle query values with `URLSearchParams`.** Absolute inputs can replace the base origin; encode components for their actual destination.
- [Streams](./07-core-apis.md#t07-q09): **When `write()` returns `false`, the chunk was accepted: pause further writes until `drain` or failure.** Await `pipeline()`; queue thresholds do not bound all memory.
- [Lines and input](./07-core-apis.md#t07-q10): **A readline interface and its source stream have separate lifetimes.** Observe source errors, close owned resources and impose input limits; readline does not cap line size.
- [Cryptography](./07-core-apis.md#t07-q11): **Hash: change detection; HMAC/signature: authenticity; encryption: secrecy; password hashing: expensive salted verification.** Choose the primitive for the goal and protect its keys.
- [Compression](./07-core-apis.md#t07-q12): **Limit compressed input and expanded output separately.** Backpressure does not cap total expansion, and compression provides neither secrecy nor authenticity.

## Framework foundations

- [Framework responsibilities](./16-frameworks.md#t16-q01): **Node supplies the runtime; frameworks organize HTTP handling.** MVC separates model, view and controller; an API commonly returns data instead of a rendered page.
- [Framework choice](./16-frameworks.md#t16-q02): **Choose for application needs, team knowledge and measured constraints.** Learn one stack well before comparing alternatives for a concrete reason.
- [App versus server](./16-frameworks.md#t16-q03): **The app defines request behavior; the server owns the listening port and connections.** Keep startup separate so importing the app does not open a port.
- [Configuration and dependencies](./16-frameworks.md#t16-q04): **Validate settings before opening resources, then pass settings and services into the app.** The code that acquires resources also owns failure cleanup and shutdown.

## Put it into practice

[Build a Foundations CLI](./progressive-projects.md#project-1-foundations-cli): keep terminal parsing in the entry point, business operations reusable and storage behind an explicit interface. Check results, failures and cleanup before extending the application.
