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

