---
outline: [2, 3]
---

# Node.js source requirements and label meanings

The table below preserves all 193 rows of the supplied `node-levelup-tech-check-merged.md`. Requirement IDs follow its row order; original wording and empty career cells are retained. Lesson-to-row correspondence is editorial and appears under each question as Source mapping. It identifies relevant requirements, not proof that reading one answer establishes proficiency.

## How to read a question’s labels

- Study depth describes the written lesson: Foundational introduces a concept and simple use; Intermediate applies it with routine failures and tradeoffs; Advanced analyzes interacting failure, consistency, security or operating constraints. A mixed label describes a progression. These editorial depths are independent of career requirements.
- Level Up is one editorial career target for the actual question and answer: L1 Junior, L2 Software Engineer, L3 Senior or L4 Lead. It replaces the separate Study audience label. It is a teaching recommendation, not a claim that the supplied table assigns only one career level to the topic. The complete source proficiency cells remain in the matrix below; a dash means no source entry.
- Tech Check level shows the chart category or categories used for the topic. Several levels can apply across chart contexts; that does not make the current lesson equally deep at every level. Study depth describes the depth of the individual lesson.
- Curriculum placement and completion IDs are kept as hidden page metadata, independently of the visible career target and source stars. Projects show a curriculum milestone rather than a single official topic rating.

Combined chart rows require interpretation. R153 lists frameworks at levels 1, 2 and 4; R154 combines basic framework concepts (1) with cloud concepts (3). R160/R161 combine Errors (2) and V8 Optimizations (4). R170/R171 combine Generators (3), intermediate databases/API (4), and WebAssembly/native modules (5). Each lesson selects its own category rather than inheriting every level in the combined row.

The source does not define Event Splitting or give detailed criteria for overview-only categories. The linked lessons state their interpretation or limits rather than inventing official requirements. Source hash: `8ea93eecf322e4297e3575ce15410b984cf529e121705938339c26ba2dc0affe`.

## Source matrix

Click a column header to sort; click again to reverse the order. Keyboard users can focus a header and press Enter or Space. Career proficiency sorts from Novice to Intermediate to Advanced, with empty cells last. Tech Check groups sort by star count, comparing multiple levels from left to right.

The matrix scrolls horizontally. Focus its region with the keyboard and use the arrow keys to reach later columns.

<SortableTable label="Node.js source proficiency matrix" :column-types="['text', 'text', 'text', 'text', 'proficiency', 'proficiency', 'proficiency', 'proficiency', 'stars']">

