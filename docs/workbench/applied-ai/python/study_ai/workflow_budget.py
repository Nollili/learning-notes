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
