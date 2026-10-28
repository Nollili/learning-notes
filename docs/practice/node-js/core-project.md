# A bounded Node.js log analyzer

**Learner status: still required.** This is the small runtime project that precedes the larger [P-332 failure lab](../backend-project.md#p-332). It needs no Express, database, broker, cloud account or frontend.

## Prerequisites and scope

Know JavaScript functions, scope, arrays/objects, promises and basic `try`/`catch`. Read Node Modules 1–3, the testing parts of Module 4 and raw HTTP/client parts of Module 5. Use runtime diagnostics from Module 11 and lifecycle principles from Module 10 as needed. Compile typed implementations with the chosen project's existing compiler; plain ESM JavaScript is also suitable in a new independent practice directory.

Build one CLI that reads a local NDJSON log file and returns a small summary. Then expose the same pure analysis behind a loopback HTTP endpoint. Reuse concepts from the [runtime workbench](../../workbench/node-js/index.md), but implement your application independently. A framework or persistence layer would obscure this project's runtime goals.

Each nonblank line is a JSON object with exactly `level` (`info`, `warn` or `error`) and `message` (a string of 1–200 characters). The source is synthetic and contains no credentials. Count records by level and return exactly `{total, info, warn, error}`; do not retain or echo message text. For the three records below, the summary is total 3, info 1, warn 0, error 2.

```json
{"level":"info","message":"started"}
{"level":"error","message":"dependency unavailable"}
{"level":"error","message":"request failed"}
```

## N-01 — CLI, modules and filesystem ownership

**Scope:** `node analyze.mjs <input> <output>` in an owned learner directory. Separate argument/config validation, analysis and the executable entry point. Importing the analysis module must not start work or open handles. Use explicit ESM markers; compare a tiny `.cjs` export in the separate module exercise.

**Acceptance:** missing arguments produce a safe usage error and nonzero exit. Valid input produces the exact summary. Empty input produces four zero counts. Missing/unreadable input and malformed records fail with a safe category and line number. Output is published only after successful analysis; partial temporary output is removed on failure. An existing output is not silently overwritten unless an explicit replacement policy was chosen and tested. Close every file handle.

**Failure cases:** nonexistent input, exclusive-output conflict, failed destination and invalid configuration. Explain exclusive creation versus replacement, atomic filename visibility versus crash durability, and why a CLI's authorized file path is not an HTTP caller's storage permission.

**Evidence:** actual arguments with private paths redacted, stdout/stderr/exit code, resulting JSON, unchanged protected fixture and absence of leftover temporary files. Record the module format/runtime and output policy.

## N-02 — Incremental bytes, framing and pressure

**Scope:** stream input with at most 64 KiB chunks, 8 KiB per physical record, 10,000 nonblank records and 2 MiB total input. Validate the domain fields after parsing. Keep counters rather than an array of all records; apply limits before unbounded accumulation. Define LF/CRLF, blank-line and final-line policy explicitly, consistent with the textbook parser you select.

**Acceptance:** the same UTF-8 data split at every byte boundary gives identical results. Invalid UTF-8, null/array/primitive records, unknown fields, invalid level/message, excessive record/chunk/count/total bytes reject. Include a slow consumer and demonstrate that production/pulls are governed by demand rather than an unbounded promise list. Do not report `highWaterMark` as a total memory ceiling.

**Failure cases:** split multibyte characters, malformed later line, source read failure, destination failure and early consumer exit. All pipeline owners settle and release resources; failure cannot publish a successful final report.

**Evidence:** fixed input bytes and split schedules, expected/observed errors and line numbers, pull/queue counts, input size and memory categories under a declared repeated workload. Tiny correctness fixtures establish contracts, not a universal memory benchmark.

## N-03 — HTTP and complete operation lifetimes

**Scope:** a raw `node:http` server bound to loopback. `POST /analyze` accepts the same NDJSON contract with an explicit media type; it never accepts a filesystem path or command. `GET /health/live` is shallow. Reuse the analysis function rather than create a second parser. Use ephemeral ports for automated checks.

**Acceptance:** valid input returns 200 and the summary; malformed records return the documented 400 policy, unsupported media 415 and excessive bytes 413 when the transport still permits a response. Close rejected HTTP/1.x body connections under a deadline; an aborted peer is not guaranteed to receive JSON. No response exposes messages, stack traces, paths or request credentials. Header/body/idle limits and one complete-operation deadline are explicit.

Create an outbound client against an owned local server that sends headers promptly and delays the body. Prove the client deadline covers body consumption, HTTP error bodies are cancelled or safely consumed, malformed output rejects, and success passes runtime schema validation. Do not retry writes after an uncertain outcome.

**Failure cases:** stalled body, client disconnect, invalid media, delayed upstream body, bad status/schema and failed bind. Stop the server and close owned agents/connections/timers after every case.

**Evidence:** safe request/status/header/summary observations, failing schedules, cancellation reason, process exit and resource ownership. A Node client cannot prove browser CORS/cookie enforcement.

## N-04 — Cancellation, errors and bounded concurrency

**Scope:** add a batch of a few independent local-file analyses, with at most two active tasks and a declared item cap. Preserve input order. On first failure stop assigning new items, abort cooperative active work, wait for it to drain and preserve the original rejection. SIGINT requests cancellation through the entry-point owner.

**Acceptance:** controllable promises prove two active tasks maximum, correct result order, zero calls for pre-abort/invalid/over-budget input and no new task after observed failure. Rejection with `undefined` is still failure. A successful output cannot be reported while a failed operation's peer is still writing. A noncooperative adapter needs its own deadline; abort is not rollback.

**Failure cases:** one mapper fails while another is held, abort before launch and during read, and cleanup failure accompanying a primary error. Preserve both causes deliberately without exposing raw private data.

**Evidence:** start/abort/drain sequence, effect counts and outcome identity. Use the chapter's focused worker/child exercises for CPU/process boundaries; a worker pool or thumbnail service is optional depth, not a prerequisite to this analyzer.

## N-05 — Meaningful tests and diagnosis

**Scope:** verify the previous increments with focused pure checks, real temporary-file/HTTP integration and one deliberately broken baseline. Use the existing project runner. For an Autocode task retain its Jest/build scripts and restricted test directory; place independent practice checks only in an authorized location.

**Acceptance:** an intentionally broken chunk parser, forgotten await or ignored failure makes a relevant check fail. Test a real open/read/write failure as well as adapter doubles. Diagnose one controlled event-loop stall using delay/utilization and a short CPU capture where justified; compare the same workload after bounding/removing the work. Diagnose an intentionally unclosed interval/server and remove the owner leak without forced successful exit.

**Failure cases:** test passes alone but not together, unobserved rejection, timer left running and misleading average latency. Define a small workload and retain latency/error/memory observations without claiming production gains.

**Evidence:** source revision, runtime/compiler/lock, actual commands and exit results, meaningful assertions and detected defect, safe diagnostic artifact and its limitations. Run every applicable build/test/coverage command and verify natural termination.

## N-06 — Shutdown and the continuation decision

**Scope:** mark the HTTP service unready, stop admission, drain or cancel bounded active analyses, release streams/files/clients, and finish before an external process deadline. Share one shutdown outcome across repeated calls. Test forced termination only in a disposable child process.

**Acceptance:** held work has an explicit completion/cancellation policy; new work is denied; resource close occurs after its last user; cleanup failure yields a nonzero outcome. A stuck owner reaches the final deadline rather than a fabricated successful exit. Inspector/profiling ports are never exposed publicly.

**Evidence:** shutdown sequence, readiness/admission observations, effect/output state, exit code and remaining handles. Explain which operations are request-bound and which would require durable jobs.

After this project, P-332 deepens runtime failures. Choose P-331 only when adding an authenticated Express/PostgreSQL service is the next learning goal. P-333 concerns a later deployed service; MongoDB, Redis, WebSocket, GraphQL, brokers and cloud platforms remain requirement-driven alternatives.
