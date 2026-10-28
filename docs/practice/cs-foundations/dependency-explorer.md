# Note dependency explorer and scheduler

**Learner status: still required.** These are two finite in-memory checkpoints, not a production build system. Use the [shared evidence requirements](./index.md#evidence-for-every-checkpoint).

## CS-P05: note dependency explorer

**Prerequisites:** CS-P01–04, Map/Set, [tree/graph traversal](../../cs-foundations/trees-graphs-traversal.md). A note ID is a vertex; a directed link means “can reach this prerequisite/reference.” Reachability is not a safe dependency execution order.

**Scope:** at most 200 vertices/2,000 directed neighbor entries, application-owned data and one chosen start. Implement or reconstruct BFS hop distances, DFS preorder/postorder and separate binary-tree inorder. Unknown JSON requires an explicit parser before typed algorithms. No filesystem crawl or UI is necessary.

**Observable acceptance:**

- For a→[b,c], b→[d], c→[d], d→[a], isolated z: BFS a/b/c/d distances 0/1/1/2; DFS preorder a/b/d/c, postorder d/b/c/a; z is absent.
- Self-loop, singleton and disconnected components terminate; each reachable vertex is enqueued once. Neighbor order controls ties, not distance/reachable set.
- Unknown start, missing neighbor, duplicate edge and vertex/edge/ID budget violations reject. Inputs remain unchanged.
- Cross-check distances on exhaustive/generated small directed graphs against an independent all-pairs shortest-hop oracle; compare DFS reachable sets with BFS.
- Null tree gives `[]`; root2/left1/right3 gives `[1,2,3]`; non-BST root1/left3/right2 gives `[3,1,2]`. Reject cycle/shared-child/nonfinite/oversize trees under the reference contract; skewed trees terminate.
- Explain BFS's layer proof, DFS next-neighbor frame invariant, visited policy, whole-input validation cost and output/frontier/validation storage. State why basic DFS does not detect directed cycles or topologically order the cyclic fixture.

**Failure cases:** marking only after dequeue causing duplicate frontier work; missing visited state on cycles; falsely sorting any tree via inorder; omitting unreachable-invalid adjacency from validation; claiming O(h) total memory despite a visited set/output.

**Evidence:** graph representation/directedness, fixtures, independent oracle/seed, observed orders/distances/rejections, queue/edge counts before timing and mutation checks. Weighted paths, DAG scheduling and cycle classification are optional separate extensions.

## CS-P06: priority scheduler

**Prerequisites:** CS-P04/P05, [heap proof and limitations](../../cs-foundations/priority-queues.md). This selects work from a finite pending set; graph traversal is not used to pretend all dependencies are executable.

**Scope:** add a stable min-priority queue of at most 200 synthetic note-check jobs. A finite numeric priority is captured on admission; smaller executes first, equal priorities preserve admission order. Drain synchronously under one owner; no network, timers, retries or persistence.

**Observable acceptance:**

- After every mixed push/pop, parent ≤ children under `(priority,sequence)`; peek/pop agree with a separate sorted-list oracle.
- Priorities 2/5/4 then 1 show the documented sift-up/down trace. Equal priorities leave in original order; negative priorities work.
- Empty peek/pop, full push, NaN/infinity and invalid capacity reject without losing existing jobs. Draining returns every admitted job exactly once.
- Input payload identity is preserved; changing a payload's field does not silently change the captured key. No hidden decrease-key/remove-by-ID promise.
- Explain complete-tree height, O(log n) comparison/swap paths and array-resize amortization separately. Explain why the heap array is not globally sorted and binary search does not apply.

**Failure cases:** promoting the larger child, ignoring the only left child, mishandling the last removal, unstable ties and nonfinite priority comparisons. Explain starvation under continuous high-priority arrivals and why the finite exercise does not establish service fairness or durability.

**Evidence:** deterministic mixed-operation seed, oracle results, heap snapshots/invariant checks, failure/correction, comparison counts and a small selection comparison against repeated full sorting. Use no timing claim without workload/repeated samples.
