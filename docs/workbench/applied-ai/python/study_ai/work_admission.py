# study_ai/work_admission.py
from __future__ import annotations

import asyncio
import math
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager


class AdmissionRejected(Exception):
    pass


class Gate:
    def __init__(self, capacity: int, max_waiting: int) -> None:
        if type(capacity) is not int or not 1 <= capacity <= 100 or type(max_waiting) is not int or not 0 <= max_waiting <= 100:
            raise ValueError("Invalid admission policy")
        self._semaphore = asyncio.Semaphore(capacity)
        self.active = 0
        self.waiting = 0
        self._max_waiting = max_waiting

    @asynccontextmanager
    async def slot(self, *, wait_seconds: float = 1.0) -> AsyncIterator[None]:
        if isinstance(wait_seconds, bool) or not math.isfinite(wait_seconds) or not 0 < wait_seconds <= 30:
            raise ValueError("Invalid queue deadline")
        queued = self._semaphore.locked()
        if queued and self.waiting >= self._max_waiting:
            raise AdmissionRejected("Model queue full")
        if queued:
            self.waiting += 1
        try:
            try:
                async with asyncio.timeout(wait_seconds):
                    await self._semaphore.acquire()
            except TimeoutError:
                raise AdmissionRejected("Model queue deadline") from None
        finally:
            if queued:
                self.waiting -= 1
        self.active += 1
        try:
            yield
        finally:
            self.active -= 1
            self._semaphore.release()


class RequestBucket:
    def __init__(self, *, per_second: float, burst: int, now: float) -> None:
        if (isinstance(per_second, bool) or not math.isfinite(per_second) or not 0 < per_second <= 100
            or type(burst) is not int or not 1 <= burst <= 100
            or isinstance(now, bool) or not math.isfinite(now) or now < 0):
            raise ValueError("Invalid rate policy")
        self._rate = per_second
        self._burst = burst
        self._tokens = float(burst)
        self._last = now

    def take(self, now: float) -> bool:
        if isinstance(now, bool) or not math.isfinite(now) or now < self._last:
            raise ValueError("Invalid monotonic clock")
        self._tokens = min(self._burst, self._tokens + (now - self._last) * self._rate)
        self._last = now
        if self._tokens < 1:
            return False
        self._tokens -= 1
        return True
