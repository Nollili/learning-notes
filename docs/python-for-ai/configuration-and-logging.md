# Python Configuration, Safe Logs and pytest Fixtures

Continue the [typed learner project](./typed-modules-and-errors.md) on Python3.13.11, pytest9.1.1 and mypy2.4.0. This batch adds an explicit configuration boundary and one owned JSON log sink. It does not contact a model provider or require real credentials.

## Validate configuration at startup

Environment values are strings or absent. `bool("false")` is True, and silently accepting an empty secret/default service URL can move a failure into a later request. Read a supplied mapping, parse exact formats and fail before creating clients. Do not read settings or configure logging as a side effect of importing a library.

```python
# study_ai/settings.py
from __future__ import annotations

import os
import re
from collections.abc import Mapping
from dataclasses import dataclass, field


class ConfigurationError(ValueError):
    pass


@dataclass(frozen=True, slots=True)
class Settings:
    service_url: str
    service_token: str = field(repr=False)
    timeout_ms: int = 1000
    cache_enabled: bool = False
    log_level: str = "INFO"


def read_settings(env: Mapping[str, str]) -> Settings:
    token = env.get("SERVICE_TOKEN", "")
    if re.fullmatch(r"[A-Za-z0-9_-]{32,256}", token) is None:
        raise ConfigurationError("Invalid SERVICE_TOKEN")
    allowed_urls = {
        "https://service.example.test/v1", "https://service.example.test/v1/",
        "https://service.example.test:443/v1", "https://service.example.test:443/v1/",
    }
    if env.get("SERVICE_URL", "") not in allowed_urls:
        raise ConfigurationError("Invalid SERVICE_URL")
    raw_timeout = env.get("TIMEOUT_MS", "1000")
    if re.fullmatch(r"[0-9]{1,5}", raw_timeout) is None:
        raise ConfigurationError("Invalid TIMEOUT_MS")
    timeout_ms = int(raw_timeout)
    if not 100 <= timeout_ms <= 10000:
        raise ConfigurationError("Invalid TIMEOUT_MS")
    cache_text = env.get("CACHE_ENABLED", "false")
    if cache_text not in {"true", "false"}:
        raise ConfigurationError("Invalid CACHE_ENABLED")
    log_level = env.get("LOG_LEVEL", "INFO")
    if log_level not in {"DEBUG", "INFO", "WARNING", "ERROR"}:
        raise ConfigurationError("Invalid LOG_LEVEL")
    return Settings("https://service.example.test/v1", token, timeout_ms,
                    cache_text == "true", log_level)


def load_process_settings() -> Settings:
    return read_settings(os.environ)
```

service.example.test is a reserved demonstration destination, not a real provider. The fixed allowlist prevents configuration in this fixture from silently redirecting credentials to another host. A real integration replaces it with its reviewed endpoint policy. Tests do not send a request. The selected token contract is32–256 ASCII URL-safe characters. A format/length check cannot prove randomness; generate at least32 random bytes and encode them for deployment, then rotate under the actual service contract. Whitespace/control characters are rejected before any header could be constructed.

repr=False omits the token from this dataclass's ordinary repr; it does not encrypt it, prevent attribute access or make dataclasses.asdict safe to log. Never log Settings wholesale. Frozen fields do not secure memory. Supply configuration/secrets through the deployment boundary; keep only fake placeholders in examples and never commit an actual .env, package-index credential or provider token. .env loaders are a local-development alternative with explicit precedence; they are not needed for this fixture.

Validate known keys while allowing unrelated operating-system environment entries. Log only field names when startup validation fails. Keep the Settings object injected into adapters, not repeatedly read from os.environ inside business functions. Updating runtime environment values does not automatically update already-created Settings/clients; define restart/reconfiguration ownership.

## Own one structured log handler

A level controls importance; an event name describes what happened. Use DEBUG for deliberate diagnostics, INFO for lifecycle/results, WARNING for handled degradation and ERROR for failed operations needing attention. Avoid high-volume per-token/per-row logs and user IDs/body text as metric labels. print remains useful for explicit CLI output; library diagnostics use logging.

The following formatter emits a fixed projection. It never calls getMessage or formats arbitrary exception text, so an accidental raw message/args/extra field does not become persisted content in this sink. That is defense in depth; callers should still avoid passing secrets in the first place.

