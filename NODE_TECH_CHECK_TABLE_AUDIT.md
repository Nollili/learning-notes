# Node.js tech-check audit against the merged requirements table

Audit date: 2026-11-18. Source: `/Users/Noemi_Verebelyi/Desktop/node-levelup-tech-check-merged.md` (193 data rows). Scope: the current working-tree Node.js tech-check lessons, nested pattern catalogue, navigation and coverage records. JavaScript/React companion collections are outside the Node.js label count. Existing local edits were included in the audit and left unchanged.

## Current presentation after simplification — 2026-11-19

At the user's request, each question and project now displays one Level Up career target (L1 Junior, L2 Software Engineer, L3 Senior or L4 Lead), alongside Study depth and its Tech Check mapping. The separate Study audience line was removed. All source career/proficiency cells remain in the linked requirements reference rather than being repeated under each question.

All 233 question headings have had their trailing custom-ID syntax removed. Stable IDs and curriculum placement live in invisible HTML comments; the Markdown plugin applies the same saved heading IDs. All 266 completion tasks and the prior five-level curriculum assignment remain intact. The historical matrix-label audit below records the previous presentation, not the current visible metadata.

## Previous status after matrix-label corrections

All three metadata findings are resolved for the current 233 questions, including the six questions added after the original audit. All 96 missing question depths and five project depth labels were added. The original audit findings below are retained as historical evidence.

- Every question now has Study depth, Study audience, full Level Up proficiency cells, Tech Check mapping, explicit curriculum placement and linked source rows.
- The [published source matrix](docs/node-js/tech-check/requirements.md) preserves all 193 rows and distinguishes explicit chart levels from Related correspondence. Each source row is linked from at least one question.
- Distinct source career matrices are kept separate; missing cells remain dashes. Chart-only topics do not receive invented career proficiency. Previous career recommendations remain Study audience labels.
- Explicit source corrections include EventEmitter (1), Process API (4), Cluster API (4 alongside child processes at 3), IP sockets (5), HTTPS (2 and 3), package scripts (1), and multi-context File/Stream APIs (1 and 4). Related mappings are labelled as such.
- Curriculum grouping is independent of source stars: all 262 previous completion IDs and level assignments were retained; four framework companion questions are now trackable too, for 266 tasks total.

## Original audit outcome

**Topic coverage is broad, but a complete and correctly labelled match is not established.** Every source row has a relevant destination below; a destination indicates relevant written material, not proof of every proficiency level or practical competency. Event Splitting lacks an explicit explanation/mapping. Basic synchronous generators are taught in the pattern catalogue rather than as a clear Foundations lesson. Named alternative frameworks have comparison coverage, with worked application depth concentrated on Express/NestJS.

**All 227 identified question sections contain Level Up and Tech Check level labels; 96 lack Study depth.** The five cumulative projects also contain both level labels and lack Study depth. Those project labels describe milestones and should be assessed separately from topic requirements.

## Interpretation needed before correcting labels

- The table gives a proficiency per career level, not one career level per topic. For example, CLI basics are Novice at L1/L2, Intermediate at L3 and Advanced at L4. A lesson labelled `Level Up: L1` can be a useful audience choice, but does not preserve that progression. The index explicitly defines these as intended audience labels. Therefore audience choices cannot all be called incorrect; they cannot be certified as a transcription of the source either.
- Study depth is editorial. The source has Novice/Intermediate/Advanced proficiency cells but no “Study depth” column. Foundational/Intermediate/Advanced lesson labels need an explicit mapping policy if they are intended to represent those cells. Intermediate study depth with L4 is not inherently wrong.
- Preserve “Related” when stars are inferred. The source explicitly distinguishes chart keywords from broader topic correspondence. Plain stars in lessons currently erase that distinction.
- A dash means absent source evidence, not a beginner requirement. Core JavaScript, for example, has chart stars but no Level Up cells in this table. Its L1 audience label is an editorial choice.
- Several source rows combine unrelated chart categories. Split their semicolon-separated entries when mapping; do not assign every star group on that row to each entry.

## Original audit findings

| Finding | Evidence | Required correction |
|---|---|---|
| Missing study-depth labels | 96 question sections, listed below; all five projects also omit the field | Add an editorial depth for each question; decide and document whether projects use the same field |
| EventEmitter chart level differs | [T06-Q01/Q02](docs/node-js/tech-check/06-events-and-event-loop.md) use 2 stars; explicit EventEmitter API entry is 1 star | Use 1 star for the EventEmitter portion; retain separate 2 stars for phases/libuv and identify related mappings |
| Process API chart level differs | [T02-Q06](docs/node-js/tech-check/02-cli-and-processes.md) uses 1 star; explicit Process API is 4 stars | Distinguish early CLI/process-arguments coverage from the Process API chart entry |
| Cluster chart level is not represented at its main lesson | [T09-Q05](docs/node-js/tech-check/09-concurrency.md) uses 3 stars; Cluster API is explicitly 4 stars, while child processes are 3 stars | Show both mappings or separate them; advanced API T16-Q14 already supplies 4 stars coverage |
| IP sockets chart level is obscured | [T08-Q02](docs/node-js/tech-check/08-networking.md) uses 2 stars; IP Sockets is explicitly 5 stars in the table | Record the explicit five-star mapping separately from general two-star networking |
| HTTPS mapping loses a chart level | [T08-Q03](docs/node-js/tech-check/08-networking.md) uses 2 stars; table specifies 2 stars Network and 3 stars Security | Show both contextual levels |
| Package scripts inherit the wrong tools label | [T29-Q01](docs/node-js/tech-check/29-development-tools.md) uses 2 stars; Scripts is explicitly 1 star | Preserve 1 star for scripts; 2 stars may describe the wider tooling exercise, not its source mapping |
| Related mappings appear as explicit chart matches | E.g. [logging](docs/node-js/tech-check/21-logging.md) uses plain 5 stars although logging rows are Related; [npm audit/Helmet/sandboxing](docs/node-js/tech-check/14-security.md) similarly drops Related | Retain related status or expose separate source-mapping metadata |
| Career proficiency information is lost | [T05-Q03](docs/node-js/tech-check/05-asynchronous-programming.md) says L2 for async/await, whose source cells are L3 Intermediate / L4 Advanced; [SemVer/registry](docs/node-js/tech-check/04-package-management.md) must also preserve the source L4 Advanced requirement | Keep audience labels if desired, but add the actual career/proficiency matrix rather than treating the audience label as source data |
| Event Splitting is not explicitly reconciled | No “Event Splitting” explanation or alias found in the teaching files. [T12-Q05](docs/node-js/tech-check/12-performance-and-v8.md) covers bounded chunking/yielding | Add an explicit interpretation/cross-reference; the source supplies no definition, so mark the interpretation as editorial |
| Generator Foundations route is incomplete | [T05-Q08](docs/node-js/tech-check/05-asynchronous-programming.md) teaches async generators at 3 stars; synchronous function*/yield/cleanup is worked in [Iterator](docs/node-js/tech-check/patterns/behavioral-data.md) | Add a visible 1 star Foundations generator explanation/link; distinguish it from advanced async iteration |
| Framework breadth has limited depth | [T16-Q02](docs/node-js/tech-check/16-frameworks.md) compares Hapi/Koa/Feathers; worked intermediate/advanced material primarily uses Express/NestJS | Describe breadth honestly; if all five frameworks need working configuration/routing/optimization evidence, these remain partial |
| Coverage checklist is stale | [Debugging section](docs/node-js/tech-check/coverage.md) marks six items pending; remote debugging and async diagnosis now exist in T29-Q06/Q07, framework startup in Q08, heap investigation in T12-Q04 | Reconcile checklist against current lessons; do not infer absent content from historical pending marks |

## Original source-row routing snapshot

This is an exhaustive source-row routing checklist, not a claim of independently executed examples or advanced mastery. Career cells and stars are reproduced for comparison. “Located” means a relevant explanation/example exists in the listed group. “Review” marks a known mapping or depth limitation. Broad capability rows span multiple lessons and the progressive projects.

