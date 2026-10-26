# Verified Evidence Spans and Citation Boundaries

A retrieval result is a candidate reference, not permission to publish its text or proof that it supports an answer. This lesson joins the bounded extraction/provenance and similarity lessons. It verifies authorized current source spans, then validates citation references in a proposed answer. It makes no model/provider call and does not add another orchestration framework.

## Pick chunks to preserve meaning

The existing line/record code-point chunker is a deterministic baseline. It preserves a locator and bounded span; it can still split a definition, omit a table header or separate a code example from its explanation. Use heading/paragraph/code-block/table structure when those units matter. Token-aware splitting must use the selected embedding/generation representation rather than count characters. If a single structural unit exceeds the budget, split with recorded subspans and required context rather than silently truncate it.

Smaller chunks can improve precise matching but lose context and increase index/citation fragmentation. Larger chunks can preserve relationships while diluting relevance and consuming the prompt budget. Overlap can retain boundary context but creates duplicate evidence and storage. Tune chunk size/overlap on labeled retrieval/answer questions, including cross-boundary facts and multi-step comparisons; no universal size establishes quality. Keep extractor/chunk settings versioned and rebuild the index generation after a policy change.

A retrieval candidate's chunk ID should resolve to a current source version and exact extracted span. A citation UI can show the authorized source/locator and excerpt; it must not convert model-supplied arbitrary URLs into trusted links. The authoritative source adapter owns tenant/subject permissions and immutable bytes/version at fetch time. A source permission can change after indexing, so recheck before evidence enters the prompt or response.

## Worked source-span verification

```python
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
```

The code re-extracts bounded authorized bytes and compares exact source version, extraction version, locator, code-point boundaries and text. This is intentionally more expensive than trusting an old indexed snippet. A real adapter can use an authenticated versioned extracted artifact instead, provided its integrity/provenance and permission lookup are preserved. The SourceSnapshot is application-owned; accepting a user-provided "snapshot" with invented ACLs would erase the trust boundary.

Evidence objects must come from this resolver, not directly from model/client JSON. Python dataclass types alone do not prove that ownership. Treat stale/deleted/unavailable source results as unavailable evidence; do not replace them with a cached private excerpt. A storage outage should retain its operational category for the job/recovery policy rather than become a factual answer of "no". This small module does not implement the storage adapter's outage/delete behavior.

The6000-character/8-item input cap bounds this mechanical validation step; it is not a model-token budget. Before any future generation request, assemble the final authorized evidence payload, count its actual request representation and reserve output capacity as in the token-budget lesson. Raw model output needs a byte cap before parsing at its transport boundary too. Pydantic field lengths operate after raw input already exists.

## Citation validity is only one check

check_answer verifies schema, known IDs, exact quotes and explicit abstention. It does not prove that answer claims are entailed by the cited passage, that quotations are representative, or that source content is true/current. A misleading answer can quote a genuine but irrelevant sentence. Evaluate claim support, conflicts, relevance and completeness with a human rubric and representative labeled cases; do not rename a citation-membership pass "groundedness proven".

Render answer/quotes as untrusted text using safe text rendering. Build source links on the server from authorized source IDs and locators; the model supplies no URL/HTML fields in this schema. Recheck access if the user opens a citation later. Do not disclose rejected source IDs/titles in an error. This example returns safe fixed error categories, while protected job metadata can record non-content failure codes for troubleshooting.

No evidence and negative evidence are different. Empty retrieval results should produce insufficient_evidence with an empty answer/citation list in this contract, not "the feature does not exist". Conflicting sources may require a comparison with separately supported claims or an explicit review state. The two-state teaching DTO is intentionally narrower; extend it/version it when the product needs a conflict/review outcome rather than smuggling that outcome into an apparently successful answer.

## Executable provenance and citation checks

