# CS practice sequence

**Learner status: still required for every checkpoint.** Reading a worked solution or running its checks does not establish independent implementation or mastery.

Prerequisites are JavaScript values/functions, loops, arrays, references and basic TypeScript types. Use [the textbook order](../../cs-foundations/index.md#recommended-reading-order); start without Express, a database or cloud. Work in a separate owned learner directory; preserve supplied Autocode scripts/configuration and never modify `src/tests`.

## Reuse before adding

| Existing exercise | Placement now | What changed |
|---|---|---|
| Big O membership/index experiment | CS-P01 | Same equality, mutable-index and operation/evidence requirements; explicit small cases |
| Quicksort instrumentation | CS-P03 | Same comparison/depth/allocation requirements; source-specific counters and stable-sort distinction |
| Big O BFS/DFS/inorder fixtures/oracle | CS-P05 | Same validation/unchanged-input and independent distance evidence; smaller dependency-explorer deliverable |
| General ES6 Map bounded FIFO/LRU cache | Optional CS-P04 extension | Moved assignment here, retained explanatory collection examples in original lesson |
| JavaScript memoization/bindings exercises | Optional CS-P03 extension | Moved assignment to optional continuation; explanatory source retained |
| P-331/P-332/P-333 | Existing backend project, unchanged | Integrate runtime/database/network reasoning only after the core; not extra CS prerequisites |

[Original extracted requirements](./retained-exercises.md) remain available for traceability. The following sequence provides achievable bounded work, not six unrelated applications.

| Order / ID | Small deliverable | Acceptance home |
|---|---|---|
| 1 / CS-P01 | Membership cost experiment | [Cost and search](./cost-and-search.md#cs-p01-cost-and-membership) |
| 2 / CS-P02 | Lower-bound lookup for sorted note scores | [Cost and search](./cost-and-search.md#cs-p02-lower-bound) |
| 3 / CS-P03 | Small sort/correctness comparison | [Sorting](./sorting.md) |
| 4 / CS-P04 | Bounded FIFO with wraparound | [Collections](./collections-and-queues.md#cs-p04-bounded-fifo) |
| 5 / CS-P05 | In-memory note dependency explorer | [Explorer](./dependency-explorer.md#cs-p05-note-dependency-explorer) |
| 6 / CS-P06 | Finite local priority scheduler | [Explorer](./dependency-explorer.md#cs-p06-priority-scheduler) |

## Evidence for every checkpoint

Retain source revision, runtime/compiler, input/seed, expected versus actual result, failing counterexample, correction, commands/exit results, mutation/ownership policy and cost reasoning. Explain one invariant and termination measure in your own words. Include operation counts before timing and distinguish input/output/auxiliary/cumulative memory.

Use the existing [evidence record](../learning-projects.md#retain-a-real-evidence-record). Do not prefill success. Run the relevant learner build/tests and let commands exit naturally; supplied reference verification is narrower than your own result. Timings need workload/repeated samples/variance, and do not replace assertions or proofs.

Runtime cancellation/streams belong to [P-332](../backend-project.md#p-332); database invariants to P-331; deployment/recovery to P-333. Their independent outcomes remain outstanding. n8n, RAG and agent-workflow work is queued separately.
