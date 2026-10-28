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
