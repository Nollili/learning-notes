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

<<< ../workbench/applied-ai/python/study_ai/api_models.py


The API bounds raw body character length before normalization, so it can be narrower than the legacy helper's post-strip limit. That is a deliberate wire contract. tags defaults to a fresh list; the final domain record owns a tuple. A Pydantic model containing a list is not deeply immutable. model_dump produces a selected Python representation; model_dump_json serializes JSON. Do not use model_construct to bypass validation at an untrusted boundary, and do not interpret a valid schema as factual or prompt-injection safety.

## Byte, authentication and strict-JSON boundary

Pydantic fields are evaluated after parsing; a field limit alone does not cap the request bytes parsed beforehand. Starlette1.9 supplies RequestBodyLimitMiddleware for that byte boundary. The exact baseline is important: do not import it blindly from an older installed Starlette version.

A pure ASGI key guard rejects unauthenticated requests before body parsing. This private API uses a separate inbound X-Study-Key credential, not the outbound SERVICE_TOKEN or a model key. Compare bounded bytes in constant time, reject duplicate credential headers and keep per-request state local. Supply a random key through the trusted startup configuration; never put it into a browser bundle.

The custom request/route below reuses [strict decode json](./bounded-document-streams.md), so duplicate keys/nonfinite values/invalid UTF-8 cannot be normalized away before validation. Automatic FastAPI request models/OpenAPI remain available through the route handler.

<<< ../workbench/applied-ai/python/study_ai/api_transport.py


The Any parameters match FastAPI's framework hook signature; untrusted data still enters decode_json as bytes and leaves it as object until the model validates it. This is an explicit advanced boundary rather than manipulating a private request._json cache. Retest the request/route extension when upgrading the framework.

The middleware does not implement user roles, tenant membership, rate limits or key rotation. This key grants one service identity the documented create-document capability. A multi-user/tenant API needs verified principals, scoped repository predicates and durable permissions; see the [Node authorization lesson](../node-js/module-09-authentication-authorization.md). TLS, proxy trust, admission limits and key rotation belong in the deployment contract. The middleware's constant-time comparison is not a substitute for those controls.

## Per-app resources, dependencies and safe error translation

<<< ../workbench/applied-ai/python/study_ai/api.py


The factory intentionally evaluates annotations when defining its local dependency functions. Postponed annotation strings that refer to factory-local dependency objects can be unresolvable to framework introspection; keep this pattern covered by actual route tests. The app factory owns state per app; ordinary imports do not start a server or create a global repository. Lifespan acquisition must succeed before readiness becomes true. Shutdown marks it false and releases the injected context. The memory adapter itself owns no external handle; a real adapter's async context must close its pool/client, including partial-start failure paths. Do not claim that setting app.state.repository=None closes a database.

The service call is a bounded synchronous memory operation on one event loop. A blocking database/model/PDF call inside this async route would block that loop; use an actual async adapter/use-case interface or an explicitly bounded offload. Multiple workers each get a different memory store, so this demo does not provide durable cross-worker uniqueness. API responses explicitly omit body/private fields; response_model is another validation/serialization boundary, not authorization.

RequestValidationError's default detail can include input. The handler above returns only a fixed code and allowlisted field names; even an unknown field whose name contains a secret is omitted. It does not serialize errors(), error.body, arbitrary validator messages or exception causes. Unexpected output validation/programming failures are internal500, never a client's422. Use the [safe log projection](./configuration-and-logging.md) for fixed categories; raw exceptions/provider bodies still need separate reviewed diagnostics.

The key middleware authenticates before malformed-body parsing; byte limits still run for authenticated bodies before full JSON parsing. FastAPI's strict content-type behavior and this custom request path are version-sensitive; verify JSON/media/size outcomes on the pinned baseline. A byte cap does not bound a slow client's entire connection lifetime; use server/proxy read/admission deadlines. This demo accepts identity-encoded JSON only under the server's request-body contract; do not add transparent decompression without decoded-size/work limits.

OpenAPI is available programmatically through app.openapi for contract tests while public docs/schema URLs are disabled. The APIKey dependency advertises its credential requirement; middleware alone would not automatically create that schema declaration. An auto-generated schema describes accepted types/routes, not complete security or business guarantees.

## ASGI application tests with lifespan

<<< ../workbench/applied-ai/python/lab_tests/test_api.py


ASGITransport calls the real app/routing/middleware/schema stack in process; it does not open a socket and does not automatically start this lifespan. The explicit lifespan context is part of the test, not optional boilerplate. raise_app_exceptions=False lets a test inspect a500 response when the ASGI server would also observe/rethrow an unexpected failure. Do not turn it off merely to hide a failing test. Native socket tests from the HTTP lesson and deployment smoke tests cover different layers.

### Adversarial boundary checks

Malformed UTF-8, duplicate keys and nonfinite numbers fail JSON decoding with400. An escaped unpaired surrogate is syntactically accepted by Python’s JSON decoder, then rejected by the DTO’s UTF-8 validation with422. Both responses omit the submitted text. The following tests also exercise a chunked request without Content-Length; no rejected input may call the repository.

<<< ../workbench/applied-ai/python/lab_tests/test_api_edges.py


## Practice and acceptance

[Separate exercises and acceptance criteria](../practice/applied-ai/chapters/fastapi-boundaries.md).

References checked2026-10-21: [FastAPI request models](https://fastapi.tiangolo.com/tutorial/body/), [safe exception handlers](https://fastapi.tiangolo.com/tutorial/handling-errors/), [lifespan](https://fastapi.tiangolo.com/advanced/events/), [custom Request/APIRoute](https://fastapi.tiangolo.com/how-to/custom-request-and-route/), [Pydantic strict mode](https://docs.pydantic.dev/latest/concepts/strict_mode/), [Starlette middleware/body limits](https://starlette.dev/middleware/), [ASGI tests and lifespan](https://fastapi.tiangolo.com/advanced/async-tests/).
