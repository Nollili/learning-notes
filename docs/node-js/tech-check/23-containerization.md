---
outline: [2, 3]
---

# Docker and containerization

Use the [canonical Node/PostgreSQL container lab](../container-deployment-lab.md) for the runnable implementation. This chapter explains its decisions and troubleshooting in five questions. Docker commands use the Compose plugin (`docker compose`); the lab records its own tested Engine/Compose/image versions. Its previous live-container evidence is historical, not a new run from reading this page.

## What are images, containers, volumes and registries? {#t23-q01}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

An image is packaged filesystem content and runtime metadata. A container is a running or stopped instance with its own writable layer. A registry distributes images; volumes hold data outside replaceable container layers. **A container is not a separate virtual machine or a durable backup.**

</div>

The Docker CLI talks to a daemon, which builds/pulls images and manages containers/networks/volumes. On macOS, Linux containers run through a Linux VM; they do not gain a separate full kernel per container. Containers share the host kernel within that environment, so runtime privileges and daemon access matter. Mounting the Docker socket into an untrusted app gives dangerous control over that environment.

An image contains layers; a container adds a writable layer. Removing/replacing that container loses unpersisted writes. Put authoritative database files in a deliberate named volume or managed database, and test backups independently. A bind mount maps a host path and can hide files originally present at that container path. A named volume is Docker-managed storage, not an automatic cross-host replication system.

Use one main service responsibility per container so health, scaling and logs have clear owners. This does not require literally one OS process: a controlled child process or init can be necessary. Choose a VM when you need stronger kernel separation or a different OS boundary; choose a managed service when owning the database/runtime is unnecessary.

<span class="notes-section-label">**Practice and acceptance**</span>

