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

<<< ../workbench/applied-ai/python/study_ai/document_streams.py


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

<<< ../workbench/applied-ai/python/lab_tests/test_document_streams.py


The small test collects two batches only to inspect their values; a production consumer should process/release batches instead of collecting the whole file. The tracking wrapper still opens a real file and verifies the actual handle closes. Additional acceptance cases below cover failure after a partial yield and exact budget edges.

## Practice and acceptance

[Separate exercises and acceptance criteria](../practice/applied-ai/chapters/bounded-document-streams.md).

References checked2026-10-21: [Python3.13 iterators/generators](https://docs.python.org/3.13/tutorial/classes.html#iterators), [contextlib ownership/suppression](https://docs.python.org/3.13/library/contextlib.html), [binary IO/readline bounds](https://docs.python.org/3.13/library/io.html), [JSON hooks and decoder behavior](https://docs.python.org/3.13/library/json.html), [UTF-8 encodings](https://docs.python.org/3.13/library/codecs.html).
