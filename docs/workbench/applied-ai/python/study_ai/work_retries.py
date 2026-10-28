# study_ai/work_retries.py
from __future__ import annotations

import asyncio
import math
import random
import time
from collections.abc import Awaitable, Callable
from typing import TypeVar
from .work_admission import AdmissionRejected, Gate, RequestBucket

T = TypeVar("T")


class TemporaryRejection(Exception):
    def __init__(self, retry_after: float | None = None) -> None:
        if retry_after is not None and (isinstance(retry_after, bool) or not math.isfinite(retry_after) or retry_after < 0):
            raise ValueError("Invalid trusted server delay")
        self.retry_after = retry_after
        super().__init__("Temporary model rejection")


class RetryDeferred(Exception):
    pass


async def run_budgeted(call: Callable[[], Awaitable[T]], *, gate: Gate, bucket: RequestBucket,
                       jitter: Callable[[], float] = random.random,
                       clock: Callable[[], float] = time.monotonic,
                       sleep: Callable[[float], Awaitable[None]] = asyncio.sleep,
                       deadline: float = 10.0) -> T:
    if isinstance(deadline, bool) or not math.isfinite(deadline) or not 0 < deadline <= 30:
        raise ValueError("Invalid overall deadline")
    async with asyncio.timeout(deadline):
        async with gate.slot():
            for attempt in range(3):
                if not bucket.take(clock()):
                    raise AdmissionRejected("Model request rate exceeded")
                try:
                    return await call()
                except TemporaryRejection as error:
                    if attempt == 2:
                        raise
                    extra = jitter()
                    if isinstance(extra, bool) or not math.isfinite(extra) or not 0 <= extra < 1:
                        raise ValueError("Invalid jitter") from None
                    minimum = error.retry_after if error.retry_after is not None else 0.1 * (2 ** attempt)
                    delay = minimum + extra * 0.1
                    if delay > 2:
                        raise RetryDeferred("Server delay requires deferred work") from None
                    await sleep(delay)
    raise AssertionError("Unreachable retry state")
