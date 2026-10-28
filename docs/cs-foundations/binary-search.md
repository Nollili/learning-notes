# Binary search and lower bounds

Binary search repeatedly discards a region that **cannot contain the required answer**. Speed comes from that exclusion proof, not from choosing a middle index by itself.

## Contract first

Use a dense, ascending array of finite numbers that is not mutated during the search. `lowerBound(values, target)` returns the first index `p` whose value is at least `target`, or `values.length` if there is no such value. The target must be finite. Duplicates are allowed.

The function below assumes sorted, valid input; it does not silently spend O(n) validating on every lookup. Validate once at an untrusted boundary or when building the index. Changing comparison order or mutating an element invalidates that precondition.

<<< ../workbench/cs-foundations/search.ts

## Half-open interval invariant

At the start of each iteration:

- `0 ≤ lo ≤ hi ≤ n`.
- Every index below `lo` has value **less than** the target.
- Every index at or above `hi` has value **at least** the target.
- The boundary we need is between `lo` and `hi`, inclusive as a position; inspected array indices are in `[lo, hi)`.

Initially both excluded regions are empty. `mid` is a valid index when `lo < hi`. If its value is too small, sortedness proves every index up to `mid` is too small, so `lo = mid + 1`. Otherwise `mid` and everything after it is large enough, so `hi = mid`.

Each update strictly decreases the nonnegative length `hi − lo`. At termination `lo === hi`: the invariant proves that this position is the **first** large-enough element or the end. This establishes both correctness and termination.

## Worked duplicate and absent cases

For `[2, 4, 4, 9]` and target `4`:

| Before `[lo, hi)` | mid / value | Decision | After |
|---|---|---|---|
| [0, 4) | 2 / 4 | Keep earlier boundary, including mid | [0, 2) |
| [0, 2) | 1 / 4 | Keep earlier boundary | [0, 1) |
| [0, 1) | 0 / 2 | Exclude too-small prefix | [1, 1) |

The answer is index 1. For target 5 the boundary is 3, although no value equals 5. `binarySearchFirst` verifies equality at that boundary and returns `-1` for absence. An empty array returns lower-bound position 0 and search result −1; an above-maximum target returns position `n`, without reading index `n`.

## Cost and common failures

There are at most `floor(log2(n)) + 1` comparisons for `n ≥ 1`, zero for an empty array: O(log(n+1)) time and O(1) auxiliary space. This assumes random-access indexing and constant-cost number comparisons. Building/sorting the input, validating it, copying it or inserting at the found position has its own cost. Binary search on a linked list does not get O(1) access to the midpoint.

Common defects include:

- Mixing inclusive and half-open endpoints and reading beyond the array.
- Assigning `lo = mid`, which may leave a one-element interval unchanged forever.
- Returning any equal midpoint when the contract asks for the first duplicate.
- Searching an unsorted array, or sorting it but returning indices as if they still belonged to the original order.
- Using `(lo + hi) >> 1`: JavaScript bitwise operators coerce to signed 32-bit integers. `lo + Math.floor((hi - lo) / 2)` avoids that coercion.

[Separate boundary exercise](../practice/cs-foundations/cost-and-search.md#cs-p02-lower-bound) · [Source and checks](../workbench/cs-foundations/index.md)
