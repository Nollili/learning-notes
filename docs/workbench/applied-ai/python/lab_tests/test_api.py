# lab_tests/test_api.py
from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager

import httpx
from pydantic import ValidationError
import pytest

from study_ai.api import create_app
from study_ai.api_models import DocumentInput
from study_ai.domain import StoreUnavailable

_KEY = "synthetic-inbound-key-" * 3


def test_strict_model():
    with pytest.raises(ValidationError):
        DocumentInput.model_validate({"id": 12, "body": "text"})
    with pytest.raises(ValidationError):
        DocumentInput.model_validate({"id": "d1", "body": "text", "role": "admin"})


def test_api_contract_and_safe_errors():
    async def scenario():
        app = create_app(inbound_key=_KEY)
        transport = httpx.ASGITransport(app=app, raise_app_exceptions=False)
        async with app.router.lifespan_context(app):
            async with httpx.AsyncClient(transport=transport, base_url="http://asgi-fixture") as client:
                denied = await client.post("/documents", content=b"PRIVATE_BAD_JSON",
                                           headers={"content-type": "application/json"})
                assert denied.status_code == 401
                client.headers["X-Study-Key"] = _KEY
                assert (await client.get("/health")).json() == {"ready": True}
                created = await client.post("/documents", json={"id": "d1", "body": " private ", "tags": [" AI "]})
                assert created.status_code == 201
                assert created.json() == {"id": "d1", "tags": ["ai"]}
                assert (await client.post("/documents", json={"id": "d1", "body": "text"})).status_code == 409
                invalid = await client.post("/documents", json={"id": 12, "body": "PRIVATE_SENTINEL"})
                assert invalid.status_code == 422 and "PRIVATE_SENTINEL" not in invalid.text
                duplicate_keys = await client.post("/documents", content=b'{"id":"a","id":"b","body":"x"}',
                                                   headers={"content-type": "application/json"})
                assert duplicate_keys.status_code == 400
                oversized = await client.post("/documents", content=b"x" * 65537,
                                              headers={"content-type": "application/json"})
                assert oversized.status_code == 413
        assert app.state.ready is False and app.state.repository is None
        schema = app.openapi()
        assert schema["paths"]["/documents"]["post"]["security"]
    asyncio.run(scenario())


def test_operational_failure_and_context_cleanup():
    closed = []
    class UnavailableRepository:
        def save(self, document):
            raise StoreUnavailable("PRIVATE_STORAGE_SENTINEL")
    @asynccontextmanager
    async def repository_scope():
        try:
            yield UnavailableRepository()
        finally:
            closed.append(True)
    async def scenario():
        app = create_app(inbound_key=_KEY, repository_scope=repository_scope)
        async with app.router.lifespan_context(app):
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://asgi-fixture",
                                         headers={"X-Study-Key": _KEY}) as client:
                failed = await client.post("/documents", json={"id": "d1", "body": "text"})
                assert failed.status_code == 503 and "PRIVATE_STORAGE_SENTINEL" not in failed.text
        assert closed == [True]
    asyncio.run(scenario())
