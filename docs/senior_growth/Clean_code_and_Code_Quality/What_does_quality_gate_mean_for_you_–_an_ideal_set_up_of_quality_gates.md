# What does quality gate mean for you – an ideal set up of quality gates?

## Quality Gate in Software Development {#%F0%9F%8F%81-quality-gate-in-software-development}

A **quality gate** is a set of **automated checks** that code must pass before it can be merged or deployed. It enforces the configured checks and limits; passing them does not prove overall safety, completeness or correct requirements.

---

## What a Quality Gate Means {#_1%EF%B8%8F%E2%83%A3-what-a-quality-gate-means}

- **Automated enforcement** of coding standards, tests, and metrics.
- Acts as a **“stoplight”**: code either **passes (green)** or **fails (red)** based on criteria.
- Usually implemented in **CI/CD pipelines** using tools like **SonarQube, ESLint, Stylelint, Prettier, Jest coverage, Cypress tests**, etc.

---

## Ideal Set Up for a Quality Gate {#_2%EF%B8%8F%E2%83%A3-ideal-set-up-for-a-quality-gate}

### Code Quality Metrics {#%E2%9C%85-code-quality-metrics}

| Metric | Illustrative policy — justify for the project |
|--------|--------------------|
| **Code coverage** | ≥ 80% unit & integration coverage |
| **Test pass rate** | 100% passing |
| **Static code analysis** | No critical or blocker issues; low warning count |
| **Code duplication** | < 5% duplicated code |
| **Cyclomatic complexity** | Reasonable limits per function/module (e.g., < 10) |
| **Linting & formatting** | No linting errors; consistent code style |

### Security & Vulnerability Checks {#%E2%9C%85-security-vulnerability-checks}

- No **high/critical security vulnerabilities** in dependencies.
- Enforce **OWASP best practices** (XSS, injection prevention, etc.).
- Check **secret keys or tokens** are not exposed.

### Build & Deployment Checks {#%E2%9C%85-build-deployment-checks}

- Successful **build pipeline**.
- All **unit, integration, and E2E tests pass**.
- Optional: **Performance tests** (e.g., bundle size, load times).

### Documentation & Best Practices {#%E2%9C%85-documentation-best-practices}

- PRs include **description, testing instructions, and changelog**.
- Code is **readable, modular, and follows design patterns**.
- **Commit messages** follow team conventions.

---

## How It Works in CI/CD {#_3%EF%B8%8F%E2%83%A3-how-it-works-in-ci-cd}

1. Developer pushes a branch → CI pipeline triggers.
2. Quality gate runs:
   - Linting & formatting
   - Static code analysis
   - Unit & integration tests
   - Security checks
   - Coverage thresholds
3. Pipeline fails if **any criteria are not met** → PR cannot be merged.
4. Once all configured criteria pass → review required evidence and repository policy; untested behavior and incorrect requirements remain risks.

---

## Benefits of a Quality Gate {#_4%EF%B8%8F%E2%83%A3-benefits-of-a-quality-gate}

- **Blocks detected violations** before production.
- **Encourages best practices** across the team.
- **Early detection of issues** reduces technical debt.
- **Confidence in CI/CD deployments**.
- Supports **continuous improvement** with measurable metrics.

---

### Key Takeaways {#%E2%9C%85-key-takeaways}

- Quality gates are **automated checkpoints** for code quality, testing, and security.
- A project-specific setup might enforce:
  - ≥80% coverage, all tests passing
  - No critical/static analysis issues
  - Linting, formatting, and modular code
  - Security and dependency checks
  - Optional performance benchmarks
- Quality gates **save time, reduce bugs, and enforce maintainable, reliable software**.

> Senior Tip:
> Required gates need clear ownership and an audited exceptional-change policy; silently bypassing a failing check defeats its purpose.


## A runnable gate with explicit limits

Use the [complete minimal standard fixture](./What_is_code_standard_What_code_standard_is_on_your_current_project_Should_we_always_work_by_code_standard_Have_you_used_linters_and_do_you_have_any_experience_in_configuring_them.md#minimal-executable-standard): npm run check executes lint, strict JavaScript typechecking, behavior tests and emit in sequence. Run it in a fresh locked practice checkout for CI parity. Hooks can be bypassed; configure the CI job/status as required in the actual repository. This document supplies executable local commands, not a claim that a hosted workflow or branch protection is installed.

Coverage≥80%, duplication<5% and complexity<10 above are examples, not universal ideals. Coverage shows execution, not assertions or correct requirements; test a meaningful boundary rather than manufacture coverage. Pin measurement tool/version, scope/generated exclusions and regression policy. A dependency audit finding requires triage of affected paths and a tracked remediation/exception; no findings does not establish no vulnerabilities. Security controls and critical behavior need their own threat/acceptance evidence.


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/quality/What_does_quality_gate_mean_for_you_%E2%80%93_an_ideal_set_up_of_quality_gates.md). All learner practice remains outstanding.
