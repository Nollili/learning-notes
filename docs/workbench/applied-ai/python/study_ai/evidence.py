# study_ai/evidence.py
from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, ValidationError

from .extraction import Chunk, chunk_identity, extract
from .vector_search import Principal


class EvidenceRejected(Exception):
    pass


@dataclass(frozen=True, slots=True)
class SourceSnapshot:
    tenant: str
    allowed_subjects: frozenset[str]
    source_id: str
    kind: Literal["text", "csv"]
    raw: bytes


@dataclass(frozen=True, slots=True)
class Evidence:
    chunk_id: str
    source_id: str
    source_sha256: str
    locator: str
    start: int
    end: int
    text: str


def resolve_evidence(item: Chunk, *, principal: Principal, snapshot: SourceSnapshot) -> Evidence:
    # snapshot is a fresh result from the authoritative authorized source adapter.
    if snapshot.tenant != principal.tenant or principal.subject not in snapshot.allowed_subjects:
        raise EvidenceRejected("Evidence unavailable")
    source = extract(snapshot.raw, source_id=snapshot.source_id, kind=snapshot.kind)
    if (source.source_id != item.source_id or source.source_sha256 != item.source_sha256
            or source.extractor_version != item.extractor_version):
        raise EvidenceRejected("Evidence version mismatch")
    matches = [segment for segment in source.segments if segment.locator == item.locator]
    if (len(matches) != 1 or type(item.start) is not int or type(item.end) is not int
            or not 0 <= item.start < item.end <= len(matches[0].text)
            or item.end - item.start > 2000):
        raise EvidenceRejected("Invalid evidence span")
    if matches[0].text[item.start:item.end] != item.text:
        raise EvidenceRejected("Evidence text mismatch")
    return Evidence(chunk_identity(item, tenant_id=principal.tenant), item.source_id,
                    item.source_sha256, item.locator, item.start, item.end, item.text)


class CitationDraft(BaseModel):
    model_config = ConfigDict(strict=True, extra="forbid")
    chunk_id: str = Field(min_length=64, max_length=64)
    quote: str = Field(min_length=1, max_length=160)


class AnswerDraft(BaseModel):
    model_config = ConfigDict(strict=True, extra="forbid")
    status: Literal["answered", "insufficient_evidence"]
    answer: str = Field(max_length=1200)
    citations: list[CitationDraft] = Field(max_length=4)


@dataclass(frozen=True, slots=True)
class CheckedAnswer:
    status: Literal["answered", "insufficient_evidence"]
    answer: str
    citations: tuple[tuple[Evidence, str], ...]


def check_answer(raw: object, *, evidence: Sequence[Evidence]) -> CheckedAnswer:
    if len(evidence) > 8 or sum(len(item.text) for item in evidence) > 6000:
        raise EvidenceRejected("Evidence budget exceeded")
    by_id = {item.chunk_id: item for item in evidence}
    if len(by_id) != len(evidence):
        raise EvidenceRejected("Duplicate evidence identity")
    try:
        draft = AnswerDraft.model_validate(raw)
    except ValidationError:
        raise EvidenceRejected("Invalid answer contract") from None
    try:
        draft.answer.encode("utf-8", errors="strict")
        for citation in draft.citations:
            citation.quote.encode("utf-8", errors="strict")
    except UnicodeEncodeError:
        raise EvidenceRejected("Invalid answer encoding") from None
    if draft.status == "insufficient_evidence":
        if draft.answer or draft.citations:
            raise EvidenceRejected("Invalid abstention contract")
        return CheckedAnswer(draft.status, "", ())
    if not draft.answer.strip() or not draft.citations:
        raise EvidenceRejected("Missing answer evidence")
    resolved: list[tuple[Evidence, str]] = []
    used: set[str] = set()
    for citation in draft.citations:
        item = by_id.get(citation.chunk_id)
        if (item is None or citation.chunk_id in used or not citation.quote.strip()
                or citation.quote not in item.text):
            raise EvidenceRejected("Invalid citation")
        used.add(citation.chunk_id)
        resolved.append((item, citation.quote))
    return CheckedAnswer(draft.status, draft.answer, tuple(resolved))
