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

<<< ../workbench/applied-ai/python/study_ai/extraction.py


This preserves whitespace inside a retained segment; blank plain-text lines are omitted but their line numbers still affect subsequent locators. CSV order is preserved, IDs remain strings, duplicate IDs fail, and quoted commas/newlines stay within their logical record. No partial result is returned on extraction failure. A caller must still stage/commit external writes atomically or idempotently; returning a tuple does not roll back writes made elsewhere.

Character offsets address Python Unicode code points in the normalized segment, not source-byte offsets, grapheme boundaries or model tokens. Combining marks/emoji may be split; a tokenizer-aware/sentence-aware strategy is an alternative that needs its own version and reproducible mapping. The final chunk stops at the segment end without manufacturing an extra overlap-only tail. Overlap increases storage and duplicated retrieval evidence. It does not recreate a table header or establish semantic completeness.

Do not index all formats with one arbitrary chunk size and call the result accurate. Start with paragraph/heading/table-aware units, use measured tokenizer budgets for the selected embedding/generation model, then evaluate answer support and citation accuracy on representative questions. This simple code-point chunker is a deterministic baseline for testing provenance. Preserve original bytes privately and version extraction/chunk settings so reindexing can replace previous chunks and deletion can remove every derivative.

## Executable examples and failure evidence

<<< ../workbench/applied-ai/python/lab_tests/test_extraction.py


The displayed tests verify the bounded extractor contract, not retrieval relevance or faithful PDF extraction. [Additional cases](../practice/applied-ai/chapters/document-processing.md) remain separate learner work.

## Normalization, identity and ingestion metadata

Normalization needs an explicit purpose and version. This extractor strips one UTF-8 BOM and normalizes CRLF/CR to LF; it does not lowercase/casefold text, collapse indentation, remove punctuation or normalize Unicode composition. Python source indentation, a code identifier's case and a quoted exact substring can be meaningful. Preserve the raw bytes and their hash even when creating a normalized search representation.

Unicode NFC can compose canonically equivalent sequences, while compatibility normalization such as NFKC can change distinctions useful in source material. Visually similar strings are not automatically interchangeable; normalization is not a confusable-character/spoofing defense. If an application adds NFC for search, version that transform, apply the reviewed query/document policy consistently and keep a mapping or original span for citations. Offsets in normalized text do not become raw-byte offsets. Do not silently change extractor_version while retaining old offsets/IDs as if the content were unchanged.

Use separate identities for the logical source, exact source version, extracted segment and derived chunk. The same source_id can receive new bytes, producing a different source_sha256 and derived chunk IDs. The identity helper above binds tenant namespace, logical source/version, extractor version, locator, boundaries and exact extracted text. JSON key sorting and fixed separators make the identity encoding deterministic; a schema/version change must bump identity_version. Chunking settings belong in ingestion metadata too: two settings that produce exactly the same chunk can share its content identity while having different index-generation membership.

A minimal ingestion manifest should retain tenant/source ID, raw-source version/hash, authorized storage reference, media contract, extractor/preprocessing/chunk configuration versions, chunk ID/locator/offsets, embedding-space version, index generation and job status. Store ACL/revocation policy alongside that data and recheck the authoritative source on fetch. Timestamp/title/filename are useful metadata but poor unique identities; mutable filenames and duplicate titles cannot safely deduplicate source versions.

A deterministic hash is not authorization, authenticity or a confidentiality mechanism. Do not use it as a public bearer capability. Low-entropy private text may be guessable even when only its digest is exposed. Store these keys privately under the same data policy; apply source deletion to every manifest/chunk/vector/cache derivative. The helper does not implement storage transactions, ACL lookup or deletion. Idempotent identity makes retry/upsert design possible, but only a durable uniqueness constraint and owned commit workflow can establish exactly what was stored.

<<< ../workbench/applied-ai/python/lab_tests/test_chunk_identity.py


These tests compare versions and preserve original code meaning; they do not establish that arbitrary normalization improves retrieval. The source hash intentionally distinguishes CRLF/LF source versions even when extracted visible text is equal. An application that wants a separate normalized-content deduplication key must add one explicitly without replacing the exact-source provenance key.

