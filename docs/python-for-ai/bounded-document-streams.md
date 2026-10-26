# Bounded Document Streams and Resource Ownership

Continue the Python3.13 learner project with its typed Document/parse_document boundary. This lesson processes UTF-8 newline-delimited JSON (NDJSON) using iterators, generators and an explicit context manager. It is a substantive ingestion primitive; PDF/HTML extraction, OCR, retrieval chunking and upload isolation are separate topics, not implied by successfully reading JSON lines.

## Iterable, iterator and generator

An iterable supplies an iterator through iter(value). A list can supply a new iterator repeatedly. An iterator holds consumption state; next advances it and exhaustion raises StopIteration. A generator function contains yield; calling it creates an iterator, and its body runs when advanced. It suspends local state at each yield instead of eagerly constructing a whole result list.

```python
values = ["first", "second"]
iterator = iter(values)
assert next(iterator) == "first"
assert list(iterator) == ["second"]
assert list(iterator) == []
assert list(values) == ["first", "second"]


def labels():
    yield "first"
    yield "second"


assert list(labels()) == ["first", "second"]
```

return ends a generator; do not raise StopIteration inside it as a manual completion signal. yield from delegates to another iterable/generator, including its generator protocol; it does not make blocking work asynchronous. Generator expressions are useful for simple lazy transformations. Laziness alone is not a memory guarantee: a generator may still read an entire file, retain a growing deduplication set or feed a caller that collects everything with list(...).

## Bound bytes before decoding/parsing

An ordinary `for line in file` or unbounded readline can allocate one enormous physical line before a later length check. Read at most the line budget plus one byte, and enforce the total byte budget too. This contract counts physical line endings in the line byte limit. Blank ASCII-whitespace lines count toward line/byte limits but do not produce documents. The final record need not end with LF; CRLF is accepted as JSON whitespace.

The public decode_json/decode_document helpers are shared with the API/HTTP lessons; its caller must bound bytes first. The selected stream limits protect one already-authorized local file. Do not pass arbitrary HTTP-supplied paths into this API. A service upload should supply an owned bounded handle/storage object under its authorization and isolation policy. This code does not provide a filesystem sandbox, decompression bomb protection or a hard wall-clock limit for a stalled filesystem.

```python
# study_ai/document_streams.py
from __future__ import annotations

import json
import math
from collections.abc import Generator, Iterable, Iterator
from contextlib import contextmanager
from dataclasses import dataclass
from pathlib import Path
from typing import BinaryIO, NoReturn

from .domain import Document, DocumentId, parse_document


class DocumentStreamError(ValueError):
    pass


@dataclass(frozen=True, slots=True)
class StreamLimits:
    max_bytes: int = 2 * 1024 * 1024
    max_line_bytes: int = 65536
    max_lines: int = 1000
    max_records: int = 100

    def __post_init__(self) -> None:
        values = (self.max_bytes, self.max_line_bytes, self.max_lines, self.max_records)
        if any(type(value) is not int or value < 1 for value in values):
            raise ValueError("Invalid stream limits")
        if not 16 <= self.max_line_bytes <= self.max_bytes <= 128 * 1024 * 1024:
            raise ValueError("Invalid byte limits")
        if not self.max_records <= self.max_lines <= 100000:
            raise ValueError("Invalid count limits")


def _unique_object(pairs: list[tuple[str, object]]) -> dict[str, object]:
    result: dict[str, object] = {}
    for key, value in pairs:
        if key in result:
            raise ValueError("Duplicate JSON key")
        result[key] = value
    return result


def _reject_constant(value: str) -> NoReturn:
    raise ValueError("Nonfinite JSON number")


def _finite_float(value: str) -> float:
    number = float(value)
    if not math.isfinite(number):
        raise ValueError("Nonfinite JSON number")
    return number


def decode_json(raw: bytes) -> object:
    # Caller owns/enforces the byte budget before invoking this decoder.
    text = raw.decode("utf-8", errors="strict")
    decoded: object = json.loads(text, object_pairs_hook=_unique_object,
                                 parse_constant=_reject_constant, parse_float=_finite_float)
    return decoded


def decode_document(raw: bytes) -> Document:
    decoded = decode_json(raw)
    document = parse_document(decoded)
    document.body.encode("utf-8", errors="strict")
    for tag in document.tags:
        tag.encode("utf-8", errors="strict")
    return document


def _iter_documents(stream: BinaryIO, limits: StreamLimits) -> Generator[Document, None, None]:
    total = lines = records = 0
    seen: set[DocumentId] = set()
    while True:
        raw = stream.readline(min(limits.max_line_bytes + 1, limits.max_bytes - total + 1))
        if not raw:
            return
        total += len(raw)
        lines += 1
        if total > limits.max_bytes:
            raise DocumentStreamError("Total byte budget exceeded")
        if len(raw) > limits.max_line_bytes:
            raise DocumentStreamError("Line byte budget exceeded")
        if lines > limits.max_lines:
            raise DocumentStreamError("Physical line budget exceeded")
        if not raw.strip(b" \t\r\n"):
            continue
        records += 1
        if records > limits.max_records:
            raise DocumentStreamError("Record budget exceeded")
        try:
            document = decode_document(raw)
        except (UnicodeDecodeError, ValueError, RecursionError):
            # No source bytes, filename or nested exception message in the public diagnostic.
            raise DocumentStreamError(f"Invalid document at physical line {lines}") from None
        if document.id in seen:
            raise DocumentStreamError(f"Duplicate document id at physical line {lines}")
        seen.add(document.id)
        yield document


@contextmanager
def open_document_stream(path: Path, limits: StreamLimits = StreamLimits()) -> Iterator[Iterator[Document]]:
    with path.open("rb") as stream:
        documents = _iter_documents(stream, limits)
        try:
            yield documents
        finally:
            documents.close()


def document_batches(documents: Iterable[Document], *, batch_size: int = 16) -> Iterator[tuple[Document, ...]]:
    if type(batch_size) is not int or not 1 <= batch_size <= 32:
        raise ValueError("Invalid batch size")
    batch: list[Document] = []
    for document in documents:
        batch.append(document)
        if len(batch) == batch_size:
            yield tuple(batch)
            batch.clear()
    if batch:
        yield tuple(batch)
```

