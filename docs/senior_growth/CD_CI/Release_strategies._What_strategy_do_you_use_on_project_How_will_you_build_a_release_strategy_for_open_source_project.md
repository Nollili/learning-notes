# Release strategies. What strategy do you use on project? How will you build a release strategy for open source project?

## Release Strategies {#%F0%9F%9A%80-release-strategies}

A **release strategy** defines **how and when new versions of software are delivered** to users. Choosing the right strategy improves **stability, user experience, and developer workflow**.

---

## Common Release Strategies {#_1%EF%B8%8F%E2%83%A3-common-release-strategies}

### 1.1 Semantic Versioning (SemVer)
- Format: `MAJOR.MINOR.PATCH`
  - **MAJOR**: Breaking changes
  - **MINOR**: New features (backward compatible)
  - **PATCH**: Bug fixes (backward compatible)
- Example: `1.4.2`

 **Pros:**
- Clear communication of changes.
- Widely adopted in open source.

 **Cons:**
- Requires discipline in tagging and updating versions.

---

### 1.2 Feature Toggles / Flags
- Release new features **hidden behind toggles**.
- Can enable/disable features **per user, environment, or region**.

 **Pros:**
- Safe deployment of incomplete or risky features.
- Enables **gradual rollout**.

 **Cons:**
- Extra code complexity for managing flags.

---

### 1.3 Canary Releases
- Deploy new version to **a small subset of users** first.
- Monitor for errors before full rollout.

 **Pros:**
- Reduces risk of critical failures in production.

 **Cons:**
- Requires monitoring infrastructure and user segmentation.

---

### 1.4 Blue-Green Deployment
- Maintain **two identical environments**:
  - Blue (current production)
  - Green (new version)
- Switch traffic to Green when ready.

 **Pros:**
- Near-zero downtime.
- Fast traffic rollback only when the old application remains compatible with current data/configuration and side effects.

 **Cons:**
- More infrastructure needed.

---

### 1.5 Rolling Release
- A rolling deployment replaces application instances in batches while old/new versions coexist; this differs from a rolling-release version/support policy.
- Common in **SaaS platforms**.

 **Pros:**
- Smooth rollout with monitoring.
- Avoids mass-impact failures.

 **Cons:**
- Complex version management for users and servers.

---

### 1.6 Git Branching Strategies
- **Git Flow**:
  - `main`: production-ready
  - `develop`: integration branch
  - `feature/*`: feature branches
  - `release/*`: release preparation
- **GitHub Flow**:
  - `main`: always deployable
  - `feature/*`: merged via PR when ready

 **Pros:**
- Supports CI/CD pipelines.
- Helps organize work on large teams.

---

## Example Release Strategy (adapt to an actual project) {#_2%EF%B8%8F%E2%83%A3-example-release-strategy-adapt-to-an-actual-project}

- **Versioning:** Semantic Versioning (`MAJOR.MINOR.PATCH`)  
- **CI/CD Pipeline:**  
  - CI ensures code passes tests.  
  - CD deploys to **staging automatically**.  
  - Production deployment requires **manual approval** (Continuous Delivery).  
- **Branching:** One possible policy is Git Flow; a short-lived branch/trunk policy may fit a continuous delivery project better.  
- **Quality Checks:** Linting, unit tests, SonarQube, automated build.  
- **Deployment Monitoring:** Rollback if issues are detected.  

**Rationale:**  
- Ensures **stable production builds**.
- Enables **fast feature delivery** without compromising safety.
- Controlled manual approval for production mitigates risks.

---

## Release Strategy for an Open Source Project {#_3%EF%B8%8F%E2%83%A3-release-strategy-for-an-open-source-project}

Open source projects have additional considerations: **community usage, backward compatibility, and package managers**.

### Suggested Strategy:

1. **Semantic Versioning**  
   - MAJOR: breaking changes  
   - MINOR: new features  
   - PATCH: bug fixes

2. **Git Branching**
   - Choose a documented policy appropriate to maintainers/release lines.
   - A main branch with short-lived reviewed feature branches is sufficient for many projects; develop is not mandatory.

3. **Automated CI**
   - Run tests for **pull requests**.
   - Linting + type checks.

