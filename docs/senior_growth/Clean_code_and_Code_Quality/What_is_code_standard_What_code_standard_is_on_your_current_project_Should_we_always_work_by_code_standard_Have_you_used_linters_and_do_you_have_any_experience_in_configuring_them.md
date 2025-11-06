# What is code standard? 
## What code standard is on your current project? Should we always work by code standard? Have you used linters and do you have any experience in configuring them?

## 📏 Code Standards in Software Development

**Code standards** are a set of agreed-upon **rules, conventions, and best practices** that developers follow to ensure code is **consistent, readable, and maintainable** across a project or team.

---

## 1️⃣ What a Code Standard Means

- **Consistency:** Ensures all code looks and behaves similarly regardless of the author.
- **Readability:** Makes it easier for team members and future developers to understand the code.
- **Maintainability:** Reduces technical debt and simplifies debugging or extending functionality.
- **Automation-friendly:** Enables integration with linters, formatters, and CI/CD pipelines.

**Components of a code standard:**
- Naming conventions (variables, functions, classes)
- File/folder structure
- Formatting rules (indentation, spacing, semicolons, quotes)
- Best practices (error handling, immutability, side-effects management)
- Documentation & commenting conventions

---

## 2️⃣ Code Standard on My Current Project

- **Language:** TypeScript + React
- **Linting / Formatting:** ESLint + Prettier
- **Rules enforced:**
  - Airbnb + custom overrides for React/TypeScript
  - Strict typing rules (`noImplicitAny`, `strictNullChecks`)
  - Consistent imports / exports
  - No unused variables or imports
  - Modular, small, single-responsibility components
- **CI/CD enforcement:** All PRs are blocked if linting errors exist

---

## 3️⃣ Should We Always Work by Code Standards?

**Yes, always** — benefits include:

- Reduces **code review friction**
- Ensures **team-wide consistency**
- Improves **readability and maintainability**
- Makes **automation (linting, formatting, CI/CD)** effective
- Prevents **trivial bugs** related to coding style or patterns

> Exception: Sometimes in prototypes or experiments, strict enforcement may be relaxed temporarily, but production code should **always follow standards**.

---

## 4️⃣ Linters: Usage and Configuration Experience

- **Tools used:** ESLint, Prettier, Stylelint
- **Usage:**
  - Local IDE integration → immediate feedback
  - Pre-commit hooks via Husky + lint-staged → prevents commits with errors
  - CI/CD pipelines → enforce standards globally
- **Configuration experience:**
  - Extended community configs: `airbnb`, `eslint:recommended`
  - Custom rules for:
    - React hooks (`react-hooks/rules-of-hooks`, `react-hooks/exhaustive-deps`)
    - TypeScript (`@typescript-eslint/no-explicit-any`, `strict-boolean-expressions`)
  - Integration with Prettier to avoid formatting conflicts
- **Benefits of custom configuration:**
  - Tailors rules to project needs
  - Enforces best practices consistently
  - Automates style enforcement without manual review

---

### ✅ Key Takeaways

- **Code standard = team-agreed conventions + best practices**
- Working by code standard **improves maintainability, readability, and team efficiency**
- **Linters + formatters** enforce code standards automatically
- **CI/CD + pre-commit hooks** ensure compliance at all stages

> 💡 Senior Tip:  
> Think of code standards as **a contract between developers**—breaking it should be deliberate and justified, not accidental.
