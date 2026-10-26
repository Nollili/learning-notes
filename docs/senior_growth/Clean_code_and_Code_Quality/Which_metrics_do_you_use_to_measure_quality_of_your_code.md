# Which metrics do you use to measure quality of your code?

# 📊 Code Quality Metrics

Measuring code quality is essential for **maintainability, reliability, and scalability**. These are candidate signals for a project; they are not a claim of personal project experience or universal thresholds:

---

## 1️⃣ Code Coverage

- **Definition:** Percentage of code executed by automated tests.
- **Tools:** Jest, Vitest, Mocha + NYC/Istanbul, SonarQube
- **Example starting point:** 80% coverage may be a team gate, not a universal quality target. Select line/branch/function thresholds based on risk and exclusions.
- **Why important:** Shows which instrumented code executed; assertions and negative cases determine whether important behavior was checked.

---

## 2️⃣ Cyclomatic Complexity

- **Definition:** Measures the number of **independent paths** through a function or method.
- **Tools:** SonarQube, ESLint plugins, Plato
- **Example review trigger:** complexity above 10 can prompt inspection; tool counting rules and domain complexity matter.
- **Why important:** High complexity increases **risk of bugs and maintenance difficulty**.

---

## 3️⃣ Code Duplication

- **Definition:** Percentage of repeated code across the codebase.
- **Tools:** SonarQube, PMD, ESLint plugins
- **Example review trigger:** 5% duplicated syntax is a diagnostic, not a universal failure threshold; duplicated domain knowledge matters more.
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
- **Why important:** Highlights code worth inspecting. Tool-estimated debt is based on configured remediation estimates, not a forecast of actual team delivery time.

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
| Code coverage | Jest, Vitest, SonarQube | Risk-based thresholds; 80% only an example | Executed code, not assertion quality |
| Cyclomatic complexity | SonarQube, ESLint | Contextual review trigger; 10 example | Inspect branching and change risk |
| Code duplication | SonarQube | Contextual review trigger; 5% example | Inspect shared domain knowledge |
| Linting | ESLint, Prettier | 0 errors | Consistent style |
| Test pass rate | Jest, Cypress | 100% | Prevent regressions |
| Security | Snyk, SonarQube | No critical issues | Secure code |
| Maintainability | SonarQube | High rating | Reduce technical debt |
| Performance | Lighthouse | Optimized | Better UX |

---

### ✅ Key Takeaways

- **Quality metrics** provide signals that need behavioral evidence and context.
- They help **detect risks early**, enforce standards, and improve maintainability.
- Use **CI/CD pipelines** to enforce these metrics automatically for every merge.

> 💡 Senior Tip:  
> Focus on **meaningful metrics**—coverage alone isn’t enough; combine with complexity, duplication, and maintainability to get a full picture.


## Turn a signal into a decision

For a critical authorization or payment invariant, require direct allowed/denied/boundary tests even if overall coverage exceeds a gate. For generated adapters, document exclusions instead of inflating the denominator invisibly. A high-complexity parser may need clearer state transitions and property tests; splitting it into many trivial functions just to lower a score can hide the same complexity. A shared tax rule deserves one authority, while repeated multiplication across unrelated concepts need not be unified.

The [executed TDD feature](../Testing/TDD_-_pros_and_cons(red,_green,_refactor).md#config-tdd) records 3 pass/5 fail for a bad stub and 8 pass after implementation/refactor. Those tests assert contract boundaries and failures; no coverage percentage was measured for that fixture. The passing suite initially needed an additional newline edge case, demonstrating why “all tests pass” cannot prove completeness. A retry that turns red into green without investigating can conceal a flaky test; retain first-run failures and report retries separately from the eligible first-run pass rate.

Security scanner results identify known signatures/advisories; zero reported vulnerabilities does not prove the absence of exploitable issues. Review reachability, authorization, data exposure, runtime configuration and remediation urgency. Performance needs explicit device/network/workload, percentiles and observation window, as in [the quality scenarios](../EngX_Quality/Could_please_the_differentiate_between_Functional_and_Non-functional_reqs(NFRs),_How_and_when_to_take_them_into_consideration.md#quality-scenarios-and-acceptance-evidence).

**Exercise acceptance:** choose one risk, record a baseline and a candidate threshold with denominator/exclusions, add a defect that a meaningful assertion catches, then show how the metric and actual behavior differ. Retain first-run failures, tool/version/config and a reasoned improvement decision. Do not report a tool's debt-hours as an engineering estimate; estimate the actual change with dependencies and uncertainty. Learner practice remains required. [Jest's official threshold configuration](https://jestjs.io/docs/configuration#coveragethreshold-object) explains enforceable gates; it does not choose an appropriate risk policy for the team.
