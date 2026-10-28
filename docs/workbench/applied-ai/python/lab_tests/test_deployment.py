# lab_tests/test_deployment.py
from __future__ import annotations

import json
import os
import signal
import socket
import subprocess
import sys
import time
from pathlib import Path

import httpx
import pytest

from study_ai.deployment import app_from_environment
from study_ai.settings import ConfigurationError


@pytest.mark.parametrize("value", [None, "", "short", "PRIVATE_BAD_KEY\n"])
def test_invalid_startup_configuration(value):
    env = {} if value is None else {"INBOUND_API_KEY": value}
    with pytest.raises(ConfigurationError) as caught:
        app_from_environment(env)
    assert str(caught.value) == "Invalid INBOUND_API_KEY"


def test_real_server_start_requests_and_signal(tmp_path: Path):
    # Run from the learner release directory with safe-log.json present.
    key = "fake_test_key_" + "x" * 32
    env = {**os.environ, "INBOUND_API_KEY": key, "WEB_CONCURRENCY": "1"}
    listener = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    listener.bind(("127.0.0.1", 0))
    listener.listen(16)
    port = listener.getsockname()[1]
    command = [sys.executable, "-m", "uvicorn", "study_ai.deployment:build_app", "--factory",
               "--fd", str(listener.fileno()), "--workers", "1", "--loop", "asyncio", "--http", "h11",
               "--lifespan", "on", "--no-proxy-headers", "--no-server-header", "--no-access-log",
               "--log-config", "safe-log.json", "--limit-concurrency", "32", "--backlog", "64",
               "--timeout-keep-alive", "2", "--timeout-graceful-shutdown", "5"]
    log_path = tmp_path / "server.jsonl"
    process = None
    try:
        with log_path.open("wb") as logs:
            process = subprocess.Popen(command, env=env, pass_fds=(listener.fileno(),),
                                       stdout=logs, stderr=logs)
            listener.close()
            with httpx.Client(base_url=f"http://127.0.0.1:{port}", timeout=0.5, trust_env=False) as client:
                deadline = time.monotonic() + 5
                while True:
                    if process.poll() is not None:
                        pytest.fail("Server exited before readiness")
                    try:
                        response = client.get("/health")
                        if response.status_code == 200:
                            assert response.json() == {"ready": True}
                            break
                    except httpx.HTTPError:
                        pass
                    if time.monotonic() >= deadline:
                        pytest.fail("Readiness deadline exceeded")
                    time.sleep(0.025)
                assert (denied := client.post("/documents", json={"id": "d1", "body": "PRIVATE_BODY"})).status_code == 401
                assert "PRIVATE_BODY" not in denied.text
                client.headers["X-Study-Key"] = key
                created = client.post("/documents", json={"id": "d1", "body": "PRIVATE_BODY"})
                assert created.status_code == 201 and created.json() == {"id": "d1", "tags": []}
                assert "server" not in created.headers
            process.send_signal(signal.SIGTERM)
            process.wait(timeout=8)
            # Uvicorn can re-raise the received signal after graceful cleanup on POSIX.
            assert process.returncode in {0, -signal.SIGTERM}
    finally:
        listener.close()
        if process is not None and process.poll() is None:
            process.kill()
            process.wait(timeout=2)
    text = log_path.read_text()
    assert key not in text and "PRIVATE_BODY" not in text
    records = [json.loads(line) for line in text.splitlines()]
    assert records and all(set(record) == {"timestamp", "level", "event"} for record in records)
