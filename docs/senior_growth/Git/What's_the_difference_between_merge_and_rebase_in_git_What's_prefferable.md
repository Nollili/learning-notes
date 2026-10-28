# What's the difference between merge and rebase in git? What's prefferable?

## 🔹 Git: Merge vs Rebase

Both **merge** and **rebase** are Git operations used to integrate changes from one branch into another, but they work differently and produce different commit histories.

---

## 1️⃣ Merge

**Definition:** Integrates another history into the current branch. If the current tip is an ancestor of the other tip, the default merge can fast-forward by moving the branch pointer without a new commit. A divergent successful merge normally creates a commit with both parents; `--no-ff` requests a merge commit even when fast-forwarding is possible, while `--ff-only` refuses divergence. Configuration and options affect policy.

### Example
```bash
# On main branch
git merge feature/login
```

**Result for divergent histories (or an explicit `--no-ff` merge):**

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

* Non-fast-forward merges add merge commits; whether that helps review or adds noise depends on the project policy.
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
| Merge Commit            | Only when a merge commit is needed/requested | Default replays a linear sequence; `--rebase-merges` can recreate merges |
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

* Avoid rebasing shared history; any exception requires explicit coordination with every affected collaborator. In this repository only the user may push, and no remote action is part of this exercise.
* Prefer **rebase for local cleanup** and **merge for collaborative merges**.
* Use `git log --graph --oneline` to visualize the differences in history between merge and rebase.


## Resolve, continue, abort and recover

Use a clean disposable repository. Before integrating, inspect `git status`, the base and both histories. Merge conflicts and semantic conflicts require understanding the contract, not blindly selecting ours/theirs. The shared [conflict/abort/reflog practice](./Please_explain_the_git_strategy_in_your_project.md#conflict-abort-and-recovery-practice) includes an actual retry-contract conflict, resolved build/test evidence and a local reviewer handoff.

For a rebase conflict:

```sh
git status
git ls-files -u
git diff
# Edit the conflicted file according to the intended behavior.
git add path/to/resolved-file
git rebase --continue
# Or, instead of continuing, abandon this rebase:
# git rebase --abort
```

Replace the path with the actual inspected file. Continue may stop again at the next conflicting commit. `--skip` discards the current patch from the replay; do not use it simply to silence a conflict. During rebase, ours/theirs terminology reflects the replay's current base and incoming patch and can surprise users. Inspect actual content. After resolution, rerun acceptance checks and compare the resulting commits/diff with the intended change. A clean textual result is not proof of correct behavior.

Reflog inspection and a new recovery branch can retain an old local commit without discarding current files. Reflogs expire; uncommitted bytes are not generally recoverable through them. Do not use destructive reset/clean commands as a first response.

**Executed 2026-10-25, Git2.54:** a fresh local repository with no remote proved `--ff-only` moved main to the existing tip without adding a commit; `--no-ff` created a two-parent commit. A deliberate rebase conflict exposed three index stages. Abort restored the original commit/clean tree; a second attempt resolved the explicit `limit=0` contract, continued to a new commit on the new main, and preserved the old commit via an inspected reflog/recovery branch. The separate shared retry fixture's resolved build and seven tests passed in B162. These are authored local fixtures, not learner completion or a real team's history.


Official references: [merge](https://git-scm.com/docs/git-merge), [rebase modes](https://git-scm.com/docs/git-rebase), [reflog](https://git-scm.com/docs/git-reflog).


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/git/What%27s_the_difference_between_merge_and_rebase_in_git_What%27s_prefferable.md). All learner practice remains outstanding.