| ID | Topic / source skill | Level Up requirement | Tech Check keyword / category | L1 | L2 | L3 | L4 | Tech Check level |
|---|---|---|---|---|---|---|---|---|
| <span id="r001"></span>R001 | Node.js CLI | Basic commands | — | Novice | Novice | Intermediate | Advanced | ⭐ |
| <span id="r002"></span>R002 | Node.js CLI | Build-in Node.js CLI options | — | Novice | Novice | Intermediate | Advanced | ⭐ |
| <span id="r003"></span>R003 | Node.js Modules | Standard Modules | — | Novice | Novice | Intermediate | Advanced | ⭐ |
| <span id="r004"></span>R004 | Node.js Modules | ES Modules | Common / ES6 (Modules) | Novice | Novice | Intermediate | Advanced | ⭐ |
| <span id="r005"></span>R005 | Node.js Modules | Module Scope | — | Novice | Novice | Intermediate | Advanced | ⭐ |
| <span id="r006"></span>R006 | Node.js Package Managers | CLI Options | — | Novice | Novice | Intermediate | Advanced | ⭐ |
| <span id="r007"></span>R007 | Node.js Package Managers | Package Structure | Package structure (NPM) | Novice | Novice | Intermediate | Advanced | ⭐ |
| <span id="r008"></span>R008 | Node.js Async programming | Callbacks | Callbacks (Asynchronous) | Novice | Novice | Intermediate | Advanced | ⭐ |
| <span id="r009"></span>R009 | Node.js Async programming | Promise | Promises (Asynchronous) | Novice | Novice | Intermediate | Advanced | ⭐ |
| <span id="r010"></span>R010 | Node.js Events | Event-Driven Programming | — | Novice | Novice | Intermediate | Advanced | ⭐, ⭐⭐ |
| <span id="r011"></span>R011 | Node.js API | Console API | — | Novice | Novice | Intermediate | Advanced | ⭐, ⭐⭐⭐⭐ |
| <span id="r012"></span>R012 | Node.js API | File System API | File (API); File system (API) | Novice | Novice | Intermediate | Advanced | ⭐, ⭐⭐⭐⭐ |
| <span id="r013"></span>R013 | Node.js API | String Decoder API | — | Novice | Novice | Intermediate | Advanced | ⭐, ⭐⭐⭐⭐ |
| <span id="r014"></span>R014 | Node.js API | Timer API | Timer (API) | Novice | Novice | Intermediate | Advanced | ⭐ |
| <span id="r015"></span>R015 | Node.js API | URI API | — | Novice | Novice | Intermediate | Advanced | ⭐, ⭐⭐⭐⭐ |
| <span id="r016"></span>R016 | Node.js Error Handling | Async errors, Promise rejections | — | Novice | Novice | Intermediate | Advanced | ⭐⭐ |
| <span id="r017"></span>R017 | Node.js Error Handling | Error Class | — | Novice | Novice | Intermediate | Advanced | ⭐⭐ |
| <span id="r018"></span>R018 | Node.js Debugging | Native debugging | — | Novice | Novice | Intermediate | Advanced | ⭐⭐ |
| <span id="r019"></span>R019 | Node.js Authorization | JWT | JWT (Security) | Novice | Novice | Intermediate | Advanced | ⭐⭐⭐ |
| <span id="r020"></span>R020 | Node.js Testing | Unit tests | Unit Tests (Testing) | Novice | Novice | Intermediate | Advanced | ⭐⭐ |
| <span id="r021"></span>R021 | Node.js Documentation | JSDoc | JSDoc (Tools (basic)) | Novice | Novice | Intermediate | Advanced | ⭐⭐ |
| <span id="r022"></span>R022 | Node.js Loggers | Types of logges. Logging levels. | — | Novice | Novice | Intermediate | Advanced | ⭐⭐⭐⭐⭐ |
| <span id="r023"></span>R023 | Node.js Deployment | NPM Scripts | Scripts (NPM) | Novice | Novice | Intermediate | Advanced | ⭐ |
| <span id="r024"></span>R024 | Node.js CLI | Environment Variables | Environment variables (CLI) | — | — | Intermediate | Advanced | ⭐ |
| <span id="r025"></span>R025 | Node.js Modules | Global Objects | — | — | — | Intermediate | Advanced | ⭐ |
| <span id="r026"></span>R026 | Node.js Modules | Module Load System | Load System (Modules) | — | — | Intermediate | Advanced | ⭐ |
| <span id="r027"></span>R027 | Node.js Modules | Module Object | — | — | — | Intermediate | Advanced | ⭐ |
| <span id="r028"></span>R028 | Node.js Package Managers | Package manager as a build tool | — | — | — | Intermediate | Advanced | ⭐ |
| <span id="r029"></span>R029 | Node.js Package Managers | Package manager configuration | — | — | — | Intermediate | Advanced | ⭐ |
| <span id="r030"></span>R030 | Node.js Package Managers | Package manager scripts | Scripts (NPM) | — | — | Intermediate | Advanced | ⭐ |
| <span id="r031"></span>R031 | Node.js Async programming | Async programming patterns/tools | — | — | — | Intermediate | Advanced | ⭐, ⭐⭐⭐ |
| <span id="r032"></span>R032 | Node.js Async programming | async/await | Async / Await (Asynchronous) | — | — | Intermediate | Advanced | ⭐ |
| <span id="r033"></span>R033 | Node.js Events | Event Loop | — | — | — | Intermediate | Advanced | ⭐, ⭐⭐ |
| <span id="r034"></span>R034 | Node.js Events | EventEmitter | EventEmitter (API) | — | — | Intermediate | Advanced | ⭐ |
| <span id="r035"></span>R035 | Node.js Events | OS events handlers | — | — | — | Intermediate | Advanced | ⭐, ⭐⭐ |
| <span id="r036"></span>R036 | Node.js API | Buffer API | — | — | — | Intermediate | Advanced | ⭐, ⭐⭐⭐⭐ |
| <span id="r037"></span>R037 | Node.js API | Cluster API | Cluster (API) | — | — | Intermediate | Advanced | ⭐⭐⭐⭐ |
| <span id="r038"></span>R038 | Node.js API | Crypto API | Crypto (API) | — | — | Intermediate | Advanced | ⭐⭐⭐⭐ |
| <span id="r039"></span>R039 | Node.js API | Net API | — | — | — | Intermediate | Advanced | ⭐, ⭐⭐⭐⭐ |
| <span id="r040"></span>R040 | Node.js API | OS API | — | — | — | Intermediate | Advanced | ⭐, ⭐⭐⭐⭐ |
| <span id="r041"></span>R041 | Node.js API | Readline API | — | — | — | Intermediate | Advanced | ⭐, ⭐⭐⭐⭐ |
| <span id="r042"></span>R042 | Node.js API | Stream API | Stream (API) | — | — | Intermediate | Advanced | ⭐, ⭐⭐⭐⭐ |
| <span id="r043"></span>R043 | Node.js API | Zlib API | — | — | — | Intermediate | Advanced | ⭐, ⭐⭐⭐⭐ |
| <span id="r044"></span>R044 | Node.js Error Handling | Custom Errors | — | — | — | Intermediate | Advanced | ⭐⭐ |
| <span id="r045"></span>R045 | Node.js Network | HTTPS | HTTPS (Network); HTTPS (Security) | — | — | Intermediate | Advanced | ⭐⭐, ⭐⭐⭐ |
| <span id="r046"></span>R046 | Node.js Network | Network API | — | — | — | Intermediate | Advanced | ⭐⭐ |
| <span id="r047"></span>R047 | Node.js Real Time Applications | WebSockets | — | — | — | Intermediate | Advanced | ⭐⭐⭐⭐⭐ |
| <span id="r048"></span>R048 | Node.js Performance | Profilers | — | — | — | Intermediate | Advanced | ⭐⭐⭐⭐ |
| <span id="r049"></span>R049 | Node.js Debugging | Inspectors and specialized tools | — | — | — | Intermediate | Advanced | ⭐⭐ |
| <span id="r050"></span>R050 | Node.js Authorization | PassportJS | Passport (Security) | — | — | Intermediate | Advanced | ⭐⭐⭐⭐ |
| <span id="r051"></span>R051 | Node.js Security | Basic practices and approaches | — | — | — | Intermediate | Advanced | ⭐⭐⭐⭐ |
| <span id="r052"></span>R052 | Node.js Testing | Contract tests | — | — | — | Intermediate | Advanced | ⭐⭐ |
| <span id="r053"></span>R053 | Node.js Testing | Integration tests | Integration Tests (Testing) | — | — | Intermediate | Advanced | ⭐⭐ |
| <span id="r054"></span>R054 | Node.js Testing | TDD/BDD | — | — | — | Intermediate | Advanced | ⭐⭐ |
| <span id="r055"></span>R055 | Node.js Documentation | Third party documentation tools / services | — | — | — | Intermediate | Advanced | ⭐⭐, ⭐⭐⭐ |
| <span id="r056"></span>R056 | Node.js ORM / ODMNode.js Frameworks Node.js Serverless | Serverless code implementaiton | — | — | — | Intermediate | Advanced | ⭐, ⭐⭐, ⭐⭐⭐, ⭐⭐⭐⭐ |
| <span id="r057"></span>R057 | Node.js ORM / ODMNode.js Frameworks Node.js Serverless | Serverless solution (based on AWS Lambda, Azure functions, Google CloudFunctions, etc.) | — | — | — | Intermediate | Advanced | ⭐, ⭐⭐, ⭐⭐⭐, ⭐⭐⭐⭐ |
| <span id="r058"></span>R058 | Node.js Loggers | Logging tools and libraries (Logstash, Winston etc.) | — | — | — | Intermediate | Advanced | ⭐⭐⭐⭐⭐ |
| <span id="r059"></span>R059 | Node.js Queue | Basic knowledge of tools and solutions (RabbitMQ / AtiveMQ / Kafka / SQS / SNS) | — | — | — | Intermediate | Advanced | ⭐⭐⭐⭐⭐ |
| <span id="r060"></span>R060 | Node.js Containerization | Containerization practices and approaches | — | — | — | Intermediate | Advanced | ⭐⭐⭐ |
| <span id="r061"></span>R061 | Node.js Containerization | Tools and services (Docker, Docker Compose, etc.) | — | — | — | Intermediate | Advanced | ⭐⭐⭐ |
| <span id="r062"></span>R062 | Node.js Architecture / Patterns | Application structure architecture principles | — | — | — | Intermediate | Advanced | ⭐⭐, ⭐⭐⭐ |
| <span id="r063"></span>R063 | Node.js Architecture / Patterns | Basic GoF Creational, Structural, Behavioral patterns knowledge | — | — | — | Intermediate | Advanced | ⭐⭐, ⭐⭐⭐ |
| <span id="r064"></span>R064 | Node.js Architecture / Patterns | Microservices basic principles | — | — | — | Intermediate | Advanced | ⭐⭐, ⭐⭐⭐ |
| <span id="r065"></span>R065 | Node.js Deployment | CI/CD | — | — | — | Intermediate | Advanced | ⭐⭐⭐ |
| <span id="r066"></span>R066 | Node.js Deployment | SSH/Command line tools | — | — | — | Intermediate | Advanced | ⭐⭐⭐ |
| <span id="r067"></span>R067 | Node.js CLI | REPL | — | — | — | — | Advanced | ⭐ |
| <span id="r068"></span>R068 | Node.js Modules | Module API / Global Async and async modules | — | — | — | — | Advanced | ⭐ |
| <span id="r069"></span>R069 | Node.js Package Managers | Semantic versioning and package manager registry | Semantic versioning (NPM) | — | — | — | Advanced | ⭐ |
| <span id="r070"></span>R070 | Node.js Async programming | Async iterators / async-generators | — | — | — | — | Advanced | ⭐, ⭐⭐⭐ |
| <span id="r071"></span>R071 | Node.js Events | libUV | libUV (Event Loop) | — | — | — | Advanced | ⭐⭐ |
| <span id="r072"></span>R072 | Node.js API | DNS API | — | — | — | — | Advanced | ⭐, ⭐⭐⭐⭐ |
| <span id="r073"></span>R073 | Node.js API | Process API | Process (API) | — | — | — | Advanced | ⭐⭐⭐⭐ |
| <span id="r074"></span>R074 | Node.js Error Handling | Criticality matrix | — | — | — | — | Advanced | ⭐⭐ |
| <span id="r075"></span>R075 | Node.js Real Time Applications | SocketIO | SocketIO (WebSockets) | — | — | — | Advanced | ⭐⭐⭐⭐⭐ |
| <span id="r076"></span>R076 | Node.js Real Time Applications | IP sockets | IP Sockets (WebSockets) | — | — | — | Advanced | ⭐⭐⭐⭐⭐ |
| <span id="r077"></span>R077 | Node.js V8 | V8 API, optimizations | — | — | — | — | Advanced | ⭐⭐⭐⭐ |
| <span id="r078"></span>R078 | Node.js Performance | Performance API | — | — | — | — | Advanced | ⭐⭐⭐⭐ |
| <span id="r079"></span>R079 | Node.js Performance | Performance testing tools | — | — | — | — | Advanced | ⭐⭐⭐⭐ |
| <span id="r080"></span>R080 | Node.js Performance | Multithreading (fork, clustering) | Child Processes (High-load Ops) | — | — | — | Advanced | ⭐⭐⭐ |
| <span id="r081"></span>R081 | Node.js Debugging | Remote debugging | — | — | — | — | Advanced | ⭐⭐ |
| <span id="r082"></span>R082 | Node.js Debugging | Async code debugging/Memory leaks | — | — | — | — | Advanced | ⭐⭐ |
| <span id="r083"></span>R083 | Node.js Authorization | PassportJS Strategy | Passport (Security) | — | — | — | Advanced | ⭐⭐⭐⭐ |
| <span id="r084"></span>R084 | Node.js Authorization | Third party auth services | — | — | — | — | Advanced | ⭐⭐⭐, ⭐⭐⭐⭐ |
| <span id="r085"></span>R085 | Node.js Authorization | Microservices Authentication and Authorization | — | — | — | — | Advanced | ⭐⭐⭐, ⭐⭐⭐⭐ |
| <span id="r086"></span>R086 | Node.js Security | NPM Audit | — | — | — | — | Advanced | ⭐⭐⭐⭐ |
| <span id="r087"></span>R087 | Node.js Security | Helmet | — | — | — | — | Advanced | ⭐⭐⭐⭐ |
| <span id="r088"></span>R088 | Node.js Security | Sandboxing unsafe code | — | — | — | — | Advanced | ⭐⭐⭐⭐ |
| <span id="r089"></span>R089 | Node.js Security | Third party security check services | — | — | — | — | Advanced | ⭐⭐⭐⭐ |
| <span id="r090"></span>R090 | Node.js Testing | Stress / load testing | — | — | — | — | Advanced | ⭐⭐ |
| <span id="r091"></span>R091 | Node.js Testing | Performance testing | — | — | — | — | Advanced | ⭐⭐ |
| <span id="r092"></span>R092 | Node.js Testing | E2E tests | E2E Tests (Testing) | — | — | — | Advanced | ⭐⭐ |
| <span id="r093"></span>R093 | Node.js ORM / ODMNode.js Frameworks Node.js Serverless | Extended cofiguration and advanced usage | — | — | — | — | Advanced | ⭐, ⭐⭐, ⭐⭐⭐, ⭐⭐⭐⭐ |
| <span id="r094"></span>R094 | Node.js Loggers | Remote logging services and tools, configuration and setup | — | — | — | — | Advanced | ⭐⭐⭐⭐⭐ |
| <span id="r095"></span>R095 | Node.js Vizualization / Monitoring | Purpose of Vizualization / Monitoring tools | — | — | — | — | Advanced | ⭐⭐⭐⭐⭐ |
| <span id="r096"></span>R096 | Node.js Vizualization / Monitoring | Intermediate Setup and usage of third party services (Kibana, Grafana, Graphite, Prometheus or Zabbix, etc.) | — | — | — | — | Advanced | ⭐⭐⭐⭐⭐ |
| <span id="r097"></span>R097 | Node.js Queue | Failover techniques | — | — | — | — | Advanced | ⭐⭐⭐⭐⭐ |
| <span id="r098"></span>R098 | Node.js Containerization | Containers / orchestration management | — | — | — | — | Advanced | ⭐⭐⭐ |
| <span id="r099"></span>R099 | Node.js Architecture / Patterns | Experience with advanced microservices practices | — | — | — | — | Advanced | ⭐⭐, ⭐⭐⭐ |
| <span id="r100"></span>R100 | Node.js Architecture / Patterns | Consistency patterns | — | — | — | — | Advanced | ⭐⭐, ⭐⭐⭐ |
| <span id="r101"></span>R101 | Node.js Architecture / Patterns | Performance vs scalability best practices and approaches | — | — | — | — | Advanced | ⭐⭐, ⭐⭐⭐ |
| <span id="r102"></span>R102 | Node.js Architecture / Patterns | Availability vs consistency patterns | — | — | — | — | Advanced | ⭐⭐, ⭐⭐⭐ |
| <span id="r103"></span>R103 | Node.js Deployment | Docker images | — | — | — | — | Advanced | ⭐⭐⭐ |
| <span id="r104"></span>R104 | Node.js Deployment | Cloud deployment | — | — | — | — | Advanced | ⭐⭐⭐ |
| <span id="r105"></span>R105 | Node.js Core | ability to explain the Node.js runtime purpose and how core APIs differ from browser JavaScript | — | Novice | Novice | — | — | ⭐, ⭐⭐, ⭐⭐⭐, ⭐⭐⭐⭐ |
| <span id="r106"></span>R106 | Node.js Core | knowledge of the event driven, non blocking execution model and the event loop at a conceptual level | — | Novice | Novice | — | — | ⭐, ⭐⭐, ⭐⭐⭐, ⭐⭐⭐⭐ |
| <span id="r107"></span>R107 | Node.js Core | ability to use built in modules such as fs, path, os, and process with documentation | Path (API) | Novice | Novice | — | — | ⭐ |
| <span id="r108"></span>R108 | Node.js Core | knowledge of CommonJS module basics and package entry points | — | Novice | Novice | — | — | ⭐, ⭐⭐, ⭐⭐⭐, ⭐⭐⭐⭐ |
| <span id="r109"></span>R109 | Node.js Core | ability to run scripts with node and inspect basic process arguments and environment variables | — | Novice | Novice | — | — | ⭐, ⭐⭐, ⭐⭐⭐, ⭐⭐⭐⭐ |
| <span id="r110"></span>R110 | Node.js Core | ability to build and execute small CLI or service scripts using core modules without heavy guidance | — | — | — | Intermediate | — | ⭐, ⭐⭐, ⭐⭐⭐, ⭐⭐⭐⭐ |
| <span id="r111"></span>R111 | Node.js Core | ability to read and write files asynchronously using callbacks, promises, and fs APIs | — | — | — | Intermediate | — | ⭐, ⭐⭐, ⭐⭐⭐, ⭐⭐⭐⭐ |
| <span id="r112"></span>R112 | Node.js Core | ability to manage process lifecycle, exit codes, standard input, standard output, standard error, and environment configuration | — | — | — | Intermediate | — | ⭐, ⭐⭐, ⭐⭐⭐, ⭐⭐⭐⭐ |
| <span id="r113"></span>R113 | Node.js Core | knowledge of timers, buffers, streams, and events for common application tasks | — | — | — | Intermediate | — | ⭐, ⭐⭐, ⭐⭐⭐, ⭐⭐⭐⭐ |
| <span id="r114"></span>R114 | Node.js Core | ability to install dependencies and use package.json scripts while distinguishing core modules from packages | — | — | — | Intermediate | — | ⭐, ⭐⭐, ⭐⭐⭐, ⭐⭐⭐⭐ |
| <span id="r115"></span>R115 | Node.js Core | ability to design Node.js applications around streams, backpressure, and asynchronous control flow | — | — | — | — | Advanced | ⭐, ⭐⭐, ⭐⭐⭐, ⭐⭐⭐⭐ |
| <span id="r116"></span>R116 | Node.js Core | ability to diagnose module loading, runtime errors, and event loop behavior in live applications | — | — | — | — | Advanced | ⭐, ⭐⭐, ⭐⭐⭐, ⭐⭐⭐⭐ |
| <span id="r117"></span>R117 | Node.js Core | ability to implement custom event emitters, child process interactions, and IPC where appropriate | — | — | — | — | Advanced | ⭐, ⭐⭐, ⭐⭐⭐, ⭐⭐⭐⭐ |
| <span id="r118"></span>R118 | Node.js Core | knowledge of performance tradeoffs for buffers, memory usage, and synchronous versus asynchronous APIs | — | — | — | — | Advanced | ⭐, ⭐⭐, ⭐⭐⭐, ⭐⭐⭐⭐ |
| <span id="r119"></span>R119 | Node.js Core | ability to select and apply core APIs for networking, file systems, and concurrency in production scenarios | — | — | — | — | Advanced | ⭐, ⭐⭐, ⭐⭐⭐, ⭐⭐⭐⭐ |
| <span id="r120"></span>R120 | Node.js Frameworks | knowledge of common Node.js framework categories and the problems they solve | — | Novice | — | — | — | ⭐, ⭐⭐, ⭐⭐⭐⭐ |
| <span id="r121"></span>R121 | Node.js Frameworks | ability to follow documentation to install, configure, and run a basic framework project | — | Novice | — | — | — | ⭐, ⭐⭐, ⭐⭐⭐⭐ |
| <span id="r122"></span>R122 | Node.js Frameworks | ability to identify core concepts such as routing, middleware, controllers, and request handling | — | Novice | — | — | — | ⭐, ⭐⭐, ⭐⭐⭐⭐ |
| <span id="r123"></span>R123 | Node.js Frameworks | knowledge of the framework request and response lifecycle at a high level | — | Novice | — | — | — | ⭐, ⭐⭐, ⭐⭐⭐⭐ |
| <span id="r124"></span>R124 | Node.js Frameworks | ability to build simple CRUD endpoints or pages using framework conventions | — | — | Intermediate | Intermediate | — | ⭐, ⭐⭐, ⭐⭐⭐⭐ |
| <span id="r125"></span>R125 | Node.js Frameworks | ability to apply middleware for authentication, validation, and basic error handling | — | — | Intermediate | Intermediate | — | ⭐, ⭐⭐, ⭐⭐⭐⭐ |
| <span id="r126"></span>R126 | Node.js Frameworks | ability to manage configuration, environment variables, and package dependencies in a working application | — | — | Intermediate | Intermediate | — | ⭐, ⭐⭐, ⭐⭐⭐⭐ |
| <span id="r127"></span>R127 | Node.js Frameworks | ability to troubleshoot common setup and runtime issues with documentation support | — | — | Intermediate | Intermediate | — | ⭐, ⭐⭐, ⭐⭐⭐⭐ |
| <span id="r128"></span>R128 | Node.js Frameworks | ability to choose an appropriate framework style for MVC, full-stack, or REST API use cases | — | — | — | — | Advanced | ⭐, ⭐⭐, ⭐⭐⭐⭐ |
| <span id="r129"></span>R129 | Node.js Frameworks | ability to design maintainable application structure with modules, services, and reusable components | — | — | — | — | Advanced | ⭐, ⭐⭐, ⭐⭐⭐⭐ |
| <span id="r130"></span>R130 | Node.js Frameworks | ability to implement testing, logging, security, and performance practices within framework-based applications | — | — | — | — | Advanced | ⭐, ⭐⭐, ⭐⭐⭐⭐ |
| <span id="r131"></span>R131 | Node.js Frameworks | knowledge of framework-specific extension points, lifecycle hooks, and deployment considerations | — | — | — | — | Advanced | ⭐, ⭐⭐, ⭐⭐⭐⭐ |
| <span id="r132"></span>R132 | Node.js Database Experience | knowledge of basic Node.js database connectivity concepts and common database types | — | Novice | — | — | — | ⭐⭐⭐, ⭐⭐⭐⭐ |
| <span id="r133"></span>R133 | Node.js Database Experience | ability to configure a simple database connection using a driver or library | — | Novice | — | — | — | ⭐⭐⭐, ⭐⭐⭐⭐ |
| <span id="r134"></span>R134 | Node.js Database Experience | knowledge of fundamental create, read, update, and delete operations | — | Novice | — | — | — | ⭐⭐⭐, ⭐⭐⭐⭐ |
| <span id="r135"></span>R135 | Node.js Database Experience | ability to recognize the difference between relational and NoSQL data stores at a high level | — | Novice | — | — | — | ⭐⭐⭐, ⭐⭐⭐⭐ |
| <span id="r136"></span>R136 | Node.js Database Experience | ability to run parameterized queries and basic ORM or query builder operations | — | — | Intermediate | Intermediate | Intermediate | ⭐⭐⭐, ⭐⭐⭐⭐ |
| <span id="r137"></span>R137 | Node.js Database Experience | ability to manage connection pooling and handle routine database errors in application code | — | — | Intermediate | Intermediate | Intermediate | ⭐⭐⭐, ⭐⭐⭐⭐ |
| <span id="r138"></span>R138 | Node.js Database Experience | knowledge of transaction usage for multi step data changes | — | — | Intermediate | Intermediate | Intermediate | ⭐⭐⭐, ⭐⭐⭐⭐ |
| <span id="r139"></span>R139 | Node.js Database Experience | ability to retrieve and persist application data within a working Node.js service | — | — | Intermediate | Intermediate | Intermediate | ⭐⭐⭐, ⭐⭐⭐⭐ |
| <span id="r140"></span>R140 | Node.js Infrastructure and Clouds | ability to describe common infrastructure components used by Node.js applications, including compute, storage, networking, and runtime dependencies | — | Novice | Novice | — | — | ⭐⭐⭐, ⭐⭐⭐⭐⭐ |
| <span id="r141"></span>R141 | Node.js Infrastructure and Clouds | knowledge of basic cloud service models and typical deployment targets such as virtual machines, containers, and managed platforms | — | Novice | Novice | — | — | ⭐⭐⭐, ⭐⭐⭐⭐⭐ |
| <span id="r142"></span>R142 | Node.js Infrastructure and Clouds | ability to follow documented steps to configure environment variables, secrets, and application settings for a single environment | — | Novice | Novice | — | — | ⭐⭐⭐, ⭐⭐⭐⭐⭐ |
| <span id="r143"></span>R143 | Node.js Infrastructure and Clouds | knowledge of foundational concepts for logging, health checks, and basic process management in a cloud host | — | Novice | Novice | — | — | ⭐⭐⭐, ⭐⭐⭐⭐⭐ |
| <span id="r144"></span>R144 | Node.js Infrastructure and Clouds | ability to deploy and update a Node.js application in at least one cloud environment using documented pipelines or commands | — | — | — | Intermediate | Intermediate | ⭐⭐⭐, ⭐⭐⭐⭐⭐ |
| <span id="r145"></span>R145 | Node.js Infrastructure and Clouds | knowledge of load balancing, autoscaling, and managed database or cache integrations used to support application workloads | — | — | — | Intermediate | Intermediate | ⭐⭐⭐, ⭐⭐⭐⭐⭐ |
| <span id="r146"></span>R146 | Node.js Infrastructure and Clouds | ability to configure application observability using logs, metrics, and alerts for routine operational monitoring | — | — | — | Intermediate | Intermediate | ⭐⭐⭐, ⭐⭐⭐⭐⭐ |
| <span id="r147"></span>R147 | Node.js Infrastructure and Clouds | ability to collaborate with others to troubleshoot deployment, network, or permission issues using cloud consoles and documentation | — | — | — | Intermediate | Intermediate | ⭐⭐⭐, ⭐⭐⭐⭐⭐ |
| <span id="r148"></span>R148 | Tech Check / Core JavaScript | — | Object (Core JavaScript) | — | — | — | — | ⭐ |
| <span id="r149"></span>R149 | Tech Check / Core JavaScript | — | Context (Core JavaScript) | — | — | — | — | ⭐ |
| <span id="r150"></span>R150 | Tech Check / Core JavaScript | — | Closure (Core JavaScript) | — | — | — | — | ⭐ |
| <span id="r151"></span>R151 | Tech Check / NPM | — | Package.json / package-lock.json (NPM) | — | — | — | — | ⭐ |
| <span id="r152"></span>R152 | Tech Check / Asynchronous | — | Generators (Asynchronous) | — | — | — | — | ⭐ |
| <span id="r153"></span>R153 | Tech Check / Framework (basic) | — | Hapi / Express / Koa / Nest.JS / Feathers.JS (Framework (basic)); Hapi / Express / Koa / Nest.JS / Feathers.JS (Framework (intermediate)); Hapi / Express / Koa / Nest.JS / Feathers.JS (Framework (advanced)) | — | — | — | — | ⭐, ⭐⭐, ⭐⭐⭐⭐ |
| <span id="r154"></span>R154 | Tech Check / Framework (basic) | — | Concept (Framework (basic)); Concept (Cloud) | — | — | — | — | ⭐, ⭐⭐⭐ |
| <span id="r155"></span>R155 | Tech Check / Framework (basic) | — | Configuration (Framework (basic)) | — | — | — | — | ⭐ |
| <span id="r156"></span>R156 | Tech Check / Event Loop | — | Phases (Event Loop) | — | — | — | — | ⭐⭐ |
| <span id="r157"></span>R157 | Tech Check / Event Loop | — | Micro / Tasks (Event Loop) | — | — | — | — | ⭐⭐ |
| <span id="r158"></span>R158 | Tech Check / Network | — | HTTP Protocol (Network) | — | — | — | — | ⭐⭐ |
| <span id="r159"></span>R159 | Tech Check / Network | — | HTTP API (Network) | — | — | — | — | ⭐⭐ |
| <span id="r160"></span>R160 | Tech Check / Errors | — | Named in overview and detailed panel (Errors); Named in overview and detailed panel (V8 Optimizations) | — | — | — | — | ⭐⭐, ⭐⭐⭐⭐ |
| <span id="r161"></span>R161 | Tech Check / Errors | — | no subtopics supplied (Errors); no subtopics supplied (V8 Optimizations) | — | — | — | — | ⭐⭐, ⭐⭐⭐⭐ |
| <span id="r162"></span>R162 | Tech Check / Patterns | — | Creational (Patterns) | — | — | — | — | ⭐⭐ |
| <span id="r163"></span>R163 | Tech Check / Patterns | — | Structural (Patterns) | — | — | — | — | ⭐⭐ |
| <span id="r164"></span>R164 | Tech Check / Patterns | — | Behavior (Patterns) | — | — | — | — | ⭐⭐ |
| <span id="r165"></span>R165 | Tech Check / Tools (basic) | — | ESLint (Tools (basic)) | — | — | — | — | ⭐⭐ |
| <span id="r166"></span>R166 | Tech Check / Tools (basic) | — | Style Guide (Tools (basic)) | — | — | — | — | ⭐⭐ |
| <span id="r167"></span>R167 | Tech Check / Framework (intermediate) | — | Routing (Framework (intermediate)) | — | — | — | — | ⭐⭐ |
| <span id="r168"></span>R168 | Tech Check / Framework (intermediate) | — | Middlewares (Framework (intermediate)) | — | — | — | — | ⭐⭐ |
| <span id="r169"></span>R169 | Tech Check / Framework (intermediate) | — | Error Handling (Framework (intermediate)) | — | — | — | — | ⭐⭐ |
| <span id="r170"></span>R170 | Tech Check / Generators | — | Named in overview (Generators); Named in overview (Databases (intermediate)); Named in overview (API); Named in overview (WebAssembly); Named in overview (Native Modules) | — | — | — | — | ⭐⭐⭐, ⭐⭐⭐⭐, ⭐⭐⭐⭐⭐ |
| <span id="r171"></span>R171 | Tech Check / Generators | — | no additional criteria supplied (Generators); no additional criteria supplied (Databases (intermediate)); no additional criteria supplied (API); no additional criteria supplied (WebAssembly); no additional criteria supplied (Native Modules) | — | — | — | — | ⭐⭐⭐, ⭐⭐⭐⭐, ⭐⭐⭐⭐⭐ |
| <span id="r172"></span>R172 | Tech Check / Architecture | — | Layered (Architecture) | — | — | — | — | ⭐⭐⭐ |
| <span id="r173"></span>R173 | Tech Check / Architecture | — | Micro-Services (Architecture) | — | — | — | — | ⭐⭐⭐ |
| <span id="r174"></span>R174 | Tech Check / Architecture | — | Event-Driven (Architecture) | — | — | — | — | ⭐⭐⭐ |
| <span id="r175"></span>R175 | Tech Check / Architecture | — | Flux (Architecture) | — | — | — | — | ⭐⭐⭐ |
| <span id="r176"></span>R176 | Tech Check / High-load Ops | — | Event Splitting (High-load Ops) | — | — | — | — | ⭐⭐⭐ |
| <span id="r177"></span>R177 | Tech Check / Tools (intermediate) | — | Swagger (Tools (intermediate)) | — | — | — | — | ⭐⭐⭐ |
| <span id="r178"></span>R178 | Tech Check / Tools (intermediate) | — | Docker (Tools (intermediate)) | — | — | — | — | ⭐⭐⭐ |
| <span id="r179"></span>R179 | Tech Check / Databases (basic) | — | SQL (Databases (basic)) | — | — | — | — | ⭐⭐⭐ |
| <span id="r180"></span>R180 | Tech Check / Databases (basic) | — | NoSQL (Databases (basic)) | — | — | — | — | ⭐⭐⭐ |
| <span id="r181"></span>R181 | Tech Check / Cloud | — | Providers (Cloud) | — | — | — | — | ⭐⭐⭐ |
| <span id="r182"></span>R182 | Tech Check / Cloud | — | Serverless (Cloud) | — | — | — | — | ⭐⭐⭐ |
| <span id="r183"></span>R183 | Tech Check / Cloud | — | SOA (Cloud) | — | — | — | — | ⭐⭐⭐ |
| <span id="r184"></span>R184 | Tech Check / Security | — | TLS (Security) | — | — | — | — | ⭐⭐⭐⭐ |
| <span id="r185"></span>R185 | Tech Check / Security | — | SSL (Security) | — | — | — | — | ⭐⭐⭐⭐ |
| <span id="r186"></span>R186 | Tech Check / Security | — | OAuth (Security) | — | — | — | — | ⭐⭐⭐⭐ |
| <span id="r187"></span>R187 | Tech Check / Security | — | OWASP (Security) | — | — | — | — | ⭐⭐⭐⭐ |
| <span id="r188"></span>R188 | Tech Check / Framework (advanced) | — | Optimization (Framework (advanced)) | — | — | — | — | ⭐⭐⭐⭐ |
| <span id="r189"></span>R189 | Tech Check / Queues | — | RabbitMQ (Queues) | — | — | — | — | ⭐⭐⭐⭐⭐ |
| <span id="r190"></span>R190 | Tech Check / Queues | — | Kafka (Queues) | — | — | — | — | ⭐⭐⭐⭐⭐ |
| <span id="r191"></span>R191 | Tech Check / Tools (advanced) | — | Kibana (Tools (advanced)) | — | — | — | — | ⭐⭐⭐⭐⭐ |
| <span id="r192"></span>R192 | Tech Check / Tools (advanced) | — | Grafana (Tools (advanced)) | — | — | — | — | ⭐⭐⭐⭐⭐ |
| <span id="r193"></span>R193 | Tech Check / Tools (advanced) | — | New relic (Tools (advanced)) | — | — | — | — | ⭐⭐⭐⭐⭐ |

</SortableTable>
