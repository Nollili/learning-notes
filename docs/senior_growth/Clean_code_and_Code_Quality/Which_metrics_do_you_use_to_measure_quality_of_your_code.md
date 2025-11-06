# Which metrics do you use to measure quality of your code?

# 📊 Code Quality Metrics

Measuring code quality is essential for **maintainability, reliability, and scalability**. Here are the key metrics I use in projects:

---

## 1️⃣ Code Coverage

- **Definition:** Percentage of code executed by automated tests.
- **Tools:** Jest, Vitest, Mocha + NYC/Istanbul, SonarQube
- **Goal:** ≥ 80% meaningful coverage
- **Why important:** Ensures critical logic is tested and reduces regression risk.

---

## 2️⃣ Cyclomatic Complexity

- **Definition:** Measures the number of **independent paths** through a function or method.
- **Tools:** SonarQube, ESLint plugins, Plato
- **Goal:** Keep complexity per function ≤ 10
- **Why important:** High complexity increases **risk of bugs and maintenance difficulty**.

---

## 3️⃣ Code Duplication

- **Definition:** Percentage of repeated code across the codebase.
- **Tools:** SonarQube, PMD, ESLint plugins
- **Goal:** < 5% duplication
- **Why important:** Reduces maintenance overhead and ensures DRY principles.

---

## 4️⃣ Linting / Style Compliance

- **Definition:** Adherence to coding standards and style guides.
- **Tools:** ESLint, Prettier, Stylelint
- **Goal:** Zero linting errors
- **Why important:** Consistent code improves readability and reduces cognitive load.

---

## 5️⃣ Test Pass Rate

- **Definition:** Percentage of tests passing in the CI pipeline.
- **Tools:** Jest, Vitest, Cypress, Playwright
- **Goal:** 100% passing
- **Why important:** Failing tests indicate potential regressions or unstable code.

---

## 6️⃣ Security Vulnerabilities

- **Definition:** Detection of known vulnerabilities in code or dependencies.
- **Tools:** SonarQube, Snyk, npm audit, Dependabot
- **Goal:** Zero critical/high vulnerabilities
- **Why important:** Prevents security issues and production risks.

---

## 7️⃣ Maintainability / Technical Debt

- **Definition:** A composite metric often calculated by tools like SonarQube.
- **Goal:** High maintainability rating, low technical debt
- **Why important:** Ensures long-term sustainability of the codebase.

---

## 8️⃣ Performance / Bundle Metrics (Optional for Frontend)

- **Definition:** Measures load time, bundle size, and runtime performance.
- **Tools:** Webpack Bundle Analyzer, Lighthouse, Chrome DevTools
- **Goal:** Optimized bundles, fast first load
- **Why important:** Impacts user experience and scalability.

---

### ✅ Summary Table

| Metric | Tool | Goal | Importance |
|--------|------|------|------------|
| Code coverage | Jest, Vitest, SonarQube | ≥80% | Tests critical logic |
| Cyclomatic complexity | SonarQube, ESLint | ≤10 | Easier to maintain, fewer bugs |
| Code duplication | SonarQube | <5% | DRY principle, less maintenance |
| Linting | ESLint, Prettier | 0 errors | Consistent style |
| Test pass rate | Jest, Cypress | 100% | Prevent regressions |
| Security | Snyk, SonarQube | No critical issues | Secure code |
| Maintainability | SonarQube | High rating | Reduce technical debt |
| Performance | Lighthouse | Optimized | Better UX |

---

### ✅ Key Takeaways

- **Quality metrics** provide measurable assurance of code health.
- They help **detect risks early**, enforce standards, and improve maintainability.
- Use **CI/CD pipelines** to enforce these metrics automatically for every merge.

> 💡 Senior Tip:  
> Focus on **meaningful metrics**—coverage alone isn’t enough; combine with complexity, duplication, and maintainability to get a full picture.
