# Priority queues and a small scheduler

FIFO chooses the oldest admitted item. A **priority queue** chooses the item with the smallest key here; other designs choose the largest. A note-check scheduler can prioritize a broken required reference ahead of an optional cosmetic check, without sorting its entire pending list after every arrival.

This is local algorithmic scheduling, not an operating-system CPU scheduler or a durable job queue. It supplies no timer, concurrency limit, retries, persistence or authorization.

## Array representation and invariant

A zero-indexed binary min-heap stores a complete binary tree in an array. For index `i`, children are `2i+1` and `2i+2`; for `i>0`, parent is `floor((i−1)/2)`. No pointer nodes are required, and the height is O(log(n+1)).

The invariant is **parent ≤ child**, ordered lexicographically by `(priority, admissionSequence)`. Therefore the root is no greater than any descendant and is a valid minimum. Siblings need not be sorted. Two equal-priority jobs leave in admission order because the sequence breaks ties; this is an explicit policy, not an automatic heap property.

## Worked insertion and removal

Start with priorities `[2, 5, 4]`. Append priority 1 at index 3: only its ancestor path can violate the heap invariant. Swap with parent 5, then parent 2, yielding `[1, 2, 4, 5]`.

Pop removes root 1 and moves the last value 5 to root: `[5, 2, 4]`. Swap with the **smaller** child 2 to obtain `[2, 5, 4]`. Choosing the larger child would leave the smaller child above-order and break the invariant.

| Operation | Why correct | Conventional model cost |
|---|---|---|
| Push | Only the appended node/ancestor path may violate order; swapping with its parent restores the lower edge while moving the possible violation upward | O(log(n+1)) comparisons/swaps |
| Pop | Subtrees remain heaps after root replacement; promote the smaller child and move the possible violation downward until none remains | O(log(n+1)) comparisons/swaps |
| Peek | Every descendant is at least its parent, hence at least the root | O(1) |
| Arbitrary lookup | No sibling or global array order permits binary search | O(n) scan |

Bottom-up heap construction can be O(n): most nodes are near the leaves and move only a few levels. Repeated push builds in O(n log n) worst-case comparisons instead. The source uses repeated push only; it does not claim a linear build implementation.

## Reference contract and limits

[Canonical heap source](../workbench/cs-foundations/collections.md#stable-min-priority-queue) accepts finite numeric priorities, including negative values. Smaller means sooner. Payloads are opaque and not mutated. Full push, invalid priority and empty peek/pop reject without removing a valid job. An admission sequence must remain an exact safe integer; exhaustion rejects rather than silently losing tie order.

Array append can itself resize: the comparison/swap bounds above plus amortized-array allocation apply to the source. A single actual push is not guaranteed O(log n) latency by ECMAScript. Capacity bounds retained entry count, not the bytes reachable from payloads. `snapshot()` costs O(n), is for verification, and returns priority/sequence copies.

Changing a queued object's field does not change its captured priority. There is no decrease-key, cancellation or removal-by-ID operation; implement those with a deliberate index/ownership policy if required. Low-priority jobs can starve if high-priority arrivals never stop. FIFO ties do not solve starvation across different priorities. For a finite practice run, stop admission and drain all jobs; real services may require aging/fairness policy.

[Separate scheduler exercise](../practice/cs-foundations/dependency-explorer.md#cs-p06-priority-scheduler) · [Course coverage](./coverage-map.md)
