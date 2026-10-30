# Node.js Foundations — practice

**Learner status: still required.** These tasks were separated from the textbook; no completion is credited.

[Textbook explanation](../../node-js/module-01-nodejs-foundations.md) · [Node.js practice map](./index.md)

### Diagnostic exercise

Build a program that fetches 10,000 URLs from a controlled local server.

Requirements:

- never run more than 20 requests concurrently;
- abort the entire batch after a total deadline;
- preserve input order in the result;
- record successes, HTTP failures, and cancellations separately;
- prove that all timers and sockets close.

This exercise combines promises, cancellation, resource ownership, and event-loop reasoning.

---

## Final review checklist {#_12-final-review-checklist}

You should be able to explain and demonstrate the following:

- Propagate an `AbortSignal` through a complete asynchronous operation.
- Explain why a timeout does not prove that a remote write failed.
- Bound concurrency according to the capacity of the constrained dependency.
- Diagnose event-loop delay, a process that will not exit, and batch memory growth.
- Node.js is a runtime, not a programming language or framework.
- V8 executes JavaScript, while Node.js and libuv provide runtime and asynchronous I/O capabilities.
- “Single-threaded” refers primarily to normal JavaScript execution on the main thread.
- Non-blocking I/O allows operations to overlap without creating a JavaScript thread per request.
- CPU-heavy synchronous work still blocks the event loop.
- A version manager makes it easier to install, switch, and pin Node.js versions.
- `process.argv[2]` is normally the first user-supplied command-line argument.
- `process.env` values must be converted and validated.
- `__dirname` and `__filename` belong to CommonJS; Node.js 22 ESM uses `import.meta.dirname` and `import.meta.filename`.
- CommonJS uses `require()` and `module.exports`.
- ES modules use `import` and `export`, support top-level `await`, and are preferred for new projects.
- `.cjs` always selects CommonJS and `.mjs` always selects ESM.
- The `node:` prefix identifies a standard-library module.
- `package.json` describes project metadata, scripts, and dependency intent.
- `package-lock.json` records the resolved dependency graph and should be committed.
- Runtime packages belong in `dependencies`; development tools belong in `devDependencies`.
- `npm ci` provides a clean lockfile-based installation suitable for CI.
- Project scripts make local and CI commands consistent.
- Error-first callbacks place the error in the first callback argument.
- `promisify()` converts compatible legacy callback functions, but native promise APIs are preferable.
- An async function always returns a promise.
- `await` pauses only its current async function and throws when the promise rejects.
- Independent operations can use `Promise.all()`; dependent operations remain sequential.
- `Promise.all()` does not automatically cancel work after a rejection.
- Async callbacks passed to `forEach()` are not awaited by `forEach()`.
- The event loop executes ready callbacks one at a time on the JavaScript thread.
- Network I/O commonly uses OS facilities; several filesystem, DNS, crypto, and zlib operations use libuv's worker pool.
- The major phases are timers, pending callbacks, idle/prepare, poll, check, and close callbacks.
- Compare ordinary callback next-tick priority with top-level ESM microtask ordering; explain the context before predicting output.
- Both next ticks and endless microtask chains can starve later event-loop work.
- Timer delays are thresholds, not guaranteed execution times.
- Top-level ordering between `setImmediate()` and `setTimeout(..., 0)` is not universally deterministic.
- Open servers, connections, timers, workers, and child processes can keep Node.js running.

**Exercise — module boundaries:** create the two files above and equivalent CJS files. Acceptance: observe the live count, reproduce and explain one cycle failure, demonstrate an inaccessible package subpath, and retain the runtime version and corrected explicit manifest. Transpiling syntax does not grant unavailable runtime APIs.

**Exercise — scheduling:** run both files, then schedule the three queues inside an I/O callback and inside a promise reaction. Acceptance: record context and runtime, explain each output, and leave timer/immediate races unconstrained. Never run the infinite starvation example in a test without a child-process timeout.

**Exercise — body lifetime:** use a local server that sends headers immediately and delays its body beyond the deadline. Acceptance: body consumption rejects, the timer is removed, the connection closes, and an HTTP error body is cancelled. Also test a fast valid response and invalid JSON.

**Exercise — failure-driven limiter:** use controllable promises, not timing guesses. Acceptance: peak concurrency never exceeds the limit; output order equals input order; empty input returns `[]`; invalid limits reject; after an observed failure no new item starts; active mappers receive abort; rejection occurs only after they drain; external/pre-aborted signals work; rejection with `undefined` remains a failure. Verify non-cooperative work requires its own timeout. Add exact maxItems/beyond-limit and sparse-array cases; over-budget batches must start zero mapper calls.

**Exercise acceptance:** run the existing module lab and add an ambiguous `.js` fixture in an owned package with no type; compare with explicit commonjs/module. Show dynamic import alone does not force ESM. Use a controlled promise to show adoption versus fulfillment and a malformed configuration to compare callback-local handling with a promise `.catch`. Preserve the real Autocode template scripts and restricted tests. For frontend stale-query/cancellation/focus behavior, continue with [the tested large-data workflow](../../senior_growth/EngX_Quality/Large_Data_Workflow.md). Learner execution/explanation remains required.

**Additional lab acceptance:** run exact ESM live-count, CJS object/snapshot, ESM TDZ cycle and CJS partial-cycle fixtures; assert package public import/private rejection and missing-extension failure. Compare CJS/ESM top-level scheduling prefixes in section8 while leaving timer/immediate order unconstrained. Demonstrate require of a synchronous ESM module and rejection of a TLA graph on the pinned runtime. Test limiter queue cap, first failure with falsy reason, abort/drain and external/pre-aborted signals using controllable gates. The learner must reproduce/explain these outcomes independently; passing supplied fixtures does not prove application readiness.
