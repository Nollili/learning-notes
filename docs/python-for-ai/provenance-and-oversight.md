# Provenance, Human Oversight and Audit Evidence

Use the existing [evidence resolver](./retrieval-context.md), [approved command executor](./approved-writes.md) and [projected workflow traces](./workflow-diagnostics.md). This intermediate lesson connects their meanings. A citation is not proof of truth; an approval is not a model message; a diagnostic event is not a durable business receipt.

## Follow identities across the workflow

| Boundary | Retained identity/version | What the record establishes and does not establish |
|---|---|---|
| Source acquisition | Authorized source ID, immutable bytes hash, origin/owner and acquisition policy | Which bytes were acquired, not their factual correctness |
| Extraction/chunking | Extractor/chunk policy, locator and exact code-point span | Reconstructable excerpt, not a semantic entailment judgment |
| Retrieval | Authenticated scope, index/embedding generation, query/policy version and retained candidate IDs | Which permitted candidates were selected; avoid content-bearing logs by default |
| Prompt/generation | Application prompt/schema/model/settings revision, accepted evidence snapshot and run ID | Reproducibility metadata; stochastic/provider drift can still change output |
| Validation/review | Checked schema/citations plus separately reviewed claim-support outcome | Mechanical validity and human judgment remain distinct |
| Proposed write | Canonical command hash, resource/expected version and local operation ID | Exact proposed change; the hash alone is not consent |
| User decision | Authenticated actor, exact command binding, decision/expiry and policy | The authorized approval workflow's recorded decision, not a text assertion from a model |
| Execution | Current authorization/version and authoritative receipt | What committed in that transaction domain, not guaranteed external side effects |
| Display/citation open | Current source permission and safe application-owned target | Safe/current access at the checked boundary, not perpetual authorization |

Retain enough provenance to explain a result and investigate failures without copying the whole private corpus into every system. References can themselves reveal private membership; scope access to audit/provenance stores. For reproducible restricted investigations, use approved immutable artifacts with explicit retention/access rather than assume raw source/prompt logging is mandatory. The source lifecycle and cache lessons cover update/deletion and current-version checks.

## Human oversight must happen at an actionable decision

For a rename, show the current resource/title, exact proposed title, expected version, scope and consequences. Explain that the model proposes and the authenticated user decides. Offer clear approve/reject/edit actions, do not bury a write inside a generic “continue” control. Editing changes the command and needs a fresh digest/approval. A reviewer needs relevant source evidence and a usable diff; dumping thousands of tokens or repeatedly asking for trivial approvals can encourage rubber-stamping.

The existing approval executor is the concrete local enforcement: it rechecks current tenant/subject/version and stored exact approval, commits mutation plus receipt atomically, and returns the original receipt on exact replay. Fixture-seeded rows do not represent a real human decision. Build the actual authenticated/CSRF-protected confirmation route separately; the model/tool allowlist must not contain an approve-my-own-proposal capability. A message saying “the user said yes” or a boolean in a model DTO has no approval authority.

Define which actions are read-only, proposal-only, explicitly approved or disallowed. Higher-impact publication, deletion, access changes and external writes require a reviewed policy; do not infer that one approval authorizes a chain of later actions. Use least privilege even after approval. Rejected/expired/stale/unknown outcomes need distinct recovery UI. If the authoritative service cannot determine whether a write happened, stop in unknown and reconcile; a human clicking retry must not silently create a different operation.

## Durable audit differs from a diagnostic buffer

The existing bounded SafeTrace drops old events and counts drops. That is appropriate for a small diagnostic fixture, not an audit history. An audit needs a defined event contract, owner, reliable persistence, controlled readers/writers, retention/integrity policy and operational failure handling. Record safe action/reference metadata and the actual decision/outcome; do not invent a committed event when all you have is a proposed action or a timed-out request.

The following Python3.13/Pydantic2/SQLite fixture stores projected events in a real file. Stable event IDs make replay idempotent; a changed payload under the same ID is a conflict. Recorded time comes from the server clock. The small event vocabulary requires references for source verification, approval and committed/unknown execution. No free-text prompt/result/error field exists.

