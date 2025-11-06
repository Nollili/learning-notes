# Please describe quick sort algorithm. What complexity does it have?

## 🔹 Quick Sort Algorithm

**Quick Sort** is a **divide-and-conquer sorting algorithm**. It works by **selecting a "pivot" element** from the array and partitioning the other elements into two sub-arrays:

- Elements **less than the pivot**
- Elements **greater than the pivot**

The process is then **recursively applied** to the sub-arrays until the entire array is sorted.

---

## 1️⃣ Steps of Quick Sort

1. **Choose a pivot** element (first, last, middle, or random).
2. **Partition** the array:
   - Move elements smaller than pivot to the left.
   - Move elements greater than pivot to the right.
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
````

---

## 3️⃣ Complexity Analysis

| Case                 | Time Complexity            | Explanation                                       |
| -------------------- | -------------------------- | ------------------------------------------------- |
| **Best case**        | O(n log n)                 | Balanced partitioning (pivot splits array evenly) |
| **Average case**     | O(n log n)                 | Random pivot choice → generally efficient         |
| **Worst case**       | O(n²)                      | Pivot is always min or max → unbalanced partition |
| **Space Complexity** | O(log n) (recursion stack) | Average case recursion depth                      |

**Optimization Tips:**

* Use **random pivot** or **median-of-three pivot** to reduce worst-case probability.
* For small arrays (<10 elements), consider **insertion sort** as it can be faster.

---

## 4️⃣ Characteristics

* **In-place sorting** (can be optimized to avoid extra arrays, using swaps).
* **Not stable** by default (equal elements may change relative order).
* Very **efficient for large datasets** in practice.
* Recursion makes it elegant but may require **tail recursion optimization** in some cases.

---

### ✅ Summary

* Quick Sort is a **divide-and-conquer algorithm**:

  * Select pivot → partition → recursively sort subarrays.
* **Time Complexity:** Average O(n log n), Worst O(n²)
* **Space Complexity:** O(log n) (stack)
* **Best Use:** Large arrays where **average-case performance** is important.
* **Tips for Optimization:** Random pivot, hybrid with insertion sort for small arrays.

> 💡 Senior Tip:
> Quick Sort is **fast and widely used**, but always be mindful of **pivot selection** to avoid worst-case performance.
