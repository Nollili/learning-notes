# study_ai/retrieval_debugging.py
from __future__ import annotations
from collections.abc import Sequence
from dataclasses import dataclass
import re

@dataclass(frozen=True, slots=True)
class Candidate:
    source_id: str
    content_sha256: str


def distinct_content(candidates: Sequence[Candidate], *, limit: int) -> tuple[Candidate, ...]:
    # Input comes only from current, authorized source resolution, never model JSON.
    if len(candidates) > 20 or type(limit) is not int or not 1 <= limit <= 8:
        raise ValueError('Invalid candidate budget')
    ids: set[str] = set()
    hashes: set[str] = set()
    result: list[Candidate] = []
    for item in candidates:
        if (not re.fullmatch(r'[A-Za-z0-9_-]{1,64}', item.source_id)
                or not re.fullmatch(r'[a-f0-9]{64}', item.content_sha256)
                or item.source_id in ids):
            raise ValueError('Invalid candidate')
        ids.add(item.source_id)
        if item.content_sha256 not in hashes:
            hashes.add(item.content_sha256)
            if len(result) < limit:
                result.append(item)
    return tuple(result)
