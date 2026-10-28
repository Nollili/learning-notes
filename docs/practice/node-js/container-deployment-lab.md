# An Executed Node/PostgreSQL Container Lab — practice

**Learner status: still required.** These tasks were separated from the textbook; no completion is credited.

[Textbook explanation](../../node-js/container-deployment-lab.md) · [Node.js practice map](./index.md)

## Practice and cleanup

Reproduce the image build, inspect its actual user/config/files/layers and explain every exposed/published port and mount. Demonstrate database-only service DNS, startup health, a controlled outage with liveness/readiness separation, recovery without connection growth, graceful stop and retained data across replacement. Verify new image digest/platform/dependency changes before promotion. Add real auth/ownership/CSRF/TLS and operational controls only as a separate full-app project, not by making this counter public.

```sh
# In the same owned fixture directory, using its verified unique project:
docker compose -p "$lab_project" down
# Later up reuses the named volume. Only when intentionally discarding this lab data:
docker compose -p "$lab_project" down --volumes --remove-orphans
```

Inspect the project name first; the second command intentionally deletes this project's fixture volume. Never substitute a user database/project or run global prune/cleanup commands. Remove the generated local credentials/settings only after the owned services no longer need them, under the fixture's retention policy. Removing a local image does not delete registry artifacts or shared base layers.

**Acceptance:** retain your own build/image/runtime identities, configuration and observed failure/recovery/shutdown/persistence evidence; explain authentication and rollout/backup limitations. The supplied implementation and checks do not establish learner completion. Local practice and the separate complete deployed frontend/API/database requirement remain outstanding until performed.

Official references checked2026-10-25: [multi-stage builds](https://docs.docker.com/build/building/multi-stage/), [Compose networking](https://docs.docker.com/compose/how-tos/networking/), [startup dependency health](https://docs.docker.com/compose/how-tos/startup-order/), [secret-file scope](https://docs.docker.com/compose/how-tos/use-secrets/), [volume lifetime](https://docs.docker.com/engine/storage/volumes/), [pg client release/pool lifecycle](https://node-postgres.com/apis/pool).