```python
# study_ai/safe_logging.py
from __future__ import annotations

import json
import logging
import re
from collections.abc import Callable
from datetime import datetime, timezone
from typing import TextIO

_EVENTS = {"ingest.completed", "input.rejected", "store.unavailable", "service.started"}
_JOB_ID = re.compile(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")
_LEVELS = {"DEBUG": logging.DEBUG, "INFO": logging.INFO,
           "WARNING": logging.WARNING, "ERROR": logging.ERROR}


class SafeJsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        event = record.msg if isinstance(record.msg, str) and record.msg in _EVENTS else "unclassified"
        payload: dict[str, object] = {
            "timestamp": datetime.fromtimestamp(record.created, timezone.utc).isoformat(),
            "level": record.levelname if record.levelname in _LEVELS else "UNKNOWN",
            "event": event,
        }
        job_id = getattr(record, "job_id", None)
        count = getattr(record, "document_count", None)
        if isinstance(job_id, str) and _JOB_ID.fullmatch(job_id):
            payload["job_id"] = job_id
        if type(count) is int and 0 <= count <= 1000:
            payload["document_count"] = count
        if record.exc_info is not None:
            payload["has_exception"] = True
        return json.dumps(payload, ensure_ascii=False, separators=(",", ":"))


def configure_logging(stream: TextIO, *, level: str = "INFO") -> tuple[logging.Logger, Callable[[], None]]:
    if level not in _LEVELS:
        raise ValueError("Invalid log level")
    logger = logging.getLogger("study_ai")
    if logger.handlers:
        raise RuntimeError("Application logger already has an owner")
    previous_level, previous_propagation = logger.level, logger.propagate
    handler = logging.StreamHandler(stream)
    handler.setFormatter(SafeJsonFormatter())
    logger.addHandler(handler)
    logger.setLevel(_LEVELS[level])
    logger.propagate = False  # Prevent a second, unreviewed root sink from receiving raw records.
    closed = False

    def close() -> None:
        nonlocal closed
        if closed:
            return
        closed = True
        logger.removeHandler(handler)
        handler.close()
        logger.setLevel(previous_level)
        logger.propagate = previous_propagation

    return logger, close


def report_prepared(logger: logging.Logger, *, job_id: str, document_count: int) -> None:
    if _JOB_ID.fullmatch(job_id) is None or type(document_count) is not int or not 0 <= document_count <= 1000:
        raise ValueError("Invalid safe log context")
    logger.info("ingest.completed", extra={"job_id": job_id, "document_count": document_count})
```

Configure once in the composition root and call close during owned shutdown. The caller owns the stream and closes it after the handler is detached; StreamHandler.close does not close that supplied stream. The close callback is idempotent. This fixture rejects another owner rather than silently stacking handlers or replacing root configuration. Libraries can use named child loggers under study_ai; unrelated third-party/root logging needs its own reviewed routing/redaction policy.

Only server-generated job identifiers belong in this context; a UUID-shaped string is not proof of trusted provenance. The formatter intentionally keeps only a category for unknown errors and a has_exception flag. It does not retain arbitrary stack/cause details. If operations require deeper evidence, add reviewed codes/source positions or a separately protected diagnostic sink with retention/access limits. logger.exception/traceback formatting can expose request data and secrets; do not claim a formatter makes every other handler safe.

Operational logs, audit evidence and user-facing responses have different contracts. Do not let a log error turn a failed operation into reported success. Measure sink/backpressure behavior in deployment; this small synchronous standard-library handler is not an asynchronous durable logging pipeline.

## Fixtures express ownership and isolate state

pytest fixtures supply dependencies by name. Function scope is the default and usually isolates mutable state best. A yield fixture performs setup before yield and teardown afterward; register cleanup immediately after acquiring each resource. If setup fails before yield, code after yield is not reached, so already-acquired resources still need try/finally or an appropriate finalizer. Avoid hidden autouse/session state for convenience.

- tmp_path gives a test-owned temporary directory; it is not permission to read/write arbitrary project files.
- monkeypatch changes environment/attributes and restores them after the test. Patch where the code looks up a dependency; broad global mocks can hide the integration you intended to verify.
- caplog captures LogRecords and level behavior; asserting raw records alone does not prove the production sink's serialized privacy contract.
- Parameterization makes invalid categories explicit. Use pytest.raises with the expected exception type and a safe match, not a broad except swallowing failures.

