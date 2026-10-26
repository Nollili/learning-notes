# Approved Writes, Idempotency and Interrupted Recovery

Read tools can disclose data; write tools also change durable business state. A model proposing a valid rename is not the user's approval. Keep reads and writes as distinct capabilities. In the primary workflow the application shows the exact proposed title/resource/version to the authenticated user, obtains an explicit decision through its trusted UI/API and persists approval before allowing the write executor. Text such as “user approved” in a model response, source, tool result or summary cannot create that record.

## Bind approval to one exact command

Use one canonical command with resource ID, expected version and proposed title. Display the same canonical values the executor will use; changed arguments require a fresh approval. The server owns the approval identity, principal binding and expiry. An approval is not a blanket grant to edit another resource, increase a budget or perform a later unrelated action. Denied/expired/revoked approval stops execution. Recheck current resource permission and version when executing, because they may change after the user saw the proposal.

This SQLite example has one local transaction domain. The trusted approval endpoint stores the command's digest after the real user confirms it; the model dispatcher must not expose that endpoint as an approvable tool. A note row has a tenant/owner, and a matching approval/result key is scoped to that same authenticated principal. A production collaborative owner/role policy needs its own current authorization query.

```python
# study_ai/approved_write.py
from __future__ import annotations

import hashlib
import json
import re
import sqlite3
from dataclasses import dataclass

from .vector_search import Principal


@dataclass(frozen=True, slots=True)
class Rename:
    note_id: str
    expected_version: int
    title: str

    def __post_init__(self) -> None:
        if (re.fullmatch(r"[A-Za-z0-9_-]{1,64}", self.note_id) is None
                or type(self.expected_version) is not int
                or not 0 <= self.expected_version < 1000000
                or not self.title.strip() or self.title != self.title.strip()
                or len(self.title) > 80):
            raise ValueError("Invalid rename")
        if len(self.title.encode("utf-8", errors="strict")) > 320:
            raise ValueError("Invalid rename")

    def digest(self) -> str:
        payload = json.dumps([self.note_id, self.expected_version, self.title],
                             ensure_ascii=False, separators=(",", ":"))
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()


class WriteRejected(Exception):
    pass


def initialize_writes(db: sqlite3.Connection) -> None:
    with db:
        db.execute("""CREATE TABLE IF NOT EXISTS write_notes (
            tenant TEXT, subject TEXT, id TEXT, title TEXT NOT NULL, version INTEGER NOT NULL,
            PRIMARY KEY(tenant,subject,id))""")
        db.execute("""CREATE TABLE IF NOT EXISTS approvals (
            tenant TEXT, subject TEXT, operation_id TEXT, command_hash TEXT NOT NULL,
            expires_at INTEGER NOT NULL, receipt TEXT,
            PRIMARY KEY(tenant,subject,operation_id))""")


def execute_approved_rename(db: sqlite3.Connection, *, principal: Principal,
                            operation_id: str, command: Rename, now: int) -> str:
    # Exclusive owned connection in legacy transaction mode; no pending caller transaction.
    if (re.fullmatch(r"[A-Za-z0-9_-]{1,64}", operation_id) is None
            or type(now) is not int or now < 0):
        raise ValueError("Invalid execution context")
    with db:
        db.execute("BEGIN IMMEDIATE")
        current = db.execute(
            "SELECT version FROM write_notes WHERE tenant=? AND subject=? AND id=?",
            (principal.tenant, principal.subject, command.note_id)).fetchone()
        approval = db.execute(
            "SELECT command_hash,expires_at,receipt FROM approvals WHERE tenant=? AND subject=? AND operation_id=?",
            (principal.tenant, principal.subject, operation_id)).fetchone()
        if current is None or approval is None or approval[0] != command.digest():
            raise WriteRejected("Write unavailable")
        if approval[2] is not None:
            return str(approval[2])  # Original receipt; not a claim about today's resource version.
        if approval[1] <= now or current[0] != command.expected_version:
            raise WriteRejected("Write unavailable")
        changed = db.execute(
            "UPDATE write_notes SET title=?,version=version+1 WHERE tenant=? AND subject=? AND id=? AND version=?",
            (command.title, principal.tenant, principal.subject, command.note_id, command.expected_version))
        if changed.rowcount != 1:
            raise WriteRejected("Write unavailable")
        receipt = json.dumps({"status": "committed", "note_id": command.note_id,
                              "version": command.expected_version + 1}, separators=(",", ":"))
        db.execute(
            "UPDATE approvals SET receipt=? WHERE tenant=? AND subject=? AND operation_id=?",
            (receipt, principal.tenant, principal.subject, operation_id))
        return receipt
```

