# Tool Workflow State, Routing and Durable Revisions

A fixed workflow has application-defined stages and routes; an agent lets model proposals influence the next allowed step. Both still need explicit permissions, bounded resources and observable state. For one known note lookup followed by a checked answer, begin with a fixed workflow. Adding an unconstrained planner creates additional looping/routing/evaluation work without supplying a missing product requirement.

Use the [validated read tool](./tool-boundaries.md) and [checked evidence/answer boundaries](./retrieval-context.md). This lesson adds a small state machine and real local SQLite persistence. It does not implement model generation, an autonomous agent, a durable write tool or production job scheduling.

## One route and a finite read retry policy

State is a validated domain record. It does not store a model's reasoning transcript or a free-form next function name. The application routes lookup_pending to the exact read-tool dispatcher, answer_pending to its checked answer adapter and terminal states to no further work. Never eval/import a state string or let model output choose tenant, tools, endpoint or persisted job ID.

Only an explicit temporary storage failure permits up to2 additional read attempts here. Missing/denied/schema/unknown-tool failures are terminal under this fixture's policy. A successful read moves forward; it does not grant permission to publish, write or skip answer validation. Counter/provider errors in the answer stage need their own classified policy, not reuse of the read retry count.

<<< ../workbench/applied-ai/python/study_ai/tool_state.py


The store uses parameterized values, current application-owned principal scope and compare-and-set versions. A stale worker cannot overwrite a newer revision of the same scoped row. A duplicate create also conflicts. The same job_id under another principal names a different row, not the first user's state. This does not establish a product's sharing/ownership-transfer policy; extend that policy explicitly if jobs are shared. Source permissions still require rechecking at each tool/source boundary, even if job ownership is unchanged.

A connection belongs to this store and must not carry someone else's pending transaction. Close it on owner shutdown. SQLite lock/busy/disk errors are operational failures, not RevisionConflict, no evidence or a successful save. Configure connection timeout/transaction mode and the worker's cancellation boundary deliberately. A synchronous local DB operation should not block a production async event loop indefinitely; use an owned worker/adapter with bounded concurrency. The local example uses a file to demonstrate persistence, not a distributed queue or multi-region database.

## Execute and checkpoint without inventing success

Example route: create version0/lookup_pending; dispatch one validated lookup; map temporary_failure to lookup_pending/retries1 and save expected_version0→1; delay according to the workflow's [bounded retry policy](./model-work-budgets.md), not a tight immediate loop. A later successful read yields answer_pending and version2. After all actual answer gates pass, after_answer(checked=True) yields completed/version3. checked must come from application-owned validation; never accept the model's claimed “validated” boolean. A failed gate produces failed, not a published partial answer.

The2-retry cap bounds only read attempts, not elapsed time, total provider calls or spend. The runner still needs an overall deadline/call budget, per-operation timeout/backoff/jitter and a deliberate stop state. Authentication/schema failures should not be retried as transient. Do not retry arbitrary writes using this read-only policy: a timed-out write may already have committed and needs durable idempotency/reconciliation. Cancelled tasks must not be caught and restarted as ordinary retries.

Persist **checked stage state**, not a promise or a model's free-form plan. For a complete resumable job, also store a bounded immutable reference to its authorized input/result artifacts, source/configuration versions and remaining budget under a retention policy. The tiny state record intentionally contains none of the private source bytes. Consequently answer_pending alone cannot reconstruct an answer: the runner must reload/revalidate the relevant input/result artifact or restart the safe read stage under a documented recovery transition. Do not fabricate a missing artifact or claim that these stage flags alone provide exactly-once execution.

A crash after a read but before saving can repeat that read; it has no intended business mutation, but still consumes resources. A crash after an external write but before saving would be a different problem: never mark it failed and repeat blindly. Persist a durable operation identity and reconcile the authoritative write result before a subsequent transition. A transaction on this SQLite row cannot atomically commit another service's effect.

## Practice and acceptance

[Separate exercises and acceptance criteria](../practice/applied-ai/chapters/tool-workflow-state.md).

