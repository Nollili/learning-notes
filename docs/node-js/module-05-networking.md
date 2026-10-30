# Networking in Node.js

## Contents

1. [Networking mental model](#1-networking-mental-model)
2. [Client-server architecture](#2-client-server-architecture)
3. [HTTP fundamentals](#3-http-fundamentals)
4. [HTTPS and TLS](#4-https-and-tls)
5. [WebSockets](#5-websockets)
6. [Building an HTTP server](#6-building-an-http-server)
7. [Routing and request bodies](#7-routing-and-request-bodies)
8. [Making requests with `fetch()`](#8-making-requests-with-fetch)
9. [`https`, `net`, and `dns`](#9-https-net-and-dns)
10. [`URL` and `URLSearchParams`](#10-url-and-urlsearchparams)
11. [REST constraints](#11-rest-constraints)
12. [Designing resource-based APIs](#12-designing-resource-based-apis)
13. [HTTP caching](#13-http-caching)
14. [HATEOAS](#14-hateoas)
15. [CORS](#15-cors)
16. [Security, reliability, and operations](#16-security-reliability-and-operations)
17. [Timeout budgets, retries, and idempotency](#17-timeout-budgets-retries-and-idempotency)
18. [Connections, proxies, and network diagnostics](#18-connections-proxies-and-network-diagnostics)
19. [Final review checklist](#19-final-review-checklist)
20. [Boundary failure labs](#20-boundary-failure-labs)

---

## Networking mental model {#_1-networking-mental-model}

The client-server model explains **what communicates**. Protocols explain **how messages move and what they mean**. REST adds architectural constraints for using HTTP consistently.

```mermaid
flowchart LR
    C["Client\nbrowser, mobile app, service"]
    DNS["DNS\nname → address"]
    TCP["TCP connection\nreliable byte stream"]
    TLS["TLS\noptional encryption and identity"]
    HTTP["HTTP\nrequest and response semantics"]
    API["REST-style API\nresource conventions"]
    S["Node.js server\nrouting and business logic"]

    C --> DNS --> TCP --> TLS --> HTTP --> API --> S
```

The layers are related but not interchangeable:

| Layer or concept | Responsibility                                                  | Example                        |
| ---------------- | --------------------------------------------------------------- | ------------------------------ |
| DNS              | Resolve a hostname to network information                       | `api.example.com` → IP address |
| TCP              | Deliver an ordered, reliable stream of bytes                    | `node:net` socket              |
| TLS              | Encrypt a connection and authenticate peers                     | HTTPS certificate validation   |
| HTTP             | Define request/response message semantics                       | `GET /users/123` → `200 OK`    |
| WebSocket        | Provide persistent full-duplex messages after an HTTP handshake | Real-time chat messages        |
| REST             | Constrain API architecture and resource interaction             | Stateless resource endpoints   |
| JSON             | Represent structured data                                       | `{ "id": "123" }`              |

HTTP does not require REST, REST does not require JSON, and TLS is not authentication for the application's end user. Keeping these boundaries clear makes debugging much easier.

### One request from name to response

```mermaid
sequenceDiagram
    participant Client
    participant DNS
    participant Server
    Client->>DNS: Resolve api.example.com
    DNS-->>Client: IP address
    Client->>Server: Establish TCP connection
    Client->>Server: TLS handshake for HTTPS
    Client->>Server: HTTP request
    Server->>Server: Route, validate, execute logic
    Server-->>Client: HTTP response
```

Connections may be reused for multiple HTTP requests. HTTP/2 and HTTP/3 change connection-level mechanics, but request methods, status codes, headers, and resource semantics remain central.

---

## Client-server architecture {#_2-client-server-architecture}

A **client** initiates communication. A **server** listens for requests, performs work, and returns responses or ongoing messages.

The role is contextual. A Node.js API is a server to a browser and a client when it calls a payment service.

```mermaid
flowchart LR
    UI["Browser client"] -->|"HTTP request"| NODE["Node.js API server"]
    NODE -->|"HTTP response"| UI
    NODE -->|"outbound request as client"| PAYMENT["Payment server"]
    PAYMENT -->|"response"| NODE
```

### Responsibilities

| Client                                            | Server                                                         |
| ------------------------------------------------- | -------------------------------------------------------------- |
| Initiates a request or connection                 | Listens for and accepts communication                          |
| Supplies required context and credentials         | Authenticates, authorizes, validates, and executes rules       |
| Interprets status, headers, and representation    | Selects status, headers, and representation                    |
| Handles latency, failure, retry, and cancellation | Applies limits, timeouts, observability, and graceful shutdown |

### Stateful architecture

In a stateful design, the server retains per-client conversational or session state between requests.

Typical flow:

```text
1. Client authenticates.
2. Server creates session data and a session identifier.
3. Client stores and returns the identifier, often in a cookie.
4. Server looks up the session for later requests.
```

Advantages:

- Sensitive session details stay server-side.
- Sessions can be revoked centrally.
- Clients carry only an opaque identifier.

Costs:

- Session storage must be available and maintained.
- Multiple server instances need shared session storage or sticky routing.
- Lost session state affects active clients.

“Stateful” does not necessarily mean one machine's memory. A shared Redis or database session store supports horizontal scaling, though it adds an infrastructure dependency.

### Stateless architecture

In a stateless interaction, every request contains the context needed to understand it. The server does not rely on stored conversational state from earlier requests.

```http
GET /api/profile HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJ...
Accept: application/json
```

Advantages:

- Any suitable server instance can handle any request.
- Requests are easier to replay, trace, and distribute.
- Less per-client conversational state lives on application servers.

Costs:

- Repeated context increases request size.
- Tokens require expiration, rotation, validation, and possibly revocation.
- Multi-step workflows must persist their state as explicit resources or client context.

### Stateless does not mean “the server stores nothing”

A stateless API may use databases, caches, files, and queues. The constraint concerns per-client interaction context between requests.

Likewise, using a JWT does not automatically make a system stateless. Server-side token allowlists, revocation state, or workflow state may still be involved.

### When to choose each model

| Situation                                                      | Useful starting point                                                 |
| -------------------------------------------------------------- | --------------------------------------------------------------------- |
| Horizontally scaled public API                                 | Stateless requests with explicit credentials/context                  |
| Traditional browser application with centrally revocable login | Server-side session can be a strong choice                            |
| Long-lived interactive protocol                                | Connection state may be appropriate and unavoidable                   |
| Multi-step business process                                    | Persist explicit workflow resources rather than hidden process memory |

Security, scalability, operational complexity, and client capabilities matter more than slogans.

---

## HTTP fundamentals {#_3-http-fundamentals}

HTTP is an application protocol built around messages. A client sends a request; a server returns a response.

### Request anatomy

```http
POST /api/users?notify=true HTTP/1.1
Host: api.example.com
Authorization: Bearer token
Content-Type: application/json
Accept: application/json

{"name":"Alice","email":"alice@example.test"}
```

| Part             | Purpose                                | Example                         |
| ---------------- | -------------------------------------- | ------------------------------- |
| Method           | Requested semantics                    | `POST`                          |
| Request target   | Path and optional query                | `/api/users?notify=true`        |
| Protocol version | HTTP version for the message           | `HTTP/1.1`                      |
| Headers          | Metadata and controls                  | `Content-Type`, `Authorization` |
| Body/content     | Optional representation or query input | JSON user data                  |

### Response anatomy

```http
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Location: /api/users/123
Cache-Control: no-store

{"id":"123","name":"Alice"}
```

| Part             | Purpose                                   | Example                    |
| ---------------- | ----------------------------------------- | -------------------------- |
| Protocol version | HTTP version                              | `HTTP/1.1`                 |
| Status code      | Machine-readable outcome                  | `201`                      |
| Reason phrase    | Optional human-readable label in HTTP/1.x | `Created`                  |
| Headers          | Representation and control metadata       | `Content-Type`, `Location` |
| Body/content     | Representation or error details           | JSON object                |

### HTTP properties

- **Stateless semantics:** each request is independently understandable.
- **Extensible fields:** headers carry metadata without redefining the protocol.
- **Representation-independent:** bodies can contain JSON, HTML, images, protobuf, or other media types.
- **Cache-aware:** methods and headers define reuse and revalidation.
- **Intermediary-friendly:** proxies, gateways, caches, and load balancers can participate.

HTTP messages are conceptually readable, but deployed connections may use binary framing, compression, and encryption.

### Methods

| Method    | Typical purpose                                                 | Request body                 | Safe         | Idempotent     |
| --------- | --------------------------------------------------------------- | ---------------------------: | -----------: | -------------: |
| `GET`     | Retrieve a resource representation                              | No defined general semantics | Yes          | Yes            |
| `HEAD`    | Retrieve headers as if by GET, without response body            | No defined general semantics | Yes          | Yes            |
| `POST`    | Create subordinate data or perform resource-specific processing | Common                       | No guarantee | No guarantee   |
| `PUT`     | Create or completely replace the target resource                | Common                       | No           | Yes            |
| `PATCH`   | Apply a partial modification                                    | Common                       | No           | Not guaranteed |
| `DELETE`  | Remove the target resource                                      | Uncommon                     | No           | Yes            |
| `OPTIONS` | Discover communication options; used by CORS preflight          | Usually no                   | Yes          | Yes            |
| `QUERY`   | Perform a safe, idempotent query described by request content   | Expected                     | Yes          | Yes            |

**Safe** means the client does not request a state change. Logging and metrics may still change internally. **Idempotent** means repeating the same intended request has the same intended effect as sending it once; the response can still differ.

`QUERY` was standardized in June 2026 by [RFC 10008](https://www.rfc-editor.org/rfc/rfc10008.html). It fills the gap between URL-encoded GET queries and POST-based searches: it carries query content while remaining explicitly safe and idempotent. Adoption across frameworks, clients, proxies, and API tooling may lag, so verify the whole path before using it.

### Method choice is part of the contract

```text
GET    /users/123       retrieve user
POST   /users           create user
PUT    /users/123       replace user representation
PATCH  /users/123       partially update user
DELETE /users/123       delete user
QUERY  /users/search    safe content-bearing query, where supported
```

Do not use GET for a state-changing action. Browsers, crawlers, prefetchers, caches, and retry logic rely on method semantics.

### Status-code classes

| Range | Class         | Meaning                                                      |
| ----- | ------------- | ------------------------------------------------------------ |
| `1xx` | Informational | Request processing or protocol transition information        |
| `2xx` | Successful    | Request was accepted and handled successfully                |
| `3xx` | Redirection   | Client must use cached data or take another retrieval action |
| `4xx` | Client error  | Request cannot be fulfilled as sent or authorized            |
| `5xx` | Server error  | Server failed to fulfill an apparently valid request         |

### Common status codes

| Code                         | Meaning                                       | Use it when                                                   |
| ---------------------------: | --------------------------------------------- | ------------------------------------------------------------- |
| `200 OK`                     | Successful response                           | Normal retrieval/update with a response representation        |
| `201 Created`                | Resource created                              | Creation succeeded; usually include `Location`                |
| `202 Accepted`               | Accepted for later processing                 | Asynchronous work has not completed                           |
| `204 No Content`             | Success with no response content              | Delete/update succeeded and no representation is returned     |
| `304 Not Modified`           | Cached representation remains valid           | Conditional GET/HEAD validator matches; no response body      |
| `400 Bad Request`            | Malformed request                             | Invalid JSON or syntactically unusable request                |
| `401 Unauthorized`           | Authentication required or invalid            | Credentials missing/invalid; often include `WWW-Authenticate` |
| `403 Forbidden`              | Authenticated or understood but not permitted | Caller lacks authorization                                    |
| `404 Not Found`              | Resource not found                            | Target does not exist or is intentionally concealed           |
| `405 Method Not Allowed`     | Method unsupported for this resource          | Include an `Allow` header                                     |
| `409 Conflict`               | Request conflicts with current state          | Duplicate unique value or version conflict                    |
| `412 Precondition Failed`    | Conditional write precondition failed         | `If-Match` did not match current resource                     |
| `413 Content Too Large`      | Request content exceeds limit                 | Reject oversized uploads/bodies                               |
| `415 Unsupported Media Type` | Request representation unsupported            | Expected JSON but received another content type               |
| `422 Unprocessable Content`  | Syntax understood, semantic validation failed | Well-formed JSON violates field rules                         |
| `429 Too Many Requests`      | Rate limit exceeded                           | Include retry guidance when appropriate                       |
| `500 Internal Server Error`  | Unexpected server failure                     | Do not expose internal stack/details                          |
| `502 Bad Gateway`            | Upstream response invalid/failing             | Gateway/proxy could not get valid upstream response           |
| `503 Service Unavailable`    | Temporarily unavailable                       | Overload, maintenance, or dependency outage                   |
| `504 Gateway Timeout`        | Upstream timed out                            | Gateway did not receive response in time                      |

Use the most specific stable code your clients can handle consistently. Do not return `200` with `{ "success": false }` for an actual HTTP error.

### Important headers

| Header           | Direction | Purpose                                            |
| ---------------- | --------- | -------------------------------------------------- |
| `Content-Type`   | Both      | Media type of this message's body                  |
| `Accept`         | Request   | Media types the client can process                 |
| `Authorization`  | Request   | Credentials for the target resource                |
| `Location`       | Response  | URI associated with creation or redirection        |
| `Content-Length` | Both      | Length of the body in bytes when known             |
| `Cache-Control`  | Both      | Caching directives                                 |
| `ETag`           | Response  | Validator for a representation                     |
| `If-None-Match`  | Request   | Conditional retrieval validator                    |
| `If-Match`       | Request   | Conditional mutation validator                     |
| `Vary`           | Response  | Request headers affecting representation selection |
| `Retry-After`    | Response  | When a client may retry certain temporary failures |
| `User-Agent`     | Request   | Client software information                        |

### `Content-Type` versus `Accept`

```text
Content-Type: What format is the body I am sending?
Accept:       What response formats can I understand?
```

A JSON POST often uses both:

```http
Content-Type: application/json
Accept: application/json
```

Validate media types before parsing. Consider the media type and parameters rather than comparing a header to one exact literal string.

---

## HTTPS and TLS {#_4-https-and-tls}

HTTPS is HTTP carried over TLS. HTTP semantics remain the same; TLS protects the connection underneath.

### What TLS provides

| Property                       | Meaning                                                                                                     |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Confidentiality                | Passive observers cannot read application data in transit                                                   |
| Integrity                      | Tampering in transit is detected                                                                            |
| Server authentication          | Client validates that the certificate represents the intended server name and chains to a trusted authority |
| Optional client authentication | mTLS lets the server authenticate a client certificate                                                      |

TLS does not guarantee that the server application is trustworthy, secure, or authorized to perform a business action. It secures the channel and establishes certificate identity.

### Simplified handshake

```mermaid
sequenceDiagram
    participant Client
    participant Server
    Client->>Server: Supported TLS versions, algorithms, key material
    Server-->>Client: Certificate, selected parameters, key material
    Client->>Client: Validate chain, hostname, validity, trust
    Client->>Server: Complete key agreement
    Note over Client,Server: Encrypted authenticated channel established
    Client->>Server: HTTP request inside TLS
    Server-->>Client: HTTP response inside TLS
```

Modern handshakes use asymmetric cryptography to establish secrets and symmetric encryption for efficient application traffic.

### Certificates

A server certificate binds a public key to identities such as DNS names. Clients validate:

- The requested hostname matches a certificate identity.
- The validity period includes the current time.
- The chain reaches a trusted certificate authority.
- Signatures and algorithm requirements are valid.
- Revocation or policy information where supported and required.

The private key must remain secret. Restrict filesystem access, rotate it safely, and never commit it.

### SSL versus TLS

SSL is the obsolete predecessor to TLS. Tool names such as `openssl` and informal phrases such as “SSL certificate” remain common, but modern HTTPS uses TLS. Do not enable deprecated SSL protocols.

### TLS termination

```mermaid
flowchart LR
    C["Client"] -->|"HTTPS"| P["Reverse proxy / load balancer\nTLS termination"]
    P -->|"HTTP or HTTPS on trusted network"| N1["Node instance 1"]
    P -->|"HTTP or HTTPS on trusted network"| N2["Node instance 2"]
```

Production TLS is often terminated by nginx, a cloud load balancer, ingress controller, or service mesh. Direct `node:https` servers remain useful for self-hosted services, local testing, or end-to-end encryption to the application.

If a proxy terminates TLS, configure trusted proxy behavior carefully before using forwarded headers to determine client IP or original protocol. Untrusted `X-Forwarded-*` values can be spoofed.

### Mutual TLS

With mTLS, both sides present certificates:

```text
normal TLS: client validates server certificate
mTLS:       client validates server + server validates client certificate
```

mTLS is useful for service-to-service identity in controlled environments. It does not replace application authorization: a valid client certificate still needs permissions.

---

## WebSockets {#_5-websockets}

WebSocket creates a persistent, full-duplex message channel. Either peer may send after the connection is established.

### Handshake and communication

```mermaid
sequenceDiagram
    participant Client
    participant Server
    Client->>Server: HTTP request with Upgrade: websocket
    Server-->>Client: 101 Switching Protocols
    Client->>Server: WebSocket message
    Server-->>Client: WebSocket message
    Server-->>Client: More messages without a new HTTP request
    Client->>Server: Close frame
    Server-->>Client: Close frame
```

The connection starts with an HTTP upgrade handshake, then uses WebSocket frames rather than ordinary HTTP request-response messages.

### HTTP versus WebSocket

| Characteristic        | HTTP request-response                                          | WebSocket                                                       |
| --------------------- | -------------------------------------------------------------- | --------------------------------------------------------------- |
| Connection            | Often reusable, but interactions remain requests and responses | Long-lived upgraded connection                                  |
| Server-initiated data | Usually requires polling, streaming response, or SSE           | Native after handshake                                          |
| Direction             | Client request followed by server response                     | Full-duplex                                                     |
| Per-message overhead  | HTTP metadata for each interaction                             | Smaller frame overhead after handshake                          |
| Operational model     | Stateless interactions are natural                             | Connection state and reconnection are explicit                  |
| Best for              | CRUD APIs, documents, commands                                 | Chat, collaborative editing, games, rapid bidirectional updates |

Do not choose WebSocket merely because an application is “real-time.” Server-Sent Events may be simpler for one-way server updates, and ordinary HTTP polling may be adequate for infrequent changes.

### Choosing among real-time approaches

| Need                                                               | Useful choice                                   |
| ------------------------------------------------------------------ | ----------------------------------------------- |
| Bidirectional low-latency messages                                 | WebSocket                                       |
| Server-to-browser event stream with automatic browser reconnection | Server-Sent Events                              |
| Occasional updates and simple infrastructure                       | Polling or conditional HTTP requests            |
| Large download/upload                                              | HTTP streaming rather than WebSocket by default |

For worked SSE replay/heartbeat/cleanup, completion-driven polling and a gRPC/protobuf comparison, use the [transport lesson](./realtime-transports.md).

### Node.js support

[Node.js 22](https://nodejs.org/download/release/v22.15.0/docs/api/globals.html#class-websocket) provides a stable browser-compatible global `WebSocket` **client**. It does not provide a corresponding built-in WebSocket server API. Server applications commonly use the `ws` package or a framework integration.

Client:

```ts
const socket = new WebSocket('wss://realtime.example.com/events');

socket.addEventListener('open', () => {
  socket.send(JSON.stringify({ type: 'subscribe', topic: 'orders' }));
});

socket.addEventListener('message', (event) => {
  console.log('Received:', event.data);
});

socket.addEventListener('error', (event) => {
  console.error('WebSocket error:', event);
});

socket.addEventListener('close', (event) => {
  console.log('Closed:', event.code, event.reason);
});
```

Server with `ws`:

```ts
import { WebSocketServer, WebSocket } from 'ws';
import { performance } from 'node:perf_hooks';

export function parseEcho(raw: string): { type: 'echo'; id: string; text: string } {
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      !('type' in value) || value.type !== 'echo' ||
      !('id' in value) || typeof value.id !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(value.id) ||
      !('text' in value) || typeof value.text !== 'string' || value.text.length > 4_000 ||
      Object.keys(value).some(key => !['type', 'id', 'text'].includes(key)))
    throw new TypeError('Invalid echo message');
  return { type: 'echo', id: value.id, text: value.text };
}

// Local protocol lab. Origin admission is NOT authentication/authorization.
const server = new WebSocketServer({ host: '127.0.0.1', port: 8080,
  maxPayload: 16 * 1024, perMessageDeflate: false,
  verifyClient: info => new Set(['http://localhost:5173']).has(info.origin)
});
server.on('connection', socket => {
  let closing = false;
  let closeTimer: ReturnType<typeof setTimeout> | undefined;
  let windowStart = performance.now();
  let received = 0;
  const close = (code: number, reason: string) => {
    if (closing || socket.readyState === WebSocket.CLOSED) return;
    closing = true;
    closeTimer = setTimeout(() => socket.terminate(), 1_000);
    socket.close(code, reason);
  };
  const onMessage = (data: unknown, isBinary: boolean) => {
    if (closing || socket.readyState !== WebSocket.OPEN) return;
    if (isBinary || !Buffer.isBuffer(data)) { close(1003, 'Text messages required'); return; }
    const now = performance.now();
    if (now - windowStart >= 1_000) { windowStart = now; received = 0; }
    if (++received > 20) { close(1008, 'Message rate exceeded'); return; }
    let message: ReturnType<typeof parseEcho>;
    try { message = parseEcho(data.toString('utf8')); }
    catch { close(1008, 'Invalid JSON or message schema'); return; }
    const payload = JSON.stringify(message);
    if (socket.bufferedAmount + Buffer.byteLength(payload) > 64 * 1024) {
      close(1008, 'Slow consumer'); return;
    }
    socket.send(payload, error => { if (error) close(1011, 'Send failed'); });
  };
  socket.on('message', onMessage);
  socket.on('error', () => close(1011, 'Transport error'));
  socket.once('close', () => { clearTimeout(closeTimer); socket.off('message', onMessage); });
});
```

Version scope: ws8-style server API, Node24 local lab; install/pin the compatible ws package in the practice service. The parser never lets malformed JSON escape its event callback and projects only allowed fields. The library's maxPayload limits inbound messages, the example imposes a per-connection fixed-window rate policy and caps queued outbound bytes, and close has a bounded terminate fallback with cleanup. These are example limits, not universal production settings. A fixed window can permit a boundary burst and per-connection limits do not stop an attacker opening many connections; production admission also needs user/IP/global capacity policy.

verifyClient here is a synchronous Origin-only admission check for the local lab. For application authentication use explicit HTTP upgrade handling with the application's session/auth verifier, a handshake deadline and per-resource authorization; the ws documentation recommends handling authentication at upgrade rather than growing verifyClient into a complex async policy. Origin can be forged by non-browser clients and is not an identity credential. Do not expose this unauthenticated echo lab as a private-data service. WSS/proxy/session integration and cross-instance broadcasts are separate deployment work.

On shutdown stop intake and close/terminate all owned clients under a deadline before resolving server.close; closing the server alone does not ensure upgraded sockets vanish. Ping/pong liveness, resubscription and durable delivery are not provided by this small echo protocol. Implement those when required and retain real socket close/error/backpressure observations in learner practice; pure callback tests do not establish ws framing/handshake behavior.

### WebSocket production checklist

- Use `wss://` outside controlled local development.
- Authenticate the connection and authorize every subscribed resource/action.
- Validate `Origin` for browser clients where relevant; WebSockets are not protected by CORS in the same way as fetch.
- Validate message type, schema, and maximum size.
- Apply per-connection and per-user rate limits.
- Respect send-buffer backpressure.
- Implement ping/pong heartbeat and remove dead connections.
- Define reconnect behavior, exponential backoff, and resubscription.
- Use message IDs or sequence numbers when deduplication/order matters.
- Clean up subscriptions and timers on close.
- Plan how broadcasts cross multiple Node.js instances, often through a broker.

---

## Building an HTTP server {#_6-building-an-http-server}

`node:http` exposes HTTP/1.x server and client primitives without a framework.

```ts
import { createServer } from 'node:http';

const server = createServer((request, response) => {
  response.statusCode = 200;
  response.setHeader('Content-Type', 'text/plain; charset=utf-8');
  response.end('Hello, World!');
});

server.listen(3000, '127.0.0.1', () => {
  console.log('Listening on http://127.0.0.1:3000');
});
```

**What it does:** creates an HTTP server, returns a plain-text response for every request, and binds it to local port `3000`.

**When to use it:** use the core `node:http` API for small services, protocol-level learning, or code that needs precise low-level control. A framework is usually more convenient once routing, validation, authentication, and structured error handling grow.

### Core types

| Value              | Node.js type           | Stream role  | Purpose                                        |
| ------------------ | ---------------------- | ------------ | ---------------------------------------------- |
| `server`           | `http.Server`          | EventEmitter | Accept connections and emit requests           |
| `request` / `req`  | `http.IncomingMessage` | Readable     | Method, URL, headers, and incoming body chunks |
| `response` / `res` | `http.ServerResponse`  | Writable     | Status, headers, and outgoing body             |
| `request.socket`   | `net.Socket`           | Duplex       | Underlying TCP connection                      |

One TCP connection can carry multiple requests with keep-alive. Do not store request-specific state directly on a socket unless the protocol design deliberately requires connection state.

### Writing responses

Set properties individually:

```ts
response.statusCode = 200;
response.setHeader('Content-Type', 'application/json; charset=utf-8');
response.end(JSON.stringify({ status: 'ok' }));
```

Or write status and headers together:

```ts
response.writeHead(200, {
  'Content-Type': 'application/json; charset=utf-8',
});
response.end(JSON.stringify({ status: 'ok' }));
```

Headers must be decided before response body bytes are sent. `response.headersSent` reports whether they have already been committed.

### Small response helpers

```ts
import type { ServerResponse } from 'node:http';

function sendJson(
  response: ServerResponse,
  status: number,
  value: unknown,
): void {
  const body = JSON.stringify(value);
  if (typeof body !== 'string') throw new TypeError('JSON response required');

  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  response.end(body);
}
```

`Content-Length` counts bytes, not JavaScript characters. Use `Buffer.byteLength()` for encoded strings.

Do not send a response body with `204` or `304`.

### Server events

| Event           | When it occurs                                                             |
| --------------- | -------------------------------------------------------------------------- |
| `'request'`     | Parsed HTTP request is available                                           |
| `'connection'`  | New TCP connection established                                             |
| `'clientError'` | HTTP parsing or client connection error occurs before a normal response    |
| `'upgrade'`     | Client requests a protocol upgrade and the server accepts upgrade handling |
| `'listening'`   | Server begins listening                                                    |
| `'close'`       | Server finishes closing                                                    |
| `'error'`       | Server-level failure, such as address already in use                       |

Attach server error handling:

```ts
server.on('error', (error) => {
  console.error('HTTP server failed:', error);
});
```

### Graceful shutdown

```ts
async function shutdown(signal: string): Promise<void> {
  console.log(`Received ${signal}; stopping new connections`);

  server.close((error) => {
    if (error) {
      console.error(error);
      process.exitCode = 1;
    }
  });
}

process.once('SIGTERM', () => void shutdown('SIGTERM'));
process.once('SIGINT', () => void shutdown('SIGINT'));
```

A complete production shutdown also stops health readiness, drains active work within a deadline, closes database pools and brokers, and forcibly handles connections that never finish.

### Timeouts and limits

Slow or malicious clients can hold resources. Configure and test:

- Header parsing timeout.
- Request timeout.
- Keep-alive timeout.
- Maximum headers/count/size where appropriate.
- Application body-size limits.
- Upstream call deadlines.
- Graceful shutdown deadline.

Defaults vary by Node.js release and deployment, so make important policy explicit rather than relying on memory.

---

## Routing and request bodies {#_7-routing-and-request-bodies}

Raw Node.js routing examines the method and parsed pathname.

### Parse the request target

`request.url` is normally a relative request target such as `/users?page=2`, so `new URL()` needs a base:

```ts
const url = new URL(request.url ?? '/', 'http://localhost');

console.log(url.pathname);
console.log(url.searchParams.get('page'));
```

Use a fixed dummy base when only parsing path/query. Do not trust the incoming `Host` header to generate security-sensitive absolute links unless trusted-proxy/host validation is configured.

### Static and dynamic routes

```ts
const { method } = request;
const { pathname } = new URL(request.url ?? '/', 'http://localhost');

if (method === 'GET' && pathname === '/api/users') {
  sendJson(response, 200, []);
  return;
}

const userMatch = pathname.match(/^\/api\/users\/([^/]+)$/);

if (method === 'GET' && userMatch) {
  let userId: string;
  try {
    userId = decodeURIComponent(userMatch[1]);
  } catch {
    sendJson(response, 400, { error: 'Invalid path encoding' });
    return;
  }

  sendJson(response, 200, { id: userId });
  return;
}

sendJson(response, 404, { error: 'Not found' });
```

Return after sending a response. Otherwise later code may attempt to write again and cause “headers already sent” or write-after-end errors.

### Distinguish 404 and 405

If the path exists but the method is unsupported, return `405 Method Not Allowed` and include `Allow`:

```ts
if (pathname === '/api/users') {
  response.setHeader('Allow', 'GET, POST');
  sendJson(response, 405, { error: 'Method not allowed' });
  return;
}
```

Use `404` when no route/resource matches.

### Request bodies are streams

`IncomingMessage` is a readable stream. Chunks are arbitrary `Buffer` boundaries.

```ts
import type { IncomingMessage } from 'node:http';
export class ContentTooLargeError extends Error {}
export class BodyTimeoutError extends Error {}
export class UnsupportedMediaTypeError extends Error {}
export class MalformedJsonError extends Error {}

export async function readBody(request: IncomingMessage,
  maximumBytes = 1_000_000, timeoutMs = 5_000): Promise<Buffer> {
  if (!Number.isSafeInteger(maximumBytes) || maximumBytes < 1 ||
      !Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 2_147_483_647)
    throw new RangeError('Invalid server body limits');
  const declared = request.headers['content-length'];
  if (declared !== undefined && Number(declared) > maximumBytes) {
    request.pause(); throw new ContentTooLargeError('Request body is too large');
  }
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let bytes = 0;
    let settled = false;
    const cleanup = () => {
      clearTimeout(timer);
      request.off('data', onData); request.off('end', onEnd);
      request.off('error', onError); request.off('aborted', onAborted);
      request.off('close', onClose);
    };
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true; cleanup();
      if (error) { request.pause(); chunks.length = 0; reject(error); }
      else { const body = Buffer.concat(chunks, bytes); chunks.length = 0; resolve(body); }
    };
    const onData = (chunk: unknown) => {
      if (!Buffer.isBuffer(chunk)) { finish(new TypeError('Expected raw body bytes')); return; }
      bytes += chunk.length;
      if (bytes > maximumBytes) { finish(new ContentTooLargeError('Request body is too large')); return; }
      chunks.push(chunk);
    };
    const onEnd = () => finish();
    const onError = (error: Error) => finish(error);
    const onAborted = () => finish(new Error('Client aborted body'));
    const onClose = () => { if (!settled) finish(new Error('Body closed prematurely')); };
    const timer = setTimeout(() => finish(new BodyTimeoutError('Body deadline exceeded')), timeoutMs);
    request.on('data', onData); request.once('end', onEnd);
    request.once('error', onError); request.once('aborted', onAborted);
    request.once('close', onClose);
  });
}
```

This collector is appropriate only for explicitly bounded bodies. Large uploads should stream to a parser or destination while enforcing limits.

### Parse JSON safely

```ts
import { MIMEType } from 'node:util';
export async function readJson(request: IncomingMessage,
  maximumBytes = 1_000_000, timeoutMs = 5_000): Promise<unknown> {
  let media: MIMEType;
  try { media = new MIMEType(request.headers['content-type'] ?? ''); }
  catch { throw new UnsupportedMediaTypeError('Expected application/json'); }
  if (media.essence !== 'application/json' ||
      (media.params.has('charset') && media.params.get('charset')?.toLowerCase() !== 'utf-8'))
    throw new UnsupportedMediaTypeError('Expected UTF-8 application/json');
  // This endpoint accepts application/json, not an implicit wildcard for every +json subtype.
  const body = await readBody(request, maximumBytes, timeoutMs);
  try {
    const text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(body);
    return JSON.parse(text); // Empty input and a BOM reject under this explicit protocol.
  } catch (error) { throw new MalformedJsonError('Malformed JSON', { cause: error }); }
}
```

Separate concerns:

| Failure                        | Typical response                                       |
| ------------------------------ | ------------------------------------------------------ |
| Unsupported `Content-Type`     | `415 Unsupported Media Type`                           |
| Body exceeds limit             | `413 Content Too Large`                                |
| Malformed JSON                 | `400 Bad Request`                                      |
| Valid JSON with invalid fields | `422 Unprocessable Content` or documented `400` policy |

After parsing, validate structure. TypeScript types do not validate runtime input.

### Complete POST handler shape

```ts
import type { IncomingMessage, ServerResponse } from 'node:http';

export function rejectBody(request: IncomingMessage, response: ServerResponse,
  status: number, message: string): void {
  request.pause();
  if (response.destroyed || request.aborted) return;
  response.shouldKeepAlive = false;
  response.setHeader('Connection', 'close');
  // Give the small error response a chance to flush, then end the input/connection.
  const forceClose = setTimeout(() => request.destroy(), 1_000);
  const cleanup = () => { clearTimeout(forceClose); };
  response.once('finish', () => request.socket.end());
  request.socket.once('close', cleanup);
  sendJson(response, status, { error: message });
}

// In the request handler, before body parsing; retain an error owner through close.
const onRequestError = (error: Error) => {
  // Body rejection/transport close is already classified; do not throw from this hook.
  console.error('Request transport failed:', error.name);
};
request.on('error', onRequestError);
request.once('close', () => request.off('error', onRequestError));
if (method === 'POST' && pathname === '/api/users') {
  try {
    const input = await readJson(request);
    const user = validateAndCreateUser(input); // Real schema/domain/service port.
    response.setHeader('Location', `/api/users/${encodeURIComponent(user.id)}`);
    sendJson(response, 201, user);
  } catch (error) {
    if (error instanceof ContentTooLargeError) rejectBody(request, response, 413, error.message);
    else if (error instanceof BodyTimeoutError) rejectBody(request, response, 408, error.message);
    else if (error instanceof UnsupportedMediaTypeError) rejectBody(request, response, 415, error.message);
    else if (error instanceof MalformedJsonError) rejectBody(request, response, 400, error.message);
    else {
      console.error(error);
      rejectBody(request, response, 500, 'Internal server error');
    }
  }
  return;
}
```

This **HTTP/1.x teaching policy closes the connection after a rejected body** instead of draining an unbounded upload to preserve keep-alive. The event-based collector pauses and rejects without async-iterator early-return destruction, allowing a best-effort413 before closing. A declared oversized Content-Length can reject before reading; actual bytes remain authoritative for chunked/false-size cases. The small error has a close deadline; a disconnected/slow/malicious peer is not guaranteed to receive an error response. Test behavior with the actual proxy and Node release. Handle Expect:100-continue and HTTP/2 stream cancellation separately; this snippet is not an HTTP/2 server.

The handler owns request errors until close and maps only explicit boundary classes. A TypeError from a domain bug is not415. The validateAndCreateUser port still needs a real runtime schema, authorization, async/transaction policy and a specific domain422 mapping; those belong to the application architecture lesson. Do not mistake this transport example for a complete user-registration service.

### Raw routing limitations

Manual routing is useful for learning and small services. Framework routers add:

- Route parameters and decoding.
- Middleware composition.
- Body parsers and limits.
- Central error handling.
- Schema validation integration.
- Content negotiation.
- Security middleware.

Understanding `req` and `res` remains important because frameworks build on these concepts.

---

## Making requests with `fetch()` {#_8-making-requests-with-fetch}

Node.js 22 exposes the browser-compatible `fetch` API globally. Use it for ordinary outbound HTTP and HTTPS requests.

### GET

```ts
const response = await fetch('https://api.example.com/users');

if (!response.ok) {
  await response.body?.cancel();
  throw new Error(`Users request failed with ${response.status}`);
}

const users = await response.json();
```

`fetch()` does **not** reject merely because the server returned `404` or `500`. It rejects for network-level/abort failures. Check `response.ok` or `response.status` yourself.

### POST JSON

```ts
const response = await fetch('https://api.example.com/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  body: JSON.stringify({ name: 'Alice' }),
});

if (response.status !== 201) {
  await response.body?.cancel();
  throw new Error(`Create failed (${response.status})`);
}

const createdUser = await response.json();
```

The error path cancels its body instead of buffering or exposing arbitrary upstream text. These short success examples collect the full JSON body; use them only for trusted, bounded responses. For untrusted payloads, enforce a byte limit while reading the Web stream, then validate the parsed value. Keep the deadline active through body consumption, not just headers.

### Query parameters

```ts
const url = new URL('https://api.example.com/users');
url.searchParams.set('page', '2');
url.searchParams.set('limit', '20');
url.searchParams.append('role', 'admin');

const response = await fetch(url);
```

Do not manually concatenate untrusted query values.

### Timeouts and cancellation

```ts
const response = await fetch(url, {
  signal: AbortSignal.timeout(5_000),
});
```

Or coordinate several operations with one controller:

```ts
const controller = new AbortController();

const request = fetch(url, { signal: controller.signal });
controller.abort();

await request; // Rejects with an abort-related error.
```

Always set a deadline appropriate to the operation. A hanging upstream request can consume server resources and delay shutdown.

### Response bodies are one-use streams

```ts
const data = await response.json();
await response.text(); // Fails: body has already been consumed.
```

Choose one consumption method:

| Method                   | Result                                          |
| ------------------------ | ----------------------------------------------- |
| `response.json()`        | Parse JSON                                      |
| `response.text()`        | Decode text                                     |
| `response.arrayBuffer()` | Collect binary bytes                            |
| `response.blob()`        | Produce a Blob                                  |
| `response.formData()`    | Parse supported form data                       |
| `response.body`          | Web `ReadableStream` for incremental processing |

Validate `Content-Type` and schema when consuming external data. A successful status does not guarantee the body has the expected shape.

### Retry policy

Retries can multiply load and duplicate side effects.

Retry only when:

- The failure is plausibly transient.
- The method/action is safe to repeat, or an idempotency mechanism exists.
- Attempts are bounded.
- Exponential backoff and jitter are applied.
- The overall deadline still has time.
- `Retry-After` is respected where appropriate.

Do not automatically retry an ordinary POST that may have succeeded before the connection failed unless the API supports an idempotency key.

### When to use `http.request()`

Use the lower-level client when you need precise control over:

- Agents and connection pooling.
- Raw socket/TLS options.
- Streaming integration with Node streams.
- Fine-grained request lifecycle events.
- Features unavailable through the desired fetch abstraction.

For normal JSON calls, `fetch()` is simpler. Its body is a **Web ReadableStream**, while `node:http` exposes classic Node streams. Use `Readable.fromWeb(response.body)` when composing a fetch body with Node `pipeline()`; preserve its cancellation owner and byte limits. Changing stream interfaces does not grant a memory bound.

---

## `https`, `net`, and `dns` {#_9-https-net-and-dns}

### `node:https`

Create a direct TLS server:

```ts
import { readFileSync } from 'node:fs';
import { createServer } from 'node:https';

const server = createServer(
  {
    key: readFileSync('server.key'),
    cert: readFileSync('server.crt'),
  },
  (_request, response) => {
    response.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
    });
    response.end('Secure response');
  },
);

server.listen(3443);
```

Synchronous certificate reads are reasonable during startup before accepting traffic. Handle startup errors and protect private-key permissions.

### mTLS options

```ts
const server = createServer({
  key: readFileSync('server.key'),
  cert: readFileSync('server.crt'),
  ca: readFileSync('trusted-client-ca.crt'),
  requestCert: true,
  rejectUnauthorized: true,
});
```

Validate the authenticated certificate identity and map it to application permissions. Never set `rejectUnauthorized: false` in production merely to bypass certificate errors.

### `node:net`

`node:net` creates raw TCP servers and clients. HTTP itself is implemented over lower-level transports; use raw TCP for custom protocols, database clients, device protocols, or internal binary communication.

TCP server:

```ts
import { createServer } from 'node:net';

const server = createServer((socket) => {
  console.log('Connected:', socket.remoteAddress);

  socket.setEncoding('utf8');
  socket.write('hello\r\n');

  socket.on('data', (chunk) => {
    console.log('Received chunk:', chunk);
  });

  socket.on('end', () => console.log('Peer ended its writable side'));
  socket.on('error', (error) => console.error('Socket error:', error));
});

server.listen(1234, '127.0.0.1');
```

TCP client:

```ts
import { createConnection } from 'node:net';

const socket = createConnection(
  { host: '127.0.0.1', port: 1234 },
  () => socket.write('Hello, server!\r\n'),
);

socket.setEncoding('utf8');
socket.on('data', (chunk) => {
  console.log(chunk);
  socket.end();
});
socket.on('error', console.error);
```

### TCP is a byte stream, not a message protocol

One `socket.write()` is not guaranteed to equal one `'data'` event. Messages can split or combine:

```text
sender writes:  [message A] [message B]
receiver gets:  [part A] [rest A + B]
```

Define framing, such as:

- Newline-delimited records.
- Length-prefixed frames.
- Fixed-width messages.
- A standard higher-level protocol.

Then retain incomplete data between chunks and enforce maximum frame size.

### TCP socket essentials

| API or event             | Purpose                                                          |
| ------------------------ | ---------------------------------------------------------------- |
| `socket.write(data)`     | Send bytes; check boolean for backpressure                       |
| `socket.end(data?)`      | Gracefully finish the writable side                              |
| `socket.destroy(error?)` | Abort the connection                                             |
| `socket.setTimeout(ms)`  | Emit `'timeout'` after inactivity; you still decide how to close |
| `socket.setKeepAlive()`  | Configure TCP keepalive probes                                   |
| `'data'`                 | Receive an arbitrary chunk                                       |
| `'end'`                  | Peer sent an orderly FIN for its writable side                   |
| `'close'`                | Socket fully closed                                              |
| `'error'`                | Socket operation failed                                          |
| `'drain'`                | Sending may resume after `write()` returned `false`              |

### `node:dns/promises`

Most networking APIs resolve hostnames automatically. Use DNS APIs for diagnostics, service discovery, or record inspection.

```ts
import {
  lookup,
  resolve4,
  resolve6,
  resolveMx,
} from 'node:dns/promises';

const endpoint = await lookup('example.com');
const ipv4Addresses = await resolve4('example.com');
const ipv6Addresses = await resolve6('example.com');
const mailServers = await resolveMx('example.com');
```

### `lookup()` versus `resolve*()`

| API                              | Uses                                  | Result                                                     | Use it when                                                                          |
| -------------------------------- | ------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `lookup(hostname)`               | OS name-resolution facilities         | Address/family, usually selected like ordinary connections | You want behavior similar to connecting applications, including system configuration |
| `resolve4()`, `resolve6()`, etc. | DNS queries for specific record types | Record arrays                                              | You need authoritative-style DNS records or service-discovery data                   |

`lookup()` and `resolve*()` are not interchangeable. DNS answers can contain multiple addresses, change over time, and expire according to TTL. Do not assume the first address is permanent.

---

## `URL` and `URLSearchParams` {#_10-url-and-urlsearchparams}

Node.js exposes the WHATWG `URL` and `URLSearchParams` classes globally.

### Parse an absolute URL

```ts
const url = new URL(
  'https://user:secret@example.com:8443/products/42?view=full#details',
);

console.log(url.protocol); // 'https:'
console.log(url.hostname); // 'example.com'
console.log(url.port);     // '8443'
console.log(url.host);     // 'example.com:8443'
console.log(url.origin);   // 'https://example.com:8443'
console.log(url.pathname); // '/products/42'
console.log(url.search);   // '?view=full'
console.log(url.hash);     // '#details'
```

Do not log `url.href` when it might contain embedded credentials or sensitive query values.

### `host` versus `hostname`

```text
hostname = example.com
host     = example.com:8443
origin   = https://example.com:8443
```

An origin is defined by scheme, host, and port. Changing any of these creates a different origin for browser security rules.

### Relative URLs need a base

```ts
const url = new URL('/users?page=2', 'https://api.example.com');
```

This is why raw `request.url` cannot usually be passed to `new URL()` alone.

### Read query parameters

```ts
const url = new URL('https://example.com/search?q=node&tag=js&tag=backend');

url.searchParams.get('q');       // 'node'
url.searchParams.get('missing'); // null
url.searchParams.getAll('tag');  // ['js', 'backend']
url.searchParams.has('q');       // true
```

`get()` returns only the first matching value. Use `getAll()` for repeated parameters.

### Modify query parameters

```ts
url.searchParams.set('page', '2');      // Replace existing values.
url.searchParams.append('tag', 'api');  // Add another value.
url.searchParams.delete('q');
url.searchParams.sort();

console.log(url.toString());
```

### Build a standalone query

```ts
const params = new URLSearchParams({
  name: 'Alice Smith',
  role: 'admin',
});

console.log(params.toString());
// name=Alice+Smith&role=admin
```

Values are strings. Convert and validate them at the application boundary:

```ts
const rawPage = url.searchParams.get('page') ?? '1';
const page = Number(rawPage);

if (!Number.isInteger(page) || page < 1) {
  throw new Error('page must be a positive integer');
}
```

### URL rules and safety

- Use `URL` rather than manual splitting.
- Use `URLSearchParams` rather than string concatenation.
- Encode path segments with `encodeURIComponent()` when constructing them.
- Decode dynamic path segments once and handle malformed encoding.
- Do not place secrets in query strings; URLs are widely logged and stored.
- Validate redirect targets to prevent open redirects.
- Validate outbound destinations to reduce server-side request forgery risk.
- Remember that a fragment (`#...`) is not sent in an HTTP request.

---

## REST constraints {#_11-rest-constraints}

REST is an architectural style defined by Roy Fielding. An HTTP JSON API is not automatically RESTful; REST applies a set of constraints.

### Six constraints

| Constraint        | Required? | Practical meaning                                                            |
| ----------------- | --------: | ---------------------------------------------------------------------------- |
| Client-server     | Yes       | Separate user interface/client concerns from data and business-rule concerns |
| Stateless         | Yes       | Each request contains all context needed to process it                       |
| Cacheable         | Yes       | Responses declare whether and how they may be reused                         |
| Uniform interface | Yes       | Resources and messages follow consistent, self-descriptive conventions       |
| Layered system    | Yes       | Intermediaries can exist without changing the client contract                |
| Code on demand    | Optional  | Server may send executable code that extends the client                      |

### Client-server separation

The client does not need to know internal database/business implementation. The server does not need to know how a particular UI renders the representation.

Benefits:

- Client and server can evolve independently behind a stable contract.
- Several clients can use the same API.
- Server internals can change without changing resource semantics.

The separation is not absolute organizational independence: both sides still agree on the API contract.

### Stateless interactions

Each request supplies credentials, target, representation, and other required context. Do not depend on a previous request having reached the same process.

Persist multi-step state explicitly:

```text
POST /checkout-sessions       create workflow resource
PATCH /checkout-sessions/123 advance it
GET /checkout-sessions/123   retrieve current state
```

### Cacheability

Responses explicitly allow, prohibit, or require revalidation of reuse. Correct caching reduces latency, bandwidth, and server load, but invalid policy can serve stale or private data.

### Uniform interface

The formal uniform-interface ideas include:

1. **Identification of resources:** stable URIs identify conceptual resources.
2. **Manipulation through representations:** clients send/receive representations rather than direct storage objects.
3. **Self-descriptive messages:** method, status, headers, media type, and body provide enough meaning.
4. **Hypermedia as the engine of application state:** responses can advertise links and available actions.

Resource-based naming and standard HTTP method semantics are practical consequences.

### Layered system

Clients can interact through CDNs, proxies, gateways, load balancers, firewalls, or service meshes without needing to distinguish every layer.

Intermediaries can add:

- TLS termination.
- Authentication and rate limiting.
- Caching and compression.
- Routing and load balancing.
- Observability and security filtering.

Preserve end-to-end semantics and configure trust boundaries for forwarded headers.

### Code on demand

The server may send executable code to extend a client. This is optional and uncommon in typical JSON REST APIs. Do not force it into an API merely for theoretical completeness.

### REST as a design heuristic

Not every useful HTTP API implements every REST constraint perfectly. Be precise in documentation: “HTTP API” or “REST-style API” may be more honest than claiming strict REST when hypermedia or other constraints are absent.

---

## Designing resource-based APIs {#_12-designing-resource-based-apis}

Model durable concepts as resources and use nouns in paths.

### URI design

| Prefer                   | Avoid                  | Reason                                                          |
| ------------------------ | ---------------------- | --------------------------------------------------------------- |
| `/users`                 | `/getUsers`            | HTTP method already describes the action                        |
| `/users/123`             | `/getUserById?id=123`  | Path identifies the resource clearly                            |
| `/users/123/orders`      | `/userOrders/123`      | Expresses resource relationship                                 |
| `/orders?status=pending` | `/orders/pending/list` | Query parameters express filtering                              |
| `/users/123/activation`  | `/activateUser/123`    | Models an action/state as a resource when plain CRUD is awkward |

Use plural collection nouns consistently. Keep paths stable and avoid leaking database table names or internal implementation details.

### CRUD mapping

| Operation     | Method and URI      | Common success response                             |
| ------------- | ------------------- | --------------------------------------------------- |
| List users    | `GET /users`        | `200` with collection                               |
| Retrieve user | `GET /users/123`    | `200`, or `404`                                     |
| Create user   | `POST /users`       | `201`, representation, and `Location`               |
| Replace user  | `PUT /users/123`    | `200`/`204`; sometimes `201` if creation is allowed |
| Modify user   | `PATCH /users/123`  | `200` with representation or `204`                  |
| Delete user   | `DELETE /users/123` | `204` or `200` with result                          |

### `PUT` versus `PATCH`

| `PUT`                                                     | `PATCH`                                  |
| --------------------------------------------------------- | ---------------------------------------- |
| Conceptually replaces the target representation           | Applies a partial change document        |
| Idempotent by method semantics                            | Not inherently idempotent                |
| Omitted fields may be removed/reset according to contract | Omitted fields normally remain unchanged |
| Client knows the intended complete state                  | Client describes only changes            |

Document the patch media type and behavior. A JSON object of partial fields is common but is not the only patch format.

### Collection queries

```http
GET /orders?status=pending&customerId=123&sort=-createdAt&page=2&limit=20
```

Common query concerns:

| Concern         | Example                                      |
| --------------- | -------------------------------------------- |
| Filtering       | `status=pending`                             |
| Sorting         | `sort=-createdAt,name`                       |
| Pagination      | `page=2&limit=20` or cursor-based parameters |
| Search          | `q=node`                                     |
| Field selection | `fields=id,name`                             |
| Expansion       | `include=customer`                           |

Define maximum limits, stable ordering, invalid-value behavior, and whether repeated keys are allowed.

### Offset versus cursor pagination

| Offset/page                                  | Cursor                                                      |
| -------------------------------------------- | ----------------------------------------------------------- |
| Simple and human-readable                    | Stable and efficient for frequently changing large datasets |
| Easy random page access                      | Strong sequential navigation                                |
| Can become slow at large offsets             | Cursor is opaque and must be validated                      |
| Concurrent inserts/deletes can shift results | Requires deterministic sort key and continuation design     |

Return navigation metadata or links according to client needs.

### Consistent error representation

```json
{
  "type": "https://api.example.com/problems/validation",
  "title": "Validation failed",
  "status": 422,
  "errors": [
    { "field": "email", "code": "INVALID_FORMAT" }
  ],
  "requestId": "req-123"
}
```

Use stable machine-readable codes and safe human-readable details. Do not expose stack traces, SQL, filesystem paths, or secrets.

### Idempotency and concurrency

For non-idempotent creation/payment requests, an idempotency key can let the server recognize retried attempts:

```http
POST /payments HTTP/1.1
Idempotency-Key: 82d...unique...
```

The server must define key scope, retention, conflict behavior, and response replay.

For concurrent updates, use version validators:

```http
GET /users/123
ETag: "user-7"

PUT /users/123
If-Match: "user-7"
```

If the resource changed, return `412 Precondition Failed` instead of silently overwriting another client's update.

### API evolution

- Add backward-compatible fields where clients ignore unknown fields.
- Avoid changing field meaning or type silently.
- Deprecate with a documented timeline and observability.
- Version only when compatibility cannot be preserved.
- Keep error contracts and pagination semantics as stable as success bodies.
- Use contract tests and schema validation for important consumers.

---

## HTTP caching {#_13-http-caching}

HTTP caching allows a client or intermediary to reuse a response when policy permits.

### Cache flow

```mermaid
sequenceDiagram
    participant Client
    participant Cache
    participant Server
    Client->>Cache: GET /products/123
    Cache->>Server: No fresh entry, forward request
    Server-->>Cache: 200 + Cache-Control + ETag + body
    Cache-->>Client: 200 + body
    Client->>Cache: Later GET /products/123
    alt Entry is fresh
        Cache-->>Client: Reuse cached response
    else Entry requires revalidation
        Cache->>Server: If-None-Match: "version-1"
        Server-->>Cache: 304 Not Modified
        Cache-->>Client: Reuse stored body
    end
```

### `Cache-Control` directives

| Directive         | Meaning                                                                        |
| ----------------- | ------------------------------------------------------------------------------ |
| `max-age=60`      | Response is fresh for 60 seconds in applicable caches                          |
| `s-maxage=300`    | Shared-cache freshness, overriding `max-age` there                             |
| `public`          | Response may be stored by shared caches even in some normally restricted cases |
| `private`         | Store only in a private user-specific cache, not shared caches                 |
| `no-cache`        | Storage may occur, but reuse requires successful revalidation                  |
| `no-store`        | Do not store this response                                                     |
| `must-revalidate` | Once stale, cache must validate before reuse                                   |
| `immutable`       | Fresh response is not expected to change during its freshness lifetime         |

The common misconception is important:

```text
no-cache  ≠ do not store
no-cache  = revalidate before reuse
no-store  = do not store
```

For personalized or sensitive responses, choose policy explicitly. `private` permits browser caching; `no-store` prevents storage.

### ETags and conditional GET

First response:

```http
HTTP/1.1 200 OK
ETag: "product-42-v7"
Cache-Control: private, no-cache
Content-Type: application/json

{"id":"42","name":"Keyboard"}
```

Revalidation request:

```http
GET /products/42 HTTP/1.1
If-None-Match: "product-42-v7"
```

Unchanged response:

```http
HTTP/1.1 304 Not Modified
ETag: "product-42-v7"
Cache-Control: private, no-cache
```

The client reuses its stored body; the `304` response does not contain a new representation body.

### Strong and weak ETags

```text
strong: "abc123"    byte-equivalent representation validator
weak:   W/"abc123"  semantically equivalent representation validator
```

Generate validators consistently from a version, content hash, or reliable modification state. Do not use an unstable timestamp generated per request.

### `Last-Modified`

```http
Last-Modified: Tue, 08 Sep 2026 10:00:00 GMT
```

Client revalidation:

```http
If-Modified-Since: Tue, 08 Sep 2026 10:00:00 GMT
```

ETags can be more precise and flexible. `Last-Modified` remains useful when modification time is already authoritative.

### `Vary`

If response selection depends on a request header, caches need to know:

```http
Vary: Accept-Encoding, Origin
```

Without the correct `Vary`, a cache may serve compressed data to an incompatible client or CORS headers for the wrong origin.

### Cache invalidation guidance

- Prefer versioned/immutable asset URLs when content changes produce a new URL.
- Give frequently changing resources short freshness or require revalidation.
- Purge CDN entries when immediate invalidation is required.
- Do not cache authorization-specific responses publicly unless the design makes it safe.
- Test cache keys, query parameters, headers, and invalidation paths.
- Remember that application caches and HTTP caches are different layers.

---

## HATEOAS {#_14-hateoas}

Hypermedia as the Engine of Application State means representations include links or controls that tell clients what related resources or actions are available.

### Example

```json
{
  "id": "123",
  "name": "Alice",
  "email": "alice@example.test",
  "_links": {
    "self": { "href": "/api/users/123" },
    "orders": { "href": "/api/users/123/orders" },
    "update": { "href": "/api/users/123", "method": "PATCH" },
    "delete": { "href": "/api/users/123", "method": "DELETE" }
  }
}
```

`_links` is a common convention, including in HAL-style representations, but it is not a universal requirement that every API uses this exact shape.

### Benefits

- Clients discover related URIs instead of constructing every path.
- Server can advertise actions based on current state and permissions.
- Navigation becomes part of the representation contract.
- URI structure can evolve behind stable link relations.

### Link relations

Use stable relation names:

| Relation                         | Meaning                        |
| -------------------------------- | ------------------------------ |
| `self`                           | Current resource               |
| `next` / `prev`                  | Pagination navigation          |
| `collection`                     | Containing collection          |
| Domain relation such as `orders` | Related domain resource        |
| Action relation such as `cancel` | Currently available transition |

Represent only actions actually available to the caller. A paid order should not advertise an invalid `pay` action.

### Pragmatic use

Many APIs are resource-oriented but do not fully implement HATEOAS. Hypermedia is most useful when workflow discoverability and evolvable navigation justify the added contract complexity.

Avoid adding decorative links that no client follows. If you adopt hypermedia, define relation semantics, URI resolution, methods, media types, and versioning behavior.

---

## CORS {#_15-cors}

CORS (Cross-Origin Resource Sharing) is a browser-enforced protocol that lets a server permit selected cross-origin reads.

### What is an origin?

An origin is the combination of:

```text
scheme + hostname + port
```

These are different origins:

```text
https://app.example.com
http://app.example.com       different scheme
https://api.example.com      different hostname
https://app.example.com:8443 different port
```

Paths do not change origin.

### What CORS does and does not do

| CORS does                                               | CORS does not                                       |
| ------------------------------------------------------- | --------------------------------------------------- |
| Tell browsers which origins may read responses          | Authenticate users                                  |
| Control permitted cross-origin methods/headers          | Authorize a business operation                      |
| Define credentialed cross-origin browser behavior       | Prevent non-browser clients from calling the server |
| Use preflight to ask permission before certain requests | Replace CSRF protection or input validation         |

The server still receives many cross-origin requests even if CORS blocks browser JavaScript from reading the response. Never rely on CORS as access control.

For DOM/window/storage boundaries and a validated parent/iframe postMessage protocol, see the [browser same-origin lesson](../senior_growth/General_ES6/Could_you_please_describe_with_which_Browser_APIs__177e8106c24d802caa88e9916f01fc53.md#same-origin-policy-which-boundary-is-being-protected). CORS permission does not grant those other capabilities.

### Simple request versus preflight

Some cross-origin requests using safelisted methods, headers, and content types can be sent without preflight. Other requests first send `OPTIONS`.

Common preflight triggers include:

- `PUT`, `PATCH`, `DELETE`, or `QUERY`.
- `Authorization` or other non-safelisted request headers.
- JSON `Content-Type: application/json`.
- Other conditions outside the CORS safelist.

```mermaid
sequenceDiagram
    participant Browser
    participant API
    Browser->>API: OPTIONS /users<br/>Origin + requested method/headers
    API-->>Browser: 204 + allow-origin/methods/headers
    alt Permission granted
        Browser->>API: Actual POST /users
        API-->>Browser: Response + allow-origin
    else Permission denied
        Browser->>Browser: Block actual request or response access
    end
```

### Main response headers

| Header                             | Purpose                                                        | Example                          |
| ---------------------------------- | -------------------------------------------------------------- | -------------------------------- |
| `Access-Control-Allow-Origin`      | Origin allowed to read response                                | `https://app.example.com` or `*` |
| `Access-Control-Allow-Methods`     | Methods allowed for preflighted request                        | `GET, POST, PATCH, DELETE`       |
| `Access-Control-Allow-Headers`     | Non-safelisted request headers permitted                       | `Content-Type, Authorization`    |
| `Access-Control-Allow-Credentials` | Permit cookies/client credentials in cross-origin exchange     | `true`                           |
| `Access-Control-Expose-Headers`    | Response headers browser JS may read beyond safelisted headers | `ETag, X-Request-Id`             |
| `Access-Control-Max-Age`           | How long browser may cache preflight permission                | `86400`                          |
| `Vary: Origin`                     | Ensure caches distinguish origin-dependent responses           | `Origin`                         |

### Safe allowlist implementation

```ts
import type { IncomingMessage, ServerResponse } from 'node:http';
const allowedOrigins = new Set(['https://app.example.com', 'https://admin.example.com']);
const allowedMethods = new Set(['GET', 'POST', 'PATCH', 'DELETE']);
const allowedHeaders = new Set(['content-type', 'authorization']);

export function appendVary(response: ServerResponse, ...names: string[]): void {
  const current = response.getHeader('Vary');
  const entries = (Array.isArray(current) ? current.join(',') : String(current ?? ''))
    .split(',').map(x => x.trim()).filter(Boolean);
  if (entries.includes('*')) return;
  const seen = new Set(entries.map(x => x.toLowerCase()));
  for (const name of names) if (!seen.has(name.toLowerCase())) {
    entries.push(name); seen.add(name.toLowerCase());
  }
  response.setHeader('Vary', entries.join(', '));
}
export function applyCors(request: IncomingMessage, response: ServerResponse): boolean {
  const origin = request.headers.origin;
  // Always vary this origin-dependent endpoint, including denied and absent Origin variants.
  appendVary(response, 'Origin');
  const allowed = typeof origin === 'string' && allowedOrigins.has(origin);
  if (allowed) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Access-Control-Expose-Headers', 'ETag, X-Request-Id');
  }
  const requestedMethod = request.headers['access-control-request-method'];
  // An ordinary OPTIONS request without preflight metadata continues to routing.
  if (request.method !== 'OPTIONS' || requestedMethod === undefined) return false;
  appendVary(response, 'Access-Control-Request-Method', 'Access-Control-Request-Headers');
  response.setHeader('Cache-Control', 'no-store');
  const rawHeaders = request.headers['access-control-request-headers'];
  const requestedHeaders = typeof rawHeaders === 'string' ? rawHeaders.split(',').map(x => x.trim().toLowerCase()) : [];
  const token = /^[!#$%&'*+.^_`|~0-9a-z-]+$/;
  if (!allowed || typeof requestedMethod !== 'string' || !allowedMethods.has(requestedMethod) ||
      (rawHeaders !== undefined && typeof rawHeaders !== 'string') ||
      requestedHeaders.some(x => !token.test(x) || !allowedHeaders.has(x))) {
    response.writeHead(403); response.end(); return true;
  }
  response.writeHead(204, {
    'Access-Control-Allow-Methods': [...allowedMethods].join(', '),
    'Access-Control-Allow-Headers': [...allowedHeaders].join(', '),
    'Access-Control-Max-Age': '600'
  });
  response.end(); return true;
}
```

Call it before routing:

```ts
if (applyCors(request, response)) return;
```

This example owns CORS headers on an origin-dependent endpoint; do not combine conflicting CORS middleware. Vary merges existing Accept-Encoding/other values case-insensitively and preserves Vary:*. Apply it to denied and no-Origin variants too, because a shared cache might otherwise reuse their missing allow-origin header. Preflight validates requested method/header tokens rather than blindly reflecting arbitrary values. Ordinary OPTIONS continues to routing.

A non-browser caller with no Origin still requires authentication/authorization; missing CORS permission does not prohibit the request. Browser cookie/SameSite/preflight/cache behavior must be verified in a real consumer; server header tests alone do not establish browser enforcement. Production middleware handles further edge cases, but its policy still needs deliberate configuration.

### Credentials and wildcard origins

Credentialed cross-origin requests cannot use `Access-Control-Allow-Origin: *`. Return the validated requesting origin and `Access-Control-Allow-Credentials: true`.

Browser request:

```ts
await fetch('https://api.example.com/profile', {
  credentials: 'include',
});
```

Cookies also need appropriate `SameSite`, `Secure`, domain, and path attributes. CORS permission alone does not guarantee a cookie is sent.

### CORS debugging checklist

1. Compare the page and API scheme, hostname, and port.
2. Inspect the browser's `OPTIONS` request and response.
3. Confirm the exact `Origin` is allowed.
4. Confirm requested method and headers are allowed.
5. Add CORS headers to the actual response as well as the preflight.
6. Check credential mode and wildcard incompatibility.
7. Check `Vary: Origin` when dynamically echoing origins.
8. Confirm redirects do not move the request to an unallowed origin.
9. Check proxy/gateway behavior, not only application code.
10. Remember that a browser “CORS error” can mask a failed preflight or network/TLS problem.

---

## Security, reliability, and operations {#_16-security-reliability-and-operations}

### Input boundaries

Treat all network input as untrusted:

- Method and request target.
- Headers and cookies.
- Query and path parameters.
- Body bytes and decoded JSON.
- WebSocket messages.
- Upstream HTTP responses.
- DNS results and certificate identities.

Validate syntax, type, range, allowed values, size, and authorization at appropriate boundaries.

### Size and resource limits

| Resource          | Limit to consider                                  |
| ----------------- | -------------------------------------------------- |
| Request headers   | Count and total size                               |
| JSON/form body    | Maximum bytes and nesting/complexity               |
| File upload       | Per-file and total size, count, content validation |
| URL/query         | Length and number of parameters                    |
| WebSocket         | Frame/message size and messages per interval       |
| TCP protocol      | Frame length and buffered incomplete data          |
| Outbound response | Maximum collected body if not streaming            |
| Concurrent work   | Connections, requests, upstream calls, queue depth |

Streams do not protect against unbounded input unless you enforce limits.

### Authentication versus authorization

```text
authentication: Who is the caller?
authorization:  May this caller perform this action on this resource?
```

Perform authorization at the resource/action boundary. A valid token is not permission to access every object.

### SSRF prevention

If user input influences an outbound URL:

- Prefer allowlisted destinations.
- Restrict schemes to expected values.
- Reject embedded credentials.
- Resolve and block private/link-local/metadata destinations where applicable.
- Revalidate redirects.
- Control ports.
- Apply timeouts and response-size limits.
- Consider DNS rebinding and resolution changes.

Parsing with `new URL()` is necessary but not sufficient.

### Logging and observability

Record structured, safe context:

- Request/correlation ID.
- Method and normalized route template.
- Status code.
- Duration.
- Response size.
- Authenticated principal identifier where policy permits.
- Upstream name, status, and latency.
- Error code/class without secrets.

Avoid logging access tokens, passwords, session cookies, full sensitive query strings, private keys, and unrestricted bodies.

### Failure handling

- Set deadlines for inbound and outbound work.
- Cancel abandoned operations.
- Retry only safe/idempotent operations under a bounded policy.
- Use circuit breaking/load shedding when dependencies fail at scale.
- Return stable client-safe errors.
- Do not expose internal exceptions.
- Clean up sockets, timers, streams, and subscriptions.
- Degrade readiness when the instance cannot serve correctly.
- Shut down gracefully during deployments.

### Testing network code

Test at several boundaries:

| Test type   | Useful coverage                                                      |
| ----------- | -------------------------------------------------------------------- |
| Unit        | URL parsing, validation, route matching, cache policy, error mapping |
| Integration | Raw HTTP handler or app with real middleware/service/repository      |
| Contract    | Request/response schema compatibility with another service           |
| E2E         | Critical flow through public API and controlled infrastructure       |
| Load        | Concurrency, throughput, backpressure, timeouts, resource limits     |
| Security    | AuthZ, injection, traversal, SSRF, oversized input, CORS policy      |

Use ephemeral ports and close servers/sockets so tests terminate cleanly.

---

## Timeout budgets, retries, and idempotency {#_17-timeout-budgets-retries-and-idempotency}

Every network operation needs a finite time budget. Otherwise one slow dependency can hold sockets, memory, and request capacity indefinitely.

### One budget, several stages

```text
client budget: 2000 ms
├─ DNS + connection + TLS: up to 300 ms
├─ dependency attempt 1: up to 700 ms
├─ optional backoff: 100 ms
├─ dependency attempt 2: up to 700 ms
└─ response/cleanup reserve: 200 ms
```

Independent two-second timeouts at every layer can exceed the caller's total deadline. Propagate one deadline or remaining budget through the call tree.

### Abort a fetch

```ts
async function fetchJson(url: URL, signal: AbortSignal) {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    await response.body?.cancel();
    throw new HttpError(response.status);
  }

  return response.json();
}

const result = await fetchJson(url, AbortSignal.timeout(1_500));
```

**What it does:** gives the complete fetch a finite caller-controlled deadline and rejects non-success HTTP status codes explicitly.

**When to use it:** apply timeouts to every outbound request. A successful TCP/HTTP exchange can still return an application failure status.

### Retry only eligible failures

Potentially retryable:

- transient connection failure;
- `408`, `429`, or selected `5xx` responses;
- a dependency timeout when the operation is safe to repeat.

Usually not retryable:

- validation failure;
- authentication or authorization failure;
- most `4xx` responses;
- a non-idempotent write with an unknown outcome;
- overload when retrying would make the incident worse.

Use exponential backoff with jitter. Cap attempts and total elapsed time. Honor `Retry-After` when appropriate.

### Idempotency keys

```http
POST /payments
Idempotency-Key: 01JABC...
Content-Type: application/json
```

The server stores the key with a request fingerprint and final result.

Repeated requests with the same key and equivalent input return the original result. Reuse with different input is rejected.

**When to use it:** idempotency keys make retried create/command operations safer when clients may lose the response after the server commits the work.

The idempotency record and business write must share a reliable atomic boundary. Otherwise both requests may execute before either record becomes visible.

### Retry amplification

If a client, gateway, service, and database layer each retry three times, one user request can create many downstream attempts. Define retry ownership. Record attempt counts and total time.

---

## Connections, proxies, and network diagnostics {#_18-connections-proxies-and-network-diagnostics}

### Connection reuse

Creating a new TCP and TLS connection for every request adds latency and CPU cost. Reuse connections through a configured HTTP client/agent when the runtime and protocol allow it.

Connection pools need limits:

- maximum connections per origin;
- idle timeout;
- connection lifetime where needed;
- queue timeout;
- DNS behavior;
- metrics for active, idle, and queued requests.

Unlimited connection creation can move overload from your process to the dependency.

### Reverse proxies

A reverse proxy may terminate TLS, balance traffic, compress responses, or set forwarding headers.

Do not trust `X-Forwarded-For`, `X-Forwarded-Proto`, or similar headers from arbitrary clients. The edge proxy must replace or sanitize them. The application must trust only the known proxy topology.

Incorrect proxy trust can break:

- secure-cookie decisions;
- generated absolute URLs;
- IP-based rate limits;
- audit records;
- redirect behavior.

### Diagnose by layer

| Symptom | Likely layers to inspect |
| --- | --- |
| Name does not resolve | DNS configuration, resolver, cache |
| Connection refused | Host/port, listener, firewall, readiness |
| TLS validation error | Hostname, certificate chain, time, trust store |
| Connection reset | Peer/proxy timeout, crash, forced shutdown |
| Slow first byte | Server queue, dependency time, network latency |
| Slow body | Streaming producer, bandwidth, backpressure |
| Intermittent `502`/`503` | Proxy health, rollout, overload, dependency failure |
| Requests hang | Missing deadline, pool queue, unread body, stalled socket |

Record durations for DNS/connect/TLS/first-byte/body when the client library exposes them. A single “request took 5 seconds” measurement cannot identify the slow stage.

### Diagnostic exercise

[Exercises and learner checklist](../practice/node-js/module-05-networking.md).

## Final review checklist {#_19-final-review-checklist}

[Exercises and learner checklist](../practice/node-js/module-05-networking.md).

### One-minute recap

Networked Node.js applications sit on layered contracts: DNS finds endpoints, TCP carries bytes, TLS secures connections, HTTP defines request-response semantics, and REST constrains how resources are exposed. Node's `http` module maps requests to readable streams and responses to writable streams; `fetch()` is the default high-level outbound client, while `https`, `net`, and `dns` expose lower-level control.

Good APIs choose methods and status codes according to semantics, parse URLs with standard classes, validate and bound all input, and return consistent representations. Caching uses freshness directives and validators; HATEOAS advertises navigation; CORS grants browser origins permission to read cross-origin responses. Production correctness also requires TLS trust, authorization, deadlines, backpressure, observability, graceful shutdown, and careful retry behavior.


## Boundary failure labs {#_20-boundary-failure-labs}

[Exercises and learner checklist](../practice/node-js/module-05-networking.md).
