# Model Streams, Deadlines and Cancellation — practice

**Learner status: still required.** These requirements were separated from the textbook. Use the [integrated sequence](../index.md) and shared evidence record; running reference checks is not independent completion.

[Textbook](../../../python-for-ai/model-streaming.md)

## Practice and acceptance

Use actual SDK parsing over synthetic SSE bytes with a fake key and no network. Split UTF-8 across transport chunks; split JSON text across deltas; emit a completed response with the exact accumulated text/item ID. Test disconnect after valid-looking JSON, refusal, failed/incomplete terminal, wrong item/content index, terminal mismatch, invented quote, >8192text bytes,1000empty events, read error, slow idle, continually active overall timeout, external cancellation and invalid input with zero requests. Assert response stream/client closure and safe error categories; no raw provider/source bodies enter errors.

**Acceptance:** strict checks/tests pass; only checked terminal output is returned; cancellation and both deadlines close cooperative transport; preview never becomes an action; application caps are distinguished from unimplemented transport-frame caps. A separately authorized live/browser integration, real provider usage/latency/backpressure, hard pre-parser frame limits and learner implementation remain unperformed. Those limits must be resolved before claiming a hostile-input production boundary.

**UI acceptance:** pending blocks repeated submit, cancel propagates abort, input change/API replacement/unmount reject stale completion, and the current checked result alone displays as a proposal. Test timeout/incomplete/refusal/invalid-output/service failures with fixed safe messages; retry preserves the excerpt, clears the old error and starts a distinct owned request. Confirm raw exception/source text is absent from error UI. Use controlled deferred promises for out-of-order/cancellation races. Then run a real browser/fetch/backend flow with buffering/disconnect/keyboard/AT checks; DOM tests do not establish native network or announcement behavior. Learner UI and full-service practice remain required.
