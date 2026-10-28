# Data structures and representation

A data structure determines which operations are cheap and which invariants the program must maintain. Choose from the **required operations and ownership**, rather than replacing every array with a Map.

## Representation and selection

The costs below use conventional abstract implementations and constant-cost element/key operations. JavaScript specifies observable semantics, not universal engine time bounds. An application-owned dense array is different from a sparse array with getters or proxies.

| Structure | Useful operations / model costs | Tradeoffs and invariant |
|---|---|---|
| Dense dynamic array | Index O(1); search O(n); end append amortized O(1) in a geometric-resize model | Contiguous logical indices; middle insert/remove may move O(n) elements; bounds and mutation matter |
| Singly linked list | Insert/remove at head O(1); find/index O(n); append O(1) with a maintained tail | Node/link overhead; removing after a **known predecessor** O(1), finding it is not free |
| Doubly linked list | Insert/remove a known node O(1) | Two links per node; must maintain both directions/head/tail; searching still O(n) |
| Stack | Push/pop top O(1), or amortized in a resizing-array model | LIFO; undo state, parser nesting, DFS frames |
| Queue | Enqueue/dequeue O(1) with fixed ring or suitable linked representation | FIFO; fair admission/BFS; overflow and empty behavior explicit |
| Deque | Both ends O(1) in a conventional ring/block implementation | More involved index/resize ownership; arbitrary middle access/removal is a different operation |
| Map / Set | Expected O(1) under usual hash model; ECMAScript guarantees average sublinear access | Identity/equality, retained references, iteration order and invalidation; no universal worst-case O(1) |
| Binary search tree | Lookup/insert O(h) | Left/right key ordering; unbalanced h may be n; balanced-tree guarantees require balancing |
| Binary min-heap | Peek O(1), push/pop O(log n), bottom-up construction O(n) in the conventional model | Parent no greater than children; **not fully sorted**, arbitrary lookup O(n) |
| Graph adjacency list | O(V+E) storage, enumerate neighbors O(degree) | Vertex identity/directedness/edge policy; traversal needs visited state on cycles |

For ordinary records with known fields, object properties are appropriate. For dictionary keys use Map or a deliberate null-prototype object with `Object.hasOwn`, not inherited property lookup. `get` returning undefined does not distinguish a missing Map entry from a stored undefined value. The [existing collection lesson](../senior_growth/General_ES6/What_is_ES6_Map_What_is_the_difference_between_Map_17be8106c24d808caa13f8ae4a80115c.md#equality-ownership-ordering-and-serialization) demonstrates object identity, NaN/zero, serialization and WeakMap lifetime.

## Hash lookup and collision assumptions

A conventional hash table maps a key to a bucket, then resolves collisions by comparing keys within that bucket or probing other slots. Equality must still be checked: equal hash values do not prove equal keys. Controlled load factor and an appropriate hash model can give expected constant-time access; many collisions can make an operation linear in the number of entries. Resizing rebuilds placement and has a separate amortized cost. Long string hashing/equality also depends on key length.

This explains the model used in cost estimates; ECMAScript Map/Set can use other mechanisms and does not expose buckets or require that implementation. Their equality/iteration semantics are the public contract.

## Stacks, queues and linked nodes

An array with end push/pop is a simple stack. Repeatedly using `shift()` as a queue may move/reindex the remaining elements; do not base a general O(V+E) BFS argument on it. For a one-shot traversal a growing array plus head index is simpler, but keeps consumed entries until return.

A linked queue owns a head and tail. Empty means both null; nonempty means the tail's next is null. Enqueue links after tail; dequeue advances head and resets tail when removing the last node. Losing that reset can disconnect future entries. Public node references complicate ownership: removing a foreign/stale node is not automatically safe. A general linked-list implementation is optional here; the reference uses a bounded ring instead.

## Worked ring wraparound

The [fixed-capacity FIFO source](../workbench/cs-foundations/collections.md#fixed-capacity-fifo) stores `head` and `size`:

- Valid state: `0 ≤ size ≤ capacity`, `0 ≤ head < capacity`.
- Logical item `i` occupies `(head + i) % capacity`, for `0 ≤ i < size`.
- Enqueue writes at `(head + size) % capacity`, then increments size.
- Dequeue reads at head, clears that slot, advances head modulo capacity and decrements size.

With capacity 3: enqueue A/B/C, dequeue A, enqueue D. The physical slots become `[D, B, C]`, while logical order is B/C/D. Physical order is not the contract. These transitions preserve the logical sequence, proving FIFO behavior. Clearing a consumed slot releases that reference; the owner still retains the dequeued object if it stores it elsewhere.

Construction allocates O(capacity) slots. Each valid enqueue/dequeue is worst-case O(1) **in this fixed-array model**, with no resizing. Full enqueue and empty dequeue throw; storing undefined remains supported because size, rather than a sentinel value, defines occupancy. Capacity is an application policy, not a global memory or concurrency limit.

## Trees and graphs are different ownership models

A proper rooted tree is connected, acyclic and gives each nonroot node one parent. A graph can have multiple paths, cycles, self-loops or disconnected vertices. A shared child means a DAG, not that tree representation. A binary tree has at most two child slots; a binary **search** tree also satisfies key ordering. A binary heap has another, weaker ordering invariant.

Use [tree/graph traversal](./trees-graphs-traversal.md) for representation, correctness and space analysis. A scheduler selects the next minimum priority with a [heap](./priority-queues.md); it does not need an entire sorted list after every insertion.

[Separate queue/cache exercise](../practice/cs-foundations/collections-and-queues.md) · [Next: sorting](./sorting.md)