| Source line | Topic / requirement | L1 / L2 / L3 / L4 | Source Tech Check | Destination and status |
|---|---|---|---|---|
| 13 | Node.js CLI: Basic commands | Novice / Novice / Intermediate / Advanced | Related 1 star | [02-cli-and-processes](docs/node-js/tech-check/02-cli-and-processes.md) — Located |
| 14 | Node.js CLI: Build-in Node.js CLI options | Novice / Novice / Intermediate / Advanced | Related 1 star | [02-cli-and-processes](docs/node-js/tech-check/02-cli-and-processes.md) — Located |
| 15 | Node.js Modules: Standard Modules | Novice / Novice / Intermediate / Advanced | Related 1 star | [03-modules](docs/node-js/tech-check/03-modules.md) — Located |
| 16 | Node.js Modules: ES Modules | Novice / Novice / Intermediate / Advanced | 1 star | [03-modules](docs/node-js/tech-check/03-modules.md) — Located |
| 17 | Node.js Modules: Module Scope | Novice / Novice / Intermediate / Advanced | Related 1 star | [03-modules](docs/node-js/tech-check/03-modules.md) — Located |
| 18 | Node.js Package Managers: CLI Options | Novice / Novice / Intermediate / Advanced | Related 1 star | [04-package-management](docs/node-js/tech-check/04-package-management.md) — Located |
| 19 | Node.js Package Managers: Package Structure | Novice / Novice / Intermediate / Advanced | 1 star | [04-package-management](docs/node-js/tech-check/04-package-management.md) — Located |
| 20 | Node.js Async programming: Callbacks | Novice / Novice / Intermediate / Advanced | 1 star | [05-asynchronous-programming](docs/node-js/tech-check/05-asynchronous-programming.md) — Located |
| 21 | Node.js Async programming: Promise | Novice / Novice / Intermediate / Advanced | 1 star | [05-asynchronous-programming](docs/node-js/tech-check/05-asynchronous-programming.md) — Located |
| 22 | Node.js Events: Event-Driven Programming | Novice / Novice / Intermediate / Advanced | Related 1 star, 2 stars | [06-events-and-event-loop](docs/node-js/tech-check/06-events-and-event-loop.md) — Located |
| 23 | Node.js API: Console API | Novice / Novice / Intermediate / Advanced | Related 1 star, 4 stars | [07-core-apis](docs/node-js/tech-check/07-core-apis.md) — Located |
| 24 | Node.js API: File System API | Novice / Novice / Intermediate / Advanced | 1 star, 4 stars | [07-core-apis](docs/node-js/tech-check/07-core-apis.md) — Located |
| 25 | Node.js API: String Decoder API | Novice / Novice / Intermediate / Advanced | Related 1 star, 4 stars | [07-core-apis](docs/node-js/tech-check/07-core-apis.md) — Located |
| 26 | Node.js API: Timer API | Novice / Novice / Intermediate / Advanced | 1 star | [07-core-apis](docs/node-js/tech-check/07-core-apis.md) — Located |
| 27 | Node.js API: URI API | Novice / Novice / Intermediate / Advanced | Related 1 star, 4 stars | [07-core-apis](docs/node-js/tech-check/07-core-apis.md) — Located |
| 28 | Node.js Error Handling: Async errors, Promise rejections | Novice / Novice / Intermediate / Advanced | Related 2 stars | [10-error-handling](docs/node-js/tech-check/10-error-handling.md) — Located |
| 29 | Node.js Error Handling: Error Class | Novice / Novice / Intermediate / Advanced | Related 2 stars | [10-error-handling](docs/node-js/tech-check/10-error-handling.md) — Located |
| 30 | Node.js Debugging: Native debugging | Novice / Novice / Intermediate / Advanced | Related 2 stars | [29-development-tools](docs/node-js/tech-check/29-development-tools.md), [12-performance-and-v8](docs/node-js/tech-check/12-performance-and-v8.md), [10-error-handling](docs/node-js/tech-check/10-error-handling.md) — Located |
| 31 | Node.js Authorization: JWT | Novice / Novice / Intermediate / Advanced | 3 stars | [13-authentication-and-authorization](docs/node-js/tech-check/13-authentication-and-authorization.md) — Located |
| 32 | Node.js Testing: Unit tests | Novice / Novice / Intermediate / Advanced | 2 stars | [15-testing](docs/node-js/tech-check/15-testing.md) — Located |
| 33 | Node.js Documentation: JSDoc | Novice / Novice / Intermediate / Advanced | 2 stars | [29-development-tools](docs/node-js/tech-check/29-development-tools.md) — Located |
| 34 | Node.js Loggers: Types of logges. Logging levels. | Novice / Novice / Intermediate / Advanced | Related 5 stars | [21-logging](docs/node-js/tech-check/21-logging.md) — Located |
| 35 | Node.js Deployment: NPM Scripts | Novice / Novice / Intermediate / Advanced | 1 star | [24-deployment](docs/node-js/tech-check/24-deployment.md) — Located |
| 36 | Node.js CLI: Environment Variables | — / — / Intermediate / Advanced | 1 star | [02-cli-and-processes](docs/node-js/tech-check/02-cli-and-processes.md) — Located |
| 37 | Node.js Modules: Global Objects | — / — / Intermediate / Advanced | Related 1 star | [03-modules](docs/node-js/tech-check/03-modules.md) — Located |
| 38 | Node.js Modules: Module Load System | — / — / Intermediate / Advanced | 1 star | [03-modules](docs/node-js/tech-check/03-modules.md) — Located |
| 39 | Node.js Modules: Module Object | — / — / Intermediate / Advanced | Related 1 star | [03-modules](docs/node-js/tech-check/03-modules.md) — Located |
| 40 | Node.js Package Managers: Package manager as a build tool | — / — / Intermediate / Advanced | Related 1 star | [04-package-management](docs/node-js/tech-check/04-package-management.md) — Located |
| 41 | Node.js Package Managers: Package manager configuration | — / — / Intermediate / Advanced | Related 1 star | [04-package-management](docs/node-js/tech-check/04-package-management.md) — Located |
| 42 | Node.js Package Managers: Package manager scripts | — / — / Intermediate / Advanced | 1 star | [04-package-management](docs/node-js/tech-check/04-package-management.md) — Located |
| 43 | Node.js Async programming: Async programming patterns/tools | — / — / Intermediate / Advanced | Related 1 star, 3 stars | [05-asynchronous-programming](docs/node-js/tech-check/05-asynchronous-programming.md) — Located |
| 44 | Node.js Async programming: async/await | — / — / Intermediate / Advanced | 1 star | [05-asynchronous-programming](docs/node-js/tech-check/05-asynchronous-programming.md) — Located |
| 45 | Node.js Events: Event Loop | — / — / Intermediate / Advanced | Related 1 star, 2 stars | [06-events-and-event-loop](docs/node-js/tech-check/06-events-and-event-loop.md) — Located |
| 46 | Node.js Events: EventEmitter | — / — / Intermediate / Advanced | 1 star | [06-events-and-event-loop](docs/node-js/tech-check/06-events-and-event-loop.md) — Located |
| 47 | Node.js Events: OS events handlers | — / — / Intermediate / Advanced | Related 1 star, 2 stars | [06-events-and-event-loop](docs/node-js/tech-check/06-events-and-event-loop.md) — Located |
| 48 | Node.js API: Buffer API | — / — / Intermediate / Advanced | Related 1 star, 4 stars | [07-core-apis](docs/node-js/tech-check/07-core-apis.md) — Located |
| 49 | Node.js API: Cluster API | — / — / Intermediate / Advanced | 4 stars | [09-concurrency](docs/node-js/tech-check/09-concurrency.md), [16-advanced-api-frameworks](docs/node-js/tech-check/16-advanced-api-frameworks.md) — Located |
| 50 | Node.js API: Crypto API | — / — / Intermediate / Advanced | 4 stars | [07-core-apis](docs/node-js/tech-check/07-core-apis.md) — Located |
| 51 | Node.js API: Net API | — / — / Intermediate / Advanced | Related 1 star, 4 stars | [08-networking](docs/node-js/tech-check/08-networking.md) — Located |
| 52 | Node.js API: OS API | — / — / Intermediate / Advanced | Related 1 star, 4 stars | [07-core-apis](docs/node-js/tech-check/07-core-apis.md) — Located |
| 53 | Node.js API: Readline API | — / — / Intermediate / Advanced | Related 1 star, 4 stars | [07-core-apis](docs/node-js/tech-check/07-core-apis.md) — Located |
| 54 | Node.js API: Stream API | — / — / Intermediate / Advanced | 1 star, 4 stars | [07-core-apis](docs/node-js/tech-check/07-core-apis.md) — Located |
| 55 | Node.js API: Zlib API | — / — / Intermediate / Advanced | Related 1 star, 4 stars | [07-core-apis](docs/node-js/tech-check/07-core-apis.md) — Located |
| 56 | Node.js Error Handling: Custom Errors | — / — / Intermediate / Advanced | Related 2 stars | [10-error-handling](docs/node-js/tech-check/10-error-handling.md) — Located |
| 57 | Node.js Network: HTTPS | — / — / Intermediate / Advanced | 2 stars, 3 stars | [08-networking](docs/node-js/tech-check/08-networking.md) — Located |
| 58 | Node.js Network: Network API | — / — / Intermediate / Advanced | Related 2 stars | [08-networking](docs/node-js/tech-check/08-networking.md) — Located |
| 59 | Node.js Real Time Applications: WebSockets | — / — / Intermediate / Advanced | Related 5 stars | [08-networking](docs/node-js/tech-check/08-networking.md) — Located |
| 60 | Node.js Performance: Profilers | — / — / Intermediate / Advanced | Related 4 stars | [12-performance-and-v8](docs/node-js/tech-check/12-performance-and-v8.md) — Located |
| 61 | Node.js Debugging: Inspectors and specialized tools | — / — / Intermediate / Advanced | Related 2 stars | [29-development-tools](docs/node-js/tech-check/29-development-tools.md), [12-performance-and-v8](docs/node-js/tech-check/12-performance-and-v8.md), [10-error-handling](docs/node-js/tech-check/10-error-handling.md) — Located |
| 62 | Node.js Authorization: PassportJS | — / — / Intermediate / Advanced | 4 stars | [13-authentication-and-authorization](docs/node-js/tech-check/13-authentication-and-authorization.md) — Located |
| 63 | Node.js Security: Basic practices and approaches | — / — / Intermediate / Advanced | Related 4 stars | [14-security](docs/node-js/tech-check/14-security.md) — Located |
| 64 | Node.js Testing: Contract tests | — / — / Intermediate / Advanced | Related 2 stars | [15-testing](docs/node-js/tech-check/15-testing.md) — Located |
| 65 | Node.js Testing: Integration tests | — / — / Intermediate / Advanced | 2 stars | [15-testing](docs/node-js/tech-check/15-testing.md) — Located |
| 66 | Node.js Testing: TDD/BDD | — / — / Intermediate / Advanced | Related 2 stars | [15-testing](docs/node-js/tech-check/15-testing.md) — Located |
| 67 | Node.js Documentation: Third party documentation tools / services | — / — / Intermediate / Advanced | Related 2 stars, 3 stars | [29-development-tools](docs/node-js/tech-check/29-development-tools.md) — Located |
| 68 | Node.js ORM / ODMNode.js Frameworks Node.js Serverless: Serverless code implementaiton | — / — / Intermediate / Advanced | Related 1 star, 2 stars, 3 stars, 4 stars | [20-serverless](docs/node-js/tech-check/20-serverless.md) — Located |
| 69 | Node.js ORM / ODMNode.js Frameworks Node.js Serverless: Serverless solution (based on AWS Lambda, Azure functions, Google CloudFunctions, etc.) | — / — / Intermediate / Advanced | Related 1 star, 2 stars, 3 stars, 4 stars | [20-serverless](docs/node-js/tech-check/20-serverless.md) — Located |
| 70 | Node.js Loggers: Logging tools and libraries (Logstash, Winston etc.) | — / — / Intermediate / Advanced | Related 5 stars | [21-logging](docs/node-js/tech-check/21-logging.md) — Located |
| 71 | Node.js Queue: Basic knowledge of tools and solutions (RabbitMQ / AtiveMQ / Kafka / SQS / SNS) | — / — / Intermediate / Advanced | Related 5 stars | [19-messaging](docs/node-js/tech-check/19-messaging.md) — Located |
| 72 | Node.js Containerization: Containerization practices and approaches | — / — / Intermediate / Advanced | Related 3 stars | [23-containerization](docs/node-js/tech-check/23-containerization.md) — Located |
| 73 | Node.js Containerization: Tools and services (Docker, Docker Compose, etc.) | — / — / Intermediate / Advanced | Related 3 stars | [23-containerization](docs/node-js/tech-check/23-containerization.md) — Located |
| 74 | Node.js Architecture / Patterns: Application structure architecture principles | — / — / Intermediate / Advanced | Related 2 stars, 3 stars | [18-architecture](docs/node-js/tech-check/18-architecture.md) — Located |
| 75 | Node.js Architecture / Patterns: Basic GoF Creational, Structural, Behavioral patterns knowledge | — / — / Intermediate / Advanced | Related 2 stars, 3 stars | [18-patterns](docs/node-js/tech-check/18-patterns.md), [patterns/creational](docs/node-js/tech-check/patterns/creational.md), [patterns/structural](docs/node-js/tech-check/patterns/structural.md), [patterns/behavioral-data](docs/node-js/tech-check/patterns/behavioral-data.md), [patterns/behavioral-workflows](docs/node-js/tech-check/patterns/behavioral-workflows.md) — Located |
| 76 | Node.js Architecture / Patterns: Microservices basic principles | — / — / Intermediate / Advanced | Related 2 stars, 3 stars | [18-architecture](docs/node-js/tech-check/18-architecture.md) — Located |
| 77 | Node.js Deployment: CI/CD | — / — / Intermediate / Advanced | Related 3 stars | [24-deployment](docs/node-js/tech-check/24-deployment.md) — Located |
| 78 | Node.js Deployment: SSH/Command line tools | — / — / Intermediate / Advanced | Related 3 stars | [24-deployment](docs/node-js/tech-check/24-deployment.md) — Located |
| 79 | Node.js CLI: REPL | — / — / — / Advanced | Related 1 star | [02-cli-and-processes](docs/node-js/tech-check/02-cli-and-processes.md) — Located |
| 80 | Node.js Modules: Module API / Global Async and async modules | — / — / — / Advanced | Related 1 star | [03-modules](docs/node-js/tech-check/03-modules.md) — Located |
| 81 | Node.js Package Managers: Semantic versioning and package manager registry | — / — / — / Advanced | 1 star | [04-package-management](docs/node-js/tech-check/04-package-management.md) — Located |
| 82 | Node.js Async programming: Async iterators / async-generators | — / — / — / Advanced | Related 1 star, 3 stars | [05-asynchronous-programming](docs/node-js/tech-check/05-asynchronous-programming.md) — Located |
| 83 | Node.js Events: libUV | — / — / — / Advanced | 2 stars | [06-events-and-event-loop](docs/node-js/tech-check/06-events-and-event-loop.md) — Located |
| 84 | Node.js API: DNS API | — / — / — / Advanced | Related 1 star, 4 stars | [08-networking](docs/node-js/tech-check/08-networking.md) — Located |
| 85 | Node.js API: Process API | — / — / — / Advanced | 4 stars | [02-cli-and-processes](docs/node-js/tech-check/02-cli-and-processes.md), [16-advanced-api-frameworks](docs/node-js/tech-check/16-advanced-api-frameworks.md) — Located |
| 86 | Node.js Error Handling: Criticality matrix | — / — / — / Advanced | Related 2 stars | [10-error-handling](docs/node-js/tech-check/10-error-handling.md) — Located |
| 87 | Node.js Real Time Applications: SocketIO | — / — / — / Advanced | 5 stars | [08-networking](docs/node-js/tech-check/08-networking.md) — Located |
| 88 | Node.js Real Time Applications: IP sockets | — / — / — / Advanced | 5 stars | [08-networking](docs/node-js/tech-check/08-networking.md) — Located |
| 89 | Node.js V8: V8 API, optimizations | — / — / — / Advanced | Related 4 stars | [12-performance-and-v8](docs/node-js/tech-check/12-performance-and-v8.md) — Located |
| 90 | Node.js Performance: Performance API | — / — / — / Advanced | Related 4 stars | [12-performance-and-v8](docs/node-js/tech-check/12-performance-and-v8.md) — Located |
| 91 | Node.js Performance: Performance testing tools | — / — / — / Advanced | Related 4 stars | [12-performance-and-v8](docs/node-js/tech-check/12-performance-and-v8.md) — Located |
| 92 | Node.js Performance: Multithreading (fork, clustering) | — / — / — / Advanced | 3 stars | [12-performance-and-v8](docs/node-js/tech-check/12-performance-and-v8.md) — Located |
| 93 | Node.js Debugging: Remote debugging | — / — / — / Advanced | Related 2 stars | [29-development-tools](docs/node-js/tech-check/29-development-tools.md), [12-performance-and-v8](docs/node-js/tech-check/12-performance-and-v8.md), [10-error-handling](docs/node-js/tech-check/10-error-handling.md) — Located |
| 94 | Node.js Debugging: Async code debugging/Memory leaks | — / — / — / Advanced | Related 2 stars | [29-development-tools](docs/node-js/tech-check/29-development-tools.md), [12-performance-and-v8](docs/node-js/tech-check/12-performance-and-v8.md), [10-error-handling](docs/node-js/tech-check/10-error-handling.md) — Located |
| 95 | Node.js Authorization: PassportJS Strategy | — / — / — / Advanced | 4 stars | [13-authentication-and-authorization](docs/node-js/tech-check/13-authentication-and-authorization.md) — Located |
| 96 | Node.js Authorization: Third party auth services | — / — / — / Advanced | Related 3 stars, 4 stars | [13-authentication-and-authorization](docs/node-js/tech-check/13-authentication-and-authorization.md) — Located |
| 97 | Node.js Authorization: Microservices Authentication and Authorization | — / — / — / Advanced | Related 3 stars, 4 stars | [13-authentication-and-authorization](docs/node-js/tech-check/13-authentication-and-authorization.md) — Located |
| 98 | Node.js Security: NPM Audit | — / — / — / Advanced | Related 4 stars | [14-security](docs/node-js/tech-check/14-security.md) — Located |
| 99 | Node.js Security: Helmet | — / — / — / Advanced | Related 4 stars | [14-security](docs/node-js/tech-check/14-security.md) — Located |
| 100 | Node.js Security: Sandboxing unsafe code | — / — / — / Advanced | Related 4 stars | [14-security](docs/node-js/tech-check/14-security.md) — Located |
| 101 | Node.js Security: Third party security check services | — / — / — / Advanced | Related 4 stars | [14-security](docs/node-js/tech-check/14-security.md) — Located |
| 102 | Node.js Testing: Stress / load testing | — / — / — / Advanced | Related 2 stars | [15-testing](docs/node-js/tech-check/15-testing.md) — Located |
| 103 | Node.js Testing: Performance testing | — / — / — / Advanced | Related 2 stars | [15-testing](docs/node-js/tech-check/15-testing.md) — Located |
| 104 | Node.js Testing: E2E tests | — / — / — / Advanced | 2 stars | [15-testing](docs/node-js/tech-check/15-testing.md) — Located |
| 105 | Node.js ORM / ODMNode.js Frameworks Node.js Serverless: Extended cofiguration and advanced usage | — / — / — / Advanced | Related 1 star, 2 stars, 3 stars, 4 stars | [16-advanced-api-frameworks](docs/node-js/tech-check/16-advanced-api-frameworks.md), [17-databases](docs/node-js/tech-check/17-databases.md), [20-serverless](docs/node-js/tech-check/20-serverless.md) — Review: broad source heading; advanced coverage distributed |
| 106 | Node.js Loggers: Remote logging services and tools, configuration and setup | — / — / — / Advanced | Related 5 stars | [21-logging](docs/node-js/tech-check/21-logging.md) — Located |
| 107 | Node.js Vizualization / Monitoring: Purpose of Vizualization / Monitoring tools | — / — / — / Advanced | Related 5 stars | [22-monitoring](docs/node-js/tech-check/22-monitoring.md) — Located |
| 108 | Node.js Vizualization / Monitoring: Intermediate Setup and usage of third party services (Kibana, Grafana, Graphite, Prometheus or Zabbix, etc.) | — / — / — / Advanced | Related 5 stars | [22-monitoring](docs/node-js/tech-check/22-monitoring.md) — Located |
| 109 | Node.js Queue: Failover techniques | — / — / — / Advanced | Related 5 stars | [19-messaging](docs/node-js/tech-check/19-messaging.md) — Located |
| 110 | Node.js Containerization: Containers / orchestration management | — / — / — / Advanced | Related 3 stars | [23-containerization](docs/node-js/tech-check/23-containerization.md) — Located |
| 111 | Node.js Architecture / Patterns: Experience with advanced microservices practices | — / — / — / Advanced | Related 2 stars, 3 stars | [18-architecture](docs/node-js/tech-check/18-architecture.md) — Located |
| 112 | Node.js Architecture / Patterns: Consistency patterns | — / — / — / Advanced | Related 2 stars, 3 stars | [18-architecture](docs/node-js/tech-check/18-architecture.md) — Located |
| 113 | Node.js Architecture / Patterns: Performance vs scalability best practices and approaches | — / — / — / Advanced | Related 2 stars, 3 stars | [18-architecture](docs/node-js/tech-check/18-architecture.md) — Located |
| 114 | Node.js Architecture / Patterns: Availability vs consistency patterns | — / — / — / Advanced | Related 2 stars, 3 stars | [18-architecture](docs/node-js/tech-check/18-architecture.md) — Located |
| 115 | Node.js Deployment: Docker images | — / — / — / Advanced | Related 3 stars | [24-deployment](docs/node-js/tech-check/24-deployment.md) — Located |
| 116 | Node.js Deployment: Cloud deployment | — / — / — / Advanced | Related 3 stars | [24-deployment](docs/node-js/tech-check/24-deployment.md) — Located |
| 117 | Node.js Core: ability to explain the Node.js runtime purpose and how core APIs differ from browser JavaScript | Novice / Novice / — / — | Related 1 star, 2 stars, 3 stars, 4 stars | [01-runtime-fundamentals](docs/node-js/tech-check/01-runtime-fundamentals.md), [07-core-apis](docs/node-js/tech-check/07-core-apis.md), [03-modules](docs/node-js/tech-check/03-modules.md), [06-events-and-event-loop](docs/node-js/tech-check/06-events-and-event-loop.md), [09-concurrency](docs/node-js/tech-check/09-concurrency.md), [progressive-projects](docs/node-js/tech-check/progressive-projects.md) — Located |
| 118 | Node.js Core: knowledge of the event driven, non blocking execution model and the event loop at a conceptual level | Novice / Novice / — / — | Related 1 star, 2 stars, 3 stars, 4 stars | [01-runtime-fundamentals](docs/node-js/tech-check/01-runtime-fundamentals.md), [07-core-apis](docs/node-js/tech-check/07-core-apis.md), [03-modules](docs/node-js/tech-check/03-modules.md), [06-events-and-event-loop](docs/node-js/tech-check/06-events-and-event-loop.md), [09-concurrency](docs/node-js/tech-check/09-concurrency.md), [progressive-projects](docs/node-js/tech-check/progressive-projects.md) — Located |
| 119 | Node.js Core: ability to use built in modules such as fs, path, os, and process with documentation | Novice / Novice / — / — | 1 star | [01-runtime-fundamentals](docs/node-js/tech-check/01-runtime-fundamentals.md), [07-core-apis](docs/node-js/tech-check/07-core-apis.md), [03-modules](docs/node-js/tech-check/03-modules.md), [06-events-and-event-loop](docs/node-js/tech-check/06-events-and-event-loop.md), [09-concurrency](docs/node-js/tech-check/09-concurrency.md), [progressive-projects](docs/node-js/tech-check/progressive-projects.md) — Located |
| 120 | Node.js Core: knowledge of CommonJS module basics and package entry points | Novice / Novice / — / — | Related 1 star, 2 stars, 3 stars, 4 stars | [01-runtime-fundamentals](docs/node-js/tech-check/01-runtime-fundamentals.md), [07-core-apis](docs/node-js/tech-check/07-core-apis.md), [03-modules](docs/node-js/tech-check/03-modules.md), [06-events-and-event-loop](docs/node-js/tech-check/06-events-and-event-loop.md), [09-concurrency](docs/node-js/tech-check/09-concurrency.md), [progressive-projects](docs/node-js/tech-check/progressive-projects.md) — Located |
| 121 | Node.js Core: ability to run scripts with node and inspect basic process arguments and environment variables | Novice / Novice / — / — | Related 1 star, 2 stars, 3 stars, 4 stars | [01-runtime-fundamentals](docs/node-js/tech-check/01-runtime-fundamentals.md), [07-core-apis](docs/node-js/tech-check/07-core-apis.md), [03-modules](docs/node-js/tech-check/03-modules.md), [06-events-and-event-loop](docs/node-js/tech-check/06-events-and-event-loop.md), [09-concurrency](docs/node-js/tech-check/09-concurrency.md), [progressive-projects](docs/node-js/tech-check/progressive-projects.md) — Located |
| 122 | Node.js Core: ability to build and execute small CLI or service scripts using core modules without heavy guidance | — / — / Intermediate / — | Related 1 star, 2 stars, 3 stars, 4 stars | [01-runtime-fundamentals](docs/node-js/tech-check/01-runtime-fundamentals.md), [07-core-apis](docs/node-js/tech-check/07-core-apis.md), [03-modules](docs/node-js/tech-check/03-modules.md), [06-events-and-event-loop](docs/node-js/tech-check/06-events-and-event-loop.md), [09-concurrency](docs/node-js/tech-check/09-concurrency.md), [progressive-projects](docs/node-js/tech-check/progressive-projects.md) — Located |
| 123 | Node.js Core: ability to read and write files asynchronously using callbacks, promises, and fs APIs | — / — / Intermediate / — | Related 1 star, 2 stars, 3 stars, 4 stars | [01-runtime-fundamentals](docs/node-js/tech-check/01-runtime-fundamentals.md), [07-core-apis](docs/node-js/tech-check/07-core-apis.md), [03-modules](docs/node-js/tech-check/03-modules.md), [06-events-and-event-loop](docs/node-js/tech-check/06-events-and-event-loop.md), [09-concurrency](docs/node-js/tech-check/09-concurrency.md), [progressive-projects](docs/node-js/tech-check/progressive-projects.md) — Located |
| 124 | Node.js Core: ability to manage process lifecycle, exit codes, standard input, standard output, standard error, and environment configuration | — / — / Intermediate / — | Related 1 star, 2 stars, 3 stars, 4 stars | [01-runtime-fundamentals](docs/node-js/tech-check/01-runtime-fundamentals.md), [07-core-apis](docs/node-js/tech-check/07-core-apis.md), [03-modules](docs/node-js/tech-check/03-modules.md), [06-events-and-event-loop](docs/node-js/tech-check/06-events-and-event-loop.md), [09-concurrency](docs/node-js/tech-check/09-concurrency.md), [progressive-projects](docs/node-js/tech-check/progressive-projects.md) — Located |
| 125 | Node.js Core: knowledge of timers, buffers, streams, and events for common application tasks | — / — / Intermediate / — | Related 1 star, 2 stars, 3 stars, 4 stars | [01-runtime-fundamentals](docs/node-js/tech-check/01-runtime-fundamentals.md), [07-core-apis](docs/node-js/tech-check/07-core-apis.md), [03-modules](docs/node-js/tech-check/03-modules.md), [06-events-and-event-loop](docs/node-js/tech-check/06-events-and-event-loop.md), [09-concurrency](docs/node-js/tech-check/09-concurrency.md), [progressive-projects](docs/node-js/tech-check/progressive-projects.md) — Located |
| 126 | Node.js Core: ability to install dependencies and use package.json scripts while distinguishing core modules from packages | — / — / Intermediate / — | Related 1 star, 2 stars, 3 stars, 4 stars | [01-runtime-fundamentals](docs/node-js/tech-check/01-runtime-fundamentals.md), [07-core-apis](docs/node-js/tech-check/07-core-apis.md), [03-modules](docs/node-js/tech-check/03-modules.md), [06-events-and-event-loop](docs/node-js/tech-check/06-events-and-event-loop.md), [09-concurrency](docs/node-js/tech-check/09-concurrency.md), [progressive-projects](docs/node-js/tech-check/progressive-projects.md) — Located |
| 127 | Node.js Core: ability to design Node.js applications around streams, backpressure, and asynchronous control flow | — / — / — / Advanced | Related 1 star, 2 stars, 3 stars, 4 stars | [01-runtime-fundamentals](docs/node-js/tech-check/01-runtime-fundamentals.md), [07-core-apis](docs/node-js/tech-check/07-core-apis.md), [03-modules](docs/node-js/tech-check/03-modules.md), [06-events-and-event-loop](docs/node-js/tech-check/06-events-and-event-loop.md), [09-concurrency](docs/node-js/tech-check/09-concurrency.md), [progressive-projects](docs/node-js/tech-check/progressive-projects.md) — Located |
| 128 | Node.js Core: ability to diagnose module loading, runtime errors, and event loop behavior in live applications | — / — / — / Advanced | Related 1 star, 2 stars, 3 stars, 4 stars | [01-runtime-fundamentals](docs/node-js/tech-check/01-runtime-fundamentals.md), [07-core-apis](docs/node-js/tech-check/07-core-apis.md), [03-modules](docs/node-js/tech-check/03-modules.md), [06-events-and-event-loop](docs/node-js/tech-check/06-events-and-event-loop.md), [09-concurrency](docs/node-js/tech-check/09-concurrency.md), [progressive-projects](docs/node-js/tech-check/progressive-projects.md) — Located |
| 129 | Node.js Core: ability to implement custom event emitters, child process interactions, and IPC where appropriate | — / — / — / Advanced | Related 1 star, 2 stars, 3 stars, 4 stars | [01-runtime-fundamentals](docs/node-js/tech-check/01-runtime-fundamentals.md), [07-core-apis](docs/node-js/tech-check/07-core-apis.md), [03-modules](docs/node-js/tech-check/03-modules.md), [06-events-and-event-loop](docs/node-js/tech-check/06-events-and-event-loop.md), [09-concurrency](docs/node-js/tech-check/09-concurrency.md), [progressive-projects](docs/node-js/tech-check/progressive-projects.md) — Located |
| 130 | Node.js Core: knowledge of performance tradeoffs for buffers, memory usage, and synchronous versus asynchronous APIs | — / — / — / Advanced | Related 1 star, 2 stars, 3 stars, 4 stars | [01-runtime-fundamentals](docs/node-js/tech-check/01-runtime-fundamentals.md), [07-core-apis](docs/node-js/tech-check/07-core-apis.md), [03-modules](docs/node-js/tech-check/03-modules.md), [06-events-and-event-loop](docs/node-js/tech-check/06-events-and-event-loop.md), [09-concurrency](docs/node-js/tech-check/09-concurrency.md), [progressive-projects](docs/node-js/tech-check/progressive-projects.md) — Located |
| 131 | Node.js Core: ability to select and apply core APIs for networking, file systems, and concurrency in production scenarios | — / — / — / Advanced | Related 1 star, 2 stars, 3 stars, 4 stars | [01-runtime-fundamentals](docs/node-js/tech-check/01-runtime-fundamentals.md), [07-core-apis](docs/node-js/tech-check/07-core-apis.md), [03-modules](docs/node-js/tech-check/03-modules.md), [06-events-and-event-loop](docs/node-js/tech-check/06-events-and-event-loop.md), [09-concurrency](docs/node-js/tech-check/09-concurrency.md), [progressive-projects](docs/node-js/tech-check/progressive-projects.md) — Located |
| 132 | Node.js Frameworks: knowledge of common Node.js framework categories and the problems they solve | Novice / — / — / — | Related 1 star, 2 stars, 4 stars | [16-frameworks](docs/node-js/tech-check/16-frameworks.md) — Located |
| 133 | Node.js Frameworks: ability to follow documentation to install, configure, and run a basic framework project | Novice / — / — / — | Related 1 star, 2 stars, 4 stars | [16-frameworks](docs/node-js/tech-check/16-frameworks.md) — Located |
| 134 | Node.js Frameworks: ability to identify core concepts such as routing, middleware, controllers, and request handling | Novice / — / — / — | Related 1 star, 2 stars, 4 stars | [16-frameworks](docs/node-js/tech-check/16-frameworks.md) — Located |
| 135 | Node.js Frameworks: knowledge of the framework request and response lifecycle at a high level | Novice / — / — / — | Related 1 star, 2 stars, 4 stars | [16-frameworks](docs/node-js/tech-check/16-frameworks.md) — Located |
| 136 | Node.js Frameworks: ability to build simple CRUD endpoints or pages using framework conventions | — / Intermediate / Intermediate / — | Related 1 star, 2 stars, 4 stars | [16-frameworks](docs/node-js/tech-check/16-frameworks.md) — Located |
| 137 | Node.js Frameworks: ability to apply middleware for authentication, validation, and basic error handling | — / Intermediate / Intermediate / — | Related 1 star, 2 stars, 4 stars | [16-frameworks](docs/node-js/tech-check/16-frameworks.md) — Located |
| 138 | Node.js Frameworks: ability to manage configuration, environment variables, and package dependencies in a working application | — / Intermediate / Intermediate / — | Related 1 star, 2 stars, 4 stars | [16-frameworks](docs/node-js/tech-check/16-frameworks.md) — Located |
| 139 | Node.js Frameworks: ability to troubleshoot common setup and runtime issues with documentation support | — / Intermediate / Intermediate / — | Related 1 star, 2 stars, 4 stars | [16-frameworks](docs/node-js/tech-check/16-frameworks.md) — Located |
| 140 | Node.js Frameworks: ability to choose an appropriate framework style for MVC, full-stack, or REST API use cases | — / — / — / Advanced | Related 1 star, 2 stars, 4 stars | [16-frameworks](docs/node-js/tech-check/16-frameworks.md) — Located |
| 141 | Node.js Frameworks: ability to design maintainable application structure with modules, services, and reusable components | — / — / — / Advanced | Related 1 star, 2 stars, 4 stars | [16-frameworks](docs/node-js/tech-check/16-frameworks.md) — Located |
| 142 | Node.js Frameworks: ability to implement testing, logging, security, and performance practices within framework-based applications | — / — / — / Advanced | Related 1 star, 2 stars, 4 stars | [16-frameworks](docs/node-js/tech-check/16-frameworks.md) — Located |
| 143 | Node.js Frameworks: knowledge of framework-specific extension points, lifecycle hooks, and deployment considerations | — / — / — / Advanced | Related 1 star, 2 stars, 4 stars | [16-frameworks](docs/node-js/tech-check/16-frameworks.md) — Located |
| 144 | Node.js Database Experience: knowledge of basic Node.js database connectivity concepts and common database types | Novice / — / — / — | Related 3 stars, 4 stars | [17-databases](docs/node-js/tech-check/17-databases.md) — Located |
| 145 | Node.js Database Experience: ability to configure a simple database connection using a driver or library | Novice / — / — / — | Related 3 stars, 4 stars | [17-databases](docs/node-js/tech-check/17-databases.md) — Located |
| 146 | Node.js Database Experience: knowledge of fundamental create, read, update, and delete operations | Novice / — / — / — | Related 3 stars, 4 stars | [17-databases](docs/node-js/tech-check/17-databases.md) — Located |
| 147 | Node.js Database Experience: ability to recognize the difference between relational and NoSQL data stores at a high level | Novice / — / — / — | Related 3 stars, 4 stars | [17-databases](docs/node-js/tech-check/17-databases.md) — Located |
| 148 | Node.js Database Experience: ability to run parameterized queries and basic ORM or query builder operations | — / Intermediate / Intermediate / Intermediate | Related 3 stars, 4 stars | [17-databases](docs/node-js/tech-check/17-databases.md) — Located |
| 149 | Node.js Database Experience: ability to manage connection pooling and handle routine database errors in application code | — / Intermediate / Intermediate / Intermediate | Related 3 stars, 4 stars | [17-databases](docs/node-js/tech-check/17-databases.md) — Located |
| 150 | Node.js Database Experience: knowledge of transaction usage for multi step data changes | — / Intermediate / Intermediate / Intermediate | Related 3 stars, 4 stars | [17-databases](docs/node-js/tech-check/17-databases.md) — Located |
| 151 | Node.js Database Experience: ability to retrieve and persist application data within a working Node.js service | — / Intermediate / Intermediate / Intermediate | Related 3 stars, 4 stars | [17-databases](docs/node-js/tech-check/17-databases.md) — Located |
| 152 | Node.js Infrastructure and Clouds: ability to describe common infrastructure components used by Node.js applications, including compute, storage, networking, and runtime dependencies | Novice / Novice / — / — | Related 3 stars, 5 stars | [30-cloud-fundamentals](docs/node-js/tech-check/30-cloud-fundamentals.md) — Located |
| 153 | Node.js Infrastructure and Clouds: knowledge of basic cloud service models and typical deployment targets such as virtual machines, containers, and managed platforms | Novice / Novice / — / — | Related 3 stars, 5 stars | [30-cloud-fundamentals](docs/node-js/tech-check/30-cloud-fundamentals.md) — Located |
| 154 | Node.js Infrastructure and Clouds: ability to follow documented steps to configure environment variables, secrets, and application settings for a single environment | Novice / Novice / — / — | Related 3 stars, 5 stars | [30-cloud-fundamentals](docs/node-js/tech-check/30-cloud-fundamentals.md) — Located |
| 155 | Node.js Infrastructure and Clouds: knowledge of foundational concepts for logging, health checks, and basic process management in a cloud host | Novice / Novice / — / — | Related 3 stars, 5 stars | [30-cloud-fundamentals](docs/node-js/tech-check/30-cloud-fundamentals.md) — Located |
| 156 | Node.js Infrastructure and Clouds: ability to deploy and update a Node.js application in at least one cloud environment using documented pipelines or commands | — / — / Intermediate / Intermediate | Related 3 stars, 5 stars | [30-cloud-fundamentals](docs/node-js/tech-check/30-cloud-fundamentals.md) — Located |
| 157 | Node.js Infrastructure and Clouds: knowledge of load balancing, autoscaling, and managed database or cache integrations used to support application workloads | — / — / Intermediate / Intermediate | Related 3 stars, 5 stars | [30-cloud-fundamentals](docs/node-js/tech-check/30-cloud-fundamentals.md) — Located |
| 158 | Node.js Infrastructure and Clouds: ability to configure application observability using logs, metrics, and alerts for routine operational monitoring | — / — / Intermediate / Intermediate | Related 3 stars, 5 stars | [30-cloud-fundamentals](docs/node-js/tech-check/30-cloud-fundamentals.md) — Located |
| 159 | Node.js Infrastructure and Clouds: ability to collaborate with others to troubleshoot deployment, network, or permission issues using cloud consoles and documentation | — / — / Intermediate / Intermediate | Related 3 stars, 5 stars | [30-cloud-fundamentals](docs/node-js/tech-check/30-cloud-fundamentals.md) — Located |
| 160 | Tech Check / Core JavaScript: Object (Core JavaScript) | — / — / — / — | 1 star | [core-javascript](docs/node-js/tech-check/core-javascript.md) — Located |
| 161 | Tech Check / Core JavaScript: Context (Core JavaScript) | — / — / — / — | 1 star | [core-javascript](docs/node-js/tech-check/core-javascript.md) — Located |
| 162 | Tech Check / Core JavaScript: Closure (Core JavaScript) | — / — / — / — | 1 star | [core-javascript](docs/node-js/tech-check/core-javascript.md) — Located |
| 163 | Tech Check / NPM: Package.json / package-lock.json (NPM) | — / — / — / — | 1 star | [04-package-management](docs/node-js/tech-check/04-package-management.md) — Located |
| 164 | Tech Check / Asynchronous: Generators (Asynchronous) | — / — / — / — | 1 star | [05-asynchronous-programming](docs/node-js/tech-check/05-asynchronous-programming.md), [patterns/behavioral-data](docs/node-js/tech-check/patterns/behavioral-data.md) — Review: missing clear Foundations route |
| 165 | Tech Check / Framework (basic): Hapi / Express / Koa / Nest.JS / Feathers.JS (Framework (basic)); Hapi / Express / Koa / Nest.JS / Feathers.JS (Framework (intermediate)); Hapi / Express / Koa / Nest.JS / Feathers.JS (Framework (advanced)) | — / — / — / — | 1 star, 2 stars, 4 stars | [16-frameworks](docs/node-js/tech-check/16-frameworks.md), [16-advanced-api-frameworks](docs/node-js/tech-check/16-advanced-api-frameworks.md) — Review: alternative frameworks compared; Express/Nest worked |
| 166 | Tech Check / Framework (basic): Concept (Framework (basic)); Concept (Cloud) | — / — / — / — | 1 star, 3 stars | [16-frameworks](docs/node-js/tech-check/16-frameworks.md), [30-cloud-fundamentals](docs/node-js/tech-check/30-cloud-fundamentals.md) — Located |
| 167 | Tech Check / Framework (basic): Configuration (Framework (basic)) | — / — / — / — | 1 star | [16-frameworks](docs/node-js/tech-check/16-frameworks.md) — Located |
| 168 | Tech Check / Event Loop: Phases (Event Loop) | — / — / — / — | 2 stars | [06-events-and-event-loop](docs/node-js/tech-check/06-events-and-event-loop.md) — Located |
| 169 | Tech Check / Event Loop: Micro / Tasks (Event Loop) | — / — / — / — | 2 stars | [06-events-and-event-loop](docs/node-js/tech-check/06-events-and-event-loop.md) — Located |
| 170 | Tech Check / Network: HTTP Protocol (Network) | — / — / — / — | 2 stars | [08-networking](docs/node-js/tech-check/08-networking.md) — Located |
| 171 | Tech Check / Network: HTTP API (Network) | — / — / — / — | 2 stars | [08-networking](docs/node-js/tech-check/08-networking.md) — Located |
| 172 | Tech Check / Errors: Named in overview and detailed panel (Errors); Named in overview and detailed panel (V8 Optimizations) | — / — / — / — | 2 stars, 4 stars | [10-error-handling](docs/node-js/tech-check/10-error-handling.md), [12-performance-and-v8](docs/node-js/tech-check/12-performance-and-v8.md) — Located: Errors and V8 are separate categories |
| 173 | Tech Check / Errors: no subtopics supplied (Errors); no subtopics supplied (V8 Optimizations) | — / — / — / — | 2 stars, 4 stars | [10-error-handling](docs/node-js/tech-check/10-error-handling.md), [12-performance-and-v8](docs/node-js/tech-check/12-performance-and-v8.md) — Located: Errors and V8 are separate categories |
| 174 | Tech Check / Patterns: Creational (Patterns) | — / — / — / — | 2 stars | [18-patterns](docs/node-js/tech-check/18-patterns.md) — Located |
| 175 | Tech Check / Patterns: Structural (Patterns) | — / — / — / — | 2 stars | [18-patterns](docs/node-js/tech-check/18-patterns.md) — Located |
| 176 | Tech Check / Patterns: Behavior (Patterns) | — / — / — / — | 2 stars | [18-patterns](docs/node-js/tech-check/18-patterns.md) — Located |
| 177 | Tech Check / Tools (basic): ESLint (Tools (basic)) | — / — / — / — | 2 stars | [29-development-tools](docs/node-js/tech-check/29-development-tools.md) — Located |
| 178 | Tech Check / Tools (basic): Style Guide (Tools (basic)) | — / — / — / — | 2 stars | [29-development-tools](docs/node-js/tech-check/29-development-tools.md) — Located |
| 179 | Tech Check / Framework (intermediate): Routing (Framework (intermediate)) | — / — / — / — | 2 stars | [16-frameworks](docs/node-js/tech-check/16-frameworks.md) — Located |
| 180 | Tech Check / Framework (intermediate): Middlewares (Framework (intermediate)) | — / — / — / — | 2 stars | [16-frameworks](docs/node-js/tech-check/16-frameworks.md) — Located |
| 181 | Tech Check / Framework (intermediate): Error Handling (Framework (intermediate)) | — / — / — / — | 2 stars | [16-frameworks](docs/node-js/tech-check/16-frameworks.md) — Located |
| 182 | Tech Check / Generators: Named in overview (Generators); Named in overview (Databases (intermediate)); Named in overview (API); Named in overview (WebAssembly); Named in overview (Native Modules) | — / — / — / — | 3 stars, 4 stars, 5 stars | [05-asynchronous-programming](docs/node-js/tech-check/05-asynchronous-programming.md), [17-databases](docs/node-js/tech-check/17-databases.md), [16-advanced-api-frameworks](docs/node-js/tech-check/16-advanced-api-frameworks.md), [specialized-systems](docs/node-js/tech-check/specialized-systems.md) — Located: split combined chart categories |
| 183 | Tech Check / Generators: no additional criteria supplied (Generators); no additional criteria supplied (Databases (intermediate)); no additional criteria supplied (API); no additional criteria supplied (WebAssembly); no additional criteria supplied (Native Modules) | — / — / — / — | 3 stars, 4 stars, 5 stars | [05-asynchronous-programming](docs/node-js/tech-check/05-asynchronous-programming.md), [17-databases](docs/node-js/tech-check/17-databases.md), [16-advanced-api-frameworks](docs/node-js/tech-check/16-advanced-api-frameworks.md), [specialized-systems](docs/node-js/tech-check/specialized-systems.md) — Located: split combined chart categories |
| 184 | Tech Check / Architecture: Layered (Architecture) | — / — / — / — | 3 stars | [18-architecture](docs/node-js/tech-check/18-architecture.md) — Located |
| 185 | Tech Check / Architecture: Micro-Services (Architecture) | — / — / — / — | 3 stars | [18-architecture](docs/node-js/tech-check/18-architecture.md) — Located |
| 186 | Tech Check / Architecture: Event-Driven (Architecture) | — / — / — / — | 3 stars | [18-architecture](docs/node-js/tech-check/18-architecture.md) — Located |
| 187 | Tech Check / Architecture: Flux (Architecture) | — / — / — / — | 3 stars | [18-architecture](docs/node-js/tech-check/18-architecture.md) — Located |
| 188 | Tech Check / High-load Ops: Event Splitting (High-load Ops) | — / — / — / — | 3 stars | [12-performance-and-v8](docs/node-js/tech-check/12-performance-and-v8.md), [09-concurrency](docs/node-js/tech-check/09-concurrency.md) — Review: explicit term/interpretation missing |
| 189 | Tech Check / Tools (intermediate): Swagger (Tools (intermediate)) | — / — / — / — | 3 stars | [29-development-tools](docs/node-js/tech-check/29-development-tools.md) — Located |
| 190 | Tech Check / Tools (intermediate): Docker (Tools (intermediate)) | — / — / — / — | 3 stars | [23-containerization](docs/node-js/tech-check/23-containerization.md) — Located |
| 191 | Tech Check / Databases (basic): SQL (Databases (basic)) | — / — / — / — | 3 stars | [17-databases](docs/node-js/tech-check/17-databases.md) — Located |
| 192 | Tech Check / Databases (basic): NoSQL (Databases (basic)) | — / — / — / — | 3 stars | [17-databases](docs/node-js/tech-check/17-databases.md) — Located |
| 193 | Tech Check / Cloud: Providers (Cloud) | — / — / — / — | 3 stars | [30-cloud-fundamentals](docs/node-js/tech-check/30-cloud-fundamentals.md), [20-serverless](docs/node-js/tech-check/20-serverless.md), [18-architecture](docs/node-js/tech-check/18-architecture.md) — Located |
| 194 | Tech Check / Cloud: Serverless (Cloud) | — / — / — / — | 3 stars | [30-cloud-fundamentals](docs/node-js/tech-check/30-cloud-fundamentals.md), [20-serverless](docs/node-js/tech-check/20-serverless.md), [18-architecture](docs/node-js/tech-check/18-architecture.md) — Located |
| 195 | Tech Check / Cloud: SOA (Cloud) | — / — / — / — | 3 stars | [30-cloud-fundamentals](docs/node-js/tech-check/30-cloud-fundamentals.md), [20-serverless](docs/node-js/tech-check/20-serverless.md), [18-architecture](docs/node-js/tech-check/18-architecture.md) — Located |
| 196 | Tech Check / Security: TLS (Security) | — / — / — / — | 4 stars | [14-security](docs/node-js/tech-check/14-security.md), [13-authentication-and-authorization](docs/node-js/tech-check/13-authentication-and-authorization.md), [08-networking](docs/node-js/tech-check/08-networking.md) — Located |
| 197 | Tech Check / Security: SSL (Security) | — / — / — / — | 4 stars | [14-security](docs/node-js/tech-check/14-security.md), [13-authentication-and-authorization](docs/node-js/tech-check/13-authentication-and-authorization.md), [08-networking](docs/node-js/tech-check/08-networking.md) — Located |
| 198 | Tech Check / Security: OAuth (Security) | — / — / — / — | 4 stars | [14-security](docs/node-js/tech-check/14-security.md), [13-authentication-and-authorization](docs/node-js/tech-check/13-authentication-and-authorization.md), [08-networking](docs/node-js/tech-check/08-networking.md) — Located |
| 199 | Tech Check / Security: OWASP (Security) | — / — / — / — | 4 stars | [14-security](docs/node-js/tech-check/14-security.md), [13-authentication-and-authorization](docs/node-js/tech-check/13-authentication-and-authorization.md), [08-networking](docs/node-js/tech-check/08-networking.md) — Located |
| 200 | Tech Check / Framework (advanced): Optimization (Framework (advanced)) | — / — / — / — | 4 stars | [16-advanced-api-frameworks](docs/node-js/tech-check/16-advanced-api-frameworks.md) — Located |
| 201 | Tech Check / Queues: RabbitMQ (Queues) | — / — / — / — | 5 stars | [19-messaging](docs/node-js/tech-check/19-messaging.md) — Located |
| 202 | Tech Check / Queues: Kafka (Queues) | — / — / — / — | 5 stars | [19-messaging](docs/node-js/tech-check/19-messaging.md) — Located |
| 203 | Tech Check / Tools (advanced): Kibana (Tools (advanced)) | — / — / — / — | 5 stars | [22-monitoring](docs/node-js/tech-check/22-monitoring.md) — Located |
| 204 | Tech Check / Tools (advanced): Grafana (Tools (advanced)) | — / — / — / — | 5 stars | [22-monitoring](docs/node-js/tech-check/22-monitoring.md) — Located |
| 205 | Tech Check / Tools (advanced): New relic (Tools (advanced)) | — / — / — / — | 5 stars | [22-monitoring](docs/node-js/tech-check/22-monitoring.md) — Located |