```python
# study_ai/audit_record.py
from __future__ import annotations

import json
import sqlite3
from datetime import UTC, datetime
from typing import Literal, Self
from pydantic import BaseModel, ConfigDict, Field, model_validator

class AuditEvent(BaseModel):
    model_config = ConfigDict(strict=True, frozen=True, extra='forbid')
    event_id: str = Field(pattern=r'^[a-f0-9]{32}$', max_length=32)
    job_id: str = Field(pattern=r'^[A-Za-z0-9_-]{1,64}$', max_length=64)
    actor_ref: str = Field(pattern=r'^[a-f0-9]{32}$', max_length=32)
    action: Literal['source_verified','approval_recorded','execution_committed','execution_unknown','access_denied']
    source_version: str | None = Field(default=None, pattern=r'^[a-f0-9]{64}$', max_length=64)
    command_hash: str | None = Field(default=None, pattern=r'^[a-f0-9]{64}$', max_length=64)
    receipt_ref: str | None = Field(default=None, pattern=r'^[a-f0-9]{32}$', max_length=32)

    @model_validator(mode='after')
    def required_references(self) -> Self:
        if self.action == 'source_verified' and self.source_version is None:
            raise ValueError('Missing source version')
        if self.action in ('approval_recorded','execution_committed','execution_unknown') and self.command_hash is None:
            raise ValueError('Missing command reference')
        if (self.action == 'execution_committed') != (self.receipt_ref is not None):
            raise ValueError('Invalid receipt reference')
        return self


def initialize_audit(db: sqlite3.Connection) -> None:
    db.executescript('''CREATE TABLE audit_events(
      sequence INTEGER PRIMARY KEY, event_id TEXT NOT NULL UNIQUE,
      recorded_at TEXT NOT NULL, payload TEXT NOT NULL);
      CREATE TRIGGER audit_no_update BEFORE UPDATE ON audit_events
      BEGIN SELECT RAISE(ABORT,'Append only'); END;
      CREATE TRIGGER audit_no_delete BEFORE DELETE ON audit_events
      BEGIN SELECT RAISE(ABORT,'Append only'); END;''')


def append_audit(db: sqlite3.Connection, event: AuditEvent) -> int:
    # Exclusive owned connection, standard legacy transaction mode, no pending transaction.
    payload = json.dumps(event.model_dump(), sort_keys=True, separators=(',', ':'))
    with db:
        db.execute('BEGIN IMMEDIATE')
        existing = db.execute('SELECT sequence,payload FROM audit_events WHERE event_id=?',
                              (event.event_id,)).fetchone()
        if existing is not None:
            if existing[1] != payload:
                raise ValueError('Audit identity conflict')
            return int(existing[0])
        row = db.execute('INSERT INTO audit_events(event_id,recorded_at,payload) VALUES(?,?,?) RETURNING sequence',
                         (event.event_id, datetime.now(UTC).isoformat(), payload)).fetchone()
        if row is None:
            raise RuntimeError('Audit append failed')
        return int(row[0])
```

Use a disposable exclusively owned connection in its normal legacy transaction mode with a short lock timeout and no pending transaction. Initialize once as a migration step; the intentionally non-idempotent setup must not be run on an existing deployed catalog. Close/discard the owner on initialization/rollback failure. Appends acquire a writer lock, match an existing exact event or save one new event in a transaction. The table triggers reject ordinary UPDATE/DELETE, but an administrator could remove them or alter the file; this is not tamper-proof/WORM storage, a cryptographic audit chain or independent proof an event happened.

The service producing an event must verify its authoritative source/approval/receipt first. The audit store records a claim from that trusted service; it does not authenticate the actor or execute the business operation. Opaque actor references are pseudonymous, not anonymous. In a shared deployment include tenant/account ownership in the protected audit service and enforce reader authorization; do not serve this unscoped scratch table as a global audit API. Bound admission and storage growth; a safe schema does not prevent an event flood.

Appending separately after a business transaction can fail after the write committed. Choose a transactionally coupled outbox/audit record when durable event capture is required, or an explicit fail/reconcile policy appropriate to the action. Do not wrap the existing executor in another with-db block and assume nested commits compose: refactor one transaction owner or add the outbox inside its actual transaction. A log-write failure must never cause a blind repeat of an already committed operation. This fixture does not implement that coupling or an external audit export.

## Worked interruption and review record

A verified source revision supports a proposed rename. The user approves the exact command; the executor commits but its network response is lost. The workflow initially records execution_unknown with the command reference, not a fabricated receipt. After reauthentication/current authorization, the same operation ID resolves to the original receipt; record a new execution_committed event referring to that receipt. Keep the earlier unknown event—it describes what was known then. Do not overwrite history to make the run look successful throughout. If source/approval/permission changed, preserve denial/reconciliation rather than fabricate a fresh approval.

