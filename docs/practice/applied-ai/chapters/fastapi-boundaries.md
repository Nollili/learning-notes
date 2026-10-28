# Pydantic and FastAPI Boundaries — practice

**Learner status: still required.** These requirements were separated from the textbook. Use the [integrated sequence](../index.md) and shared evidence record; running reference checks is not independent completion.

[Textbook](../../../python-for-ai/fastapi-boundaries.md)

## Practice and acceptance

**Acceptance:** run strict checking and all tests; strict DTO input, automatic response projection and OpenAPI credential/body schema must match the implementation. Test missing/wrong/duplicate key, malformed JSON, duplicate keys, nonfinite/invalid UTF-8/surrogates, unknown fields, wrong types, empty body/tags and size bounds. Missing authentication must fail before body parsing. Test a streamed body exceeding the cap without Content-Length and an aborted body; verify it never reaches the repository. Use synthetic sentinels in unknown field names/values and exception messages and prove public output does not echo them.

Inject a startup-failing repository context and verify readiness never becomes true; inject a request failure and prove its context closes on app shutdown. Keep duplicate409, input422, operational503 and unexpected500 distinct. Create two app instances and demonstrate isolated memory state, explaining why this requires a real shared database before scaling workers. Deploying the service, connecting a real database/provider, TLS, multi-user authorization and learner practice remain required; these tests establish only the documented teaching app behavior.
