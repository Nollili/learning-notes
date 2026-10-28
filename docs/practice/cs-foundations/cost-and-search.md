# Cost and search exercises

**Learner status: still required.** Use the [shared evidence requirements](./index.md#evidence-for-every-checkpoint).

## CS-P01: cost and membership

**Prerequisites:** [cost models](../../cs-foundations/complexity-and-cost.md), dense arrays, loops and SameValueZero versus `Object.is`/`===` equality.

**Scope:** compare repeated membership scans with one reusable Set. Use a synthetic immutable numeric dataset of at most 10,000 entries, query counts 1/10/100, and absent/early/late hits. No web app is required.

**Observable acceptance:**

- Both methods return identical results under a stated equality contract. Include `NaN`, ±0 and duplicates; do not compare an `===` scan against Set without accounting for NaN.
- Record scan comparisons and index construction/lookup counts separately. Show an absent-query scan has n comparisons and q scans have qn; do not label Set internal hash probes as measured from one `.has` call.
- Analyze expected hash-model O(n+q) time/O(n) entries versus O(nq) scans/O(1) auxiliary space, with the ECMAScript guarantee distinguished.
- Mutate the dataset in a controlled second case, demonstrate a stale index, then update/rebuild under an explicit policy.
- Explain geometric-resize amortization by counting copies for capacities 1/2/4/8; contrast growing by one. No need to implement an engine array.

**Edge/failure cases:** empty data/queries, stored undefined if extending the domain, all misses, index reused across changed data, and high construction cost for one query. Reject a claim that removing nesting can make required pair-output linear.

**Evidence:** input dimensions/hit rate, exact answers, counted work, retained-entry ownership, one case favoring scanning and one amortizing indexing. If timing, warm the target runtime, repeat samples and report variation. Tiny benchmarks cannot prove growth bounds.

## CS-P02: lower bound

**Prerequisites:** CS-P01, [binary-search invariant](../../cs-foundations/binary-search.md), ascending dense finite-number contract.

**Scope:** implement lower-bound position and first-equal lookup. Validate untrusted input separately; repeated lookups must not hide a fresh full sortedness scan.

**Observable acceptance:**

- Lower bound is in `[0,n]`; every earlier item is `< target`, every later item is `≥ target`.
- First-equal returns the earliest duplicate or −1. Compare against a simple linear oracle for exhaustive small nondecreasing arrays over `[-1,0,1]`.
- Include a trace of lo/hi/mid for `[2,4,4,9]`, target 4, with a strictly shrinking interval.
- Count at most `floor(log2(n))+1` comparisons for n≥1, zero for n=0; explain O(1) auxiliary space and the separate sorting/validation cost.

**Edge/failure cases:** empty/singleton, below/above range, absent between values, all equal, negative values, NaN/infinity policy, unsorted input precondition and `lo=mid` nontermination counterexample. Input is unchanged; returned indices refer to the searched ordering.

**Evidence:** generated inputs/expected positions, failures and fixes, bound counts, loop invariant/progress proof and mutation policy. Native `findIndex` is a valid small oracle, not the implementation of the requested binary search.
