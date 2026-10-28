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