## Question-label inventory

Current inventory after corrections. All 233 questions have Study depth, Study audience, Level Up, Tech Check level, Learning path level and source links. The five cumulative projects also have depth and separate audience/milestone metadata.

| File | Questions | Missing study depth |
|---|---:|---|
| [01-runtime-fundamentals.md](docs/node-js/tech-check/01-runtime-fundamentals.md) | 4 | None |
| [02-cli-and-processes.md](docs/node-js/tech-check/02-cli-and-processes.md) | 8 | None |
| [03-modules.md](docs/node-js/tech-check/03-modules.md) | 8 | None |
| [04-package-management.md](docs/node-js/tech-check/04-package-management.md) | 8 | None |
| [05-asynchronous-programming.md](docs/node-js/tech-check/05-asynchronous-programming.md) | 9 | None |
| [06-events-and-event-loop.md](docs/node-js/tech-check/06-events-and-event-loop.md) | 8 | None |
| [07-core-apis.md](docs/node-js/tech-check/07-core-apis.md) | 12 | None |
| [08-networking.md](docs/node-js/tech-check/08-networking.md) | 11 | None |
| [09-concurrency.md](docs/node-js/tech-check/09-concurrency.md) | 9 | None |
| [10-error-handling.md](docs/node-js/tech-check/10-error-handling.md) | 7 | None |
| [12-performance-and-v8.md](docs/node-js/tech-check/12-performance-and-v8.md) | 7 | None |
| [13-authentication-and-authorization.md](docs/node-js/tech-check/13-authentication-and-authorization.md) | 8 | None |
| [14-security.md](docs/node-js/tech-check/14-security.md) | 8 | None |
| [15-testing.md](docs/node-js/tech-check/15-testing.md) | 8 | None |
| [16-advanced-api-frameworks.md](docs/node-js/tech-check/16-advanced-api-frameworks.md) | 5 | None |
| [16-framework-alternatives.md](docs/node-js/tech-check/16-framework-alternatives.md) | 4 | None |
| [16-frameworks.md](docs/node-js/tech-check/16-frameworks.md) | 13 | None |
| [17-databases.md](docs/node-js/tech-check/17-databases.md) | 11 | None |
| [18-architecture.md](docs/node-js/tech-check/18-architecture.md) | 6 | None |
| [18-patterns.md](docs/node-js/tech-check/18-patterns.md) | 4 | None |
| [19-messaging.md](docs/node-js/tech-check/19-messaging.md) | 6 | None |
| [20-serverless.md](docs/node-js/tech-check/20-serverless.md) | 5 | None |
| [21-logging.md](docs/node-js/tech-check/21-logging.md) | 4 | None |
| [22-monitoring.md](docs/node-js/tech-check/22-monitoring.md) | 5 | None |
| [23-containerization.md](docs/node-js/tech-check/23-containerization.md) | 5 | None |
| [24-deployment.md](docs/node-js/tech-check/24-deployment.md) | 6 | None |
| [29-development-tools.md](docs/node-js/tech-check/29-development-tools.md) | 10 | None |
| [30-cloud-fundamentals.md](docs/node-js/tech-check/30-cloud-fundamentals.md) | 6 | None |
| [core-javascript.md](docs/node-js/tech-check/core-javascript.md) | 3 | None |
| [patterns/behavioral-data.md](docs/node-js/tech-check/patterns/behavioral-data.md) | 4 | None |
| [patterns/behavioral-workflows.md](docs/node-js/tech-check/patterns/behavioral-workflows.md) | 5 | None |
| [patterns/creational.md](docs/node-js/tech-check/patterns/creational.md) | 5 | None |
| [patterns/structural.md](docs/node-js/tech-check/patterns/structural.md) | 5 | None |
| [specialized-systems.md](docs/node-js/tech-check/specialized-systems.md) | 6 | None |

