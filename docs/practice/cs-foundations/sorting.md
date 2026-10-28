# CS-P03: sorting and recursion experiment

**Learner status: still required.** Prerequisites: CS-P01/P02, [recursion/correctness](../../cs-foundations/reasoning-and-recursion.md) and [sorting](../../cs-foundations/sorting.md). Use the [shared evidence record](./index.md#evidence-for-every-checkpoint).

## Scope and deliverable

Implement or independently reconstruct the small last-pivot allocating sorter for dense finite numbers, with a 256-item limit. Count comparisons, maximum recursive depth and cumulative partition entries; define exactly what each counter includes. Compare correctness against numeric native sorting, without assuming its engine complexity. Keep any three-way/in-place variant separate and optional.

## Observable acceptance

- Output is ascending **and** a permutation, preserving multiplicities; input is unchanged and output is a fresh array even for 0/1 items.
- Empty, singleton, sorted/reversed, duplicate-heavy, all-equal and deterministic generated inputs match the oracle.
- Sorted/equal n-item inputs show n(n−1)/2 comparisons; demonstrate linear call depth with safe small n. Include a balanced fixture and its actual counts.
- Explain base case, partition invariant, induction and decreasing subproblem length.
- Distinguish peak retained partitions, cumulative partition entries, returned arrays and call stack. Counted slots are not measured heap bytes.
- Use equal-key tagged records to expose the last-pivot equality reversal; explain why native stable sorting has a different contract. Do not silently claim generic quicksort stability.

## Edge and failure cases

Reject oversize/sparse/NaN/infinite input under the chosen contract. Demonstrate that “sorted output” alone would let a broken empty-result function pass. Test default string sort against numeric order. Explain why random pivots do not cure all-equal two-way partitions and why a large recursive stress test is not necessary evidence.

## Evidence

Record fixtures, comparison/depth/allocation tables, one failing counterexample/correction, proof and limit rationale. Cross-check recursive and iterative factorial on 0/1/5/100 with exact BigInt and invalid-input cases as a short recursion/iteration checkpoint; count multiplications separately from growing bit cost.

## Memoization extension

**Optional existing requirement, still required if selected.** Prerequisites: [memoization contracts](../../senior_growth/Other/What_is_memoization.md#correct-keys-ownership-and-invalidation), equality/ownership and synchronous exceptions. Use the retained synchronous wrapper and compare with uncached results. Verify all falsy outputs, argument types/arity/object identity, receiver identity, NaN hits, ±0 distinction, exception retry, LRU hit promotion/eviction and clear. Demonstrate stale mutation, then fix the key/invalidation contract. Verify bounded Fibonacci 0/1/40 and invalid inputs; record calls, hits/misses and retained-data limits. Async caching is a separate design, not an implied capability.

## Execution extension

**Optional shared-language requirement, still required if selected.** Prerequisites: [execution/binding explanation](../../senior_growth/General_ES6/Explain_JavaScript_Code_Execution_177e8106c24d80a0817df62da9bac253.md#worked-bindings-this-and-retained-lexical-state), strict functions/modules and references. Reproduce the supplied binding/this fixture, make two independent counters and explain captured lifetime. Test classic script, CJS and ESM in separate files; a REPL observation is not interchangeable. Retain actual outputs/runtime and a retaining-path explanation for closures. Do not infer physical stack allocation or timely collection from console output.

The [original extracted requirements](./retained-exercises.md) preserve both exercises. They are optional continuations, not two new mandatory CS products.
