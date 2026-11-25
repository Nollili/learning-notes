---
outline: [2, 2]
---

# More explanations and practice at a glance

One short reminder for each of the **23 questions** in this section. Use the topic links to return to the full answers and diagrams.

## Creational patterns

- [Factory Method](./patterns/creational.md#t18-q05): **A subclass customizes creation inside a creator's stable workflow.** A standalone object-returning factory is useful but does not automatically express this pattern.
- [Abstract Factory](./patterns/creational.md#t18-q06): **Create a compatible family of collaborators through agreed interfaces.** Backend-specific transactions and failures still need explicit contracts and tests.
- [Builder](./patterns/creational.md#t18-q07): **Collect meaningful construction steps, then produce a validated result.** Later builder changes must not mutate an earlier result unless sharing was explicit.
- [Prototype](./patterns/creational.md#t18-q08): **Cloning needs an explicit copy-versus-share policy.** `Object.create(source)` delegates property lookup to the source rather than capturing an independent snapshot.
- [Singleton](./patterns/creational.md#t18-q09): **One instance means one within a defined application or module scope.** Shared mutable state needs ownership; it is not global across processes or replicas.

## Structural patterns

- [Bridge](./patterns/structural.md#t18-q10): **Connect two independently varying dimensions instead of subclassing every combination.** Bridge supports planned variation; Adapter primarily repairs interface incompatibility.
- [Composite](./patterns/structural.md#t18-q11): **Leaves and groups provide the same operation over a tree.** Bound depth and size, prevent cycles and define how group results and failures combine.
- [Facade](./patterns/structural.md#t18-q12): **One focused entry simplifies coordination of several components.** It does not make partial effects transactional or automatically reversible.
- [Flyweight](./patterns/structural.md#t18-q13): **Share common immutable data and supply per-use mutable context separately.** Bound retention so the shared cache does not grow without limit.
- [Proxy](./patterns/structural.md#t18-q14): **Control access while preserving the reader's results and failure contract.** Use trusted caller identity and sufficiently current policy; a JavaScript trap alone is not authorization.

## Behavioral workflows

- [Chain of Responsibility](./patterns/behavioral-workflows.md#t18-q15): **Handlers must distinguish handled, passed-on and failed.** Order affects behavior, and failure is not automatically permission to run the next handler.
- [Command and undo](./patterns/behavioral-workflows.md#t18-q16): **Separate the operation from its trigger, then define execution, retry and undo independently.** Reversing an external effect is another checked operation that may fail.
- [Mediator](./patterns/behavioral-workflows.md#t18-q19): **Coordinate one coherent interaction so peers need not all call each other.** Keep operation order, overlap and failure handling explicit rather than building a global dependency hub.
- [State](./patterns/behavioral-workflows.md#t18-q21): **The current lifecycle state defines permitted behavior and transitions.** Validate transitions before mutation; a status field alone is not the pattern.
- [Template Method](./patterns/behavioral-workflows.md#t18-q22): **Keep the overall workflow fixed while designated subclass steps vary.** Conventions and contract checks protect order and cleanup; JavaScript supplies no final-method guarantee.

## Behavioral data and traversal

- [Interpreter](./patterns/behavioral-data.md#t18-q17): **Evaluate only the intended small language under syntax and work bounds.** Valid expression syntax does not validate the record being examined.
- [Iterator](./patterns/behavioral-data.md#t18-q18): **Expose traversal without exposing storage details, and define closing on exhaustion, early exit and failure.** A manually abandoned resource-owning iterator still needs an owner.
- [Memento](./patterns/behavioral-data.md#t18-q20): **The originator saves and restores its covered state; the caretaker holds opaque snapshots.** A snapshot does not automatically reverse effects outside that state.
- [Visitor](./patterns/behavioral-data.md#t18-q23): **Add operations across stable node types using type-specific visitor methods.** New operations are easier; new node types require updating the visitors.

## Framework comparisons

- [Hapi](./16-framework-alternatives.md#t16-q19): **Server configuration, plugins and routes establish explicit lifecycle contracts.** Test validation and responses with `server.inject` without opening a network listener.
- [Koa](./16-framework-alternatives.md#t16-q20): **`await next()` lets outer middleware observe downstream completion or rejection.** Error translation surrounds downstream work; routing and parsing are separate configuration choices.
- [Feathers](./16-framework-alternatives.md#t16-q21): **Service hooks share behavior across direct and transport calls.** Use the wrapped service through `app.service` so direct access does not bypass the shared checks.
- [Alternative-framework optimization](./16-framework-alternatives.md#t16-q22): **Preserve route, input, permission and failure contracts before comparing timing.** Configuration does not remove freshness, invalidation or consistency obligations.

## Put it into practice

Use the recall guides below to choose a focused practice topic. The interview transcripts contain questions and missing snippets, so their reminders describe what to rehearse rather than inventing outputs for absent code.

## JavaScript interview practice

These are recall prompts for the transcript's topic groups. Use the original code for snippet questions.

- [Data types](./js-tech-check.md#data-types): **Recall values, identity and mutability separately.** Explain primitive values and what two references to one object share.
- [Symbols](./js-tech-check.md#symbols): **Distinguish a symbol's description from a global registry key.** Compare creating a fresh symbol with retrieving a registered one.
- [Scope and hoisting](./js-tech-check.md#variables-scope-and-hoisting): **Explain declaration setup and access before initialization.** Predict only from the actual var, let, const and function declarations shown.
- [Object copying](./js-tech-check.md#object-copying): **Trace which identities a copy shares.** Include nested data, descriptors and values that a chosen copying method cannot preserve.
- [Property restrictions](./js-tech-check.md#property-descriptors-and-object-restrictions): **Separate writable, enumerable and configurable behavior.** Explain what seal and freeze change without assuming nested objects become immutable.
- [Collections](./js-tech-check.md#object-iteration-and-collections): **Match the collection to its lookup and traversal needs.** Compare Object, Map and WeakMap without assuming identical size or iteration APIs.
- [Getters and setters](./js-tech-check.md#getters-and-setters-—-coding-exercise): **Explain property access versus a method call.** Trace how the fullName setter updates name and surname.
- [Arrays](./js-tech-check.md#arrays): **Track mutation, return value and length separately.** Use the supplied arguments when reasoning about splice, sort or sparse indexes.
- [Functions and this](./js-tech-check.md#functions-and-this): **Trace the call site and the function kind.** Explain ordinary receivers, binding and an arrow's surrounding this.
- [Promises and scheduling](./js-tech-check.md#asynchronous-javascript-and-promises): **Separate synchronous execution from scheduled handlers.** Explain executor timing, chain results, rejection and the different combinator outcomes.
- [Async errors](./js-tech-check.md#async-await-and-error-handling): **Find who owns each later failure.** A callback throw and an awaited rejection need different handling boundaries.
- [Browser APIs](./js-tech-check.md#browser-apis): **Distinguish JavaScript language features from browser-provided capabilities.** Name the relevant host object and any access or permission boundary.
- [DOM events](./js-tech-check.md#dom-events): **Trace target, listener phase, propagation and default action separately.** Explain registration options and how the same listener is removed.
- [Cookies](./js-tech-check.md#cookies): **Explain each cookie attribute by the boundary it controls.** Rehearse expiry, transport and cross-site behavior without treating one attribute as complete protection.
- [Web Storage](./js-tech-check.md#web-storage): **Compare lifetime, tab context and how data reaches the server.** Use those differences before claiming localStorage can replace a cookie.

## React interview practice

Use these prompts to rehearse explanations; version-specific behavior still follows the project version and the full question.

- [Recursive menu](./react-tech-check.md#coding-task-recursive-navigation-menu): **Draw the data tree and the component instances.** Explain nested keys, props and which item owns expanded state.
- [JSX](./react-tech-check.md#jsx-and-component-return-values): **Distinguish expressions, elements and component functions.** Reconstruct missing snippet context before comparing a function call with component rendering.
- [State and batching](./react-tech-check.md#state-initialization-and-batching): **Trace the current render's state and the queued updates separately.** Compare replacement updates, functional updaters, initialization and reducers.
- [Render lifecycle](./react-tech-check.md#rendering-lifecycle-and-error-boundaries): **Explain rendering, committing and error handling as distinct responsibilities.** State what the chosen error boundary actually catches.
- [Effects](./react-tech-check.md#effects): **Name what the effect synchronizes and who cleans it up.** Explain dependencies, replacement work and stale asynchronous results.
- [Custom hooks](./react-tech-check.md#hook-categories-and-custom-hooks): **Reuse coherent stateful logic while preserving hook rules.** Explain hook purpose and call order rather than extracting code only because it looks similar.
- [Composition](./react-tech-check.md#reusing-logic-and-component-composition): **Compare custom hooks, higher-order components, render props and children by their contracts.** Distinguish returning a component from returning an element.
- [DOM integration](./react-tech-check.md#react-dom-apis): **Distinguish creating a root, hydrating existing HTML and rendering into another DOM location.** Explain the problem each API addresses.
- [Keys and performance](./react-tech-check.md#keys-reconciliation-and-performance): **Explain item identity before discussing memoization.** Measure the actual expensive work and account for the project's React/compiler setup.
- [Redux basics](./react-tech-check.md#redux-fundamentals): **Trace action, reducer, next state and selected UI data.** Keep state ownership and immutable updates clear.
- [Normalized and async state](./react-tech-check.md#redux-normalization-and-asynchronous-operations): **Use stable IDs to explain related records and updates.** Trace loading, success and failure through the chosen async approach.
- [Routing](./react-tech-check.md#react-router): **Separate URL changes from full-page navigation.** Explain the chosen router's browser/history or non-browser context.
- [Component tests](./react-tech-check.md#react-testing): **Arrange, act and assert through observable UI behavior.** Name which network and rendering boundaries are real and which are replaced.
- [Server rendering](./react-tech-check.md#rendering-strategies-and-next-js): **Trace request, server output and later browser behavior.** Identify the selected Next.js router and its data-generation or revalidation rules.
- [Build tools](./react-tech-check.md#build-tools-and-production-optimization): **Explain what transforms source and what reaches the production bundle.** Separate development checks from measured production behavior.

## Five progressive projects

- [Foundations CLI](./progressive-projects.md#project-1-foundations-cli): **Keep terminal input separate from reusable operations and storage.** Check finite input, clear output, failures and cleanup.
- [HTTP application](./progressive-projects.md#project-2-http-application): **Add HTTP and browser entry points around the same working use cases.** Preserve the CLI and verify contracts through real HTTP checks.
- [Deployable service](./progressive-projects.md#project-3-deployable-service): **Add persistent storage, trusted identity and bounded workers through explicit adapters.** Preserve the existing API/UI while verifying lifecycle and deployment boundaries.
- [Hardened service](./progressive-projects.md#project-4-hardened-service): **Demonstrate a risk or bottleneck before applying a focused improvement.** Keep baseline behavior and record what the new evidence proves.
- [Operated service](./progressive-projects.md#project-5-operated-specialized-service): **Add durable dispatch, authorized progress and operational evidence.** Keep duplicates, recovery, limits and specialist execution explicit.

## Course and exercise navigation

- [Node.js runtime course](../index.md): **Learn runtime behavior and resource ownership before adding backend and persistence responsibilities.** Select further security, transport and delivery lessons when the service needs them.
- [Node.js exercises](../../practice/node-js/index.md): **Turn a reading topic into an owned implementation and evidence record.** Retain failure checks, actual results, cleanup and untested boundaries.
