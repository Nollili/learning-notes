# Networking in Node.js — practice

**Learner status: still required.** These tasks were separated from the textbook; no completion is credited.

[Textbook explanation](../../node-js/module-05-networking.md) · [Node.js practice map](./index.md)

### Diagnostic exercise

Build a client for an unreliable local service.

Requirements:

- enforce one total deadline;
- retry only safe failures with jitter;
- use an idempotency key for a create operation;
- reuse bounded connections;
- stop retrying when the caller cancels;
- record attempt count and stage timing;
- prove that a dependency outage cannot create an unbounded request queue.

---

## 19. Final review checklist

You should be able to explain and demonstrate each item:

### Resilience and diagnosis

- Propagate one time budget across connection, retry, and response work.
- Retry only classified transient failures within a bounded attempt budget.
- Explain why a timed-out write may have completed remotely.
- Use an atomic idempotency record for safely repeated commands.
- Reuse and bound connections instead of creating an unlimited connection burst.
- Diagnose DNS, connection, TLS, first-byte, and body-transfer failures separately.
- Configure proxy trust before relying on forwarded client information.

### Architecture and protocols

- A client initiates communication; a server listens and responds.
- One application can be both a server and a client in different interactions.
- Stateless requests contain the context needed for each interaction.
- Stateless servers can still use databases and caches.
- DNS resolves names, TCP carries reliable ordered bytes, TLS secures a channel, and HTTP defines message semantics.
- HTTPS is HTTP over TLS; SSL is obsolete terminology/protocol history.
- WebSocket upgrades from HTTP to a persistent full-duplex message protocol.
- Node.js 22 has a built-in WebSocket client but no built-in WebSocket server API.
- TCP and stream chunks do not preserve application message boundaries.

### HTTP

- A request has method, target, headers, and optional content.
- A response has status, headers, and optional content.
- Safe and idempotent describe method semantics, not whether internal logs change.
- GET is safe/idempotent; PUT and DELETE are idempotent; POST and PATCH are not guaranteed idempotent.
- RFC 10008 defines QUERY as a safe, idempotent content-bearing query method.
- `Content-Type` describes the sent body; `Accept` describes desired response formats.
- Use status codes and headers as part of the API contract.
- `401` concerns authentication; `403` concerns permission.
- A `204` or `304` response has no representation body.

### Node.js APIs

- `http.IncomingMessage` is readable and `http.ServerResponse` is writable.
- Return after ending a response.
- Parse `request.url` with a base URL.
- Bound request-body size before collecting it.
- Parse JSON and then validate its runtime shape.
- `fetch()` does not reject for ordinary HTTP error statuses.
- A fetch response body can normally be consumed only once.
- Outbound calls need deadlines and deliberate retry rules.
- `node:https` serves TLS directly; infrastructure often terminates TLS instead.
- `node:net` exposes duplex TCP sockets and requires application framing.
- `dns.lookup()` follows OS-style resolution, while `resolve*()` queries record types.
- `URLSearchParams.getAll()` is needed for repeated query keys.

### REST and API design

- REST has six constraints; code on demand is the only optional one.
- Uniform interface includes resource identification, representations, self-descriptive messages, and hypermedia.
- Resource paths use stable nouns; HTTP methods carry operation semantics.
- PUT represents replacement; PATCH represents partial modification.
- Pagination, filtering, sorting, errors, and versioning need consistent contracts.
- Idempotency keys can make retried non-idempotent operations safer when the server implements them correctly.
- `If-Match` plus ETag can prevent lost updates.
- HATEOAS advertises discoverable links and currently valid actions.

### Caching and CORS

- `no-cache` means revalidate before reuse; `no-store` means do not store.
- ETag/`If-None-Match` can produce `304 Not Modified`.
- `Vary` tells caches which request headers affect response selection.
- An origin consists of scheme, hostname, and port.
- CORS is enforced by browsers and is not authentication or authorization.
- Preflight uses `OPTIONS` for requests outside the CORS safelist.
- Credentialed CORS cannot use wildcard `Access-Control-Allow-Origin`.
- Dynamically origin-specific responses should include `Vary: Origin`.
- CORS headers must appear on the actual response, not only preflight.

### Production readiness

- Validate and size-limit every untrusted network boundary.
- Protect against SSRF when users influence outbound URLs.
- Authenticate callers and authorize each resource action separately.
- Do not log tokens, cookies, credentials, private keys, or unrestricted bodies.
- Configure timeouts, cancellation, rate limits, and graceful shutdown.
- Close servers, connections, timers, and subscriptions on every lifecycle path.
- Test ordinary behavior, malformed input, dependency failure, timeout, disconnect, retry, and shutdown.

## 20. Boundary failure labs

**HTTP acceptance:** run the handler on an ephemeral loopback port in a separate fixture. Valid UTF-8 application/json with parameters succeeds; application/jsonjunk, an unsupported charset, malformed media type and missing type reject415; malformed/empty/BOM/invalid-UTF8 JSON reject400. A tiny chunked upload exceeding the configured byte bound receives best-effort413 with Connection:close without waiting for unbounded input; a stalled body receives408 under the application deadline. A peer abort does not produce an unhandled error or leave a referenced timer. Confirm source listeners/collector buffers are released. The actual proxy/Expect100/HTTP2 policy still requires integration evidence.

**CORS acceptance:** begin with Vary:Accept-Encoding and require Origin merged once. Repeat for allowed, denied and absent Origin; preserve Vary:* and case-insensitive existing entries. Preflight validates requested method/header names; unauthorized Origin or header/method receives403 and no wildcard credentials. Allowed actual response has explicit origin/credentials/exposed headers. Test ordinary OPTIONS independently. Browser SOP/cookie/preflight-cache behavior cannot be proven by a Node fetch or header double; record real browser observations separately.

**WebSocket acceptance:** valid echo, malformed JSON, null/array/unknown fields, overlong ID/text, binary input, excessive payload/rate and slow send buffer follow their declared policy without throwing out of the callback. Verify close timer/listener cleanup and process shutdown with a real ws client/server. Test rejected/missing Origin and distinguish it from authenticated permission. Document replay/reconnect/heartbeat limitations rather than claiming the echo service supplies them. Learner practice and real service-scale security/load checks remain required.

References checked2026-10-21: [Node24 HTTP lifecycle](https://nodejs.org/download/release/v24.18.0/docs/api/http.html), [MIMEType](https://nodejs.org/download/release/v24.18.0/docs/api/util.html#class-utilmimetype), [ws API](https://github.com/websockets/ws/blob/master/doc/ws.md), [Fetch CORS protocol](https://fetch.spec.whatwg.org/#http-cors-protocol), [RFC10008](https://www.rfc-editor.org/rfc/rfc10008.html). QUERY's June2026 standardization was verified and retained; implementation adoption still needs end-to-end checks.
