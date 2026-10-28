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