References checked2026-10-24: [Python3.13 SQLite transaction control](https://docs.python.org/3.13/library/sqlite3.html), [Pydantic strict mode](https://docs.pydantic.dev/latest/concepts/strict_mode/), [tool dispatch boundary](./tool-boundaries.md), [workflow/checkpoint design](./history-and-workflows.md). No new orchestration framework or model/provider call is required.

## Whole-run limits and a serializable checkpoint

Per-tool retry limits do not bound an entire agent run. Reserve a call before dispatch, account bounded result bytes, and carry the remaining budget across recovery. Exhaustion is a controlled stop requiring an explicit product decision, not permission to reset counters and retry. Calls that fail, time out or crash may still consume resources; conservative reservation avoids granting a free new budget on every restart. Provider spend needs its own atomic shared reservation/usage ledger; result bytes and call counts are not money.

<<< ../workbench/applied-ai/python/study_ai/workflow_budget.py


Example initial calls_left3/result_bytes_left1000: reserve a read→2/1000; account a200-byte result→2/800. Persist the checked remaining values with the job revision. Reloading that checkpoint retains2/800, not a new3/1000 budget. Each additional attempt reserves another call. A600-character emoji string is2400UTF-8 bytes and must not be admitted merely because600<800. This is deterministic local accounting, not a monetary estimate or a distributed semaphore. Use one serialized owner or an atomic compare-and-set reservation; two workers reading the same counter must not both dispatch before one wins the reservation.

The application must impose an overall deadline and per-operation deadline in addition to these counters. Use a monotonic clock for elapsed time within a running process; do not persist its numeric timestamp as a portable deadline across machines/restarts. Persist a trusted UTC expiry and on resume apply a conservative clock/skew policy to derive a new local remaining duration. When expired, stop before any call. Await actual adapter work inside owned time/cancellation boundaries; checking a clock before a blocking call cannot forcibly end it. The existing [async HTTP](./async-http.md) and [model deadlines](./model-streaming.md) lessons provide the primary transport patterns.

### Checkpoint record and recovery trace

A complete checkpoint needs a versioned schema and application-owned references, for example:

```json
{
  "schema_version": 1,
  "job_id": "job_42",
  "revision": 3,
  "next_stage": "answer_pending",
  "input_artifact": "approved-input-v2",
  "read_result_artifact": "approved-read-v7",
  "source_revision": "approved-source-v7",
  "configuration_version": "lookup-answer-v1",
  "calls_left": 2,
  "result_bytes_left": 800,
  "expires_at": "2026-10-25T12:00:00Z"
}
```

This is an illustrative application record, not a provider API request or a claim that those artifacts exist. Its trusted owner is stored under authenticated tenant/subject scope, separately from model-generated fields. References resolve to bounded immutable authorized artifacts with a retention policy; names alone are not proof of existence/access. Validate every field, allowed stage/schema/configuration and budget before loading artifacts. Do not store credentials, live handles, callbacks, arbitrary file paths or a free-form instruction that can redirect recovery. The expiry is a fixture value, not a universal retention policy.

**Worked recovery:** workerA reserves a read call and persists revision2 before dispatch. It stores a checked result artifact and atomically advances the checkpoint to answer_pending/revision3. A crash after revision3 reloads and reauthorizes the referenced artifact, verifies source/configuration/expiry and resumes the answer stage under the remaining budget. A crash between read completion and checkpoint save may need another authorized read, charged to the budget; the old unreferenced artifact needs cleanup. A stale worker trying to save revision2 after revision3 gets RevisionConflict. A revoked source stops or restarts through the documented safe transition; it never uses the private cached prefix.

The small JobStore above persists only stage/retry flags, so implementing this fuller record/artifact transaction is an explicit learner extension before claiming this recovery path is implemented.

## Read capabilities still need boundaries

A read tool cannot intentionally change business data in its contract, but it can disclose private material, trigger logs, spend money, overload a service or fetch hostile content. Authorize each read and limit resource scope, bytes, time and count. The exact lookup_note allowlist and current principal checks are the primary worked example. No general file/URL/SQL/shell access is implied. Treat lookup output as untrusted data and source version evidence; do not promote a returned “approved” sentence into a write permission. A read-only local fixture is a useful first integration boundary, not a reason to omit privacy/security testing.

[Related learner criteria](../practice/applied-ai/chapters/tool-workflow-state.md).
