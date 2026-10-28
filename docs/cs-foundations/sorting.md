# Sorting and quicksort

Sorting establishes an order; a search index, stable display or merge may rely on that order afterward. Specify the key/comparator, duplicate handling, mutation and stability before choosing an algorithm.

## Choose by the required contract

| Method, conventional array implementation | Time under constant-cost comparisons | Storage / useful property |
|---|---|---|
| Insertion sort | Best Θ(n), worst Θ(n²) | O(1) auxiliary; can be stable; useful for small/nearly sorted inputs |
| Merge sort | Θ(n log n) worst case | Usually O(n) auxiliary; can be stable by taking left first on ties |
| Allocating last-pivot quicksort below | Balanced Θ(n log n), worst Θ(n²) | Source-level peak auxiliary slots O(n) balanced / O(n²) worst; see below |
| In-place partition quicksort | Expected O(n log n) under appropriate randomization, worst O(n²) | Different implementation; typically unstable, stack policy matters |
| Native `sort` / `toSorted` | ECMAScript does not require one time/space algorithm | Stable for consistent comparison; `sort` mutates, `toSorted` returns a fresh array |

Insertion sort maintains a sorted prefix and inserts each next value into its place by shifting larger values. It is correct because that insertion preserves the prefix order and all elements. Merge sort divides into smaller halves, sorts each and repeatedly takes the smaller front value; every emitted value is the smallest remaining one. These mechanisms explain the table without requiring a catalogue of implementations.

For application code with finite numbers, `values.toSorted((a, b) => a - b)` is usually a clearer starting point than a custom sorter. Default native sorting uses string order, so `[2, 10].sort()` does not establish numeric order. Comparators must be consistent, transitive and free of ordering-changing side effects. A slow comparator can dominate the work.

## Last-pivot partition and induction

The following bounded teaching implementation preserves the original two-way partition algorithm. It adds observable counters and copies base cases so its output is always a fresh array. Dense finite-number arrays of at most 256 elements are the runtime contract; sparse arrays, NaN and infinities reject. The limit makes small worst-case exercises practical; it is not a general production stack/memory guarantee.

<<< ../workbench/cs-foundations/sort.ts

For `[5, 2, 9, 1, 5, 6]`, pivot 6 produces left `[5, 2, 1, 5]` and right `[9]`. Each partition recursively sorts, producing `[1, 2, 5, 5] + [6] + [9]`.

After inspecting `i` nonpivot items, the left array contains exactly the inspected values `< pivot`, and the right array exactly those `≥ pivot`, each in encounter order. No item is lost or duplicated. Both children have fewer elements than the parent because the pivot is removed. The zero/one-element base case is sorted; assuming the smaller recursive results are sorted, concatenating left + pivot + right is sorted and a permutation. Decreasing array length proves termination.

## Balanced, average and worst cases

Balanced partitions satisfy `T(n) = T(a) + T(n−1−a) + Θ(n)`, with both sides near n/2, giving Θ(n log n). Last-pivot selection on sorted, reverse-sorted **or all-equal** input produces sizes n−1 and 0. Then the comparisons are exactly:

`(n−1) + (n−2) + … + 1 = n(n−1)/2`.

Thus worst-case time is Θ(n²). Random pivots give expected O(n log n) for distinct keys under the random-choice model, but do not guarantee a worst-case time bound. Randomizing this two-way equality policy does not fix all-equal data. Three-way partitioning groups `<`, `=`, `>` values, so equal keys need not recurse; it is an optional different implementation to verify.

## Source-specific memory and stability

Ancestors retain their input and partition arrays while children run. On a balanced active path, partition sizes sum geometrically: O(n) peak auxiliary slots. Across the whole run, cumulative partition slots are O(n log n). On an unbalanced path, retained sizes form a triangular sum: O(n²) peak slots and cumulative allocation. The call stack alone is O(log n) balanced and O(n) worst case. These are source-level bounds, not exact measured engine heap/GC behavior.

`partitionSlots` counts appended left/right entries across the run; it excludes concatenated outputs and base copies. It therefore does **not** measure peak storage, total allocated bytes or the entire allocation volume. `maxDepth` counts the root call as depth 1, including base calls.

Quicksort is often described as unstable because usual swap-based partitions can reorder equal records. That description must not be applied uncritically here: this exact **last-pivot** partition reverses equal elements. With key-only comparison, `[A:2, B:2]` becomes `[B:2, A:2]` because the earlier equal item goes right of the last pivot. Finite numeric values alone hide that distinction. A three-way implementation may be stable or unstable depending on its partition details; the algorithm name supplies no promise.

An in-place variant avoids these partition arrays. Recursing into only the smaller side and iterating over the larger can bound its stack by O(log n), even when time remains quadratic. Introspective sorting can switch to a worst-case-bounded algorithm. Neither property belongs to the shown source automatically.

[Separate sorting exercise](../practice/cs-foundations/sorting.md) · [Source checks](../workbench/cs-foundations/index.md)

Primary references: [Princeton quicksort treatment](https://algs4.cs.princeton.edu/23quicksort/index.php) for partition variants; [ECMAScript sort contract](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.sort). The proof/counters above analyze our specific allocating source, not Princeton's in-place implementation or a native-engine benchmark.
