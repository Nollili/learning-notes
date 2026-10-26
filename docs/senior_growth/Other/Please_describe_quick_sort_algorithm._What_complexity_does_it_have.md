# Please describe quick sort algorithm. What complexity does it have?

## 🔹 Quick Sort Algorithm

**Quick Sort** is a **divide-and-conquer sorting algorithm**. It works by **selecting a "pivot" element** from the array and partitioning the other elements into two sub-arrays:

- Elements **less than the pivot**
- Elements **greater than or equal to the pivot** (in the two-way example)

The process is then **recursively applied** to the sub-arrays until the entire array is sorted.

---

## 1️⃣ Steps of Quick Sort

1. **Choose a pivot** element (first, last, middle, or random).
2. **Partition** the array:
   - Move elements smaller than pivot to the left.
   - Move elements greater than or equal to pivot to the right.
3. **Recursively sort** the left and right sub-arrays.
4. Combine sub-arrays and pivot → sorted array.

---

## 2️⃣ Example in JavaScript

```javascript
function quickSort(arr) {
  if (arr.length <= 1) return arr; // Base case

  const pivot = arr[arr.length - 1];
  const left = [];
  const right = [];

  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] < pivot) left.push(arr[i]);
    else right.push(arr[i]);
  }

  return [...quickSort(left), pivot, ...quickSort(right)];
}

const array = [5, 2, 9, 1, 5, 6];
console.log(quickSort(array)); // [1, 2, 5, 5, 6, 9]
```

---

## 3️⃣ Complexity Analysis

| Case                 | Time Complexity            | Explanation                                       |
| -------------------- | -------------------------- | ------------------------------------------------- |
| **Best case**        | O(n log n)                 | Balanced partitioning (pivot splits array evenly) |
| **Average case**     | O(n log n)                 | Random pivot choice → generally efficient         |
| **Worst case**       | O(n²)                      | Pivot is always min or max → unbalanced partition |
| **Auxiliary space, this allocating version** | Balanced O(n); worst O(n²) | Live partition arrays plus recursion; not only stack |

**Optimization Tips:**

* Use **random pivot** or **median-of-three pivot** to reduce worst-case probability.
* A measured hybrid can use insertion sort for small partitions; a universal cutoff such as10 is not an engine-independent rule.

---

## 4️⃣ Characteristics

* This implementation allocates left/right/result arrays and is **not in-place**. A separate swap-based partition implementation has different memory costs.
* **Not stable** by default (equal elements may change relative order).
* Very **efficient for large datasets** in practice.
* Unbalanced recursion can exceed the runtime call-stack limit. Do not assume tail-call optimization: this function also does work after its recursive calls.

---

### ✅ Summary

* Quick Sort is a **divide-and-conquer algorithm**:

  * Select pivot → partition → recursively sort subarrays.
* **Time Complexity:** Average O(n log n), Worst O(n²)
* **Space Complexity of this example:** balanced O(n), worst O(n²) live array slots; stack alone O(log n) balanced / O(n) worst.
* **Best Use:** Large arrays where **average-case performance** is important.
* **Tips for Optimization:** Random pivot, hybrid with insertion sort for small arrays.

> 💡 Senior Tip:
> Quick Sort is **fast and widely used**, but always be mindful of **pivot selection** to avoid worst-case performance.


## Analyze this implementation, not just the algorithm name

Assume a dense array of finite numbers and constant-cost comparisons/copies. For balanced partitions T(n)=2T(n/2)+O(n), giving O(n log n) time. Last-element pivot on already sorted, reverse-sorted or all-equal inputs creates n−1/0 splits: T(n)=T(n−1)+O(n), giving O(n²). Randomizing reduces the probability for distinct adversarial order but does not guarantee a worst-case bound; this two-way equality policy still degenerates when all values are equal. A three-way partition can group equal values, at the cost of a different implementation to verify.

Count **peak simultaneously live storage**, **total allocation across execution**, and **stack depth** separately. For this source, ancestors retain their arr/left/right arrays while a child recurses. Balanced subproblem sizes on a live path sum geometrically, so peak auxiliary array slots are O(n); across all levels the total allocated slots are O(n log n). A worst-case path retains sizes n−1,n−2,…, so peak slots and total allocations can be O(n²), in addition to an O(n) stack. Stack-only O(log n) does not describe the allocating code. Engine liveness/GC optimizations can affect measured bytes; these bounds describe ordinary source-level array retention, not exact heap bytes or GC timing.

An in-place partition avoids these arrays. Recursing only into the smaller side and iterating over the larger can bound its stack by O(log n), even when time remains O(n²). Introspective sorting can switch algorithms to protect worst-case time. These are alternative implementations, not properties conferred by calling this function quickSort. Stability also depends on the partition/merge behavior; do not assume the shown sort preserves the order of equal records.

For ordinary application code prefer a well-formed numeric comparator such as values.toSorted((a,b)=>a-b) when a fresh array is needed, or values.sort((a,b)=>a-b) for explicit mutation. ECMAScript requires stable sorting for consistent comparison but does not mandate a universal time/space algorithm. NaN, sparse arrays, getters and inconsistent/side-effectful comparators fall outside the simple finite-number analysis. Comparator cost multiplies the number of comparisons.

**Exercise acceptance:** instrument the exact example's comparison count, maximum recursion depth and allocated array slots without claiming those are measured heap bytes. Check empty/singleton, sorted/reversed, duplicates and random finite-number inputs against a numeric native sort; verify input preservation. For n sorted/equal elements show n(n−1)/2 comparisons and depth proportional to n using small safe n. Compare a balanced fixture and explain peak versus cumulative storage. Add a three-way/in-place variant only as an explicitly separate exercise; retain correctness and operation-count evidence before timing. Large worst-case recursion is intentionally not a recommended production stress test.

Official reference checked2026-10-22: [ECMAScript Array sorting semantics](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.sort). Complexity above follows direct analysis of this source; it is not a native-engine benchmark. Learner practice remains required.
