# study_ai/workflow_trace.py
from __future__ import annotations

import re
from collections import deque
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, ValidationError

Stage = Literal["lookup", "answer", "persist"]
Outcome = Literal["ok", "invalid_arguments", "unavailable", "temporary_failure",
                  "conflict", "invalid_output", "stopped"]


class SafeEvent(BaseModel):
    model_config = ConfigDict(strict=True, frozen=True, extra="forbid")
    run_id: str = Field(pattern=r"^[a-f0-9]{32}$")
    sequence: int = Field(ge=1, le=1000000)
    stage: Stage
    outcome: Outcome
    attempt: int = Field(ge=1, le=6)
    duration_ms: float = Field(ge=0, le=600000, allow_inf_nan=False)


class SafeTrace:
    def __init__(self, run_id: str, *, capacity: int = 50) -> None:
        if (re.fullmatch(r"[a-f0-9]{32}", run_id) is None
                or type(capacity) is not int or not 1 <= capacity <= 100):
            raise ValueError("Invalid trace configuration")
        self._run_id = run_id
        self._events: deque[SafeEvent] = deque(maxlen=capacity)
        self._sequence = 0
        self.dropped = 0

    def record(self, *, stage: Stage, outcome: Outcome, attempt: int, duration_ms: float) -> None:
        try:
            event = SafeEvent(run_id=self._run_id, sequence=self._sequence + 1,
                              stage=stage, outcome=outcome, attempt=attempt, duration_ms=duration_ms)
        except ValidationError:
            # Validation errors may include rejected values; do not expose/log them here.
            raise ValueError("Invalid trace event") from None
        if len(self._events) == self._events.maxlen:
            self.dropped += 1
        self._events.append(event)
        self._sequence += 1

    def snapshot(self) -> tuple[SafeEvent, ...]:
        return tuple(self._events)

    def json_lines(self) -> str:
        return "\n".join(event.model_dump_json() for event in self._events)
