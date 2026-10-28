# Bounded Document Streams and Resource Ownership — practice

**Learner status: still required.** These requirements were separated from the textbook. Use the [integrated sequence](../index.md) and shared evidence record; running reference checks is not independent completion.

[Textbook](../../../python-for-ai/bounded-document-streams.md)

## Practice and acceptance

**Acceptance:** strict-check the package and execute these tests. Read a valid UTF-8/CRLF/final-no-LF fixture, then malformed/truncated/duplicate-key/nonfinite/BOM/non-object variants. Verify total bytes, line bytes, physical lines, records and duplicate IDs independently, including exact-limit acceptance and one-over rejection. Repeat with a multibyte body so character and byte limits cannot be confused. A blank-line flood must hit the physical-line/byte budget rather than loop without limits.

Consume one record then break; separately raise from a batch consumer and from a later invalid record. In every case, the owned generator/file must close and the real failure must remain visible. Prove the iterator is single-pass and processing does not eagerly read every record. Observe maximum read request sizes through an explicit stream test port; checking RSS once is not a general memory-bound proof. Show partial-success behavior explicitly and design the job's checkpoint/idempotency/commit policy before attaching real database writes. Learner practice and PDF/HTML extraction remain required; this lesson implements only the selected NDJSON boundary.
