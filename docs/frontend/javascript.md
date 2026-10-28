# JavaScript: execution, identity and owned work

Prerequisites: native HTML/events and basic functions/objects. Use ES modules for the worked browser code. The language is shared with Node; DOM/event/lifecycle behavior belongs to the browser host.

## Reading order

1. [Execution, bindings, this and closures](../senior_growth/General_ES6/Explain_JavaScript_Code_Execution_177e8106c24d80a0817df62da9bac253.md), then [lexical scope and TDZ](../senior_growth/General_ES6/What_is_the_temporal_dead_zone_Why_is_this_happeni_177e8106c24d80d991b7caa84eaad6b6.md).
2. [Arrow call-site rules](../senior_growth/General_ES6/Can_you_explain_to_me_what_arrow_functions_are_and_177e8106c24d802c83c5d9951499fa84.md), [pure transforms](../senior_growth/General_ES6/What_are_pure_impure_functions_177e8106c24d80d19ebde80bcd1b5b50.md) and [equality/nullish values](../senior_growth/General_ES6/What_is_the_difference_between_'null'_and_'undefin_177e8106c24d80f98ff8c802efb7ff70.md).
3. [Promises](../senior_growth/General_ES6/What_is_a_Promise_177e8106c24d80b3989df334146152f6.md) → [async/await and total lifetimes](../senior_growth/General_ES6/Understanding_async_await_in_JavaScript_177e8106c24d806fb457f53520e2c087.md) → [tasks and microtasks](../senior_growth/General_ES6/What_are_the_tasks_microtasks_177e8106c24d804f94a8c0f84060cdf2.md).
4. [Browser API ownership, events and origins](../senior_growth/General_ES6/Could_you_please_describe_with_which_Browser_APIs__177e8106c24d802caa88e9916f01fc53.md), [History](../senior_growth/General_ES6/Explain_history_API_from_Browser_API_177e8106c24d80fcbc17edb92f747483.md) and optional [offline drafts](../senior_growth/General_ES6/Browser_Storage_and_Offline_Drafts.md).

Prototype/class and language-year catalogues remain reference material in [General JavaScript](../senior_growth/General_ES6/). Use [CS structures](../cs-foundations/data-structures.md) for Map/Set costs and [Node module fundamentals](../node-js/module-01-nodejs-foundations.md) for runtime module boundaries rather than a second copy here.

## Values are snapshots; references express identity

A closure retains lexical bindings, not a frozen copy of every value. An event handler created in one React render sees that render's bindings; a plain closure over a mutable outer variable can see later assignments. Decide whether an action owns event-time data or deliberately reads current data. Arrow functions capture lexical this; ordinary function this depends on the call site.

Object spread copies one level. Mutating a nested object through an alias changes every observer of that object. Use explicit immutable updates along changed paths; do not deep-clone every render or compare serialized objects as a substitute for a domain identity. Stable entity IDs, request generations and server versions answer different questions.

## Promises do not own their underlying effects

| Mechanism | Guarantee | Does not guarantee |
|---|---|---|
| await | Resume this async function after settlement | Main thread moves to a worker |
| Promise.all | Ordered results when all fulfill; rejects on a failure | Siblings are canceled or drained |
| AbortSignal | Cooperative cancellation request | Adapter obeys; remote commit is rolled back |
| Generation/owner check | Obsolete result cannot commit locally | Network or server resources are released |
| finally/disposer | Explicit cleanup path | Every detached promise is observed automatically |

Give each operation a lifetime: start, deadline, cancellation, result validation, accepted commit and cleanup. Handle expected failures as data when recovery differs; propagate unexpected failures to an owner with safe diagnostics. A try/catch around a timer registration does not catch a later callback rejection. Do not create an unhandled async event callback and assume an Error Boundary will consume it.

The [public-search workbench](../workbench/frontend/browser/) combines an abort request with a generation guard and disposer. It bounds time and fixed-corpus shape, but a hostile endpoint additionally needs byte/concurrency limits before parsing. The [Node runtime lessons](../node-js/module-01-nodejs-foundations.md) own the larger bounded-I/O mechanisms.

## Scheduling and resource cleanup

The currently running JavaScript job completes before its queued promise reactions. Microtasks drain at checkpoints and can enqueue more microtasks; repeatedly awaiting an already-resolved promise does not necessarily yield a painted frame. Timers specify eligibility rather than exact execution time. Browser rendering and Node phases are separate host rules.

Release subscriptions/listeners, timers, observers, sockets and pending readers at the boundary that created them. Remove listeners with the same function identity and capture setting, or use a supported signal-based registration. Disposal should tolerate repetition; invalidate the owner before awaiting cleanup. Garbage collection reclaims unreachable memory eventually, but does not define a timely protocol for external resources.

Official references checked 2026-10-27: [ECMAScript execution contexts](https://tc39.es/ecma262/multipage/executable-code-and-execution-contexts.html), [HTML event loops](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops), [MDN AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController). Reference host: Node 24.18.0; actual browser observations are in [verification](./verification.md). Apply [F03](../practice/frontend/f03-javascript.md).
