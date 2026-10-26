# Document Extraction, Provenance and Chunk Boundaries

Continue the Python3.13.11/uv project. The [NDJSON reader](./bounded-document-streams.md) validates already structured documents. Here the input is an authorized source object: bounded UTF-8 plain text or an explicitly specified CSV dialect. Extraction produces text plus source locations; chunking makes smaller retrieval units. Neither step decides whether a source is trustworthy or whether a model should obey instructions inside it.

## Choose an explicit format contract

Use a server-owned media-type allowlist, byte budget and authorized storage handle. Filename extensions and client Content-Type are hints, not proof of content. The implementation below accepts bytes read by a separate bounded owner; it does not download URLs, follow links, open caller-supplied paths, unpack archives or execute embedded code. Reject unsupported formats rather than silently interpret binary data as text.

| Source | Primary treatment | Common failure |
|---|---|---|
| UTF-8 text / Markdown | Strict decode, normalize line endings, retain original line locations | Encoding guesses corrupt text; Markdown links become an unintended fetch queue |
| CSV | Explicit dialect, exact header/column contract, quoted multiline support | Splitting on commas/newlines breaks quoted fields; inferred types lose leading zeros |
| HTML | Dedicated extraction policy retaining source URL/version and useful structure | Regex stripping merges words; script/style/navigation contaminate content |
| PDF | Page-aware extractor in an isolated worker; OCR when needed | Reading order, columns, ligatures and scanned pages make plain extraction unreliable |
| DOCX | Maintained format parser in a worker, preserving paragraph/table provenance | ZIP expansion, relationships and tables defeat naive XML concatenation |

Do not use pickle, eval or dynamic imports to decode documents. Text extracted from HTML remains untrusted text: render it through textContent/escaping, not innerHTML. Do not treat extraction as HTML sanitization. CSV cells beginning with spreadsheet formula markers require a separate spreadsheet-export policy; this reader does not execute or "clean" those formulas. Preserve the original evidence rather than silently rewrite its meaning.

## Worked bounded text and CSV extractor

The source_id is a server-assigned opaque ID, not a user filename or URL containing credentials. SHA-256 identifies exact source bytes for reproducibility; it is not authorization, proof of authenticity or a safe public identifier for sensitive low-entropy data. Tenant/ACL membership must accompany source/chunk metadata in storage and retrieval filters.

Limits here are deliberately small:256KiB raw input,1000 physical lines,1000 extracted segments and a bounded chunk count. Memory is proportional to those caps; this is a bounded eager extractor, not a constant-memory streaming claim. The CSV parser's default global field limit remains unchanged; its failures become a fixed extraction error. Do not mutate csv.field_size_limit per request because it is process-wide state.

```python
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
```

This preserves whitespace inside a retained segment; blank plain-text lines are omitted but their line numbers still affect subsequent locators. CSV order is preserved, IDs remain strings, duplicate IDs fail, and quoted commas/newlines stay within their logical record. No partial result is returned on extraction failure. A caller must still stage/commit external writes atomically or idempotently; returning a tuple does not roll back writes made elsewhere.

Character offsets address Python Unicode code points in the normalized segment, not source-byte offsets, grapheme boundaries or model tokens. Combining marks/emoji may be split; a tokenizer-aware/sentence-aware strategy is an alternative that needs its own version and reproducible mapping. The final chunk stops at the segment end without manufacturing an extra overlap-only tail. Overlap increases storage and duplicated retrieval evidence. It does not recreate a table header or establish semantic completeness.

Do not index all formats with one arbitrary chunk size and call the result accurate. Start with paragraph/heading/table-aware units, use measured tokenizer budgets for the selected embedding/generation model, then evaluate answer support and citation accuracy on representative questions. This simple code-point chunker is a deterministic baseline for testing provenance. Preserve original bytes privately and version extraction/chunk settings so reindexing can replace previous chunks and deletion can remove every derivative.

## Executable examples and failure evidence

```python
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
```

Run the existing strict package check and pytest suite. Add exact byte/line/chunk-limit acceptance and one-over cases, Unicode slicing assertions and synthetic secrets in malformed records. Test unsupported runtime format values even though type checking rejects their use. These checks prove this extractor's contract; they do not prove retrieval relevance or faithful PDF extraction.

## Normalization, identity and ingestion metadata

Normalization needs an explicit purpose and version. This extractor strips one UTF-8 BOM and normalizes CRLF/CR to LF; it does not lowercase/casefold text, collapse indentation, remove punctuation or normalize Unicode composition. Python source indentation, a code identifier's case and a quoted exact substring can be meaningful. Preserve the raw bytes and their hash even when creating a normalized search representation.

