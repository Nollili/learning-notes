# SSE, Bounded Polling and gRPC: Choosing a Transport — practice

**Learner status: still required.** These tasks were separated from the textbook; no completion is credited.

[Textbook explanation](../../node-js/realtime-transports.md) · [Node.js practice map](./index.md)

## Practice and acceptance evidence

**SSE:** use an authorized scratch feed, take a snapshot and stream later IDs; reconnect with Last-Event-ID and require no missing retained events. Expire replay history and verify reset/resnapshot; test malformed/future cursors before headers, duplicate delivery, slow response pressure, disconnect and shutdown cleanup. Observe heartbeat bytes through the actual proxy and native EventSource reconnection. Require listener/timer/subscriber counts return to baseline. Explain in-memory restart/durability and side-effect idempotency limitations. A callback fixture cannot establish browser/proxy behavior.

**Polling:** control the clock and request adapter. Require one active attempt maximum, next schedule only after completion, bounded delay/jitter, selected transient retry, terminal failure stop, disposal during in-flight work and no consume after stop. Test invalid schema,304, timeout and cancellation using the real fetch adapter in the practice app. State whether the owner is a bounded job or a long-lived view and enforce its retry budget accordingly.

**gRPC introductory exercise:** explain both proto methods and four RPC forms; map a not-found/auth/deadline failure to the right gRPC status and external HTTP response; propose a compatible schema addition and unsafe field-number reuse. Acceptance: describe channel/auth/deadline/stream cleanup and browser gateway trade-offs correctly. Running the official Node quickstart and a streaming/load/deployment experiment is optional advanced practice, explicitly not completed here.

References checked2026-10-21: [HTML SSE/EventSource](https://html.spec.whatwg.org/multipage/server-sent-events.html), [Node24 HTTP](https://nodejs.org/download/release/v24.18.0/docs/api/http.html), [gRPC Node basics](https://grpc.io/docs/languages/node/basics/), [gRPC concepts/status](https://grpc.io/docs/what-is-grpc/core-concepts/), [deadlines](https://grpc.io/docs/guides/deadlines/), [gRPC browser FAQ](https://grpc.io/docs/what-is-grpc/faq/), [protobuf schema evolution](https://protobuf.dev/programming-guides/proto3/#updating).
