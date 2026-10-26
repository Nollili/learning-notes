# Pydantic and FastAPI Boundaries

Build on the typed Python service with FastAPI0.156.8, Pydantic2.14.1, Starlette1.9.0 and HTTPX0.28.1 on Python3.13.11. This is a private, single-purpose server-to-server teaching API with a bounded in-memory repository. It is not a multi-tenant production store, a browser authentication scheme or a model provider endpoint.

```bash
uv add 'fastapi==0.156.8' 'pydantic==2.14.1'
uv run --locked python -m mypy --strict basics.py study_ai
uv run --locked python -m pytest
```

## Runtime schemas and application types

Pydantic validates runtime input and can generate JSON Schema; a dataclass/NewType annotation alone cannot. Its default parsing can coerce values, so choose strictness intentionally. strict=True does not make Python-input and JSON-input validation identical for every type; JSON lacks some native Python types. Test the actual wire representation. extra='forbid' prevents unknown fields being silently assigned; it does not authorize a field or prove its contents are true.

Use an input DTO for the transport, the existing immutable Document for the use case, and a small response DTO. Keep token/tenant/privilege/persistence fields out of public input and responses. Field validators should be deterministic transformations/checks, not network/database calls. Database constraints and use-case policy still enforce business invariants.

```python
# study_ai/api_models.py
from pydantic import BaseModel, ConfigDict, Field, field_validator

from basics import clean_tags


class DocumentInput(BaseModel):
    model_config = ConfigDict(strict=True, extra="forbid")
    id: str = Field(pattern=r"^[A-Za-z0-9_-]{1,64}$")
    body: str = Field(min_length=1, max_length=20000)
    tags: list[str] = Field(default_factory=list, max_length=10)

    @field_validator("body")
    @classmethod
    def valid_body(cls, value: str) -> str:
        result = value.strip()
        if not result:
            raise ValueError("Body is required")
        result.encode("utf-8", errors="strict")
        return result

    @field_validator("tags")
    @classmethod
    def valid_tags(cls, values: list[str]) -> list[str]:
        result = list(clean_tags(values))
        for tag in result:
            tag.encode("utf-8", errors="strict")
        return result


class DocumentOutput(BaseModel):
    model_config = ConfigDict(strict=True, extra="forbid")
    id: str
    tags: list[str]
```

The API bounds raw body character length before normalization, so it can be narrower than the legacy helper's post-strip limit. That is a deliberate wire contract. tags defaults to a fresh list; the final domain record owns a tuple. A Pydantic model containing a list is not deeply immutable. model_dump produces a selected Python representation; model_dump_json serializes JSON. Do not use model_construct to bypass validation at an untrusted boundary, and do not interpret a valid schema as factual or prompt-injection safety.

## Byte, authentication and strict-JSON boundary

Pydantic fields are evaluated after parsing; a field limit alone does not cap the request bytes parsed beforehand. Starlette1.9 supplies RequestBodyLimitMiddleware for that byte boundary. The exact baseline is important: do not import it blindly from an older installed Starlette version.

A pure ASGI key guard rejects unauthenticated requests before body parsing. This private API uses a separate inbound X-Study-Key credential, not the outbound SERVICE_TOKEN or a model key. Compare bounded bytes in constant time, reject duplicate credential headers and keep per-request state local. Supply a random key through the trusted startup configuration; never put it into a browser bundle.

The custom request/route below reuses [strict decode_json](./bounded-document-streams.md), so duplicate keys/nonfinite values/invalid UTF-8 cannot be normalized away before validation. Automatic FastAPI request models/OpenAPI remain available through the route handler.

