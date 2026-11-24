---
outline: [2, 3]
---

# Deployment and delivery

<span class="notes-section-label">**Section 3 reading path:**</span> Reuse Section 2’s scripts and tests. Check the packaged service, health responses and shutdown. Prepare a migration/rollback record and test it locally. The cloud chapter then maps that release to AWS. Section 3 requires the project’s local/design checkpoint. Publishing to a registry and deploying to the cloud are separate exercises; a local build does not prove they work.

For unfamiliar technical terms, use the [Section 3 vocabulary guide](./index.md#section-3-vocabulary).

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

For a TypeScript application, a typical sequence is: install locked dependencies, run type/lint checks and tests, compile, then check the packaged output. Use the actual task template’s scripts. This documentation repository only has docs scripts at its root. Do not add generic `build` or `test` scripts just to match the example.

Use `npm ci` with the reviewed lockfile. A cache can make installation faster, but is not the release package and does not mean another job already has dependencies installed. Install build/test tools in the verification stage. Package only files needed at runtime. Test startup with production dependencies on the required OS, architecture and Node version.

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

Real CI gets the expected digest and build history from a trusted build. Recomputing a hash from the same untrusted download does not establish trust. Pin action dependencies to reviewed immutable revisions. Give jobs limited permissions, use short-lived cloud credentials, protect deployment environments and remove secrets from logs. Never run untrusted pull-request code with production secrets or privileged deployment credentials.

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

List the environment’s runtime and architecture, network/DNS/TLS settings, database and migration roles, session store, secrets, outgoing dependencies, logs, health paths and resource limits. Version non-secret configuration and supply secrets at runtime. Values included in browser files are public; a browser bundle cannot hide a secret.

For a VM, a process manager such as systemd can start the non-root Node process and manage restarts, working directory, settings, logs and stop deadline. Do not rely on `node ... &` in a temporary terminal session. Prefer a controlled management service. If SSH is needed, verify the host identity and limit the user, key and incoming network access. Do not disable host checks or place passwords in command arguments.

A runbook is a repeatable set of operating instructions. An SSH/CLI runbook should identify the account, region, host, release digest, working directory and exact command before changing anything. Copy only reviewed files, preserve permissions and check exit status. Keep logs free of secrets. Do not insert unquoted user input into remote shell commands. For ECS, update the service through the deployment process rather than editing files inside a running task.

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

A simple `/healthz` can show that the process can answer HTTP requests. `/readyz` checks required dependencies within a time limit and checks whether shutdown has started. Share or cache probe work when appropriate so health checks do not overload the database. A database connection alone does not prove that the schema or business operation is usable.

Express’s `app.listen()` returns the server that must later be closed. In NestJS, configure the required shutdown hooks and signals. In either framework, one application owner tracks servers, pools, workers and timers. Handle SIGTERM once, mark the service unready, stop new work and wait for resources to close. An outer timeout does not stop unfinished work by itself. Define when to force termination and how to check uncertain outcomes afterward.

The [container server](../container-deployment-lab.md#own-health-work-through-timeout-and-shutdown) demonstrates this cleanup for a small test setup. Reuse its approach rather than an incomplete two-line signal handler. The platform must allow enough time for accepted work to finish and traffic routing to update. Measure that time under traffic. Work interrupted by a forced stop may need safe retry or duplicate protection.

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

A rolling release replaces application copies gradually. It needs spare capacity and compatibility between old and new versions. Blue/green deployment keeps two environments so traffic can switch between them, but still needs a data plan. A canary release sends a small share of traffic to the new version and checks defined metrics before continuing. None of these methods automatically guarantees zero downtime.

For the AWS path, prepare a new ECS task definition using the tested digest, reviewed execution/task roles, secrets, ports, resource limits and health settings. Set deployment healthy/surge limits that allow at least one replacement and fit capacity. Use service events and application metrics to distinguish image-pull, IAM/network, startup and business failures. The [AWS slice](../aws-service-slice.md) documents prerequisites; a template lint does not deploy the surrounding network/database.

For a renamed field, first add a compatible new column. Deploy code that supports old and new fields. Fill existing data into the new column in limited batches, then verify it. Switch reads, stop old writes and remove the old column only after the rollback period ends. Run migrations through one coordinated job with lock/time limits, not separately in every application copy.

The [release compatibility lab](../release-artifact-compatibility.md) shows four storage contracts and when rollback becomes unsafe. Record which old/new readers and writers work with each schema version. A down-migration file alone is not enough. If a transformation destroyed information, recovery may need a forward fix or a separate restore followed by data reconciliation. Document any accepted data loss.

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

A local release record should identify the source revision and uncommitted changes, lockfile, tool/runtime versions, platform and artifact digest. Include build/test results, packaged contents, security review, schema compatibility, configuration references, smoke tests, health/shutdown limits and rollback package. List failures and checks that did not run.

A Docker pipeline typically tests the application, builds a candidate image, tests that image and saves its digest/build evidence. It then prepares publication and promotes that same digest through deployment. Only authorized, trusted jobs receive registry-write credentials. Pull-request checks remain read-only and secret-free. Do not rebuild after verification and describe the new image as the tested release.

After deployment, test authentication, ownership checks and database rules. Check job delays, errors, latency and resource use. A 200 from `/healthz` does not prove those behaviors. Assign someone to respond to alarms. A graph without an action plan is not enough for incident handling.

Cleanup includes owned test accounts/data, resources, retained artifact/log/backup policy and cost review. Preserve evidence without exposing secrets. If an integration could not be run, state the exact limitation and the next required action; do not replace it with an invented successful environment.

<span class="notes-section-label">**Practice and acceptance**</span>

Prepare one reviewable release packet locally and let another engineer reproduce its packaged checks without your working directory. Accept with exact artifact identity, repeatable checks, no hidden manual setup and an explicit remote-action boundary. The learner must still perform the real deployment/recovery drill in the appropriate environment. References: [GitHub deployment environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/managing-environments-for-deployment), [full-stack delivery checklist](../full-stack-deployment.md).

## Revision and practical checkpoint

Explain the path from source to checks, package, environment, migration, health, rollout, observation and recovery. Keep the same verified artifact identity throughout. The checksum example and documentation checks do not prove a live cloud release, registry push, restore or your practical deployment skills.

### Mixed practice

1. CI tested an image, then a deployment job rebuilds from the same revision. Is the tested release preserved?
2. The new release drops a column used by the previous binary. Can the operator safely restore the old image?

<span class="notes-section-label">**Answer guide — read after attempting both cases**</span>

1. No. Dependencies, base images or build inputs may have changed. Promote the exact verified digest and retain its trusted evidence/provenance.
2. Not without a compatible schema/data plan. Use staged expand/bridge/backfill/contract and a known rollback window; after destructive contraction, forward repair or a reviewed restore may be needed.
