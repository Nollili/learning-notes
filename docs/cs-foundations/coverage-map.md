# CS coverage map

**Material scope:** practical foundations for JavaScript, TypeScript and Node.js. Coverage is based on reading explanations and implementations, not counting headings. This map reconciles CS-01–08 from the historical extension tracker; their learner outcomes remain **still required**.

“Confirmed” means an explanation and its worked reasoning were inspected. “Added” and “expanded” identify this round's changes. Depth is a material target, not a learner proficiency claim. Runtime/network/database chapters remain canonical; this course does not duplicate them or claim a complete operating-systems curriculum.

## Algorithms and representations

### Cost model, O/Ω/Θ, worst/average/amortized; CS-01

[Complexity](./complexity-and-cost.md); original Big O discussion distinguished cost dimensions but mixed traversal into the page

**Prerequisites:** Functions, loops, arrays, simple algebra. **Depth/action:** Essential; expanded tight bounds, aggregate resizing proof and hidden copying costs.

**Worked evidence:** Membership n×q versus reusable index; doubling copies; output lower bound. **Practice:** [CS-P01](../practice/cs-foundations/cost-and-search.md#cs-p01-cost-and-membership).

### Arrays, maps, sets and equality; CS-02

[Structures](./data-structures.md) plus [existing Map/WeakMap/Object explanation](../senior_growth/General_ES6/What_is_ES6_Map_What_is_the_difference_between_Map_17be8106c24d808caa13f8ae4a80115c.md#equality-ownership-ordering-and-serialization)

**Prerequisites:** Values, references, arrays/objects. **Depth/action:** Essential; existing SameValueZero/object-identity/serialization cases confirmed; representation/cost selection expanded.

**Worked evidence:** NaN/±0, two equal-looking objects, stored undefined and index invalidation. **Practice:** CS-P01; [CS-P04](../practice/cs-foundations/collections-and-queues.md#cs-p04-bounded-fifo); optional cache.

### Stack, FIFO, deque and linked list; CS-02

[Structures](./data-structures.md#stacks-queues-and-linked-nodes), [bounded FIFO](../workbench/cs-foundations/collections.md#fixed-capacity-fifo)

**Prerequisites:** Array indexing, mutation/ownership. **Depth/action:** Essential selection/invariants; ring queue added, list/deque costs explained; implementing a general list/deque optional.

**Worked evidence:** Wraparound, clearing consumed slots, full/empty contract; known-node versus lookup cost. **Practice:** CS-P04.

### Binary heap / priority queue; CS-02

[Priority scheduling](./priority-queues.md)

**Prerequisites:** Array/tree indices, invariants, logarithms. **Depth/action:** Essential small scheduler; heap added, not a binary search tree or JS memory heap.

**Worked evidence:** Sift-up/down trace, equal-priority sequence tie, bounded capacity. **Practice:** [CS-P06](../practice/cs-foundations/dependency-explorer.md#cs-p06-priority-scheduler).

### Linear and binary search; CS-03

[Binary search](./binary-search.md); old page had a class-table mention only

**Prerequisites:** Sorted order, loops, interval notation. **Depth/action:** Essential; lower-bound proof and wrapper added.

**Worked evidence:** Empty/duplicate/absent/end boundary trace; shrinking half-open interval. **Practice:** [CS-P02](../practice/cs-foundations/cost-and-search.md#cs-p02-lower-bound).

### Sorting, comparator/stability, quicksort; CS-03

[Sorting](./sorting.md); original quicksort source and memory analysis inspected

**Prerequisites:** Search invariants, arrays, recursion. **Depth/action:** Essential; corrected source-specific stability, probabilistic assumptions and costs; insertion/merge explained for selection.

**Worked evidence:** Last-pivot partition induction, exact sorted-input counts, balanced/unbalanced allocation. **Practice:** [CS-P03](../practice/cs-foundations/sorting.md).

### Recursion, iteration and termination; CS-07

[Reasoning](./reasoning-and-recursion.md), [existing memoization](../senior_growth/Other/What_is_memoization.md#correct-keys-ownership-and-invalidation)

**Prerequisites:** Functions and call stack. **Depth/action:** Essential; unified proof method added; cache identity/eviction limits confirmed; deeper dynamic programming optional.

**Worked evidence:** Factorial induction/loop invariant, quicksort decreasing length, DFS frames. **Practice:** CS-P03, CS-P05; optional memoization extension.

### Trees, BST ordering, graph representation; CS-02/03

[Traversal](./trees-graphs-traversal.md); original bounded TypeScript BFS/DFS/inorder read in full and retained

**Prerequisites:** Stacks/FIFO, Map/Set, recursion. **Depth/action:** Essential; dedicated home and proofs added; balanced-tree implementation optional.

**Worked evidence:** Cycle/shared-child rejection, non-BST inorder counterexample, adjacency versus matrix costs. **Practice:** [CS-P05](../practice/cs-foundations/dependency-explorer.md#cs-p05-note-dependency-explorer).

### BFS/DFS and disconnected/cyclic inputs; CS-03

[Traversal](./trees-graphs-traversal.md#bfs-distance-invariant) and [canonical sources](../workbench/cs-foundations/traversals.md)

**Prerequisites:** Graph representation, queue/stack. **Depth/action:** Essential; confirmed original behavior; explicitly distinguishes reachability, shortest hops, cycle detection and topological order.

**Worked evidence:** a→b,c; b→d; c→d; d→a; isolated z; independent distance oracle in checks. **Practice:** CS-P05.

### Contracts, invariants, counterexamples and testing; CS-07

[Reasoning](./reasoning-and-recursion.md), [Node property/concurrency tests](../node-js/module-04-testing.md#_15-contract-property-and-concurrency-testing)

**Prerequisites:** Functions, assertions; async for concurrency continuation. **Depth/action:** Essential proof/testing method; expanded source-level proof; testing is evidence rather than proof of all inputs.

**Worked evidence:** Sortedness + permutation, search partition, FIFO/heap invariants, reproducible failures. **Practice:** All CS-P01–06; existing P-330/P-331/P-332 integration.

## Existing systems continuations

These concepts were reconciled against the actual named sections. Their depth remains applied/intermediate and their separate environment/practice requirements survive. They are not prerequisites to implement binary search.

### CS-04: stack, heap, GC, process/thread, event loop, cancellation

**Teaching owner:** [Node foundations](../node-js/module-01-nodejs-foundations.md#runtime-architecture-at-a-glance), [scheduling](../node-js/module-01-nodejs-foundations.md#_8-event-loop-deep-dive), [diagnostics](../node-js/module-11-performance-diagnostics.md); [JS execution](../senior_growth/General_ES6/Explain_JavaScript_Code_Execution_177e8106c24d80a0817df62da9bac253.md).

**Prerequisites/depth:** JS functions/promises; applied runtime. GC is not timely resource cleanup; `async` does not parallelize CPU work.

**Worked example/practice:** Existing limiter/worker, event-loop delay and owned cancellation; [P-332](../practice/backend-project.md#p-332), [Node core project](../practice/node-js/core-project.md).

### CS-04: races, serialization, locks

**Teaching owner:** [Database locking](../node-js/module-08-postgresql-mikroorm.md#_22-locking-deadlocks-and-safe-retries), [concurrency tests](../node-js/module-04-testing.md#concurrency-tests).

**Prerequisites/depth:** Async ownership and transactions; applied rather than OS mutex implementation.

**Worked example/practice:** Two reservations/conditional update, lock ordering, retry-safe callback; P-331/P-332.

### CS-05: DNS/TCP/TLS/HTTP and framing

**Teaching owner:** [Networking](../node-js/module-05-networking.md#_9-https-net-and-dns), especially TCP framing and lookup/resolve differences.

**Prerequisites/depth:** Bytes, streams, HTTP lifecycle; applied network stack.

**Worked example/practice:** Split/combine TCP chunks, bounded fetch/deadline; existing [network exercises](../practice/node-js/module-05-networking.md), P-332.

### CS-05: partial failure, ordering, delivery/idempotency

**Teaching owner:** [Distributed failure model](../node-js/module-12-resilient-distributed-systems.md#_1-the-distributed-systems-mental-model), [jobs](../node-js/jobs-and-schedules.md).

**Prerequisites/depth:** One service first; distributed continuation.

**Worked example/practice:** Lost reply after committed effect, confirm/ack crash windows, outbox/receipt; existing jobs practice, P-331/P-333.

### CS-06: modeling, constraints, indexes, query plans

**Teaching owner:** [Relational model](../node-js/module-08-postgresql-mikroorm.md#_1-relational-database-mental-model), [indexes](../node-js/module-08-postgresql-mikroorm.md#_9-indexes-and-query-plans), [SQL collection](../workbench/node-js/database/sql-queries.md).

**Prerequisites/depth:** Relations, SQL; applied database reasoning.

**Worked example/practice:** Keys/FKs, joins/NULL/grouping, composite index and EXPLAIN; existing SQL practice and P-331.

### CS-06: ACID/isolation/locking/recovery

**Teaching owner:** [Transactions](../node-js/module-08-postgresql-mikroorm.md#_10-transactions-and-acid), [isolation](../node-js/module-08-postgresql-mikroorm.md#_11-isolation-and-concurrency), [recovery](../node-js/database-recovery.md).

**Prerequisites/depth:** SQL, owned database environment; continuation.

**Worked example/practice:** Conditional inventory update, deadlock/retry, separate-target restore; P-331/P-333.

### CS-07: state transitions at real boundaries

**Teaching owner:** [Node lifecycle](../node-js/module-10-production-ready-applications.md), [testing](../node-js/module-04-testing.md#_15-contract-property-and-concurrency-testing).

**Prerequisites/depth:** Contracts/invariants, async cleanup.

**Worked example/practice:** Startup→ready→draining→closed, denial and failure tests; existing Node specs. No new agent-workflow work credited.

### CS-08: coverage and independent checkpoints

**Teaching owner:** This map, [reading order](./index.md), [practice sequence](../practice/cs-foundations/index.md).

**Prerequisites/depth:** CS-P01–06 build on one another.

**Worked example/practice:** New organization and specs; learner results remain outstanding.

## Reconciliation limits

The original Big O membership/traversal and quicksort exercises are preserved [verbatim in practice](../practice/cs-foundations/retained-exercises.md); their requirements are mapped to CS-P01/P03/P05. The existing Map cache assignment maps to the optional CS-P04 extension. Existing Node P-331–333 stay separate and unchanged. The memoization and shared execution/binding requirements are also preserved in practice as optional JavaScript continuations, rather than additional core projects.

The essential scope is covered by the teaching owners above. Balanced search trees, general linked-list/deque implementations, weighted shortest paths, topological sorting/cycle classification, advanced dynamic programming, OS scheduling/memory models and distributed consensus are explicitly optional extensions. A basic visited-set DFS is not evidence of those algorithms. No headings-only or uninspected external course receives coverage credit.
