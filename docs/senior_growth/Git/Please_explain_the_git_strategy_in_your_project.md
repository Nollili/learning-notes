# Please explain the git strategy in your project?

## Choosing a Git Strategy {#%F0%9F%94%B9-choosing-a-git-strategy}

This is a study example, not a claim about an employer or this repository's configured protection rules. In this project only the user may push; no assistant push is permitted.

A **Git strategy** defines how developers collaborate, manage features, releases, and fixes in a **version-controlled project**. It ensures **organized development, stability, and traceability**.

---

## Common Git Strategies {#_1%EF%B8%8F%E2%83%A3-common-git-strategies}

### 1.1 Git Flow

- **Branches:**
  - `main` → production-ready code
  - `develop` → integration branch for features
  - `feature/*` → new features
  - `release/*` → prepare releases
  - `hotfix/*` → urgent fixes
- **Pros:** Clear structure for large teams and multiple releases
- **Cons:** Can be heavy and slow for small projects

### 1.2 GitHub Flow

- **Branches:**
  - `main` → always deployable
  - `feature/*` → short-lived branches for new work
- **Pros:** Simple, great for CI/CD, encourages frequent merges
- **Cons:** Less structured for multiple concurrent releases

### 1.3 GitLab Flow

- Combines **environment-based branches** with **feature branches**
- **Pros:** Integrates CI/CD and release management
- **Cons:** Can be complex if environments are many

---

## Example strategy for a versioned-release team {#_2%EF%B8%8F%E2%83%A3-example-strategy-for-a-versioned-release-team}

- **Main Branch:** `main` → always deployable, protected by **PR reviews & CI checks**
- **Development / Integration:** `develop` → merged features, tested in staging
- **Feature Branches:** `feature/<feature-name>` → branched from `develop`, merged back via **merge request**
- **Hotfix Branches:** `hotfix/<issue>` → branched from `main`, merged back to `main` and `develop`
- **Release Branches:** `release/<version>` → optional, for release preparation

---

## Workflow Example {#_3%EF%B8%8F%E2%83%A3-workflow-example}

1. Inspect the actual base, current status and applicable instructions. Do not assume develop/main or a remote exists.
2. Create/reuse a short-lived local branch such as codex/ln-demo-001 from the known base. Use a worktree when a separate checkout is useful; it does not copy uncommitted changes or isolate credentials/services.
3. Make the focused change, run applicable checks and inspect the actual diff. Stage specific intended paths rather than blindly adding everything.
4. Prepare a local review record with the issue, behavior, acceptance evidence and limitations. Remote submission is a separate user-owned step here.
5. Resolve review findings and rerun affected checks. Merge/release decisions follow the real team's protection and compatibility policy, not a branch naming convention alone.

The executed [local issue-to-review workflow](../../ai-assisted-engineering/local-workflow-and-git.md) supplies branch/worktree and handoff evidence. Git Flow is useful for some maintained release lines; short-lived branches/trunk policies often suit frequent integration. Team size alone does not select the strategy: maintenance versions, release cadence, deployment independence and integration risk matter.

---

## Best Practices {#_4%EF%B8%8F%E2%83%A3-best-practices}

* **Small, focused commits** → easier to review and revert
* **Descriptive branch names** → `feature/login`, `bugfix/navbar`
* **Protected branches** → prevent direct pushes to `main`
* **Pull/Merge requests** → enforce code review and CI testing
* **Use tags** → track releases

---

### Summary {#%E2%9C%85-summary}

* Git strategy ensures **structured development, stable releases, and traceability**.
* This example uses a **Git Flow-inspired strategy**: `main` (production), `develop` (integration), feature/hotfix/release branches.
* Workflow emphasizes **code reviews, CI/CD, and small, incremental changes**.

> Senior Tip:
> Choose from supported release lines, review/check policy and integration cadence. Team size alone does not select a branching model.

## Conflict, abort and recovery practice

A merge combines histories; a textual conflict means Git cannot choose the overlapping change. A conflict-free merge can still be semantically wrong. Read the common base and both changes, resolve using the issue/API contract, then run checks against the resolved tree. Never choose an entire ours/theirs side merely to remove markers. In the retry fixture, one branch fixed zero while another deliberately changed the same default expression; the agreed default2/zero/null contract determined the result.

```sh
git status --short
git ls-files -u
git diff
# If abandoning this merge is appropriate and starting work was clean:
git merge --abort
```

Start from a clean owned fixture for this exercise. Aborting may not reconstruct arbitrary pre-existing uncommitted edits; inspect/preserve user work before any integration operation. After resolving, stage only the resolved paths, inspect the staged diff and run the build/tests. Merge creates a combined history; rebase replays commits and changes identities. Avoid rewriting shared history without the actual team's policy and authorization.

```sh
git reflog
git show --stat COMMIT_FROM_INSPECTED_REFLOG
git branch codex/recovered-study COMMIT_FROM_INSPECTED_REFLOG
```

Replace the uppercase placeholder with the exact inspected local commit ID. Creating a recovery branch preserves that commit without moving the current branch or discarding files. Reflogs record local reference movement; they are not remote backups, do not normally contain never-committed file bytes and can expire/be pruned. Do not promise recovery of all deleted work or reach first for reset --hard. Retain a verified patch/artifact when appropriate.

**Actual validation2026-10-25:** a disposable Git2.54 repository produced a conflict with three index stages, merge abort restored the prior clean main commit, a second merge was resolved from the contract and the TS5.9.3 build/all7 Node24 tests passed. An inspected reflog commit was retained by a recovery branch. Earlier branch/worktree isolation and same-branch/dirty-removal refusal checks also passed in the same owned fixture. No user repository history or remote was changed.


Official references checked2026-10-25: [merge](https://git-scm.com/docs/git-merge), [reflog](https://git-scm.com/docs/git-reflog), [worktree](https://git-scm.com/docs/git-worktree).


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/git/Please_explain_the_git_strategy_in_your_project.md). All learner practice remains outstanding.
