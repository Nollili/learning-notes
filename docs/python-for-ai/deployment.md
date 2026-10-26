# Deploying the Python Companion Service

Use Python3.13.11, uv0.11.16, FastAPI0.156.8, Starlette1.9.0, Pydantic2.14.1 and Uvicorn0.54.0. The selected path is one ASGI process per supervised instance behind a trusted TLS ingress, with an immutable locked release. Start with one process while learning; the current in-memory document repository is a disposable demonstration and cannot provide durable/shared state across restarts or replicas.

## Composition root and startup failure

Keep import side effects quiet. Uvicorn imports a zero-argument factory, then the factory reads startup configuration and constructs the app. The existing [API lifespan](./fastapi-boundaries.md) owns repository acquisition/cleanup. Missing/invalid configuration must fail startup rather than expose a partially ready API. No secret belongs in CLI arguments, source files, image build arguments or readiness responses.

```python
# study_ai/deployment.py
from __future__ import annotations

import os
from collections.abc import Mapping

from fastapi import FastAPI

from .api import create_app
from .settings import ConfigurationError


def app_from_environment(env: Mapping[str, str]) -> FastAPI:
    try:
        return create_app(inbound_key=env.get("INBOUND_API_KEY", ""))
    except ValueError:
        raise ConfigurationError("Invalid INBOUND_API_KEY") from None


def build_app() -> FastAPI:
    return app_from_environment(os.environ)
```

The inbound key is separate from SERVICE_TOKEN/model-provider credentials. Generate a random deployment credential through your secret manager and inject it at runtime; the local tests use a deliberately fake value. Rotation needs an explicit old/new acceptance window or coordinated client rollout; editing an environment variable does not update running worker memory. Do not log the environment or exception input.

## Reproducible release and launch

Add the server in the learner project, regenerate uv.lock intentionally, review the dependency change, then use --locked for validation. A changed dependency declaration is supposed to fail a locked command until the lock is updated. Do not bypass that failure with an unlocked production install.

```bash
uv add 'uvicorn==0.54.0'
uv sync --locked
uv run --locked python -m mypy --strict basics.py study_ai
uv run --locked python -m pytest
```

Build a release from reviewed source, pyproject.toml, uv.lock and the explicit Python version. Include basics.py and study_ai, since the application imports them. In a fresh matching runtime, install only runtime dependencies with uv sync --locked --no-dev, then run the already-installed interpreter directly. Keep the dev/check environment separate from the runtime environment; a no-dev sync removes the development check tools from that environment. Do not copy a host .venv into a different OS/architecture image.

For this project without a packaging build backend, run from the release directory. An installable wheel is an alternative that requires explicit package discovery, build metadata and an installed-artifact smoke test; do not assume the existing loose modules became a wheel just because uv resolved dependencies. Pin the runtime image and uv image by verified digest in a container release; version tags alone can move. Do not invent a digest in a template.

Use the following trusted JSON logging configuration as safe-log.json in the release. It reuses the fixed-projection formatter, suppresses raw exception text and disables access logs. Restrict write access to this file: Python logging configuration can import classes and is executable deployment configuration, not user data.

```json
{
  "version": 1,
  "disable_existing_loggers": false,
  "formatters": {"safe": {"()": "study_ai.safe_logging.SafeJsonFormatter"}},
  "handlers": {"stderr": {
    "class": "logging.StreamHandler", "stream": "ext://sys.stderr", "formatter": "safe"
  }},
  "loggers": {
    "uvicorn": {"handlers": ["stderr"], "level": "INFO", "propagate": false},
    "uvicorn.error": {"handlers": ["stderr"], "level": "INFO", "propagate": false},
    "uvicorn.access": {"handlers": [], "level": "INFO", "propagate": false}
  }
}
```

This sink emits unclassified for framework messages outside the application's allowlist; it intentionally loses raw diagnostic detail. Add reviewed event codes or a separately protected diagnostic sink when operations need more detail. It does not configure unrelated third-party/root loggers. Verify their sinks independently before adding database/provider SDKs. Disabling access logs alone does not prevent error logs from leaking request data. Import/factory exceptions raised by the CLI runner can still appear as a Python traceback outside this logging sink. This factory replaces the credential-validation error with a fixed safe message; do not assume every startup failure is JSON or sanitized by the formatter. If your platform requires JSON-only startup output, add and test an owned launcher that maps known configuration failures to fixed events without dumping locals or environment values.

With INBOUND_API_KEY supplied by the runtime secret mechanism, launch from the release directory:

```bash
.venv/bin/python -m uvicorn study_ai.deployment:build_app --factory \
  --host 127.0.0.1 --port 8000 --workers 1 --loop asyncio --http h11 \
  --lifespan on --no-proxy-headers --no-server-header --no-access-log \
  --log-config safe-log.json --limit-concurrency 32 --backlog 64 \
  --timeout-keep-alive 2 --timeout-graceful-shutdown 5
```