Unicode NFC can compose canonically equivalent sequences, while compatibility normalization such as NFKC can change distinctions useful in source material. Visually similar strings are not automatically interchangeable; normalization is not a confusable-character/spoofing defense. If an application adds NFC for search, version that transform, apply the reviewed query/document policy consistently and keep a mapping or original span for citations. Offsets in normalized text do not become raw-byte offsets. Do not silently change extractor_version while retaining old offsets/IDs as if the content were unchanged.

Use separate identities for the logical source, exact source version, extracted segment and derived chunk. The same source_id can receive new bytes, producing a different source_sha256 and derived chunk IDs. The identity helper above binds tenant namespace, logical source/version, extractor version, locator, boundaries and exact extracted text. JSON key sorting and fixed separators make the identity encoding deterministic; a schema/version change must bump identity_version. Chunking settings belong in ingestion metadata too: two settings that produce exactly the same chunk can share its content identity while having different index-generation membership.

A minimal ingestion manifest should retain tenant/source ID, raw-source version/hash, authorized storage reference, media contract, extractor/preprocessing/chunk configuration versions, chunk ID/locator/offsets, embedding-space version, index generation and job status. Store ACL/revocation policy alongside that data and recheck the authoritative source on fetch. Timestamp/title/filename are useful metadata but poor unique identities; mutable filenames and duplicate titles cannot safely deduplicate source versions.

A deterministic hash is not authorization, authenticity or a confidentiality mechanism. Do not use it as a public bearer capability. Low-entropy private text may be guessable even when only its digest is exposed. Store these keys privately under the same data policy; apply source deletion to every manifest/chunk/vector/cache derivative. The helper does not implement storage transactions, ACL lookup or deletion. Idempotent identity makes retry/upsert design possible, but only a durable uniqueness constraint and owned commit workflow can establish exactly what was stored.

```python
# lab_tests/test_chunk_identity.py
from dataclasses import replace
import unicodedata

import pytest

from study_ai.extraction import ExtractionError, chunk, chunk_identity, extract


def test_identity_is_stable_scoped_and_versioned():
    item = chunk(extract(b"First\r\nSecond", source_id="source1", kind="text"))[0]
    identity = chunk_identity(item, tenant_id="tenant1")
    assert len(identity) == 64 and identity == chunk_identity(item, tenant_id="tenant1")
    assert identity != chunk_identity(item, tenant_id="tenant2")
    for changed in [replace(item, source_id="source2"), replace(item, source_sha256="0" * 64),
                    replace(item, extractor_version="text-csv-v2"), replace(item, locator="line:2"),
                    replace(item, start=1), replace(item, end=2), replace(item, text="Changed")]:
        assert chunk_identity(changed, tenant_id="tenant1") != identity
    lf = chunk(extract(b"First\nSecond", source_id="source1", kind="text"))[0]
    assert lf.text == item.text
    assert chunk_identity(lf, tenant_id="tenant1") != identity  # Raw source version differs.
    with pytest.raises(ExtractionError, match="tenant namespace"):
        chunk_identity(item, tenant_id="../PRIVATE_NAMESPACE")


def test_normalization_preserves_meaning_and_records_composition():
    raw = "  Name = 'e\u0301'\r\n    return Name\r\n".encode("utf-8")
    source = extract(raw, source_id="code", kind="text")
    assert source.segments[0].text == "  Name = 'e\u0301'"
    assert source.segments[1].text == "    return Name"
    nfc = unicodedata.normalize("NFC", source.segments[0].text)
    assert nfc != source.segments[0].text
    assert len(nfc) + 1 == len(source.segments[0].text)
```

These tests compare versions and preserve original code meaning; they do not establish that arbitrary normalization improves retrieval. The source hash intentionally distinguishes CRLF/LF source versions even when extracted visible text is equal. An application that wants a separate normalized-content deduplication key must add one explicitly without replacing the exact-source provenance key.

## PDF, OCR and HTML implementation decisions

For PDF, a page-oriented adapter should produce Segment values such as page:7 with extractor/version metadata. A maintained parser such as pypdf can extract embedded text; it does not perform OCR. An image-only page can produce no text without being a successful empty source. Route it to an explicit OCR-required state; never report a silently indexed empty document. Verify multi-column reading order, repeated headers, tables, ligatures and page citations against the rendered original. Character coordinates from a parser are not guaranteed to form clean paragraphs.

