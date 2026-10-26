# Tool Workflow State, Routing and Durable Revisions

A fixed workflow has application-defined stages and routes; an agent lets model proposals influence the next allowed step. Both still need explicit permissions, bounded resources and observable state. For one known note lookup followed by a checked answer, begin with a fixed workflow. Adding an unconstrained planner creates additional looping/routing/evaluation work without supplying a missing product requirement.

Use the [validated read tool](./tool-boundaries.md) and [checked evidence/answer boundaries](./retrieval-context.md). This lesson adds a small state machine and real local SQLite persistence. It does not implement model generation, an autonomous agent, a durable write tool or production job scheduling.

## One route and a finite read retry policy

State is a validated domain record. It does not store a model's reasoning transcript or a free-form next function name. The application routes lookup_pending to the exact read-tool dispatcher, answer_pending to its checked answer adapter and terminal states to no further work. Never eval/import a state string or let model output choose tenant, tools, endpoint or persisted job ID.

Only an explicit temporary storage failure permits up to2 additional read attempts here. Missing/denied/schema/unknown-tool failures are terminal under this fixture's policy. A successful read moves forward; it does not grant permission to publish, write or skip answer validation. Counter/provider errors in the answer stage need their own classified policy, not reuse of the read retry count.

```python
# study_ai/tool_state.py
from __future__ import annotations

import re
import sqlite3
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from .vector_search import Principal


class JobState(BaseModel):
    model_config = ConfigDict(strict=True, frozen=True, extra="forbid")
    stage: Literal["lookup_pending", "answer_pending", "completed", "failed"] = "lookup_pending"
    retries: int = Field(default=0, ge=0, le=2)


def after_lookup(state: JobState, outcome: Literal[
        "ok", "invalid_arguments", "unavailable", "temporary_failure", "unknown_tool"]) -> JobState:
    if state.stage != "lookup_pending":
        raise ValueError("Lookup out of order")
    if outcome == "ok":
        return JobState(stage="answer_pending", retries=state.retries)
    if outcome == "temporary_failure" and state.retries < 2:
        return JobState(retries=state.retries + 1)
    if outcome not in {"invalid_arguments", "unavailable", "temporary_failure", "unknown_tool"}:
        raise ValueError("Unknown lookup outcome")
    return JobState(stage="failed", retries=state.retries)


def after_answer(state: JobState, *, checked: bool) -> JobState:
    if state.stage != "answer_pending" or type(checked) is not bool:
        raise ValueError("Answer out of order")
    return JobState(stage="completed" if checked else "failed", retries=state.retries)


class RevisionConflict(Exception):
    pass


class JobStore:
    # Own this connection exclusively; these methods commit/rollback their own transaction.
    def __init__(self, connection: sqlite3.Connection) -> None:
        self.connection = connection
        with connection:
            connection.execute("""CREATE TABLE IF NOT EXISTS jobs (
                tenant TEXT NOT NULL, subject TEXT NOT NULL, job_id TEXT NOT NULL,
                version INTEGER NOT NULL, state TEXT NOT NULL,
                PRIMARY KEY (tenant, subject, job_id))""")

    @staticmethod
    def _id(job_id: str) -> None:
        if re.fullmatch(r"[A-Za-z0-9_-]{1,64}", job_id) is None:
            raise ValueError("Invalid job ID")

    def load(self, job_id: str, *, principal: Principal) -> tuple[int, JobState] | None:
        self._id(job_id)
        row = self.connection.execute(
            "SELECT version,state FROM jobs WHERE tenant=? AND subject=? AND job_id=?",
            (principal.tenant, principal.subject, job_id)).fetchone()
        return None if row is None else (int(row[0]), JobState.model_validate_json(row[1]))

    def save(self, job_id: str, state: JobState, *, principal: Principal,
             expected_version: int | None) -> int:
        self._id(job_id)
        if expected_version is not None and (type(expected_version) is not int
                or not 0 <= expected_version < 1000000):
            raise ValueError("Invalid expected version")
        version = 0 if expected_version is None else expected_version + 1
        with self.connection:
            if expected_version is None:
                result = self.connection.execute(
                    "INSERT INTO jobs VALUES(?,?,?,?,?) ON CONFLICT DO NOTHING",
                    (principal.tenant, principal.subject, job_id, version, state.model_dump_json()))
            else:
                result = self.connection.execute(
                    "UPDATE jobs SET version=?,state=? WHERE tenant=? AND subject=? AND job_id=? AND version=?",
                    (version, state.model_dump_json(), principal.tenant, principal.subject,
                     job_id, expected_version))
            if result.rowcount != 1:
                raise RevisionConflict("Job revision changed")
        return version
```