```python
# study_ai/api_transport.py
from __future__ import annotations

import hmac
import re
from collections.abc import Callable, Coroutine
from typing import Any

from fastapi import HTTPException, Request
from fastapi.routing import APIRoute
from starlette.responses import JSONResponse, Response
from starlette.types import ASGIApp, Receive, Scope, Send

from .document_streams import decode_json


class ServiceKeyMiddleware:
    def __init__(self, app: ASGIApp, *, key: str) -> None:
        if re.fullmatch(r"[A-Za-z0-9_-]{32,256}", key) is None:
            raise ValueError("Invalid inbound API key configuration")
        self.app = app
        self.key = key.encode("ascii")

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http" or scope.get("path") == "/health":
            await self.app(scope, receive, send)
            return
        supplied = [value for name, value in scope.get("headers", []) if name.lower() == b"x-study-key"]
        valid = len(supplied) == 1 and 32 <= len(supplied[0]) <= 256
        if not valid or not hmac.compare_digest(supplied[0], self.key):
            response = JSONResponse({"error": "authentication_required"}, status_code=401,
                                    headers={"WWW-Authenticate": "APIKey"})
            await response(scope, receive, send)
            return
        if scope.get("method") == "POST" and scope.get("path") == "/documents":
            media = [value.strip().lower() for name, value in scope.get("headers", [])
                     if name.lower() == b"content-type"]
            encoding = [value.strip().lower() for name, value in scope.get("headers", [])
                        if name.lower() == b"content-encoding"]
            if (len(media) != 1 or media[0] not in {b"application/json", b"application/json; charset=utf-8"}
                    or len(encoding) > 1 or (encoding and encoding[0] != b"identity")):
                await JSONResponse({"error": "unsupported_media"}, status_code=415)(scope, receive, send)
                return
        await self.app(scope, receive, send)


class StrictJSONRequest(Request):
    async def json(self) -> object:
        try:
            return decode_json(await self.body())
        except (ValueError, RecursionError):
            raise HTTPException(400, "Invalid JSON") from None


class StrictJSONRoute(APIRoute):
    def get_route_handler(self) -> Callable[[Request], Coroutine[Any, Any, Response]]:
        original = super().get_route_handler()

        async def handler(request: Request) -> Response:
            return await original(StrictJSONRequest(request.scope, request.receive))

        return handler
```

The Any parameters match FastAPI's framework hook signature; untrusted data still enters decode_json as bytes and leaves it as object until the model validates it. This is an explicit advanced boundary rather than manipulating a private request._json cache. Retest the request/route extension when upgrading the framework.

The middleware does not implement user roles, tenant membership, rate limits or key rotation. This key grants one service identity the documented create-document capability. A multi-user/tenant API needs verified principals, scoped repository predicates and durable permissions; see the [Node authorization lesson](../node-js/module-09-authentication-authorization.md). TLS, proxy trust, admission limits and key rotation belong in the deployment contract. The middleware's constant-time comparison is not a substitute for those controls.

## Per-app resources, dependencies and safe error translation

```python
# study_ai/api.py
# Eager annotations here keep factory-local Annotated dependency objects resolvable.

from collections.abc import AsyncIterator, Callable
from contextlib import AbstractAsyncContextManager, asynccontextmanager
from typing import Annotated, cast

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.security import APIKeyHeader
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.body_limit import RequestBodyLimitMiddleware
from starlette.responses import JSONResponse

from .api_models import DocumentInput, DocumentOutput
from .api_transport import ServiceKeyMiddleware, StrictJSONRoute
from .domain import DocumentRepository, DuplicateDocument, InvalidDocument, StoreUnavailable
from .service import InMemoryDocuments, prepare_and_save


@asynccontextmanager
async def memory_repository() -> AsyncIterator[DocumentRepository]:
    yield InMemoryDocuments(capacity=100)


def create_app(*, inbound_key: str, repository_scope: Callable[
    [], AbstractAsyncContextManager[DocumentRepository]
] = memory_repository) -> FastAPI:
    # Validate immediately, before ASGI middleware is first constructed on a request.
    if not 32 <= len(inbound_key) <= 256 or not all(
        character.isascii() and (character.isalnum() or character in "_-") for character in inbound_key
    ):
        raise ValueError("Invalid inbound API key configuration")

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        async with repository_scope() as repository:
            app.state.repository = repository
            app.state.ready = True
            try:
                yield
            finally:
                app.state.ready = False
                app.state.repository = None

    app = FastAPI(lifespan=lifespan, debug=False, docs_url=None, redoc_url=None, openapi_url=None)
    app.state.ready = False
    app.state.repository = None
    app.router.route_class = StrictJSONRoute
    app.add_middleware(RequestBodyLimitMiddleware, max_body_size=65536)
    app.add_middleware(ServiceKeyMiddleware, key=inbound_key)  # Last added runs outermost of these two.
    key_header = APIKeyHeader(name="X-Study-Key", auto_error=False)

    async def require_key(key: Annotated[str | None, Depends(key_header)]) -> None:
        # Guard already verified bytes before parsing; this dependency declares OpenAPI security.
        if key is None:
            raise HTTPException(401, "Authentication required", headers={"WWW-Authenticate": "APIKey"})

    def repository_for(request: Request) -> DocumentRepository:
        repository: object = request.app.state.repository
        if not request.app.state.ready or repository is None:
            raise HTTPException(503, "Not ready")
        # Typed lifespan factory owns this state; cast is not validation of request input.
        return cast(DocumentRepository, repository)

    @app.exception_handler(RequestValidationError)
    async def invalid_request(request: Request, error: RequestValidationError) -> JSONResponse:
        fields = sorted({part for item in error.errors() for part in item["loc"]
                         if isinstance(part, str) and part in {"id", "body", "tags"}})
        return JSONResponse({"error": "invalid_request", "fields": fields}, status_code=422)

    @app.exception_handler(StarletteHTTPException)
    async def http_failure(request: Request, error: StarletteHTTPException) -> JSONResponse:
        return JSONResponse({"error": "request_rejected"}, status_code=error.status_code, headers=error.headers)

    @app.exception_handler(DuplicateDocument)
    async def duplicate(request: Request, error: DuplicateDocument) -> JSONResponse:
        return JSONResponse({"error": "document_exists"}, status_code=409)

    @app.exception_handler(InvalidDocument)
    async def invalid_document(request: Request, error: InvalidDocument) -> JSONResponse:
        return JSONResponse({"error": "invalid_document"}, status_code=422)

    @app.exception_handler(StoreUnavailable)
    async def unavailable(request: Request, error: StoreUnavailable) -> JSONResponse:
        return JSONResponse({"error": "storage_unavailable"}, status_code=503)

    @app.exception_handler(Exception)
    async def unexpected(request: Request, error: Exception) -> JSONResponse:
        return JSONResponse({"error": "internal_error"}, status_code=500)

    @app.get("/health")
    async def health() -> JSONResponse:
        ready = bool(app.state.ready)
        return JSONResponse({"ready": ready}, status_code=200 if ready else 503)

    @app.post("/documents", response_model=DocumentOutput, status_code=201,
              dependencies=[Depends(require_key)])
    async def create_document(payload: DocumentInput, repository: Annotated[
        DocumentRepository, Depends(repository_for)
    ]) -> DocumentOutput:
        document = prepare_and_save(payload.model_dump(), repository)
        return DocumentOutput(id=document.id, tags=list(document.tags))

    return app
```

