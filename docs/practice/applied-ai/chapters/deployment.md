# Deploying the Python Companion Service — practice

**Learner status: still required.** These requirements were separated from the textbook. Use the [integrated sequence](../index.md) and shared evidence record; running reference checks is not independent completion.

[Textbook](../../../python-for-ai/deployment.md)

## Practice and acceptance

Deploy a disposable staging instance from a fresh locked environment with a real durable repository. Record build/runtime identities and prove restart persistence. Verify no missing secret or failed repository startup can become ready. Test unauthorized traffic, body cap, operational503, unexpected500 privacy, proxy spoofing, TLS, logging, saturation and a slow request during SIGTERM. Test the platform hard deadline and a failed cleanup without leaving orphan processes. Perform an artifact rollback and explain why it preserves accepted data under the selected schema transition.

**Acceptance:** local commands/real-process test pass; the deployed artifact matches the tested artifact; readiness/recovery observations and timings are retained; all credentials/documents stay out of logs/image/source; the service restarts cleanly under its supervisor. Native local smoke evidence covers only the selected POSIX server boundary. Container build, hosted ingress/TLS/supervisor, durable repository, active-work drain, production secret rotation and learner deployment practice remain required and unperformed in this documentation batch.
