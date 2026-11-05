---
outline: [2, 3]
---

# Three progressive Node.js learning projects

These projects turn the first three Tech Check sections into **one evolving Learning Progress service with three releasable milestones**. Each milestone can be kept as a Git tag or copied into a separate folder, so it is both a complete small project and the starting point for the next one.

The domain stays intentionally simple: a learner creates study items, records sessions, marks work complete and exports a progress report. **The domain should not consume the learning time; Node.js decisions should.**

| Milestone | You build | Main question it answers |
|---|---|---|
| [1. Node.js Foundations](#project-1-foundations-cli) | A dependency-free CLI and file-backed library | How does a Node program own modules, I/O, configuration and process lifetime? |
| [2. Building Node.js Applications](#project-2-http-application) | A tested Express HTTP application over the same domain | How do requests, events, errors, tests and framework boundaries fit together? |
| [3. Designing Node.js Services](#project-3-deployable-service) | A PostgreSQL-backed, authenticated, containerized service with a worker | How do architecture, data, concurrency and deployment decisions interact? |

This is **not fifteen unrelated exercises per chapter**. Each project has four build increments and one release check. Do not start the next increment while the current one cannot build, test or shut down cleanly.

## Working baseline and scope

- Use **Node.js 24 LTS** and ES Modules. The official Node 24 documentation showed v24.22.2 when this plan was checked on 2026-11-05; use the current supported patch in that release line rather than depending on a patch-specific accident.
- Use **plain JavaScript** for this sequence. TypeScript is valuable, but it is outside the current Tech Check checklist and would add another learning variable.
- Use **Express 5** as the primary framework. NestJS remains a comparison: after Project 2, map the Express composition root, routes and middleware to Nest modules, controllers, providers, guards and filters. Reimplementing the whole service in both frameworks is not required.
- Use **PostgreSQL with MikroORM 7** in Project 3. Write and inspect migrations; do not use schema synchronization as the deployment mechanism.
- Use a **container deployment as the primary operational path**. A serverless report handler is a bounded alternative, not a second complete platform.
- Keep all work in a new learning repository. Do not place its tests in an EPAM Autocode assignment's protected `src/tests` directory or replace a supplied assignment configuration.

Suggested repository name: `node-learning-progress`.

```text
node-learning-progress/
├── src/
│   ├── domain/
│   ├── application/
│   ├── adapters/
│   ├── cli/
│   ├── http/
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

You do not need every directory on day one. **Add a boundary when it has a responsibility, not because the final tree shows one.**

## The learning method: build, break, explain, recall

Finishing code once is weak evidence that you will remember it. For every increment, keep one short entry in `docs/learning-log.md`:

1. **Build:** state the behavior you added and the command that proves it.
2. **Why:** name why this Node API, boundary or pattern is appropriate here.
3. **Break:** introduce one listed failure deliberately and capture the observed symptom.
4. **Repair:** make the smallest correction and rerun the proof.
5. **Recall:** on the next day, explain the decision without opening the notes, then check what you missed.

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

**Do not count an increment complete from a screenshot or from “it works on my machine.”** Keep the command, expected observable result and one failure-path result.

## Project 1 — Foundations CLI {#project-1-foundations-cli}

### Outcome

Build a dependency-free command-line application named `study-log`. It stores study items and sessions in an append-only JSON Lines file, prints summaries and exports a compressed report with a checksum.

Example user flow:

```bash
node src/cli/main.mjs add --title "Event loop" --minutes 45
node src/cli/main.mjs start <item-id>
node src/cli/main.mjs finish <item-id> --note "Explained microtasks aloud"
node src/cli/main.mjs list --status done
node src/cli/main.mjs report --output progress.jsonl.gz
```

The CLI uses only Node built-ins. **That forces the runtime and host APIs to remain visible** before a framework starts managing them.

### What you learn and why it belongs here

| Knowledge | Use in the project | Why it matters |
|---|---|---|
| Runtime, CLI and process | Parse arguments, read environment configuration, write stdout/stderr and set exit codes | A CLI has an input, output and lifecycle contract just like a server |
| Packages and modules | Define scripts/engines, keep a lockfile and separate domain, storage and CLI modules | Package metadata and module boundaries determine how code is loaded and released |
| Callbacks, promises and async/await | Use promise filesystem APIs; adapt one callback API once; propagate failures to the CLI boundary | Syntax is less important than who owns completion and rejection |
| Files, paths, URLs and OS | Resolve an application data directory and validate an optional resource URL | Host paths and permissions vary; string concatenation is not a portable filesystem policy |
| Buffer, streams, compression and crypto | Enforce byte limits, stream the report through gzip and calculate a SHA-256 digest | Whole-file convenience APIs are not suitable for every data size; integrity is not encryption |
| Timers, readline and console | Add a bounded confirmation prompt and a timeout-aware import | Active handles affect process exit; interactive input needs an explicit cancellation policy |
| Framework foundations | Record why the first milestone does not need Express | Choosing no framework for a bounded CLI is an engineering decision, not missing technology |

### Increment 1 — executable package and pure domain

Create `package.json` with an explicit Node engine, `start`, `test` and `check` scripts. Add a small `StudyItem` domain function that validates a title, positive minute estimate and allowed state. Generate IDs with `crypto.randomUUID()` and inject the clock into domain operations.

The CLI should support `help`, `add` and `list`. Keep parsing in the CLI adapter; **domain functions must not read `process.argv`, environment variables or files directly**.

Failure drill: pass an unknown command, a blank title and a non-integer duration. The program must write a useful message to stderr, set a nonzero exit code and avoid creating a partial record.

### Increment 2 — owned asynchronous persistence

Add a `StudyItemRepository` contract and a JSONL implementation using `node:fs/promises`, `node:path` and a configured data directory. Reconstruct current state by replaying validated events such as `item-added` and `item-finished`.

Use one process as the writer in this milestone. Document that `appendFile` does not make a multi-process transactional database. Reject malformed or oversized lines with the line number; do not silently skip corrupt state.

Failure drill: remove directory permission, truncate the last line and run two writers intentionally. Record which failures the implementation detects and which concurrency guarantee it **does not** provide.

### Increment 3 — bounded import and streaming export

Add `import` and `report` commands. Read imported JSONL through `readline`; cap line bytes, item count and total bytes. Export through a stream pipeline to gzip and compute a SHA-256 digest over the published bytes. Write to a temporary file and rename only after the pipeline succeeds.

Validate optional `https:` resource links with `URL`. A syntactically valid URL is not authorization to fetch it; Project 1 stores the link but performs no outbound request.

Failure drill: exceed each bound, cancel during import and make the output path unwritable. A failed export must not replace the last successful report.

### Increment 4 — lifecycle, diagnostics and release contract

Add signal handling only at the composition root. Stop accepting new interactive work, let the current owned operation settle within a deadline and then set an appropriate exit code. Ensure no timer, readline interface or file handle keeps the process alive after completion.

Create smoke tests with `node:test` for a successful command, invalid input, corrupted storage and an interrupted export. Test the domain without spawning a process; use one process-level test for the real CLI contract.

Failure drill: leave a timer or readline interface open, observe the hanging test/process, diagnose the active owner and fix the cleanup in `finally`.

### Project 1 release check

Project 1 is releasable when all of these are true:

- [ ] A clean checkout installs reproducibly and `npm run check && npm test` exits successfully.
- [ ] Add/start/finish/list work against an owned temporary data directory; invalid input leaves no partial event.
- [ ] Import limits and corrupt-line errors include useful context without leaking file contents unnecessarily.
- [ ] A report round-trips through gunzip, its recorded checksum matches and failed publication preserves the previous report.
- [ ] SIGINT during an owned operation exits within the documented deadline and leaves no open handles.
- [ ] You can explain from memory: Node versus V8, sync versus async I/O, promise ownership, ESM loading, stream backpressure and why a framework was not needed.

Save this state as the `foundations-cli` release or tag before continuing.

## Project 2 — HTTP application {#project-2-http-application}

### Outcome

Keep the domain and repository contract. Add an Express 5 application that exposes study items and sessions over HTTP, streams the existing report and has an intentional error and test strategy.

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

The CLI remains usable. **Two adapters now exercise the same application behavior**, revealing whether the first milestone accidentally coupled business rules to terminal input.

### What you learn and why it belongs here

| Knowledge | Use in the project | Why it matters |
|---|---|---|
| Events and event loop | Observe request lifetime, delay and aborted responses; keep CPU work bounded | Async handlers still execute JavaScript on an event-loop thread |
| Networking | Use HTTP methods/status/headers, DNS/TLS-aware outbound client policy and streamed bodies | An API contract includes protocol behavior, not only JSON shapes |
| Development workflow | Separate build/check/test/start, use inspector and source evidence, verify shutdown | Repeatable diagnosis is part of delivering an application |
| Errors | Translate domain/input/not-found/conflict/dependency failures once | Clients need stable public errors; logs need richer private causes |
| Testing | Unit, HTTP integration, contract and one bounded load observation | Different risks need different boundaries; coverage alone is not confidence |
| Frameworks | Express routing/middleware/composition; map concepts to NestJS | Framework mechanics should remain outside the application rules |
| Patterns | Use only patterns that solve an observed variation or workflow | Pattern names are tools for reasoning, not a checklist to force into code |

### Increment 1 — Express boundary over the existing application

Create `createApp(dependencies)` separately from `listen()`. Add JSON body limits, route-specific validation and a consistent response schema. Routes call application use cases; they do not parse the JSONL file themselves.

Use the repository contract from Project 1. Add an in-memory implementation for tests and retain the file implementation for local execution. This is a Strategy/Adapter boundary only if it actually permits the application to use either implementation without transport changes.

Failure drill: occupy the configured port, send malformed/oversized JSON and request an unknown item. Verify startup failure ownership and distinct 400, 404 and 413 contracts.

### Increment 2 — request lifetime, events and networking

Add a request ID, structured request-completion event and elapsed duration. Use `EventEmitter` only for notifications whose listener failure policy is explicit; do not use it as an invisible command bus. Stream the progress report with `pipeline()` and stop upstream work when the client disconnects.

Add one bounded outbound metadata adapter to a local fake HTTPS service or an owned test server. Configure deadline, response-size cap, expected content type and allowed destination. Explain DNS resolution, TLS identity and HTTP status separately; do not disable certificate verification to make a test pass.

Failure drill: delay the dependency, abort the client, emit a listener error and run a short synchronous CPU loop in one handler. Observe which symptom is dependency wait, cancellation, event ownership or event-loop blocking.

### Increment 3 — errors, tests and developer workflow

Define domain/application error types with public codes and causes. One final Express error middleware maps expected failures and hides unexpected internals. A rejected Express 5 async handler reaches error middleware, but background work still needs its own owner.

Use Jest and Supertest for the same baseline as the existing testing notes. Add:

- unit tests for domain decisions and repository-independent use cases;
- HTTP integration tests through the real Express app;
- a contract test for the report and error schemas;
- one real file-repository test in an owned temporary directory;
- a bounded concurrency observation that records latency and failures without claiming production capacity.

Failure drill: make an async route start but not return/await a rejecting promise. Observe the test or process symptom, then restore explicit ownership. Introduce one boundary mutation that the relevant test must catch.

### Increment 4 — deliberate patterns and framework comparison

Refactor only after the earlier increments expose real pressure. A reasonable final selection is:

- **Factory/composition root:** construct production or test dependencies once;
- **Repository/Adapter:** isolate persistence mechanics from use cases;
- **Strategy:** choose report formatting without branching through every route;
- **Observer:** publish a non-critical completion notification with a stated failure policy.

Write `docs/decisions/framework.md` comparing the current Express implementation with NestJS. Map route → controller, dependency construction → provider/module, validation middleware → pipe, authorization middleware → guard and error middleware → exception filter. **Do not port the application merely to demonstrate the vocabulary.**

Failure drill: identify one pattern that would add indirection without a current variation. Record why you rejected it. Being able to avoid a pattern is part of pattern knowledge.

### Project 2 release check

- [ ] The CLI and HTTP adapters pass the same application-level behavior tests.
- [ ] Every route has a documented success contract and relevant 4xx/5xx contract; unexpected stack traces never enter responses.
- [ ] A disconnected report request cancels owned upstream work and all tests/servers close.
- [ ] Unit, HTTP integration, contract and real-adapter tests catch different deliberate failures; coverage exclusions are explained.
- [ ] The bounded load run records environment, concurrency, latency distribution and error count without calling the result production capacity.
- [ ] You can trace one request from socket/framework through validation, use case, repository, event and response, including who owns every rejection.
- [ ] You can explain why each retained pattern exists and why NestJS was not implemented in parallel.

Save this state as the `http-application` release or tag.

## Project 3 — Deployable service {#project-3-deployable-service}

### Outcome

Replace file persistence with PostgreSQL/MikroORM, add authenticated ownership, move a CPU-heavy report calculation to a bounded worker pool and package the service for a controlled deployment.

Project 3 is still one service. **A worker, a database and a container do not automatically make it a microservice system.** Keep the deployment simple enough that you can reason about failure and recovery.

### What you learn and why it belongs here

| Knowledge | Use in the project | Why it matters |
|---|---|---|
| Concurrency | Bounded worker pool for a measured CPU-heavy report; copy/transfer policy and cancellation | Workers help CPU work only when lifecycle, queue and failure ownership are designed |
| Architecture | Domain/application/adapters plus one composition root and dependency direction | Boundaries make transport, database and framework replaceable for a reason |
| Authentication/authorization | Verify a signed token, derive a principal and enforce resource ownership in use cases/queries | Authentication identifies; authorization decides each operation |
| Relational database/ORM | Constraints, indexes, transactions, migrations, pooling and query inspection | Durable invariants and concurrency cannot live only in route validation |
| Docker | Reproducible non-root image, Compose integration, health and graceful stop | Deployment changes filesystem, network, signals and resource limits |
| Cloud and deployment | One container target, managed database design, release/rollback evidence | A runnable image is not yet a safe release process |
| Serverless | Extract one scheduled-report handler and compare constraints | Serverless is a deployment/execution model, not a reason to rewrite every route |

### Increment 1 — architecture and relational data

Move use cases into `application/`, domain invariants into `domain/` and implementations into `adapters/`. Keep Express and CLI as inbound adapters. The dependency direction points inward; the composition root creates concrete objects.

Model `users`, `study_items` and `study_sessions` in PostgreSQL. Use primary/foreign keys, check constraints, unique rules and tenant/owner-aware indexes. Add a reviewed MikroORM migration and a separate test database. Use a transaction for a completion operation that writes the final session and changes item state together.

Failure drill: violate each database constraint, race two completion requests and force a statement timeout. Observe the real database/ORM error, rollback behavior and public error mapping. Inspect a representative query with `EXPLAIN (ANALYZE, BUFFERS)` only on owned test data.

### Increment 2 — identity and authorization

Use a local test issuer to create signed access tokens with issuer, audience, subject, expiry and a stable key ID. Verify the algorithm and trusted key set; do not merely decode tokens. Build the principal at the HTTP boundary and pass it explicitly to use cases.

Scope every read/write to the principal's owner or tenant ID. Add a small permission policy for `item:read`, `item:write` and `report:run`. Keep authentication middleware thin: **the use case or repository query must not trust an item owner supplied by the request body**.

Failure drill: expired token, wrong audience, unknown key, valid token for another owner and permission removed between two requests. The expected result is denial without revealing whether another owner's resource exists.

### Increment 3 — bounded worker report

First profile a report calculation large enough to block the loop in a controlled test. If it is genuinely CPU-heavy, create a fixed-size `worker_threads` pool. Queue only a bounded number of jobs, validate messages, define copy versus transfer ownership and reject overload quickly.

Propagate deadline/cancellation from HTTP to the queue and worker. Define what happens if a worker errors, exits after replying or is terminated during shutdown. The database transaction and worker result have different atomicity boundaries; do not claim exactly-once execution.

Failure drill: saturate the pool, crash a worker, cancel a queued job and shut down with one job active. Verify one terminal outcome per accepted job, bounded memory and replacement/termination according to policy.

### Increment 4 — container, deployment and serverless comparison

Build a multi-stage or otherwise minimal reviewed Node image, install the locked production tree, run as a non-root user and use exec-form startup. Compose starts the API and PostgreSQL for local integration with an explicit database health check, but the application still owns later connection failures.

Expose separate liveness and readiness. On termination, become unready, stop accepting work, drain HTTP within a deadline, stop workers and close ORM/database resources. Apply migrations as a controlled release step, not independently in every replica.

Choose one primary cloud design—for example, an ECS/Fargate-style container service plus a managed PostgreSQL database—and write the deployment contract even if you do not spend money deploying it: image digest, configuration/secrets, network boundary, health, resource limits, migration order, backward compatibility, rollback and backup/restore owner.

Extract only the scheduled progress-report trigger into a serverless-compatible handler around the same application use case. Test it locally for duplicate delivery, deadline and retry. Compare cold start, connection reuse, execution limit and idempotency with the long-running container; **do not create a second business implementation**.

Failure drill: wrong database DNS name, unreadable runtime path, SIGTERM during a request, incompatible migration and duplicate serverless event. Recover from evidence rather than adding privileges or deleting the database volume.

### Project 3 release check

- [ ] A clean database can migrate up and run integration tests; a failed transaction leaves no half-completed item/session state.
- [ ] Cross-owner reads/writes are denied in both HTTP behavior and database query scope; token signature/issuer/audience/expiry are verified.
- [ ] The worker pool has fixed concurrency/queue bounds, cancellation and shutdown tests; measured loop responsiveness improves for the chosen workload without an unsupported capacity claim.
- [ ] `docker compose` starts an owned environment, readiness reflects dependency state and SIGTERM closes HTTP, workers and database handles within the stated deadline.
- [ ] The release record identifies source revision, lockfile, image digest, migration and test results; rollback compatibility is explained.
- [ ] The scheduled handler survives duplicate input without duplicate durable effect, or explicitly records why the current design cannot promise that yet.
- [ ] You can draw the runtime boundaries and explain what fails independently: client, Node process, worker, database, container scheduler, identity provider and serverless invocation.

Save this state as the `deployable-service` release or tag.

## Coverage map for the first three sections

The map keeps the project small while ensuring no sidebar chapter disappears. “Used” means you implement it; “decision” means you must reason about it but should not force an unnecessary technology into the code.

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
| Networking | P2 HTTP contracts, TLS-aware owned dependency and streaming |
| Development-tool workflows | P2 repeatable check/test/start/debug evidence |
| Errors | P2 public/private error taxonomy and async ownership |
| Testing | P2 unit/integration/contract/adapter/load evidence |
| Frameworks | P2 Express implementation and Nest concept map |
| Patterns | P2 four justified patterns plus one explicit rejection |
| Concurrency | P3 bounded worker pool and terminal-outcome tests |
| Architecture | P3 dependency direction, composition root and boundaries |
| Authentication | P3 token verification, principal and authorization policy |
| Database fundamentals | P3 PostgreSQL constraints, transactions, queries and migrations |
| Docker | P3 image, Compose, health, permissions and shutdown |
| Cloud | P3 one documented container/managed-database target |
| Serverless | P3 one reused scheduled use case and delivery-semantics test |
| Deployment | P3 immutable release, migration order, rollback and recovery evidence |

The full GoF catalogue remains study material. **This project demonstrates pattern judgment, not implementation of all 23 patterns.** Likewise, one cloud path plus one bounded serverless comparison gives useful depth without pretending that AWS, Azure and Google Cloud are interchangeable checkboxes.

## Personal progress scorecard

Material availability is not learner completion. Update this only from your own repository evidence.

| Milestone | Not started | Building | Release checks pass | Explained from memory later |
|---|---:|---:|---:|---:|
| Foundations CLI | [ ] | [ ] | [ ] | [ ] |
| HTTP application | [ ] | [ ] | [ ] | [ ] |
| Deployable service | [ ] | [ ] | [ ] | [ ] |

After each release, wait at least one day and answer these without the code:

1. Where does this program wait, and what can still make progress while it waits?
2. Who owns every resource and every asynchronous failure?
3. Which invariant is enforced in the domain, transport and database, and why at that boundary?
4. What evidence distinguishes a code defect from dependency wait, overload or configuration failure?
5. Which current abstraction would you remove if the requirement disappeared?

If an answer is vague, return to the corresponding failure drill. **Recall improves when you reconstruct the decision and symptom, not when you reread a finished solution.**

## Official references

- [Node.js 24 API index](https://nodejs.org/docs/latest-v24.x/api/) and [Node release policy](https://nodejs.org/en/about/previous-releases)
- [Express 5 routing](https://expressjs.com/en/5x/guide/routing/), [error handling](https://expressjs.com/en/5x/guide/error-handling/) and [production reliability](https://expressjs.com/en/advanced/best-practice-performance/)
- [Node test runner](https://nodejs.org/docs/latest-v24.x/api/test.html) and [worker threads](https://nodejs.org/docs/latest-v24.x/api/worker_threads.html)
- [NestJS concepts](https://docs.nestjs.com/)
- [MikroORM 7 quick start](https://mikro-orm.io/docs/quick-start), [transactions](https://mikro-orm.io/docs/transactions) and [migrations](https://mikro-orm.io/docs/migrations)
- [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html) and [EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html)
- [Docker's Node.js guide](https://docs.docker.com/guides/nodejs/) and [build practices](https://docs.docker.com/build/building/best-practices/)