```python
# lab_tests/test_settings_and_logging.py
from __future__ import annotations

import io
import json
import logging
from collections.abc import Iterator
from pathlib import Path

import pytest

from study_ai.safe_logging import configure_logging, report_prepared
from study_ai.settings import ConfigurationError, load_process_settings, read_settings

_JOB = "00000000-0000-4000-8000-000000000001"


@pytest.fixture
def valid_env() -> dict[str, str]:
    return {"SERVICE_URL": "https://service.example.test/v1", "SERVICE_TOKEN": "fake-test-token-" * 3}


@pytest.fixture
def captured_logger() -> Iterator[tuple[logging.Logger, io.StringIO]]:
    stream = io.StringIO()
    logger, close = configure_logging(stream)
    try:
        yield logger, stream
    finally:
        close()
        stream.close()


def test_settings_explicit_types(valid_env: dict[str, str], monkeypatch: pytest.MonkeyPatch) -> None:
    for name, value in valid_env.items():
        monkeypatch.setenv(name, value)
    monkeypatch.setenv("CACHE_ENABLED", "false")
    monkeypatch.setenv("TIMEOUT_MS", "250")
    monkeypatch.setenv("LOG_LEVEL", "WARNING")
    settings = load_process_settings()
    assert settings.cache_enabled is False
    assert settings.timeout_ms == 250
    assert settings.log_level == "WARNING"
    assert settings.service_token not in repr(settings)


@pytest.mark.parametrize("name,value", [
    ("SERVICE_TOKEN", "short"),
    ("SERVICE_TOKEN", "fake-test-token-" * 3 + "\n"),
    ("SERVICE_URL", "https://attacker.example/v1"),
    ("SERVICE_URL", "https://user:password@service.example.test/v1"),
    ("SERVICE_URL", "https://service.example.test:invalid/v1"),
    ("CACHE_ENABLED", "yes"),
    ("TIMEOUT_MS", "1e3"),
    ("TIMEOUT_MS", "0"),
    ("LOG_LEVEL", "TRACE"),
])
def test_bad_configuration_has_safe_errors(valid_env: dict[str, str], name: str, value: str) -> None:
    env = {**valid_env, name: value}
    with pytest.raises(ConfigurationError, match=name) as failure:
        read_settings(env)
    assert value not in str(failure.value)


def test_json_sink_projects_only_safe_fields(captured_logger: tuple[logging.Logger, io.StringIO],
                                           tmp_path: Path) -> None:
    logger, stream = captured_logger
    report_prepared(logger, job_id=_JOB, document_count=3)
    # Fault-injection sentinel: accidental private data must not persist in this sink.
    secret = "PRIVATE_BODY_TOKEN_SENTINEL"
    logger.error(secret, extra={"body": secret, "url": secret, "job_id": secret})
    logger.warning("input.rejected", exc_info=(ValueError, ValueError(secret), None))
    output = stream.getvalue()
    artifact = tmp_path / "safe.jsonl"
    artifact.write_text(output, encoding="utf-8")
    rows = [json.loads(line) for line in artifact.read_text(encoding="utf-8").splitlines()]
    assert rows[0]["event"] == "ingest.completed"
    assert rows[0]["job_id"] == _JOB and rows[0]["document_count"] == 3
    assert rows[1]["event"] == "unclassified"
    assert rows[2]["has_exception"] is True
    assert secret not in output


def test_caplog_checks_event_and_level(caplog: pytest.LogCaptureFixture) -> None:
    logger = logging.getLogger("study_ai.fixture_test")
    with caplog.at_level(logging.INFO, logger=logger.name):
        report_prepared(logger, job_id=_JOB, document_count=1)
    records = [record for record in caplog.records if record.name == logger.name]
    assert len(records) == 1
    assert records[0].levelno == logging.INFO
    assert records[0].msg == "ingest.completed"
```

The fixture creates a fresh mapping, so parameter cases do not contaminate each other. monkeypatch restores real process state; no real token is needed. The JSON test inspects actual output bytes, while caplog checks event/level behavior separately. Keep private synthetic sentinels distinguishable from real credentials. Pytest assertion output and snapshots can themselves expose input values, so never run these tests with production secrets or copied customer payloads.

## Practice and acceptance

**Acceptance:** strict-check the package and run all learner tests. Show that missing/invalid settings fail before a client is created, boolean false stays false and URL credentials/unknown destinations are rejected without echoing values. Verify no settings/handler configuration happens at import. Test default values, valid explicit443/trailing slash, bounds and an invalid numeric port. Explain why repr=False is not a general redaction tool.

Show that reconfiguration cannot duplicate handlers, close can be called twice, and a new owner can configure after release. Prove an existing unrelated root handler receives no raw application record while the owned sink is active. Test DEBUG filtering at INFO and ensure an invalid count/job ID is not logged. Make a test fail after a yield fixture acquires a handler, and demonstrate cleanup still removes it. Prefer a small separate fixture self-test/subprocess so the normal suite remains green; do not mark a known failing test as passed or weaken its assertion. Review captured JSON bytes for secret/path/body/exception sentinels. This material and its tests do not establish remote logging delivery, production retention or learner practice completion.

References checked2026-10-21: [Python3.13 logging HOWTO](https://docs.python.org/3.13/howto/logging.html), [handlers/propagation/records](https://docs.python.org/3.13/library/logging.html), [os.environ](https://docs.python.org/3.13/library/os.html#os.environ), [pytest fixtures/teardown](https://docs.pytest.org/en/stable/how-to/fixtures.html), [monkeypatch](https://docs.pytest.org/en/stable/how-to/monkeypatch.html), [caplog](https://docs.pytest.org/en/stable/how-to/logging.html), [temporary paths](https://docs.pytest.org/en/stable/how-to/tmp_path.html).
