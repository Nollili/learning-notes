---
outline: [2, 3]
---

# Five progressive Node.js learning projects

Build **one Learning Progress service in five stages**, following the five Tech Check sections. Each stage should leave you with a working version. Save that version as a Git tag or a copy in a separate folder before extending it in the next stage.

The application is deliberately simple: create study items, record sessions, mark work complete and export a progress report. **Spend your learning time on Node.js decisions**, rather than inventing complicated business rules.

| Milestone | You build | Main question it answers |
|---|---|---|
| [1. Node.js Foundations](#project-1-foundations-cli) | A dependency-free CLI and file-backed library | How does a Node program load modules, handle input/output and settings, and finish cleanly? |
| [2. Building Node.js Applications](#project-2-http-application) | A tested Express HTTP application with a basic browser UI | How do browser actions, HTTP requests, events, errors and tests work together? |
| [3. Designing Node.js Services](#project-3-deployable-service) | The same UI over a PostgreSQL-backed, authenticated, containerized service with a worker | How do architecture, data, concurrency and deployment decisions interact? |
| [4. Hardening and Optimizing](#project-4-hardened-service) | The same service with verified security, identity, performance and data hardening | How do you fix a demonstrated risk or bottleneck while preserving the promised behavior? |
| [5. Specialized Node.js Systems](#project-5-operated-specialized-service) | The same service with brokered work, live status and observable operations | How do you run, troubleshoot and extend a service with background work and specialist tools? |

Each stage has **four small build steps and one release check**. The stages build on each other. Finish the current step's build, tests and cleanup before moving on.

## One repository, five cumulative milestones

**Extend the same application in one repository.** Project 2 starts from the working Project 1 code; Project 3 starts from the working Project 2 code:

```text
Project 1: domain + application use cases + CLI + JSONL repository
                              │
                              ▼ retain all working behavior
Project 2: previous code + Express API + basic browser UI + deeper tests
                              │
                              ▼ retain API/UI/use cases and replace adapters deliberately
Project 3: previous code + PostgreSQL + identity + worker pool + deployment
                              │
                              ▼ retain behavior and improve measured risk
Project 4: previous code + security + advanced identity + performance/data hardening
                              │
                              ▼ retain behavior and add operational distribution
Project 5: previous code + broker + live status + logs/metrics/traces + specialist adapter
```

Tags let you return to each working version. Branch names are optional. **Begin each stage from the previous version that passed its release checks.**

```bash
# After Project 1 release checks pass
git tag project-1-foundations-cli
git switch -c project-2-http-application

# After Project 2 release checks pass
git tag project-2-http-application
git switch -c project-3-deployable-service

# After Project 3 release checks pass
git tag project-3-deployable-service
git switch -c project-4-hardened-service

git tag project-4-hardened-service
git switch -c project-5-operated-service
```

| Transition | Keep working | Change or add | Do not do |
|---|---|---|---|
| Project 1 → Project 2 | Domain rules, use cases, repository contract, JSONL adapter, CLI and their tests | Add Express as another inbound adapter, static UI as its client, in-memory test adapter and HTTP/browser tests | Copy business rules into routes or browser JavaScript; abandon the CLI |
| Project 2 → Project 3 | Domain/use cases, CLI, Express API contracts, browser UI, public error model and applicable tests | Add PostgreSQL/MikroORM adapter, identity/authorization, worker report adapter, Docker and deployment configuration | Rebuild the UI, rename every API without migration reason or let ORM entities become the HTTP/domain model |
| Project 3 → Project 4 | Every public behavior, database migration history, deployment path and regression test | Add controls and measurements around existing boundaries; change code only for a demonstrated risk/bottleneck | Call a scanner result proof of security, optimize without a baseline or duplicate the service in another framework |
| Project 4 → Project 5 | Hardened API/UI, identity, database, worker contract, telemetry vocabulary and release process | Replace local job dispatch with a broker adapter, add live status/observability and one specialist computation adapter | Claim exactly-once delivery, put user IDs in metric labels or adopt every broker/APM/native technology |

The JSONL repository remains the default in Project 2. In Project 3, PostgreSQL becomes the production default while JSONL can remain a small compatibility/test adapter until you deliberately retire it. **Replacing a storage adapter should preserve the business operation that uses it.** The new adapter must keep the results, errors and other behavior that operation expects.

### Cumulative behavior matrix

| Capability | Introduced in | How following projects evolve it |
|---|---|---|
| Domain rules and application use cases | Project 1 | Reused through Project 5; following controls stay outside the rules unless the domain changes |
| CLI and JSONL adapter | Project 1 | CLI stays working; JSONL is the Project 2 default and becomes an optional compatibility/test adapter from Project 3 |
| Express API and basic browser UI | Project 2 | Project 3 adds identity/jobs, Project 4 hardens/measures them and Project 5 adds live status |
| PostgreSQL/MikroORM | Project 3 | Project 4 diagnoses isolation/plans/locks; Project 5 adds outbox and idempotency state |
| Bounded worker execution | Project 3 | Project 4 profiles/hardens it; Project 5 runs it behind a broker consumer |
| Container and deployment | Project 3 | Project 4 hardens release evidence; Project 5 adds broker and telemetry operations |
| Security and performance evidence | Foundations in Project 3 | Project 4 makes it explicit/measured; Project 5 preserves it with regression checks |
| Logs, metrics and traces | Basic diagnostics in Projects 2–3 | Project 4 uses them for security/performance evidence; Project 5 adds operational dashboards/alerts |

## Working baseline and scope

A few terms used in the instructions:

- A use case is one application operation, such as completing a study item.
- An adapter connects that operation to something outside the business rules, such as HTTP, a file or a database.
- A contract describes the inputs, results, errors and other behavior callers can rely on.
- **Bounded work has explicit limits** on size, time or how many operations run at once.
- **Owning a resource means being responsible for closing it.** Owning an asynchronous operation means waiting for its outcome, handling errors and arranging cleanup.

- Use **Node.js 24 LTS** and ES Modules. The official Node 24 documentation showed v24.22.2 when this plan was checked on 2026-11-05; use the current supported patch in that release line rather than depending on a patch-specific accident.
- Use **plain JavaScript** for the cumulative application. The small NestJS companion uses the lesson’s compiled TypeScript setup for decorators; it does not require rewriting the main application in TypeScript.
- Use **Express 5** as the primary framework. NestJS remains part of Project 2: run its small read companion, then map the Express setup, routes and middleware to Nest modules, controllers, providers, guards, pipes, filters and interceptors. Reimplementing the whole service in both frameworks is not required.
- Use **semantic HTML, a small shared CSS file and vanilla browser JavaScript** for the Projects 2–3 UI. It should exercise the real HTTP API without adding React, a bundler or a second application architecture.
- Use **PostgreSQL with MikroORM 7** in Project 3. Write and inspect migrations; do not use schema synchronization as the deployment mechanism.
- Use a **container deployment as the primary operational path**. A serverless report handler is a bounded alternative, not a second complete platform.
- Keep all work in a new learning repository.

Suggested repository name: `node-learning-progress`.

```text
node-learning-progress/
├── src/
│   ├── domain/
│   ├── application/
│   ├── adapters/
│   ├── cli/
│   ├── http/
│   │   └── public/
│   └── workers/
├── migrations/
├── test/
│   ├── unit/
│   ├── integration/
│   └── contract/
├── docs/decisions/
├── deployment/
├── package.json
└── package-lock.json
```

You do not need every directory on day one. **Create a separate module when it has a clear job**, rather than copying the final folder structure before you need it.

## The learning method: build, break, explain, recall

Getting code to work once does not show that you will remember the decisions. For each build step, add a short entry to `docs/learning-log.md`:

1. **Build:** describe the behavior you added and the command that checks it.
2. **Why:** explain why you chose this Node API, module separation or pattern.
3. **Break:** deliberately cause one of the listed failures and record what you observe.
4. **Repair:** make a small, focused fix and rerun the check.
5. **Recall:** the next day, explain the decision without the notes. Then check what you forgot.

Use this compact decision template:

```md
## Decision: <short name>

- Context:
- Choice:
- Why this fits:
- Alternative not chosen:
- Failure I reproduced:
- Evidence after the repair:
- What would make me revisit this choice:
```

**Keep repeatable checks, not just a screenshot or a claim that it works.** Record the command, what you expected, what actually happened and one tested failure case.

<!-- tech-check-level: 1 -->

## Project 1 — Foundations CLI {#project-1-foundations-cli}

*Study depth: Foundational to intermediate*

Level Up: L1 — Junior\
Tech Check level: ⭐

The stars show this project's stage in the learning path. The linked lessons keep the source references for each individual topic.

### Outcome

Build `study-log`, a command-line application with no third-party packages. Store study items and sessions in a JSON Lines file: one JSON record per line, with new records added at the end. Print summaries and export a compressed report with a checksum for checking its bytes.

Example user flow:

```bash
node src/cli/main.mjs add --title "Event loop" --minutes 45
node src/cli/main.mjs start <item-id>
node src/cli/main.mjs finish <item-id> --note "Explained microtasks aloud"
node src/cli/main.mjs complete <item-id>
node src/cli/main.mjs list --status done
node src/cli/main.mjs report --output progress.jsonl.gz
```

The CLI uses only Node built-ins. **This lets you learn Node's APIs directly** before a framework manages some of the work.

### Starter CLI milestone {#starter-cli-milestone}

**Finish this small version first.** Build only `add --title "Read a file"` and `list`, storing an array of items in one small `study-items.json` file. An item needs only an ID and a nonblank title. Use `crypto.randomUUID()` for the ID.

Work in three steps:

1. Keep an array in memory. Write functions to add an item and return the list. Pass the title into the function; keep `process.argv` in the entry file.
2. Connect `add` and `list` to those functions. Print results to stdout and invalid-command/title messages to stderr. Set a nonzero exit code for invalid input.
3. Load the array with `readFile` and `JSON.parse`, then save changes with `writeFile` and `JSON.stringify`. If the file is missing (`ENOENT`), start with an empty array. Report other read errors and malformed JSON rather than overwriting them. Check that the loaded value is an array of items with string IDs and nonblank string titles.

Run from one learning folder with one process at a time. This version rewrites a small file; it does not provide concurrent updates or crash-safe storage. Keep important data elsewhere while learning.

Try this flow:

```sh
node src/cli/main.mjs add --title "Read a file"
node src/cli/main.mjs list
```

Stop and check that you can:

- [ ] Add an item, close the program and see it in a later `list` command.
- [ ] Reject a blank title without changing the saved file.
- [ ] Report malformed JSON without replacing it with an empty list.
- [ ] Explain the import, command-line arguments, `await`, JSON conversion and error path.

This is a useful first completion point. You do not yet need repository interfaces, event replay, streams, compression, checksums or signal handlers. The full increments below add those skills to the same application. When moving to JSONL, use a separate data file or deliberately migrate the starter records; an array file is not a JSONL event log. Keep a copy of the passing starter version before extending it.

### What you learn and why it belongs here

| Knowledge | Use in the project | Why it matters |
|---|---|---|
| Runtime, CLI and process | Parse arguments, read environment configuration, write stdout/stderr and set exit codes | A CLI has an input, output and lifecycle contract just like a server |
| Packages and modules | Define scripts/engines, keep a lockfile and separate domain, storage and CLI modules | Package metadata and module boundaries determine how code is loaded and released |
| Callbacks, promises and async/await | Use promise filesystem APIs; adapt one callback API once; propagate failures to the CLI boundary | The important question is which code waits for completion and handles failure |
| Files, paths, URLs and OS | Resolve an application data directory and validate an optional resource URL | Paths and permissions differ across systems; joining strings alone does not handle those differences |
| Buffer, streams, compression and crypto | Enforce byte limits, stream the report through gzip and calculate a SHA-256 digest | Whole-file convenience APIs are not suitable for every data size; integrity is not encryption |
| Timers, readline and console | Add a bounded confirmation prompt and a timeout-aware import | Open timers and interfaces can keep Node running; define how a prompt can be cancelled |
| Framework foundations | Record why the first milestone does not need Express | A small CLI can work well without a web framework; explain that choice |

### Project 1 handoff contract {#project-1-handoff-contract}

**The starter CLI is an intermediate checkpoint.** Complete all four increments and the release checks below before starting Project 2. The finished Foundations homework must provide the following behavior; build it a step at a time rather than implementing this entire contract at once.

<span class="notes-section-label">**Increment 1: items, sessions and transitions**</span>

A study item has `id`, `title`, `estimateMinutes`, `status`, `resourceUrl`, `createdAt`, `updatedAt` and `sessions`. Generate new item and session IDs with `crypto.randomUUID()`. Treat IDs as opaque, nonempty strings of at most 64 characters; do not derive a file path from an ID. Times are UTC ISO strings obtained from an injected clock. A test can supply a fixed clock and ID generator.

| Field | Required rule |
|---|---|
| `title` | Trim surrounding whitespace; retain 1–120 characters |
| `estimateMinutes` | Integer from 1 to 1,440 |
| `status` | `active` when added; `done` only after explicit completion |
| `resourceUrl` | `null` when omitted; otherwise a valid `https:` URL of at most 2,048 characters, without embedded username/password; store its normalized `href` |
| `sessions` | Initially empty; each session has `id`, `startedAt`, `finishedAt` and `note` |

A new session has `finishedAt: null` and `note: ''`. Finishing it sets a finish time no earlier than its start and a trimmed note of at most 1,000 characters. Completed sessions contribute `finishedAt - startedAt` milliseconds to reported study time. An unfinished session contributes zero; its running duration must not depend on when a report happens to be read.

| Operation | Allowed transition | Rejected case |
|---|---|---|
| Add item | Create an `active` item with no sessions | Invalid title, estimate or resource URL |
| Start session | Add one open session to an `active` item | Item is `done`, or already has an open session |
| Finish session | Finish that item's one open session | No open session exists |
| Complete item | Change `active` to `done` | An open session exists, or item is already `done` |

**Finishing a session does not complete the item.** A learner may study it several times before marking it done. Completed items remain readable; reopening, editing and deleting are outside Projects 1–2. Different items may each have an open session.

Expose `help`, `add`, `get`, `list`, `start`, `finish`, `complete`, `import` and `report` commands by the end of Project 1. `start`, `finish` and `complete` take an item ID. For example, finish the current session with `finish ITEM_ID --note "Practised file reads"`, then mark the item done with `complete ITEM_ID`.

<span class="notes-section-label">**Increments 1–2: reusable application operations**</span>

Export `createStudyApplication({ repository, clock, makeId })`, which returns the operations below, including `importEvents` and `createProgressReport`. Here `clock()` returns a UTC ISO timestamp string and `makeId()` returns a new ID; validate their returned values before recording an event. Each operation returns a promise. The CLI parses strings and calls them with checked JavaScript values. Project 2's controllers call the same operations. **Application operations must not read terminal arguments or write HTTP responses.**

| Operation | Input | Successful result |
|---|---|---|
| `addItem` | `{ title, estimateMinutes, resourceUrl? }` | The created item |
| `getItem` | `itemId` | The item, including its sessions |
| `listItems` | `{ status?, limit?, offset? }` (default `{}`) | `{ items, total, limit, offset }` |
| `startSession` | `itemId` | The newly opened session |
| `finishSession` | `itemId, { note? }` (default `{}`) | The finished session |
| `completeItem` | `itemId` | The completed item |

For `listItems`, omit `status` to include both states; otherwise accept only `active` or `done`. Implement pagination in Project 1: `limit` defaults to 20 and must be an integer from 1 to 100; `offset` defaults to 0 and must be a nonnegative safe integer. Filter first, retain item-creation event order, then slice. `total` counts all matching items before slicing; an offset past the end returns an empty `items` array. Support matching `--status`, `--limit` and `--offset` CLI options. Do not add cursor pagination at this stage.

Use stable `.code` values on errors. `INVALID_INPUT` means a supplied argument failed validation; `ITEM_NOT_FOUND` means a valid ID has no item; `STATE_CONFLICT` means a requested transition is unavailable. Storage failures are `STORAGE_INVALID` for malformed/inconsistent stored records and `STORAGE_UNAVAILABLE` for a failed I/O operation. Cancellation uses `OPERATION_ABORTED`. Missing items reject in application operations; they do not return a successful empty result. An unexpected programming error remains an unexpected error, rather than being relabeled as invalid input.

Retain underlying I/O errors in `cause`, and add a line number to invalid-storage/import errors without including raw file contents. A malformed import is `INVALID_INPUT`; an import that conflicts with existing state is `STATE_CONFLICT`; malformed existing storage is `STORAGE_INVALID`. The CLI prints a useful message to stderr and uses a nonzero exit code. Project 2 maps invalid input to 400, missing items to 404, state conflicts to 409 and unexpected/storage failures to a fixed safe 500 response. Startup failures occur before accepting HTTP requests.

<span class="notes-section-label">**Increment 2: repository and JSONL records**</span>

Here, “interface” means a documented JavaScript object contract; **no TypeScript interface is required**. Construct one `StudyItemRepository` per running application, using a configured data directory. It exposes:

| Repository method | Contract |
|---|---|
| `findById(itemId)` | Resolve with a reconstructed item or `null` when absent |
| `list({ status } = {})` | Resolve with all matching reconstructed items in creation order; pagination belongs to `listItems` |
| `append(event)` | Validate and append one event, resolve with `undefined` only after the write completes; reject duplicate IDs and impossible transitions |
| `appendBatch(events, { signal } = {})` | Check the entire candidate against a temporary replay state before writing; then append in order and resolve with `undefined`. A validation failure writes nothing; an I/O failure may leave a prefix |
| `close()` | Finish pending owned work and close opened handles; repeated calls are safe; reject new work once closing starts |

Returned item/session objects must not expose mutable repository state. A missing log means an empty repository; a missing configured directory may be created at startup. Permissions errors and damaged data must not be treated as empty storage. All methods are asynchronous, including `close()`. `append` and `appendBatch` share the same event validation: malformed candidate events reject with `INVALID_INPUT`, duplicate IDs/impossible transitions with `STATE_CONFLICT`; invalid records found while opening an existing log reject with `STORAGE_INVALID`.

Use a single `events.jsonl` file with one version-1 event per UTF-8 line and a newline after each record. Each event contains `version`, `eventId`, `type`, `itemId`, `at` and `data`. `eventId` is unique across the log. New event IDs use the injected UUID generator. `at` is the operation's timestamp; event order in the file is authoritative, and times for an item must not move backward.

| Event type | `data` fields | Replay effect |
|---|---|---|
| `item-added` | `title`, `estimateMinutes`, `resourceUrl` | Create the item; set `createdAt` and `updatedAt` to `at` |
| `session-started` | `sessionId` | Add an open session with `startedAt: at`; update the item timestamp |
| `session-finished` | `sessionId`, `note` | Finish the matching open session at `at`; update the item timestamp |
| `item-completed` | `{}` | Set status to `done`; update the item timestamp |

For example, these are four consecutive records for one item. The short IDs are valid illustrative imported IDs; newly generated IDs use UUIDs.

```jsonl
{"version":1,"eventId":"e1","type":"item-added","itemId":"item-1","at":"2026-11-23T09:00:00.000Z","data":{"title":"File reads","estimateMinutes":30,"resourceUrl":null}}
{"version":1,"eventId":"e2","type":"session-started","itemId":"item-1","at":"2026-11-23T09:05:00.000Z","data":{"sessionId":"session-1"}}
{"version":1,"eventId":"e3","type":"session-finished","itemId":"item-1","at":"2026-11-23T09:25:00.000Z","data":{"sessionId":"session-1","note":"Practised readFile"}}
{"version":1,"eventId":"e4","type":"item-completed","itemId":"item-1","at":"2026-11-23T09:26:00.000Z","data":{}}
```

Replay validates field names/types, supported version/type, unique event IDs, unique item/session IDs, references and the transition rules above. Reuse the same pure transition function when checking new events and replaying stored ones. Reject unknown fields, blank records and a nonempty final line without its terminating newline. A single final newline is the terminator, not an extra blank record. Stop on the first invalid record and report its one-based line number. Do not silently skip or repair it.

Serialize each complete read → validate → append operation through one application-owned queue, including imports. Reads/reports take their snapshot between mutations; one `list` or report must not mix states from different points in a mutation. The JSONL adapter can keep reconstructed state in memory and update it only after a successful append. `appendBatch` checks cancellation before each record and waits for any write already started before returning; cancellation does not undo committed records. If a write fails after possibly writing partial bytes, stop further mutations and require reopening/validating the log. **Projects 1–2 support one owning process at a time.** Do not run the CLI and HTTP server simultaneously against this file. A second writer is an unsupported failure drill, not a promised concurrency guarantee.

<span class="notes-section-label">**Increment 3: bounded import and report contract**</span>

Document numeric limits in configuration and test them. Use these learning defaults: 16 KiB per encoded event line (including newline), 1,000 events and 1 MiB total per import, and 10,000 events / 10 MiB for the stored log. Reject an append/import that would exceed the log limits. Limit incoming bytes before retaining an entire oversized line; a check after `readline` has already assembled that line is insufficient.

`importEvents({ inputPath, signal })` imports an ordered suffix of version-1 events using the same replay rules. Read and structurally validate the whole bounded candidate, then call `repository.appendBatch(events, { signal })`. The repository checks it against a temporary copy of its current replay state, including previously seen event IDs, before appending anything. Reject duplicates, including reimporting previously accepted events; do not silently deduplicate. A valid import resolves with `{ importedEvents }`. Validation failure leaves storage unchanged. An I/O failure or cancellation during append may leave a committed prefix or a damaged final line: report failure, stop writes and reopen/validate before continuing. This file adapter does not promise transactional import or rollback.

Export `createProgressReport({ signal } = {})` from the application layer. It resolves with a **fresh gzip-readable stream from one consistent item snapshot**. Consumption must propagate errors and cancellation through the serializer and compression stages; cancellation destroys the owned stages. The application owns no HTTP response or output filename. Both the CLI and Project 2 consume this same report stream with `pipeline()`.

After decompression, the report is UTF-8 JSONL with one row per item, in creation order, including both statuses. A row has exactly `id`, `title`, `estimateMinutes`, `status`, `completedSessions` and `studiedMilliseconds`. Empty storage produces a valid gzip stream whose decompressed content is empty. For the four-event example above, the report contains:

```jsonl
{"id":"item-1","title":"File reads","estimateMinutes":30,"status":"done","completedSessions":1,"studiedMilliseconds":1200000}
```

The report is a summary, not the event log, and **must not be passed to `importEvents`**. Session notes and resource URLs stay out of this report. Do not promise identical compressed bytes across runtime versions; verify the checksum of the actual bytes produced.

The CLI's `report --output PATH` writes the gzip stream to a temporary sibling file while counting and hashing the compressed bytes with SHA-256. Await the complete pipeline, then rename the temporary file to publish it. On success, print one JSON record to stdout: `{ "path": "progress.jsonl.gz", "bytes": 123, "sha256": "<64 lowercase hex characters>" }`, using the actual path, byte count and digest. The checksum is returned in this metadata; no separate checksum sidecar is required. On failure, remove the temporary file and leave a previous successful report intact. This promises publication after successful processing, not crash durability on every filesystem.

In Project 2, `GET /reports/progress` serves the same gzip bytes as a download with `Content-Type: application/gzip` and `Content-Disposition: attachment; filename="progress.jsonl.gz"`. Do not set `Content-Encoding: gzip` for this file-download contract. Stop the report stream if the client disconnects; failures after response headers are sent cannot be replaced by a new JSON error response. The first HTTP implementation does not need to advertise a checksum before the stream finishes.

### Increment 1 — executable package and pure domain {#increment-1-—-executable-package-and-pure-domain}

Create `package.json` with a Node engine requirement and `start`, `test` and `check` scripts. Add a `StudyItem` function for the business rules: check the title, positive estimate in minutes and allowed state. Generate IDs with `crypto.randomUUID()`. Pass a clock into operations that need time so tests can supply a predictable value.

At this first increment, support `help`, `add` and `list`; add `get`, `start`, `finish` and `complete` with persistence in Increment 2. Keep parsing in the CLI adapter; **business-rule functions must not read `process.argv`, environment variables or files directly**. Pass the values they need as arguments.

Failure drill: pass an unknown command, a blank title and a non-integer duration. The program must write a useful message to stderr, set a nonzero exit code and avoid creating a partial record.

### Increment 2 — owned asynchronous persistence {#increment-2-—-owned-asynchronous-persistence}

Implement the JavaScript `StudyItemRepository` contract in the [handoff specification](#project-1-handoff-contract). Implement it with JSONL using `node:fs/promises`, `node:path` and a configured data directory. Rebuild the current state by reading and applying the four validated event types specified above in order.

Use only one writing process at this stage. Document that `appendFile` does not provide database transactions across processes. Reject invalid or oversized lines and report the line number. Do not silently skip damaged data.

Failure drill: remove directory permission, truncate the last line and run two writers intentionally. Record which failures the implementation detects and which concurrency guarantee it **does not** provide.

### Increment 3 — bounded import and streaming export {#increment-3-—-bounded-import-and-streaming-export}

Add `import` and `report` commands. Read imported JSONL through `readline`, with limits on bytes per line, item count and total bytes. Stream the export through gzip and calculate a SHA-256 checksum of the published bytes. Write to a temporary file and rename it only after the pipeline succeeds.

Validate optional `https:` resource links with `URL`. A syntactically valid URL is not authorization to fetch it; Project 1 stores the link but performs no outbound request.

Failure drill: exceed each bound, cancel during import and make the output path unwritable. A failed export must not replace the last successful report.

### Increment 4 — lifecycle, diagnostics and release contract {#increment-4-—-lifecycle-diagnostics-and-release-contract}

Handle shutdown signals only in the program's main setup code, often called the composition root. Stop accepting new interactive work, give the active operation a deadline to finish, then set the exit code. Close every timer, readline interface and file handle your program opened so it can exit.

Create smoke tests with `node:test` for a successful command, invalid input, corrupted storage and an interrupted export. Test the domain without spawning a process; use one process-level test for the real CLI contract.

Failure drill: leave a timer or readline interface open, observe the hanging test/process, diagnose the active owner and fix the cleanup in `finally`.

### Project 1 release check {#project-1-release-check}

**All four increments are required for the Project 2 handoff.** The starter CLI alone is not the completed homework. Project 1 is releasable when all of these are true:

- [ ] A clean checkout installs reproducibly and `npm run check && npm test` exits successfully.
- [ ] Add/get/list/start/finish/complete work against an owned temporary data directory; invalid input leaves no partial event.
- [ ] A deterministic test covers add → start → finish → complete, reopens the repository and recovers the same item/session state. Finishing alone leaves the item active.
- [ ] Invalid transitions, missing IDs, duplicate events and invalid stored records produce the documented error codes. A failed validation leaves the log unchanged.
- [ ] List filtering, creation order, defaults and pagination boundaries match the shared application contract; returned objects cannot mutate stored state.
- [ ] The same application operations pass through a repository contract suite that Project 2 can also run against its in-memory adapter.
- [ ] Import limits and corrupt-line errors include useful context without leaking file contents unnecessarily.
- [ ] A compressed report can be read back through gunzip, matches the specified row fields/counts/durations, and handles empty storage. Its stdout byte count and SHA-256 match the published file; a failed export leaves the previous report intact.
- [ ] A second consumer can request a fresh report stream without using CLI parsing or an output filename; cancellation stops the stream and releases its resources.
- [ ] SIGINT during an owned operation exits within the documented deadline and leaves no open handles.
- [ ] You can explain from memory: Node versus V8, sync versus async I/O, promise ownership, ESM loading, stream backpressure and why a framework was not needed.

Save this state as the **`project-1-foundations-cli`** release or tag before continuing. Include the source, lockfile, tests, documented configuration/commands and a short contract note linking the operations, event schema and report schema. Keep generated data/reports in an ignored learning-data directory; tests create their own fixtures.

Project 2 starts from this release. It adds HTTP/UI adapters and an in-memory test repository; it does not redesign the item lifecycle, replace the event schema or duplicate the report generator.

<!-- tech-check-level: 2 -->

## Project 2 — HTTP application {#project-2-http-application}

*Study depth: Intermediate*

Level Up: L2 — Software Engineer\
Tech Check level: ⭐⭐

The stars show this project's stage in the learning path. The linked lessons keep the source references for each individual topic.

### Outcome

Start from the passing `project-1-foundations-cli` version, including the complete [Project 1 handoff contract](#project-1-handoff-contract), and **extend the existing application**. Keep its business rules, operations, storage interface, JSONL implementation and CLI working. Add Express 5 to expose the same operations over HTTP and stream the existing report. Define error handling and tests. Serve a **small browser UI from the same origin** using `src/http/public/`; it should exercise this API without becoming a separate frontend project.

```text
POST   /items
GET    /items?status=active&limit=20
GET    /items/:id
POST   /items/:id/sessions
PATCH  /items/:id/complete
GET    /reports/progress
GET    /health/live
GET    /health/ready
```

The CLI remains usable. **The CLI and HTTP API use the same business operations.** This checks that the business rules do not depend on terminal input.

Use the Project 1 item fields and pagination envelope unchanged. `POST /items` calls `addItem`; collection/item GETs call `listItems`/`getItem`; `PATCH /items/:id/complete` accepts an empty JSON object and calls `completeItem`. For `POST /items/:id/sessions`, accept `{ "action": "start" }` or `{ "action": "finish", "note": "..." }` and call the corresponding session operation. Reject other actions/fields. Return the operation result as JSON: 201 for item/session creation and 200 for reads, session finish and item completion. Parse numeric query strings before calling `listItems` and use the specified error-code mapping. The report endpoint uses `createProgressReport` and the download headers defined in the handoff contract.

The JSONL adapter still has one owning process: stop the HTTP server before using the standalone CLI against the same data directory. Supporting simultaneous writers is a later storage change.

The page needs only:

```text
┌──────────────────────────────────────────────────────┐
│ Learning Progress                      API: ready    │
├──────────────────────────────────────────────────────┤
│ New item [title________________] [minutes__] [Add]   │
│ Filter: [All | Active | Done]        [Download report]│
│                                                      │
│ □ Event loop             45 min      [Start] [Done]  │
│ ✓ Modules                30 min              done    │
│                                                      │
│ Status and errors (aria-live)                        │
└──────────────────────────────────────────────────────┘
```

Use a real `<form>`, labeled controls, buttons, a list/table appropriate to the content, visible focus, an `aria-live` status region and a layout that becomes one column on a narrow screen. Do not add charts, client-side routing, drag-and-drop, animation or a component library unless a concrete requirement justifies one.

### First HTTP milestone {#first-http-milestone}

**Keep the full Project 1 release as your starting point.** This checkpoint makes the first Project 2 increment smaller; it does not replace the Foundations handoff or any later Project 2 release check.

1. Create an importable Express app and a separate server entry. Inject the existing `createStudyApplication` result; do not move file parsing or domain rules into routes.
2. Implement only `POST /items` and `GET /items`, preserving the handoff's input fields, list envelope, status codes and error codes. Use a bounded JSON parser and one final error handler. The file repository remains the local default, with one owning process.
3. Add two HTTP tests: create a valid item through the real app, then list it and check the returned fields; submit a blank title and prove the error response leaves storage unchanged. Use a fresh temporary data directory and close resources after each test. Keep the existing CLI/domain tests passing.
4. Run the [small NestJS read API](./16-frameworks.md#nest-starter) and compare its controller/provider/module wiring with Express. Add one HTTP check for its list response and close the app afterward. This is a small framework companion, not a second implementation of the full homework.

You have reached this checkpoint when a request can add an item, a later request can list it, invalid input cannot change the log, both frameworks' request paths can be explained, and every test exits. **Now extend the same application** with the UI, remaining routes, reporting and the networking/lifecycle drills below. The full increments add these concerns one at a time.

### What you learn and why it belongs here

| Knowledge | Use in the project | Why it matters |
|---|---|---|
| Events and event loop | Observe request lifetime, delay and aborted responses; keep CPU work bounded | Async handlers still execute JavaScript on an event-loop thread |
| Networking | Use HTTP methods/status/headers, DNS/TLS-aware outbound client policy and streamed bodies | An API contract includes protocol behavior, not only JSON shapes |
| Browser/API integration | Submit forms with `fetch`, render returned state, cancel stale requests and download the streamed report | A UI makes request lifetime, validation and public error contracts observable |
| Development workflow | Separate build/check/test/start, use inspector and source evidence, verify shutdown | Troubleshooting should use commands and steps you can repeat |
| Errors | Translate domain/input/not-found/conflict/dependency failures once | Clients need stable public errors; logs need richer private causes |
| Testing | Unit, HTTP integration, contract and one bounded load observation | Use different test scopes for different risks; coverage alone does not prove correctness |
| Frameworks | Express routing/middleware/composition; map concepts to NestJS | Keep framework-specific code separate from business rules |
| Patterns | Use only patterns that solve an observed variation or workflow | Use a pattern to solve a real problem, not to tick off its name |

### Increment 1 — Express boundary over the existing application {#increment-1-—-express-boundary-over-the-existing-application}

Create `createApp(dependencies)` separately from `listen()`. Add JSON body limits, route-specific validation and a consistent response schema. Routes call application use cases; they do not parse the JSONL file themselves.

Serve `index.html`, `styles.css` and `app.js` as static files. The initial UI loads the item list, submits the add-item form, filters by status and displays an actionable error without replacing the whole page. Keep DOM rendering in two or three small functions; use `textContent`, not HTML assembled from API strings.

Use the repository contract from Project 1. Add an in-memory implementation for tests and retain the file implementation for local execution. This is a Strategy/Adapter boundary only if it actually permits the application to use either implementation without transport changes.

Failure drill: occupy the configured port, send invalid or oversized JSON and request an unknown item. Check which code handles startup failure, and verify the distinct 400, 404 and 413 responses. Return an item title containing HTML-like text and prove the UI displays text rather than executing markup.

### Increment 2 — request lifetime, events and networking {#increment-2-—-request-lifetime-events-and-networking}

Add a request ID and a structured event recording completion and elapsed time. If you use `EventEmitter`, define how listener failures are handled; do not hide required business operations inside notifications. Stream the report with `pipeline()` and stop its source work when the client disconnects.

Add one metadata client that calls a local fake HTTPS service or your own test server. Limit its total time and response size, and configure the expected content type and allowed destination. Explain address lookup (DNS), certificate identity (TLS) and HTTP status separately. Keep certificate verification enabled in the test.

In the browser, use `AbortController` to cancel a superseded list request and to stop a report request when the user cancels it. Disable only the control whose operation is in flight; keep a failure visible and retryable. Download the report through the API rather than duplicating its construction in browser code.

Failure drill: delay the dependency, abort the client, emit a listener error and run a short synchronous CPU loop in one handler. Observe which symptom is dependency wait, cancellation, event ownership or event-loop blocking.

### Increment 3 — errors, tests and developer workflow {#increment-3-—-errors-tests-and-developer-workflow}

Define business and application errors with stable public codes, keeping original errors in `cause`. Use one final Express error middleware to translate expected failures and hide unexpected internal details. Express 5 forwards rejected handler promises to that middleware; code must separately handle failures from background work.

Use Jest and Supertest for the same baseline as the existing testing notes. Add:

- unit tests for domain decisions and repository-independent use cases;
- HTTP integration tests through the real Express app;
- a contract test for the report and error schemas;
- one real file-repository test in an owned temporary directory;
- one browser smoke test covering add → visible in list → complete → filtered as done;
- a bounded concurrency observation that records latency and failures without claiming production capacity.

Failure drill: start a rejecting promise in an async route without returning or awaiting it. Observe what happens, then restore the code that waits for it and handles failure. Deliberately break one promised behavior and check that the relevant test fails.

### Increment 4 — deliberate patterns and framework comparison {#increment-4-—-deliberate-patterns-and-framework-comparison}

Refactor when the earlier steps reveal a concrete need. These patterns may fit:

- <span class="notes-section-label">**Factory/composition root:**</span> create and connect production or test dependencies in one setup location;
- <span class="notes-section-label">**Repository/Adapter:**</span> keep storage details separate from business operations;
- <span class="notes-section-label">**Strategy:**</span> select report formatting without repeating choices in every route;
- <span class="notes-section-label">**Observer:**</span> send an optional completion notification with defined error handling.

Write `docs/decisions/framework.md` comparing the current Express implementation with NestJS. Map route → controller, dependency construction → provider/module, validation middleware → pipe, authorization middleware → guard and error middleware → exception filter. **Do not port the application merely to demonstrate the vocabulary.**

Failure drill: identify a pattern that would add extra layers without solving a current problem. Record why you rejected it. Knowing when a pattern is unnecessary is part of understanding it.

### Project 2 release check {#project-2-release-check}

- [ ] All Project 1 release checks still pass without duplicated domain rules.
- [ ] The CLI and HTTP adapters pass the same application-level behavior tests. One shared repository contract suite passes against both JSONL and in-memory adapters, ready to run against PostgreSQL.
- [ ] Every route has a documented success contract and relevant 4xx/5xx contract; unexpected stack traces never enter responses.
- [ ] The basic UI can add, list, filter, complete and download; keyboard focus, labels, narrow layout and the live status/error message remain usable.
- [ ] API-provided HTML-like text is rendered as text, and the browser smoke test covers the main user path against the real Express application.
- [ ] A disconnected report request cancels owned upstream work and all tests/servers close.
- [ ] Unit, HTTP integration, contract and real-adapter tests catch different deliberate failures; coverage exclusions are explained.
- [ ] The bounded load run records environment, concurrency, latency distribution and error count without calling the result production capacity.
- [ ] You can trace one request from socket/framework through validation, use case, repository, event and response, including who owns every rejection.
- [ ] You can explain why each retained pattern exists, run/test the small NestJS companion, and map its controllers/providers/modules and later request hooks to the Express implementation without duplicating the whole service.

Save this complete state as the **`project-2-http-application`** release or tag. Keep the shared JSONL/in-memory repository contract suite and recorded API/report contracts ready for the [Project 3 handoff](#project-2-to-project-3-handoff).

<!-- tech-check-level: 3 -->

## Project 3 — Deployable service {#project-3-deployable-service}

*Study depth: Intermediate*

Level Up: L3 — Senior\
Tech Check level: ⭐⭐⭐

The stars show this project's stage in the learning path. The linked lessons keep the source references for each individual topic.

### Outcome

Start from the passing `project-2-http-application` version and **keep the existing API and UI working**. Preserve business rules, application operations, CLI, routes, public responses and applicable tests. Replace production storage with PostgreSQL/MikroORM. Verify user identity and enforce item ownership. Run a CPU-heavy report calculation through a worker pool with fixed limits, behind the existing report operation. Package the whole service for controlled deployment. The UI shows the current user, only that user's items and report progress; **keep it simple**.

Project 3 is still one service. **A worker, a database and a container do not automatically make it a microservice system.** Keep the deployment simple enough that you can reason about failure and recovery.

### Project 2 → Project 3 handoff contract {#project-2-to-project-3-handoff}

**Start from the complete `project-2-http-application` release.** The first HTTP milestone is an intermediate checkpoint. Before changing storage or adding identity, retain a passing baseline containing the CLI, JSONL and in-memory adapters, full Express API, basic browser UI, report generator, tests and the small NestJS companion. Keep NestJS's runnable example and checks; Project 3 does not require a second full implementation of the service.

<span class="notes-section-label">**What stays stable, and what changes**</span>

| Keep from Projects 1–2 | Introduce deliberately in Project 3 |
|---|---|
| Item/session fields, validation and transitions | Trusted user identity and owner-scoped access |
| Application operation names and successful results | An authorization wrapper and a PostgreSQL repository |
| Item/session HTTP routes, status codes and list envelope | Authentication/permission failures at protected boundaries |
| Gzip report row schema and existing download route | Additional asynchronous report-job routes and worker execution |
| CLI commands, basic UI and contract tests | Verified CLI identity, sign-in/status UI and database-backed fixtures |

<span class="notes-section-label">**Completion keeps the existing business rule**</span>

`finishSession` ends a session; `completeItem` marks an item done only when it has no open session. **Completion must not silently finish an open session.** An item with an open session still produces `STATE_CONFLICT` / HTTP 409. Do not combine the two commands or change the existing session endpoint.

In PostgreSQL, validate and save each operation in one transaction. Finishing a session updates the session and the item’s timestamp together. Completing an item checks current state and updates its status/timestamp together. Lock the item or use an equivalent concurrency check. When two completions overlap, one succeeds and the other returns `STATE_CONFLICT`. If a transaction fails, neither item nor session state changes.

<span class="notes-section-label">**The repository can change without rewriting callers**</span>

Before finishing Project 2, write one shared contract test suite for `findById`, `list`, `append`, `appendBatch` and `close`. Run it against fresh JSONL and in-memory repositories. Check replayed state, ordering, independent returned objects, missing items, duplicate events and invalid transitions. Verify that validation happens before writes. In Project 3, run the same checks against PostgreSQL before making it the default. Separately test each adapter’s failure guarantees: JSONL may leave partial I/O writes, while PostgreSQL can roll back a transaction.

The SQL adapter returns the same items and sessions from relational rows. Save processed event IDs in a table created by a migration, so duplicate detection still works after restart. The ORM identity map is not a persistent event record. Save each event ID and its state changes in the same transaction. PostgreSQL validates and commits `appendBatch` as one transaction, giving a stronger failure guarantee than JSONL. The file adapter still allows only one owning process; adding SQL does not make concurrent JSONL writers safe.

<span class="notes-section-label">**Existing data gets an explicit owner**</span>

Project 2 data has no user identity. Write a one-time migration command that accepts the Project 2 log and an existing destination user ID chosen by the operator. Keep the original log as a backup. Replay and validate it, then transfer items, sessions, timestamps and processed event IDs under that owner. Preserve item/session IDs and report totals. Reject invalid records, unknown users and ID collisions. Do not assign old data to whoever signs in first. Save the source digest and migration result so repeating the command cannot create duplicates.

This learning dataset has explicit size limits. Transfer it and save its migration record in one transaction. A failure leaves the destination unchanged. This administrator-controlled migration is separate from normal `importEvents`. Later imports use the verified caller as owner, never an owner field inside the imported file. Test two users: only the selected owner can see migrated items, sessions and report data.

<span class="notes-section-label">**HTTP and CLI supply the same trusted identity**</span>

Wrap the existing application operations with permission checks. Supply verified `{ userId, permissions }` from the HTTP or CLI entry point. Give that wrapper a repository restricted to the owner. Every lookup, list, write and report snapshot must apply the restriction. Do not add caller identity to item request bodies or public report rows. Domain rules do not parse tokens, cookies or HTTP requests.

For HTTP, use the verified bearer token or same-origin session from Increment 2. For the standalone CLI, read `STUDY_ACCESS_TOKEN` and verify the same issuer, audience, key and expiry rules. Build the same trusted caller information. Never put the token in command arguments, logs or reports. A local test issuer may provide credentials, but an arbitrary `--owner` argument must not grant access. Project 3 requires identity by default. Update old unauthenticated tests explicitly; do not keep a hidden authentication bypass.

Missing/invalid authentication returns HTTP 401, insufficient operation permission returns 403, and another owner's item/job returns the same 404 as an absent one. CLI equivalents fail with a nonzero exit code. Preserve the existing invalid-input, state-conflict and safe unexpected-error responses. Reuse the Project 2 success tests with a verified test caller, then add denial tests. An owner's ID in SQL rows is internal data, not a new caller-controlled item property.

<span class="notes-section-label">**Keep downloads and add report jobs separately**</span>

**`GET /reports/progress` stays a gzip download.** It includes only the caller’s items and keeps Project 1’s six fields and download headers. Keep `createProgressReport` and its tests. Add report jobs separately; do not change this GET to return JSON job data. Both paths use the same snapshot, calculation and serialization rules. A worker changes where the calculation runs, not the report’s meaning.

| New route | Result |
|---|---|
| `POST /report-jobs` with `{}` | 202 and `{ id, status: 'queued' }`; `Location` points to the status route |
| `GET /report-jobs/:id` | 200 and `{ id, status, errorCode }`; `errorCode` is `REPORT_FAILED` only for a failed job, otherwise `null` |
| `POST /report-jobs/:id/cancel` with `{}` | 200 and the same status shape, after cancellation has reached its final outcome |
| `GET /report-jobs/:id/download` | 200 gzip download only when the job is `completed`; otherwise 409 with `STATE_CONFLICT` |

Jobs move from `queued` to `running`, then to one final state: `completed`, `failed` or `cancelled`. A queued job may also go directly to `cancelled` or `failed`. Save status and ownership in PostgreSQL. Expose only fixed public error codes. Require `report:run` and check ownership for every status, cancellation and download request. If the queue cannot accept work, return 503 with `REPORT_BUSY` and do not create an accepted job.

A cancellation request removes queued work or asks running work to stop within a documented deadline. If completion happens first, return `completed`; do not mark an already published artifact cancelled. Cancelling a job already in a final state returns that state. Poll the status at a finite interval and stop at a final state, a deadline or navigation. Closing a poll does not cancel the job; call the cancellation route. Closing a direct download still stops that request’s stream.

Take a consistent snapshot of the owner’s items when the worker starts. Publish the artifact before setting `completed`. Failed/cancelled jobs must not expose a partial download. Save its digest and byte count for verification.

Project 3 has one report-job scheduler process, even if several HTTP/CLI clients use the database. A worker crash fails its affected jobs. On scheduler restart, mark its previous unfinished jobs failed and remove their temporary files. Automatic persistent requeueing comes later in the broker stage.

Keep artifacts on storage that survives process restart. Default retention is 24 hours; test expiry with an injected clock. An expired completed artifact returns 410 with `REPORT_EXPIRED`. Status requests still check ownership.

<span class="notes-section-label">**The release record proves the transition**</span>

In `docs/decisions/project-3-handoff.md`, record the starting Project 2 tag, preserved contracts, identity changes, data migration and rollback limits. Include commands for repository tests, authenticated API/UI/CLI checks, concurrent transactions, repeated-migration rejection and report/job tests. After PostgreSQL receives new writes, the old JSONL file no longer contains current data. A rollback must keep database compatibility or explicitly migrate data back. Use the release names `project-2-http-application` and `project-3-deployable-service` consistently.


### Project 3 checkpoint levels {#project-3-checkpoint-levels}

**The required Project 3 release is a local service plus a deployment design.** Complete the PostgreSQL migration, verified identity, worker-report behavior, container/UI checks and local scheduled-adapter integration from the release checklist. Run the real local database and container tests; a design document alone does not satisfy those implementation checks.

| Checkpoint | Required evidence | Completion claim |
|---|---|---|
| Local/design — required | Passing local application/repository/auth/worker tests; running Compose API/database/UI; migration/rollback record; bounded report and scheduled-adapter checks; reviewed AWS identity/network/storage/cost plan | Project 3 local/design release complete; cloud execution not assessed |
| Live cloud — separate extension | Authorized sandbox deployment of that reviewed release; positive/negative access checks; observed readiness, replacement/recovery, costs and resource cleanup | Live cloud checkpoint executed, with recorded limits |

For the local/design checkpoint, use the existing AWS template and prerequisites as a plan to inspect. Record which resources you would need, who can access them, how secrets/artifacts are supplied, and how migration, restore, rollback and cleanup would work. Do not mark a live-cloud exercise complete because its template parsed or its code ran locally. VM snapshots, actual S3 access tests, provider authorizers and cloud rollout/recovery remain live exercises until executed.

The serverless HTTP/SQS examples show other trigger types. Project 3 requires the local scheduled-report adapter to call the same report operation. Test duplicate occurrences with real persistent receipt records and output storage. If this guarantee is incomplete, record the limitation and observed behavior as the release checklist requires. A passing stub test is not proof. Broker deployment, saga recovery, Kubernetes and advanced identity/isolation exercises are later extensions.


### What you learn and why it belongs here

| Knowledge | Use in the project | Why it matters |
|---|---|---|
| Concurrency | Bounded worker pool for a measured CPU-heavy report; copy/transfer policy and cancellation | Workers need limits on queued work and clear startup, failure and shutdown handling |
| Architecture | Domain/application/adapters plus one composition root and dependency direction | Clear interfaces let you replace HTTP, storage or framework code when a requirement calls for it |
| Authentication/authorization | Verify a signed token, derive a principal and enforce resource ownership in use cases/queries | Authentication identifies; authorization decides each operation |
| Authenticated UI boundary | Keep production tokens out of persistent browser storage; use a same-origin session/BFF boundary or a deliberately isolated development identity adapter | A basic UI still needs an explicit browser threat and session model |
| Relational database/ORM | Constraints, indexes, transactions, migrations, pooling and query inspection | The database must also enforce rules that must survive restarts and concurrent writes |
| Docker | Reproducible non-root image, Compose integration, health and graceful stop | Deployment changes filesystem, network, signals and resource limits |
| Cloud and deployment | One container target, managed database design, release/rollback evidence | An image starting successfully does not prove the release and recovery process is safe |
| Serverless | Extract one scheduled-report handler and compare constraints | Serverless is a deployment/execution model, not a reason to rewrite every route |

### Increment 1 — architecture and relational data {#increment-1-—-architecture-and-relational-data}

Put application operations in `application/`, business rules in `domain/` and external-system implementations in `adapters/`. Keep Express and the CLI as entry points to the same operations. Business code should not depend on those entry points. The main setup code creates and connects the actual implementations.

Model `users`, `study_items` and `study_sessions` in PostgreSQL. Add primary/foreign keys, check constraints, uniqueness rules and indexes for owner/tenant queries. Create a reviewed MikroORM migration and a separate test database. Follow the [handoff transaction rules](#project-2-to-project-3-handoff): finishing a session and completing an item remain separate operations. Validate and save each atomically. Completion still rejects an open session.

Failure drill: violate each database constraint, race two completion requests and force a statement timeout. Observe the real database/ORM error, rollback behavior and public error mapping. Inspect a representative query with `EXPLAIN (ANALYZE, BUFFERS)` only on owned test data.

### Increment 2 — identity and authorization {#increment-2-—-identity-and-authorization}

Use a local test issuer to create signed access tokens. Include who issued the token, its intended recipient, the user's ID, expiry and a stable key ID. Verify the allowed algorithm and trusted keys; decoding alone is not verification. Build trusted caller information at the HTTP entry point and pass it into application operations.

Restrict every read and write to the trusted caller's owner or tenant ID. Add a small permission policy for `item:read`, `item:write` and `report:run`. Keep authentication middleware thin: **the use case or repository query must not trust an item owner supplied by the request body**.

For the local UI, add a development-only test sign-in adapter that exchanges a local test identity for a same-origin, `HttpOnly` session cookie. The production configuration must not expose this route. Protect state-changing cookie-authenticated requests with an explicit CSRF strategy. Keep service-to-service/API bearer-token tests separate. Do not put access or refresh tokens in `localStorage` merely to make the demo convenient.

Failure drill: expired token, wrong audience, unknown key, valid token for another owner, missing/invalid CSRF protection and permission removed between two requests. The expected result is denial without revealing whether another owner's resource exists. Assert that the development sign-in route is absent in production configuration.

### Increment 3 — bounded worker report {#increment-3-—-bounded-worker-report}

Keep the current report calculation as a pure function using a snapshot the caller may access. Verify that direct and worker execution return identical rows and decompressed output. Then profile a large enough controlled dataset to reveal event-loop blocking. Do not change the report schema or add unrelated calculations to create work. If CPU work is the problem, use a fixed-size `worker_threads` pool. Limit queued jobs, validate messages, define copying/transfer rules and reject excess work promptly.

For direct reports, pass the HTTP deadline and cancellation signal to the calculation. An accepted report job has its own execution deadline and cancellation operation; closing a polling request does not stop it. Define behavior for worker failure, exit after a reply and shutdown during work. A database commit and worker result do not automatically form one all-or-nothing operation. Do not claim exactly-once execution.

Let the UI start one report job, show `queued`, `running`, `completed`, `failed` or `cancelled`, cancel an owned job and download only a completed artifact. Polling a bounded status endpoint is enough; WebSockets are unnecessary for this small interface.

Failure drill: saturate the pool, crash a worker, cancel a queued job and shut down with one job active. Verify one terminal outcome per accepted job, bounded memory and replacement/termination according to policy.

### Increment 4 — container, deployment and serverless comparison {#increment-4-—-container-deployment-and-serverless-comparison}

Build a multi-stage or otherwise minimal reviewed Node image, install the locked production tree, run as a non-root user and use exec-form startup. Compose starts the API and PostgreSQL for local integration with an explicit database health check, but the application still owns subsequent connection failures.

Package the three static UI files in the same reviewed image and serve them from the same origin. Inject only non-secret public runtime configuration; secrets remain server-side. When readiness is false, the UI should preserve entered form values and present a retryable unavailable state rather than pretending a write succeeded.

Expose separate liveness and readiness. On termination, mark the service unready and stop accepting work. Give active HTTP requests a deadline to finish, stop workers and close ORM/database resources. Apply migrations as a controlled release step, not independently in every replica.

Choose one primary cloud design—for example, an ECS/Fargate-style container service plus a managed PostgreSQL database—and write the deployment contract even if you do not spend money deploying it: image digest, configuration/secrets, network boundary, health, resource limits, migration order, backward compatibility, rollback and backup/restore owner.

Use the [scheduled-report adapter](./20-serverless.md#scheduled-report-adapter) to extract only the scheduled progress-report trigger into a serverless-compatible handler around the same application use case. Test it locally for duplicate delivery, deadline and retry. Compare cold start, connection reuse, execution limit and idempotency with the long-running container; **do not create a second business implementation**.

Failure drill: wrong database DNS name, unreadable runtime path, SIGTERM during a request, incompatible migration and duplicate serverless event. Recover from evidence rather than adding privileges or deleting the database volume.

### Project 3 release check {#project-3-release-check}

- [ ] All applicable Project 1 and Project 2 release checks still pass; changed behavior has an explicit migration decision rather than an accidental regression.
- [ ] A clean database can migrate up and run the shared repository contract suite; a failed transaction leaves no half-completed item/session state. Completion with an open session still returns a conflict, and concurrent completions cannot both succeed.
- [ ] The Project 2 data migration preserves IDs, times and report totals, assigns the chosen existing owner, and rejects repeated transfer without duplicating records. Another user cannot observe the migrated data.
- [ ] The standalone CLI verifies identity and applies the same permission/ownership policy as HTTP; credentials never enter arguments, logs or report rows.
- [ ] Cross-owner reads/writes are denied in both HTTP behavior and database query scope; token signature/issuer/audience/expiry are verified.
- [ ] The same basic UI works against PostgreSQL-backed state, shows the signed-in test identity and never persists bearer/refresh tokens in browser storage.
- [ ] The existing direct report download retains its gzip schema/headers and now filters by owner. Job routes separately pass their acceptance, status, cancellation, restart and artifact-expiry checks.
- [ ] UI report status reflects queued/running/completed/failed/cancelled outcomes, stops polling at the right time and cannot download another owner's artifact.
- [ ] The worker pool has fixed concurrency/queue bounds, cancellation and shutdown tests; measured loop responsiveness improves for the chosen workload without an unsupported capacity claim.
- [ ] `docker compose` starts an owned environment, readiness reflects dependency state and SIGTERM closes HTTP, workers and database handles within the stated deadline.
- [ ] The release record identifies source revision, lockfile, image digest, migration and local test results; rollback compatibility is explained. The AWS deployment plan is reviewed and every unexecuted live-cloud exercise is marked not assessed.
- [ ] The scheduled handler survives duplicate input without duplicate durable effect, or explicitly records why the current design cannot promise that yet.
- [ ] You can draw the runtime boundaries and explain what fails independently: client, Node process, worker, database, container scheduler, identity provider and serverless invocation.

Save this state as the **`project-3-deployable-service`** release or tag, with the handoff decision record and its verification commands.

<!-- tech-check-level: 4 -->

## Project 4 — Hardened and optimized service {#project-4-hardened-service}

*Study depth: Advanced*

Level Up: L4 — Lead\
Tech Check level: ⭐⭐⭐⭐

The stars show this project's stage in the learning path. The linked lessons keep the source references for each individual topic.

### Outcome

Begin from the passing `project-3-deployable-service` state. Keep its UI, API contracts, identity, data, worker and deployment behavior. **Project 4 adds tested security controls and measured performance evidence.** State the limits of what each check proves. It maps directly to Section 4 without creating another product.

### What this continuation covers

| Section 4 area | Evidence added to the existing service |
|---|---|
| Security | Threat model, strict boundaries, dependency triage, headers, secrets/TLS and abuse controls |
| Advanced authentication | Browser/OIDC transaction binding, key rotation, revocation and step-up decisions |
| Performance and V8 | Representative workload, profiles, loop/memory metrics and one measured improvement |
| Deeper data access | Isolation anomaly, query plans, keyset pagination, lock/pool pressure and migration safety |
| Advanced APIs/frameworks | Bounded streaming, safe publication, crypto ownership and equivalent-framework experiment |

### Increment 1 — threat model and boundary hardening {#increment-1-—-threat-model-and-boundary-hardening}

Create a route/job/data-flow threat model naming assets, trust boundaries, abuse cases, controls and evidence. Apply strict request DTOs, bounded bodies and output-context rules. Add Helmet policies, parameterized data access, secret/config validation, TLS expectations and a fixed-destination outbound adapter with redirect/deadline/byte limits.

Run dependency, secret and static checks, but triage findings against reachable code and deployment context. Add password hashing/rate/lockout/recovery decisions only if the service owns passwords; otherwise document the external identity boundary. A green scanner is **one signal, not proof of application security**.

Failure drill: mass-assignment field, injection-shaped input, HTML-like title, oversized body, hostile outbound URL, missing secret and tampered encrypted payload. Record which layer rejects each case and what remains outside the lab.

### Increment 2 — advanced identity lifecycle {#increment-2-—-advanced-identity-lifecycle}

Extend the development issuer into an owned OIDC-style test flow with state, nonce, PKCE and one-use browser transaction storage. Exercise trusted key overlap/retirement, issuer/audience/algorithm enforcement, refresh-family reuse detection, revocation and a step-up rule for a sensitive report action.

Keep the local UI's production-disabled test sign-in boundary. Do not implement a pretend production identity provider. Instead, test the client/session/token contracts against the owned issuer and document the real provider integration point.

Failure drill: wrong browser/state, replayed callback, unknown/retired key, wrong audience, refresh reuse and permission change during an active session. Deny safely without logging tokens or exposing another tenant's resource.

### Increment 3 — measured performance and V8 diagnosis {#increment-3-—-measured-performance-and-v8-diagnosis}

Choose a representative mixed workload: item reads/writes plus report generation. Record environment, data size, concurrency, latency distribution, throughput, errors, CPU, event-loop delay/utilization and memory. Capture a CPU profile for a CPU case and a heap/allocation comparison for a controlled retention case.

Make **one improvement supported by measurements**: change a query or index, JSON conversion, a size-limited cache, Buffer sharing or worker message transfer. Preserve output, permission checks and error behavior, then rerun the same workload. A local result does not establish production capacity.

Failure drill: synchronous CPU in a handler, unbounded cache key, retained object, slow dependency and saturated worker queue. Diagnose each before changing code; distinguish performance from scalability and dependency wait from loop blocking.

### Increment 4 — deeper data and advanced API boundaries {#increment-4-—-deeper-data-and-advanced-api-boundaries}

Reproduce a two-client isolation anomaly and protect the chosen invariant with the appropriate transaction/constraint/retry policy. Add keyset pagination with a stable unique order, inspect the real plan and diagnose lock, statement and pool-acquisition timeouts. Rehearse an expand/backfill/contract migration and rollback/restore decision on owned data.

For advanced API practice, protect one streamed report path: limit bytes and rows, stop work on disconnect, verify decrypted content before making it available, prevent replacement of existing output where required, and close each resource the operation opened. Compare the existing Express path with one equivalent Nest adapter or focused candidate only if behavior remains identical; framework replacement is not the optimization goal.

Failure drill: serialization retry, mutable pagination boundary, blocked lock, exhausted pool, mid-stream disconnect, existing output target and crash between temporary write/publication. State which outcomes are known, unknown or safe to retry.

### Project 4 release check {#project-4-release-check}

- [ ] All applicable Project 1–3 checks still pass; every behavior change links to a measured risk or bottleneck.
- [ ] Security tests exercise boundary abuse and denial outcomes; scanner output is triaged rather than counted as assurance.
- [ ] OIDC/key/revocation fixtures cover replay and rotation without exposing secrets or enabling the development identity route in production.
- [ ] Before/after workload evidence uses equivalent behavior and records uncertainty; one justified improvement survives regression tests.
- [ ] Real database isolation, plan, lock/pool and migration drills complete on owned data with cleanup/recovery evidence.
- [ ] Stream/publication failures have bounded resource ownership and cannot publish unauthenticated or partial output as success.
- [ ] You can explain why each control/optimization exists, its residual risk and the condition that would invalidate the evidence.

Save this state as `project-4-hardened-service`.

<!-- tech-check-level: 5 -->

## Project 5 — Operated specialized service {#project-5-operated-specialized-service}

*Study depth: Advanced*

Level Up: L4 — Lead\
Tech Check level: ⭐⭐⭐⭐⭐

The stars show this project's stage in the learning path. The linked lessons keep the source references for each individual topic.

### Outcome

Begin from the passing `project-4-hardened-service` state. Keep the same UI and service contracts. Replace only the report-job dispatch adapter with a broker-backed path, add live progress and operational evidence, then introduce one bounded specialist computation adapter.

### What this continuation covers

| Section 5 area | Evidence added to the existing service |
|---|---|
| Messaging | RabbitMQ work queue, acknowledgements/confirms, bounded consumption, idempotency and outbox reasoning |
| Real-time foundations | Server-Sent Events for one-way job progress; WebSocket/Socket.IO/IP-socket comparison |
| Logging | Structured, redacted, correlated events with levels and failure-safe transport policy |
| Monitoring | Metrics, traces, dashboard, actionable alerts and an incident drill |
| Advanced tools/runtime | One JavaScript/WebAssembly scoring adapter; Node-API/native module decision and packaging awareness |

RabbitMQ is the primary broker for this exercise because a work queue fits report execution. Kafka remains an alternative for retained event streams/replay; do not implement both. OpenTelemetry plus Prometheus/Grafana is the primary telemetry path; Kibana/New Relic remain alternatives rather than extra mastery requirements.

### Increment 1 — broker-backed report execution {#increment-1-—-broker-backed-report-execution}

Keep the existing `ReportJobDispatcher` contract and add a RabbitMQ adapter. Publish a versioned job envelope with stable job/tenant IDs, validate on consumption, set bounded prefetch and acknowledge only after the durable result/status transition succeeds. Use publisher confirms for publisher-to-broker evidence and manual consumer acknowledgements for consumer processing; neither proves the other side's outcome.

Save the database change and a pending message in the same transaction: the transactional outbox pattern. Make the consumer recognize repeated job/effect IDs so it does not repeat a durable effect. Define retryable failures, delays, maximum attempts, storage for permanently failing messages and controlled replay by an operator. Do not claim exactly-once delivery.

Failure drill: broker unavailable before/after commit, publisher-confirm uncertainty, consumer crash before/after durable effect, duplicate/redelivered message and poison payload. Verify no duplicate report effect and no unbounded retry loop.

### Increment 2 — live progress without a second business path {#increment-2-—-live-progress-without-a-second-business-path}

Replace UI polling with a small authenticated Server-Sent Events endpoint for report status. Replay from the authoritative status store after reconnect; treat the stream as notification, not the only copy of state. Bound clients, heartbeat/idle lifetime and per-user fan-out, and close listeners on disconnect/shutdown.

Document why SSE fits server-to-browser progress. Compare WebSocket/Socket.IO when bidirectional messaging/reconnection rooms are required and raw IP sockets when HTTP semantics are not the interface. Do not implement all transports.

Failure drill: reconnect after a missed event, proxy buffering/timeout, slow client, expired authorization, another owner's job and service shutdown. The UI must recover status from the API rather than assume every event arrived.

### Increment 3 — logs, metrics, traces and incident response {#increment-3-—-logs-metrics-traces-and-incident-response}

Emit structured JSON logs with timestamp, level, event name, request/job/trace IDs and bounded safe context. Redact credentials/tokens/content; user IDs do not belong in log messages or high-cardinality metric labels without a reviewed need. Propagate trace context HTTP → outbox publisher → broker consumer → database/report work.

Expose a bounded metrics endpoint and instrument request/job counts, error classes, latency histograms, queue depth/age, retries, worker saturation and event-loop/process health. Build one dashboard and three symptom-based alerts with owner, severity, runbook and recovery condition. Keep alerting separate from raw “something changed” notifications.

Failure drill: inject database latency, stuck consumer, poison retry storm and dependency outage. Diagnose from signals before reading source, write a short incident timeline/root cause/corrective action and verify telemetry fails without crashing the business path.

### Increment 4 — one specialist computation adapter and operational release {#increment-4-—-one-specialist-computation-adapter-and-operational-release}

Extract a deterministic report-score calculation behind `ScoreEngine`. Keep the JavaScript implementation as the reference for expected results and add one WebAssembly implementation only after profiling justifies the experiment. Test identical inputs/outputs, numeric/encoding boundaries, initialization failure, memory limits and fallback policy; compare total operation cost, including data conversion.

Write a decision record for **not** adding a C++ addon unless native library access or measured performance requires it. Explain Node-API/ABI/platform/build/signing/container implications and worker compatibility. Packaging a native addon adds different build and deployment work from loading Wasm.

Extend Compose/deployment/runbooks for broker and telemetry dependencies, backup/restore ownership, rolling compatibility and failure-safe shutdown. Rehearse a release/rollback with old/new message versions and consumers.

Failure drill: invalid Wasm module, large input, JS/Wasm result mismatch, missing optional adapter, old message consumed by new code and new message seen by an old consumer. Preserve the JavaScript path and public report contract.

### Project 5 release check {#project-5-release-check}

- [ ] All applicable Project 1–4 checks still pass with the broker/telemetry stack unavailable or degraded according to policy.
- [ ] Outbox, confirms, acknowledgements, idempotency and retry/parking drills demonstrate at-least-once reality without duplicate durable effect.
- [ ] Authenticated SSE reconnects from authoritative status and releases resources; WebSocket/raw-socket alternatives are explained rather than unnecessarily implemented.
- [ ] Logs are structured/redacted/correlated; metrics avoid unbounded labels; traces cross HTTP, database and broker boundaries.
- [ ] Dashboard/alerts detect the injected incidents and link to tested runbooks; telemetry failure does not become an application outage.
- [ ] JavaScript and Wasm score engines pass the same contract/boundary fixtures; measured evidence decides whether Wasm remains enabled.
- [ ] Message/schema/release compatibility and rollback are demonstrated across two adjacent versions.
- [ ] You can diagnose one injected incident from evidence and explain every delivery/status ambiguity.

Save this state as `project-5-operated-service`.

## Coverage map for all five sections

This map shows where each sidebar chapter is practised. “Used” means you implement it. “Decision” means you explain whether it fits; you do not need to add a technology the application does not need.

| Tech Check chapter | Primary project evidence |
|---|---|
| Runtime fundamentals | P1 runtime explanation, sync/async choice and lifecycle |
| CLI and processes | P1 command contract, environment, exit codes and signals |
| Modules | P1 domain/repository/CLI ESM boundaries and loading diagnosis |
| Package management | P1 scripts, engines, exact lock and clean installation |
| Async programming | P1 persistence/import ownership; P2 background rejection drill |
| Core APIs | P1 JSONL, paths, URL, Buffer, streams, readline, crypto and gzip |
| Framework foundations | P1 no-framework record; P2 Express/Nest decision |
| Events and event loop | P2 request events, blocking drill and cancellation |
| Networking | P2 HTTP contracts, same-origin UI, TLS-aware owned dependency and streaming |
| Development-tool workflows | P2 repeatable check/test/start/debug evidence |
| Errors | P2 public/private error taxonomy and async ownership |
| Testing | P2 unit/integration/contract/adapter/load evidence |
| Frameworks | P2 Express implementation and Nest concept map |
| Patterns | P2 four justified patterns plus one explicit rejection |
| Concurrency | P3 bounded worker pool and terminal-outcome tests |
| Architecture | P3 dependency direction, composition root and boundaries |
| Authentication | P3 token verification, browser-session boundary, CSRF decision, principal and authorization policy |
| Database fundamentals | P3 PostgreSQL constraints, transactions, queries and migrations |
| Docker | P3 image, Compose, health, permissions and shutdown |
| Cloud | P3 one documented container/managed-database target |
| Serverless | P3 one reused scheduled use case and delivery-semantics test |
| Deployment | P3 immutable release, migration order, rollback and recovery evidence |
| Security | P4 threat model, boundary abuse, secrets/TLS/headers and scanner triage |
| Advanced authentication | P4 OIDC transaction, key rotation, revocation and step-up drills |
| Performance and V8 | P4 equivalent workload, profiles, runtime metrics and one measured improvement |
| Deeper data access | P4 isolation, plans, keyset pagination, locks/pools and migration rehearsal |
| Advanced APIs/frameworks | P4 bounded streams/publication/crypto and equivalent-adapter comparison |
| Messaging | P5 RabbitMQ/outbox/idempotency/retry/parking path |
| Real-time foundations | P5 authenticated SSE plus WebSocket/Socket.IO/raw-socket decision |
| Logging | P5 structured/redacted/correlated operational events |
| Monitoring | P5 metrics/traces/dashboard/alerts and incident drill |
| Advanced real-time/native/Wasm/tools | P5 live-status operations, Wasm adapter and Node-API decision |

The full GoF catalogue remains study material. **This project demonstrates pattern judgment, not implementation of all 23 patterns.** Likewise, one cloud path plus one bounded serverless comparison gives useful depth without pretending that AWS, Azure and Google Cloud are interchangeable checkboxes.

## Personal progress scorecard

Reading available material does not complete the practice. Update this table only after doing the work and recording its results.

| Milestone | Not started | Building | Release checks pass | Explained from memory |
|---|---:|---:|---:|---:|
| Foundations CLI | [ ] | [ ] | [ ] | [ ] |
| HTTP application | [ ] | [ ] | [ ] | [ ] |
| Deployable service | [ ] | [ ] | [ ] | [ ] |
| Hardened service | [ ] | [ ] | [ ] | [ ] |
| Operated specialized service | [ ] | [ ] | [ ] | [ ] |

After each release, wait at least one day and answer these without the code:

1. Where does this program wait, and what can still make progress while it waits?
2. Which code closes each resource and handles each asynchronous failure?
3. Which business rule must stay true? Where is it checked—in business code, HTTP handling or the database—and why there?
4. What evidence distinguishes a code defect from dependency wait, overload or configuration failure?
5. Which interface or extra layer could you remove if the requirement it serves disappeared?

If an answer is vague, repeat the related failure exercise. **Practise recalling the decision and the symptom from memory**, then use the finished solution to check your explanation.

## Official references

- [Node.js 24 API index](https://nodejs.org/docs/latest-v24.x/api/) and [Node release policy](https://nodejs.org/en/about/previous-releases)
- [Express 5 routing](https://expressjs.com/en/5x/guide/routing/), [error handling](https://expressjs.com/en/5x/guide/error-handling/) and [production reliability](https://expressjs.com/en/advanced/best-practice-performance/)
- [MDN Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch), [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) and [`aria-live`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-live)
- [OWASP HTML5 security](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html) and [CSRF prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Node test runner](https://nodejs.org/docs/latest-v24.x/api/test.html) and [worker threads](https://nodejs.org/docs/latest-v24.x/api/worker_threads.html)
- [NestJS concepts](https://docs.nestjs.com/)
- [MikroORM 7 quick start](https://mikro-orm.io/docs/quick-start), [transactions](https://mikro-orm.io/docs/transactions) and [migrations](https://mikro-orm.io/docs/migrations)
- [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html) and [EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html)
- [Docker's Node.js guide](https://docs.docker.com/guides/nodejs/) and [build practices](https://docs.docker.com/build/building/best-practices/)
- [RabbitMQ JavaScript work queues](https://www.rabbitmq.com/tutorials/tutorial-two-javascript) and [acknowledgements/publisher confirms](https://www.rabbitmq.com/docs/confirms)
- [OpenTelemetry JavaScript](https://opentelemetry.io/docs/languages/js/), [Prometheus instrumentation](https://prometheus.io/docs/practices/instrumentation/) and [metric naming](https://prometheus.io/docs/practices/naming/)
- [MDN Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events) and [WebAssembly](https://developer.mozilla.org/en-US/docs/WebAssembly)
- [Node.js diagnostics channel](https://nodejs.org/docs/latest-v24.x/api/diagnostics_channel.html) and [C++ addons/Node-API overview](https://nodejs.org/docs/latest-v24.x/api/addons.html)

