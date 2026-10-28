# Operating model applications, ETL and a small review UI — practice

**Learner status: still required.** These requirements were separated from the textbook. Use the [integrated sequence](../index.md) and shared evidence record; running reference checks is not independent completion.

[Textbook](../../../python-for-ai/operations-and-data.md)

**Practice acceptance:** retain a baseline and candidate manifest, paired outcomes and declared cost units; prove a faster unsafe candidate and an unknown-cost candidate fail. Exercise an artifact rollback and source revocation after rollback. Write an owner/runbook for quality alert, cost spike, provider retirement and accidental data export. Real canary/model-quality/production measurements remain learner work; no MLflow server or live provider was used in this fixture.

**Practice acceptance:** run retry, two-tenant isolation, failed-middle-batch rollback and update→delete→stale-update cases. Prove the cursor does not move on rejection, a fresh connection sees committed state, and rebuilding derivatives omits tombstones. Add a source schema-version change and a bounded backfill plan. Distributed ingestion, real source connectors, malware-isolated document parsing and production deletion evidence remain separate practice.

**Practice acceptance:** add a validation form, explicit loading/error/empty states and a recoverable failed backend job. Prove ordinary reruns do not duplicate submissions; persist a durable operation ID before a real write and resolve unknown outcomes. Use AppTest for state transitions, then inspect keyboard/zoom/accessibility and two actual authenticated sessions separately. Compare whether this remains an internal prototype or belongs in the primary React app; avoid rewriting the whole product merely to try a tool.
