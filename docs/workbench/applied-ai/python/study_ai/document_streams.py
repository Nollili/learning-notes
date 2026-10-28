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
