---
outline: [2, 3]
---

# Node.js tech-check

Learn how Node.js works, build applications and practise explaining engineering decisions. Start with Foundations if you are new to Node.js, or choose the level that matches your next goal.

Work through each level in order. In Foundations, follow each chapter’s first-pass guidance, try its starter examples and build the starter CLI before returning to deeper explanations. Later project increments extend that same application. Use the Completed checkbox below each question or task title to track your progress.

The [five progressive projects](./progressive-projects.md) grow one repository from a command-line program into an operated service.

![Node.js Tech Check levels: Level 1 covers core JavaScript, CLI, npm, modules, asynchronous programming, APIs and basic frameworks; Level 2 covers the event loop, networking, errors, testing, patterns and tools; Level 3 covers architecture, high-load operations, security, databases and cloud; Level 4 covers advanced security, APIs, databases, frameworks and V8 optimization; Level 5 covers tools, queues, WebSockets, WebAssembly and native modules.](/images/node-js/nodejs-tech-check-levels.png)

[Open the full-size levels chart](/images/node-js/nodejs-tech-check-levels.png).

Each question has one Level Up career target for its question and answer: L1 Junior, L2 Software Engineer, L3 Senior or L4 Lead. Study depth describes how deeply the lesson teaches the topic. Tech Check stars distinguish explicit chart entries from Related correspondence. The [source mapping and label guide](./requirements.md) retains the full career/proficiency matrix without repeating it below every question.

## Check yourself

[Start an interactive assessment](./check-yourself.md) with a repository prompt or a portable version to share. Choose Tech Check or Level Up, full or half length, and broad or focused topic coverage.

## Node.js Foundations

Understand the runtime and build command-line programs with modules, asynchronous code and core APIs.

Start here if you know variables, functions, arrays and basic JavaScript control flow. Core JavaScript below reviews references, `this` and closures; it is not a complete introduction to the language.

**Your first goal is a small working CLI.** Read each chapter’s first-pass guidance rather than treating every advanced question as a prerequisite. The Core answer gives the main idea; try the short example, change one input and explain the result. Expand the deeper explanation when you are ready for more detail.

<LearningPath path-id="foundations" />

Finish the [starter CLI milestone](./progressive-projects.md#starter-cli-milestone) before attempting event-based storage, streaming reports or shutdown drills. These later increments remain part of the full Foundations project, but are separate learning steps.

## Building Node.js Applications

Build and test HTTP applications, handle failures and choose useful application patterns.

**Begin with the finished Project 1 release**, including its [handoff contract](./progressive-projects.md#project-1-handoff-contract). Start a small Express app, then run its NestJS counterpart. Add middleware, errors and a unit/HTTP test before diving into network protocols or process supervision.

NestJS remains part of this level: learn controllers, providers and modules first; add guards, pipes, filters and interceptors alongside the matching application concerns. Follow each chapter's first-pass guide rather than treating every complete lab as an opening exercise.

<LearningPath path-id="applications" />

Use the [first HTTP milestone](./progressive-projects.md#first-http-milestone) for an early checkpoint. Then complete the remaining Project 2 increments and release checks before starting Services.

## Designing Node.js Services

Design service boundaries, persistence, access control and deployment.

**Continue from the full Section 2 project.** Keep its HTTP/CLI contracts, tests and NestJS companion. Work through architecture → PostgreSQL/SQL/ORM → identity → worker reports → containers/deployment. The chapter guides distinguish the required service implementation from advanced distributed-system and Section 4 extensions.

Complete the [Project 3 local/design checkpoint](./progressive-projects.md#project-3-checkpoint-levels) first. Cloud execution has a separate checkpoint; a local pass is not a claim that AWS deployment or recovery was tested.

<LearningPath path-id="services" />

### Terms used in Section 3 {#section-3-vocabulary}

The technical terms below are useful when reading documentation and discussing services. Learn the term together with its meaning; you do not need more advanced English to understand the underlying idea.

| Term | Meaning in these lessons |
|---|---|
| Principal | Verified information about the caller, such as user ID and permissions |
| Scope | The set of data or actions an operation is allowed to access |
| Invariant | A business rule that must remain true, even when operations overlap |
| Payload | The data carried in a request or message |
| Serialization | Converting values into a format that can be stored or sent |
| Admission | Deciding whether to accept new work or reject it because capacity is full |
| Correlation | Using an ID to match a reply or log record with its request |
| Settlement | A promise resolving or rejecting; this does not always mean the underlying work stopped |
| Terminal state | A final state such as completed, failed or cancelled |
| Drain | Let already accepted work finish before closing resources |
| Idempotency | Repeating the same operation does not repeat its intended business effect |
| Reconciliation | Checking what actually happened when an operation’s outcome is uncertain |
| Retention | How long data, files or records are kept |
| Artifact | A produced file, package or image, such as a report or release image |
| Rollout / rollback | Introducing a release / returning to a previous compatible release |
| Test fixture | A controlled test setup and its data |



## Hardening and Optimizing Node.js Services

Strengthen security and use measurements to improve performance and data access.

<LearningPath path-id="hardening" />

## Specialized Node.js Systems {#specialized-systems}

Operate message-driven and real-time services with logs, monitoring and specialist integrations.

<LearningPath path-id="specialized" />

## Node.js Tech Check levels chart

The chart summarizes the five levels and their topic groups, from JavaScript and Node.js foundations to specialized systems.

- [View the full-size levels chart](/images/node-js/nodejs-tech-check-levels.png).
- [Open the sortable requirements matrix](./requirements.md#source-matrix): compare all 193 requirements by topic, Level Up proficiency and Tech Check level.

## Practice and references

- [Node.js runtime course](../index.md): longer explanations and guided lessons.
- [Node.js exercises](../../practice/node-js/index.md): independent implementation tasks.
- [JavaScript technical questions](./js-tech-check.md): language concepts to review alongside Node.js.
- [React technical questions](./react-tech-check.md): frontend concepts for your application's interface.
- [Sortable requirements table](./requirements.md#source-matrix): compare all 193 requirements by topic, Level Up proficiency and Tech Check level.