Compressed input bytes/page-count checks alone cannot bound PDF parsing: decompressed content streams and object graphs can be much larger. Even asking a parser for decompressed-stream length can allocate that stream first. Run untrusted PDF/DOCX/OCR parsing in a disposable worker with enforced memory/CPU/wall-time/file-size limits, no provider/storage credentials, no outbound network and a bounded output channel. Kill/reap the whole worker on deadline; cancelling an asyncio waiter does not stop synchronous parser work. Quarantine parser crashes/timeouts and retain a safe job category, not raw source text in public errors. Update/rebuild parser dependencies through the locked environment.

For HTML, HTMLParser is an event parser, not a browser DOM or sanitization library; it tolerates malformed markup and does not match every implicit close. A worked extraction policy should discard script/style/navigation, keep heading/paragraph/table boundaries, decode entities once, and never fetch src/href resources. A source that says "ignore previous instructions" stays document content, never a system instruction. Rendering and model prompt boundaries require separate controls even after successful extraction.

Prefer one maintained adapter per required format over accumulating document frameworks. Before adopting a library, test a labeled corpus with expected text and locators, malicious/decompression fixtures in isolation, and explicit unsupported/encrypted/scan outcomes. Parser success is not semantic success. Keep a needs_review state for ambiguous reading order rather than invent a confident flattened result.

## Practice and acceptance

Build an authorized ingestion job around the text/CSV implementation: bounded read before extract, source/tenant authorization, staging, stable source-version key, versioned chunk settings and idempotent index replacement. Preserve exact-source hash, segment locator and chunk offsets; fetch a chunk by its ID and show its supporting original line/record. Deleting a source must remove every chunk and derived index record. Reject unsupported formats before any model call. Keep model credentials out of extraction workers and logs.

**Acceptance:** all examples and edge cases pass; document byte/line/segment/chunk bounds and ownership; prove CSV quoting/leading-zero/multiline behavior and deterministic chunk offsets; explain code points versus tokens. Add a reviewed PDF/OCR or HTML adapter only when your project's formats require it, with corpus-based fidelity and process-isolation evidence. That advanced adapter implementation, a real index, end-to-end ingestion and learner practice remain unperformed. The supplied material covers the intermediate extraction boundary and format decision process; it does not claim a general secure document conversion service.

References checked2026-10-21: [Python3.13 CSV dialect/newline handling](https://docs.python.org/3.13/library/csv.html), [HTMLParser behavior](https://docs.python.org/3.13/library/html.parser.html), [pypdf text extraction and OCR limitations](https://pypdf.readthedocs.io/en/stable/user/extract-text.html), [OWASP file upload controls](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html). [Unicode normalization forms](https://docs.python.org/3.13/library/unicodedata.html), [hash digests](https://docs.python.org/3.13/library/hashlib.html). Python3.13.11 is the executable baseline; current3.13 documentation may describe later patch-level additions that this code does not use.

## Connect a document fragment to the AI task

For requirement20.20, a document is an application input with a format/authorization/provenance contract, not merely an uploaded filename. Keep the primary runnable format path UTF-8 text/CSV. Read authorized bounded bytes, call extract, show the retained line/record choices, and select a specific chunk whose exact text fits the classifier's source limit. Record source ID/hash, extractor/chunk policy and locator/offsets beside the task result. Passing only one selected fragment means the label applies to that fragment, not automatically to the whole document.

**Worked trace:** CSV bytes id,text followed by001,"React renders UI." extract as record:1;id:001, preserving001 as a string and the text exactly. Chunk that record, retain its identity under the actual tenant, and pass item.text to classification_messages with the existing schema/SDK checks. A returned quote React must occur in that same selected text; displaying its source link requires current authorization and the recorded original version. If the source changes after ingestion, re-resolve or mark stale rather than attach an old quote to new content. An empty/unreadable/unsupported source stops before provider I/O; an outage remains an operational state.

For a large document, select/retrieve relevant authorized fragments and use the answer-context/citation pipeline instead of silently truncating it into the classifier. PDF/OCR and image interpretation are different adapters: a text-only scan may need OCR, while a diagram question may need reviewed image input. The [worked multimodal examples](./prompting-and-modalities.md#multimodality-changes-both-evidence-and-failure-modes) cover image coordinates, crop uncertainty and timestamp provenance; input support and extraction accuracy require task-specific evidence. Native document/file provider inputs are an alternative provider contract with upload, permission, retention and token costs, not implemented by this text/CSV lab.

**Acceptance:** execute the CSV→segment→chunk→prompt trace, require exact identity/quote provenance and no permission expansion; run unsupported/empty/invalid-encoding/oversize cases with zero provider calls. Review a source-version change and a misleading quote separately from parse success. For20.21, author the diagram/audio fixtures and input serialization tests already provided; do not claim vision/audio accuracy from typed request construction. Full ingestion/storage/update/delete, live multimodal quality and learner independent practice remain required.
