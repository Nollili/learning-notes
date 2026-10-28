# P-335: resumable approved tool workflow

**Learner status: still required.** Refines [existing P-335](../ai-project.md#p-335), using the same notes and evaluation cases. Prerequisites: typed tool dispatch, current identity/source checks, SQLite transactions/CAS, cancellation/budgets and [resumable-run design](../../applied-ai/workflows/resumable-runs.md). Use [shared evidence](./index.md#evidence-for-every-stage).

## WF-1: fixed read, propose, validate

**Scope:** one task-scoped note lookup and a proposed exact title change. Start with deterministic application-owned proposals; one bounded model-directed lookup/finish branch is optional, separately evaluated.

**Acceptance:** complete arguments/results validate; exact names and current principal/task scope are outside model control. Unknown tool, extra tenant field, forged call ID, partial arguments and exhausted rounds cause zero disallowed I/O. Map validated outcomes to fixed trace categories; do not log raw arguments/results. Terminal states schedule no more work. A model's `approved` or `checked` field has no authority.

**Failures/evidence:** three temporary read failures end under a two-retry policy; denied/schema failures execute once; repeated lookup cannot loop forever. Retain call/result identity, stage trace, allow/deny counts and schema/routing counterexamples. Model behavior is unmeasured if only a fake proposal was used.

## WF-2: artifacts and durable approval

**Scope:** one owned local database and bounded immutable input/proposal/result artifacts. Add authenticated approval through a separate trusted test route/UI; fixture-seeded rows test the executor but do not prove a real person approved.

**Acceptance:** checkpoint schema includes owner/job/revision, exact artifact references/digests, source/configuration revisions, remaining limits and expiry. Persist artifact plus stage atomically or use documented staging/commit/cleanup. Show the exact command/resource/version to the actor; bind persisted approval to digest/principal/scope/expiry. Editing the proposal needs a new approval. The model allowlist cannot call the approval route.

**Failures:** absent/tampered artifact, stale CAS, wrong owner/configuration, expired/revoked approval, changed resource version and malicious source instructions. Reopen the file in a new process and resume only valid/current artifacts. No RAM-only graph snapshot is counted as durable.

**Evidence:** actual restart/serialization records, denial results, UI/route observations, current source decisions and proof that a changed command cannot reuse approval.

## WF-3: receipt and interrupted recovery

**Scope:** one local versioned rename, stable operation ID and atomic effect/receipt. No email/payment/external write is necessary.

**Acceptance:** inject interruption before dispatch, after commit/before reply and after receipt/before job advance. Reopen/resume; same operation/same command yields the original receipt with one version increment, changed command conflicts. Competing workers cannot dispatch merely from the same stale counter; use a single owner initially and a tested atomic claim if concurrency is added.

**Failures:** approval revoked on resume, lock/store outage, transaction failure between effect and receipt, missing result artifact and stale worker update. For a fake external adapter, simulate committed-but-reply-lost: persist unknown, query its authoritative status and never mint a new key blindly. Local SQL does not roll back remote effects.

**Evidence:** command hash/operation ID/checkpoint revision, effect count, receipts and rollback/reconciliation observations. A lease expiring is not proof the remote job stopped.

## WF-4: time, retries, budgets and evaluation

**Scope:** at most five tools/one write per run, a declared UTC expiry plus local monotonic durations, per-operation deadlines and a conservative local spend reserve. Values are exercise caps, not industry defaults.

**Acceptance:** charge reservation before calls and preserve it across restart; total calls/bytes/time/spend cannot reset on resume. Classified retries honor backoff/server minima or defer. Cancellation reaches owned work and does not retry. Unknown usage remains held; settlement replay cannot refund twice. A pending reservation causes reconciliation, not a second job.

**Failures/evidence:** blocked adapter, timeout, cancellation during sleep/read, over-budget proposal, missing usage, underestimate overrun and duplicate concurrent reservation. Compare complete task success and safety against the fixed baseline; record all attempts/failures, safe correlated traces, hard gates and rubric judgments. Real provider quality, distributed leases, real human consent and external-effect integration remain unperformed unless separately observed.
