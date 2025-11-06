# What is GIT hooks? Which git hooks you are using on your current project and why?

## 🔹 Git Hooks

**Git hooks** are scripts that Git executes **automatically at specific points** in the Git workflow, such as before committing, pushing, or receiving changes. They allow you to **enforce rules, automate tasks, and improve code quality**.

---

## 1️⃣ Types of Git Hooks

Git hooks are divided into **client-side** and **server-side** hooks:

| Type           | Trigger Example                        | Purpose                                         |
|----------------|---------------------------------------|------------------------------------------------|
| **Client-side** | `pre-commit`                          | Run checks before a commit is saved locally   |
|                 | `commit-msg`                           | Validate commit message format                 |
|                 | `pre-push`                             | Run tests or linters before pushing           |
| **Server-side** | `pre-receive`                          | Validate commits before accepting push on server |
|                 | `post-receive`                         | Trigger deployments or notifications          |

> Git hooks are located in `.git/hooks` folder (e.g., `.git/hooks/pre-commit`). They are usually **executable scripts** in bash, Node.js, or other languages.

---

## 2️⃣ Hooks Commonly Used in Projects

### Client-Side Hooks

1. **pre-commit**
   - Purpose: Run **linting, formatting, or unit tests** before committing.
   - Example: Ensure all JavaScript/TypeScript files follow ESLint rules.
   ```bash
   # .git/hooks/pre-commit
   npx eslint . --fix
````

2. **commit-msg**

   * Purpose: Enforce **commit message conventions** (e.g., Conventional Commits).

   ```bash
   # .git/hooks/commit-msg
   npx commitlint --edit $1
   ```

3. **pre-push**

   * Purpose: Run **unit tests or build checks** before pushing.

   ```bash
   # .git/hooks/pre-push
   npm test
   ```

---

### Server-Side Hooks

1. **pre-receive**

   * Purpose: Reject pushes that fail certain rules (e.g., forbidden branches, missing tests).
2. **post-receive**

   * Purpose: Trigger **CI/CD pipelines** or deployments after a successful push.

---

## 3️⃣ Hooks in Our Project

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

### ✅ Summary

* **Git hooks** = scripts triggered at specific Git events.
* **Client-side hooks**: pre-commit, commit-msg, pre-push (quality checks, formatting, tests).
* **Server-side hooks**: pre-receive, post-receive (enforce rules, trigger CI/CD).
* **Best Practice:** Use hooks to **automate checks**, enforce **standards**, and prevent **bad code** from entering the repository.

> 💡 Senior Tip:
> Combine **linting, formatting, testing, and commit conventions** in Git hooks for **clean, reliable, and maintainable code** across the team.
