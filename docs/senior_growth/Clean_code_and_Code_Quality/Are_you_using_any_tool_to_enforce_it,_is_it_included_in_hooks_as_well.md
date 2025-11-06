# Are you using any tool to enforce it, is it included in hooks as well?

# 🛠 Tools to Enforce Code Quality & Hooks Integration

Yes, in modern JavaScript/TypeScript projects, enforcing code quality is **automated using various tools**, often integrated with **pre-commit hooks, CI/CD pipelines, and IDEs**. This ensures code quality is maintained **before code reaches the repository**.

---

## 1️⃣ Common Tools

| Tool                  | Purpose                                   | Notes                                                        |
|-----------------------|-------------------------------------------|--------------------------------------------------------------|
| **ESLint**            | Linting for JavaScript/TypeScript         | Finds errors, enforces style, supports custom rules           |
| **Prettier**          | Code formatting                           | Ensures consistent style, works with ESLint                   |
| **Stylelint**         | Linting for CSS/SCSS/styled-components    | Enforces UI style consistency                                 |
| **Husky**             | Git hooks management                      | Runs scripts on `pre-commit`, `pre-push`, etc.                |
| **lint-staged**       | Lint staged files only                    | Improves hook speed, checks only changed files                |
| **SonarQube/SonarCloud** | Static analysis, code smells, security | Typically runs in CI/CD pipelines                             |
| **Jest/Vitest**       | Unit testing and coverage                 | Can block commits if tests fail                               |

---

## 2️⃣ Integration with Hooks

**Pre-commit hooks** ensure code meets quality standards **before it is committed**:

**Example with Husky + lint-staged:**
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.ts": ["eslint --fix", "prettier --write"],
    "*.tsx": ["eslint --fix", "prettier --write"]
  }
}
````

* **Behavior:**

  * When committing code, `lint-staged` runs ESLint and Prettier **only on staged files**.
  * Failing linting prevents the commit.

**Optional:** Pre-push hooks can also run:

* Unit tests
* Type checking (`tsc --noEmit`)
* Security scans

---

## 3️⃣ CI/CD Enforcement

Even with hooks, **CI/CD pipelines** provide a **secondary enforcement layer**:

* Runs full linting, formatting, unit tests, coverage, and security checks
* Prevents merging code that passes local hooks but fails global rules
* Common platforms: GitHub Actions, GitLab CI/CD, Jenkins, CircleCI

---

## 4️⃣ Benefits of Hook + Tool Integration

1. **Immediate feedback:** Developers fix issues before committing.
2. **Consistency across the team:** All developers follow the same rules automatically.
3. **Reduced technical debt:** Enforces standards from day one.
4. **Improved code review efficiency:** Code arrives cleaner for review.

---

### ✅ Key Takeaways

* Tools like **ESLint, Prettier, Stylelint, Jest, SonarQube** are essential for code quality.
* **Hooks (pre-commit, pre-push)** enforce standards **locally before code leaves the developer’s machine**.
* Combined with **CI/CD pipelines**, this ensures **high-quality, consistent, and maintainable code** across the team.

> 💡 Senior Tip:
> Always use **hooks for developer productivity** and **CI/CD for enforcement at the team level**. Local hooks catch issues early, CI ensures nothing slips through.
