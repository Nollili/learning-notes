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
