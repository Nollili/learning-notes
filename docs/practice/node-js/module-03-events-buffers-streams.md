# EventEmitter, Buffers, and Streams — practice

**Learner status: still required.** These tasks were separated from the textbook; no completion is credited.

[Textbook explanation](../../node-js/module-03-events-buffers-streams.md) · [Node.js practice map](./index.md)

### Diagnostic exercise

Process a large newline-delimited file with bounded memory.

Requirements:

- reject a record larger than 1 MB;
- preserve multibyte UTF-8 characters across chunks;
- report the line number for malformed JSON;
- stop the whole pipeline when output fails;
- support cancellation;
- demonstrate that a slow destination does not cause unbounded memory growth.

---

## 15. Final review checklist

You should be able to explain and demonstrate each point:

### Framing and diagnosis

- Treat stream chunks as arbitrary boundaries, not application messages.
- Preserve multibyte text across chunks.
- Bound every delimiter- or length-based frame.
- Diagnose ignored backpressure, unfinished callbacks, missing end signals, and partial output.
- Use `pipeline()` as one error, cleanup, completion, and cancellation boundary.

### EventEmitter

- `on()` registers a persistent listener; `once()` registers a one-use listener.
- `emit()` calls listeners synchronously in registration order.
- The listener must be registered on the same emitter instance before the event occurs.
- A listener added after an event does not receive that past event.
- An unhandled `'error'` event throws.
- A listener's thrown exception is not automatically converted to an `'error'` event.
- `emit()` does not await async listeners or propagate their rejections as promise results.
- `off()` needs the same listener function reference used by `on()`.
- Listener-count warnings usually indicate missing lifecycle cleanup.
- Events suit repeated fan-out notifications; promises suit one result or error.

### Buffer

- A buffer is a fixed-length byte sequence used for binary data.
- `Buffer.from()` converts existing data; `Buffer.alloc()` creates initialized storage.
- `Buffer.allocUnsafe()` can expose stale memory unless every byte is overwritten.
- UTF-8 string length and byte length can differ.
- Base64 and hex are encodings, not encryption.
- `toString()` decodes bytes using an encoding.
- Numeric reads/writes must use the correct offset, size, signedness, and endianness.
- `Buffer.from(buffer)` copies, while `subarray()` and `Buffer.slice()` share memory.
- Stream chunks may split characters, lines, and application records.
- Repeated concatenation can cause unnecessary allocations and copying.

### Streams

- A readable produces data; a writable consumes it.
- A duplex has independent readable and writable sides.
- A transform converts writable input into readable output.
- Streams extend `EventEmitter` and emit lifecycle and error events.
- Readable completion uses `'end'`; writable completion uses `'finish'`; resource closure uses `'close'`.
- Async iteration is a clean, backpressure-aware way to consume a readable.
- Avoid mixing flowing, paused, piped, and async-iterator consumption styles.
- Chunks have arbitrary boundaries.
- `.write()` returning `false` means wait for `'drain'`; it does not mean the write failed.
- `pipeline()` coordinates backpressure, failure propagation, destruction, and completion.
- Application code must still clean up partial domain artifacts after pipeline failure.
- `highWaterMark` is a threshold, not a universal memory limit.
- Object-mode thresholds count objects, regardless of each object's size.
- Connected stages must agree about whether chunks are bytes/strings or objects.
- Custom stream callbacks must be called exactly once.
- Custom readables stop pushing when `push()` returns `false` and end with `push(null)`.
- Custom transforms preserve incomplete records between chunks and flush remaining state.
- Streams do not make CPU-heavy JavaScript non-blocking.
- Open streams and underlying resources must be closed or destroyed on every lifecycle path.

### Failure-driven practice acceptance

Baseline: Node24.18.0. Run the JSONL stage through pipeline with a compatible bounded byte source and a slow object-mode writable (highWaterMark1). Feed split UTF-8, split CRLF, multiple records in one chunk, final record without LF, whitespace, malformed JSON with line number, invalid UTF-8, null followed by an object, arrays/primitives, excessive frame/chunk/count and empty input.

Acceptance: valid objects survive exactly once; invalid input rejects the pipeline; source/destination are destroyed on failure; no push-after-EOF; parsing pauses with downstream demand rather than preproducing all records. Abort a blocked pipeline and fail the destination; verify generator/source cleanup. Observe bounded queue/pull counts and a realistic memory trend separately; a tiny fixture does not prove constant RSS.

For countErrorLines, test a missing file and an input that errors after a valid line; both must reject and release the input. On normal EOF require the expected count and resource closure. For UppercaseTransform, decoded strings succeed and Buffer input fails through the callback. Compare finished listener counts with cleanup:true on an owned stream. Exercise Job task/listener failure contracts and abort an events.on loop, checking listeners return to their initial count.

Run the delegated iterator break and explicit return cases and retain cleanup evidence. Run the serialization table, then serializeProgress with unknown/invalid/cyclic-extra/BigInt-required/secret-extra inputs and require the documented projection/errors. Learner exercises and service-scale memory/platform validation remain required even when example checks pass.

References checked2026-10-21: [Node24 streams](https://nodejs.org/download/release/v24.18.0/docs/api/stream.html), [Node24 readline](https://nodejs.org/download/release/v24.18.0/docs/api/readline.html), [Node24 events](https://nodejs.org/download/release/v24.18.0/docs/api/events.html), [ECMAScript iteration](https://tc39.es/ecma262/multipage/control-abstraction-objects.html), [JSON algorithms](https://tc39.es/ecma262/multipage/structured-data.html#sec-json-object).
