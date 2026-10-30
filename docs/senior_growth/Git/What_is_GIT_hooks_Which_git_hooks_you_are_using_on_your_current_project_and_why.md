# What is GIT hooks? Which git hooks you are using on your current project and why?

## Git Hooks {#%F0%9F%94%B9-git-hooks}

This is an example policy, not evidence of installed hooks in this repository. Local hooks provide feedback; required CI/protected-branch/server policy must independently enforce acceptance. No push is permitted here.

**Git hooks** are scripts that Git executes **automatically at specific points** in the Git workflow, such as before committing, pushing, or receiving changes. They allow you to **enforce rules, automate tasks, and improve code quality**.

---

## Types of Git Hooks {#_1%EF%B8%8F%E2%83%A3-types-of-git-hooks}

Git hooks are divided into **client-side** and **server-side** hooks:

| Type           | Trigger Example                        | Purpose                                         |
|----------------|---------------------------------------|------------------------------------------------|
| **Client-side** | `pre-commit`                          | Run checks before a commit is saved locally   |
|                 | `commit-msg`                           | Validate commit message format                 |
|                 | `pre-push`                             | Run tests or linters before pushing           |
| **Server-side** | `pre-receive`                          | Validate commits before accepting push on server |
|                 | `post-receive`                         | Trigger deployments or notifications          |

> Git normally looks in its hooks directory, configurable through core.hooksPath. A linked worktree can have a .git file, so do not assume .git/hooks is a normal directory in every checkout. Hook files need a valid interpreter/shebang and executable permission on applicable systems. Versioned hook sources are not automatically installed by cloning.

---

## Hooks Commonly Used in Projects {#_2%EF%B8%8F%E2%83%A3-hooks-commonly-used-in-projects}

### Client-Side Hooks

1. **pre-commit**
   - Purpose: Run **linting, formatting, or unit tests** before committing.
   - Minimal example: check whitespace in the staged diff without rewriting the worktree. This does not lint JavaScript or prove tests pass.
   ```bash
   #!/bin/sh
   set -eu
   git diff --cached --check
   ```

2. **commit-msg**

   * Purpose: Enforce **commit message conventions** (e.g., Conventional Commits).

   ```bash
   #!/bin/sh
   set -eu
   exec ./node_modules/.bin/commitlint --edit "$1"
   ```

3. **pre-push**

   * Purpose: Run **unit tests or build checks** before pushing.

   ```bash
   #!/bin/sh
   set -eu
   npm run build
   npm run test
   ```

---

### Server-Side Hooks

1. **pre-receive**

   * Purpose: Reject pushes that fail certain rules (e.g., forbidden branches, missing tests).
2. **post-receive**

   * Purpose: Trigger **CI/CD pipelines** or deployments after a successful push.

---

## Example hook policy {#_3%EF%B8%8F%E2%83%A3-example-hook-policy}

* **pre-commit:** Runs **ESLint, Prettier, and format checks** to ensure clean code before commit.
* **commit-msg:** Enforces **Conventional Commit messages** to maintain clear changelog.
* **pre-push:** Runs **unit tests** to avoid pushing broken code.
* **Optional server-side (pre-receive):** Prevent pushes to `main` without merge requests.

**Benefits:**

* Maintains **code quality and consistency**
* Reduces **broken builds** in CI/CD
* Enforces **commit conventions**
* Saves time in **code review** by catching issues early

---

### Summary {#%E2%9C%85-summary}

* **Git hooks** = scripts triggered at specific Git events.
* **Client-side hooks**: pre-commit, commit-msg, pre-push (quality checks, formatting, tests).
* **Server-side hooks**: pre-receive, post-receive (enforce rules, trigger CI/CD).
* **Best Practice:** Use hooks to **automate checks**, enforce **standards**, and prevent **bad code** from entering the repository.

> Senior Tip:
> Combine **linting, formatting, testing, and commit conventions** in Git hooks for **clean, reliable, and maintainable code** across the team.

## Install deliberately and check staged content

The commit-msg example requires an already installed/configured local commitlint; the build/test hook requires those actual template scripts. Do not introduce dependencies or overwrite an existing core.hooksPath merely by copying this page. Inspect the existing manager (for example a configured Husky installation) and integrate through its reviewed mechanism. For the minimal fresh disposable fixture only, put the pre-commit script above in .githooks/pre-commit, then:

```sh
chmod +x .githooks/pre-commit
git config --local core.hooksPath .githooks
```

A whole-tree formatter with --fix can change unrelated unstaged edits and produce a commit different from what was reviewed. Prefer check-only staged-aware tooling with bounded explicit paths. Be careful with partially staged files: checking the working file can inspect different bytes from the index. A full build/test may use the worktree, so CI must check a clean candidate checkout.

If using a temporary index/tree or a maintained staged runner, test preservation/restoration of partial changes and failure handling; never assume a script can safely auto-stage every rewrite.

pre-commit/commit-msg can be bypassed by supported Git options and users can change local configuration. Hooks are not a security boundary against a contributor controlling their own machine. Enforce required checks/review on the server/CI and protect privileged CI credentials from untrusted branches. Client hooks should report failure and terminate, not loop or silently swallow an error. Server deployment triggers also need their own controlled release policy.

**Actual validation2026-10-25:** the executable shebang/set-eu/staged-whitespace hook was installed in a disposable Git2.54 repo. Bad staged whitespace with a clean-looking unstaged replacement blocked commit; HEAD/index/worktree bytes were preserved. Staging the correction allowed commit. Conversely a clean staged file with bad unstaged whitespace committed only the clean index bytes and left the worktree untouched. No whole-tree auto-fix ran. The commitlint/full-build hook examples were not installed/executed; hosted enforcement was not tested.


Official references checked2026-10-25: [hook execution/bypass](https://git-scm.com/docs/githooks), [core.hooksPath](https://git-scm.com/docs/git-config), [staged diff checks](https://git-scm.com/docs/git-diff).


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/git/What_is_GIT_hooks_Which_git_hooks_you_are_using_on_your_current_project_and_why.md). All learner practice remains outstanding.
