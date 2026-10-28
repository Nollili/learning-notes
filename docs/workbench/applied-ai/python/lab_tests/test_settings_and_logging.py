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
