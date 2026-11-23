# Deploy, restore and roll back a small complete stack

This extends the container lab with a separate browser frontend, HTTPS entry point, Node API and private PostgreSQL database. It is an **isolated local deployment exercise with a read-only counter UI**, not a hosted authenticated business application. It gives a repeatable example of operating a whole stack and a hosted-app runbook. Public DNS, cloud deployment, real identity/mail integration and production operations still need your own practice.

## Reproduce the owned local deployment

Read the [base container lab](./container-deployment-lab.md) first for exact base digests, secrets, restricted database role, networks, readiness and cleanup ownership. Copy its `container-lab` directory to a fresh owned temporary directory. Copy all files from `docs/workbench/node-js/deployment/full-stack-lab` into that directory too. Run the existing `setup-fixture.py` once. It generates a unique project name and disposable file secrets without printing values. Append `FRONTEND_IMAGE=learning-notes-study-frontend:<the same generated project name>` to the copied `.env`.

Generate a one-day local certificate with a localhost SAN into that copy's private secrets directory:

```sh
openssl req -x509 -newkey rsa:2048 -nodes -days 1 -subj /CN=localhost \
  -addext subjectAltName=DNS:localhost \
  -keyout secrets/tls_key -out secrets/tls_cert
chmod 444 secrets/tls_key secrets/tls_cert
```

The parent directory remains0700. Readable secret files inside a private host directory permit the nonroot container's file mount; this is not a hosted secret vault. Do not upload these files or install this temporary CA into system trust. The harness trusts only this certificate for its own client; certificate verification remains enabled.

Frontend implementation:

<<< ../workbench/node-js/deployment/full-stack-lab/frontend.mjs

It serves HTML plus a separate same-origin script and proxies only three fixed GET paths to the API. No arbitrary host/URL is selectable; browser requests stay same-origin and do not require permissive CORS. The UI validates its small runtime response and uses textContent. The frontend has no mutation endpoint, authentication or customer data. API writes remain reachable only on the base lab's separate random loopback port. Keep every port local; adding HTTPS does not make an unauthenticated counter appropriate for public exposure.

<<< ../workbench/node-js/deployment/full-stack-lab/Dockerfile.frontend{dockerfile}

<<< ../workbench/node-js/deployment/full-stack-lab/full-stack.yaml

The frontend runs as10001 with a read-only root, dropped capabilities and no privilege escalation. Only its TLS secrets are mounted; it cannot reach the private database network directly. The API alone has its scoped application database credential. The existing base API still has a loopback host mapping for diagnostics. Use an override removing that diagnostic mapping before any hosted adaptation; do not expose the database. The selected Node base identity is inherited from the base lab's reviewed `.env.example`.

Run `python3 check.py` in this **disposable copy**. The check recreates its owned fixture counter state, builds/runs the stack, creates a separate restore database, injects an intentionally broken frontend release, rolls back and removes only its generated project resources/images/secrets after success. It requires Docker and opens local ports. If interrupted, inspect `.lab-project`, then use the two Compose files and that exact project name for cleanup; never run a global prune or delete a user database. Inspect the script before running it outside a fresh fixture.

The harness lives at `docs/workbench/node-js/deployment/full-stack-lab/check.py`. Its smoke check verifies the expected UI title, not just HTTP 200. The first run could not roll back to an untagged image ID after rebuilding because that Docker engine no longer exposed it. The corrected run keeps a known-good tag **before building the candidate**, then restores it and verifies the prior HTML and database value. Real releases should retain immutable registry digests and deployment records. **Knowing an old hash is not enough if the artifact is no longer retrievable.**

## Retained execution evidence

<<< ../workbench/node-js/deployment/full-stack-lab/evidence.json

Actually run2026-10-26 on local Docker29.9.2: verified HTTPS certificate, frontend/script/CSP responses, API proxy readiness/read, nonroot/read-only frontend, database value7, custom-format pg_dump, restore into a separate database with value7, deliberately failing frontend smoke, exact previous frontend restoration and unchanged database value. Owned services, volume, two app image versions and credentials were removed; public base images/build cache retained. The frontend was tested through HTTP/script content assertions, not a native browser or accessibility audit. The backup hash records this synthetic exercise, not a production backup artifact.

## A hosted frontend/API/database runbook

Use the primary React/TypeScript frontend and authenticated Express/PostgreSQL service for the real project; the small local counter explains operational mechanics only. Before hosting, assign actual owners and fill the following release record with observed results rather than checking boxes from this prose.

