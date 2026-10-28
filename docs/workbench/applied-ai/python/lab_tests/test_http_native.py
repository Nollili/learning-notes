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