The store uses parameterized values, current application-owned principal scope and compare-and-set versions. A stale worker cannot overwrite a newer revision of the same scoped row. A duplicate create also conflicts. The same job_id under another principal names a different row, not the first user's state. This does not establish a product's sharing/ownership-transfer policy; extend that policy explicitly if jobs are shared. Source permissions still require rechecking at each tool/source boundary, even if job ownership is unchanged.

A connection belongs to this store and must not carry someone else's pending transaction. Close it on owner shutdown. SQLite lock/busy/disk errors are operational failures, not RevisionConflict, no evidence or a successful save. Configure connection timeout/transaction mode and the worker's cancellation boundary deliberately. A synchronous local DB operation should not block a production async event loop indefinitely; use an owned worker/adapter with bounded concurrency. The local example uses a file to demonstrate persistence, not a distributed queue or multi-region database.

## Execute and checkpoint without inventing success

Example route: create version0/lookup_pending; dispatch one validated lookup; map temporary_failure to lookup_pending/retries1 and save expected_version0→1; delay according to the workflow's [bounded retry policy](./model-work-budgets.md), not a tight immediate loop. A later successful read yields answer_pending and version2. After all actual answer gates pass, after_answer(checked=True) yields completed/version3. checked must come from application-owned validation; never accept the model's claimed “validated” boolean. A failed gate produces failed, not a published partial answer.

The2-retry cap bounds only read attempts, not elapsed time, total provider calls or spend. The runner still needs an overall deadline/call budget, per-operation timeout/backoff/jitter and a deliberate stop state. Authentication/schema failures should not be retried as transient. Do not retry arbitrary writes using this read-only policy: a timed-out write may already have committed and needs durable idempotency/reconciliation. Cancelled tasks must not be caught and restarted as ordinary retries.

Persist **checked stage state**, not a promise or a model's free-form plan. For a complete resumable job, also store a bounded immutable reference to its authorized input/result artifacts, source/configuration versions and remaining budget under a retention policy. The tiny state record intentionally contains none of the private source bytes. Consequently answer_pending alone cannot reconstruct an answer: the runner must reload/revalidate the relevant input/result artifact or restart the safe read stage under a documented recovery transition. Do not fabricate a missing artifact or claim that these stage flags alone provide exactly-once execution.

A crash after a read but before saving can repeat that read; it has no intended business mutation, but still consumes resources. A crash after an external write but before saving would be a different problem: never mark it failed and repeat blindly. Persist a durable operation identity and reconcile the authoritative write result before a subsequent transition. A transaction on this SQLite row cannot atomically commit another service's effect.

## Practice and acceptance

Use Python's sqlite3 in a temporary file with two separately owned connections and explicit short busy timeout. Create/load/save state, close/reopen and verify the same validated revision survives. Test duplicate creation, stale expected version, missing row update, invalid version/bool/ID, same-ID foreign tenant/subject isolation, invalid persisted JSON and SQL parameter handling. Require a conflict leaves the prior row unchanged and does not roll back another caller's transaction; each store owns its connection. Run state tests for success, three consecutive temporary failures, terminal denied/schema failures, illegal stage order and checked-false answer.

Author a runner trace that maps each stage to exactly one allowlisted operation and a controlled failure result; prove completed/failed schedules no more calls. Add a real storage outage/lock fixture and preserve its operational category. Then implement the missing artifact/retention/recovery contract before calling it a resumable service. Acceptance: observed local persistence/CAS/state checks pass; scope and retry policy are explicit; no fake model output can choose principal/routing or claim validation. Production scheduling, full answering runner, distributed lease/queue, effectful idempotency and learner implementation remain separate work.

