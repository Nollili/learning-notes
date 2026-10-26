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

This is a **client Vite project example** on GitLab CI, not this notes repository's active pipeline. Its package must define lint/typecheck/test:unit/test:integration/build scripts and have a compatible Node24 toolchain/lockfile. Each job is isolated. Node services use their actual server build artifact and integration smoke test instead of the client HTML check.

```yaml
default:
  image: node:24
  before_script:
    - npm ci --cache .npm --prefer-offline
  cache:
    key:
      files: [package-lock.json]
    paths: [.npm/]

stages: [validate, build, verify]

lint:
  stage: validate
  script: [npm run lint]

typecheck:
  stage: validate
  script: [npm run typecheck]

unit-tests:
  stage: validate
  script: [npm run test:unit -- --run]

integration-tests:
  stage: validate
  script: [npm run test:integration -- --run]

build:
  stage: build
  script: [npm run build]
  artifacts:
    paths: [dist/]
    expire_in: 1 week

artifact-presence:
  stage: verify
  before_script: [] # No npm package is used in this small check.
  needs:
    - job: build
      artifacts: true
  script:
    - test -s dist/index.html
```

The --run flags assume this client example uses Vitest scripts; Jest already runs once in ordinary CI, so do not transplant that flag into an Autocode Jest template. Node24 image tags move within the major: pin a tested patch/digest plus lockfile for reproducible production CI. A package cache can miss safely; npm ci installs in every job that needs dependencies. Cache .npm downloads rather than treating another job's node_modules as a reliable handoff. Artifacts carry this exact build's dist into the consumer job. needs explicitly selects its producer; do not mix needs and dependencies in one job.

The final job checks artifact availability only, not functional UI behavior. A real promotion adds an owned browser/integration smoke test against the same artifact and a documented deployment/rollback contract. Keep build identity/hash with it and promote the tested output rather than rebuild under a different environment. Do not upload environment secrets/private source maps as public artifacts; see the [source-map lifecycle](../React/build_tools.md#source-maps-generate-privately-then-verify-an-actual-mapped-failure). No deployment, account action or remote pipeline run is performed by this note.

* **Fail-fast:** If linting or tests fail, the pipeline stops, preventing broken code from merging or deploying.

---

## 4️⃣ Best Practices

1. **Run tests in parallel** where possible to speed up CI.
2. **Cache package downloads** keyed by lockfile/runtime policy; transfer required build output with explicit artifacts. Every npm job still establishes its own dependencies.
3. **Separate critical and optional tests**:

   * Critical: Unit + integration → block merge
   * Risk-selected E2E: critical journey failures block promotion; noncritical exploratory suites may be advisory with a documented owner/rationale. Browser tests are not automatically optional just because they are E2E.
4. **Keep tests deterministic and fast**.
5. **Include code coverage reporting** for quality tracking.

---

### ✅ Summary

* Running tests in CI/CD ensures **safe integration and deployment**.
* Unit, integration, and E2E tests form a **layered safety net**.
* Test automation reduces **manual effort, errors, and regressions**, improving developer confidence and release speed.

> 💡 Senior Tip:
> Think of tests in CI/CD as a **gatekeeper**: no code passes to staging or production without passing automated validation.



## Isolation and failure drill

In a separate local fixture, create a tiny dependency-backed build and run it in a fresh job directory with no node_modules: it must fail until that job installs/restores its dependencies. Copy only the declared artifact into a second fresh directory; an artifact-presence check must pass after transfer and fail when the artifact is absent. Delete the package cache and require the locked install to succeed anyway. Force lint/type/test/build failures one at a time and require a nonzero pipeline outcome; never append `|| true` or lose status through an unchecked pipe. Run the actual configuration through GitLab's CI lint tool in learner practice and retain its result. Local YAML parsing alone does not validate service semantics or remote runners.

References checked2026-10-21: [GitLab artifacts](https://docs.gitlab.com/ci/jobs/job_artifacts/), [needs](https://docs.gitlab.com/ci/yaml/needs/), [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/). Learner runner/deployment checks remain required.