The schema/setup is a scratch teaching store, not a migration for the existing course/submission database. Initialize and seed only that owned lab database. The trusted approval route inserts a row with the actual principal, server-generated unpredictable operation_id, exact command.digest and reviewed UTC expiry, leaving receipt NULL; it must perform its own authentication/CSRF/confirmation/authorization checks. No such public route is implemented above. Tests seed approvals as fixtures and do not establish that a person approved anything.

now must come from the application clock, never model arguments. A digest binds command bytes but is not a signature or proof of human consent. The trusted approval table supplies that meaning; accepting a client-provided approval row would erase the boundary. Keep operation IDs and approval APIs unavailable to untrusted instruction execution and avoid raw command/secret logging. Parameter binding protects SQL syntax; it does not supply permission checks by itself.

## Commit once in this transaction domain

The executor locks the write transaction, reads current ownership/approval, checks the digest and performs the versioned update plus receipt save atomically. Reusing the same operation ID with different arguments rejects. Replaying a completed exact command returns its stored receipt without repeating the mutation, even after that approval's execution expiry; current resource permission is still checked first. The expiry blocks a **new** execution, while the receipt answers what already happened. Deleting/revoking the approval row stops even a replay; define how authorized users can reconcile a past outcome under the product's retention policy.

This is local atomic idempotency, not a claim of exactly-once network delivery. A crash before commit rolls back both title and receipt. A crash after commit but before the client sees the response can replay the same operation ID to recover the receipt. Do not generate a fresh operation ID merely because a response timed out. A receipt is the original operation result; refresh the current authorized resource separately if other changes may have followed.

External effects cannot be rolled back by this SQLite transaction. Sending an email/payment/network write inside it can succeed remotely and fail locally. Use the external system's idempotency/reconciliation contract and, where appropriate, an outbox with idempotent consumers. Never assume rerunning the whole agent loop fixes an uncertain external effect. Long transactions/locks also cost concurrency; keep model/network calls outside the transaction and persist their checked proposals before execution.

The connection is exclusively owned, uses the standard legacy transaction mode and must have no existing transaction; BEGIN IMMEDIATE makes the local critical section explicit. Configure a short busy timeout and map lock/disk/storage failures to safe operational errors. Close the connection on shutdown. This synchronous fixture does not implement async cancellation, production concurrency limits, retry backoff or distributed leases. Unexpected errors must not be reported as a successful write.

## UI and workflow recovery

Show pending proposal → awaiting user decision → approved/pending execution → committed/failed/unknown-outcome states separately. A disabled button prevents ordinary duplicate interactions but cannot stop replayed requests; the atomic server operation is the durable boundary. Allow cancellation before dispatch by revoking/withholding the approval. Once committed, aborting a UI request cannot undo the write; a user-requested undo is a new authorized/versioned operation. Keep the previous approved command visible so a retry cannot silently change its meaning.

Resume a checkpoint by reauthenticating/rechecking ownership, resolving the exact operation ID and inspecting its receipt. If committed, resume downstream display from the receipt; if approval exists/unexpired without a receipt, the same idempotent executor may run under its remaining budget. If revoked/expired/stale, stop for a fresh reviewed proposal. Persist a controlled unknown state when the external authority cannot answer; do not claim success or create a new write blindly. Source/tool text cannot approve that retry or replenish the resource budget.

## Practice and acceptance

Create a temporary SQLite file; seed one authorized note/approval through fixture code. Execute, close/reopen and replay: require the same receipt and exactly one version increment. Change title/version under the same operation ID and require rejection. Test missing/expired approval, stale version, foreign tenant/subject, revoked note/approval, malformed IDs/Unicode/bounds and storage lock failure. Inject a failure between note update and receipt update and verify both roll back; replay after a simulated lost response must not repeat the write. Test two competing connections/operations against the same expected version; only a compatible single mutation may commit.

Then implement the trusted user-confirmation route/UI in a separate practice app. Verify it shows exact command values, defends its authenticated mutation route, binds approval expiry/principal/digest and cannot be invoked through the model tool allowlist. A forged model “approved:true” field must have no authority. Retain evidence for denied/revoked/replayed/interrupted cases and safe recoverable UX. The local executor/material can be checked independently; real human approval, server/UI integration, concurrent worker deployment, external-effect idempotency and learner practice remain required.

References checked2026-10-25: [SQLite transaction atomicity](https://www.sqlite.org/atomiccommit.html), [Python SQLite transaction control](https://docs.python.org/3.13/library/sqlite3.html), [OWASP transaction authorization](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html), [read tool boundary](./tool-boundaries.md), [workflow revisions and budgets](./tool-workflow-state.md). No real note, payment, external service or user approval is exercised by the scratch tests.
