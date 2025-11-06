# What's the difference between merge and rebase in git? What's prefferable?

## 🔹 Git: Merge vs Rebase

Both **merge** and **rebase** are Git operations used to integrate changes from one branch into another, but they work differently and produce different commit histories.

---

## 1️⃣ Merge

**Definition:** Combines two branches by creating a **merge commit** that ties together the histories of both branches.

### Example
```bash
# On main branch
git merge feature/login
````

**Result:**

```
*   Merge commit (main + feature)
|\
| * Feature commit 1
| * Feature commit 2
* Main commit 1
```

### Pros

* Preserves **full history** of both branches.
* Simple to understand for teams.
* Safe for **shared branches** because history is not rewritten.

### Cons

* Produces **extra merge commits**, which can clutter history.
* Less linear history → harder to trace the order of changes.

---

## 2️⃣ Rebase

**Definition:** Re-applies commits from one branch **on top of another branch**, creating a **linear history**.

### Example

```bash
# On feature branch
git rebase main
```

**Result:**

```
* Feature commit 1 (rebased)
* Feature commit 2 (rebased)
* Main commit 1
```

### Pros

* Creates **clean, linear history** → easier to read with `git log` or `git bisect`.
* Avoids unnecessary merge commits.
* Ideal before merging feature branches into main.

### Cons

* **Rewrites history** → dangerous if the branch is **shared with others**.
* Can be tricky to resolve conflicts if rebasing long-lived branches.

---

## 3️⃣ Merge vs Rebase Summary

| Aspect                  | Merge                         | Rebase                                   |
| ----------------------- | ----------------------------- | ---------------------------------------- |
| History                 | Preserves all commits         | Linear, rewritten commits                |
| Merge Commit            | Yes                           | No                                       |
| Conflict Handling       | Once during merge             | Can occur at each rebased commit         |
| Safety on shared branch | Very safe                     | Dangerous, can cause issues              |
| Use Case                | Combining long-lived branches | Updating feature branch with latest main |

---

## 4️⃣ Which is Preferable?

**Rule of Thumb:**

* **Use merge** when:

  * Branches are **shared among multiple developers**.
  * You want to **preserve history**.
* **Use rebase** when:

  * Working on a **private feature branch**.
  * You want to **keep history linear** before merging to main.
* Many teams adopt a **“rebase before merge”** strategy:

  1. Rebase feature branch onto latest main.
  2. Merge feature branch into main (fast-forward or no-ff merge).

---

### ✅ Senior Tip

* **Never rebase public/shared branches**.
* Prefer **rebase for local cleanup** and **merge for collaborative merges**.
* Use `git log --graph --oneline` to visualize the differences in history between merge and rebase.
