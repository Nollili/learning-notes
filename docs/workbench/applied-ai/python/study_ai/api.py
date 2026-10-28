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
