# Retained algorithm exercise requirements

**Learner status: still required.** These original requirements are preserved from the Big O and quicksort pages. The [sequenced specifications](./index.md) give them smaller checkpoints; they are not additional unrelated projects.

**Exercise acceptance:** compare q repeated linear membership scans with one reusable Set over the same immutable dataset. Count construction/lookup operations before timing; vary n/q/hit rate and include memory. Verify identical answers, including absent values and the chosen equality semantics. Benchmark in a warmed target runtime with repeated samples and report variance rather than a single tiny duration. For a mutable dataset specify when the index updates or rebuilds. Explain a case where the simpler scan wins and a case where index construction amortizes. Profiling and learner evidence remain required.

**Acceptance:** execute those exact fixtures plus singleton/self-loop/disconnected/unknown-start/missing-neighbor/duplicate-edge/budget cases. Cross-check BFS distances on small generated graphs against an independent all-pairs distance reference, and DFS reachable sets against BFS; do not just mirror the implementation in tests. Assert graph/tree inputs are unchanged, null tree gives[], skewed trees terminate and cycles/shared-child/oversize trees reject. Count queue insertions/edge examinations before timing. Explain which memory is input, validation, frontier and returned result; a tiny benchmark does not prove a bound. Learner implementation/performance measurements remain required.

**Exercise acceptance:** instrument the exact example's comparison count, maximum recursion depth and allocated array slots without claiming those are measured heap bytes. Check empty/singleton, sorted/reversed, duplicates and random finite-number inputs against a numeric native sort; verify input preservation. For n sorted/equal elements show n(n−1)/2 comparisons and depth proportional to n using small safe n. Compare a balanced fixture and explain peak versus cumulative storage. Add a three-way/in-place variant only as an explicitly separate exercise; retain correctness and operation-count evidence before timing. Large worst-case recursion is intentionally not a recommended production stress test.

## Existing collection exercise

**Exercise:** implement a small bounded Map cache with a documented FIFO or LRU policy. Acceptance: distinguish missing from stored undefined; show object identity and NaN/zero cases; verify object key order; reject unsupported serialized keys; enforce an entry limit; explain why no deterministic test can demand a WeakMap key be collected at a particular time. Verify WeakMap symbol support on each runtime in your compatibility matrix.

## Existing memoization exercise

**Exercise acceptance:** run the exact synchronous wrapper against un-memoized results. Count calls for every falsy value; distinguish numeric/string/array/object/argument-count keys and two different receivers; verify NaN hits, +0/−0 separation, exception retry, LRU hit promotion/eviction and clear. Demonstrate stale output after mutating an object, then fix the ownership/invalidation contract. Verify fibMemo0/1/40 and invalid bounds without running huge recursion. Compare hit/miss rate and retained data against the cost of recalculation. Async cache design and learner implementation remain separate practice.

## Existing execution and binding exercise

**Exercise acceptance:** run those results under strict function code/ESM, create two independent counters and explain binding versus object identity and captured lifetime. Compare classic-script, CommonJS-wrapper and ESM top-level this using separate files rather than assuming a REPL result applies to all. Use a heap snapshot/retaining path for a real leak; do not assert a GC schedule or physical stack placement from console output. Learner debugging remains required.
