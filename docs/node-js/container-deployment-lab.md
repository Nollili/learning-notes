# An Executed Node/PostgreSQL Container Lab

This intermediate backend/deployment lab builds and runs a small Node counter with PostgreSQL. Its source is in docs/workbench/node-js/deployment/container-lab. It is deliberately a **disposable local fixture with no authentication, CSRF or TLS**; it is not the retained runnable application or a production API. The API port binds only to host loopback and the database has no published host port. Do not expose the fixture publicly or treat its credentials as a production secret-management design.

**Actually tested2026-10-25:** Docker Engine29.2.1, Compose5.1.0, linux/arm64, image Node24.22.1 and PostgreSQL16.15, pg8.23.1. The host's Node24.18/PostgreSQL16.13 used elsewhere are different runtimes. The saved verified-images.json records base manifest digests and the tested app image identity. Those public manifests support platform selection; this run does not establish the AWS lesson's required linux/x86_64 image compatibility.

## Files, build context and reproducibility

Copy the container-lab directory to an owned temporary working directory before setup. It contains Dockerfile, compose.yaml, server.mjs, init.sh, package.json/package-lock.json, .dockerignore, .gitignore, .env.example, setup-fixture.py and verified-images.json. No generated secret files are committed. The setup creates a unique project/image name, private host secret directory and disposable file credentials; it refuses to overwrite existing settings. Use the supplied exact dependency lock, not a new npm install that silently selects another pg tree.

```sh
# In the owned copy, with Docker available:
python3 setup-fixture.py
lab_project="$(cat .lab-project)"
docker compose -p "$lab_project" config --quiet
docker compose -p "$lab_project" pull db
docker compose -p "$lab_project" build api
docker compose -p "$lab_project" up -d --wait --wait-timeout 60
docker compose -p "$lab_project" port api 3000
```

The last command returns the actual random loopback port. Use that address for GET /healthz, /readyz and /counter; POST /counter increments the one fixture row. Do not assume a fixed port, use localhost as a container-to-database hostname, or publish the database merely to make service DNS work. Setup prints only public project/image names, never credential values. Local file permissions and Docker service-specific mounts are not an encrypted vault; the host directory and Docker daemon remain trusted.

<<< ../workbench/node-js/deployment/container-lab/Dockerfile

The dependencies stage runs npm ci with production-only dependencies under the matching lock and no lifecycle scripts for this selected pg dependency tree. A different package may need a reviewed build step; do not disable required scripts blindly. The runtime stage copies only needed modules and app files, then runs as UID/GID10001 with an exec-form Node command. Separate dependency and application COPY steps permit useful cache reuse when only source changes. The final Node base still contains its normal tooling; multi-stage does not magically remove every utility or vulnerability.

The reviewed .env.example uses image digests. A tag such as node:24-bookworm-slim is mutable; the initial pull was resolved to a digest before the tested build. A manifest-list digest selects platform-specific content, while the resulting local image ID identifies a different artifact level. Keep runtime/architecture/source/lock/image identities with evidence. Updating base security fixes means deliberately selecting/retesting a new digest, not pinning an old image forever or assuming a stable tag is immutable.

.dockerignore excludes local secrets/.env/Git/tests, and the Dockerfile explicitly copies only selected files. Deleting a secret in a later layer would not remove it from earlier layers/cache: never COPY it. Build-time private registry credentials need a reviewed build-secret mechanism. This lab uses only public packages and runtime file secrets.

## Networks, ports, database identity and volume

<<< ../workbench/node-js/deployment/container-lab/compose.yaml

The database joins only the internal private network. The API joins that database network plus a separate edge bridge for the loopback host port. The first internal-only configuration did not publish a usable port on this engine (Compose reported invalid IP:0); it was corrected and all checks rerun. The edge network permits API outbound routing; this is not a general egress-denial policy or a security container. Production network policy must be designed separately.

