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

```python
# study_ai/http_documents.py
from __future__ import annotations

import asyncio
import math
import re
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import httpx

from .document_streams import decode_document
from .domain import Document
from .settings import Settings

_ID = re.compile(r"[A-Za-z0-9_-]{1,64}")
_MAX_BYTES = 65536


class RemoteUnavailable(Exception):
    pass


class RemoteRejected(Exception):
    pass


class RemoteProtocolError(Exception):
    pass


@asynccontextmanager
async def open_service_client(settings: Settings) -> AsyncIterator[httpx.AsyncClient]:
    # Settings comes from read_settings; arbitrary caller URLs never reach this boundary.
    phase_seconds = settings.timeout_ms / 1000
    async with httpx.AsyncClient(
        base_url=settings.service_url.rstrip("/") + "/",
        headers={"Authorization": "Bearer " + settings.service_token, "Accept-Encoding": "identity"},
        timeout=httpx.Timeout(connect=phase_seconds, read=phase_seconds, write=phase_seconds,
                              pool=min(phase_seconds, 0.2)),
        limits=httpx.Limits(max_connections=8, max_keepalive_connections=4),
        follow_redirects=False, trust_env=False,
    ) as client:
        yield client


def _budget(seconds: float) -> None:
    if isinstance(seconds, bool) or not math.isfinite(seconds) or not 0 < seconds <= 10:
        raise ValueError("Invalid overall deadline")


async def fetch_document(client: httpx.AsyncClient, identity: str, *, total_seconds: float = 1.0) -> Document | None:
    if _ID.fullmatch(identity) is None:
        raise ValueError("Invalid local document id")
    _budget(total_seconds)
    try:
        async with asyncio.timeout(total_seconds):
            async with client.stream("GET", "documents/" + identity,
                                     headers={"Accept-Encoding": "identity"}, follow_redirects=False) as response:
                if response.status_code == 404:
                    return None
                if response.status_code == 429 or response.status_code >= 500:
                    raise RemoteUnavailable("Upstream unavailable")
                if response.status_code != 200:
                    raise RemoteRejected("Upstream request rejected")
                media = response.headers.get("content-type", "").strip().lower()
                if media not in {"application/json", "application/json; charset=utf-8"}:
                    raise RemoteProtocolError("Unexpected upstream media type")
                if response.headers.get("content-encoding", "identity").strip().lower() != "identity":
                    raise RemoteProtocolError("Compressed upstream response is outside this contract")
                declared = response.headers.get("content-length")
                if declared is not None and (not declared.isascii() or not declared.isdigit()
                                             or len(declared) > 10 or int(declared) > _MAX_BYTES):
                    raise RemoteProtocolError("Invalid upstream size declaration")
                body = bytearray()
                async for chunk in response.aiter_raw(chunk_size=4096):
                    if len(body) + len(chunk) > _MAX_BYTES:
                        raise RemoteProtocolError("Upstream body budget exceeded")
                    body.extend(chunk)
                try:
                    document = decode_document(bytes(body))
                except (ValueError, RecursionError):
                    raise RemoteProtocolError("Invalid upstream document") from None
                if document.id != identity:
                    raise RemoteProtocolError("Upstream identity mismatch")
                return document
    except (TimeoutError, httpx.RequestError):
        # RequestError text/URLs may include sensitive request context; no raw echo/chaining.
        raise RemoteUnavailable("Upstream transport unavailable") from None


async def fetch_many(client: httpx.AsyncClient, identities: list[str], *,
                     concurrency: int = 4, total_seconds: float = 3.0) -> list[Document | None]:
    _budget(total_seconds)
    if len(identities) > 20 or len(set(identities)) != len(identities):
        raise ValueError("Invalid document request batch")
    if any(_ID.fullmatch(identity) is None for identity in identities):
        raise ValueError("Invalid local document id")
    if type(concurrency) is not int or not 1 <= concurrency <= 8:
        raise ValueError("Invalid concurrency")
    slots = asyncio.Semaphore(concurrency)

    async def one(identity: str) -> Document | None:
        async with slots:
            return await fetch_document(client, identity)

    async with asyncio.timeout(total_seconds):
        async with asyncio.TaskGroup() as group:
            tasks = [group.create_task(one(identity)) for identity in identities]
    return [task.result() for task in tasks]
```

