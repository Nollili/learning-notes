# RESTful API(HTTP) and WebSockets - why and when we need them. Limitations?

# 🌐 RESTful APIs vs WebSockets — When and Why to Use Each

Understanding the trade-offs between **RESTful APIs** and **WebSockets** is key to designing scalable, performant, and maintainable front-end architectures.

---

## ⚙️ RESTful API (HTTP)

### 🔑 What It Is
- **REST (Representational State Transfer)** is an architectural style commonly implemented over HTTP; HTTP transport alone does not make an API RESTful.
- Each request is **stateless** — all info needed to process it is included in the request.
- Communication pattern: **request → response**.

### 🧩 Core Characteristics
| Principle | Meaning |
|------------|----------|
| **Stateless** | Server doesn’t keep client session state. |
| **Resource-oriented** | URLs represent resources (e.g., `/users/123`). |
| **CRUD operations** | Commonly uses `GET`, `POST`, `PUT`, `PATCH`, `DELETE`. |
| **Cacheable** | Responses can be cached via HTTP headers. |
| **Uniform interface** | Resource identification, representations, self-descriptive messages and hypermedia-driven transitions; JSON alone is insufficient. |

### ✅ Advantages
- Simple and widely supported (HTTP everywhere).
- Scales easily via stateless design.
- Works with CDNs and caching layers.
- Easy to test and debug.
- Ideal for traditional CRUD operations and static data fetching.

### ⚠️ Limitations
- A conventional JSON endpoint returns one response to a request; HTTP also supports streaming and SSE server events.
- **Latency from polling**: repeated HTTP requests.
- Repeated snapshot requests can be wasteful for high-frequency events; consider conditional polling, SSE or WebSocket based on interaction needs.
- Overhead from headers in every request.
- HTTP/1.1 can reuse persistent connections; HTTP/2 multiplexes streams. A resource request is not synonymous with a new transport connection.

### 🧠 Best Use Cases
- Standard web apps or APIs (CRUD operations).
- Static or infrequently changing data.
- Microservices APIs.
- Mobile and web clients that fetch resources on demand.

---

## 🔄 WebSockets

### 🔑 What It Is
- A **full-duplex, persistent** communication channel over a message channel (commonly over TCP after an HTTP/1.1 upgrade).
- Allows **real-time, bi-directional** communication between client and server.
- Protocol: `ws://` or `wss://` (secure).

### 🔧 How It Works
1. The common HTTP/1.1 form starts with Upgrade: websocket; extended CONNECT is a separate HTTP/2/3 deployment path, so do not assume every transport uses that header.
2. Once upgraded, both client and server can send data anytime — no polling.
3. Connection remains open until closed by either side.

### ✅ Advantages
- **Low latency** can be useful, but congestion, server queues and consumer work still cause delay.
- **Bi-directional** → both sides can send messages freely.
- **Efficient** → no repeated HTTP headers.
- Ideal for **real-time updates** and event-driven systems.
- Works well with streaming or continuous feeds.

### ⚠️ Limitations
- **Stateful connection** → harder to scale horizontally.
- Not cacheable via CDNs.
- Requires a WebSocket-capable backend and proxy setup.
- Harder to debug and secure than HTTP.
- Load balancers, firewalls, and proxies sometimes block or break persistent connections.

### 🧠 Best Use Cases
- Real-time apps:
    - Chat/messaging systems
    - Live dashboards / financial tickers
    - Multiplayer games
    - Collaborative editors
    - Real-time notifications
- When you need instant data push from server to client.

---

## 🧩 REST vs WebSocket — Comparison Table

| Feature | RESTful API | WebSocket |
|----------|--------------|-----------|
| **Connection** | Connection reuse/multiplexing possible | Persistent (kept open) |
| **Communication Type** | Request–Response | Full-duplex (bi-directional) |
| **Transport Protocol** | HTTP/HTTPS | WS/WSS (TCP) |
| **State** | REST request state is self-contained | Live connection/subscription state; business state still needs a design |
| **Data Transfer** | JSON or XML over HTTP | Custom format (often JSON, binary, or protobuf) |
| **Performance** | Depends on caching/request frequency | Depends on messages/fan-out/queues |
| **Scalability** | Easier (stateless) | Harder (persistent connections) |
| **Caching** | Supported | Not supported |
| **Security** | Standard HTTPS/TLS | WSS (TLS-secured) |
| **Typical Use Cases** | CRUD APIs, forms, static data | Real-time apps, streaming, chat |

---

## ⚙️ Hybrid Approach (Common in Modern Apps)

Many modern architectures combine both:

| Layer | Protocol | Example |
|-------|-----------|---------|
| **API layer** | REST / GraphQL over HTTP | CRUD, initial data fetch |
| **Real-time updates** | WebSocket / SSE | Live updates, notifications |
| **Fallback** | HTTP long-polling | Backup if WS not available |