The factory intentionally evaluates annotations when defining its local dependency functions. Postponed annotation strings that refer to factory-local dependency objects can be unresolvable to framework introspection; keep this pattern covered by actual route tests. The app factory owns state per app; ordinary imports do not start a server or create a global repository. Lifespan acquisition must succeed before readiness becomes true. Shutdown marks it false and releases the injected context. The memory adapter itself owns no external handle; a real adapter's async context must close its pool/client, including partial-start failure paths. Do not claim that setting app.state.repository=None closes a database.

The service call is a bounded synchronous memory operation on one event loop. A blocking database/model/PDF call inside this async route would block that loop; use an actual async adapter/use-case interface or an explicitly bounded offload. Multiple workers each get a different memory store, so this demo does not provide durable cross-worker uniqueness. API responses explicitly omit body/private fields; response_model is another validation/serialization boundary, not authorization.

RequestValidationError's default detail can include input. The handler above returns only a fixed code and allowlisted field names; even an unknown field whose name contains a secret is omitted. It does not serialize errors(), error.body, arbitrary validator messages or exception causes. Unexpected output validation/programming failures are internal500, never a client's422. Use the [safe log projection](./configuration-and-logging.md) for fixed categories; raw exceptions/provider bodies still need separate reviewed diagnostics.

The key middleware authenticates before malformed-body parsing; byte limits still run for authenticated bodies before full JSON parsing. FastAPI's strict content-type behavior and this custom request path are version-sensitive; verify JSON/media/size outcomes on the pinned baseline. A byte cap does not bound a slow client's entire connection lifetime; use server/proxy read/admission deadlines. This demo accepts identity-encoded JSON only under the server's request-body contract; do not add transparent decompression without decoded-size/work limits.

OpenAPI is available programmatically through app.openapi for contract tests while public docs/schema URLs are disabled. The APIKey dependency advertises its credential requirement; middleware alone would not automatically create that schema declaration. An auto-generated schema describes accepted types/routes, not complete security or business guarantees.

## ASGI application tests with lifespan

```python
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
```

ASGITransport calls the real app/routing/middleware/schema stack in process; it does not open a socket and does not automatically start this lifespan. The explicit lifespan context is part of the test, not optional boilerplate. raise_app_exceptions=False lets a test inspect a500 response when the ASGI server would also observe/rethrow an unexpected failure. Do not turn it off merely to hide a failing test. Native socket tests from the HTTP lesson and deployment smoke tests cover different layers.

### Adversarial boundary checks

Malformed UTF-8, duplicate keys and nonfinite numbers fail JSON decoding with400. An escaped unpaired surrogate is syntactically accepted by Python’s JSON decoder, then rejected by the DTO’s UTF-8 validation with422. Both responses omit the submitted text. The following tests also exercise a chunked request without Content-Length; no rejected input may call the repository.