```python
# lab_tests/test_evidence.py
from dataclasses import replace

import pytest

from study_ai.evidence import EvidenceRejected, SourceSnapshot, check_answer, resolve_evidence
from study_ai.extraction import chunk, extract
from study_ai.vector_search import Principal


def fixture():
    raw = b"Cancellation closes the client.\nRetries need an explicit budget."
    snapshot = SourceSnapshot("t", frozenset({"u"}), "s1", "text", raw)
    item = chunk(extract(raw, source_id="s1", kind="text"))[0]
    return snapshot, item, Principal("t", "u")


def test_current_authorized_span_and_answer():
    snapshot, item, principal = fixture()
    evidence = resolve_evidence(item, principal=principal, snapshot=snapshot)
    answer = check_answer({"status": "answered", "answer": "Cancellation closes the client.",
                           "citations": [{"chunk_id": evidence.chunk_id, "quote": "closes the client"}]},
                          evidence=[evidence])
    assert answer.citations[0][0].locator == "line:1"
    assert answer.citations[0][0].source_sha256 == item.source_sha256
    assert answer.citations[0][1] == "closes the client"
    assert check_answer({"status": "insufficient_evidence", "answer": "", "citations": []},
                        evidence=[]).status == "insufficient_evidence"


def test_stale_permission_and_tampered_span_rejected():
    snapshot, item, principal = fixture()
    for changed in [replace(snapshot, tenant="other"), replace(snapshot, allowed_subjects=frozenset()),
                    replace(snapshot, raw=b"Different source bytes")]:
        with pytest.raises(EvidenceRejected):
            resolve_evidence(item, principal=principal, snapshot=changed)
    for changed in [replace(item, text="PRIVATE_INVENTED"), replace(item, start=-1),
                    replace(item, locator="line:999"), replace(item, end=999)]:
        with pytest.raises(EvidenceRejected) as caught:
            resolve_evidence(changed, principal=principal, snapshot=snapshot)
        assert "PRIVATE" not in str(caught.value)


def test_unknown_quote_duplicate_and_abstention_failures():
    snapshot, item, principal = fixture()
    evidence = resolve_evidence(item, principal=principal, snapshot=snapshot)
    citation = {"chunk_id": evidence.chunk_id, "quote": "client"}
    for payload in [
        {"status": "answered", "answer": "Text", "citations": []},
        {"status": "answered", "answer": "Text", "citations": [{**citation, "chunk_id": "0" * 64}]},
        {"status": "answered", "answer": "Text", "citations": [{**citation, "quote": "invented quote"}]},
        {"status": "answered", "answer": "Text", "citations": [citation, citation]},
        {"status": "insufficient_evidence", "answer": "Unsupported no", "citations": []},
    ]:
        with pytest.raises(EvidenceRejected):
            check_answer(payload, evidence=[evidence])


def test_membership_does_not_prove_semantic_support():
    snapshot, item, principal = fixture()
    evidence = resolve_evidence(item, principal=principal, snapshot=snapshot)
    misleading = check_answer({"status": "answered", "answer": "Cancellation leaves the client open forever.",
                               "citations": [{"chunk_id": evidence.chunk_id, "quote": "client"}]},
                              evidence=[evidence])
    # Mechanical membership passes; the claimed meaning contradicts the source.
    assert "open forever" in misleading.answer and "closes" in evidence.text


def test_unicode_spans_and_output_encoding():
    raw = "árvíz 🧠".encode("utf-8")
    snapshot = SourceSnapshot("t", frozenset({"u"}), "unicode", "text", raw)
    item = chunk(extract(raw, source_id="unicode", kind="text"), size=6, overlap=0)[1]
    evidence = resolve_evidence(item, principal=Principal("t", "u"), snapshot=snapshot)
    assert evidence.start == 6 and evidence.end == 7 and evidence.text == "🧠"
    for quote in [" ", "\ud800"]:
        with pytest.raises(EvidenceRejected):
            check_answer({"status": "answered", "answer": "Text",
                          "citations": [{"chunk_id": evidence.chunk_id, "quote": quote}]},
                         evidence=[evidence])

```

## Practice and acceptance

Read a two-section note with one cross-boundary fact and one code/table example. Compare baseline line chunks with structure-aware chunks, recording lost context, duplicated evidence and actual model-token counts. Reconstruct each retained citation from its immutable source version and exact locator/span. Simulate a source edit and a permission revocation between search and fetch; neither old private text nor a stale citation may reach the answer.

Add a genuine but irrelevant quote supporting an incorrect answer and demonstrate why mechanical validation passes while semantic evaluation must fail. Test empty/unknown/duplicate citations, invented quotations, wrong source/extractor versions, Unicode span boundaries, insufficient-evidence output and a user opening a citation after access changes. Preserve a recoverable job state for source/transport outages rather than report an invented factual conclusion.

**Acceptance:** strict checks/tests pass; every published citation resolves to supplied authorized evidence at the checked source version; no-evidence and malformed-answer cases remain distinct; unsupported semantic claims are assessed separately from schema/quote membership. Real generation, durable versioned storage, token-aware structure chunker, browser citation UI, ongoing authorization/deletion lifecycle and learner practice remain unperformed. This lesson provides the intermediate provenance/citation contract and chunk-design reasoning, not a complete production RAG service.

Official references checked2026-10-21: [retrieval and synthesis context](https://developers.openai.com/api/docs/guides/retrieval), [citation source/locator behavior](https://developers.openai.com/api/docs/guides/citation-formatting), [extraction/identity baseline](./document-processing.md), [compatible similarity spaces](./embeddings-and-similarity.md), [actual-payload token admission](./token-budgets.md). The application uses its own typed citation DTO rather than provider-specific inline marker syntax.