Inside the API container db resolves through Compose service DNS and port5432 is the database's container port. The host's random API port is a separate mapping. API read_only, dropped capabilities and no-new-privileges add restrictions; they do not replace patched images, runtime isolation or application authorization. Docker daemon access is privileged; no host Docker socket is mounted into either workload.

<<< ../workbench/node-js/deployment/container-lab/init.sh

PostgreSQL initializes the notes database on an empty named volume. The bootstrap uses a separate admin secret to create notes_app and grants only the required counter SELECT/UPDATE plus connect/schema usage. The API receives only its own password file; the admin secret is not mounted there. The bootstrap reads its secret inside the database process, not by placing the password in a shell command argument. This remains a local learning initialization path, not an audited cloud secret-rotation workflow.

The named volume survives container replacement and ordinary compose down. Init scripts do not rerun on an existing populated volume, so changing init.sh or a secret file does not migrate the schema or rotate the existing role's password. Use real migrations/rotation and tested backup/restore for persistent applications. Container writable layers are replaceable; a volume is persistence, not a backup or cross-host availability system. The mount path is specific to the selected PostgreSQL16 image; recheck image/version contracts on upgrade.

## Own health work through timeout and shutdown

<<< ../workbench/node-js/deployment/container-lab/server.mjs

Liveness is a shallow process/HTTP response. Readiness uses a real SELECT1, shares one in-flight probe and rechecks stopping state. The pool has bounded connection/acquisition time and two connections; PostgreSQL statement_timeout limits normal server execution. Each borrowed client also has a750ms adapter deadline. On timeout/error that client is destroyed and never returned to the healthy idle pool; the late query promise is observed by the race and cannot trigger an unhandled rejection.

The slot is released only after the owned client has been released/destroyed. This is different from merely returning false and leaving unlimited old queries alive.

An outer timeout cannot cancel arbitrary remote work instantly. During the injected database pause, server timers also stop progressing; destroying the client prevents reuse and the database processes disconnect/statement limits after recovery. Bound admission and keep fixed SQL here. The app's timeout values are intentionally aggressive local fixtures, not production recommendations. Optional/shared downstream outages should not make every healthy process restart. Idle pool errors are handled through a fixed safe log message; raw credentials/errors are not returned.

SIGTERM marks stopping before closing HTTP intake, drains bounded requests, closes the pool and reports clean shutdown. A3s hard stop limits the fixture's cleanup, with Compose allowing5s. Stopping once is idempotent. A real orchestrator/load balancer needs its own termination/readiness/drain ordering and adequate budgets. Healthchecks/depends_on service_healthy gate initial Compose startup; unhealthy status alone is not an automatic rolling deployment/restart/recovery policy. No production rollout is claimed from compose down/up.

The chapter's existing createReadinessProbe was also extracted and executed:100 concurrent callers shared one underlying operation; a caller deadline kept its slot occupied until the underlying operation settled, after which success/failure/reset behavior passed. The generic wrapper correctly limits concurrency but cannot force a permanently stuck adapter to complete. This lab adds a concrete bounded PostgreSQL client owner rather than attach an ignored AbortSignal or call a wait timeout “cancellation.”

## Actual failure and lifecycle checks

The executed harness built the image, brought up a unique project, and verified API UID10001/read-only root, service DNS, no database host binding, absence of .env/tests/local secret directories in /app, and absence of the admin secret in the API. It paused **only the owned database container**: readiness returned503 within the bounded test allowance while liveness stayed200; repeated checks failed safely and recovered after unpause. It incremented the counter, stopped the API with exit0/clean shutdown, removed/recreated containers without deleting the volume, and observed the retained counter value.

All owned containers, network, volume, temporary credentials and the owned app image were removed after validation; downloaded base images/cache were retained. No existing user container/project was touched. The first networking failure is recorded above; the final passing evidence corresponds to the corrected dual-network code now in the repository. Package/schema/configuration validation is not a security audit, load test or backup restore.

## Practice and cleanup

[Exercises and learner checklist](../practice/node-js/container-deployment-lab.md).
