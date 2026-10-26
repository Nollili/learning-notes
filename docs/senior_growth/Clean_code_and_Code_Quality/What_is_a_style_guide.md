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

- **Linters:** ESLint with typescript-eslint for TypeScript, and Stylelint for CSS. TSLint was deprecated in2019 and belongs to migration history.
- **Formatters:** Prettier ensures consistent formatting.
- **Pre-commit hooks:** Husky + lint-staged can provide local feedback; hooks can be bypassed, so required gates also run in CI.
- **CI/CD pipelines:** Ensure all PRs comply with style guide rules before merging.

---

## ✅ Key Takeaways

- **Style guide = team-agreed conventions for writing code**
- Ensures **consistent, readable, maintainable code** across projects
- Works hand-in-hand with **linters, formatters, and automated pipelines**
- Makes **code reviews faster and more effective** because reviewers focus on logic, not style

> 💡 Senior Tip:  
> A style guide is not just about aesthetics—it’s **a contract that communicates code intent and quality** across the team.


## Team policy, exceptions and rollout

Separate formatting (Prettier), mechanically checkable correctness rules (ESLint/typescript-eslint), compiler checks (tsc) and human design guidance. A formatter cannot prove safe asynchronous ownership; a typechecker cannot prove the correct business calculation. Prefer one formatter owner rather than conflicting lint formatting rules. Refer to the [worked typed quality gates and refactor](./What_practices%2C_approaches_do_you_know_which_helps_to_improve_code_quality_%28style_guides%2C_coding_principles%29.md#worked-static-gates-and-a-small-domain-refactor).

Record rule purpose, scope and an example of both acceptable and rejected code. Example policy: await or explicitly handle rejecting promises at service boundaries; name domain concepts consistently; require public API changes to include consumer/migration evidence. New rules should be piloted on representative code and introduced in a focused cleanup or changed-code rollout with a bounded legacy backlog. Do not combine a whole-repo reformat with an unrelated bug fix.

An exception needs a narrow suppression, rule name, concrete reason, owner and follow-up condition. Avoid file-wide disable comments for one line. A warning budget can be part of a migration, but required correctness rules must fail the build once adopted. Complexity/coverage numbers identify code to investigate; the team should justify thresholds from risk and maintainability rather than treat an arbitrary score as proof of quality. Revisit expensive/noisy rules when evidence shows poor signal; disabling a rule is a reviewed policy change.

**Practice acceptance:** write a one-page team guide with3–5 high-value rules, wire compiler/lint/format checks independently in a separate project, demonstrate one valid exception and one rejected broad suppression, and make CI fail when a hook is bypassed. Retain diagnostics and decision reasons. Learner implementation remains required.

References checked2026-10-21: [TSLint deprecation](https://palantir.github.io/tslint/), [typescript-eslint typed linting](https://typescript-eslint.io/getting-started/typed-linting/), [ESLint configuration](https://eslint.org/docs/latest/use/configure/configuration-files).
