# 🧪 Running Tests within CI/CD

Yes, running tests is a **core part of the CI/CD pipeline**. Automated testing ensures **code quality, correctness, and stability** before changes reach staging or production.

---

## 1️⃣ Why Tests in CI/CD Are Important

- **Immediate Feedback:** Detect failing code as soon as it’s pushed.
- **Prevent Regressions:** Catch bugs early to avoid breaking production.
- **Maintain Confidence:** Ensure that merges and deployments are safe.
- **Enforce Quality Standards:** Code cannot be deployed unless tests pass.

---

## 2️⃣ Types of Tests Typically Run in CI/CD

| Test Type                 | Tool Example             | Purpose                                                                 |
|---------------------------|------------------------|-------------------------------------------------------------------------|
| **Unit Tests**            | Vitest, Jest           | Test individual functions, classes, or modules. Fast feedback.          |
| **Integration Tests**     | Vitest, Jest, Supertest | Test combined modules, API endpoints, or database interactions.        |
| **End-to-End (E2E) Tests** | Playwright, Cypress     | Test the full user workflow in the browser or app environment.         |
| **Linting & Type Checks** | ESLint, TypeScript      | Ensure code style and type safety before further processing.           |
| **Static Code Analysis**  | SonarQube               | Detect code smells, vulnerabilities, or coverage issues.               |

> 💡 Note: Unit and linting tests usually run on **every commit**, while E2E tests might run on **feature merges or staging deployments** due to longer runtime.

---

## 3️⃣ Example CI Pipeline with Tests

```yaml
stages:
  - lint
  - test
  - build
  - deploy

lint:
  stage: lint
  script:
    - npm ci
    - npm run lint

unit-tests:
  stage: test
  script:
    - npm ci
    - npm run test:unit

integration-tests:
  stage: test
  script:
    - npm ci
    - npm run test:integration

build:
  stage: build
  script:
    - npm run build

deploy:
  stage: deploy
  script:
    - ./deploy.sh
  when: manual  # or automatic for Continuous Deployment
````

* **Fail-fast:** If linting or tests fail, the pipeline stops, preventing broken code from merging or deploying.

---

## 4️⃣ Best Practices

1. **Run tests in parallel** where possible to speed up CI.
2. **Use caching** (e.g., `node_modules`) to reduce install/build time.
3. **Separate critical and optional tests**:

   * Critical: Unit + integration → block merge
   * Optional: E2E → block merge only if necessary
4. **Keep tests deterministic and fast**.
5. **Include code coverage reporting** for quality tracking.

---

### ✅ Summary

* Running tests in CI/CD ensures **safe integration and deployment**.
* Unit, integration, and E2E tests form a **layered safety net**.
* Test automation reduces **manual effort, errors, and regressions**, improving developer confidence and release speed.

> 💡 Senior Tip:
> Think of tests in CI/CD as a **gatekeeper**: no code passes to staging or production without passing automated validation.

