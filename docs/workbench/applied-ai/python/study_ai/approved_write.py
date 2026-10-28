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