## Validation and limits

- Audited current lesson headings, metadata, coverage records and targeted explanations/examples against all 193 supplied table rows. No external product/API factual review was performed.
- All report destination files were checked to exist. Lesson code, external links and cloud/database exercises were not executed; this is a content/mapping audit.
- No lessons, configuration, tests or existing working-tree changes were modified. Only this report was added. Repository build/tests were not run for this standalone audit report; the root package exposes docs:build, not the Autocode build/test/coverage scripts.
- Source data cannot establish a mechanically correct study-depth value or a unique intended career audience. Correcting those fields requires a documented editorial policy; source proficiency mappings can be preserved without discarding audience labels.

## Material additions after this audit

The original findings above describe the audited snapshot. The following material was subsequently added; the live inventory above now reflects the subsequent metadata corrections.

- Synchronous generator Foundations lesson: [T05-Q09](docs/node-js/tech-check/05-asynchronous-programming.md#t05-q09), including progression, exhaustion, return, early closing and synchronous execution limits.
- Event Splitting: [T09-Q09](docs/node-js/tech-check/09-concurrency.md#t09-q09), explicitly labelled as an interpretation of the undefined chart term, with partitioning, cancellation and offloading distinctions.
- Alternative frameworks: [T16-Q19–Q22](docs/node-js/tech-check/16-framework-alternatives.md), with Hapi, Koa and Feathers setup/read-route/failure/lifecycle examples and a shared optimization experiment. These are focused companions; full production applications and learner performance evidence remain practical work.

These additions addressed the material gaps. Subsequent metadata corrections are summarized in the current-status section at the top.

Verification of additions: all five executable examples passed locally (generator, partitioning, Hapi, Koa and Feathers); the content-policy suite passed. No framework production benchmark or real-device visual review was performed.

Presentation verification: reused existing Core answer panels, structural labels and section dividers; reviewed headings/bold claims. Contrast calculated from unchanged CSS token pairs: dark prose 9.91:1, secondary text 6.57:1, emphasis 6.09:1, link/focus 8.62:1, Core answer prose 8.50:1, headings 11.53:1; light emphasis 7.39:1. These are token calculations, not browser measurements. Responsive overflow, keyboard/touch interaction, 200% zoom and actual Safari/tablet rendering were not verified.

Final documentation checks passed: `node --test scripts/content-policy.test.mjs` (4 tests), `npm run docs:build -- --outDir /tmp/tech-check-gaps-site`, and `git diff --check`. Built HTML contains all new question anchors and the final corrected examples. VitePress reported the existing large-chunk advisory.

## Verification of metadata corrections

- Compared all 193 checked-in source rows and their SHA-256 provenance with the supplied table: wording, all four career cells, explicit/Related status and star groups match.
- `node --test scripts/content-policy.test.mjs scripts/learning-paths.test.mjs scripts/node-tech-check-metadata.test.mjs`: 9 passing tests, including all 233 question records, exact career matrices, supported star mappings, source-link resolution and independent progress placement.
- `npm run docs:build -- --outDir /tmp/tech-check-metadata-site`: passed. The build emitted the large-chunk advisory; no build failure occurred.
- `git diff --check`: passed. Existing staged and unrelated work was preserved; nothing was pushed.
- Browser checks: EventEmitter labels and the source matrix at 390, 600, 768, 820, 1280 and 1440 CSS pixels. No page-wide horizontal overflow; all 193 source rows are rendered. The table preserves readable columns in a reusable horizontal-scroll region, with a visible focus outline and verified keyboard ArrowRight scrolling. Existing completion IDs and group assignments remain intact, and the four companion framework questions now have controls.
- Reused the shared reading palette. Browser-computed dark prose uses rgb(232,220,226), secondary/table headers rgb(196,178,189), header background rgb(41,41,41), and focus outline rgb(189,211,238). Existing dark prose/background contrast is 9.91:1, secondary prose 6.57:1 and focus/background 8.62:1. No new color pairs were introduced.
- Actual Safari/tablet hardware, touch gestures, 200% zoom and light-mode visual review were not performed. Source-table scrolling and narrow-width wrapping were verified in the in-app browser.

Simplification checks (2026-11-19): all 9 content-policy, completion and metadata tests pass; `npm run docs:build -- --outDir /tmp/tech-check-simple-labels-site` passes (large-chunk advisory only). Built logging HTML retains heading ID t21-q01 and its completion checkbox, displays one L1 — Junior target, and contains no trailing question-ID syntax or Study audience field. No theme/palette changes were made in this simplification; no new browser/device visual check was performed.
