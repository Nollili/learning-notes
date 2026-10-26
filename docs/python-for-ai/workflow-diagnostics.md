# Debugging Tool Workflows with Safe Traces

Debug a concrete stage transition and observation rather than asking the model to explain why the whole application failed. The model's narrative is not an execution trace. Use the [typed state machine](./tool-workflow-state.md), [tool dispatcher](./tool-boundaries.md) and [actual graph fixture](./graph-memory.md) as separate testable components. Keep their operation/state/configuration versions alongside retained approved test evidence.

## Find the earliest failed boundary

| Observation | Inspect / distinguish | Repair and regression evidence |
|---|---|---|
| No tool invocation | Allowed tool definitions, response item type, complete arguments, loop stop state | Do not invent calls from prose; test final/refused/incomplete versus function-call output |
| Proposal rejected before read | Byte/schema/name validation | Zero store reads; fix task/schema or handle rejection, never bypass the validator |
| unavailable | Current principal, scoped resource and ACL/version | Authorized protected diagnostics can distinguish reasons; public trace must not reveal hidden existence/title |
| temporary_failure | Store/transport operational category | Stop/defer under budget; no unsupported factual answer and no unbounded retry |
| Repeated tool calls | Remaining budget, stage route and model call association | Require finite calls and a terminal transition; compare exact call_id/result pairing in the provider adapter |
| Wrong result displayed | Selected source versions, output/schema/semantic gate, UI state | A valid quote does not establish claim support; partial output cannot become committed success |
| State overwritten after recovery | Expected revision, input/config versions, artifact availability | Stale compare-and-set must fail; add the observed race as an isolated regression |
| Duplicate write after timeout | Durable operation ID/receipt and exact approved command | Replay the same operation and reconcile; a new key must not be generated merely because the response was lost |

Read a protected graph snapshot only as an authorized diagnostic. It can contain raw arguments/results/private source text. Do not export it blindly to a hosted tracing service or attach it to public issues. Prefer a bounded event projection for routine observation; inspect approved/redacted fixtures locally when content-level analysis is necessary.

## An allowlisted event projection

The following recorder deliberately accepts no prompt, arguments, raw result, URL, error object, source title, token or model-generated free-form message. It is a tiny local bounded buffer, not an audit store or a complete monitoring backend. Its safe categories are chosen by the application from validated outcomes.

```python
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
```

Use an application-generated run ID such as uuid4().hex, not a secret, raw source identifier or user-supplied trace label. Record measured monotonic elapsed duration for the stage, not fabricated timings. A run ID/count/timing can still reveal activity, so protect access and retention; a projection is not universal anonymization. The buffer drops oldest events at capacity and exposes dropped count. It must not serve as a security audit requiring complete durable evidence. Flush/retain approved events under a separately defined policy and handle exporter failure without exposing payloads or hanging a job.

A model result saying status=ok does not choose outcome=ok directly. The dispatcher/output gate maps validated domain results to these categories; unexpected exceptions become a fixed safe operational/internal category at the service boundary. Do not interpolate exception text into a category. Regex replacement of “password” cannot reliably scrub nested prompts, credentials, signed URLs or private passages. Avoid collecting such values by design; if protected incident capture is necessary, define explicit authorization, minimization, redaction and deletion before capture. Never log Pydantic errors wholesale because they can include rejected input.

## State transitions need tests, not just a diagram

Use the canonical after_lookup/after_answer functions. Assert lookup_pending + ok → answer_pending; a checked answer → completed; failed answer validation → failed; terminal states reject further lookup. Three consecutive temporary read failures end in failed after two additional permitted attempts. unavailable/invalid_arguments/unknown_tool stop immediately. JobStore persists only valid stage records and rejects stale revisions. Do not let a source/model provide checked=true, reset retries or select a persistence version.

For an end-to-end runner, correlate the transition and its checked artifact/version with the actual operation. Define states for awaiting approval, cancelled and uncertain write outcome before implementing those flows; do not overload completed with “possibly committed.” A graph recursion guard is not an overall deadline. A trace showing a node ran cannot prove a transaction committed or an answer is supported. Pair it with the authoritative receipt/validator evidence appropriate to that stage.

**Worked debugging case:** a caller repeats an approved rename after losing the response. The first execution's transaction committed, but the UI stayed pending. A trace can show persist/ok then a retried request; the durable receipt proves the operation result. Replay must return that receipt and keep note version1. If the implementation instead generates a new operation key, the fault is retry/approval ownership, not model wording. The existing SQLite receipt and rollback fixtures supply a deterministic regression; no production incident is claimed.

## Practice and acceptance

Run strict typing and event tests: only declared fields/categories, finite bounded durations, integer/non-bool attempts, capacity eviction/dropped count, stable sequence, immutable snapshots, fixed error on invalid/sensitive values, no raw payload field, JSON round-trip. Feed a real fake-store dispatcher result through an application-owned category mapping and verify the event contains only the projection. These tests do not establish a production exporter or complete audit trail.

Rerun the actual state/SQLite/graph tests, then inject an unknown tool, a private source ID, a stale save, a blocked store and an interrupted write receipt. Retain the earliest failing stage and expected transition as an approved fixture; exclude raw private text/credentials from routine events. For a real provider adapter add malformed call items, mismatched call IDs, partial arguments, budget exhaustion and output validator failure. Acceptance: failures remain distinct, no silent success/retry reset, redaction/projection negative controls pass and transitions match their checked artifacts. Hosted traces/alerts, real incidents, provider loop debugging and learner operational practice remain required.

References checked2026-10-25: [OWASP logging guidance](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html), [Pydantic strict validation](https://docs.pydantic.dev/latest/concepts/strict_mode/), [bounded workflow state](./tool-workflow-state.md), [graph memory and diagnostic scope](./graph-memory.md). The recorder uses Python3.13/Pydantic2.14.1 and performs no network export.