## PDF, OCR and HTML implementation decisions

For PDF, a page-oriented adapter should produce Segment values such as page:7 with extractor/version metadata. A maintained parser such as pypdf can extract embedded text; it does not perform OCR. An image-only page can produce no text without being a successful empty source. Route it to an explicit OCR-required state; never report a silently indexed empty document. Verify multi-column reading order, repeated headers, tables, ligatures and page citations against the rendered original. Character coordinates from a parser are not guaranteed to form clean paragraphs.

Compressed input bytes/page-count checks alone cannot bound PDF parsing: decompressed content streams and object graphs can be much larger. Even asking a parser for decompressed-stream length can allocate that stream first. Run untrusted PDF/DOCX/OCR parsing in a disposable worker with enforced memory/CPU/wall-time/file-size limits, no provider/storage credentials, no outbound network and a bounded output channel. Kill/reap the whole worker on deadline; cancelling an asyncio waiter does not stop synchronous parser work. Quarantine parser crashes/timeouts and retain a safe job category, not raw source text in public errors. Update/rebuild parser dependencies through the locked environment.

For HTML, HTMLParser is an event parser, not a browser DOM or sanitization library; it tolerates malformed markup and does not match every implicit close. A worked extraction policy should discard script/style/navigation, keep heading/paragraph/table boundaries, decode entities once, and never fetch src/href resources. A source that says "ignore previous instructions" stays document content, never a system instruction. Rendering and model prompt boundaries require separate controls even after successful extraction.

Prefer one maintained adapter per required format over accumulating document frameworks. Before adopting a library, test a labeled corpus with expected text and locators, malicious/decompression fixtures in isolation, and explicit unsupported/encrypted/scan outcomes. Parser success is not semantic success. Keep a needs_review state for ambiguous reading order rather than invent a confident flattened result.

## Practice and acceptance

[Separate exercises and acceptance criteria](../practice/applied-ai/chapters/document-processing.md).

References checked2026-10-21: [Python3.13 CSV dialect/newline handling](https://docs.python.org/3.13/library/csv.html), [HTMLParser behavior](https://docs.python.org/3.13/library/html.parser.html), [pypdf text extraction and OCR limitations](https://pypdf.readthedocs.io/en/stable/user/extract-text.html), [OWASP file upload controls](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html). [Unicode normalization forms](https://docs.python.org/3.13/library/unicodedata.html), [hash digests](https://docs.python.org/3.13/library/hashlib.html). Python3.13.11 is the executable baseline; current3.13 documentation may describe later patch-level additions that this code does not use.

## Connect a document fragment to the AI task

For requirement20.20, a document is an application input with a format/authorization/provenance contract, not merely an uploaded filename. Keep the primary runnable format path UTF-8 text/CSV. Read authorized bounded bytes, call extract, show the retained line/record choices, and select a specific chunk whose exact text fits the classifier's source limit. Record source ID/hash, extractor/chunk policy and locator/offsets beside the task result. Passing only one selected fragment means the label applies to that fragment, not automatically to the whole document.

**Worked trace:** CSV bytes id,text followed by001,"React renders UI." extract as record:1;id:001, preserving001 as a string and the text exactly. Chunk that record, retain its identity under the actual tenant, and pass item.text to classification_messages with the existing schema/SDK checks. A returned quote React must occur in that same selected text; displaying its source link requires current authorization and the recorded original version. If the source changes after ingestion, re-resolve or mark stale rather than attach an old quote to new content. An empty/unreadable/unsupported source stops before provider I/O; an outage remains an operational state.

For a large document, select/retrieve relevant authorized fragments and use the answer-context/citation pipeline instead of silently truncating it into the classifier. PDF/OCR and image interpretation are different adapters: a text-only scan may need OCR, while a diagram question may need reviewed image input. The [worked multimodal examples](./prompting-and-modalities.md#multimodality-changes-both-evidence-and-failure-modes) cover image coordinates, crop uncertainty and timestamp provenance; input support and extraction accuracy require task-specific evidence. Native document/file provider inputs are an alternative provider contract with upload, permission, retention and token costs, not implemented by this text/CSV lab.

[Separate learner criteria](../practice/applied-ai/chapters/document-processing.md).
