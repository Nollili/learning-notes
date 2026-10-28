# Computer science foundations

The core target is to choose a representation, implement a small algorithm, explain **why it is correct**, and account for its time and storage. JavaScript functions, arrays/objects, loops, references and basic TypeScript types are sufficient prerequisites; a framework, database or completed Node service is not required.

## Recommended reading order

1. [Complexity and cost models](./complexity-and-cost.md): define input sizes and distinguish worst, expected and amortized costs.
2. [Correctness, iteration and recursion](./reasoning-and-recursion.md): contracts, invariants, progress and counterexamples.
3. [Data structures](./data-structures.md): arrays/maps/sets, stacks/FIFO/deques, linked nodes and ownership.
4. [Binary search](./binary-search.md): a complete half-open interval proof and boundary trace.
5. [Sorting and quicksort](./sorting.md): partition correctness, comparator/stability policy and allocation costs.
6. [Trees, graphs and traversal](./trees-graphs-traversal.md): representation, BFS/DFS/inorder and their different guarantees.
7. [Priority queues](./priority-queues.md): heap invariants and a bounded local scheduler.

The [coverage map](./coverage-map.md) reconciles the existing hub sources, prerequisites, depth, examples and practice, including runtime/network/database continuations. It distinguishes what was retained from what was expanded or added. The old Big O/quicksort URLs remain compatibility pages.

## Worked sources and independent practice

The [CS workbench](../workbench/cs-foundations/index.md) holds the canonical implementation collection and repeatable reference checks. Short explanatory code remains in these notes; larger sources are included directly so there is one owner.

The [CS-P01–06 practice sequence](../practice/cs-foundations/index.md) reuses existing exercises and adds only the missing boundaries, queue and scheduler checkpoints. It can grow into one small in-memory note dependency explorer. Every learner exercise remains **still required**; executing supplied reference checks is not independent completion.

## Systems continuations and optional depth

Use the [Node.js course](../node-js/index.md) for event-loop/concurrency, bytes/streams, network failures, database transactions and service resource ownership. Those explanations remain in their completed organization. Begin them when the corresponding application boundary is needed, rather than copying them into CS notes.

Balanced-tree/general linked-list implementations, topological sorting, weighted shortest paths, advanced dynamic programming, OS memory/scheduling and consensus are optional further depth. The essential course does not require competitive-programming breadth or several interchangeable frameworks.
