# Python Configuration, Safe Logs and pytest Fixtures

Continue the [typed learner project](./typed-modules-and-errors.md) on Python3.13.11, pytest9.1.1 and mypy2.4.0. This batch adds an explicit configuration boundary and one owned JSON log sink. It does not contact a model provider or require real credentials.

## Validate configuration at startup

Environment values are strings or absent. `bool("false")` is True, and silently accepting an empty secret/default service URL can move a failure into a later request. Read a supplied mapping, parse exact formats and fail before creating clients. Do not read settings or configure logging as a side effect of importing a library.

<<< ../workbench/applied-ai/python/study_ai/settings.py


service.example.test is a reserved demonstration destination, not a real provider. The fixed allowlist prevents configuration in this fixture from silently redirecting credentials to another host. A real integration replaces it with its reviewed endpoint policy. Tests do not send a request. The selected token contract is32–256 ASCII URL-safe characters. A format/length check cannot prove randomness; generate at least32 random bytes and encode them for deployment, then rotate under the actual service contract. Whitespace/control characters are rejected before any header could be constructed.

repr=False omits the token from this dataclass's ordinary repr; it does not encrypt it, prevent attribute access or make dataclasses.asdict safe to log. Never log Settings wholesale. Frozen fields do not secure memory. Supply configuration/secrets through the deployment boundary; keep only fake placeholders in examples and never commit an actual .env, package-index credential or provider token. .env loaders are a local-development alternative with explicit precedence; they are not needed for this fixture.

Validate known keys while allowing unrelated operating-system environment entries. Log only field names when startup validation fails. Keep the Settings object injected into adapters, not repeatedly read from os.environ inside business functions. Updating runtime environment values does not automatically update already-created Settings/clients; define restart/reconfiguration ownership.

## Own one structured log handler

A level controls importance; an event name describes what happened. Use DEBUG for deliberate diagnostics, INFO for lifecycle/results, WARNING for handled degradation and ERROR for failed operations needing attention. Avoid high-volume per-token/per-row logs and user IDs/body text as metric labels. print remains useful for explicit CLI output; library diagnostics use logging.

The following formatter emits a fixed projection. It never calls getMessage or formats arbitrary exception text, so an accidental raw message/args/extra field does not become persisted content in this sink. That is defense in depth; callers should still avoid passing secrets in the first place.

<<< ../workbench/applied-ai/python/study_ai/safe_logging.py


Configure once in the composition root and call close during owned shutdown. The caller owns the stream and closes it after the handler is detached; StreamHandler.close does not close that supplied stream. The close callback is idempotent. This fixture rejects another owner rather than silently stacking handlers or replacing root configuration. Libraries can use named child loggers under study_ai; unrelated third-party/root logging needs its own reviewed routing/redaction policy.

Only server-generated job identifiers belong in this context; a UUID-shaped string is not proof of trusted provenance. The formatter intentionally keeps only a category for unknown errors and a has_exception flag. It does not retain arbitrary stack/cause details. If operations require deeper evidence, add reviewed codes/source positions or a separately protected diagnostic sink with retention/access limits. logger.exception/traceback formatting can expose request data and secrets; do not claim a formatter makes every other handler safe.

Operational logs, audit evidence and user-facing responses have different contracts. Do not let a log error turn a failed operation into reported success. Measure sink/backpressure behavior in deployment; this small synchronous standard-library handler is not an asynchronous durable logging pipeline.

## Fixtures express ownership and isolate state

pytest fixtures supply dependencies by name. Function scope is the default and usually isolates mutable state best. A yield fixture performs setup before yield and teardown afterward; register cleanup immediately after acquiring each resource. If setup fails before yield, code after yield is not reached, so already-acquired resources still need try/finally or an appropriate finalizer. Avoid hidden autouse/session state for convenience.

- tmp_path gives a test-owned temporary directory; it is not permission to read/write arbitrary project files.
- monkeypatch changes environment/attributes and restores them after the test. Patch where the code looks up a dependency; broad global mocks can hide the integration you intended to verify.
- caplog captures LogRecords and level behavior; asserting raw records alone does not prove the production sink's serialized privacy contract.
- Parameterization makes invalid categories explicit. Use pytest.raises with the expected exception type and a safe match, not a broad except swallowing failures.

<<< ../workbench/applied-ai/python/lab_tests/test_settings_and_logging.py


The fixture creates a fresh mapping, so parameter cases do not contaminate each other. monkeypatch restores real process state; no real token is needed. The JSON test inspects actual output bytes, while caplog checks event/level behavior separately. Keep private synthetic sentinels distinguishable from real credentials. Pytest assertion output and snapshots can themselves expose input values, so never run these tests with production secrets or copied customer payloads.

## Practice and acceptance

[Separate exercises and acceptance criteria](../practice/applied-ai/chapters/configuration-and-logging.md).

References checked2026-10-21: [Python3.13 logging HOWTO](https://docs.python.org/3.13/howto/logging.html), [handlers/propagation/records](https://docs.python.org/3.13/library/logging.html), [os.environ](https://docs.python.org/3.13/library/os.html#os.environ), [pytest fixtures/teardown](https://docs.pytest.org/en/stable/how-to/fixtures.html), [monkeypatch](https://docs.pytest.org/en/stable/how-to/monkeypatch.html), [caplog](https://docs.pytest.org/en/stable/how-to/logging.html), [temporary paths](https://docs.pytest.org/en/stable/how-to/tmp_path.html).
