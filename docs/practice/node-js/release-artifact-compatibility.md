# Build Artifacts and Database Rollback Compatibility — practice

**Learner status: still required.** These tasks were separated from the textbook; no completion is credited.

[Textbook explanation](../../node-js/release-artifact-compatibility.md) · [Node.js practice map](./index.md)

**Practice acceptance:** reproduce artifact inspection/digest/corruption detection and the entire old/bridge/new database matrix. Add more rows and a concurrent writer plus failed/restarted bounded backfill; require no lost newer data and an explicit last compatible rollback artifact. Wire real isolated jobs that consume the same archive and prove missing dependencies/artifacts fail clearly. Show the migration state/health gate before promotion and a recovery decision after V4-only writes. Keep deployment credentials out of artifacts/logs. Learner hosted pipeline, production-style backfill and recovery exercise remain required.