Settings.timeout_ms supplies the phase/inactivity budget; operation/batch overall deadlines remain explicit separate parameters. One app/job owns one reusable client/pool rather than constructing a client inside each hot-loop request. The async context closes it after all borrowed work drains. Read settings first; a directly constructed Settings object is not runtime-validated just because it is annotated. The factory uses the reviewed service origin, HTTPS verification defaults, no environment proxy surprise and no redirects. The adapter also disables redirects per request, so credentials cannot be carried into an unexpected redirect chain. An approved deployment proxy requires explicit policy/configuration rather than assuming trust_env is harmless.

The response contract deliberately accepts only two media-header forms and identity encoding. Other legitimate JSON header variants require an intentional parser/contract expansion. Rejecting compression avoids decompression expansion in this primitive; a later compressed-content adapter must bound decoded size and parser work separately. Content-Length is only an early check; the actual raw-byte count is authoritative. Streaming caps the retained body at64KiB and reads chunks of at most4096 yielded bytes; transport buffers and parsed objects add their own bounded/implementation costs. This is not a universal RSS proof.

Malformed JSON, duplicate keys/nonfinite values, invalid UTF-8/escaped surrogates and bad domain fields go through the shared decoder. A valid response for the wrong ID is still invalid. HTTP404 means absent under the service's documented authorization contract; upstream401/403 is not proof that this application's caller has invalid credentials. RemoteRejected stays an integration error to be mapped safely by the owning API/job. Do not forward upstream raw status/body/URL or classify a database/provider outage as a client400. Return no document only on the explicit404 path.

No automatic application retry is implemented here. A read retry may be reasonable for selected transient errors within one overall budget; define one owner, cap attempts/backoff and test it before adding it. Mutation retries need stronger idempotency/outcome reasoning. TaskGroup can raise grouped domain/transport errors; handle the group's categories at the application boundary rather than log str(group) with arbitrary nested causes. The per-request deadline covers stream lifetime; the batch deadline also covers semaphore waiting and sibling drain. Cooperative cleanup can take additional time; a supervisor remains the final hard-stop boundary.

## Transport-boundary tests

Use asyncio.run inside ordinary pytest tests; no extra async pytest plugin is required for this baseline. Create clients inside the loop that owns them. MockTransport exercises HTTPX request construction and adapter behavior without a network; it does not establish socket/TLS/pool-timeout behavior.

