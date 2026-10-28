# lab_tests/test_extraction.py
import hashlib

import pytest

from study_ai.extraction import ExtractionError, MAX_BYTES, chunk, extract


def test_text_provenance_and_normalization():
    raw = "\ufeffFirst\r\n\r\nárvíztűrő\rLast".encode("utf-8")
    source = extract(raw, source_id="s1", kind="text")
    assert source.source_sha256 == hashlib.sha256(raw).hexdigest()
    assert [(s.locator, s.text) for s in source.segments] == [
        ("line:1", "First"), ("line:3", "árvíztűrő"), ("line:4", "Last")]
    assert source.extractor_version == "text-csv-v1"


def test_csv_multiline_and_leading_zero_id():
    raw = b'id,text\r\n001,"a,b\r\nnext"\r\n002,=SUM(A1:A2)\r\n'
    source = extract(raw, source_id="s2", kind="csv")
    assert source.segments[0].locator == "record:1;id:001"
    assert source.segments[0].text == "a,b\nnext"
    assert source.segments[1].text == "=SUM(A1:A2)"


@pytest.mark.parametrize("raw,kind", [
    (b"\xff", "text"), (b"a\x00b", "text"), (b" \n", "text"),
    (b"x" * (MAX_BYTES + 1), "text"), (b"x\n" * 1001, "text"),
    (b"text,id\nx,1", "csv"), (b'id,text\na,"unterminated', "csv"),
    (b"id,text\na,x,extra", "csv"), (b"id,text\na,x\na,y", "csv"),
    (b"id,text\na, ", "csv"), (b"id,text\n../private,x", "csv"),
])
def test_rejection_does_not_echo_source(raw, kind):
    with pytest.raises(ExtractionError) as caught:
        extract(raw, source_id="fixture", kind=kind)
    assert "../private" not in str(caught.value)
    assert "unterminated" not in str(caught.value)


def test_chunk_offsets_overlap_tail_and_budget():
    source = extract(b"abcdefghij", source_id="s3", kind="text")
    chunks = chunk(source, size=4, overlap=1)
    assert [(c.start, c.end, c.text) for c in chunks] == [
        (0, 4, "abcd"), (3, 7, "defg"), (6, 10, "ghij")]
    for item in chunks:
        assert source.segments[0].text[item.start:item.end] == item.text
        assert item.source_sha256 == source.source_sha256
    for size, overlap in [(0, 0), (3, 3), (4, -1), (True, 0)]:
        with pytest.raises(ExtractionError):
            chunk(source, size=size, overlap=overlap)
    with pytest.raises(ExtractionError, match="Chunk count"):
        chunk(extract(b"x" * 5000, source_id="s4", kind="text"), size=1, overlap=0)
