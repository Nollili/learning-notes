---
outline: [2, 3]
---

# Deployment and delivery

The primary delivery path packages the existing Express 5/Node.js 24 application into a reviewed container for AWS ECS, with PostgreSQL migrations owned separately. NestJS follows the same runtime/health/artifact rules. Use the [full-stack deployment lesson](../full-stack-deployment.md), [container lab](../container-deployment-lab.md) and [release compatibility lab](../release-artifact-compatibility.md) as implementation owners. This chapter prepares a release; it does not publish an image, push Git or deploy resources.

<!-- tech-check: t24-q01; level: 3 -->

## What should npm scripts and CI gates guarantee?

*Study depth: Intermediate*

Level Up: L3 — Senior\
Tech Check level: ⭐, ⭐⭐⭐

Source mapping: [R023](./requirements.md#r023), [R065](./requirements.md#r065).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Package scripts provide repeatable project commands. CI runs the required checks in a clean environment and must report failures correctly. Build the application, then check the packaged files or image that will actually run.

**Tests against source code do not prove the packaged application starts.** It may be missing dependencies, templates or other runtime files. **Keep the identity of the verified release through later stages**, so the deployed package is the one that passed the checks.

</div>

In a TypeScript Node application, a typical sequence is locked dependency installation → type/lint checks → tests → compilation → artifact verification. The exact scripts belong to the task template. This documentation repository has only docs scripts at its root; do not add generic `build`/`test` scripts merely to make an example look uniform.

Use `npm ci` with the reviewed lock. A cache accelerates installation but is not the release artifact or a promise that another job has dependencies installed. Install needed build/test dependencies in the verification stage, then package only required runtime files. Test runtime startup with production dependencies and the correct OS/architecture/Node contract.

<span class="notes-section-label">**Practice and acceptance**</span>

On the actual application template, run its exact commands in a clean owned checkout and a separate packaged-runtime directory. Accept only when a failing test stops the pipeline, no protected test/config is changed and a missing runtime dependency is detected by artifact verification. References: [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci), [npm scripts](https://docs.npmjs.com/cli/v11/using-npm/scripts).

---

<!-- tech-check: t24-q02; level: 3 -->

## How do you build once and verify what will be released?

*Study depth: Intermediate*

Level Up: L3 — Senior\
Tech Check level: ⭐⭐⭐

Source mapping: [R065](./requirements.md#r065).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Build one release package or image and record its source revision, runtime and dependency identity. **Test that exact package in a separate, clean environment, then use the same package for release.** Rebuilding later can produce different content even from the same source revision.

A checksum lets you compare bytes against an expected value. **The expected checksum must come from a trusted source.** A matching hash supplied alongside an untrusted download does not establish who made it, whether it is safe or whether it is approved for release.

</div>

For a container, record the release digest and target platform along with revision, lock, build configuration and schema compatibility. For an archive, verify its digest before safe extraction and check its allowed contents. Never execute an arbitrary uploaded archive simply because somebody supplied a matching hash. The [existing compatibility lab](../release-artifact-compatibility.md) demonstrates isolated build/test jobs and fixed allowlisted files.

The standalone fixture below verifies bounded local bytes against a trusted expected digest and shows a changed artifact rejects; it performs no extraction or publication:

```js [artifact-identity.mjs]
import assert from 'node:assert/strict';
import { createHash, timingSafeEqual } from 'node:crypto';

function verifyArtifact(bytes, expectedHex) {
  if (
    !Buffer.isBuffer(bytes) ||
    bytes.length > 1024 * 1024 ||
    typeof expectedHex !== 'string' ||
    !/^[a-f0-9]{64}$/.test(expectedHex)
  ) {
    throw new TypeError('invalid bounded artifact or digest');
  }
  const actual = createHash('sha256').update(bytes).digest();
  if (!timingSafeEqual(actual, Buffer.from(expectedHex, 'hex'))) {
    throw new Error('artifact identity mismatch');
  }
}
const bytes = Buffer.from('owned example artifact\n');
const trustedExpected = createHash('sha256').update(bytes).digest('hex');
verifyArtifact(bytes, trustedExpected);
assert.throws(() => verifyArtifact(Buffer.from('changed'), trustedExpected));
assert.throws(() => verifyArtifact(bytes, 'not-a-digest'));
```

Real CI obtains the expected identity/provenance from its trusted build output, not a hash recomputed from the same untrusted download. Action dependencies should be pinned to reviewed immutable revisions; use minimal job permissions, short-lived cloud federation, protected deployment environments and redacted logs. Untrusted pull-request code must not run with production secrets or privileged deployment credentials.

<span class="notes-section-label">**Practice and acceptance**</span>

Build an owned application image once, save its digest and prepare (without pushing) a release manifest containing checks and target registry/repository. Test the downloaded/exported artifact in a fresh consumer and reject deliberate corruption. Accept with the same immutable identity at every stage and no credential in layers/logs. References: [GitHub Actions security](https://docs.github.com/en/actions/reference/security/secure-use), [artifact attestations](https://docs.github.com/en/actions/security-for-github-actions/using-artifact-attestations).

---

<!-- tech-check: t24-q03; level: 3 -->

## How do you configure one environment and manage it safely?

*Study depth: Intermediate*

Level Up: L3 — Senior\
Tech Check level: ⭐⭐⭐

Source mapping: [R066](./requirements.md#r066), [R142](./requirements.md#r142).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Keep the fixed application package separate from settings and secrets that vary by environment. **Validate required configuration before marking the service ready.** Use a limited, controlled identity to manage the target environment, and keep secrets out of source, packaged files and logs.

**An SSH connection only gives access to a machine; it is not a repeatable deployment process.** Document the target, exact release, commands, permissions, checks and failure handling, and retain a safe record of what happened.

</div>

For the selected environment, inventory runtime/architecture, network/DNS/TLS, database and migration role, session store, secret references, outbound dependencies, logging, health paths and connection/time budgets. Keep nonsecret configuration versioned and secrets injected at runtime. A browser bundle cannot keep a secret; build-time frontend environment values are public.

On a VM alternative, use a process manager such as systemd to own the non-root Node process, restart policy, working directory, environment file access, logs and stop deadline. Avoid manually starting `node ... &` in a transient terminal. Prefer a controlled management service; if SSH is required, use a verified host identity, scoped user/key and limited ingress. Do not disable host-key verification to make automation pass or put passwords in command arguments.

An SSH/CLI runbook should name the target account/region/host, artifact digest, working directory and narrow command before mutation. Copy only reviewed files, preserve permissions, check exit status and record sanitized output. A remote shell must not run unquoted user-controlled strings. For ECS, ordinary operators update the service through the deployment mechanism; editing files inside a running task is not a repeatable release.

<span class="notes-section-label">**Practice and acceptance**</span>

Prepare a redacted environment inventory and a dry-run management checklist. Start the owned application with missing/invalid configuration and prove it fails before becoming ready, then verify secret rotation/restart in an isolated environment. Accept with no secret in source, artifacts, shell history or shared logs. References: [systemd service units](https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html), [OpenSSH client](https://man.openbsd.org/ssh), [ECS secrets](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/specifying-sensitive-data.html).

---

<!-- tech-check: t24-q04; level: 3 -->

## How do health checks and graceful shutdown protect a release?

*Study depth: Intermediate*

Level Up: L3 — Senior\
Tech Check level: ⭐⭐⭐

Source mapping: [R112](./requirements.md#r112), [R143](./requirements.md#r143).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

**Readiness asks whether an instance should receive work; liveness asks whether its process needs replacement.** A failed database can make an API temporarily unready even while its own process is functioning correctly. Restarting every healthy API process may add pressure without fixing the dependency.

**During shutdown, stop accepting new work, allow active work a limited time to finish, and close resources.** Fit this within the platform's shutdown deadline and define what happens when the deadline is exceeded. Observe actual closure rather than treating an abandoned promise as completed cleanup.

</div>

A shallow `/healthz` can report that HTTP/process execution works. `/readyz` checks the required bounded dependency contract and the stopping flag. Cache/share probe work where appropriate so probes do not become a database load generator. A database accepting connections does not prove schema compatibility or a business mutation works.

Express's `app.listen()` returns the server to close. NestJS lifecycle/shutdown hooks must be enabled/configured for the chosen signals and providers. In both cases the application owner tracks server, pools, worker pools and timers. Handle SIGTERM once, mark unready, stop new work and await actual closure. An outer timeout does not make unfinished work disappear; define forced termination and recovery of uncertain effects.

The [canonical container server](../container-deployment-lab.md#own-health-work-through-timeout-and-shutdown) implements this ownership for a small fixture. Reuse its design rather than copying an incomplete two-line signal handler. Platform grace must exceed application drain plus routing propagation margin; tune from actual longest accepted operations and test under traffic. Active work may need idempotency/retry after a forced stop.

<span class="notes-section-label">**Practice and acceptance**</span>

Start an owned instance with one active request, signal shutdown and verify readiness stops, accepted work drains or follows the documented failure policy, connections close and process exits. Test a stalled dependency separately. Accept only with observed handle cleanup and a bounded force/recovery path. References: [Express health and shutdown](https://expressjs.com/en/advanced/healthcheck-graceful-shutdown/), [Nest lifecycle hooks](https://docs.nestjs.com/fundamentals/lifecycle-events), [Node server close](https://nodejs.org/docs/latest-v24.x/api/http.html#serverclosecallback).

---

<!-- tech-check: t24-q05; level: 3 -->

## How do you roll out and roll back an API with a database?

*Study depth: Advanced*

Level Up: L4 — Lead\
Tech Check level: ⭐⭐⭐

Source mapping: [R104](./requirements.md#r104), [R144](./requirements.md#r144).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Release database and application changes in compatible stages. Use a known, tested package, and observe important business operations before completing the rollout. Old and new instances may run together, so the schema must support both during that period.

**Rolling back code does not roll back committed data.** An older version may also stop working after a destructive schema change. Plan the compatibility window and recovery steps before release; keeping an old image alone is not a complete rollback plan.

</div>

A rolling release replaces instances incrementally and needs spare capacity and compatibility between old/new versions. Blue/green keeps two environments for a traffic switch but still shares or migrates data deliberately. Canary sends a controlled fraction of traffic to the candidate and watches a defined metric/rollback rule. None automatically proves zero downtime.

For the AWS path, prepare a new ECS task definition using the tested digest, reviewed execution/task roles, secrets, ports, resource limits and health settings. Set deployment healthy/surge limits that allow at least one replacement and fit capacity. Use service events and application metrics to distinguish image-pull, IAM/network, startup and business failures. The [AWS slice](../aws-service-slice.md) documents prerequisites; a template lint does not deploy the surrounding network/database.

For a renamed field, expand with a compatible new column → deploy bridge readers/writers → backfill in bounded chunks → verify consistency → switch reads → retire old writes → contract only after the rollback window closes. Run one serialized migration job with lock/time bounds, not every replica racing a destructive startup migration.

The [release compatibility lab](../release-artifact-compatibility.md) demonstrates four real storage contracts and where rollback stops being safe. Save a matrix of old/new reader/writer versus schema, not just a “down migration” file. If data was transformed destructively, recovery may need forward repair or an isolated restore/reconciliation with an explicit data-loss decision.

<span class="notes-section-label">**Practice and acceptance**</span>

Run the compatibility lab locally, interrupt the backfill and recover. Prepare a staged release/rollback plan for the actual API; in a sandbox prove old/new traffic and negative auth/tenant smoke. Accept with a documented rollback deadline/compatible artifact and evidence that health alone did not gate the entire release. References: [ECS rolling deployments](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/deployment-type-ecs.html), [CloudFormation change sets](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-changesets.html).

---

<!-- tech-check: t24-q06; level: 3 -->

## What evidence belongs in a delivery handoff?

*Study depth: Intermediate*

Level Up: L3 — Senior\
Tech Check level: ⭐⭐⭐

Source mapping: [R065](./requirements.md#r065), [R147](./requirements.md#r147).



<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

A delivery handoff explains which release was built, which checks actually ran, what the release changes, how failures will be noticed and who handles recovery. Include remaining limitations and a usable rollback or repair plan, not only successful check results.

**Preparing a release, publishing it to a registry and deploying it are separate actions.** State which actions were actually completed. For this repository, prepare the work locally; remote Git pushes remain for the user to perform.

</div>

A concrete local release packet contains source revision/dirty-state disclosure, lock/toolchain/runtime/platform, artifact digest, build/test results, contents/security review, migration compatibility, environment/secret references, smoke plan, health/drain settings, rollback artifact and current limitations. Record failed checks and missing integration, not just green badges.

For Docker CI integration, the conceptual stages are test → build candidate image → run packaged-image checks → collect digest/provenance → prepare scoped registry publication → promote the same digest through the controlled deployment job. Only authorized trusted jobs receive registry write credentials; untrusted PR validation should remain read-only and secret-free. Do not rebuild the candidate after its verification and call the result “the same release.”

After deployment, check authentication, owner/cross-tenant mutation, database invariants, job lag and actual error/latency/resource metrics. A 200 on `/healthz` proves much less. Record alarms and a named operational owner; a graph without a response policy is not incident readiness.

Cleanup includes owned test accounts/data, resources, retained artifact/log/backup policy and cost review. Preserve evidence without exposing secrets. If an integration could not be run, state the exact limitation and the next required action; do not replace it with an invented successful environment.

<span class="notes-section-label">**Practice and acceptance**</span>

Prepare one reviewable release packet locally and let another engineer reproduce its packaged checks without your working directory. Accept with exact artifact identity, repeatable checks, no hidden manual setup and an explicit remote-action boundary. The learner must still perform the real deployment/recovery drill in the appropriate environment. References: [GitHub deployment environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/managing-environments-for-deployment), [full-stack delivery checklist](../full-stack-deployment.md).

## Revision and practical checkpoint

Explain source→checks→artifact→environment→migration→health→rollout→observation→recovery with one immutable identity. The checksum demonstration and documentation checks validate bounded examples. They do not establish a running cloud release, a real registry push, a restore or your delivery proficiency.

### Mixed practice

1. CI tested an image, then a deployment job rebuilds from the same revision. Is the tested release preserved?
2. The new release drops a column used by the previous binary. Can the operator safely restore the old image?

<span class="notes-section-label">**Answer guide — read after attempting both cases**</span>

1. No. Dependencies, base images or build inputs may have changed. Promote the exact verified digest and retain its trusted evidence/provenance.
2. Not without a compatible schema/data plan. Use staged expand/bridge/backfill/contract and a known rollback window; after destructive contraction, forward repair or a reviewed restore may be needed.