Draw which data survives process restart, container replacement, volume deletion and host loss. In an owned lab, persist a counter across replacement and recover from a separate backup. Accept only when volume persistence and backup restoration are demonstrated separately. References: [Docker overview](https://docs.docker.com/get-started/docker-overview/), [volumes](https://docs.docker.com/engine/storage/volumes/).

---

## How do you build a small, reproducible Node image? {#t23-q02}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Build from a reviewed base, copy a narrow context, install the locked dependency tree and run with a non-root identity. Separate build tools from runtime files. **A reproducible image must also be updated and retested for security fixes.**

</div>

The canonical Dockerfile below is included directly from the lab. Its selected plain-JavaScript server needs no compilation; a TypeScript application needs a build stage with development dependencies and a tested runtime output. Do not invent an empty build just to imitate that pipeline.

<<< ../../workbench/node-js/deployment/container-lab/Dockerfile

Copying the manifests before source allows dependency-layer cache reuse when only source changes. `npm ci` uses the lock and rejects a mismatched manifest. `--omit=dev` keeps runtime dependencies; `--ignore-scripts` is safe only for this reviewed dependency tree, not for every native/build package. Native modules need the correct runtime ABI, architecture and libc; copying host macOS `node_modules` into Linux is not a deployment strategy.

Set `.dockerignore` for `.git`, local `node_modules`, build output where appropriate, credentials and irrelevant files. Also COPY only intended paths. A secret copied and deleted in a later layer can remain recoverable from prior layers/cache. Use a reviewed BuildKit secret mount for private dependency access and runtime secret injection for application credentials; neither belongs in `ARG`/`ENV` baked into a public image.

The exec-form `CMD ["node", "server.mjs"]` delivers the stop signal to Node rather than an extra shell. A writable volume must have compatible UID/GID; `USER` alone does not fix ownership. A read-only root is useful when the app has a defined writable temp/volume policy. Do not respond to permission failures with broad privileged mode or `chmod 777`.

<span class="notes-section-label">**Practice and acceptance**</span>

Build the owned canonical lab, inspect runtime UID and files, then rebuild after a source-only change and explain cache reuse. Accept when no secret/test/host dependency tree is packaged, required runtime files work under non-root and a deliberate base update triggers retesting. Reference: [Docker build practices](https://docs.docker.com/build/building/best-practices/), [build secrets](https://docs.docker.com/build/building/secrets/).

---

## How do Compose networking, readiness and secrets fit together? {#t23-q03}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Compose describes a local multi-container application, including service DNS, mounts, ports and initial dependencies. **A running dependency is not necessarily ready**, and initial health ordering does not replace runtime reconnection or failure handling.

</div>

<<< ../../workbench/node-js/deployment/container-lab/compose.yaml

Inside `api`, the database hostname is `db` and the port is its container port 5432. `localhost` means the API container itself. The host's random loopback port maps to API port 3000; it is unrelated to service-to-service database traffic. `EXPOSE` documents a port but does not publish it. Bind the application listener to the container interface (`0.0.0.0`) and restrict host publishing separately.

The lab separates private database and edge networks. The database has no published host port. The API's edge network provides outbound routing; this is not a deny-all-egress design. Reference service names rather than ephemeral IPs, and reconnect after container replacement.

`depends_on: condition: service_healthy` waits for the declared database probe before initial API startup. The application still checks schema/connectivity, owns connection failures later and becomes unready during draining. A database accepting connections may not yet have the expected migration. A Docker health status alone does not guarantee automatic restart, failover or traffic removal in every environment.

Runtime secrets are mounted only to the services needing them. Local Compose secret files remain trusted host files, not an encrypted managed vault. The lab uses a separate database admin bootstrap secret and application secret; ordinary requests do not receive admin credentials. An existing PostgreSQL volume does not rerun bootstrap scripts when you change a secret or initialization file. Rotate the actual role and migrate the actual schema deliberately.

<span class="notes-section-label">**Practice and acceptance**</span>

Use the lab's owned-copy setup, then `docker compose -p "$lab_project" config --quiet` and its documented startup commands. Test DNS, hidden database port, correct secret mounts, delayed startup and database interruption/recovery. Accept with bounded readiness failure while liveness remains meaningful, followed by graceful shutdown. References: [Compose startup order](https://docs.docker.com/compose/how-tos/startup-order/), [networking](https://docs.docker.com/compose/how-tos/networking/), [Compose secrets](https://docs.docker.com/compose/how-tos/use-secrets/).

---

## How do tags, digests and orchestration affect delivery? {#t23-q04}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Tags are mutable names; digests identify immutable content at a particular artifact level. Build and test one image, then deploy the reviewed digest for the target architecture. **A digest identifies content, not its safety or suitability.**

</div>

A multi-platform manifest/index digest can select several platform images; a local image ID is a different identity. Record source revision, dependency lock, base reference, platform, test result and resulting release digest. `latest` cannot tell you which code ran yesterday. Pinning forever preserves vulnerabilities; update the selected digest through the same checks.

A registry hosts image repositories. Authentication authorizes pull/push to selected namespaces and should use short-lived scoped credentials where supported. Use a credential helper or protected stdin flow rather than a literal password in shell history/logs. Reading an image does not authorize publishing a replacement. This course prepares release evidence locally; registry publication is a separate controlled delivery action.

Compose is useful for one-host development/integration. An orchestrator such as ECS or Kubernetes schedules replicas, replaces failures and supports rollout policy. It adds resource requests/limits, readiness/liveness, graceful termination, secrets, routing and observability decisions. A cluster does not remove application idempotency, database budgets or migration compatibility. Kubernetes implementation is optional enrichment here; AWS ECS is the primary cloud path.

<span class="notes-section-label">**Practice and acceptance**</span>

Resolve an owned test image to its digest, inspect its platform and prepare a release record showing a tag can move while the old digest remains identifiable. Design a two-replica rollout with drain and rollback. Accept with explicit registry permission and platform checks; do not push as part of this notes task. References: [Docker image digests](https://docs.docker.com/dhi/core-concepts/digests/), [multi-platform builds](https://docs.docker.com/build/building/multi-platform/), [ECS services](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs_services.html).

---

## How do you troubleshoot a container that will not work? {#t23-q05}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Locate the failing boundary: daemon, image build, process startup, health, network, filesystem or dependency. **Inspect evidence before changing privileges or rebuilding randomly.** Use narrowly scoped commands against only your owned project.

</div>

| Symptom | First evidence | Typical next decision |
|---|---|---|
| Cannot connect to daemon | Selected Docker context and daemon status | Start/connect to the intended environment |
| Build fails at `npm ci` | Lock consistency, registry and failing package step | Fix manifest/lock or reviewed build dependency |
| Exec format error | Image OS/architecture | Build/pull the matching platform |
| Container exits immediately | Exit code, entrypoint and sanitized logs | Fix runtime command/config/dependency |
| Host cannot reach API | Container listener, published mapping, health | Distinguish loopback listener from host binding |
| API cannot reach DB | Service DNS/network, container port, credentials | Test the exact dependency boundary |
| Permission denied | Runtime UID, file ownership, mount and read-only paths | Grant the narrow required access |

```sh
# Only in your owned lab; inspect may reveal environment/configuration secrets.
docker compose -p "$lab_project" ps
docker compose -p "$lab_project" logs --tail=100 api
docker compose -p "$lab_project" port api 3000
docker compose -p "$lab_project" exec api id
docker compose -p "$lab_project" exec api node -e "fetch('http://127.0.0.1:3000/healthz').then(r=>console.log(r.status))"
```

Use `docker inspect` for state/health/mounts/network membership but avoid dumping raw environment into shared diagnostics. `exec` requires a running process; a repeatedly crashing container may need a temporary debug command on an owned copy. Minimal/distroless images may not have a shell or curl: use available runtime diagnostics or an approved debug container rather than modifying production live.

Capture the first error before restart loops overwrite it. An OOM-killed flag suggests memory pressure; exit 137 alone can also mean another SIGKILL. Check resource settings and actual memory use. Health failures need their probe output and timeout, not simply a longer sleep.

<span class="notes-section-label">**Practice and acceptance**</span>

Inject three separate failures in an owned copy: wrong database hostname, wrong file ownership and invalid startup command. Recover each using evidence, record the smallest fix and prove no change to other containers. Remove only the lab's containers/networks/volume/image after collecting results; volume deletion is destructive. References: [Compose logs](https://docs.docker.com/reference/cli/docker/compose/logs/), [container inspect](https://docs.docker.com/reference/cli/docker/container/inspect/), [Docker troubleshooting](https://docs.docker.com/config/daemon/troubleshoot/).

## Revision and practical checkpoint

Trace source/context → layers → release digest → process identity → listener/network → dependency → shutdown → data recovery. The canonical lab remains the implementation owner. Fresh author checks and their exact limits are recorded in the [Services tracker](./progress.md#services-completion); they do not complete your exercises or establish a cloud rollout.

### Mixed practice

1. The API connects to localhost:5432 inside its container while PostgreSQL is a separate Compose service. What changes?
2. A database password file changes, but the persistent database keeps rejecting it. Why?

<span class="notes-section-label">**Answer guide — read after attempting both cases**</span>

1. Use the database service DNS name and its container port on the shared network. Publishing another host port is unnecessary for service-to-service traffic.
2. A changed bootstrap file does not rotate an initialized database role. Coordinate actual role credential rotation, application secret adoption and pool restart/reconnect without deleting the authoritative volume.
