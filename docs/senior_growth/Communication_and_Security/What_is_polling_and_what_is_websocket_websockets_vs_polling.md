# Polling vs WebSockets — Real-Time Communication {#%F0%9F%94%84-polling-vs-websockets-%E2%80%94-real-time-communication}

Modern web apps often need to **receive updates from the server in real-time**. Two common approaches are **polling** and **WebSockets**.

---

## Polling {#_1%EF%B8%8F%E2%83%A3-polling}

### What It Is {#%F0%9F%94%91-what-it-is}
Polling is a technique where the client **repeatedly sends HTTP requests** to the server at regular intervals to check for updates.

**Example:**
Use the [completion-driven scheduler](../../node-js/realtime-transports.md#completion-driven-polling-with-bounded-backoff), whose next attempt starts only after the current attempt settles. Its owner cancels the request and timer; the adapter validates status, body and schema. Never turn an async request into an overlapping setInterval loop.

### Advantages {#%E2%9C%85-advantages}

* Simple to implement.
* Works with **all browsers** and standard HTTP.
* No special server setup required.

### Disadvantages {#%E2%9D%8C-disadvantages}

* High overhead → repeated requests/headers; transport connections can be reused or multiplexed.
* Latency → updates are only received on the next poll.
* Wastes server and network resources if data rarely changes.
* Capacity depends on interval, conditional responses, request cost and active users; measure the actual workload.

---

## WebSockets {#_2%EF%B8%8F%E2%83%A3-websockets}

### What It Is {#%F0%9F%94%91-what-it-is-1}

WebSockets provide a **persistent, full-duplex message channel** (the common HTTP/1.1 upgrade uses TCP) between client and server.

* Client initiates handshake:

Use the [owned socket example](./RESTful_API_HTTP__and_WebSockets_-_why_and_when_we_need_them._Limitations.md#an-owned-browser-socket) for validation, cleanup and a bounded outbound queue.

* Server can push updates **without waiting for the next poll** whenever they occur.

### Advantages {#%E2%9C%85-advantages-1}

* Low application latency is possible; transport congestion and slow consumers still matter.
* Bi-directional → client and server can send messages any time.
* Efficient → single connection, no repeated headers.
* Can reduce request overhead for frequent events, but needs connection and fan-out capacity planning.

### Disadvantages {#%E2%9D%8C-disadvantages-1}

* More complex to implement on backend.
* Stateful → harder to scale horizontally.
* Some proxies/firewalls may block persistent connections.
* Use WSS in production, plus authentication, authorization and exact Origin validation; encryption alone is insufficient.

---

## Polling vs WebSockets — Comparison Table {#%E2%9A%96%EF%B8%8F-polling-vs-websockets-%E2%80%94-comparison-table}

| Feature         | Polling                    | WebSockets                                  |
| --------------- | -------------------------- | ------------------------------------------- |
| Connection      | HTTP connection reuse/multiplexing possible    | Persistent                                  |
| Communication   | Client requests; server responds       | Bi-directional                              |
| Latency         | High (depends on interval) | Low (real-time)                             |
| Efficiency      | Depends on frequency/cache policy    | Depends on fan-out and queue limits                    |
| Complexity      | Simple                     | More complex                                |
| Scalability     | Depends on request rate/cost        | Depends on connection/fan-out capacity                  |
| Browser Support | Universal                  | Modern browsers                             |
| Security        | HTTPS for production             | WSS plus application security                             |
| Use Cases       | Non-critical updates       | Chat, live dashboards, notifications, games |

---

## Best Practices {#%F0%9F%A7%A0-best-practices}

* Use **polling** for:

    * Infrequent updates
    * Legacy browsers
    * Simple apps where real-time data isn’t critical

* Use **WebSockets** for:

    * Real-time applications (chat, notifications, live dashboards)
    * High-frequency updates
    * Bidirectional communication needs

* **Hybrid approach:**

    * Initial load via REST/HTTP, real-time updates via WebSocket.

---

> **Rule of Thumb:**
> Polling → simple, low-frequency updates.
> WebSockets → efficient, real-time, high-frequency, bidirectional communication.


## Polling exercise and debugging evidence

Extract startPolling from the shared transport lesson into a scratch module. Supply a controllable load(signal) promise and fake clock. Hold the first request beyond two intervals: require one active request and no second timer-triggered load. Resolve it, advance less than the interval (still one request), then the full interval (second request). Abort while loading: the adapter must observe abort and the consumer must not receive a late value. Dispose twice; no timer or listener may survive.

Test terminal authentication/schema failure (stop), selected transient failure (bounded jitter), success resetting backoff, invalid delays, pre-aborted owner and a noncooperative adapter (document that cancellation cannot force an arbitrary promise to settle). Retry count/elapsed limits belong to a bounded job; a mounted live view intentionally runs until its owner stops. Use a real fetch adapter separately to test304 without JSON parsing, non-OK status, bounded body/schema parsing and timeout. Fake callbacks establish scheduler behavior, not browser network cancellation or proxy behavior.

Choose SSE for a one-way event feed when its reconnect/replay contract fits; choose WebSocket for sustained bidirectional messages. A low-frequency dashboard may be simpler with conditional polling. Preserve a stale/reconnecting/error UI rather than silently presenting old values as current.

References checked2026-10-22: [Node24 HTTP keep-alive](https://nodejs.org/download/release/v24.18.0/docs/api/http.html), [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket), [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