4. **Release Automation**
   - Use **GitHub Actions** to tag releases and publish to npm.
   - Generate **changelog** automatically from commit messages (e.g., `semantic-release`).

5. **Pre-Releases / Beta**
   - `1.0.0-beta.1` for experimental releases.
   - Allows **community testing** before full release.

6. **Documentation & Communication**
   - Update **CHANGELOG.md** for every release.
   - Clearly mark **breaking changes**.

---

### Summary {#%E2%9C%85-summary}

- **Internal project:** CI/CD + staging → manual production deploy → semantic versioning.  
- **Open source:** Semantic versioning + pre-releases + automated publishing + clear changelog.  
- **Key Goal:** Reduce risk, maintain stability, and communicate changes clearly to users.

> Senior Tip:
> Open source projects benefit from **automated release pipelines** with **pre-release tags**, allowing contributors to test before a stable release. This minimizes disruptions for end users.


## Backward compatibility includes writers and data

Application rollback changes an artifact/traffic route; it does not reverse committed database transformations, messages, payments or user edits. A down migration can recreate a dropped column's shape while losing its values. A snapshot/PITR restore has a recovery point and may omit legitimate later writes; test on an isolated target and reconcile before cutover. See the [database migration lab](../../node-js/module-08-postgresql-mikroorm.md#production-migration-design) for the primary PostgreSQL/MikroORM path.

For a name→display_name rename, keep one canonical field during each phase. A naive new-reader fallback to display_name can return stale data when old writers update only name. This compatibility sequence makes that failure explicit:

| Phase | Readers / writers | Canonical source | Rollback boundary |
|---|---|---|---|
| Old schema | V1 uses name | name | V1 |
| Expand nullable display_name | V1 and bridge V2; V2 writes both atomically, reads name | name | V1/V2 compatible; shadow may lag after V1 writes |
| Drain/block old-only writers, final guarded backfill | Bridge V2 only | name until verified cutover | Roll back to V2, not arbitrary V1 writers |
| New reads, dual writes | V3 reads display_name and writes both | display_name | V2 remains compatible while dual writes preserve name |
| Final artifact then contract | V4 reads/writes display_name only; remove all old readers/writers before dropping name | display_name | Once V4-only writes start, old readers can be stale; after drop V1/V2/V3 also lack required columns |

Close the old-reader rollback window **before V4-only writes begin**, even if the old column has not yet been dropped: name can become stale immediately. Restoring old-reader compatibility requires a separately guarded resynchronization, not simply retaining the old column.

Backfill in bounded resumable batches with a concurrency/version guard or a database-specific ownership protocol, then verify nulls, equality and invariants under real concurrent writes. A read of name followed later by an unguarded write to display_name can overwrite newer data. Do not switch canonical reads until old-only writers are prevented from returning and the final reconciliation succeeds. Review background jobs, consumers and scripts as writers too.

<<< ../../workbench/engineering/delivery/schema-model/release-compatibility.mjs{js}

This pure model intentionally does not implement migrations, atomic dual writes, locking, background jobs or deployment infrastructure. Its backfill is safe only under the stated no-concurrent-writers condition; the real migration needs the database-specific guard. Versions1–4 are the fixed lab fixtures, not user-provided API values. Show the compatibility matrix before running a rollback command, and enforce a tested allowlist of rollback artifacts in a real pipeline.


References checked2026-10-22: [PostgreSQL16 isolation](https://www.postgresql.org/docs/16/transaction-iso.html), [SRE canary analysis](https://sre.google/workbook/canarying-releases/). Primary lab uses PostgreSQL16.13/MikroORM7.2.5; do not assume a generic down method is data-safe.

## Packaged-artifact and real database checkpoint

Continue with the [artifact/schema compatibility lab](../../node-js/release-artifact-compatibility.md). It packages four actual Node storage contracts and tests the matrix against PostgreSQL16, including old-role write rejection, stale-backfill protection and the point where V4-only writes make an old reader stale. The local experiment complements the pure model above; no hosted pipeline/traffic deployment or backup restore is claimed. Complete the integration exercise before claiming rollback capability.


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/delivery/Release_strategies._What_strategy_do_you_use_on_project_How_will_you_build_a_release_strategy_for_open_source_project.md). All learner practice remains outstanding.
