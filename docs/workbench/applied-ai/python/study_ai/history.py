# study_ai/history.py
from __future__ import annotations

import hashlib
import json
from collections.abc import Sequence
from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class Exchange:
    user: str
    assistant: str

    def __post_init__(self) -> None:
        for value in (self.user, self.assistant):
            if not value.strip() or len(value) > 2000:
                raise ValueError("Invalid exchange")
            try:
                if len(value.encode("utf-8", errors="strict")) > 4000:
                    raise ValueError("Invalid exchange")
            except UnicodeEncodeError:
                raise ValueError("Invalid exchange") from None


def history_payload(exchanges: Sequence[Exchange], *, keep: int = 4) -> str:
    if type(keep) is not int or not 0 <= keep <= 6 or len(exchanges) > 20:
        raise ValueError("Invalid history policy")
    retained = exchanges[-keep:] if keep else ()
    return json.dumps({"exchanges": [
        {"user": turn.user, "assistant": turn.assistant} for turn in retained
    ]}, ensure_ascii=False, separators=(",", ":"))


def history_digest(payload: str) -> str:
    return hashlib.sha256(payload.encode("utf-8", errors="strict")).hexdigest()
