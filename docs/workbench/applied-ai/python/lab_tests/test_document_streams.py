# lab_tests/test_document_streams.py
from __future__ import annotations

import json
from pathlib import Path
from typing import BinaryIO

import pytest

from study_ai.document_streams import DocumentStreamError, StreamLimits, document_batches, open_document_stream


def record(identity: str, body: str = "text") -> bytes:
    return json.dumps({"id": identity, "body": body}, ensure_ascii=False).encode("utf-8")


def test_utf8_crlf_final_record_and_batches(tmp_path: Path) -> None:
    source = tmp_path / "documents.jsonl"
    source.write_bytes(record("d1", "árvíztűrő") + b"\r\n\n" + record("d2"))
    with open_document_stream(source) as documents:
        batches = list(document_batches(documents, batch_size=1))
    assert [batch[0].id for batch in batches] == ["d1", "d2"]
    assert batches[0][0].body == "árvíztűrő"


@pytest.mark.parametrize("payload", [
    b'{"id":"d1","id":"d2","body":"text"}',
    b'{"id":"d1","body":NaN}',
    b'{"id":"d1","body":1e999}',
    b'{"id":"d1","body":"\xff"}',
    b'\xef\xbb\xbf' + record("d1"),
    b'{"id":"d1","body":"\\ud800"}',
    b'[]', b'{', b'{"id":"d1","body":"  "}',
])
def test_invalid_input_is_not_content_in_diagnostics(tmp_path: Path, payload: bytes) -> None:
    source = tmp_path / "invalid.jsonl"
    source.write_bytes(payload)
    with open_document_stream(source) as documents:
        with pytest.raises(DocumentStreamError, match="physical line 1"):
            list(documents)


def test_record_and_line_limits(tmp_path: Path) -> None:
    source = tmp_path / "limits.jsonl"
    source.write_bytes(record("d1") + b"\n" + record("d2"))
    with open_document_stream(source, StreamLimits(max_records=1)) as documents:
        with pytest.raises(DocumentStreamError, match="Record budget"):
            list(documents)
    source.write_bytes(b"x" * 129)
    limits = StreamLimits(max_bytes=256, max_line_bytes=128)
    with open_document_stream(source, limits) as documents:
        with pytest.raises(DocumentStreamError, match="Line byte budget"):
            list(documents)


def test_early_exit_closes_real_file(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    source = tmp_path / "early.jsonl"
    source.write_bytes(record("d1") + b"\n" + record("d2"))
    opened: list[BinaryIO] = []
    original = Path.open

    def tracking_open(path, *args, **kwargs):
        handle = original(path, *args, **kwargs)
        opened.append(handle)
        return handle

    with monkeypatch.context() as patch:
        patch.setattr(Path, "open", tracking_open)
        with open_document_stream(source) as documents:
            assert next(documents).id == "d1"
            assert not opened[0].closed
        assert opened[0].closed
        with pytest.raises(StopIteration):
            next(documents)
