# Python Async HTTP and Integration Boundaries

Use Python3.13.11/asyncio and HTTPX0.28.1 as the primary HTTP stack. Preserve the existing typed Document, settings and [bounded strict decoder](./bounded-document-streams.md). This lesson performs bounded read requests to a known service; it is not a generic URL-fetch endpoint or a model SDK wrapper.

```bash
uv add 'httpx==0.28.1'
uv run --locked python -m mypy --strict basics.py study_ai
uv run --locked python -m pytest
```

## Coroutines, tasks and cancellation

Calling an async def function creates a coroutine; it does not complete the work. await participates in cooperative scheduling. asyncio.run is a process/test entry point that owns a loop; do not call it inside an already running ASGI/Jupyter loop. Await from that existing async context instead.

An asyncio.Task runs a coroutine concurrently on that event loop. TaskGroup owns related tasks: a non-cancellation failure cancels siblings and waits for their cleanup, then raises an ExceptionGroup. It does not give a transaction across remote effects. gather's default failure behavior differs; do not assume it automatically stops all other operations. Keep task count and operation concurrency bounded independently.

Cancellation is cooperative. Do cleanup in finally/async with and propagate CancelledError; it inherits from BaseException in this baseline, so an ordinary except Exception does not catch it. Do not swallow it or detach untracked tasks. asyncio.timeout bounds an overall await scope, while HTTPX connect/read/write/pool timeouts cover distinct phases/inactivity. A peer sending a byte before each read timeout can still run too long without an overall deadline.

Blocking filesystem/PDF/CPU work inside async def still blocks the loop. to_thread can keep blocking I/O off the loop, but cancelling its await does not forcibly stop the underlying thread. Use bounded worker ownership and process isolation for hostile/CPU-heavy work; adding async syntax does not supply those limits.

## Reuse and close the client

<<< ../workbench/applied-ai/python/study_ai/http_documents.py


Settings.timeout_ms supplies the phase/inactivity budget; operation/batch overall deadlines remain explicit separate parameters. One app/job owns one reusable client/pool rather than constructing a client inside each hot-loop request. The async context closes it after all borrowed work drains. Read settings first; a directly constructed Settings object is not runtime-validated just because it is annotated. The factory uses the reviewed service origin, HTTPS verification defaults, no environment proxy surprise and no redirects. The adapter also disables redirects per request, so credentials cannot be carried into an unexpected redirect chain. An approved deployment proxy requires explicit policy/configuration rather than assuming trust_env is harmless.

The response contract deliberately accepts only two media-header forms and identity encoding. Other legitimate JSON header variants require an intentional parser/contract expansion. Rejecting compression avoids decompression expansion in this primitive; a later compressed-content adapter must bound decoded size and parser work separately. Content-Length is only an early check; the actual raw-byte count is authoritative. Streaming caps the retained body at64KiB and reads chunks of at most4096 yielded bytes; transport buffers and parsed objects add their own bounded/implementation costs. This is not a universal RSS proof.

Malformed JSON, duplicate keys/nonfinite values, invalid UTF-8/escaped surrogates and bad domain fields go through the shared decoder. A valid response for the wrong ID is still invalid. HTTP404 means absent under the service's documented authorization contract; upstream401/403 is not proof that this application's caller has invalid credentials. RemoteRejected stays an integration error to be mapped safely by the owning API/job. Do not forward upstream raw status/body/URL or classify a database/provider outage as a client400. Return no document only on the explicit404 path.

No automatic application retry is implemented here. A read retry may be reasonable for selected transient errors within one overall budget; define one owner, cap attempts/backoff and test it before adding it. Mutation retries need stronger idempotency/outcome reasoning. TaskGroup can raise grouped domain/transport errors; handle the group's categories at the application boundary rather than log str(group) with arbitrary nested causes. The per-request deadline covers stream lifetime; the batch deadline also covers semaphore waiting and sibling drain. Cooperative cleanup can take additional time; a supervisor remains the final hard-stop boundary.

## Transport-boundary tests

Use asyncio.run inside ordinary pytest tests; no extra async pytest plugin is required for this baseline. Create clients inside the loop that owns them. MockTransport exercises HTTPX request construction and adapter behavior without a network; it does not establish socket/TLS/pool-timeout behavior.

<<< ../workbench/applied-ai/python/lab_tests/test_http_documents.py


A prebuffered MockTransport response can differ from a network stream; use a custom AsyncByteStream when testing raw streaming/cleanup and be explicit about which layer the test represents. A transport fake that awaits an event can exercise asyncio's overall cancellation, but it does not make HTTPX's socket read timeout run. Test that with an actual controlled server.

## Real HTTP integration exercise

The following fixture owns a real local HTTP listener and its threads. It uses only synthetic authorization text. These test credentials are not passed through production Settings: the test explicitly substitutes an owned loopback origin.

<<< ../workbench/applied-ai/python/lab_tests/test_http_native.py


The read-timeout test gives the overall scope more time than the delayed fixture requires, so the observed HTTPX ReadTimeout is distinct from the overall timeout tested with MockTransport. The exception context is inspected only in this synthetic test, not emitted to logs. Both clients and the fixture server close even if an assertion fails. TLS, proxies and external provider behavior remain separate integration layers.

[Separate learner criteria](../practice/applied-ai/chapters/async-http.md).

References checked2026-10-21: [Python3.13 coroutines/TaskGroup/cancellation/timeouts](https://docs.python.org/3.13/library/asyncio-task.html), [HTTPX async client/stream ownership](https://www.python-httpx.org/async/), [phase timeouts](https://www.python-httpx.org/advanced/timeouts/), [pool limits](https://www.python-httpx.org/advanced/resource-limits/), [transports/testing](https://www.python-httpx.org/advanced/transports/), [HTTPX exceptions](https://www.python-httpx.org/exceptions/).