A protected investigation can join job ID→source version→command hash→approval record→operation receipt and compare actual outcomes with the visible UI state. It must not infer causation or user consent solely from the sequence number. Sequence is local append order; provider/clock/network events can arrive late. Record trusted event-time metadata separately when the product requires it, with a defined clock/order policy.

```python
# lab_tests/test_audit_record.py
from pathlib import Path
import json,sqlite3
import pytest
from pydantic import ValidationError
from study_ai.audit_record import AuditEvent,initialize_audit,append_audit

def event(**changes):
    return AuditEvent(**{**dict(event_id='a'*32,job_id='job1',actor_ref='b'*32,action='source_verified',source_version='c'*64),**changes})

def test_reopen_exact_replay_and_append_only(tmp_path: Path):
    path=tmp_path/'audit.sqlite';db=sqlite3.connect(path,timeout=.2);initialize_audit(db)
    one=append_audit(db,event());assert append_audit(db,event())==one;db.close();db=sqlite3.connect(path,timeout=.2)
    try:
        assert append_audit(db,event())==one
        with pytest.raises(ValueError):append_audit(db,event(source_version='d'*64))
        for sql in ['DELETE FROM audit_events','UPDATE audit_events SET payload=\'changed\'']:
            with pytest.raises(sqlite3.IntegrityError):db.execute(sql)
            db.rollback()
        row=db.execute('SELECT recorded_at,payload FROM audit_events').fetchone()
        assert '+00:00' in row[0] and json.loads(row[1])['source_version']=='c'*64
    finally:db.close()

@pytest.mark.parametrize('changes',[dict(prompt='PRIVATE'),dict(action='approve_anything'),dict(source_version=None),
    dict(action='execution_committed',command_hash='c'*64),dict(action='access_denied',receipt_ref='c'*32),dict(actor_ref='email@example.test'),dict(event_id='a'*32+'\n')])
def test_projection_and_reference_contract(changes):
    with pytest.raises(ValidationError):event(**changes)

def test_commit_unknown_distinction_and_failure_rollback(tmp_path: Path):
    db=sqlite3.connect(tmp_path/'failure.sqlite',timeout=.2);initialize_audit(db)
    try:
        unknown=event(action='execution_unknown',source_version=None,command_hash='d'*64)
        append_audit(db,unknown)
        committed=event(event_id='e'*32,action='execution_committed',source_version=None,command_hash='d'*64,receipt_ref='f'*32)
        db.execute("CREATE TRIGGER reject_event BEFORE INSERT ON audit_events WHEN NEW.event_id='"+'e'*32+"' BEGIN SELECT RAISE(ABORT,'fixture'); END")
        with pytest.raises(sqlite3.IntegrityError):append_audit(db,committed)
        assert db.execute('SELECT count(*) FROM audit_events').fetchone()==(1,)
        db.execute('DROP TRIGGER reject_event');append_audit(db,committed)
        assert db.execute('SELECT count(*) FROM audit_events').fetchone()==(2,)
    finally:db.close()
```

**Practice acceptance:** trace one source-to-proposal-to-approval-to-receipt example without logging full text. Verify a changed command cannot reuse approval, a forged model approval has no authority, and an unknown outcome is reconciled under the original operation. Reopen the audit file, replay an event, reject changed-payload replay and inject a failed append. Implement a real authenticated review UI plus transactionally coupled audit/outbox in a separate app and show failure behavior without double execution. Test controlled audit readers, tenant scope, event admission, retention/export and missing/dropped-event alerts. Learner implementation and actual human review remain required.

**Validation performed:** exact audit module passed strict mypy. Nine offline tests passed real-file reopen/replay, append-only trigger policy, identity conflict, projected/reference schema failures, unknown-versus-committed events, UTC record time and rollback on injected append failure. Existing approval material was fully read and reused; no live person, business/audit transaction coupling, deployed tenant audit service, tamper-proof storage or external export was tested.

Authoritative references checked2026-10-25: [OWASP transaction authorization](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html), [logging design and sensitive-data exclusions](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html), [Python SQLite transactions](https://docs.python.org/3.13/library/sqlite3.html). These references guide the boundaries; the fixture's tests establish only its stated local behavior.