| Stage | Action and gate | Failure / recovery |
|---|---|---|
| Prepare | Record source revision, dependency lock, frontend/API digests, architecture, schema compatibility, environment and rollback digest; retain artifacts | Stop if an artifact cannot be reproduced/resolved or old API cannot read expanded schema |
| Provision | Private managed PostgreSQL, scoped app/migration roles, secret manager, HTTPS domain/certificate, restricted API egress and frontend routing | No database public binding; rotate exposure; verify actual DNS/TLS/proxy behavior |
| Migrate | One serialized migration job; expand/backfill/reconcile before destructive contract | Observe lock/query budget; rollback application only while schema remains compatible |
| Deploy | Start candidate; shallow liveness and real dependency readiness; run authenticated owner/cross-tenant/CSRF/negative smoke | Keep current release serving if candidate is unready or business smoke fails |
| Observe | Error/latency/throughput, saturation, pool and event-loop state, oldest job/outbox age; safe request/operation IDs | Alert actual owner; distinguish dependency503 from invalid credential401; cap retries/admission |
| Recover | Verify encrypted backup/PITR policy and restore into a separate isolated target, then verify constraints/counts/sample application reads | Record RPO/RTO from observed timestamps, not backup configuration alone; fail over only through reviewed authority/secret/routing steps |
| Roll back | Restore known-good frontend/API artifacts; recheck same smoke matrix and data compatibility | Destructive migration may prevent old binary rollback; forward-fix or restore with an explicit data-loss decision |
| Close | Retain redacted release/restore/rollback evidence, costs and outstanding risks; expire owned test resources | Never call successful HTTP health a complete security or recovery test |

For a concrete schema/release compatibility drill use the existing [release artifact lab](./release-artifact-compatibility.md); for database restore/PITR details use [database recovery](./database-recovery.md). Keep secrets out of browser bundles, image layers, logs and build args. HTTPS termination must match Secure-cookie/proxy trust configuration. Shared sessions/rate limits, real recovery delivery, quotas, ownership and current revocation must work across replicas before widening traffic. Set budget alerts and a teardown/retention owner; cost estimates require current regional rates and expected request/storage/egress volumes.

[Related practice](../practice/node-js/full-stack-deployment.md).

## Kubernetes awareness: map the same ownership to resources

Kubernetes reconciles declared workload state. A Deployment owns replaceable Pods/ReplicaSets, a Service routes to selected ready endpoints, and ingress/gateway infrastructure can terminate TLS. Persistent databases still need storage, backup, migration and operational ownership; putting PostgreSQL in a Pod does not create high availability. Prefer a managed database until a measured need and operating capability justify cluster database administration.

`full-stack-lab/kubernetes.json` is a Kubernetes List containing a namespace, two-replica API Deployment and internal Service. Replace its deliberately invalid image digest with a compatible built image and supply the named Secret. **It is a template requiring adaptation, not a ready deployment of the counter.** The counter reads a file secret, while this template expects an API that reads `DATABASE_URL`. Reconcile those runtime requirements before use.

The manifest includes resource requests/limits, nonroot/read-only/capability restrictions, disabled service-account token automount, startup/liveness/readiness probes and a15second termination budget. Inspect its source locally. Selectors were parsed/compared and required fields checked offline; no Kubernetes schema server, cluster, controller or rollout was exercised. A PodDisruptionBudget/network policy/ingress and real secret integration are not supplied or inferred.

Readiness controls eligibility for normal Service traffic; liveness failures can restart a container. Do not make a database outage restart every API. Startup probes allow initialization before normal probes begin. Resource requests affect scheduling, CPU limits may throttle work, and memory limits can trigger out-of-memory termination. A `maxUnavailable: 0` / `maxSurge: 1` rollout needs spare capacity and accurate readiness; **those settings alone do not prove zero downtime**. Shutdown must stop intake and finish work within the deadline, allowing for load-balancer routing changes.

[Related practice](../practice/node-js/full-stack-deployment.md).

[Related practice](../practice/node-js/full-stack-deployment.md).

Official references checked2026-10-26: [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/), [PostgreSQL pg_dump](https://www.postgresql.org/docs/16/app-pgdump.html), [pg_restore](https://www.postgresql.org/docs/16/app-pgrestore.html), [Kubernetes Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/), [probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/), [Secrets](https://kubernetes.io/docs/concepts/configuration/secret/). apps/v1 Deployment and core/v1 Service/Namespace are the intended stable resource APIs; server-side validation must use your target cluster version.
