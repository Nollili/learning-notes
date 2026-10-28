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
