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
