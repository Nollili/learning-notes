# study_ai/note_tool.py
from __future__ import annotations

import json
import re
from dataclasses import dataclass
from typing import Literal, Protocol

from openai.types.responses import FunctionToolParam
from pydantic import BaseModel, ConfigDict, Field, ValidationError

from .vector_search import Principal


class LookupArguments(BaseModel):
    model_config = ConfigDict(strict=True, extra="forbid")
    source_id: str = Field(pattern=r"^[A-Za-z0-9_-]{1,64}$")


def lookup_definition() -> FunctionToolParam:
    return {"type": "function", "name": "lookup_note",
            "description": "Read an available note excerpt under the current user's permissions.",
            "parameters": LookupArguments.model_json_schema(), "strict": True}


@dataclass(frozen=True, slots=True)
class StoredNote:
    tenant: str
    subjects: frozenset[str]
    source_id: str
    revision: str
    text: str

    def __post_init__(self) -> None:
        if (re.fullmatch(r"[A-Za-z0-9_-]{1,64}", self.source_id) is None
                or re.fullmatch(r"[a-f0-9]{64}", self.revision) is None
                or not 1 <= len(self.text) <= 4000):
            raise ValueError("Invalid stored note")
        if len(self.text.encode("utf-8", errors="strict")) > 8000:
            raise ValueError("Invalid stored note")


class StoreUnavailable(Exception):
    pass


class NoteStore(Protocol):
    def get(self, source_id: str) -> StoredNote | None: ...


class ToolSuccess(BaseModel):
    model_config = ConfigDict(strict=True, extra="forbid")
    status: Literal["ok"] = "ok"
    source_id: str
    revision: str
    excerpt: str = Field(min_length=1, max_length=500)
    truncated: bool


class ToolError(BaseModel):
    model_config = ConfigDict(strict=True, extra="forbid")
    status: Literal["invalid_arguments", "unavailable", "temporary_failure", "unknown_tool"]


def _unique_object(pairs: list[tuple[str, object]]) -> dict[str, object]:
    result: dict[str, object] = {}
    for key, value in pairs:
        if key in result:
            raise ValueError("Duplicate argument")
        result[key] = value
    return result


def _invalid_constant(value: str) -> object:
    raise ValueError("Non-JSON constant")


def dispatch_note_tool(name: str, arguments: str, *, principal: Principal, store: NoteStore) -> str:
    if name != "lookup_note":
        return ToolError(status="unknown_tool").model_dump_json()
    try:
        if len(arguments) > 2048 or len(arguments.encode("utf-8", errors="strict")) > 2048:
            raise ValueError("Argument limit")
        parsed: object = json.loads(arguments, object_pairs_hook=_unique_object,
                                    parse_constant=_invalid_constant)
        request = LookupArguments.model_validate(parsed)
    except (ValueError, ValidationError, RecursionError):
        return ToolError(status="invalid_arguments").model_dump_json()
    try:
        note = store.get(request.source_id)
    except StoreUnavailable:
        return ToolError(status="temporary_failure").model_dump_json()
    if (note is None or note.source_id != request.source_id or note.tenant != principal.tenant
            or principal.subject not in note.subjects):
        return ToolError(status="unavailable").model_dump_json()
    return ToolSuccess(source_id=note.source_id, revision=note.revision,
                       excerpt=note.text[:500], truncated=len(note.text) > 500).model_dump_json()
