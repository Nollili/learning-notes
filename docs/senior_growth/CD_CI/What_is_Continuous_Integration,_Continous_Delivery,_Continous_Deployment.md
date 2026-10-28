# What is Continuous Integration, Continous Delivery, Continous Deployment?

## 🔹 CI/CD Concepts: Continuous Integration, Delivery, and Deployment

CI/CD is a set of **practices to automate the build, testing, and delivery of software**, improving quality and reducing release risk. Each part focuses on a different stage of the process.

---

## 1️⃣ Continuous Integration (CI)

**Definition:**  
Continuous Integration is the practice of **frequently integrating code changes into a shared repository**. Every integration triggers **automated builds and tests**.

### Key Points:
- Integrate multiple times a day to **catch conflicts early**.
- Run **unit tests, linting, type checks** automatically.
- Detect bugs **early in the development cycle**.

### Benefits:
- Faster feedback to developers.
- Reduced integration issues.
- Maintains a **stable main branch**.

**Example Flow:**
1. Developer pushes code to feature branch.
2. CI pipeline runs:
   - Linting
   - Unit tests
   - Type checking
   - Build
3. Feedback is provided automatically.

---

## 2️⃣ Continuous Delivery (CD)

**Definition:**  
Continuous Delivery ensures that changes are kept in a releasable state through the delivery process; the production release decision remains explicit and need not be automatic.

### Key Points:
- Build, test, and prepare code for **staging or production**.
- Deployment to production is **controlled**, not automatic.
- Focus is on **reliability and readiness**.

### Benefits:
- Reduces manual steps in release.
- Ensures **production-ready builds** at all times.
- Minimizes risk of deployment failures.

**Example Flow:**
1. CI pipeline passes.
2. Build artifacts are deployed to **staging environment**.
3. The authorized release decision triggers the tested automated deployment; delivery does not require a person to copy files.

---

## 3️⃣ Continuous Deployment (CD)

**Definition:**  
Continuous Deployment takes Continuous Delivery **one step further**: eligible changes that pass the complete configured release gates are automatically deployed to production.

### Key Points:
- No manual approval is needed.
- Strong automated testing and monitoring is required.
- Focus is on **rapid and safe delivery**.

### Benefits:
- Immediate delivery of new features and fixes.
- Faster feedback from production.
- Encourages **small, incremental changes**.

**Example Flow:**
1. CI pipeline passes.
2. Artifact is automatically deployed to **production**.
3. Monitoring tools check for issues; rollback if needed.

---

## 4️⃣ Key Differences

| Aspect                 | CI                          | Continuous Delivery          | Continuous Deployment        |
|------------------------|----------------------------|-----------------------------|-----------------------------|
| Goal                   | Integrate code frequently   | Ensure deployable builds    | Deploy automatically        |
| Deployment             | Integration alone does not prescribe deployment; it can coexist with either CD policy | Explicit release decision, usually automated deployment execution | Automatic release/deployment after configured gates |
| Feedback speed         | Depends on integration/check duration | Includes release-decision waiting time | Depends on gates and production observation |
| Risk                   | Depends on change, checks and operational controls | Depends on change, checks and operational controls | Depends on change, gates and operational controls |

---

### ✅ Summary

- **CI:** Frequent integration + automated tests.  
- **Continuous Delivery:** keep changes releasable with an explicit production release decision and repeatable deployment execution.  
- **Continuous Deployment:** CI + automated deployment; code goes to production automatically.  

> 💡 Senior Tip:  
> The **main difference** between Delivery and Deployment is **manual vs automatic release to production**. Both require **strong CI and test automation** to be safe.

## Isolated jobs, artifact identity and safe rollback

An earlier job's installation/worktree is not implicitly shared with later jobs. Install required tooling/dependencies from the matching lockfile in each isolated consumer, or explicitly transfer the immutable artifact and its trusted identity. A dependency cache is an optimization, not proof of the tested/released bytes. Deploy the exact artifact verified in the previous stage, with environment-specific secrets/configuration injected through controlled runtime mechanisms.

Use the [executed artifact and PostgreSQL compatibility lab](../../node-js/release-artifact-compatibility.md) for the primary example. It creates/verifies/extracts actual tar artifacts in distinct job directories and executes old/bridge/new SQL contracts against an isolated real database. The lesson explains the workflow inputs/gates without claiming an unexecuted hosted YAML pipeline exists.

Passing unit tests does not prove production releasability: migration compatibility, authorization/configuration, health/traffic, monitoring and recovery gates still apply. Manual approval is a release decision and can trigger an automated deployment; “manual” does not require a person copying files. Reversing traffic/artifacts is safe only while old code remains compatible with current data/messages/config. V4-only writes can close that window before a column is dropped. Retain a tested rollback allowlist or plan forward repair, not a generic “redeploy old version” promise.


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/delivery/What_is_Continuous_Integration%2C_Continous_Delivery%2C_Continous_Deployment.md). All learner practice remains outstanding.
