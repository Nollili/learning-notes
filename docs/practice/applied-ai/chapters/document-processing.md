# Document Extraction, Provenance and Chunk Boundaries — practice

**Learner status: still required.** These requirements were separated from the textbook. Use the [integrated sequence](../index.md) and shared evidence record; running reference checks is not independent completion.

[Textbook](../../../python-for-ai/document-processing.md)

## Practice and acceptance

Build an authorized ingestion job around the text/CSV implementation: bounded read before extract, source/tenant authorization, staging, stable source-version key, versioned chunk settings and idempotent index replacement. Preserve exact-source hash, segment locator and chunk offsets; fetch a chunk by its ID and show its supporting original line/record. Deleting a source must remove every chunk and derived index record. Reject unsupported formats before any model call. Keep model credentials out of extraction workers and logs.

**Acceptance:** all examples and edge cases pass; document byte/line/segment/chunk bounds and ownership; prove CSV quoting/leading-zero/multiline behavior and deterministic chunk offsets; explain code points versus tokens. Add a reviewed PDF/OCR or HTML adapter only when your project's formats require it, with corpus-based fidelity and process-isolation evidence. That advanced adapter implementation, a real index, end-to-end ingestion and learner practice remain unperformed. The supplied material covers the intermediate extraction boundary and format decision process; it does not claim a general secure document conversion service.


**Acceptance:** execute the CSV→segment→chunk→prompt trace, require exact identity/quote provenance and no permission expansion; run unsupported/empty/invalid-encoding/oversize cases with zero provider calls. Review a source-version change and a misleading quote separately from parse success. For20.21, author the diagram/audio fixtures and input serialization tests already provided; do not claim vision/audio accuracy from typed request construction. Full ingestion/storage/update/delete, live multimodal quality and learner independent practice remain required.

Run the existing strict package check and pytest suite. Add exact byte/line/chunk-limit acceptance and one-over cases, Unicode slicing assertions and synthetic secrets in malformed records. Test unsupported runtime format values even though type checking rejects their use. These checks prove this extractor's contract; they do not prove retrieval relevance or faithful PDF extraction.
