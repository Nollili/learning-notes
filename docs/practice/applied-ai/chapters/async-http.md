# Python Async HTTP and Integration Boundaries — practice

**Learner status: still required.** Use the [integrated sequence](../index.md).

[Textbook](../../../python-for-ai/async-http.md)


**Acceptance:** execute normal/404/protocol/status/transport failures with real HTTPX and a controlled server. Verify the Authorization fixture header reaches only the owned origin and redirects are not followed. Assert the body limit both with a declared length and without relying on it, stream closure on timeout/caller cancellation and no dangling tasks/threads. Show actual per-phase timeout separately from the overall deadline. Across twenty inputs, at most the configured concurrency is active and output follows input order; one hard failure cancels/drains siblings. Reject invalid IDs/duplicate or oversized batches before sending a request. Do not let cancellation become None or a successful result.

Use fixed synthetic credentials; no paid/provider request is needed. Learner practice and deployment/TLS evidence remain required.
