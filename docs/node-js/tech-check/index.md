# Node.js tech-check

A question-and-answer study guide for a frontend developer preparing for a Node.js/full-stack technical examination. **Current target: Level 3, then Level 4 of the supplied five-level Node.js Tech Check ladder.** Open the [level-by-level progress and personal scorecard](./progress.md#five-level-ladder) for the reconciled 214-item inventory and all 32 ladder checkpoints. Material: **185/214 written (86.4%)**, 29 open; learner progress is not assessed.

Prefer learning by building? The [three progressive Node.js projects](./progressive-projects.md) turn the first three menu sections into one evolving CLI → HTTP application → deployable service. Each milestone has four cumulative increments, failure drills and release criteria; it does not create one unrelated task for every topic.

The following Software Engineer Level2 mapping is preserved as earlier context on a different scale. Career Level2 means the supplied Software Engineer column: Intermediate for the specified development/engineering/cloud/Docker/AI skills, and Novice for performance, security and infrastructure. It does not require Advanced/Expert proficiency throughout. Explain mechanisms, reason about code, implement a small feature and diagnose failures at each stated target. Foundational/intermediate/advanced are study-depth labels, not official exam grades or claims that a question will appear.

All original25 groups and their IDs remain. Genuinely new scope was appended as T26–T34; overlapping requirements extend existing owners. The user has since removed T26–T29 and T31–T34 from the coverage-checklist view; the combined tracker preserves their mapping and history. The [combined Level2 tracker](./progress.md#level2-reconciliation) records target/source classification, priority, audit, writing and verification separately. Existing checked items preserve historical writing and do not automatically establish adequacy against the corrected scope. [Coverage checklist](./coverage.md) tracks every supplied bullet; [batch progress](./progress.md) records the next unfinished question. Questions have stable IDs and include a short spoken answer, detailed explanation, example, mistakes, answered follow-ups and takeaway. Code questions appear before their answers. Completed groups end with revision and mixed practice, with answers after all practice questions.

**Node.js Foundations material is complete:** 52 questions across seven sidebar chapters, covering all 49 mapped Level 1 subtopics. [Framework foundations](./16-frameworks.md) closes the four remaining basic-framework tasks. Learner exercises, the external Core JS prerequisite and higher-level framework scope remain separate.

**Building Node.js Applications:** all seven entries have material. [Menu-based status](./progress.md#applications-sidebar) tracks Events, Networking, Development-tool workflows, Errors, Testing, Frameworks and Patterns separately from the 44-item primary-level allocation. Errors, all eight [Testing topics](./15-testing.md), and all thirteen [Framework topics](./16-frameworks.md#application-frameworks) have written material and author checks. [Patterns](./18-patterns.md#full-worked-catalogue) now covers all23 GoF patterns with worked material across the overview and four focused pages. The remaining Networking and development-tool batches are complete. **All seven Applications menu entries now have their mapped material**; learner practice remains unassessed. **Designing Node.js Services now has all eight requested entries:** [Concurrency](./09-concurrency.md), [Architecture](./18-architecture.md), [Authentication](./13-authentication-and-authorization.md), [Database fundamentals](./17-databases.md), [Docker](./23-containerization.md), [Cloud](./30-cloud-fundamentals.md), [Serverless](./20-serverless.md) and [Deployment](./24-deployment.md). See the [checks, limitations and next checkpoint](./progress.md#services-completion). Material completion does not establish the remaining primary-level topics or learner checkpoints.

**Hardening and Optimizing Node.js Services:** all five entries now have material: [Security](./14-security.md), [advanced authentication](./13-authentication-and-authorization.md#t13-q06), [Performance and V8](./12-performance-and-v8.md), [deeper data access](./17-databases.md#t17-q09) and [advanced APIs/frameworks](./16-advanced-api-frameworks.md). The [reconciliation](./progress.md#hardening-completion) distinguishes completed material from local checks, real integration and learner evidence. The primary Level3/4 topic allocations are now fully written; this is not an awarded level or completion of prerequisite/advanced practice.

## Batch sequence

Continue in small batches of one focused question, splitting a topic across batches when necessary. No placeholder heading counts as an answer. The sequence below is proposed, not a fixed limit on the number of questions.

| Sequence | Scope | Status |
|---|---|---|
| B01 | T01-Q01–Q04: runtime, browser differences/V8, nonblocking execution, sync/async choices, core CLI/service | Written |
| B02 | T02-Q01–Q04: CLI/options/arguments, environment/config, REPL and standard streams | Written |
| B03 | T02-Q05–Q08: lifecycle/exit codes, Process API, child processes/fork/IPC; group revision | Written |
| B04 | T03-Q01–Q04: module kinds, modes, scope/cache and module API | Written |
| B05 | T03-Q05–Q08: entries, async loading, diagnosis and cycles | Written |
| B06 | T04-Q01–Q04: package structure, install/configuration and scripts | Written |
| B07 | T04-Q05–Q08: versions, registry identity, build tasks and diagnosis | Written |
| B08 | T05-Q01–Q04: callbacks, promises, async/await and error ownership | Written |
| B09 | T05-Q05–Q08: control flow, cancellation and async iteration | Written |
| B10 | T06-Q01–Q04: events, waiting and context-specific scheduling | Written |
| B11 | T06-Q05–Q08: OS/libuv, signals and loop diagnosis | Written |
| B12 | T07-Q01–Q04: Console, filesystem, Path and OS | Written |
| B13 | T07-Q05–Q08: Buffer/decoding, timers and URL/URI | Written |
| B14 | T07-Q09–Q12: streams, readline, crypto and compression | Written |
| B15 | T08-Q01–Q04: TCP, IP/UDP, HTTPS and DNS | Written |
| B16 | T08-Q05–Q08: real-time transports and production selection | Written |
| R01 | Map all96 corrected source bullets; initial bounded content audit; preserve B16 checkpoint | Recorded; audit partial |
| R02a | Three core requirements audited; adequate material preserved | Recorded |
| L2-W01 | T29-Q01: one focused build/test/serve workflow lesson | Written and example-checked |
| R02b | A06–A08 audited; callback definition corrected; adequate material preserved | Recorded |
| R02c | Audit B01/B03/B04 tool configuration, debugging and logging | Next |
| B17a | T09-Q01: process/thread isolation and owned worker experiment | Written and checked |
| B17b | T09-Q02: worker failure, deadlines and caller cancellation | Written and checked |
| B17c | T09-Q03: copying, transfer and shared-memory ownership | Written and checked |
| APP01 | T08-Q09: HTTP methods, status, headers, payloads and inspection | Written and example-checked |
| APP02 | T08-Q10: browser requests and asynchronous communication | Written and checked |
| APP-E01–E02 | T10-Q01–Q02: Error classes, custom errors and causes | Written and example-checked |
| APP-E03 | T10-Q03: asynchronous errors and promise ownership | Written and example-checked |
| APP-E04 | T10-Q04: runtime-error diagnosis | Written and example-checked |
| APP-E05 | T10-Q05: criticality and recovery policy | Written and example-checked |
| APP-E06 | T10-Q06: Express error middleware | Written and real HTTP-checked |
| APP-E07 | T10-Q07: database errors and transaction retries; chapter revision | Written; real PostgreSQL and labeled simulations checked |
| APP-T01–T08 | T15-Q01–Q08: all eight Testing topics, sequential examples and revision | Written and checked;43 tests/6 suites, coverage and separate load/benchmark checks |
| APP-F01 | T16-Q05: application routing and controller lifecycle | Written and checked |
| F01–F04 | T16-Q01–Q04: framework concepts, choice, setup, configuration | Written and example-checked |
| Services sequence | Eight requested entries, one file per batch | Written; see Services reconciliation |
| Hardening sequence | Security, advanced identity, performance/V8, deeper data and advanced API/frameworks | Written; see Hardening reconciliation |
| Following batches | T11 debugging | Planned; existing source audit retained |
| Source audit | Separate96-reference adequacy audit | Preserved; authored material does not silently reclassify it |
| Following batches | T19/T21/T22/T25: messaging, logging, monitoring and documentation | Planned; retained original scope |

## The original25 topic groups

- [1. Runtime fundamentals](./01-runtime-fundamentals.md) — first batch complete.
- [2. CLI and process management](./02-cli-and-processes.md) — B02–B03 complete.
- [3. Modules](./03-modules.md) — B04–B05 complete.
- [4. Package management](./04-package-management.md) — B06–B07 complete.
- [5. Asynchronous programming](./05-asynchronous-programming.md) — B08–B09 complete.
- [6. Events and event loop](./06-events-and-event-loop.md) — B10–B11 complete.
- [7. Core APIs and data handling](./07-core-apis.md) — B12–B14 complete.
- [8. Networking](./08-networking.md) — eleven questions; all ten mapped subtopics written, including browser interaction and owned pooling.
- [9. Concurrency](./09-concurrency.md) — eight questions written; all five source scopes have material and bounded author checks; learner practice remains required.
- [10. Error handling](./10-error-handling.md) — all seven source items written; HTTP/database examples checked, learner practice remains required.
- **11. Debugging** — planned; subtopics retained in the checklist.
- [12. Performance and V8](./12-performance-and-v8.md) — all eleven source atoms written, with profile/metric/cache fixtures and practical measurement criteria.
- [13. Authentication and authorization](./13-authentication-and-authorization.md) — mapped study material written; integration/practice evidence remains separate.
- [14. Security](./14-security.md) — all thirteen source atoms written, with bounded examples and explicit integration/security limits.
- [15. Testing](./15-testing.md) — all eight source topics written; separate learner exercises remain required.
- [16. Frameworks and web application development](./16-frameworks.md) — thirteen base questions plus [five advanced API/framework extensions](./16-advanced-api-frameworks.md): Express primary, Nest companion; learner practice remains required.
- [17. Databases and data access](./17-databases.md) — mapped study material written; integration/practice evidence remains separate.
- [18. Design patterns](./18-patterns.md) — full23-pattern worked catalogue,23 questions across five pages; [six architecture questions](./18-architecture.md) complete the broader retained source scope.
- **19. Queues and messaging** — planned; subtopics retained in the checklist.
- [20. Serverless](./20-serverless.md) — mapped study material written; integration/practice evidence remains separate.
- **21. Logging** — planned; subtopics retained in the checklist.
- **22. Monitoring and visualization** — planned; subtopics retained in the checklist.
- [23. Containerization](./23-containerization.md) — mapped study material written; integration/practice evidence remains separate.
- [24. Deployment and delivery](./24-deployment.md) — mapped study material written; integration/practice evidence remains separate.
- **25. Documentation** — planned; subtopics retained in the checklist.

## Appended groups and ownership

The checklist now retains only the cloud/VM addition below. Removed checklist sections remain documented in the combined tracker, and the existing [development-tools lesson](./29-development-tools.md) is preserved. Historical owner descriptions follow; they are not a request to restore removed checklist sections. These are inventory owners, not newly completed chapters. No original group is renumbered. General cloud/VM material is distinct from T20 serverless implementation; development-tool configuration links existing T04 scripts, T11 debugging and T15 tests rather than duplicating them. Design patterns/software design stay T18.

- [30. Cloud fundamentals and virtual machines](./30-cloud-fundamentals.md) — seven mapped topics have material; actual provider/VM practice remains required.

## Initial Level2 gap report — partial audit (R01 history)

- **L2-B02 / Intermediate / HIGH / partially covered:** [T04-Q07](./04-package-management.md#t04-q07) covers build/test output and failure order. Reconcile source coverage and add a serve/start, readiness and shutdown workflow. Classification: verified detailed requirement in the saved Level2 column.
- **L2-A01, L2-A02 and L2-G06:** inspected material adequately covers small CLI/service scripts, callback/promise filesystem operations and TLS/certificate/body lifetime at the supplied depth. Historical example checks are retained; this planning round did not rerun them.
- **L2-K03 / Intermediate / HIGH / partially covered:** [T07-Q11](./07-core-apis.md#t07-q11) and the source crypto section explain hashes/HMAC and encryption concepts; worked symmetric encryption/decryption and public-key use still need source reconciliation and expansion under T07. This explicit requirement is not reduced to Novice with the separate security skill.
- **Other91 supplied source bullets:** not yet audited at corrected depth. Candidate files and exact next actions are in the combined tracker. No dedicated Q&A yet for appended tasks does not prove the broader source notes lack the topic.
- **New explicit audit areas:** lint/format/configuration, HTTP inspection/sessions/browser interaction, novice security/performance, cloud/VM/storage/database practice, SQL/merge terminology and Docker operation/CI. Labels alone do not establish these gaps are absent everywhere; inspect before duplicating.
- **Label-only skills:** bounded JavaScript/TypeScript/bundler/design/practices/processes/AI detail is inferred preparation. The supplied Level Up.mhtml confirms the eight Intermediate labels but their cells contain no detailed syllabus.
- **LOW retained enrichment:** deep V8/GC optimization, remote debugger deployment, sandbox internals, specialized broker/serverless/monitoring products and stress tooling. Introductory coverage stays planned. Explicit intermediate concurrency troubleshooting and practical cloud requirements remain required.

The saved Level Up Software Engineer column is now structurally verified:21 technical skills,17 Intermediate and4 Novice. Its general descriptions/higher columns are context, not added mandates. Read the [96-reference mapping and240-task ledger](./progress.md#level2-reconciliation) for every requirement, source classification, priority reason, coverage status, evidence/search lead and remaining action. Current update: R02a audited three more core requirements and L2-W01 resolved B02 with [T29-Q01](./29-development-tools.md#t29-q01). R02b additionally audited A06–A08 and corrected the callback definition in the source course. Source audit is now10 adequate,1 partial,85 unknown; original R01 figures above are historical. All8 Core requirements are audited; After the checklist exclusions, B17a resumed concurrency with one question. Current source audit:10 adequate,2 partial,84 unknown. B17b added T09-Q02 with the existing helper and checked cancellation/cleanup. Next is B17c/T09-Q03; the tooling audit queue remains preserved. Learner progress remains separate.

## Runtime and scope

The written batches use dependency-free JavaScript on Node24 with explicit ES Module (`.mjs`) and CommonJS (`.cjs`) context; examples were checked on the actual local runtime recorded in progress. Official Node24 documentation was checked2026-11-04. This is a stated baseline, not a claim that Node24 is the newest release. Future questions will state dependencies and context individually.

This exam section complements the [runtime course](../index.md) and [Node exercises](../../practice/node-js/index.md). Cross-links can deepen an answer but do not replace it. Autocode submissions retain their supplied build/Jest/database/coverage setup; no edits to protected src/tests and no remote push are part of this guide. Examples labeled teaching services are local fixtures with explicit limits, not production deployment templates.