Loopback is appropriate for a same-host proxy/local exercise. An isolated container may need0.0.0.0 plus explicit platform networking/firewall rules; binding all interfaces is a deployment choice, not an authentication control. The selected h11/asyncio path avoids silently selecting optional alternative engines. Do not enable reload in a release. Concurrency limits cause503 under admission pressure; they are not per-user quotas, body-size limits or request deadlines. The existing ASGI middleware still enforces65536 request bytes.

## Real process/socket smoke test

ASGITransport tests bypass the listener/process/signal layer. The following POSIX test launches the actual pinned Uvicorn CLI, passes an already-owned ephemeral loopback socket to avoid a bind-close-rebind race, and uses bounded HTTP requests. The parent closes its listener copy after the child starts. Windows needs a platform-appropriate process/socket fixture; do not pretend pass_fds is portable there.

```python
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
```

Run this with pytest from the release directory; the test owns and reaps its child even on failure. It validates real startup, health, auth, creation, log projection and bounded SIGTERM exit. It does not inspect an active request during termination or prove database/job drainage. The API's separate lifespan tests establish app-state cleanup; a full production adapter must add active-request/job/DB closure evidence. A successful idle exit is not a zero-downtime rollout test.

## Deployment and recovery runbook

1. Build/test once, record source revision, lock hash, runtime/image digest and schema compatibility, then promote the same artifact. Run as a non-root service identity with a read-only application filesystem and a bounded writable temporary area. Keep secrets outside the image and exclude .env, caches, local .venv and source documents from image context. A container build is not validated until the actual image is built and smoke-tested.
2. Configure TLS termination and a private ingress-to-app connection. Disable proxy headers for direct/local access. When a trusted proxy is required, enable them with only the actual connecting proxy addresses; prevent direct bypass and overwrite untrusted forwarded headers at ingress. Never copy a wildcard trust setting without this topology. Test spoofed forwarded IP/scheme headers, certificate renewal and correct public-origin URL behavior.
3. Define startup, readiness and liveness separately. /health here reports whether app-owned startup completed; it is not a continuous database/provider health check. A provider outage should not trigger a restart storm. Liveness must not depend on every external service. Put bounded dependency checks/circuit state into readiness only when that dependency is essential for serving traffic.
4. Bound request body/header/time at ingress, application request time, outbound phases/overall deadlines, database connection/statement budgets, worker memory/CPU, queue depth and temporary storage. Keep-alive timeout covers idle reuse, not total request duration. Uvicorn graceful timeout does not replace a supervisor's hard termination deadline. Test slow/disconnected clients and failed dependency cleanup.
5. Termination order: remove readiness/stop new routing, drain accepted requests/jobs, close clients/database resources through lifespan, then exit before the platform deadline. Make the platform budget greater than application drain plus cleanup margin. A force kill can interrupt work; durable jobs need idempotency/retry/checkpoint semantics, not assumptions about finally blocks surviving SIGKILL.
6. Keep one process per instance initially; set workers explicitly so ambient WEB_CONCURRENCY does not silently replicate state. Each worker has its own memory repository, connection pool and caches. Move document state to a durable shared repository before replication. A synchronous blocking database implementation cannot be inserted into an async route without a deliberate async/offload boundary and capacity limits.
7. Apply migrations as an explicit release step under a single owner. Use expand/contract changes so old and new application versions can overlap. Do not let every worker race to migrate on startup. Smoke-test authentication, a representative operation and rollback compatibility against a dedicated deployment test tenant/store. Do not run destructive probes on real user data.
8. Roll back the application artifact/config when the previous version remains schema-compatible. Data rollback is separate: preserve accepted writes, use verified backups/recovery procedures and record RPO/RTO. The [database recovery lesson](../node-js/database-recovery.md) supplies an executable PostgreSQL drill. A rollback that deletes newer accepted data is not an ordinary safe release rollback.

## Practice and acceptance

Deploy a disposable staging instance from a fresh locked environment with a real durable repository. Record build/runtime identities and prove restart persistence. Verify no missing secret or failed repository startup can become ready. Test unauthorized traffic, body cap, operational503, unexpected500 privacy, proxy spoofing, TLS, logging, saturation and a slow request during SIGTERM. Test the platform hard deadline and a failed cleanup without leaving orphan processes. Perform an artifact rollback and explain why it preserves accepted data under the selected schema transition.

**Acceptance:** local commands/real-process test pass; the deployed artifact matches the tested artifact; readiness/recovery observations and timings are retained; all credentials/documents stay out of logs/image/source; the service restarts cleanly under its supervisor. Native local smoke evidence covers only the selected POSIX server boundary. Container build, hosted ingress/TLS/supervisor, durable repository, active-work drain, production secret rotation and learner deployment practice remain required and unperformed in this documentation batch.

References checked2026-10-21: [Uvicorn0.54.0 release](https://uvicorn.dev/release-notes/#0540-september-24-2026), [server settings and proxy trust](https://uvicorn.dev/settings/), [FastAPI deployment concepts](https://fastapi.tiangolo.com/deployment/concepts/), [uv locked container environments](https://docs.astral.sh/uv/guides/integration/docker/). These deployment notes complement the API/HTTP examples; they do not turn its memory repository into a production system.
