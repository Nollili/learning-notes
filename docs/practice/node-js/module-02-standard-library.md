# Node.js Standard Library — practice

**Learner status: still required.** These tasks were separated from the textbook; no completion is credited.

[Textbook explanation](../../node-js/module-02-standard-library.md) · [Node.js practice map](./index.md)

### Diagnostic exercise

Create a thumbnail-processing service with a fixed worker pool.

It must:

- reject work when its bounded queue is full;
- cancel tasks whose caller disconnects;
- replace a worker that crashes;
- transfer image buffers where ownership permits;
- expose queue depth and task duration;
- stop accepting work and terminate workers during shutdown.

---

## Final review checklist {#_13-final-review-checklist}

You should be able to explain and demonstrate each item without looking it up:

- Avoid shell injection by separating executable names from argument arrays.
- Bound child-process runtime and output, and interpret exit code versus signal.
- Design a worker pool with a bounded queue, cancellation, and crash replacement.
- Explain copying, transferring, and sharing binary memory between workers.
- Identify and close the owner of every timer, handle, child, worker, and socket.
- Read positional arguments with `process.argv.slice(2)` and named options with `parseArgs()`.
- Parse `process.env` values instead of treating them as typed configuration.
- Keep results on stdout and errors on stderr.
- Prefer `process.exitCode` when pending work should finish.
- Distinguish operational failures from programmer bugs.
- Match errors to synchronous throws, promise rejections, callback errors, or `'error'` events.
- Know when `readFile()` returns a `Buffer` versus a string.
- Use promise-based `fs` methods and understand when streams are more appropriate.
- Sort directory entries whenever deterministic order matters.
- Use `path.join()` for composition and `path.resolve()` for an absolute result.
- Distinguish `process.cwd()` from the current module's directory.
- Use SHA-256 for integrity checks, not password storage.
- Use `randomBytes()` or `randomUUID()` when unpredictability matters.
- Choose `exec`, `execFile`, `spawn`, or `fork` based on shell, buffering, streaming, and IPC needs.
- Use cluster for multiple server processes and worker threads for CPU-heavy JavaScript.
- Remember that cluster workers have separate process memory and worker threads only share memory explicitly.
- Handle child and worker startup errors as well as non-zero exits.

## Boundary and ownership labs {#_14-boundary-and-ownership-labs}

Baselines: Node24.18.0 runtime and TypeScript5.9.3 for isolated type checks; official Node24 API contracts checked2026-10-21. Use scratch fixtures and temporary app-owned directories, not production paths.

**Filesystem acceptance:** create a normal child, a valid `..notes` child, a lexical ../ escape and a symlink to an external scratch file. Assert the first two resolve and the latter two reject; absolute/missing/empty paths follow the documented contract. Explain why a deliberately swapped ancestor after resolution is still a race and why the helper requires an untrusted-writer-free tree. Test Windows separately. Do not claim a traversal-resistant OS sandbox from this check.

**Fingerprint acceptance:** compare the formerly ambiguous arrays `['a,b','c']` and `['a','b,c']` and require different digests. Input permutation produces the same digest, caller arrays are not mutated, empty/Unicode names are encoded deterministically, and content changes alone do not affect a names-only digest. If content integrity is required, design and version a separate canonical entry/content format.

**Error-boundary acceptance:** a plain Error must not pass the code guard; an Error with a numeric code must fail; an Error with a string code passes. Unknown cannot authorize code/path access before checks. A nonempty configured signing secret must be narrowed before HMAC creation, not asserted present. These tests do not implement the full raw-body/timestamp/replay-safe webhook protocol, which is a separate lesson.

**Worker acceptance:** write real workers for a valid result, invalid result, duplicate messages, immediate exit0, nonzero exit, thrown exception, message then live interval, and no-result live interval. Require exactly one selected outcome, exit0/no-message rejection, bounded deadline/caller abort behavior, no callbacks after cleanup and natural test-process termination. Pre-aborted signals must not start a worker; uncloneable input and invalid filename must reject. Confirm the parser protects result shape rather than casting unknown to TResult. A worker pool's queue/capacity/replace/drain implementation remains a separate practice task; this lab repairs one owned task.

Material checks and learner practice are separate. Record commands, Node version, fixtures, observations and any platform limitations. No user practice or production readiness follows from reading these examples.

Official references: [Node24 workers and termination](https://nodejs.org/docs/latest-v24.x/api/worker_threads.html), [Node24 path.relative](https://nodejs.org/docs/latest-v24.x/api/path.html#pathrelativefrom-to), [Node24 realpath/file APIs](https://nodejs.org/docs/latest-v24.x/api/fs.html), [Node24 crypto](https://nodejs.org/docs/latest-v24.x/api/crypto.html), [OWASP path traversal](https://community.owasp.org/attacks/Path_Traversal), [OWASP race conditions](https://community.owasp.org/pages/vulnerabilities/race_conditions).