```python
# lab_tests/test_http_documents.py
from __future__ import annotations

import asyncio
import json

import httpx
import pytest

from study_ai.http_documents import RemoteProtocolError, RemoteUnavailable, fetch_document, fetch_many


class TrackedStream(httpx.AsyncByteStream):
    def __init__(self, payload: bytes, *, wait: bool = False) -> None:
        self.payload = payload
        self.wait = wait
        self.closed = False

    async def __aiter__(self):
        if self.wait:
            await asyncio.Event().wait()
        yield self.payload

    async def aclose(self) -> None:
        self.closed = True


def test_valid_response_and_scope_of_absence() -> None:
    async def scenario() -> None:
        async def handle(request: httpx.Request) -> httpx.Response:
            if request.url.path.endswith("/missing"):
                return httpx.Response(404)
            return httpx.Response(200, headers={"content-type": "application/json"},
                                  stream=TrackedStream(json.dumps({"id": "d1", "body": "text"}).encode()))
        async with httpx.AsyncClient(base_url="https://service.example.test/v1/",
                                     transport=httpx.MockTransport(handle)) as client:
            document = await fetch_document(client, "d1")
            assert document is not None and document.id == "d1"
            assert await fetch_document(client, "missing") is None
    asyncio.run(scenario())


def test_protocol_failure_closes_stream() -> None:
    async def scenario() -> None:
        stream = TrackedStream(b'{"id":"wrong","body":"private content"}')
        async with httpx.AsyncClient(base_url="https://service.example.test/v1/",
                transport=httpx.MockTransport(lambda request: httpx.Response(200,
                    headers={"content-type": "application/json"}, stream=stream))) as client:
            with pytest.raises(RemoteProtocolError, match="identity"):
                await fetch_document(client, "d1")
        assert stream.closed
    asyncio.run(scenario())


def test_overall_deadline_cancels_and_closes_stream() -> None:
    async def scenario() -> None:
        stream = TrackedStream(b"", wait=True)
        async with httpx.AsyncClient(base_url="https://service.example.test/v1/",
                transport=httpx.MockTransport(lambda request: httpx.Response(200,
                    headers={"content-type": "application/json"}, stream=stream))) as client:
            with pytest.raises(RemoteUnavailable):
                await fetch_document(client, "d1", total_seconds=0.02)
        assert stream.closed
    asyncio.run(scenario())


def test_taskgroup_failure_cancels_sibling() -> None:
    async def scenario() -> None:
        slow_started = asyncio.Event()
        slow = TrackedStream(b"", wait=True)
        async def handle(request: httpx.Request) -> httpx.Response:
            if request.url.path.endswith("/slow"):
                slow_started.set()
                return httpx.Response(200, headers={"content-type": "application/json"}, stream=slow)
            await slow_started.wait()
            return httpx.Response(503)
        async with httpx.AsyncClient(base_url="https://service.example.test/v1/",
                                     transport=httpx.MockTransport(handle)) as client:
            with pytest.raises(ExceptionGroup) as failure:
                await fetch_many(client, ["slow", "fail"], concurrency=2)
            assert any(isinstance(error, RemoteUnavailable) for error in failure.value.exceptions)
        assert slow.closed
    asyncio.run(scenario())
```

A prebuffered MockTransport response can differ from a network stream; use a custom AsyncByteStream when testing raw streaming/cleanup and be explicit about which layer the test represents. A transport fake that awaits an event can exercise asyncio's overall cancellation, but it does not make HTTPX's socket read timeout run. Test that with an actual controlled server.

## Real HTTP integration exercise

The following fixture owns a real local HTTP listener and its threads. It uses only synthetic authorization text. These test credentials are not passed through production Settings: the test explicitly substitutes an owned loopback origin.

