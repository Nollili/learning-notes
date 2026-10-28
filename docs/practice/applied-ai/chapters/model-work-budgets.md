# Model Work: Admission, Rate Limits and Bounded Retries — practice

**Learner status: still required.** These requirements were separated from the textbook. Use the [integrated sequence](../index.md) and shared evidence record; running reference checks is not independent completion.

[Textbook](../../../python-for-ai/model-work-budgets.md)

## Practice and acceptance

Run deterministic fake-clock retry/bucket tests and concurrent async gate tests. Acceptance: active jobs never exceed capacity; waiting stays bounded; overflow rejects; cancelled/timed-out waiters and failed/cancelled active work leave counters/slots reusable; local rate bursts/refill/clock rejection are correct; every retry consumes a token; three attempts maximum; server minima are honored or deferred, never shortened; jitter/backoff and cancellation/deadline are observable; permanent/ambiguous errors execute once. Inject a rate rejection during retries and a server hint above the wait limit. Separately design per-tenant fairness and token/spend reservation with a durable policy; real provider load, distributed enforcement and learner implementation remain required.

Applicable runtime: Python3.13.11 and the existing one-attempt SDK3.35.1 configuration. References checked2026-10-22: [OpenAI rate limits and retry hints](https://developers.openai.com/api/docs/guides/rate-limits), [SDK retry/timeouts](https://developers.openai.com/api/reference/python), [existing async boundary](../../../python-for-ai/async-http.md), [stream cancellation](../../../python-for-ai/model-streaming.md), [token admission](../../../python-for-ai/token-budgets.md). No live requests, spend or account configuration changes are required for offline tests.
