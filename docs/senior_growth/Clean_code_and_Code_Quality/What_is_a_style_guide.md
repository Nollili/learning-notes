# What is a style guide?

# 🎨 Style Guide in Software Development

A **style guide** is a **document or set of rules** that defines how code should be **written, formatted, and structured** in a project or organization. It ensures **consistency and readability** across the codebase, making it easier for teams to maintain and scale software.

---

## 1️⃣ Purpose of a Style Guide

- **Consistency:** All developers follow the same conventions, reducing cognitive load.
- **Readability:** Easier for team members to understand code quickly.
- **Maintainability:** Simplifies code reviews, debugging, and refactoring.
- **Collaboration:** Reduces conflicts and misunderstandings in team environments.
- **Tool Integration:** Works with linters, formatters, and CI/CD pipelines for automated enforcement.

---

## 2️⃣ Common Components of a Style Guide

| Component | Examples |
|-----------|---------|
| **Formatting** | Indentation (2 vs 4 spaces), line length, spaces vs tabs, semicolons |
| **Naming conventions** | camelCase for variables, PascalCase for components, UPPER_CASE for constants |
| **File/folder structure** | Grouping by feature/module, naming conventions for files |
| **Code patterns** | Preferred ways to write loops, functions, or hooks |
| **Comments/documentation** | When and how to comment code; docstring standards |
| **Best practices** | Immutability, error handling, side-effect management, accessibility standards in UI |
| **Testing** | Where and how tests should be written (unit, integration, E2E) |

---

## 3️⃣ Examples of Style Guides

- **JavaScript / TypeScript:**
  - Airbnb JavaScript Style Guide
  - Google JavaScript Style Guide
  - StandardJS
- **CSS / SCSS / Styled Components:**
  - CSS Guidelines by Harry Roberts
  - Stylelint recommended rules
- **React / Frontend:**
  - React/JSX rules for hooks, component naming, props handling

---

## 4️⃣ Enforcement

- **Linters:** ESLint, TSLint, Stylelint enforce style guide rules automatically.
- **Formatters:** Prettier ensures consistent formatting.
- **Pre-commit hooks:** Husky + lint-staged prevents code that violates the style guide from being committed.
- **CI/CD pipelines:** Ensure all PRs comply with style guide rules before merging.

---

## ✅ Key Takeaways

- **Style guide = team-agreed conventions for writing code**
- Ensures **consistent, readable, maintainable code** across projects
- Works hand-in-hand with **linters, formatters, and automated pipelines**
- Makes **code reviews faster and more effective** because reviewers focus on logic, not style

> 💡 Senior Tip:  
> A style guide is not just about aesthetics—it’s **a contract that communicates code intent and quality** across the team.
