# Tool Workflow State, Routing and Durable Revisions — practice

**Learner status: still required.** These requirements were separated from the textbook. Use the [integrated sequence](../index.md) and shared evidence record; running reference checks is not independent completion.

[Textbook](../../../python-for-ai/tool-workflow-state.md)

## Practice and acceptance

Use Python's sqlite3 in a temporary file with two separately owned connections and explicit short busy timeout. Create/load/save state, close/reopen and verify the same validated revision survives. Test duplicate creation, stale expected version, missing row update, invalid version/bool/ID, same-ID foreign tenant/subject isolation, invalid persisted JSON and SQL parameter handling. Require a conflict leaves the prior row unchanged and does not roll back another caller's transaction; each store owns its connection. Run state tests for success, three consecutive temporary failures, terminal denied/schema failures, illegal stage order and checked-false answer.

Author a runner trace that maps each stage to exactly one allowlisted operation and a controlled failure result; prove completed/failed schedules no more calls. Add a real storage outage/lock fixture and preserve its operational category. Then implement the missing artifact/retention/recovery contract before calling it a resumable service. Acceptance: observed local persistence/CAS/state checks pass; scope and retry policy are explicit; no fake model output can choose principal/routing or claim validation. Production scheduling, full answering runner, distributed lease/queue, effectful idempotency and learner implementation remain separate work.

**Additional acceptance for23.11–23.14:** strict-typecheck/run RunBudget tests for exact byte budget, Unicode byte count, zero calls, per-result cap, invalid/bool/negative limits, immutable originals and serialization/restoration without reset. Simulate three reserves and require a fourth dispatch never occurs. Add a fake-clock runner test that stops before a call after expiry and owns cancellation during a blocked operation; explain why preflight clocks alone are insufficient. For the full checkpoint exercise, validate artifact/schema/owner/configuration/source revision, stale-save conflicts and expired/revoked resume cases. Retain evidence for what was actually implemented.

Local budget/dispatch tests establish those components; durable artifact recovery, deadline runner, distributed reservations, monetary accounting and learner end-to-end practice remain required.
