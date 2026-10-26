# Typed Tool Arguments, Authorization and Results

A model tool call is a proposed application operation. A schema describes acceptable argument shapes; it does not grant permission, execute a function or establish correctness. Keep the primary Python3.13/OpenAI SDK3.35.1 project and a small allowlist of application-owned tools. Start with one read-only note lookup rather than a general shell, SQL or arbitrary-URL tool.

## The contract before the loop

The model proposes lookup_note with a source_id. The application obtains the principal from its authenticated session, validates the argument bytes/schema, loads the current record, checks tenant and subject permission and returns a projected bounded result. The model cannot supply tenant, subject, credentials or permission flags. A guessed source ID cannot expand access. Tool output is untrusted evidence for later reasoning, never a new application instruction.

A current record read is important: index-time permission and a conversation's earlier permission may be stale. This in-process fixture demonstrates the decision boundary; a real store must specify current authorization consistency and fail closed on unavailable/deleted/revoked data. Do not claim a dictionary fixture implements durable ACL transactions.

```python
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
```

The tool definition is the pinned SDK's function-tool shape; it does not invoke a model. Strict structured arguments help generation, while the application still parses and validates every call. Additional fields, wrong types, duplicate JSON keys, non-JSON numeric constants and oversized/invalid-Unicode arguments reject before the store is consulted. Runtime JSON can be deeply nested; the byte cap limits input and recursion failure has a fixed safe result. A real transport must also bound incoming bytes before building an arbitrarily large string. Types/Pydantic do not authenticate a caller or prove an internal StoredNote came from trusted storage.

## Errors are outcomes with a recovery policy

| Result | Meaning | Owner response |
|---|---|---|
| ok | Authorized current record projected to a prefix | Treat excerpt as evidence, with version and truncation visible |
| invalid_arguments | Proposal failed the accepted JSON/schema/size contract | No I/O; allow only a bounded correction attempt if the workflow permits |
| unavailable | Missing, foreign, denied or mismatched record | Do not disclose which condition, title or hidden ID caused it; no factual conclusion about existence |
| temporary_failure | Explicit storage outage | Preserve recoverable failure; do not turn into no evidence or silently retry forever |
| unknown_tool | Not in the exact allowlist | No dynamic import/eval/reflection or fallback execution |

Unexpected programming exceptions are not silently converted into a successful tool result. The service boundary should catch/report them as a fixed internal failure with protected diagnostics, never raw exception/record content. The example catches only the store's explicit operational exception. Real database/network adapters need deadlines, concurrency limits, cancellation and safe error translation; this synchronous bounded fixture cannot cancel a blocking database call or establish a latency guarantee.

ToolSuccess includes source revision and a visible prefix/truncated flag. A prefix can omit the relevant qualification, so the model must not treat it as the full document. Use an authorized span/pagination contract for a complete evidence flow; the [citation resolver](./retrieval-context.md) owns exact checked spans. Success does not prove the source is true, the answer is supported or a subsequent citation is authorized. Do not include raw ACLs, tenant data, hidden titles or credentials in results. The input contains no URL/path, so this tool cannot be repurposed as an arbitrary fetch or file reader.

## Wire a provider only after the application boundary

In an eventual Responses loop, supply lookup_definition as an application-owned tool. Inspect only the SDK's function-call output items, allowlist the name, and validate the call's complete arguments before dispatch. Return the projected JSON as a function-call result tied to that actual call_id; do not invent a call ID, substitute another call's result or turn returned source text into developer instructions. Preserve required response items/state under the selected API's documented contract. A response can request multiple calls; serial versus parallel execution, per-call/overall deadlines and resource limits must be explicit. Parallel tool calling is not permission to run unbounded work.

Count tool definitions, current instructions, history and results in the actual request budget. Cap total rounds/calls/bytes/time/spend, and stop on a final answer or a controlled failure. A model repeating a read can waste resources even when it cannot write. This lesson supplies the executable dispatch boundary, not a completed live agent loop. A fixed application workflow is preferable when the operation sequence is already known; [history and workflow checkpoints](./history-and-workflows.md) describe its recovery contract.

## Practice and acceptance

Run strict typing, inspect the exact definition schema and test valid/current success; unknown name; missing/extra/coerced/invalid ID; duplicate keys; scalar/nested/non-JSON/invalid-Unicode/over-budget input; same-tenant allowed/denied and foreign tenant; missing/mismatched record; explicit store outage; unexpected programmer error; malicious source instructions;500-character prefix/truncation and Unicode bounds. Assert rejected arguments/unknown tools cause zero reads, unauthorized results contain no protected text or metadata, and outage is distinct from unavailable.

Build a separate fake-model loop only after these tests pass. Supply a call asking for a foreign source, an extra tenant argument and an unknown tool; no model output may choose the principal or execute a fallback. Test correct call_id/result association, repeated calls, malformed/partial arguments and exhausted loop budget. Then add a reviewed real provider run if authorized, recording model/schema/tool versions and task outcomes. Full loop transport, durable authorization race, real provider quality and learner implementation remain required. Later write tools require an additional idempotency/confirmation/recovery contract; read-only success is not permission to implement them ad hoc.

References checked2026-10-24: [official function calling contract](https://developers.openai.com/api/docs/guides/function-calling), [Pydantic strict validation](https://docs.pydantic.dev/latest/concepts/strict_mode/), [OWASP prompt injection controls](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html), [Python JSON decoding](https://docs.python.org/3/library/json.html). Model/tool/API support is version-sensitive; verify the actual selected provider contract before live integration.
