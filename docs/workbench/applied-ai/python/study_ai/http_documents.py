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