```python
# lab_tests/test_http_native.py
from __future__ import annotations

import asyncio
import json
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import httpx
import pytest

from study_ai.http_documents import RemoteProtocolError, RemoteRejected, RemoteUnavailable, fetch_document, fetch_many


@pytest.fixture
def local_service():
    received = []
    state = {"active": 0, "peak": 0}
    lock = threading.Lock()

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *args):
            pass

        def do_GET(self):
            identity = self.path.rsplit("/", 1)[-1]
            with lock:
                received.append((identity, self.headers.get("Authorization")))
                state["active"] += 1
                state["peak"] = max(state["peak"], state["active"])
            try:
                if identity == "slow":
                    time.sleep(0.15)
                elif identity.startswith("batch"):
                    time.sleep(0.02)
                status = 404 if identity == "missing" else 503 if identity == "fail" else 200
                if identity == "redirect":
                    status = 302
                body = json.dumps({"id": "other" if identity == "wrong-id" else identity,
                                   "body": "fixture"}).encode()
                if identity == "invalid-utf8":
                    body = b"\xff"
                if identity in {"big", "big-no-length"}:
                    body = b"x" * 70000
                self.send_response(status)
                self.send_header("Content-Type", "application/json")
                self.send_header("Connection", "close")
                if identity != "big-no-length":
                    self.send_header("Content-Length", str(len(body)))
                if identity == "redirect":
                    self.send_header("Location", "/v1/documents/d1")
                self.end_headers()
                self.wfile.write(body)
            except (BrokenPipeError, ConnectionResetError):
                pass  # Expected when a bounded client closes early.
            finally:
                with lock:
                    state["active"] -= 1

    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    server.daemon_threads = False
    thread = threading.Thread(target=server.serve_forever, kwargs={"poll_interval": 0.01})
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_address[1]}/v1/", received, state
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=2)
        assert not thread.is_alive()


def test_real_http_protocol_and_concurrency(local_service):
    base_url, received, state = local_service
    async def scenario():
        async with httpx.AsyncClient(base_url=base_url, trust_env=False,
                headers={"Authorization": "Bearer SYNTHETIC_TEST_ONLY"},
                timeout=httpx.Timeout(0.5)) as client:
            document = await fetch_document(client, "d1")
            assert document is not None and document.id == "d1"
            assert await fetch_document(client, "missing") is None
            for identity in ["wrong-id", "invalid-utf8", "big", "big-no-length"]:
                with pytest.raises(RemoteProtocolError):
                    await fetch_document(client, identity)
            with pytest.raises(RemoteUnavailable):
                await fetch_document(client, "fail")
            before = len(received)
            with pytest.raises(RemoteRejected):
                await fetch_document(client, "redirect")
            assert len(received) == before + 1
            assert all(auth == "Bearer SYNTHETIC_TEST_ONLY" for _, auth in received)
            state["peak"] = 0
            identities = [f"batch{i}" for i in range(8)]
            documents = await fetch_many(client, identities, concurrency=2)
            assert [doc.id for doc in documents if doc is not None] == identities
            assert state["peak"] <= 2
        assert client.is_closed
    asyncio.run(scenario())


def test_real_socket_read_timeout(local_service):
    base_url, _, _ = local_service
    async def scenario():
        async with httpx.AsyncClient(base_url=base_url, trust_env=False,
                                     timeout=httpx.Timeout(0.02)) as client:
            with pytest.raises(RemoteUnavailable) as failure:
                await fetch_document(client, "slow", total_seconds=0.5)
            assert isinstance(failure.value.__context__, httpx.ReadTimeout)
    asyncio.run(scenario())
```

The read-timeout test gives the overall scope more time than the delayed fixture requires, so the observed HTTPX ReadTimeout is distinct from the overall timeout tested with MockTransport. The exception context is inspected only in this synthetic test, not emitted to logs. Both clients and the fixture server close even if an assertion fails. TLS, proxies and external provider behavior remain separate integration layers.

**Acceptance:** execute normal/404/protocol/status/transport failures with real HTTPX and a controlled server. Verify the Authorization fixture header reaches only the owned origin and redirects are not followed. Assert the body limit both with a declared length and without relying on it, stream closure on timeout/caller cancellation and no dangling tasks/threads. Show actual per-phase timeout separately from the overall deadline. Across twenty inputs, at most the configured concurrency is active and output follows input order; one hard failure cancels/drains siblings. Reject invalid IDs/duplicate or oversized batches before sending a request. Do not let cancellation become None or a successful result. Use fixed synthetic credentials; no paid/provider request is needed. Learner practice and deployment/TLS evidence remain required.

References checked2026-10-21: [Python3.13 coroutines/TaskGroup/cancellation/timeouts](https://docs.python.org/3.13/library/asyncio-task.html), [HTTPX async client/stream ownership](https://www.python-httpx.org/async/), [phase timeouts](https://www.python-httpx.org/advanced/timeouts/), [pool limits](https://www.python-httpx.org/advanced/resource-limits/), [transports/testing](https://www.python-httpx.org/advanced/transports/), [HTTPX exceptions](https://www.python-httpx.org/exceptions/).