Example: fetch an authorized, schema-validated snapshot over HTTP, then subscribe with its revision/cursor. Reconnect must replay retained events or resnapshot after a gap. The [SSE lesson](../../node-js/realtime-transports.md#browser-consumer-and-reset-protocol) works through this lifecycle; WebSocket needs an equally explicit application protocol.

---

## 🔒 Security Considerations

Use HTTPS/WSS in production. The server authenticates the handshake, allows only exact trusted browser Origins and authorizes each message/resource subscription. Origin is a browser cross-site defense, not proof of identity for non-browser clients. Cookie-authenticated sockets can suffer cross-site WebSocket hijacking; WSS does not prevent it. Choose a session/CSRF strategy deliberately, expire/revoke sessions and close affected connections. Browser WebSocket cannot set arbitrary Authorization headers; avoid long-lived tokens in URLs/logs. Apply schema, message-size, rate and concurrent-connection limits server-side. Keep logs to safe event codes/identifiers rather than raw messages or credentials.

Both HTTP and sockets accept untrusted input and require validation. A client check improves behavior; it cannot enforce server authorization. TLS protects transport, not application permissions. See the authoritative [OWASP WebSocket security checklist](https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html).

---

## 🧠 Summary

| When To Use                                   | Choose          |
| --------------------------------------------- | --------------- |
| Simple CRUD, scalable APIs                    | ✅ **REST**      |
| Real-time interactions                        | ✅ **WebSocket** |
| Combination of both (initial fetch + updates) | ✅ **Hybrid**    |

---

**Key Takeaway:**

> REST is ideal for **structured, scalable, and cacheable data exchange**.
> WebSockets shine in **low-latency, interactive, real-time** applications.
> As a senior developer, understanding both — and when to combine them — is essential for building modern, efficient systems.



## An owned browser socket

This browser TypeScript example accepts only progress messages and sends only a fixed refresh command. It does not implement the server, automatic reconnect, durable delivery or full UI. The owner renders connection state and explicitly chooses whether/when to reconnect with a fresh snapshot. It deliberately stops on a protocol error rather than retrying malformed data forever. Callbacks are synchronous, must not throw and must not return promises.

```ts
// progress-socket.ts
export function openProgressSocket(url: string, consume: (completed: number) => undefined,
  status: (state: 'open' | 'closed' | 'error') => undefined,
  create: (url: string) => WebSocket = url => new WebSocket(url)) {
  const endpoint = new URL(url);
  if (endpoint.protocol !== 'wss:' || endpoint.username || endpoint.password || endpoint.hash)
    throw new TypeError('Expected credential-free WSS URL');
  const socket = create(endpoint.href);
  let stopped = false;
  const dispose = () => {
    if (stopped) return;
    stopped = true;
    socket.removeEventListener('open', opened);
    socket.removeEventListener('message', message);
    socket.removeEventListener('error', error);
    socket.removeEventListener('close', closed);
    if (socket.readyState < 2) socket.close(1000, 'Owner disposed');
  };
  const opened = () => { if (!stopped) status('open'); };
  const error = () => { if (!stopped) { dispose(); status('error'); } };
  const closed = () => { if (!stopped) { dispose(); status('closed'); } };
  const message = (event: MessageEvent<unknown>) => {
    if (stopped) return;
    let completed: number;
    try {
      if (typeof event.data !== 'string' || event.data.length > 4096)
        throw new TypeError('Unsupported message');
      const value: unknown = JSON.parse(event.data);
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError();
      const record = value as Record<string, unknown>;
      if (Object.keys(record).length !== 2 || record.type !== 'progress' ||
          typeof record.completed !== 'number' || !Number.isSafeInteger(record.completed) ||
          record.completed < 0) throw new TypeError('Invalid progress');
      completed = record.completed;
    } catch { error(); return; }
    consume(completed);
  };
  socket.addEventListener('open', opened);
  socket.addEventListener('message', message);
  socket.addEventListener('error', error);
  socket.addEventListener('close', closed);
  return {
    dispose,
    refresh(): boolean {
      if (stopped || socket.readyState !== 1) return false;
      const frame = '{"type":"refresh"}';
      // This ASCII frame's character count equals its UTF-8 byte count.
      if (socket.bufferedAmount + frame.length > 16_384) { error(); return false; }
      try { socket.send(frame); return true; }
      catch { error(); return false; }
    },
  };
}
```

Checking bufferedAmount prevents this owner from adding unbounded outbound frames. It is not receiver backpressure: the classic WebSocket API cannot pause incoming delivery, and the 4096-character check runs after a message has already been received. The server/library must bound message bytes, decompression and rates before application processing; browser memory can still grow under a flood. A production progress UI can coalesce validated updates, enforce subscription limits or fall back to a snapshot. Keep long-running processing out of the message handler. URL validation above rejects embedded credentials but is not a host allowlist; choose the endpoint from trusted application configuration.

**Acceptance:** fake the socket constructor for deterministic ownership tests: open/valid message, invalid JSON/schema/binary/oversize, send while connecting, send failure, queued-byte overflow, close/error, repeated dispose and late events. Require fixed commands only, no consume after stop, removed listeners and at most one close. Then run a real authenticated server/browser exercise: reject hostile Origin and unauthorized subscriptions, expire the session, test slow consumers, queue limits, proxy timeout, reconnect with a cursor and duplicate/gap handling. Retain evidence; fake socket tests do not establish any of these server/browser protections.

References checked2026-10-22: [WebSockets standard](https://websockets.spec.whatwg.org/), [bufferedAmount](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/bufferedAmount), [HTTP connection management](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Connection_management_in_HTTP_1.x). Browser API feature support must be checked against the practice app's supported browsers; no browser run is implied here.
