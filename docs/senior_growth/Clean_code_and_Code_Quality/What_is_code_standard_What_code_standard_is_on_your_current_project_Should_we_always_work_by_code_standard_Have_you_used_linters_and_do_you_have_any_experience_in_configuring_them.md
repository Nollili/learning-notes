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

## 2️⃣ Illustrative React/TypeScript Standard — Verify Against the Actual Project

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


## Minimal executable standard

This independent Node24.18.0/ESLint10.13.0/TypeScript5.9.3 fixture uses ESM JavaScript with JSDoc typechecking. It deliberately needs no TS parser or React plugin. A real TS/TSX app must configure compatible parsers/plugins and test those file globs separately; formatting does not enable strict compiler checks. Preserve existing Autocode build/test configuration in actual submissions.

Create an isolated directory with these files; install the exact ESLint/TypeScript dev versions, retain its lockfile and use npm ci for a subsequent fresh install. The notes project's own configuration is unchanged. For an untrusted dependency tree, review lifecycle scripts before install; npm ci can run scripts and is not a sandbox.

```js
// eslint.config.mjs
export default [{
  files: ['src/**/*.js'],
  languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  rules: { 'no-undef': 'error', 'no-unused-vars': 'error', eqeqeq: ['error', 'always'] },
}];
```

```json
{
  "name": "quality-gate-study",
  "private": true,
  "type": "module",
  "scripts": {
    "lint": "eslint src --max-warnings=0",
    "typecheck": "tsc -p tsconfig.json",
    "test": "node --test",
    "build": "tsc -p tsconfig.build.json",
    "check": "npm run lint && npm run typecheck && npm run test && npm run build"
  },
  "devDependencies": { "eslint": "10.13.0", "typescript": "5.9.3" }
}
```

The JSON block above is package.json. The following is tsconfig.json:

```json
{
  "compilerOptions": {
    "target": "ES2022", "module": "NodeNext", "allowJs": true, "checkJs": true,
    "strict": true, "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true, "noEmit": true
  },
  "include": ["src/**/*.js"]
}
```

Use this tsconfig.build.json to emit only after the same source checks:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": { "noEmit": false, "outDir": "dist" }
}
```

```js
// src/add.js
/** @param {number} a @param {number} b */
export function add(a, b) { return a + b; }
```

```js
// test/add.test.js — scratch lab only; never add to an Autocode src/tests directory
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { add } from '../src/add.js';
test('adds zero, positive and negative inputs', () => {
  assert.equal(add(0, 0), 0);
  assert.equal(add(2, 3), 5);
  assert.equal(add(-2, 1), -1);
});
```

Run npm run check. The && chain stops at the first nonzero exit; do not append an unconditional success command that hides failures. Negative controls: append an unused declaration and require lint to fail; restore it. Append add('wrong',1) and require typecheck to fail even though lint can pass; restore it. Change the returned operation to subtraction and require the behavior test to fail; restore it. Remove/add files under dist only as owned build output in this scratch fixture; a passing test against src does not independently prove the emitted artifact's execution. Inspect/run the emitted export as another build smoke check.

**Acceptance:** all four baseline commands pass and each negative control blocks its intended stage. Inspect matched file paths, effective config and actual exit codes. Explain why ignored files, wrong globs, warnings allowed by default, missing TS parsing, swallowed errors and tests that never execute can make a green gate misleading. Every rule needs a reason and deliberate exception policy; do not add arbitrary complexity/coverage thresholds merely to appear strict.

References checked2026-10-24: [ESLint flat config](https://eslint.org/docs/latest/use/configure/configuration-files), [TypeScript checkJs](https://www.typescriptlang.org/tsconfig/checkJs.html), [npm ci and lifecycle behavior](https://docs.npmjs.com/cli/v11/commands/npm-ci/), [Node test runner](https://nodejs.org/download/release/v24.18.0/docs/api/test.html). Browser/React, coverage, dependency/security scanning and actual CI execution are additional distinct checks, not covered by this tiny lab.
