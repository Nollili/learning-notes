# Node.js tech-check coverage checklist

**Current target: Node Tech Check Levels 3–4.** [Five-level grouping and personal progress](./progress.md#five-level-ladder) reconciles all **214 entries: 161 written, 53 open**. Checkmarks describe material, not your demonstrated level. Earlier “Level2” labels below refer to the separate preserved Software Engineer mapping.

The original25 groups and187 source IDs below preserve the original scope. Added Level2 requirements extend existing groups and retain T30 cloud/VM coverage. At the user’s request, T26–T29 and T31–T34 are omitted from this checklist; their source mapping/history and existing notes remain in the combined tracker. No original T01–T25 item is deleted or renumbered. Each original bullet is one retained source subtopic with a stable ID. Added bullets are canonical preparation tasks classified in the combined tracker; they are not all quoted official source requirements. Checked means historically written at its original scope, not newly audited as adequate for Level2 and not learner mastery. The single [combined tracker](./progress.md#level2-reconciliation) records target depth, priority, audit, writing and verification separately. Broad labels may need several questions; question counts can grow rather than compressing answers. Shared ownership notes identify deliberate overlaps, not exemptions from the local group's required depth.

## Terminology and interpretation decisions

- “Global Async” is not a Node API. T03-Q06 interprets this as asynchronous module loading with dynamic import, ES-module top-level await, and async work at module initialization; distinguish these explicitly.
- “URI API” in T07 means WHATWG URL/URLSearchParams, encoding boundaries and relevant node:url interoperability; no fictional URI module will be invented.
- “Multithreading” in T09 requires worker_threads. child_process.fork and cluster create processes; they are not threads.
- “V8 API” in T12 distinguishes node:v8 diagnostics from V8 internals/native interfaces; using Node does not require implementing native bindings.
- “Error criticality matrix” is an application recovery/impact policy, not a built-in Node class or official grading system.
- Named databases, brokers, cloud functions and observability products remain in scope for purpose/comparison/configuration questions; advanced labels do not imply a separate complete product course.

## 1. Runtime fundamentals

- [x] **T01-S01** Node.js purpose, server-side JavaScript, and differences from browser JavaScript — covered by [T01-Q01](./01-runtime-fundamentals.md#t01-q01)
- [x] **T01-S02** Cross-platform runtime and V8 engine — covered by [T01-Q01](./01-runtime-fundamentals.md#t01-q01)
- [x] **T01-S03** Event-driven, non-blocking execution — covered by [T01-Q02](./01-runtime-fundamentals.md#t01-q02)
- [x] **T01-S04** Synchronous versus asynchronous APIs and their performance tradeoffs — covered by [T01-Q03](./01-runtime-fundamentals.md#t01-q03)
- [x] **T01-S05** Using core modules to build CLI tools and services — covered by [T01-Q04](./01-runtime-fundamentals.md#t01-q04)

## 2. CLI and process management

- [x] **T02-S01** Basic Node.js commands and built-in CLI options — covered by [T02-Q01](./02-cli-and-processes.md#t02-q01)
- [x] **T02-S02** Running scripts and reading process arguments — covered by [T02-Q01](./02-cli-and-processes.md#t02-q01)
- [x] **T02-S03** Environment variables and configuration — covered by [T02-Q02](./02-cli-and-processes.md#t02-q02)
- [x] **T02-S04** REPL — covered by [T02-Q03](./02-cli-and-processes.md#t02-q03)
- [x] **T02-S05** Process lifecycle and exit codes — covered by [T02-Q05](./02-cli-and-processes.md#t02-q05)
- [x] **T02-S06** Standard input, output, and error — covered by [T02-Q04](./02-cli-and-processes.md#t02-q04)
- [x] **T02-S07** Process API — covered by [T02-Q06](./02-cli-and-processes.md#t02-q06)
- [x] **T02-S08** Child processes, `fork`, and inter-process communication (IPC) — covered by [T02-Q08](./02-cli-and-processes.md#t02-q08)

## 3. Modules

- [x] **T03-S01** Built-in modules versus third-party packages — covered by [T03-Q01](./03-modules.md#t03-q01)
- [x] **T03-S02** CommonJS and ES Modules — covered by [T03-Q02](./03-modules.md#t03-q02)
- [x] **T03-S03** Module scope and global objects — covered by [T03-Q03](./03-modules.md#t03-q03)
- [x] **T03-S04** Module loading system — covered by [T03-Q08](./03-modules.md#t03-q08)
- [x] **T03-S05** Module object and Module API — covered by [T03-Q04](./03-modules.md#t03-q04)
- [x] **T03-S06** Package entry points — covered by [T03-Q05](./03-modules.md#t03-q05)
- [x] **T03-S07** Asynchronous modules and “Global Async” — wording unclear in the source — covered by [T03-Q06](./03-modules.md#t03-q06)
- [x] **T03-S08** Diagnosing module-loading issues — covered by [T03-Q07](./03-modules.md#t03-q07)

## 4. Package management

- [x] **T04-S01** Package-manager CLI options — covered by [T04-Q03](./04-package-management.md#t04-q03)
- [x] **T04-S02** Package structure and `package.json` — covered by [T04-Q01](./04-package-management.md#t04-q01)
- [x] **T04-S03** Installing and managing dependencies — covered by [T04-Q02](./04-package-management.md#t04-q02)
- [x] **T04-S04** Package-manager configuration — covered by [T04-Q03](./04-package-management.md#t04-q03)
- [x] **T04-S05** Package scripts and npm scripts — covered by [T04-Q04](./04-package-management.md#t04-q04)
- [x] **T04-S06** Package managers as build tools — covered by [T04-Q07](./04-package-management.md#t04-q07)
- [x] **T04-S07** Semantic versioning — covered by [T04-Q05](./04-package-management.md#t04-q05)
- [x] **T04-S08** Package registries — covered by [T04-Q06](./04-package-management.md#t04-q06)

## 5. Asynchronous programming

- [x] **T05-S01** Callbacks — covered by [T05-Q01](./05-asynchronous-programming.md#t05-q01)
- [x] **T05-S02** Promises — covered by [T05-Q02](./05-asynchronous-programming.md#t05-q02)
- [x] **T05-S03** `async` / `await` — covered by [T05-Q03](./05-asynchronous-programming.md#t05-q03)
- [x] **T05-S04** Asynchronous patterns, tools, and control flow — covered by [T05-Q05](./05-asynchronous-programming.md#t05-q05)
- [x] **T05-S05** Async iterators and async generators — covered by [T05-Q08](./05-asynchronous-programming.md#t05-q08)

## 6. Events and event loop

- [x] **T06-S01** Event-driven programming — covered by [T06-Q01](./06-events-and-event-loop.md#t06-q01)
- [x] **T06-S02** Event loop and diagnosing its behavior — covered by [T06-Q07](./06-events-and-event-loop.md#t06-q07)
- [x] **T06-S03** `EventEmitter` and custom event emitters — covered by [T06-Q01](./06-events-and-event-loop.md#t06-q01)
- [x] **T06-S04** OS event handlers — covered by [T06-Q06](./06-events-and-event-loop.md#t06-q06)
- [x] **T06-S05** libuv — covered by [T06-Q05](./06-events-and-event-loop.md#t06-q05)

## 7. Core APIs and data handling

- [x] **T07-S01** Console — covered by [T07-Q01](./07-core-apis.md#t07-q01)
- [x] **T07-S02** File system: asynchronous file reading and writing using callbacks and promises — covered by [T07-Q02](./07-core-apis.md#t07-q02)
- [x] **T07-S03** Path — covered by [T07-Q03](./07-core-apis.md#t07-q03)
- [x] **T07-S04** OS — covered by [T07-Q04](./07-core-apis.md#t07-q04)
- [x] **T07-S05** String Decoder — covered by [T07-Q06](./07-core-apis.md#t07-q06)
- [x] **T07-S06** Timers — covered by [T07-Q07](./07-core-apis.md#t07-q07)
- [x] **T07-S07** URI API — as named in the source — covered by [T07-Q08](./07-core-apis.md#t07-q08)
- [x] **T07-S08** Buffers and their memory/performance tradeoffs — covered by [T07-Q05](./07-core-apis.md#t07-q05)
- [x] **T07-S09** Streams and backpressure — covered by [T07-Q09](./07-core-apis.md#t07-q09)
- [x] **T07-S10** Readline — covered by [T07-Q10](./07-core-apis.md#t07-q10)
- [x] **T07-S11** Crypto — covered by [T07-Q11](./07-core-apis.md#t07-q11)
- [x] **T07-S12** Zlib compression — covered by [T07-Q12](./07-core-apis.md#t07-q12)

## 8. Networking and real-time applications

- [x] **T08-S01** Network APIs and Net API — covered by [T08-Q01](./08-networking.md#t08-q01)
- [x] **T08-S02** HTTPS — covered by [T08-Q03](./08-networking.md#t08-q03)
- [x] **T08-S03** DNS API — covered by [T08-Q04](./08-networking.md#t08-q04)
- [x] **T08-S04** WebSockets — covered by [T08-Q06](./08-networking.md#t08-q06)
- [x] **T08-S05** Socket.IO — covered by [T08-Q07](./08-networking.md#t08-q07)
- [x] **T08-S06** IP sockets — covered by [T08-Q02](./08-networking.md#t08-q02)
- [x] **T08-S07** Selecting networking APIs for production applications — covered by [T08-Q08](./08-networking.md#t08-q08)


### Added Level2 preparation scope

- [x] **T08-S08** HTTP methods, status codes, headers, payloads and request/response inspection — covered by [HTTP exchange inspection](./08-networking.md#t08-q09); learner browser-inspection practice remains required
- [x] **T08-S09** Browser request/response versus asynchronous communication — written in [Networking](./08-networking.md#t08-q10); owned author checks pass; learner practice required
- [x] **T08-S10** HTTP connection reuse and owned client pooling — written in [Networking](./08-networking.md#t08-q11); owned author checks pass; learner practice required

## 9. Concurrency

- [x] **T09-S01** Cluster API and clustering — learning material written in [worked questions](./09-concurrency.md#t09-q05); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T09-S02** Forking processes — learning material written in [worked questions](./09-concurrency.md#t09-q06); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T09-S03** Multithreading — grouped with fork/clustering in the source — written across [worker isolation/lifecycle/ownership/pool questions](./09-concurrency.md); one-worker pool policy verified, broader cluster/IPC/production selection and learner practice remain separate
- [x] **T09-S04** Child-process interactions and IPC — learning material written in [worked questions](./09-concurrency.md#t09-q07); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T09-S05** Choosing concurrency approaches for production — learning material written in [worked questions](./09-concurrency.md#t09-q08); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required

## 10. Error handling

- [x] **T10-S01** `Error` class — covered by [error handling](./10-error-handling.md#t10-q01); learner practice remains required
- [x] **T10-S02** Custom errors — covered by [error handling](./10-error-handling.md#t10-q02); learner practice remains required
- [x] **T10-S03** Asynchronous errors and promise rejections — covered by [async failure ownership](./10-error-handling.md#t10-q03); learner practice remains required
- [x] **T10-S04** Runtime-error diagnosis — covered by [runtime-failure diagnosis](./10-error-handling.md#t10-q04); learner debugger practice remains required
- [x] **T10-S05** Error criticality matrix — covered by [criticality and recovery policy](./10-error-handling.md#t10-q05); learner application/lifecycle practice remains required
- [x] **T10-S06** Framework error-handling middleware — covered by [error handling](./10-error-handling.md#t10-q06); learner implementation/integration practice remains required
- [x] **T10-S07** Database errors and retries — covered by [error handling](./10-error-handling.md#t10-q07); learner implementation/integration practice remains required

## 11. Debugging

- [ ] **T11-S01** Native debugging — pending
- [ ] **T11-S02** Inspectors and specialized tools — pending
- [ ] **T11-S03** Remote debugging — pending
- [ ] **T11-S04** Debugging asynchronous code — pending
- [ ] **T11-S05** Diagnosing memory leaks — pending
- [ ] **T11-S06** Troubleshooting framework setup and runtime issues — pending

## 12. Performance and V8

- [ ] **T12-S01** V8 API and optimizations — pending
- [ ] **T12-S02** Profilers — pending
- [ ] **T12-S03** Performance API — pending
- [ ] **T12-S04** Performance testing tools — pending
- [ ] **T12-S05** Memory usage — pending
- [ ] **T12-S06** Buffer performance — pending
- [ ] **T12-S07** Synchronous versus asynchronous API tradeoffs — pending; shared explanation owner: T01-S04 (foundation); workload/profiling depth stays in T12
- [ ] **T12-S08** Framework performance practices — pending
- [ ] **T12-S09** Performance versus scalability — pending


### Added Level2 preparation scope

- [ ] **T12-S10** Simple caching: freshness, invalidation and bounded storage — pending
- [ ] **T12-S11** CPU, memory, loop activity, I/O latency and throughput/latency vocabulary — pending

## 13. Authentication and authorization

- [x] **T13-S01** JWT — learning material written in [worked questions](./13-authentication-and-authorization.md#t13-q03); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T13-S02** Passport.js — learning material written in [worked questions](./13-authentication-and-authorization.md#t13-q04); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T13-S03** Passport.js strategies — learning material written in [worked questions](./13-authentication-and-authorization.md#t13-q04); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T13-S04** Third-party authentication services — learning material written in [worked questions](./13-authentication-and-authorization.md#t13-q05); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T13-S05** Authentication and authorization in microservices — learning material written in [worked questions](./13-authentication-and-authorization.md#t13-q05); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T13-S06** Authentication middleware — learning material written in [worked questions](./13-authentication-and-authorization.md#t13-q04); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required


### Added Level2 preparation scope

- [x] **T13-S07** Authentication versus authorization — learning material written in [worked questions](./13-authentication-and-authorization.md#t13-q01); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T13-S08** Cookies, sessions and token lifecycle fundamentals — learning material written in [worked questions](./13-authentication-and-authorization.md#t13-q02); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required

## 14. Security

- [ ] **T14-S01** Basic security practices and approaches — pending
- [ ] **T14-S02** npm audit — pending
- [ ] **T14-S03** Helmet — pending
- [ ] **T14-S04** Sandboxing unsafe code — pending
- [ ] **T14-S05** Third-party security-checking services — pending
- [ ] **T14-S06** Input/data validation — pending
- [ ] **T14-S07** Parameterized queries and injection prevention — pending
- [ ] **T14-S08** Secure database credentials — pending
- [ ] **T14-S09** Encrypted database connections — pending
- [ ] **T14-S10** Framework security practices — pending


### Added Level2 preparation scope

- [ ] **T14-S11** Password-storage fundamentals and weak password handling — pending
- [ ] **T14-S12** Context-appropriate output encoding and unsanitized input — pending
- [ ] **T14-S13** XSS, SSRF, CSRF and injection awareness with basic countermeasures — pending

## 15. Testing

- [x] **T15-S01** Unit testing — covered by [Testing](./15-testing.md#t15-q01); learner practice remains required
- [x] **T15-S02** Contract testing — covered by [Testing](./15-testing.md#t15-q02); learner practice remains required
- [x] **T15-S03** Integration testing — covered by [Testing](./15-testing.md#t15-q03); learner practice remains required
- [x] **T15-S04** End-to-end testing — covered by [Testing](./15-testing.md#t15-q04); learner practice remains required
- [x] **T15-S05** TDD and BDD — covered by [Testing](./15-testing.md#t15-q05); learner practice remains required
- [x] **T15-S06** Stress and load testing — covered by [Testing](./15-testing.md#t15-q06); learner practice remains required
- [x] **T15-S07** Performance testing — covered by [Testing](./15-testing.md#t15-q07); learner practice remains required
- [x] **T15-S08** Testing framework-based applications — covered by [Testing](./15-testing.md#t15-q08); learner practice remains required

## 16. Frameworks and web application development

- [x] **T16-S01** Framework categories: MVC, full-stack MVC, and REST API — covered by [framework foundations](./16-frameworks.md#t16-q01); learner practice remains required
- [x] **T16-S02** Choosing frameworks for different use cases — covered by [framework foundations](./16-frameworks.md#t16-q02); learner practice remains required
- [x] **T16-S03** Framework installation, configuration, and execution — covered by [framework foundations](./16-frameworks.md#t16-q03); learner practice remains required
- [x] **T16-S04** Routing — written in [framework applications](./16-frameworks.md#t16-q05); executable author checks pass; learner practice remains required
- [x] **T16-S05** Middleware — written in [framework applications](./16-frameworks.md#t16-q06); executable author checks pass; learner practice remains required
- [x] **T16-S06** Controllers — written in [framework applications](./16-frameworks.md#t16-q07); executable author checks pass; learner practice remains required
- [x] **T16-S07** Request handling and request/response lifecycle — written in [framework applications](./16-frameworks.md#t16-q08); executable author checks pass; learner practice remains required
- [x] **T16-S08** CRUD endpoints and pages — written in [framework applications](./16-frameworks.md#t16-q09); executable author checks pass; learner practice remains required
- [x] **T16-S09** Authentication, validation, and error-handling middleware — written in [framework applications](./16-frameworks.md#t16-q10); executable author checks pass; learner practice remains required
- [x] **T16-S10** Application configuration and dependencies — covered by [framework foundations](./16-frameworks.md#t16-q04); learner practice remains required
- [x] **T16-S11** Modules, services, and reusable components — written in [framework applications](./16-frameworks.md#t16-q11); executable author checks pass; learner practice remains required
- [x] **T16-S12** Extension points and lifecycle hooks — written in [framework applications](./16-frameworks.md#t16-q12); executable author checks pass; learner practice remains required
- [x] **T16-S13** Framework deployment considerations — written in [framework applications](./16-frameworks.md#t16-q13); executable author checks pass; learner practice remains required

## 17. Databases and data access

- [x] **T17-S01** Database connectivity and connection configuration — learning material written in [worked questions](./17-databases.md#t17-q02); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T17-S02** Relational versus NoSQL databases — learning material written in [worked questions](./17-databases.md#t17-q01); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T17-S03** PostgreSQL, MySQL, and SQL Server — learning material written in [worked questions](./17-databases.md#t17-q01); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T17-S04** MongoDB and Redis — learning material written in [worked questions](./17-databases.md#t17-q01); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T17-S05** Document, key-value, and cache use cases — learning material written in [worked questions](./17-databases.md#t17-q01); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T17-S06** Native drivers and database libraries — learning material written in [worked questions](./17-databases.md#t17-q02); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T17-S07** ORMs, ODMs, and query builders — learning material written in [worked questions](./17-databases.md#t17-q06); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T17-S08** CRUD operations — learning material written in [worked questions](./17-databases.md#t17-q03); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T17-S09** Parameterized queries — learning material written in [worked questions](./17-databases.md#t17-q03); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T17-S10** Retrieving and persisting application data — learning material written in [worked questions](./17-databases.md#t17-q03); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T17-S11** Connection pooling and session management — learning material written in [worked questions](./17-databases.md#t17-q02); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T17-S12** Transactions and multi-step data operations — learning material written in [worked questions](./17-databases.md#t17-q05); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T17-S13** Consistency requirements — learning material written in [worked questions](./17-databases.md#t17-q05); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T17-S14** Schema design and awareness — learning material written in [worked questions](./17-databases.md#t17-q03); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T17-S15** Indexing — learning material written in [worked questions](./17-databases.md#t17-q07); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T17-S16** Data validation and quality — learning material written in [worked questions](./17-databases.md#t17-q03); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T17-S17** Query design and performance tuning — learning material written in [worked questions](./17-databases.md#t17-q07); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T17-S18** Database errors, retries, and logging — learning material written in [worked questions](./17-databases.md#t17-q08); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T17-S19** Secure credentials and encrypted connections — learning material written in [worked questions](./17-databases.md#t17-q02); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T17-S20** Scalable data access for APIs, microservices, and background jobs — learning material written in [worked questions](./17-databases.md#t17-q08); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required


### Added Level2 preparation scope

- [x] **T17-S21** Multi-table SQL joins, scripts and CREATE/DELETE/DROP operations — learning material written in [worked questions](./17-databases.md#t17-q04); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T17-S22** Interpret merge tables: JOIN versus UNION versus data upsert/MERGE — learning material written in [worked questions](./17-databases.md#t17-q04); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required

## 18. Architecture and design patterns

- [x] <span class="notes-section-label">**T18-S01**</span> Application structure and architecture principles — learning material written in [worked questions](./18-architecture.md#t18-q24); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] <span class="notes-section-label">**T18-S02**</span> Maintainable modules, services, and reusable components — learning material written in [worked questions](./18-architecture.md#t18-q25); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] <span class="notes-section-label">**T18-S03**</span> GoF creational, structural, and behavioral patterns — full [23-pattern worked catalogue](./18-patterns.md#full-worked-catalogue);19 expanded examples plus four reused pattern implementations verified; learner practice remains required
- [x] <span class="notes-section-label">**T18-S04**</span> Basic and advanced microservices practices — learning material written in [worked questions](./18-architecture.md#t18-q26); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] <span class="notes-section-label">**T18-S05**</span> Consistency patterns — learning material written in [worked questions](./18-architecture.md#t18-q27); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] <span class="notes-section-label">**T18-S06**</span> Availability versus consistency — learning material written in [worked questions](./18-architecture.md#t18-q28); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] <span class="notes-section-label">**T18-S07**</span> Performance and scalability practices — learning material written in [worked questions](./18-architecture.md#t18-q29); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required

## 19. Queues and messaging

- [ ] **T19-S01** Messaging tools and solutions — pending
- [ ] **T19-S02** RabbitMQ — pending
- [ ] **T19-S03** ActiveMQ — pending
- [ ] **T19-S04** Kafka — pending
- [ ] **T19-S05** Amazon SQS — pending
- [ ] **T19-S06** Amazon SNS — pending
- [ ] **T19-S07** Failover techniques — pending

## 20. Serverless

- [x] **T20-S01** Serverless code implementation — learning material written in [worked questions](./20-serverless.md#t20-q01); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T20-S02** AWS Lambda — learning material written in [worked questions](./20-serverless.md#t20-q02); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T20-S03** Azure Functions — learning material written in [worked questions](./20-serverless.md#t20-q05); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T20-S04** Google Cloud Functions — learning material written in [worked questions](./20-serverless.md#t20-q05); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T20-S05** Extended configuration and advanced usage — learning material written in [worked questions](./20-serverless.md#t20-q04); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required

## 21. Logging

- [ ] **T21-S01** Logger types and logging levels — pending
- [ ] **T21-S02** Logging tools and libraries — pending
- [ ] **T21-S03** Winston and Logstash — pending
- [ ] **T21-S04** Remote logging services — pending
- [ ] **T21-S05** Logging configuration and setup — pending
- [ ] **T21-S06** Logging within frameworks and database operations — pending

## 22. Monitoring and visualization

- [ ] **T22-S01** Purpose of monitoring and visualization tools — pending
- [ ] **T22-S02** Setup and use of third-party services — pending
- [ ] **T22-S03** Kibana — pending
- [ ] **T22-S04** Grafana — pending
- [ ] **T22-S05** Graphite — pending
- [ ] **T22-S06** Prometheus — pending
- [ ] **T22-S07** Zabbix — pending

## 23. Containerization

- [x] **T23-S01** Containerization practices and approaches — learning material written in [worked questions](./23-containerization.md#t23-q01); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T23-S02** Docker — learning material written in [worked questions](./23-containerization.md#t23-q01); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T23-S03** Docker Compose — learning material written in [worked questions](./23-containerization.md#t23-q03); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T23-S04** Docker images — learning material written in [worked questions](./23-containerization.md#t23-q02); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T23-S05** Container management and orchestration — learning material written in [worked questions](./23-containerization.md#t23-q04); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required


### Added Level2 preparation scope

- [x] **T23-S06** Tags, digests and registry authentication — learning material written in [worked questions](./23-containerization.md#t23-q04); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T23-S07** Published ports, container DNS and user-defined networks — learning material written in [worked questions](./23-containerization.md#t23-q03); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T23-S08** Build context/cache and non-root execution — learning material written in [worked questions](./23-containerization.md#t23-q02); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T23-S09** Startup, networking and file-permission troubleshooting — learning material written in [worked questions](./23-containerization.md#t23-q05); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T23-S10** Logs, inspect output and container-shell diagnosis — learning material written in [worked questions](./23-containerization.md#t23-q05); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required

## 24. Deployment and delivery

- [x] **T24-S01** npm scripts — learning material written in [worked questions](./24-deployment.md#t24-q01); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T24-S02** CI/CD — learning material written in [worked questions](./24-deployment.md#t24-q02); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T24-S03** SSH and command-line tools — learning material written in [worked questions](./24-deployment.md#t24-q03); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T24-S04** Cloud deployment — learning material written in [worked questions](./24-deployment.md#t24-q05); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T24-S05** Framework deployment considerations — learning material written in [worked questions](./24-deployment.md#t24-q04); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required


### Added Level2 preparation scope

- [x] **T24-S06** One-environment runtime settings, secrets and dependencies — learning material written in [worked questions](./24-deployment.md#t24-q03); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T24-S07** Health checks and basic process-management operation — learning material written in [worked questions](./24-deployment.md#t24-q04); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T24-S08** Existing Docker build in CI: tests, immutable artifact and registry publication preparation — learning material written in [worked questions](./24-deployment.md#t24-q02); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required

## 25. Documentation

- [ ] **T25-S01** JSDoc — pending
- [ ] **T25-S02** Third-party documentation tools and services — pending
- [ ] **T25-S03** Using documentation to work with core APIs, frameworks, and troubleshooting — pending


## 30. Cloud fundamentals and virtual machines {#t30}

- [x] **T30-S01** VMs, containers, managed compute and scalability concepts — learning material written in [worked questions](./30-cloud-fundamentals.md#t30-q01); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T30-S02** Create/configure a VM, snapshots/backups/restore and virtual devices — learning material written in [worked questions](./30-cloud-fundamentals.md#t30-q02); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T30-S03** IaaS, PaaS, SaaS and FaaS responsibility models — learning material written in [worked questions](./30-cloud-fundamentals.md#t30-q01); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T30-S04** Practical object/block/file storage choice and owned example — learning material written in [worked questions](./30-cloud-fundamentals.md#t30-q03); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T30-S05** Practical managed cloud database connection/configuration — learning material written in [worked questions](./30-cloud-fundamentals.md#t30-q04); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T30-S06** Basic cloud IAM, secrets, network exposure and shared responsibility — learning material written in [worked questions](./30-cloud-fundamentals.md#t30-q05); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
- [x] **T30-S07** One AWS deployment/storage/database/queue exercise with budgets and cleanup — learning material written in [worked questions](./30-cloud-fundamentals.md#t30-q06); validation/limits in [Services reconciliation](./progress.md#services-completion); learner practice required
