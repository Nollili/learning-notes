# study_ai/extraction.py
from __future__ import annotations

import csv
import hashlib
import io
import json
import re
from dataclasses import dataclass
from typing import Literal

MAX_BYTES = 262144
MAX_LINES = 1000
MAX_SEGMENTS = 1000
MAX_CHUNKS = 4096


class ExtractionError(ValueError):
    pass


@dataclass(frozen=True, slots=True)
class Segment:
    locator: str
    text: str


@dataclass(frozen=True, slots=True)
class Extracted:
    source_id: str
    source_sha256: str
    extractor_version: str
    segments: tuple[Segment, ...]


@dataclass(frozen=True, slots=True)
class Chunk:
    source_id: str
    source_sha256: str
    extractor_version: str
    locator: str
    start: int
    end: int
    text: str


def _decode(raw: bytes) -> str:
    if len(raw) > MAX_BYTES:
        raise ExtractionError("Source byte limit exceeded")
    try:
        text = raw.decode("utf-8", errors="strict")
    except UnicodeDecodeError:
        raise ExtractionError("Source must be UTF-8") from None
    # UTF-8 BOM is explicitly supported here, unlike the NDJSON contract.
    if text.startswith("\ufeff"):
        text = text[1:]
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    if "\x00" in text:
        raise ExtractionError("Unsupported source character")
    if text.count("\n") + (not text.endswith("\n")) > MAX_LINES:
        raise ExtractionError("Source line limit exceeded")
    return text


def extract(raw: bytes, *, source_id: str, kind: Literal["text", "csv"]) -> Extracted:
    if re.fullmatch(r"[A-Za-z0-9_-]{1,64}", source_id) is None:
        raise ExtractionError("Invalid source id")
    text = _decode(raw)
    segments: list[Segment] = []
    if kind == "text":
        # Split only normalized LF; offsets below refer to this extracted text.
        for number, line in enumerate(text.split("\n"), start=1):
            if line.strip():
                segments.append(Segment(f"line:{number}", line))
    elif kind == "csv":
        # newline='' preserves embedded CSV newlines for the CSV parser.
        reader = csv.reader(io.StringIO(text, newline=""), delimiter=",", quotechar='"', strict=True)
        try:
            if next(reader, None) != ["id", "text"]:
                raise ExtractionError("CSV header must be id,text")
            ids: set[str] = set()
            for row_number, row in enumerate(reader, start=1):
                if len(row) != 2 or re.fullmatch(r"[A-Za-z0-9_-]{1,64}", row[0]) is None:
                    raise ExtractionError("Invalid CSV row")
                identity, body = row
                if identity in ids or not body.strip():
                    raise ExtractionError("Duplicate or empty CSV row")
                ids.add(identity)
                # Logical record number is distinct from physical reader.line_num.
                segments.append(Segment(f"record:{row_number};id:{identity}", body))
                if len(segments) > MAX_SEGMENTS:
                    raise ExtractionError("Source segment limit exceeded")
        except csv.Error:
            raise ExtractionError("Invalid CSV encoding or structure") from None
    else:
        raise ExtractionError("Unsupported source format")
    if not segments:
        raise ExtractionError("Source contains no extractable text")
    if len(segments) > MAX_SEGMENTS:
        raise ExtractionError("Source segment limit exceeded")
    return Extracted(source_id, hashlib.sha256(raw).hexdigest(), "text-csv-v1", tuple(segments))


def chunk(source: Extracted, *, size: int = 600, overlap: int = 80) -> tuple[Chunk, ...]:
    if type(size) is not int or type(overlap) is not int or not 1 <= size <= 2000 or not 0 <= overlap < size:
        raise ExtractionError("Invalid chunk configuration")
    result: list[Chunk] = []
    for segment in source.segments:
        start = 0
        while start < len(segment.text):
            end = min(start + size, len(segment.text))
            if len(result) >= MAX_CHUNKS:
                raise ExtractionError("Chunk count limit exceeded")
            result.append(Chunk(source.source_id, source.source_sha256, source.extractor_version,
                                segment.locator, start, end, segment.text[start:end]))
            if end == len(segment.text):
                break
            start = end - overlap
    return tuple(result)


def chunk_identity(item: Chunk, *, tenant_id: str) -> str:
    # Accept chunks produced by this extractor, plus a server-owned tenant namespace.
    if re.fullmatch(r"[A-Za-z0-9_-]{1,64}", tenant_id) is None:
        raise ExtractionError("Invalid tenant namespace")
    payload = {"identity_version": "chunk-id-v1", "tenant": tenant_id,
               "source_id": item.source_id, "source_sha256": item.source_sha256,
               "extractor_version": item.extractor_version, "locator": item.locator,
               "start": item.start, "end": item.end,
               "text_sha256": hashlib.sha256(item.text.encode("utf-8", errors="strict")).hexdigest()}
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=True)
    return hashlib.sha256(canonical.encode("ascii")).hexdigest()
