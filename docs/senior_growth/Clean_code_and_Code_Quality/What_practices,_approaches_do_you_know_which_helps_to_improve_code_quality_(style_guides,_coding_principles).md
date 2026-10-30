# What practices/approaches do you know which helps to improve code quality? (style guides, coding principles)

## Practices & Approaches to Improve Code Quality {#%F0%9F%9B%A0-practices-approaches-to-improve-code-quality}

Improving code quality is not just about writing fewer bugs—it’s about making code **readable, maintainable, consistent, and reliable**. There are several practices, principles, and tools that help achieve this.

---

## Coding Principles {#_1%EF%B8%8F%E2%83%A3-coding-principles}

| Principle | Description |
|-----------|-------------|
| **SOLID** | Five OOP principles: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion. Helps create modular, maintainable code. |
| **DRY (Don’t Repeat Yourself)** | Avoid code duplication; reuse logic where appropriate. |
| **KISS (Keep It Simple, Stupid)** | Prefer simple, understandable solutions over complex ones. |
| **YAGNI (You Aren’t Gonna Need It)** | Avoid writing code/features that aren’t currently required. |
| **Composition over Inheritance** | Favor modular composition instead of deep inheritance hierarchies for flexibility and maintainability. |
| **Immutability & Functional Programming** | Reduce side effects, increase predictability and testability. |
| **Separation of Concerns** | Keep logic, presentation, and data management separated. |
| **Fail Fast / Early Return** | Make code robust by handling errors and invalid states early. |

---

## Style Guides & Conventions {#_2%EF%B8%8F%E2%83%A3-style-guides-conventions}

- **ESLint + typescript-eslint**: Enforce JavaScript/TypeScript correctness and team rules; TSLint is deprecated historical tooling.
- **Prettier**: Automatic formatting for consistent code style.
- **Airbnb / Google / Standard JS style guides**: Widely adopted conventions for JavaScript.
- **Team-specific guidelines**: Naming, folder structure, comment rules.
- **Commit message conventions**: e.g., Conventional Commits for readability and automated changelogs.

**Benefits:**  
- Reduces cognitive load for team members.  
- Makes code review easier and faster.  
- Prevents trivial style disagreements.

---

## Testing Practices {#_3%EF%B8%8F%E2%83%A3-testing-practices}

- **Unit tests:** Verify core logic in isolation.
- **Integration tests:** Check interaction between modules.
- **End-to-end (E2E) tests:** Validate workflows and critical user paths.
- **TDD (Test-Driven Development):** Write tests before implementing code for better design.
- **Code coverage monitoring:** Ensure critical paths are tested.

**Benefits:**  
- Detects bugs early.  
- Increases confidence in refactoring.  
- Promotes modular, testable code.

---

## Code Review Practices {#_4%EF%B8%8F%E2%83%A3-code-review-practices}

- **Peer reviews:** Catch logic errors, style inconsistencies, and potential performance/security issues.  
- **Pull request templates:** Encourage meaningful descriptions, testing instructions, and checklist adherence.  
- **Pair programming / mob programming:** Share knowledge and enforce standards.  

**Benefits:**  
- Knowledge sharing.  
- Early detection of problems.  
- Improved code consistency.

---

## Tooling for Quality Assurance {#_5%EF%B8%8F%E2%83%A3-tooling-for-quality-assurance}

| Tool | Purpose |
|------|---------|
| **SonarQube** | Static code analysis, technical debt, security vulnerabilities |
| **ESLint / Stylelint** | Enforce coding standards |
| **Prettier** | Auto-formatting |
| **Jest / Vitest / Cypress / Playwright** | Automated testing |
| **Dependabot / Snyk** | Security monitoring and dependency management |
| **Webpack Bundle Analyzer / Lighthouse** | Performance and bundle size analysis |

---

## Refactoring Practices {#_6%EF%B8%8F%E2%83%A3-refactoring-practices}

- Regularly **improve readability and modularity** without changing functionality.
- Apply **design patterns** where appropriate.
- Remove **dead code**, reduce **complex functions**, and improve naming.

---

### Key Takeaways {#%E2%9C%85-key-takeaways}

- **Coding principles + style guides** → consistent, maintainable code.  
- **Automated testing** → reduces bugs and improves confidence.  
- **Code reviews** → knowledge sharing, early bug detection.  
- **Refactoring** → keeps code clean and scalable.  
- **Tooling & CI/CD** → enforce quality standards automatically.

> Senior Tip:
> Quality is a **team responsibility**, not just a developer task. Combine principles, tools, and reviews to maintain a **healthy, scalable codebase**.