References checked2026-10-24: [Python3.13 SQLite transaction control](https://docs.python.org/3.13/library/sqlite3.html), [Pydantic strict mode](https://docs.pydantic.dev/latest/concepts/strict_mode/), [tool dispatch boundary](./tool-boundaries.md), [workflow/checkpoint design](./history-and-workflows.md). No new orchestration framework or model/provider call is required.

## Whole-run limits and a serializable checkpoint

Per-tool retry limits do not bound an entire agent run. Reserve a call before dispatch, account bounded result bytes, and carry the remaining budget across recovery. Exhaustion is a controlled stop requiring an explicit product decision, not permission to reset counters and retry. Calls that fail, time out or crash may still consume resources; conservative reservation avoids granting a free new budget on every restart. Provider spend needs its own atomic shared reservation/usage ledger; result bytes and call counts are not money.

```python
# study_ai/workflow_budget.py
from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class RunStopped(Exception):
    pass


class RunBudget(BaseModel):
    model_config = ConfigDict(strict=True, frozen=True, extra="forbid")
    calls_left: int = Field(ge=0, le=6)
    result_bytes_left: int = Field(ge=0, le=16384)

    def reserve_call(self) -> RunBudget:
        if self.calls_left == 0:
            raise RunStopped("Call budget exhausted")
        return RunBudget(calls_left=self.calls_left - 1,
                         result_bytes_left=self.result_bytes_left)

    def record_result(self, result: str) -> RunBudget:
        # Transport/tool adapter separately bounds allocation before this accounting step.
        if len(result) > 8192:
            raise RunStopped("Result budget exhausted")
        try:
            size = len(result.encode("utf-8", errors="strict"))
        except UnicodeEncodeError:
            raise RunStopped("Invalid result encoding") from None
        if size > min(8192, self.result_bytes_left):
            raise RunStopped("Result budget exhausted")
        return RunBudget(calls_left=self.calls_left,
                         result_bytes_left=self.result_bytes_left - size)
```

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

**Worked recovery:** workerA reserves a read call and persists revision2 before dispatch. It stores a checked result artifact and atomically advances the checkpoint to answer_pending/revision3. A crash after revision3 reloads and reauthorizes the referenced artifact, verifies source/configuration/expiry and resumes the answer stage under the remaining budget. A crash between read completion and checkpoint save may need another authorized read, charged to the budget; the old unreferenced artifact needs cleanup. A stale worker trying to save revision2 after revision3 gets RevisionConflict. A revoked source stops or restarts through the documented safe transition; it never uses the private cached prefix. The small JobStore above persists only stage/retry flags, so implementing this fuller record/artifact transaction is an explicit learner extension before claiming this recovery path is implemented.

## Read capabilities still need boundaries

A read tool cannot intentionally change business data in its contract, but it can disclose private material, trigger logs, spend money, overload a service or fetch hostile content. Authorize each read and limit resource scope, bytes, time and count. The exact lookup_note allowlist and current principal checks are the primary worked example. No general file/URL/SQL/shell access is implied. Treat lookup output as untrusted data and source version evidence; do not promote a returned “approved” sentence into a write permission. A read-only local fixture is a useful first integration boundary, not a reason to omit privacy/security testing.

**Additional acceptance for23.11–23.14:** strict-typecheck/run RunBudget tests for exact byte budget, Unicode byte count, zero calls, per-result cap, invalid/bool/negative limits, immutable originals and serialization/restoration without reset. Simulate three reserves and require a fourth dispatch never occurs. Add a fake-clock runner test that stops before a call after expiry and owns cancellation during a blocked operation; explain why preflight clocks alone are insufficient. For the full checkpoint exercise, validate artifact/schema/owner/configuration/source revision, stale-save conflicts and expired/revoked resume cases. Retain evidence for what was actually implemented. Local budget/dispatch tests establish those components; durable artifact recovery, deadline runner, distributed reservations, monetary accounting and learner end-to-end practice remain required.
