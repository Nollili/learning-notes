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