```python
# lab_tests/test_api_edges.py
import asyncio
from contextlib import asynccontextmanager
import httpx
import pytest
from study_ai.api import create_app

KEY = 'k' * 40

def test_boundary_edges():
    calls = []
    class BrokenRepository:
        def save(self, document):
            calls.append(document)
            raise RuntimeError('PRIVATE_FAILURE')
    @asynccontextmanager
    async def scope():
        try:
            yield BrokenRepository()
        finally:
            calls.append('closed')
    async def run():
        app = create_app(inbound_key=KEY, repository_scope=scope)
        async with app.router.lifespan_context(app):
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app, raise_app_exceptions=False), base_url='http://fixture') as client:
                for headers in [{}, {'X-Study-Key': 'x' * 40}, [('X-Study-Key', KEY), ('X-Study-Key', KEY)]]:
                    response = await client.post('/documents', headers=headers, content=b'PRIVATE_INVALID_JSON')
                    assert response.status_code == 401
                client.headers['X-Study-Key'] = KEY
                for headers in [{'content-type': 'text/plain'}, {'content-type': 'application/json', 'content-encoding': 'gzip'}]:
                    assert (await client.post('/documents', headers=headers, content=b'{}')).status_code == 415
                for raw in [b'{"id":"x","body":NaN}', b'\xff', b'{"id":"x","body":"\\ud800"}', b'{"id":"x","id":"y","body":"x"}']:
                    response = await client.post('/documents', headers={'content-type': 'application/json'}, content=raw)
                    assert response.status_code == (422 if b'\\ud800' in raw else 400)
                    assert 'PRIVATE' not in response.text
                response = await client.post('/documents', json={'id':'x','body':'PRIVATE_BODY','PRIVATE_FIELD':'PRIVATE_VALUE'})
                assert response.status_code == 422 and 'PRIVATE' not in response.text
                async def chunks():
                    for _ in range(17):
                        yield b'x' * 4096
                response = await client.post('/documents', headers={'content-type': 'application/json'}, content=chunks())
                assert response.status_code == 413 and calls == []
                response = await client.post('/documents', json={'id':'x','body':'text'})
                assert response.status_code == 500 and response.json() == {'error':'internal_error'}
                assert len(calls) == 1
        assert calls[-1] == 'closed' and app.state.ready is False
    asyncio.run(run())

def test_startup_and_app_isolation():
    @asynccontextmanager
    async def failed_scope():
        raise RuntimeError('startup failure')
        yield
    async def run():
        failed = create_app(inbound_key=KEY, repository_scope=failed_scope)
        with pytest.raises(RuntimeError, match='startup failure'):
            async with failed.router.lifespan_context(failed):
                pytest.fail('must not start')
        assert failed.state.ready is False and failed.state.repository is None
        first, second = create_app(inbound_key=KEY), create_app(inbound_key=KEY)
        async with first.router.lifespan_context(first), second.router.lifespan_context(second):
            for app in [first, second]:
                async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url='http://fixture', headers={'X-Study-Key': KEY}) as client:
                    assert (await client.post('/documents', json={'id':'same','body':'text'})).status_code == 201
    asyncio.run(run())
```

## Practice and acceptance

**Acceptance:** run strict checking and all tests; strict DTO input, automatic response projection and OpenAPI credential/body schema must match the implementation. Test missing/wrong/duplicate key, malformed JSON, duplicate keys, nonfinite/invalid UTF-8/surrogates, unknown fields, wrong types, empty body/tags and size bounds. Missing authentication must fail before body parsing. Test a streamed body exceeding the cap without Content-Length and an aborted body; verify it never reaches the repository. Use synthetic sentinels in unknown field names/values and exception messages and prove public output does not echo them.

Inject a startup-failing repository context and verify readiness never becomes true; inject a request failure and prove its context closes on app shutdown. Keep duplicate409, input422, operational503 and unexpected500 distinct. Create two app instances and demonstrate isolated memory state, explaining why this requires a real shared database before scaling workers. Deploying the service, connecting a real database/provider, TLS, multi-user authorization and learner practice remain required; these tests establish only the documented teaching app behavior.

References checked2026-10-21: [FastAPI request models](https://fastapi.tiangolo.com/tutorial/body/), [safe exception handlers](https://fastapi.tiangolo.com/tutorial/handling-errors/), [lifespan](https://fastapi.tiangolo.com/advanced/events/), [custom Request/APIRoute](https://fastapi.tiangolo.com/how-to/custom-request-and-route/), [Pydantic strict mode](https://docs.pydantic.dev/latest/concepts/strict_mode/), [Starlette middleware/body limits](https://starlette.dev/middleware/), [ASGI tests and lifespan](https://fastapi.tiangolo.com/advanced/async-tests/).