## Worked static gates and a small domain refactor

### Separate compiler, lint and format responsibilities

Primary lab: TypeScript5.9, Node24, ESLint flat configuration and compatible typescript-eslint. The following uses the official defineConfig/projectService configuration shape; pin a compatible ESLint/typescript-eslint/plugin set and lockfile in the practice project. It is not a request to add these tools to this VitePress repository. Do not assume an old eslintrc/TSLint file is a current flat config.

<<< ../../workbench/engineering/quality/typed-gates/eslint.config.mjs{js}

```json
{
  "compilerOptions": {
    "target": "ES2022", "module": "ESNext", "moduleResolution": "Bundler",
    "strict": true, "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true, "noEmit": true, "types": []
  },
  "include": ["src/**/*.ts"]
}
```

```json
{
  "scripts": {
    "typecheck": "tsc -p tsconfig.json",
    "lint": "eslint src --max-warnings=0",
    "format:check": "prettier --check src",
    "quality": "npm run typecheck && npm run lint && npm run format:check"
  }
}
```

ProjectService obtains type information from the nearest applicable tsconfig. If a linted file is outside that project, fix the scope/configuration rather than broadly enabling expensive default-project inference. This TS-only example deliberately does not claim React hooks/accessibility, browser globals, Node ambient types or JS files are covered; add appropriate scoped rules/types to the actual consumer. A transpiling build can pass while typecheck fails. Type-aware linting costs more than syntax-only linting; run required rules at the right feedback boundary and measure duration.

Failure drill: in separate scratch variants, `export const retries: number = '3'` must fail tsc; `export function start() { Promise.resolve('ready'); }` typechecks but must fail no-floating-promises. The second example has no rejecting operation, but exposes an ownership pattern the rule checks. With real rejecting work, await/return it or attach an explicit failure handler according to the API; prefixing void can silence a lint rule without handling rejection.

A formatting-only change should fail format:check without a semantic type failure. Force each command to fail in turn and require quality to stop with a nonzero status; do not hide it behind `|| true`. Hooks provide convenience; CI enforces the same commands independently.

### Preserve a defined domain contract while extracting names

Suppose a toy order total applies a10% discount when its **whole-order** subtotal reaches10,000 integer minor units, rounding once at the order level. Inputs have already been validated as nonnegative safe-integer priceCents and positive integer quantities with a safe total. This example is about refactoring that specified behavior, not changing the monetary/rounding policy or validating external input.

```ts
export type Line = { priceCents: number; quantity: number };
export function totalBefore(lines: readonly Line[]): number {
  let sum = 0;
  for (const line of lines) sum += line.priceCents * line.quantity;
  if (sum >= 10_000) sum = Math.round(sum * 0.9);
  return sum;
}
function subtotal(lines: readonly Line[]): number {
  return lines.reduce((sum, line) => sum + line.priceCents * line.quantity, 0);
}
function applyOrderDiscount(cents: number): number {
  return cents >= 10_000 ? Math.round(cents * 0.9) : cents;
}
export function totalAfter(lines: readonly Line[]): number {
  return applyOrderDiscount(subtotal(lines));
}
```

The extraction names two independently meaningful decisions; it does not introduce an abstract factory or one class per discount. Compare empty order, zero-price line, quantity multiplication, just below/at/above the threshold and rounding cases. Assert inputs remain unchanged. Shared before/after equality is useful for a refactor, but add independently specified expected totals so a shared bug cannot pass both implementations.

Test invalid data at the existing validation boundary; adding new rejection here would be a behavior change requiring a separate acceptance decision. Integer storage alone does not define tax/discount rounding across currencies; use the product's explicit policy.

**Review trade-offs:** extra small helpers can clarify domain language but arbitrary one-line extraction may scatter related logic. DRY means shared knowledge, not merging similar code with different reasons to change. Keep the simplest readable implementation when abstraction adds no useful boundary. Use a measured hotspot/profile before claiming this refactor improves performance. Do not use coverage/complexity thresholds as substitutes for checking the discount policy.


References checked2026-10-21: [typed linting](https://typescript-eslint.io/getting-started/typed-linting/), [ESLint flat files](https://eslint.org/docs/latest/use/configure/configuration-files), [Prettier check](https://prettier.io/docs/cli#--check), [TypeScript config](https://www.typescriptlang.org/tsconfig/). Full ESLint/Prettier execution needs the practice project's compatible installed packages; syntax validation alone is not a lint pass.


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/quality/What_practices%2C_approaches_do_you_know_which_helps_to_improve_code_quality_%28style_guides%2C_coding_principles%29.md). All learner practice remains outstanding.
