# Complexity and cost models

A complexity bound describes how a **chosen amount of work or storage grows with input size**. It does not predict milliseconds, exact heap bytes or whether an optimization helps a particular workload.

## Name the input and the counted work

For membership queries, let `n` be the number of stored values and `q` the number of queries. Count equality checks, index construction and lookups separately. For graphs, use both `V` vertices and `E` adjacency entries. A string key of length `k`, a comparator or a callback may itself cost more than a constant.

| Notation | Meaning for a nonnegative cost f(n), for sufficiently large n |
|---|---|
| O(g(n)) | Upper bound: f(n) ≤ c·g(n) for some fixed c > 0 |
| Ω(g(n)) | Lower bound: f(n) ≥ c·g(n) for some fixed c > 0 |
| Θ(g(n)) | Both bounds: growth is tightly classified by g(n) |

A linear scan is O(n²) too, but that loose bound conceals its tighter worst-case Θ(n) cost. Specify which case the bound describes. Big O alone does **not** mean worst case.

| Case | Question | Example |
|---|---|---|
| Best | Cheapest input of size n? | First element matches: one scan comparison |
| Worst | Most expensive input of size n? | Absent value: n scan comparisons |
| Average / expected | Average under **which distribution or random choices**? | Uniform successful position: (n+1)/2 scan comparisons; randomized quicksort expectation assumes its randomization model |
| Amortized | Total cost over **any permitted operation sequence**, divided by operation count? | Geometrically growing array: occasional expensive resize spread across appends |

Amortized analysis is not a claim about a random “typical” input. An individual amortized-constant append can still take linear time.

## Worked example: scan or build an index

```js
function contains(values, target) {
  for (const value of values) {
    if (Object.is(value, target)) return true;
  }
  return false;
}
```

After `i` unsuccessful comparisons, none of the first `i` values matches under `Object.is`. The next comparison either proves a match or extends that invariant. At termination every value was checked, so returning false is correct. At most `n` comparisons are needed; no output array is allocated.

A reusable `Set` changes the equality contract: it uses SameValueZero, which equates `+0` and `-0` and matches `NaN` to itself. `Array.includes` has the same equality for dense arrays; `===` does not match `NaN`. Choose equivalent contracts before comparing speed.

Under the usual expected constant-time hash-operation model:

- `q` worst-case scans cost Θ(qn), with O(1) auxiliary space.
- Building a Set once costs expected O(n) time and O(n) retained entries; `q` queries add expected O(q).
- Rebuilding it for each query still costs expected O(qn).
- Updating the dataset requires updating/rebuilding the index. An obsolete index is a correctness defect.

ECMAScript requires average **sublinear** Map/Set access, not a universal worst-case O(1) guarantee. Its semantic requirement and our simplifying hash model are different statements. A short scan can win when `q` is small; an index cannot be justified from asymptotics alone. See [collection semantics](../senior_growth/General_ES6/What_is_ES6_Map_What_is_the_difference_between_Map_17be8106c24d808caa13f8ae4a80115c.md#equality-ownership-ordering-and-serialization).

## Worked amortized proof: doubling capacity

Consider an abstract array that starts at capacity 1. An append writes one item; when full, it allocates twice the capacity and copies all old items. After `m` appends, copied capacities are `1 + 2 + 4 + … + 2^r < 2m` (for m ≥ 1). The `m` new writes plus fewer than `2m` copies give fewer than `3m` item writes in total: **O(1) amortized per append**, O(m) space, O(m) worst case for one resizing append.

This is a model, not an ECMAScript guarantee about `Array.push` capacity. Growing by exactly one slot instead would copy `1+2+…+(m−1)`, giving Θ(m²) total work. Shrinking immediately whenever one item is removed can thrash between capacities; a gap between grow/shrink thresholds avoids that counterexample. A [fixed ring FIFO](./data-structures.md#stacks-queues-and-linked-nodes) takes another approach: it rejects overflow rather than resizing.

## Loops, output and recursion

| Shape, under constant-cost body work | Cost and assumption |
|---|---|
| Two consecutive n-step loops | Θ(n+n) = Θ(n) |
| n-step loop with fixed 10-step inner loop | Θ(10n) = Θ(n) |
| Two loops over independent lengths n and m | Θ(nm) |
| Emit every ordered pair of n records | Θ(n²) output alone; a Map cannot remove required output |
| Binary search, halving a sorted interval | O(log(n+1)) comparisons; [proof](./binary-search.md) |
| Balanced merge sort | Θ(n log n) comparisons in its worst case; merging uses extra storage in the ordinary array version |
| Last-pivot allocating quicksort | Balanced Θ(n log n), worst Θ(n²); [source-specific analysis](./sorting.md) |

A nested loop is not automatically quadratic: if an inner pointer only moves forward across the entire run, total advances may be linear. Conversely `slice`, spread, concatenation, sorting and serialization inside a loop can hide repeated copying.

Naive Fibonacci recursion recomputes overlapping subproblems and has exponential work. Memoizing `n+1` states can reduce the number of additions to O(n), but adds cache/stack storage. Growing BigInt operands make each addition nonconstant; Number precision is also limited. The [bounded memoization example](../senior_growth/Other/What_is_memoization.md#correct-keys-ownership-and-invalidation) states its numeric, equality, eviction and invalidation assumptions.

## Count memory honestly

Separate input storage, **peak auxiliary storage**, returned output and **cumulative allocation**. They answer different questions. A DFS may use an O(h) path stack but also retain O(V) visited/results. An allocating recursive sort can retain multiple ancestor partitions at once. A Set's entry count is not a bound on bytes retained through object references.

For application performance, record operation counts before timings, then runtime/version, input distribution, warmup, repeated samples, variation and memory categories. Profiling can reveal a database wait or serialization cost that dominates the loop being optimized. Small timings neither prove an asymptotic bound nor disprove correctness reasoning.

[Separate cost exercise](../practice/cs-foundations/cost-and-search.md#cs-p01-cost-and-membership) · [Next: correctness and recursion](./reasoning-and-recursion.md)

The bounds and proofs above follow the stated algorithms. Primary semantic reference: [ECMAScript Map access requirement](https://tc39.es/ecma262/multipage/keyed-collections.html#sec-map-objects).
