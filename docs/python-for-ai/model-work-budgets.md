# Model Work: Admission, Rate Limits and Bounded Retries

A connection pool limits connections, concurrency limits active jobs, a queue limit bounds waiting jobs, and a rate limit controls admissions over time. Token-per-minute and spend budgets are additional dimensions. Two long requests can respect requests-per-minute while exhausting tokens or saturating workers. Retries consume attempts/capacity and can incur cost; unsuccessful requests can also count against provider limits. Start with explicit policies and safe overload outcomes rather than infinite retry.

The primary SDK client keeps `max_retries=0`. If application retries are added, one layer owns total attempts, deadlines and accounting. Do not stack three application attempts over three SDK attempts and call it a three-request budget. Preserve input/model/prompt identity across a permitted retry; switching providers/models can change privacy, quality and cost and requires separate approval/configuration.

## One-event-loop admission and request pacing

This local gate caps active and waiting jobs. Waiting acquisition has a deadline; cancellation releases the waiting counter and an acquired slot. The token bucket is a synchronous same-event-loop request-rate baseline with an injected monotonic timestamp. It permits a bounded burst, unlike a strict “N per fixed minute” rule. It is not a distributed quota, a token estimator or a spend ledger.

```python
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
```

Create the gate/bucket in one application lifespan and use them on its event loop; do not share them across processes, threads or closed loops. Exposed counters are observation-only. All paths that call a model must pass through admission; HTTP pool settings alone cannot enforce it. Reject overload with a safe recoverable service response instead of creating unlimited blocked tasks. Count queue wait separately from execution latency. Use a bounded per-tenant policy and fair scheduling for multi-tenant workloads; an unbounded dictionary of tenant buckets can itself exhaust memory. For multiple replicas use an authoritative shared policy/ledger or partitioned capacity with explicit failure rules; multiplying local limits by replica count is not a global guarantee.

## Retry only explicitly classified temporary rejection

Do not retry malformed/schema requests,401/403, refusals, exhausted credits/quota, invalid output or ambiguous partial-stream disconnects by default. A timeout may have completed remotely; rerunning generation or a tool side effect is not automatically idempotent. The existing `ModelFailure(provider_unavailable)` intentionally collapses several safe public errors, so it is **not enough information** to authorize retry. A provider adapter must separately classify status, safe error code and server delay before emitting the trusted internal exception below. Never accept that exception's policy fields from an end user or model output.

Current official guidance distinguishes temporary429slow_down and503server_is_overloaded from billing/quota/action-required failures. Follow a valid Retry-After minimum plus jitter, including an HTTP-date after validated conversion to seconds using an aware clock. If that minimum exceeds the job's allowed wait, defer/stop rather than clamp it and retry too early. Missing/invalid hints use exponential backoff with jitter. Provider/SDK behavior changes; verify the installed version.

```python
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
```

The overall timer includes admission, attempts and sleep; per-attempt transport/stream timeouts remain inside the adapter. It propagates timeout/cancellation instead of retrying them. The same slot stays occupied during backoff, deliberately reducing throughput and bounding concurrent retry jobs; a scheduler releasing slots between attempts needs a separate bounded job queue. Each actual attempt takes another request token. No token is refunded on failure, and no queued rate-limited wait is created by this example. Jitter/clock/sleep are owned ports for deterministic tests, not user inputs. Cooperative timeouts cannot terminate synchronous CPU loops or an adapter that suppresses cancellation.

This wrapper is not silently attached to `propose_label` or `stream_label`; they preserve their one-attempt semantics. Integrate only after a provider adapter retains sufficient private classification metadata while exposing safe public failures. An ordinary unclassified exception propagates once. RetryDeferred should become a durable deferred job or explicit recovery response, not an immediate hidden loop. A three-attempt cap is a teaching policy, not a recommendation for every workload.

## Worked load and failure decisions

With capacity2/max_waiting3, two jobs can execute and three can await; a sixth concurrent submission is rejected rather than stored indefinitely. Cancel a waiter and one queue slot becomes available. A burst2/rate1request-per-second bucket admits two attempts at time0, denies a third, admits one at time1 and caps accumulated credit at2 even after a long idle period. A retry is another attempt, so a low rate allowance can terminate a retry plan before its attempt cap.

For a job receiving an explicitly classified temporary rejection twice then success, waits are0.1+jitter and0.2+jitter when no server hint exists. A Retry-After3seconds under this wrapper's2second maximum produces RetryDeferred with no second call; do not retry after2seconds. A503quota/billing/configuration error is not TemporaryRejection merely because of status. If the first attempt began streaming then disconnected, stop and retain an incomplete outcome; do not merge it with another generation.

Token quotas require reserving estimated input plus configured output/reasoning capacity before admission, accounting for actual usage and handling missing terminal usage conservatively under a separate ledger. Request pacing alone cannot implement TPM or spending caps. Provider headers may be stale across concurrent jobs; treat them as signals to adjust pace, not authorization to exceed project/account limits. Choose explicit fail-closed/defer behavior if the shared budget store is unavailable. No distributed/token/spend enforcement is claimed by these two local modules.

## Practice and acceptance

Run deterministic fake-clock retry/bucket tests and concurrent async gate tests. Acceptance: active jobs never exceed capacity; waiting stays bounded; overflow rejects; cancelled/timed-out waiters and failed/cancelled active work leave counters/slots reusable; local rate bursts/refill/clock rejection are correct; every retry consumes a token; three attempts maximum; server minima are honored or deferred, never shortened; jitter/backoff and cancellation/deadline are observable; permanent/ambiguous errors execute once. Inject a rate rejection during retries and a server hint above the wait limit. Separately design per-tenant fairness and token/spend reservation with a durable policy; real provider load, distributed enforcement and learner implementation remain required.

Applicable runtime: Python3.13.11 and the existing one-attempt SDK3.35.1 configuration. References checked2026-10-22: [OpenAI rate limits and retry hints](https://developers.openai.com/api/docs/guides/rate-limits), [SDK retry/timeouts](https://developers.openai.com/api/reference/python), [existing async boundary](./async-http.md), [stream cancellation](./model-streaming.md), [token admission](./token-budgets.md). No live requests, spend or account configuration changes are required for offline tests.
