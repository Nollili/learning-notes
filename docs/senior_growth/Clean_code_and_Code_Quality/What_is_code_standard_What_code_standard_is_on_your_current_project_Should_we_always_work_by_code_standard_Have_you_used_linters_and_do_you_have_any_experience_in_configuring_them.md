# What is code standard? {#what-is-code-standard}
## What code standard is on your current project? Should we always work by code standard? Have you used linters and do you have any experience in configuring them?

## Code Standards in Software Development {#%F0%9F%93%8F-code-standards-in-software-development}

**Code standards** are a set of agreed-upon **rules, conventions, and best practices** that developers follow to ensure code is **consistent, readable, and maintainable** across a project or team.

---

## What a Code Standard Means {#_1%EF%B8%8F%E2%83%A3-what-a-code-standard-means}

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

## Illustrative React/TypeScript Standard — Verify Against the Actual Project {#_2%EF%B8%8F%E2%83%A3-illustrative-react-typescript-standard-%E2%80%94-verify-against-the-actual-project}

- **Language:** TypeScript + React
- **Linting / Formatting:** ESLint + Prettier
- **Rules enforced:**
  - A compatible reviewed lint configuration; community presets are alternatives, not proof of existing project setup
  - Compiler checks (`noImplicitAny`, `strictNullChecks`) configured in tsconfig, independently of ESLint/Prettier
  - Consistent imports / exports
  - No unused variables or imports
  - Modular, small, single-responsibility components
- **CI/CD enforcement:** Configure required checks explicitly; this example does not establish the settings of any current project.

---

## Should We Always Work by Code Standards? {#_3%EF%B8%8F%E2%83%A3-should-we-always-work-by-code-standards}

**Yes, always** — benefits include:

- Reduces **code review friction**
- Ensures **team-wide consistency**
- Improves **readability and maintainability**
- Makes **automation (linting, formatting, CI/CD)** effective
- Prevents **trivial bugs** related to coding style or patterns

> Exception: Sometimes in prototypes or experiments, strict enforcement may be relaxed temporarily, but production code should **always follow standards**.

---

## Linters: Usage and Configuration Experience {#_4%EF%B8%8F%E2%83%A3-linters-usage-and-configuration-experience}

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

### Key Takeaways {#%E2%9C%85-key-takeaways}

- **Code standard = team-agreed conventions + best practices**
- Working by code standard **improves maintainability, readability, and team efficiency**
- **Linters + formatters** enforce code standards automatically
- **CI/CD + pre-commit hooks** ensure compliance at all stages

> Senior Tip:
> Think of code standards as **a contract between developers**—breaking it should be deliberate and justified, not accidental.


## Minimal executable standard

This independent Node24.18.0/ESLint10.13.0/TypeScript5.9.3 fixture uses ESM JavaScript with JSDoc typechecking. It deliberately needs no TS parser or React plugin. A real TS/TSX app must configure compatible parsers/plugins and test those file globs separately; formatting does not enable strict compiler checks. Preserve existing Autocode build/test configuration in actual submissions.

Create an isolated directory with these files; install the exact ESLint/TypeScript dev versions, retain its lockfile and use npm ci for a subsequent fresh install. The notes project's own configuration is unchanged. For an untrusted dependency tree, review lifecycle scripts before install; npm ci can run scripts and is not a sandbox.

<<< ../../workbench/engineering/quality/standard/eslint.config.mjs{js}

<<< ../../workbench/engineering/quality/standard/package.json{json}

The JSON block above is package.json. The following is tsconfig.json:

<<< ../../workbench/engineering/quality/standard/tsconfig.json{json}

Use this tsconfig.build.json to emit only after the same source checks:

<<< ../../workbench/engineering/quality/standard/tsconfig.build.json{json}

<<< ../../workbench/engineering/quality/standard/src/add.js{js}

<<< ../../workbench/engineering/quality/standard/test/add.test.js{js}

Run npm run check. The && chain stops at the first nonzero exit; do not append an unconditional success command that hides failures. Negative controls: append an unused declaration and require lint to fail; restore it. Append add('wrong',1) and require typecheck to fail even though lint can pass; restore it. Change the returned operation to subtraction and require the behavior test to fail; restore it.

Remove/add files under dist only as owned build output in this scratch fixture; a passing test against src does not independently prove the emitted artifact's execution. Inspect/run the emitted export as another build smoke check.


References checked2026-10-24: [ESLint flat config](https://eslint.org/docs/latest/use/configure/configuration-files), [TypeScript checkJs](https://www.typescriptlang.org/tsconfig/checkJs.html), [npm ci and lifecycle behavior](https://docs.npmjs.com/cli/v11/commands/npm-ci/), [Node test runner](https://nodejs.org/download/release/v24.18.0/docs/api/test.html). Browser/React, coverage, dependency/security scanning and actual CI execution are additional distinct checks, not covered by this tiny lab.


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/quality/What_is_code_standard_What_code_standard_is_on_your_current_project_Should_we_always_work_by_code_standard_Have_you_used_linters_and_do_you_have_any_experience_in_configuring_them.md). All learner practice remains outstanding.