The immutable StreamLimits default is safe to share; it differs from a mutable list default. Configuration validation rejects booleans as counts and inconsistent budgets. A record limit also bounds the duplicate-ID set. The reader keeps at most a bounded line plus the current decoded record and bounded ID set; batching adds at most32 bounded Document objects. json.loads can still allocate an object graph within that line budget, and source content/normalization has its own character limits. Do not claim constant total memory while the caller retains every yielded document.

Python's JSON decoder normally accepts some nonstandard nonfinite numbers and repeated keys. The hooks reject duplicate keys, NaN/Infinity and overflowing float values. UTF-8 decoding is strict; escaped lone surrogates in decoded body/tags are also rejected by strict re-encoding. A BOM is not stripped and the chosen JSON contract rejects it. A root array/scalar or malformed domain fields fail parse_document. The byte bound applies before decoding, so multibyte text cannot bypass it. Excessive parser nesting becomes a controlled input error; for hostile complex formats use process isolation and CPU/memory/time limits rather than assume every parser is safe because a try/except exists.

Read/open errors are outside the input-parse catch and remain operational OSError failures. A missing/unreadable source is not an empty successful ingestion. Earlier yielded records may already have been processed when a later line fails: streaming is not an all-or-nothing transaction. Choose staging plus commit, idempotent per-record writes with a job failure state, or a validated two-pass workflow according to the domain. Do not pretend a context manager rolls back external effects.

## The owner is the with block

```python
# usage fragment — trusted_source is a caller-authorized pathlib.Path
from study_ai.document_streams import document_batches, open_document_stream

with open_document_stream(trusted_source) as documents:
    for batch in document_batches(documents, batch_size=16):
        process_batch(batch)  # Bounded/idempotent adapter supplied by the application.
```

Do not return that iterator from inside with and consume it after the file has closed. The context manager closes the generator and file on normal completion, early break or a consumer exception. A generator by itself does not promise immediate cleanup when the caller stops iterating; explicit context ownership avoids depending on garbage collection/refcounting. Consumers must keep the owner alive until consumption ends.

A contextmanager-decorated factory yields exactly one managed value. Its finally block handles release; catching an exception at yield and failing to reraise can suppress the caller's error. Do not accidentally do that when adding logs. Cleanup can itself fail, so preserve/inspect exception context where both failures matter. ExitStack is useful when the number of owned resources varies; async with/aclosing apply to asynchronous lifetimes in the next lesson. The batch generator borrows its input and does not own closing an arbitrary caller's iterator.

## Actual file and failure tests

```python
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
```

The small test collects two batches only to inspect their values; a production consumer should process/release batches instead of collecting the whole file. The tracking wrapper still opens a real file and verifies the actual handle closes. Additional acceptance cases below cover failure after a partial yield and exact budget edges.

## Practice and acceptance

**Acceptance:** strict-check the package and execute these tests. Read a valid UTF-8/CRLF/final-no-LF fixture, then malformed/truncated/duplicate-key/nonfinite/BOM/non-object variants. Verify total bytes, line bytes, physical lines, records and duplicate IDs independently, including exact-limit acceptance and one-over rejection. Repeat with a multibyte body so character and byte limits cannot be confused. A blank-line flood must hit the physical-line/byte budget rather than loop without limits.

Consume one record then break; separately raise from a batch consumer and from a later invalid record. In every case, the owned generator/file must close and the real failure must remain visible. Prove the iterator is single-pass and processing does not eagerly read every record. Observe maximum read request sizes through an explicit stream test port; checking RSS once is not a general memory-bound proof. Show partial-success behavior explicitly and design the job's checkpoint/idempotency/commit policy before attaching real database writes. Learner practice and PDF/HTML extraction remain required; this lesson implements only the selected NDJSON boundary.

References checked2026-10-21: [Python3.13 iterators/generators](https://docs.python.org/3.13/tutorial/classes.html#iterators), [contextlib ownership/suppression](https://docs.python.org/3.13/library/contextlib.html), [binary IO/readline bounds](https://docs.python.org/3.13/library/io.html), [JSON hooks and decoder behavior](https://docs.python.org/3.13/library/json.html), [UTF-8 encodings](https://docs.python.org/3.13/library/codecs.html).
