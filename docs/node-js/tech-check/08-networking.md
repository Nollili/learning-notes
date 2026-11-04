---
outline: [2, 3]
---

# Networking and real-time applications

This chapter covers node:net, IP/TCP/UDP, HTTPS and DNS on Node.js24.18.0. Executable network fixtures bind only to loopback and request ephemeral ports; no public service or port is required. It also covers WebSockets, Socket.IO, HTTP inspection, browser interaction and owned client pooling. All ten currently mapped Networking subtopics have study material; learner practice remains separate.

These local teaching clients/servers are not production deployment templates. Validation of the real-time examples used ws8.22.1 and socket.io/socket.io-client4.8.4 installed with an isolated temporary lockfile; no repository dependencies were added. Those are tested versions, not a claim that any major-version range is permanently compatible or secure.

### How do TCP sockets differ from HTTP request handling, and how should connection lifetime be owned? {#t08-q01}

*Study depth: Intermediate*

<span class="notes-section-label">**Example — identify the completion, byte and lifetime boundaries**</span>

Save as `tcp.mjs`. The protocol is one ASCII greeting of at most64 bytes, terminated by EOF. It is deliberately not a general chat or request protocol.

```js
import { createServer, createConnection } from 'node:net';
import { once } from 'node:events';
export async function readGreeting(port, timeoutMs = 1000) {
  if (!Number.isInteger(port) || port < 1 || port > 65535 ||
      !Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 60_000) {
    throw new TypeError('invalid endpoint or budget');
  }
  const socket = createConnection({ host: '127.0.0.1', port });
  const deadline = setTimeout(() => socket.destroy(new Error('greeting deadline')), timeoutMs);
  const chunks = [];
  let size = 0;
  try {
    for await (const chunk of socket) {
      if (chunk.length > 64 - size) throw new Error('greeting too large');
      size += chunk.length; chunks.push(chunk);
    }
    return Buffer.concat(chunks, size).toString('ascii');
  } finally {
    clearTimeout(deadline);
    socket.destroy();
  }
}
const server = createServer(socket => {
  socket.on('error', () => {}); // Fixture owns accepted-socket errors.
  socket.setTimeout(1000, () => socket.destroy());
  socket.end('hello');
});
server.listen(0, '127.0.0.1');
try {
  await once(server, 'listening');
  console.log(await readGreeting(server.address().port));
} finally {
  if (server.listening) await new Promise((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
  });
}
```

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

node:net exposes TCP byte streams and local IPC connections; HTTP adds a standardized application message protocol over a transport. **TCP preserves byte order, not application message boundaries**. **Define framing, maximum bytes, completion and deadlines before parsing**.

Own connect/read/write errors and close every accepted/client socket. socket.end finishes the writable side; destroy aborts the connection. **A socket timeout event does not close it automatically**, and **closing a listening server does not automatically terminate all existing TCP connections**.

</div>

<span class="notes-section-label">**Detailed explanation**</span>

The fixture prints hello only after EOF. The client accepts arbitrary chunking, accumulates no more than64 logical bytes and has a total deadline spanning connection plus body. A peer that sends a partial greeting and stays open cannot make that call wait forever while the loop progresses. The accepted-socket inactivity timeout is a separate fixture guard.

Timer deadlines do not preempt blocked JavaScript and allow some scheduling delay.

TCP is full-duplex: receiving end means the peer ended its sending direction, not necessarily that all local writes completed. A successful socket.write accepts bytes into a sending path; it is not proof the remote application processed them. Respect write(false)/drain for ongoing sending and coordinate failures.

Keepalive probes can help detect some dead connections but are not an application response deadline or a health check.

EOF framing permits one response per connection here. Persistent protocols usually need length prefixes, fixed records or delimiters with escaping. Handle split/coalesced frames, maximum declared lengths, invalid encoding and truncated final frames before allocating unbounded storage. TLS encrypts a byte stream but does not add your application's records.

Prefer an established HTTP/database protocol over custom framing when that fits the requirement.

The server's small known handler emits a fixed response and handles its owned errors silently only to keep fixture output deterministic. Production services need safe diagnostic codes, admission/connection limits and an accepted-socket ownership set for bounded shutdown.

A server close waits for existing connections; a malicious or broken peer may require explicit draining/deadlines/destruction. Do not copy an empty error handler as a complete operational policy.

<span class="notes-section-label">**Common mistakes**</span>

- Treating each data chunk as one complete message.
- Assuming write success means remote business success or timeout means automatic close.
- Closing only the listener while accepted sockets remain alive.
- Using raw net for HTTPS without the TLS/HTTP layers.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**What distinguishes connection refused from a protocol timeout?**</span> Refusal means the transport connection could not be established at that endpoint; a protocol timeout may occur after connection while awaiting completion. Record the actual phase/code.
2. <span class="notes-section-label">**Does port0 mean a permanent public endpoint?**</span> No. During bind it asks the OS for an available local port; read server.address after listening.
3. <span class="notes-section-label">**Can net also use local IPC?**</span> Yes, Unix-domain sockets/named-pipe endpoints have separate naming/platform rules; they are not Internet TCP ports.

::: tip Key takeaway
A socket is a transport resource; message meaning and lifetime belong to the application protocol.
:::


---

### How do IP addressing and UDP datagrams differ from TCP streams? {#t08-q02}

*Study depth: Intermediate*

<span class="notes-section-label">**Example — receive one owned loopback datagram**</span>

Save as `udp.mjs`. The deadline supervises this one-datagram experiment; it is not an Internet reliability implementation.

```js
import { createSocket } from 'node:dgram';
import { isIP } from 'node:net';
import { once } from 'node:events';
const receiver = createSocket('udp4');
const sender = createSocket('udp4');
const controller = new AbortController();
receiver.on('error', error => controller.abort(error));
sender.on('error', error => controller.abort(error));
const deadline = setTimeout(() => controller.abort(), 1000);
try {
  receiver.bind(0, '127.0.0.1');
  await once(receiver, 'listening', { signal: controller.signal });
  const packet = once(receiver, 'message', { signal: controller.signal });
  const observed = packet.catch(error => ({ error }));
  await new Promise((resolve, reject) => {
    sender.send(Buffer.from('ping'), receiver.address().port, '127.0.0.1',
      error => error ? reject(error) : resolve());
  });
  const result = await observed;
  if (result.error) throw result.error;
  const [message, peer] = result;
  console.log(message.toString('ascii'), peer.family, isIP(peer.address));
} finally {
  clearTimeout(deadline);
  controller.abort();
  await Promise.all([receiver, sender].map(socket => new Promise((resolve, reject) => {
    try { socket.close(resolve); }
    catch (error) {
      if (error.code === 'ERR_SOCKET_DGRAM_NOT_RUNNING') resolve();
      else reject(error);
    }
  })));
}
```

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

IP addresses identify network interfaces/endpoints, and transport ports distinguish application endpoints. TCP offers an ordered reliable byte stream; **UDP exposes individual datagrams without guaranteeing delivery, ordering or uniqueness**. node:dgram handles UDP, while node:net handles TCP/local IPC.

Choose IPv4/IPv6 binding intentionally; **loopback and wildcard binding have different exposure**. **A UDP send callback reports local send completion, not remote receipt or processing**. Reliability, authentication, size limits and congestion behaviour need a protocol above UDP when required.

</div>

<span class="notes-section-label">**Detailed explanation**</span>

Output is `ping IPv4 4`. A successful receive observes one datagram and its sender metadata. This result does not establish that arbitrary Internet datagrams arrive, or that a sender address is an authenticated identity. Register the message observer before sending so a quick reply cannot be missed, and close both socket owners afterward.

The example's short payload avoids fragmentation questions rather than resolving them.

TCP can split or coalesce application writes; UDP preserves datagram message boundaries at its API, but packets can be lost, reordered, duplicated or constrained by size/MTU and platform receive behaviour. IP fragmentation can make large messages fragile.

Keep datagrams small according to the actual protocol/path, and do not present the theoretical UDP payload maximum as a sensible universal network size.

Binding127.0.0.1 restricts this IPv4 fixture to loopback. Binding0.0.0.0 can expose all IPv4 interfaces; :: may also permit IPv4-mapped connections depending on platform/options. IPv6 literals in URLs require brackets. isIP validates literal syntax, not reachability or access policy; a hostname is not an IP literal and DNS introduces additional decisions.

A connected UDP socket selects a peer/filtering relationship; it **does not create TCP-style reliability or an encrypted session**.

Application acknowledgements, sequence numbers, duplicate suppression and retry/backoff may be needed, but implementing those naively can amplify congestion or repeat side effects. Prefer an established protocol/library if reliability/security matters.

Public UDP services also need rate limits, source validation appropriate to the protocol and amplification/reflection protections. The fixture does not implement those controls and must not be exposed as a public echo service.

<span class="notes-section-label">**Common mistakes**</span>

- Treating UDP send completion as delivery acknowledgement.
- Treating an IP literal, reverse DNS or sender address as authenticated identity.
- Binding a demonstration to every interface without intending exposure.
- Rebuilding reliable transport with unrestricted retry/large datagrams.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Does UDP connect perform a TCP handshake?**</span> No; it associates a default peer and affects socket behaviour without creating a reliable byte stream.
2. <span class="notes-section-label">**Does localhost always mean127.0.0.1?**</span> No. Resolution can return IPv6 or several addresses; bind/connect family must be compatible.
3. <span class="notes-section-label">**Why use an ephemeral port here?**</span> It avoids assuming a fixed test port is free; readiness still has to be awaited before sending.

::: tip Key takeaway
Addressing, transport guarantees and authenticated application identity are separate layers.
:::


---

### What must an HTTPS client validate and supervise beyond receiving headers? {#t08-q03}

*Study depth: Intermediate*

<span class="notes-section-label">**Example — inspect the full response lifetime**</span>

Save as `https-client.mjs`. This exports a small client rather than contacting a public site. Invoke it against an owned TLS fixture with a certificate containing its requested DNS/IP identity; pass only that fixture's trusted CA/certificate as ca. For a normal public trust store, leave ca undefined.

```js
import { get } from 'node:https';
import { once } from 'node:events';
export async function getSmallHttps(input, ca, timeoutMs = 1000) {
  const url = new URL(input);
  if (url.protocol !== 'https:' || url.username || url.password ||
      !Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 60_000) {
    throw new TypeError('invalid HTTPS input or budget');
  }
  const request = get(url, { ca, agent: false, rejectUnauthorized: true });
  // Keep a request error owner after once removes its pre-header error listener.
  // Pre-header errors reject once; post-header destruction fails the body stream.
  request.on('error', () => {});
  const timer = setTimeout(() => request.destroy(new Error('HTTPS deadline')), timeoutMs);
  try {
    const [response] = await once(request, 'response');
    if (response.statusCode !== 200) {
      response.destroy();
      throw new Error('unexpected HTTP status');
    }
    const chunks = [];
    let bytes = 0;
    for await (const chunk of response) {
      if (chunk.length > 1024 - bytes) throw new Error('HTTPS body limit');
      bytes += chunk.length; chunks.push(chunk);
    }
    return Buffer.concat(chunks, bytes).toString('utf8');
  } finally {
    clearTimeout(timer);
    request.destroy();
  }
}
```

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

HTTPS carries HTTP over TLS. **Validate certificate trust, validity and the intended hostname/IP**; never disable rejection to hide a certificate failure. TLS protects the channel and certificate identity, **not user authorization or application correctness**.

An HTTPS client must also handle connection/TLS errors, HTTP status, bounded body consumption and cancellation/deadline cleanup. **Headers are not the end of the response lifetime**. Redirect and retry policies are explicit application decisions, and **completed writes may require reconciliation before retry**.

</div>

<span class="notes-section-label">**Detailed explanation**</span>

For a matching trusted local fixture returning200 and a short body, the helper resolves with that body. It rejects untrusted/mismatched certificates, non200 status, excessive bytes, broken bodies and deadline expiry.

It does not follow redirects: a3xx response hits its status policy. agent:false gives each demonstration request an individually owned connection instead of changing global agent state. Production connection pooling should have a reviewed owner and capacity/lifetime policy.

The timer covers connection, handshake and body. Request destruction during an active response must result in response failure rather than leaving a detached read; test a server that sends headers then stalls. The one-shot response wait handles an error before headers. Once response consumption begins, that response's stream errors are observed by iteration.

A byte cap limits accepted body retention, not all lower-layer allocations or synchronous decoding cost. This helper assumes tolerated UTF-8 text; content-type/schema/strict encoding and decompression budgets would be separate requirements.

Trust and identity are both required: trusting a test certificate does not authorize it for a different host. Supply a narrowly scoped fixture CA rather than changing NODE_TLS_REJECT_UNAUTHORIZED or global trust. Replacing a checkServerIdentity implementation must preserve equivalent validation; an always-successful callback is not a safe workaround.

SNI selects the intended virtual TLS service, while certificate checks establish identity; neither is user authentication. mTLS adds client certificate validation but still requires application permissions.

TLS1.3 is preferred where supported; TLS1.2 remains a compatibility choice under current reviewed policy. Do not re-enable obsolete SSL/TLS versions to silence errors. Production deployments may terminate TLS at a proxy; secure the proxy-to-service hop for its threat model and trust forwarded metadata only from configured proxies.

URL parsing does not authorize outbound destinations: SSRF/DNS/redirect restrictions remain application work, not something this small helper claims to implement.

<span class="notes-section-label">**Common mistakes**</span>

- Setting rejectUnauthorized:false, trusting every certificate or ignoring identity mismatch.
- Clearing the deadline at headers while a body can stall indefinitely.
- Treating an HTTP500 as a TLS failure or TLS success as authorization.
- Retrying non-idempotent writes without knowing their outcome.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Does HTTPS hide the path from the destination server?**</span> No. TLS protects traffic on its hops; the terminating peer can read the HTTP message and may log it.
2. <span class="notes-section-label">**Can a trusted certificate match the wrong hostname?**</span> It can be trusted yet invalid for the requested identity; both checks must pass.
3. <span class="notes-section-label">**Why inspect status separately?**</span> A valid secure connection can carry any HTTP status; transport success and business success are different outcomes.

::: tip Key takeaway
Validate the peer and own the entire HTTP exchange, including its body and failure paths.
:::


---

### How do lookup and resolve differ, and what does a DNS answer prove? {#t08-q04}

*Study depth: Intermediate*

<span class="notes-section-label">**Example — inspect address results without external DNS**</span>

Save as `dns.mjs`. The default invocation uses an IP literal; injected lookup allows deterministic diagnostics/tests without replacing global DNS configuration.

```js
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
export async function addressCandidates(host, lookupAddress = lookup) {
  if (typeof host !== 'string' || !host || host.length > 253) throw new TypeError('invalid host');
  const answers = await lookupAddress(host, { all: true, order: 'verbatim' });
  if (!Array.isArray(answers) || answers.length === 0 || answers.some(item =>
    !item || (item.family !== 4 && item.family !== 6) || isIP(item.address) !== item.family)) {
    throw new Error('invalid address result');
  }
  return answers;
}
console.log(JSON.stringify(await addressCandidates('127.0.0.1')));
```

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

**lookup uses OS name-resolution facilities**, which can include hosts/system policy rather than a DNS packet. resolve4/resolve6 and other **resolve methods query DNS records through a resolver path** with different behaviour and results. DNS supplies mutable naming information, **not proof of reachability, TLS identity or permission to connect**.

Handle multiple families, ordering, TTL/cache policy and resolver errors. Use scoped Resolver instances for custom servers rather than changing unrelated global settings, and **bound the owning connection/request lifetime separately**.

</div>

<span class="notes-section-label">**Detailed explanation**</span>

The fixture reports one IPv4 record for127.0.0.1. Literal resolution exercises result shape, not external DNS availability. Injection tests should explicitly distinguish a synthetic answer from a real resolver integration result. Input validation here limits the helper's diagnostic contract; it is not a complete hostname validator, authorization boundary or SSRF defense.

lookup normally uses system getaddrinfo through the native worker pool; specific resolve queries use network resolver machinery. Consequently heavy native-pool work can delay lookup without a DNS server problem. resolve4 with ttl:true can return address/TTL records; lookup does not expose equivalent authoritative TTL data.

Neither choice is a universal substitute for the other. DNS queries may use a recursive configured resolver; the result is not automatically an authoritative-server reply or DNSSEC validation proof.

A/AAAA records describe addresses; MX includes mail-exchange priority, SRV supplies service discovery fields and TXT returns text chunks. Parse the selected record's documented shape, not a generic array-of-strings assumption. Preserve TXT chunk grouping when the protocol requires it.

NXDOMAIN/ENOTFOUND, no-data responses and transient resolver failures need different diagnostic/retry policies; avoid blindly retrying every error forever.

A dual-stack result can contain several IPv4/IPv6 choices. Do not assume the first one is reachable, permanent or preferred on every deployment. State order/fallback policy and use the connection API's supported address-family behaviour rather than inventing correctness from one sample.

Cache under an explicit TTL/negative-cache policy and consider connection reuse; changing DNS does not necessarily move an already established connection.

For outbound restrictions, checking one DNS answer then allowing a later independent lookup introduces a time-of-check/use gap. Validate the actual connected destination, redirects and relevant address families under a reviewed policy; DNS names and private-range checks require careful threat modeling.

Resolver.cancel can cancel outstanding queries on that resolver, not arbitrary lookup or an already connected socket. A promise race alone does not stop the native lookup; retain supervision of that work.

<span class="notes-section-label">**Common mistakes**</span>

- Assuming lookup always sends a DNS query or resolve behaves like the OS hosts configuration.
- Treating a DNS name/address as TLS or application identity.
- Hardcoding one result forever or ignoring family/fallback/caching.
- Changing global resolver configuration in a reusable helper or test.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Does successful resolution prove an open service?**</span> No. Routing, port availability, TLS and the application can all fail afterward.
2. <span class="notes-section-label">**Why record the phase?**</span> Resolver latency, connection refusal, handshake failure and response timeout require different evidence and fixes.
3. <span class="notes-section-label">**Does reverse DNS authorize a peer?**</span> No. A reverse name is naming data, not a verified application credential.

::: tip Key takeaway
Choose the resolution contract deliberately and validate the actual connection/security outcome separately.
:::

## practice — learner work remains required {#b15-practice--learner-work-remains-required}

- [ ] Test TCP greeting split/coalesced writes, EOF, oversize, refused connection and a connected peer that stalls. Close listener and every accepted/client socket.
- [ ] Run the UDP fixture on loopback and test cancellation without a datagram. Explain send callback versus remote receipt and IPv4/IPv6 exposure limits.
- [ ] Create disposable TLS fixture keys/certificates with the requested SAN; keep them outside the repository. Verify trusted matching success, untrusted chain, wrong identity, non200, oversized/truncated body and headers-then-stall deadline. Never disable certificate checks.
- [ ] Test injected DNS multiple-family results, malformed results and resolver failure; run a controlled resolver integration separately before claiming actual DNS coverage. Explain TTL and connection reuse.

Acceptance: assert results, failure phase/code, bounded completion and owned cleanup. No public endpoint, production key, real credential or global resolver/TLS setting is needed. Loopback and injected tests do not prove public routing, DNS infrastructure, platform matrices or learner performance.

Official references checked2026-11-04: Node24.18 [Net](https://nodejs.org/download/release/v24.18.0/docs/api/net.html), [UDP](https://nodejs.org/download/release/v24.18.0/docs/api/dgram.html), [HTTPS](https://nodejs.org/download/release/v24.18.0/docs/api/https.html), [TLS identity checks](https://nodejs.org/download/release/v24.18.0/docs/api/tls.html#tlscheckserveridentityhostname-cert), [DNS](https://nodejs.org/download/release/v24.18.0/docs/api/dns.html); OWASP [TLS guidance](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html). Primary application stack remains HTTP/HTTPS; raw sockets are for requirements that justify their protocol complexity.


---

### When should a service use polling, SSE, WebSocket or Socket.IO? {#t08-q05}

*Study depth: Intermediate*

<span class="notes-section-label">**Example — choose and defend a transport before reading the answer**</span>

A product has a job-progress dashboard that changes every few seconds, an administrative audit feed and a collaborative editor with frequent client commands. Which transport fits each interaction, and what happens after a disconnect?

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Start from direction, latency, delivery and operational requirements. **Conditional polling uses ordinary HTTP and is often enough for infrequent changes**. **SSE supplies a one-way UTF-8 event stream** to browsers; commands can still use HTTP. **WebSocket supports bidirectional messages** but requires explicit connection, recovery and flow-control contracts.

Socket.IO is a separate event protocol/library with reconnection, acknowledgements and grouping conveniences, **not a wire-compatible WebSocket replacement**. **None supplies durable business delivery merely by staying connected**. Keep HTTP/HTTPS as the primary API unless another interaction justifies its cost.

</div>

<span class="notes-section-label">**Detailed explanation**</span>

For occasional job progress, completion-driven polling with a bounded interval and conditional requests is a reasonable initial choice. SSE fits a continuous authorized audit-view stream if latency and infrastructure support warrant it. A durable audit record still belongs in storage rather than only in the connection.

Frequent editor commands/updates can justify WebSocket or Socket.IO, but conflict resolution and command durability remain application design. If updates are replaceable snapshots, coalesce old states rather than queue every intermediate one.

| Choice | Useful property | Failure/operation to design |
|---|---|---|
| Conditional polling | Ordinary requests, validators and familiar infrastructure | Staleness, nonoverlap, backoff/jitter, cancellation and request admission |
| SSE/EventSource | Server-to-client text events with browser reconnection | Replay cursor/history, reset gaps, proxy buffering, slow clients and heartbeat lifetime |
| WebSocket | Full-duplex framed messages on a persistent connection | Auth/Origin, schema, payload/rate/queue bounds, heartbeat, reconnect and application replay |
| Socket.IO4 | Event protocol, acks, reconnection, rooms/namespaces and transport choices | Compatible clients, explicit delivery guarantees, adapters, affinity and recovery limits |

SSE framing uses a blank line between events, optional event/id/retry fields and UTF-8 text. Last-Event-ID is a reconnect cursor mechanism, not retained storage. Define expired-history behaviour, such as obtaining a new authorized snapshot.

Native browser EventSource cannot set arbitrary authorization headers; use an intentional credential scheme rather than placing long-lived tokens in URLs. See the [worked SSE and bounded polling notes](../realtime-transports.md).

WebSocket preserves message boundaries above TCP and provides ordered delivery on an active connection, but not application receipt/commit evidence after a lost connection. Socket.IO adds its own framing and may select polling, WebSocket or other supported transports depending on version/configuration.

A plain WebSocket client cannot talk directly to its Socket.IO event API. Neither solves document merging, presence expiry, offline edits or per-resource permissions automatically.

<span class="notes-section-label">**Common mistakes**</span>

- Selecting WebSocket simply because a feature is described as real-time.
- Treating native SSE reconnection as durable replay or exactly-once effects.
- Assuming Socket.IO and WebSocket clients are interchangeable.
- Starting overlapping polling calls or buffering unlimited obsolete snapshots.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Can SSE coexist with POST commands?**</span> Yes. One-way events do not prevent ordinary authenticated HTTP commands; define their shared resource/version contract.
2. <span class="notes-section-label">**Does HTTP polling require a new TCP connection every time?**</span> No. HTTP clients can reuse suitable connections; request semantics and connection lifecycle are distinct.
3. <span class="notes-section-label">**What would change the initial choice?**</span> Measured traffic, latency/fan-out requirements, client support, ingress behaviour and the cost of replay/operations, not a transport's popularity.

::: tip Key takeaway
Choose the interaction and recovery contract first; then choose the simplest transport that satisfies it.
:::


---

### What must a WebSocket service own beyond a successful handshake? {#t08-q06}

*Study depth: Intermediate*

<span class="notes-section-label">**Example — bounded local echo protocol**</span>

Save as `websocket.mjs` in a standalone fixture with a pinned ws8 dependency. This exports a loopback-only unauthenticated lab, not a private-data service. Its allowed message is {id, text}; unknown fields and binary messages are rejected. The test harness must await listening and close/terminate every owned client before awaiting server closure.

```js
import { WebSocketServer, WebSocket } from 'ws';
export function createEcho() {
  const server = new WebSocketServer({ host: '127.0.0.1', port: 0,
    maxPayload: 1024, perMessageDeflate: false });
  server.on('connection', socket => {
    let closing = false, closeTimer;
    const close = (code, reason) => {
      if (closing || socket.readyState === WebSocket.CLOSED) return;
      closing = true;
      closeTimer = setTimeout(() => socket.terminate(), 200);
      socket.close(code, reason);
    };
    socket.on('error', () => close(1011, 'transport error'));
    socket.once('close', () => clearTimeout(closeTimer));
    socket.on('message', (raw, binary) => {
      if (closing) return;
      if (binary) { close(1003, 'text required'); return; }
      let value;
      try {
        value = JSON.parse(raw.toString('utf8'));
        if (!value || typeof value !== 'object' || Array.isArray(value) ||
            typeof value.id !== 'string' || !/^[a-zA-Z0-9_-]{1,32}$/.test(value.id) ||
            typeof value.text !== 'string' || value.text.length > 128 ||
            Object.keys(value).some(key => !['id', 'text'].includes(key))) {
          throw new Error('invalid schema');
        }
      } catch { close(1008, 'invalid message'); return; }
      const payload = JSON.stringify({ id: value.id, text: value.text });
      if (socket.bufferedAmount + Buffer.byteLength(payload) > 4096) {
        close(1008, 'slow consumer'); return;
      }
      socket.send(payload, error => { if (error) close(1011, 'send failure'); });
    });
  });
  return server;
}
```

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

A WebSocket connection provides framed bidirectional messages after protocol negotiation, **not a complete application session**. Own admission/authentication, browser Origin validation where relevant, **per-action authorization, schema/payload/rate limits**, outbound queues, heartbeat, closure and recovery.

Node24 has a built-in WebSocket client, while a server needs a library/framework such as ws. Use WSS outside controlled local development. **Backpressure is not implicit in async message listeners**; bound pending work and define a slow-consumer policy. **Reconnection alone cannot recover missed business messages**.

</div>

<span class="notes-section-label">**Detailed explanation**</span>

A valid text message is echoed with only its projected fields. Invalid JSON/schema closes with1008, binary input with1003, and ws rejects excessive payload under maxPayload. A close timer escalates to terminate if cooperative closing stalls; the timer is removed once closed.

The outbound threshold is a local policy, not a proof of total memory bounds, and this tiny fixture does not implement rate/global admission, heartbeat or authentication. Do not expose it as a production example merely because its protocol checks pass.

Classic HTTP/1.1 WebSocket establishment uses an upgrade handshake; HTTP/2-compatible mechanisms have different negotiation details. After establishment, messages are not individual HTTP requests, so ordinary route/CORS middleware does not automatically authorize them.

Validate Origin to mitigate unwanted browser-origin connections, but a non-browser client can forge it; authenticate separately and check resource authorization at subscribe/action time. Avoid long-lived bearer tokens in URL logs.

For liveness, a ws server can track pong responses and terminate peers that miss a ping interval under a reviewed policy. Own the heartbeat timer and clear it during shutdown; browsers handle protocol pong without exposing a general JavaScript ping API.

A connected socket can be stale without a clean close event, and a transport-alive peer may still fail to apply business updates. Define application acknowledgements where needed.

Standard WebSocket APIs do not provide general application-level receive backpressure. Monitor send buffering, cap input/pending asynchronous work, coalesce replaceable updates or disconnect slow consumers. An async message callback is not awaited by EventEmitter.

Shutdown stops upgrades/new work, disposes subscriptions, closes clients and ultimately terminates leftovers before reporting complete. Reconnect with backoff/jitter, reauthenticate/resubscribe and recover from a cursor or snapshot; retain message IDs when command effects need deduplication.

<span class="notes-section-label">**Common mistakes**</span>

- Treating handshake success, Origin or ping/pong as per-resource authorization.
- Running unbounded asynchronous message handlers or ignoring bufferedAmount.
- Closing only the HTTP/listening server while upgraded clients remain active.
- Equating a reconnect with replay or a send callback with durable application commit.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Can a message span network chunks?**</span> Yes; the WebSocket library reassembles protocol messages. Still validate the resulting message and enforce its size limit.
2. <span class="notes-section-label">**Does perMessageDeflate always help?**</span> No. Compression adds CPU/memory and security trade-offs; the local lab disables it intentionally.
3. <span class="notes-section-label">**What should you test beyond callback mocks?**</span> Actual handshake, text/binary handling, payload rejection, close/error behaviour and cleanup on real owned sockets.

::: tip Key takeaway
A long-lived message channel requires an explicitly owned application session and bounded work.
:::


---

### What does Socket.IO add, and what do acknowledgements and reconnection actually guarantee? {#t08-q07}

*Study depth: Intermediate*

<span class="notes-section-label">**Example — an acknowledged event under a fixture-only identity**</span>

Save as `socketio.mjs` with pinned Socket.IO4. The caller supplies an owned unlistening node:http server, binds it to loopback/port0, then uses a matching socket.io-client. This fixed fixture token is a teaching gate, never a production credential design.

```js
import { Server } from 'socket.io';
export function attachEvents(httpServer) {
  const io = new Server(httpServer, { serveClient: false, maxHttpBufferSize: 1024 });
  io.use((socket, next) => {
    if (socket.handshake.auth?.token !== 'fixture-only') {
      next(new Error('unauthorized')); return;
    }
    socket.data.userId = 'fixture-user';
    next();
  });
  io.on('connection', socket => {
    socket.join('fixture-authorized-room');
    socket.on('double', (input, acknowledge) => {
      if (typeof acknowledge !== 'function') return;
      if (!input || typeof input !== 'object' || Array.isArray(input) ||
          typeof input.id !== 'string' || !/^[a-zA-Z0-9_-]{1,32}$/.test(input.id) ||
          !Number.isFinite(input.value) || Math.abs(input.value) > 1000 ||
          Object.keys(input).some(key => !['id', 'value'].includes(key))) {
        acknowledge({ ok: false, code: 'INVALID_INPUT' }); return;
      }
      acknowledge({ ok: true, id: input.id, value: input.value * 2 });
    });
  });
  return io;
}
```

A compatible client sends with `socket.timeout(1000).emit('double', {id:'a',value:3}, (error, reply) => ...)`. A successful reply is {ok:true,id:'a',value:6}; timeout means no acknowledgement was observed in that budget, not proof the server did nothing.

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Socket.IO is an event-oriented protocol/library above its selected transport, with compatible server/client implementations, reconnection, acknowledgements, rooms and namespaces. It is **not directly compatible with plain WebSocket clients**.

Ordering is guaranteed for events that arrive, but **default arrival semantics are at most once**; reconnection does not make missed server events durable. **Acknowledgements carry an application-chosen response**. Retry/ack options can repeat an event, so **side-effecting commands need stable IDs and durable idempotency/reconciliation**.

**Rooms and namespaces organize delivery, not authorization** by themselves.

</div>

<span class="notes-section-label">**Detailed explanation**</span>

Middleware executes for the incoming Socket.IO connection; it is not automatically rerun for every event. Authenticate via a real verifier in an application, expire/revoke sessions deliberately and reauthorize each relevant resource/action. A failed handshake can emit connect_error rather than a normal connected/disconnect lifecycle.

Always settle the middleware decision instead of leaving a connection hanging.

The lab joins only a fixed server-authorized room; it never trusts a client-supplied room name as a permission grant. socket.emit targets a peer, io.to(room).emit targets a group, and socket.to(room).emit excludes that sender. Namespaces separate logical channels/middleware but do not necessarily create separate underlying transport connections.

A socket ID is temporary connection identity, not a persistent authenticated user ID. Reconnection can produce a new identity and requires the right resubscription/recovery contract.

An ack proves whatever the handler defines: this handler only computed a deterministic value. It did not commit a database transaction or deduplicate a write. A command can commit and lose its ack, making a retry ambiguous; store an idempotency key, payload identity and outcome atomically with the effect when that is required.

Client retries can improve client-to-server arrival attempts, but pending in-memory events can disappear on tab refresh. Server replay needs persistence/cursors or another explicit mechanism.

For multiple nodes, a compatible adapter forwards broadcasts between instances. It does not by itself replace session affinity when HTTP long-polling is enabled: related polling requests need the owning session node. WebSocket-only configuration changes that affinity requirement but removes fallback and does not solve shared state/durable delivery.

Connection-state recovery is a version/adapter-dependent feature that can fail; design a snapshot/resync fallback. CORS rules concern browser HTTP polling; WebSocket admission still needs its own Origin/auth policy. Real deployment also needs heartbeat/proxy timeout alignment, admission/rate limits and bounded pending events.

<span class="notes-section-label">**Common mistakes**</span>

- Connecting a plain WebSocket client to Socket.IO and expecting event compatibility.
- Treating ack timeout as proof an action failed or retries as exactly-once delivery.
- Trusting room names/socket IDs as authenticated permissions.
- Adding an adapter and assuming it supplies durable replay, affinity and business consistency.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Does automatic reconnect restore every missed message?**</span> No. Use the documented recovery feature where supported and handle failure with application replay/snapshot semantics.
2. <span class="notes-section-label">**Can a server-side handler be asynchronous?**</span> Yes, but own its rejection and decide when to acknowledge; EventEmitter-style delivery does not supervise every returned promise automatically.
3. <span class="notes-section-label">**Why preserve ordinary HTTP?**</span> CRUD, downloads and many commands remain simpler through existing HTTP contracts even if live notifications use Socket.IO.

::: tip Key takeaway
Library conveniences reduce transport plumbing; delivery semantics and business correctness remain explicit design work.
:::


---

### How do you select and operate a real-time transport in production? {#t08-q08}

*Study depth: Intermediate*

<span class="notes-section-label">**Example — test sequence gaps rather than assuming the connection is complete**</span>

Save as `feed-state.mjs`. This pure state transition models one already-authorized stream epoch, where every next integer is expected. It is not a complete replay protocol or persistence layer.

```js
export function acceptEvent(state, event) {
  if (!state || !Number.isSafeInteger(state.cursor) || state.cursor < 0 ||
      !Number.isSafeInteger(state.completed) || state.completed < 0 ||
      !event || !Number.isSafeInteger(event.id) || event.id < 1 ||
      !Number.isSafeInteger(event.completed) || event.completed < 0) {
    throw new TypeError('invalid feed state or event');
  }
  if (event.id <= state.cursor) return { action: 'duplicate', state };
  if (event.id !== state.cursor + 1) return { action: 'resync', state };
  return { action: 'apply', state: { cursor: event.id, completed: event.completed } };
}
const initial = { cursor: 4, completed: 10 };
const first = acceptEvent(initial, { id: 5, completed: 11 });
console.log(first.action, first.state.cursor);
console.log(acceptEvent(first.state, { id: 5, completed: 11 }).action);
console.log(acceptEvent(first.state, { id: 7, completed: 13 }).action);
```

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Select a transport from direction, latency, fan-out, durability, client and infrastructure requirements, then test the real failure path. **Budget connections, message bytes, rate, active work, send queues, reconnect attempts and replay history**.

Authenticate and authorize resource subscriptions, propagate lifecycle cancellation, and **define snapshot/cursor recovery**. Deployments need suitable proxy timeouts, cross-instance distribution and bounded shutdown.

Measure handshake failures, active connections, queue depth, lag and reconnect storms; **a successful local echo is not a production capacity or delivery guarantee**.

</div>

<span class="notes-section-label">**Detailed explanation**</span>

Output is `apply 5`, duplicate and resync. A missing sequence triggers snapshot/replay rather than silently rendering an apparently complete state. A duplicate does not reapply the event. The assumptions are deliberate: this resource/epoch uses contiguous IDs and an absolute count.

Other feeds may have noncontiguous global IDs or versioned deltas and need a different gap rule. A restarted producer needs an epoch/version domain rather than resetting IDs and letting clients discard all new events as old.

**Snapshot plus subscription can race**: the snapshot may be read before an event is lost and before live subscription starts. Use a server-defined cursor/snapshot boundary with retained events, or subscribe/buffer under a bounded reconciliation protocol. State replacement must not let an old connection overwrite a newer session after cancellation.

Authorization changes can require disconnecting or rescoping an existing subscription; authenticating once at login is insufficient for every future resource update.

For the job dashboard, start with conditional HTTP unless evidence requires faster push. If using SSE, test proxy buffering, heartbeat cleanup, slow consumers and expired-history reset.

For collaboration, choose WebSocket when an interoperable minimal protocol fits; choose Socket.IO when its event/reconnect/room ecosystem justifies the coupled clients and deployment constraints. Neither supplies the document conflict algorithm or durable command log.

A broker adapter distributes live events; a durable outbox/log may be necessary to align committed state and published notifications.

Define overload behaviour before tuning: reject new sessions, coalesce replaceable updates, shed optional events or disconnect slow consumers under explicit budgets. Reconnect with backoff/jitter and avoid every client fetching a huge snapshot simultaneously after an outage.

Shutdown stops admission, detaches subscriptions, gives active clients a bounded close interval and terminates leftovers. Test through the intended TLS/ingress/load-balancer path and multiple instances; local tests do not establish that deployment. Keep sensitive tokens/message content out of routine diagnostic logs.

<span class="notes-section-label">**Common mistakes**</span>

- Promoting a local echo result into an uptime, capacity or delivery claim.
- Replaying without a history/epoch/authorization policy.
- Retaining unlimited disconnected-client events or reconnecting every client immediately.
- Comparing transports only by nominal latency while ignoring operations and correctness.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**What if cursor history expired?**</span> Signal a reset and obtain an authorized fresh snapshot under a defined boundary; do not pretend the missing events arrived.
2. <span class="notes-section-label">**Does shared pub/sub mean durable business delivery?**</span> No. Assess persistence, atomic publication, replay and consumer idempotency separately.
3. <span class="notes-section-label">**What evidence would justify switching transports?**</span> Representative end-to-end latency/traffic/failure measurements plus a documented benefit that outweighs migration and operating complexity.

::: tip Key takeaway
Production selection includes overload, recovery and deployment evidence, not only the normal message exchange.
:::


---

### How do you inspect an HTTP exchange without confusing transport, status and payload failures? {#t08-q09}

*Study depth: Intermediate*

<span class="notes-section-label">**Example — predict the status and body before running**</span>

Save as `http-inspection.mjs` and run with Node.js 24.18.0. This self-contained fixture serves only fixed, tiny responses on loopback. Predict what changes for a missing path, a HEAD request, an unsupported method and an empty success response.

```js
import { createServer } from 'node:http';
import { once } from 'node:events';

const representation = JSON.stringify({ id: 'p1', name: 'Book' });
const server = createServer((req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD', 'Content-Length': '0' });
    res.end();
    return;
  }
  if (req.url === '/empty') {
    res.writeHead(204);
    res.end();
    return;
  }
  const found = req.url === '/products/p1';
  const body = found ? representation : JSON.stringify({ error: 'NOT_FOUND' });
  res.writeHead(found ? 200 : 404, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(req.method === 'HEAD' ? undefined : body);
});

try {
  const listening = once(server, 'listening');
  server.listen(0, '127.0.0.1');
  await listening;
  const base = `http://127.0.0.1:${server.address().port}`;
  for (const [path, method] of [
    ['/products/p1', 'GET'], ['/missing', 'GET'],
    ['/products/p1', 'HEAD'], ['/products/p1', 'POST'], ['/empty', 'GET']
  ]) {
    const response = await fetch(base + path, {
      method, redirect: 'error', signal: AbortSignal.timeout(1000)
    });
    const text = await response.text();
    console.log(JSON.stringify({
      method, path, status: response.status, ok: response.ok,
      contentType: response.headers.get('content-type'),
      allow: response.headers.get('allow'), body: text
    }));
  }
} finally {
  if (server.listening) await new Promise((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
    server.closeAllConnections();
  });
}
```

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Inspect the method and target, request headers and body, then response status, headers and body. **A connection can succeed while HTTP reports an error**; **an HTTP success can still contain invalid application data**. **Fetch normally resolves for a 404 or 500**, so check the expected status explicitly. **Receiving headers does not prove the body completed or satisfies the endpoint's schema**.

</div>

<span class="notes-section-label">**Example answer**</span>

The five status codes are 200, 404, 200, 405 and 204. `ok` is true for the 200 and 204 responses, false for 404 and 405. The first two responses carry JSON text. HEAD, 405 in this fixture, and 204 have empty bodies.

HEAD still advertises the JSON representation's media type and byte length. That length describes the corresponding GET content, not bytes a client should wait for in this HEAD response. The 405 includes `Allow: GET, HEAD`. **A 204 has no body to parse**; calling `json()` on empty content would fail rather than produce an empty object.

<span class="notes-section-label">**Methods describe semantics, not just route names**</span>

| Method | Intended use | Important boundary |
|---|---|---|
| GET | Retrieve a representation | Do not use it for an intended state-changing operation |
| HEAD | Obtain GET-like response metadata without response content | Do not require a JSON body |
| POST | Process submitted content according to the resource contract | Do not assume safe retry after an unknown outcome |
| PUT | Create/replace the target state according to its contract | Idempotence concerns intended effect, not identical responses |
| PATCH | Apply a partial change | The patch format and operation determine repeatability |
| DELETE | Remove the target's association/resource according to its contract | A repeated request can return a different status |
| OPTIONS | Describe communication options | Browser preflight is one use, not its entire meaning |

A safe method has read-oriented requested semantics; incidental logging does not make it unsafe. **Idempotent means repeating the same request has the same intended server effect** as applying it once. It does not guarantee exactly-once execution or identical timestamps/statuses. POST retries generally need an application idempotency/outcome design when side effects matter.

<span class="notes-section-label">**Headers and bodies have separate jobs**</span>

`Content-Type` describes the representation being sent; `Accept` expresses the response formats a client can handle. Sending `Accept: application/json` does not make an HTML error page valid JSON. `Content-Length` counts bytes, not JavaScript string length. Do not invent a length for an encoded or streaming body without understanding its framing.

A request can have valid JSON syntax and still fail domain validation. A response can claim a JSON media type but contain malformed JSON, or parse successfully into the wrong shape. Validate each boundary deliberately rather than treating `response.json()` as schema validation. A body is normally consumed once; retaining a small parsed value is different from repeatedly reading the stream.

<span class="notes-section-label">**Status codes guide diagnosis**</span>

- 200/201/204: successful response, created resource, or success without content. A creation response can identify the new resource with `Location`.
- 3xx: redirection or conditional-request outcomes; inspect policy and headers. Not every 3xx is a redirect to follow, and a 304 is not a new JSON representation.
- 400/401/403/404/405: malformed request, authentication challenge, refusal, missing resource, or method unsupported for this target. A 401 uses an appropriate `WWW-Authenticate` challenge; 405 supplies `Allow`.
- 409/413/415: state conflict, oversized content, or unsupported media type/encoding contract.
- 429/500/503: rate limit, unexpected server failure, or temporary unavailability. Consider documented retry hints and replay safety rather than retrying automatically.

<span class="notes-section-label">**A repeatable inspection workflow**</span>

In browser developer tools, open Network, trigger one action and select its request. Compare URL/method, request headers/payload, status, response headers and response content. Check Timing to separate waiting from body transfer. Redact cookies, authorization and sensitive payloads before sharing evidence.

For the fixture, add `console.error(base)` after startup to learn its temporary address, then inspect it while paused in a debugger, or keep a separate owned server running. With a known active address, `curl -i URL` shows response headers and content; `curl -I URL` makes a HEAD request. These tools observe an exchange, not the validity of the application's business rules.

If there is no response, identify DNS, connect, TLS or cancellation failure before discussing HTTP status. If a response exists, inspect its status and content before blaming JSON parsing. If content is malformed, preserve a safe bounded diagnostic sample rather than dumping credentials or a huge body into logs.

<span class="notes-section-label">**Common mistakes**</span>

- Catching only rejected fetch promises and treating a fulfilled 404 as success.
- Calling `json()` unconditionally for HEAD, 204 or an HTML gateway error.
- Reporting every failed request as a server exception; status and failure phase matter.
- Treating idempotence as proof that every retry is cost-free or returns the same response.
- Copying this fixed-response fixture's full `text()` read into an unbounded external client. Reuse the earlier body/deadline ownership principles and add schema/media checks for real integrations.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Can a 200 still fail the application contract?**</span> Yes. The content may be malformed, missing fields or represent the wrong business outcome; inspect and validate it separately.
2. <span class="notes-section-label">**Why can DELETE return 204 first and 404 later yet remain idempotent?**</span> The requested final state can be the same—no current association—even though responses differ. The endpoint must document its policy.
3. <span class="notes-section-label">**Does abort prove a submitted write did not commit?**</span> No. Cancelling the local wait does not roll back remote effects. Reconcile uncertain outcomes before repeating writes.

::: tip Key takeaway
Debug an HTTP exchange in layers: transport, method/target, status, headers, body completion, then application meaning.
:::

<span class="notes-section-label">**Practice — learner work still required**</span>

Run the fixture and retain a redacted comparison of all five responses. Then make an owned endpoint return status 200 with malformed JSON and another return an HTML error. Acceptance: distinguish HTTP failure from decoding/schema failure; explain empty HEAD/204 bodies, `Allow`, JSON media types and byte lengths; close all servers and connections. Inspect one browser exchange separately before claiming developer-tools practice.

Official references, checked 2026-11-04: [HTTP semantics](https://httpwg.org/specs/rfc9110.html), [HTTP methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods), [status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status), [Fetch response handling](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch), [Node 24 HTTP](https://nodejs.org/download/release/v24.18.0/docs/api/http.html).


---

### How can HTTP request/response coexist with asynchronous browser interaction? {#t08-q10}

*Study depth: Intermediate*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

HTTP describes request/response messages; it does not require blocking the browser's JavaScript thread. **Fetch lets the UI continue while a request and its body are awaited.** Navigation/form submission and in-page fetch are different interaction styles, not “HTTP versus asynchronous networking.” **Cancellation stops a local wait, not a remote committed effect; stale results also need an explicit UI ownership rule.**

</div>

<span class="notes-section-label">**Reason through the browser boundary**</span>

A page navigation commonly replaces a document; an HTML form submits according to its method/encoding and may navigate. Fetch returns a promise and lets code update an existing document. `await` suspends that async function, not every event handler. A large synchronous parse/render can still block interaction. Polling is a sequence of requests; SSE/WebSocket add ongoing communication under the earlier lifecycle contracts.

| Boundary | Decision |
|---|---|
| Origin | Scheme, host and port determine same origin; different ports are cross-origin |
| Credentials | Browser fetch defaults to same-origin credentials; cross-origin inclusion must be intentional |
| Cookies | Domain/path, Secure, HttpOnly, SameSite and browser policy constrain use; HttpOnly prevents script reads, not automatic sending |
| CORS | Controls browser-script access to cross-origin responses; preflight may precede the actual request |
| State changes | Authenticate and authorize server-side; cookie-authenticated writes need reviewed CSRF defenses |
| UI lifetime | Cancel obsolete work and prevent an old result overwriting a newer interaction |

Same-site and same-origin are different concepts. `credentials: 'include'` cannot override SameSite/third-party-cookie restrictions. Credentialed CORS needs an allowed explicit origin and credentials response policy; `*` is not a blanket solution. Expose non-safelisted response headers explicitly if script must read them. Browser code cannot read `Set-Cookie` as an ordinary exposed response header.

A preflight asks about a method/header policy; it does not authenticate the future action. Some cross-origin requests can be sent without preflight even when script cannot read the response. **CORS is not authorization or a complete CSRF defense.** Use the framework's reviewed CSRF support, appropriate tokens/origin checks and SameSite defense in depth for cookie sessions. Do not move long-lived credentials into URLs to avoid a preflight. See [the existing authentication continuation](../module-09-authentication-authorization.md).

<span class="notes-section-label">**Worked browser client — latest interaction owns the output**</span>

Save as `browser-client.html`. The owned runner below substitutes its API address. No real credentials or private data are used; the custom header deliberately exercises preflight. The client allows only four fixture paths and never renders returned HTML.

```html
<!-- file: browser-client.html -->
<!doctype html>
<meta charset="utf-8">
<title>Browser request study</title>
<label>Response <select id="mode">
  <option value="product">Product</option><option value="invalid">Invalid JSON</option>
  <option value="error">HTTP error</option><option value="blocked">Blocked CORS</option>
</select></label>
<button id="load">Load</button><button id="cancel">Cancel</button>
<p id="output" role="status">Idle</p>
<script type="module">
const api = '__API_BASE__';
const mode = document.querySelector('#mode');
const output = document.querySelector('#output');
let current, generation = 0;
async function readSmallJson(response) {
  if (response.status !== 200 ||
      !/^application\/json(?:;|$)/i.test(response.headers.get('content-type') ?? '')) {
    await response.body?.cancel(); throw new Error('Unexpected response');
  }
  const reader = response.body.getReader();
  const chunks = []; let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 2048) throw new Error('Body too large');
      chunks.push(value);
    }
  } catch (error) { await reader.cancel().catch(() => {}); throw error; }
  finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  const value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  if (!value || value.id !== 'p1' || typeof value.name !== 'string' || value.name.length > 80) {
    throw new Error('Invalid product');
  }
  return value;
}
document.querySelector('#load').addEventListener('click', () => {
  void load().catch(() => { output.textContent = 'Unexpected client failure'; });
});
async function load() {
  const mine = ++generation;
  current?.abort();
  const controller = new AbortController(); current = controller;
  output.textContent = 'Loading';
  try {
    const response = await fetch(`${api}/${mode.value}`, {
      credentials: 'omit', headers: { 'X-Study': '1' },
      signal: AbortSignal.any([controller.signal, AbortSignal.timeout(1500)])
    });
    const value = await readSmallJson(response);
    if (mine === generation) output.textContent = `${value.id}: ${value.name}`;
  } catch {
    if (mine === generation) output.textContent = controller.signal.aborted ? 'Cancelled' : 'Request failed';
  } finally { if (mine === generation) current = undefined; }
}
document.querySelector('#cancel').addEventListener('click', () => {
  generation++; current?.abort(); current = undefined; output.textContent = 'Cancelled';
});
addEventListener('pagehide', () => { generation++; current?.abort(); });
</script>
```

The deadline stays active through body consumption. The generation check protects output even if obsolete work settles after cancellation; abort alone is not a complete stale-result policy. Error text is fixed, not raw upstream content. The2048-byte accepted-body limit is not a bound on every browser/network allocation. This small schema check is deliberately narrow, and a general client needs the endpoint's actual schema.

<span class="notes-section-label">**Owned two-origin runner**</span>

Save beside the HTML as `browser-lab.mjs`, run it with Node24 and open the printed page URL. Separate ephemeral ports produce two distinct origins. This is an unauthenticated public-fixture lab only, not a reusable CORS/auth middleware implementation.

```js
// file: browser-lab.mjs
import { createServer } from 'node:http';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
const template = await readFile(new URL('./browser-client.html', import.meta.url), 'utf8');
let uiOrigin;
const timers = new Set();
const api = createServer((req, res) => {
  const path = new URL(req.url, 'http://fixture').pathname;
  if (uiOrigin && path !== '/blocked' && req.headers.origin === uiOrigin) {
    res.setHeader('Access-Control-Allow-Origin', uiOrigin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'X-Study');
  }
  if (req.method === 'OPTIONS') { res.writeHead(204).end(); return; }
  if (req.method !== 'GET') { res.writeHead(405, { Allow: 'GET' }).end(); return; }
  const timer = setTimeout(() => {
    timers.delete(timer);
    if (res.destroyed) return;
    res.writeHead(path === '/error' ? 500 : 200, {
      'Content-Type': 'application/json', 'Cache-Control': 'no-store'
    });
    res.end(path === '/invalid' ? '{' : JSON.stringify({ id: 'p1', name: 'Book' }));
  }, 200);
  timers.add(timer);
  res.once('close', () => { clearTimeout(timer); timers.delete(timer); });
});
let apiOrigin;
const ui = createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(template.replace('__API_BASE__', apiOrigin));
});
async function listen(server) {
  const ready = once(server, 'listening'); server.listen(0, '127.0.0.1'); await ready;
  return `http://127.0.0.1:${server.address().port}`;
}
let closing;
try {
  apiOrigin = await listen(api); uiOrigin = await listen(ui);
  console.log(JSON.stringify({ page: uiOrigin, api: apiOrigin }));
} catch (error) { await close(); throw error; }
function close() {
  return closing ??= Promise.all([ui, api].map(server => new Promise((resolve, reject) => {
    if (!server.listening) { resolve(); return; }
    server.close(error => error ? reject(error) : resolve()); server.closeAllConnections();
  }))).finally(() => { for (const timer of timers) clearTimeout(timer); timers.clear(); });
}
for (const signal of ['SIGTERM', 'SIGINT']) process.once(signal, () => {
  void close().catch(() => { process.exitCode = 1; });
});
```

The server's allowlist permits the exact UI origin. The blocked path intentionally omits CORS headers, so browser preflight fails; Node fetch/curl do not enforce that browser response-access policy. The fixture neither sets nor tests cookies. Configure real HTTPS cookie/session/CSRF behavior in the dedicated security lesson, not by extrapolating these public reads.

<span class="notes-section-label">**Common mistakes and debugging**</span>

If Network shows a failed OPTIONS, inspect allowed origin/method/headers before the GET handler. If the GET returns200 but script rejects, inspect CORS, media type, decoding and schema. If an old result appears, inspect the generation/session owner. Never “fix” this with `mode: 'no-cors'`: an opaque response is not readable application JSON. Do not label every browser error a server500.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Does await freeze the page?**</span> It suspends the async continuation, while the event loop can process other work; synchronous work still blocks.
2. <span class="notes-section-label">**Does cancelling a POST undo it?**</span> No. Reconcile the remote outcome rather than infer rollback from a local cancellation.
3. <span class="notes-section-label">**Why can curl succeed while browser code fails?**</span> Browser origin/credential policies are additional constraints; server-side authorization must still hold for every client.

::: tip Key takeaway
Separate the HTTP exchange, browser security policy and UI lifetime; each has its own success and failure conditions.
:::

<span class="notes-section-label">**Practice — learner work still required**</span>

Run the two-origin lab. Test every selector value, cancel while Loading, and trigger two rapid loads. Acceptance: inspect real preflight/GET behavior, reject malformed/error responses, never overwrite newer output and close both servers. Separately inspect a real cookie-authenticated flow with redacted evidence; explain SameSite/CORS/CSRF boundaries without claiming the public fixture tested them.

<span class="notes-section-label">**Official references**</span>

[Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch), [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS), [cookie attributes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie), [OWASP CSRF prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html). Checked2026-11-04; AbortSignal.any/timeout require a supporting browser or an equivalent explicitly owned controller/timer fallback.


---

### How do connection reuse and client pooling help without creating an unbounded queue? {#t08-q11}

*Study depth: Intermediate implementation of a foundational optimization*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Reuse avoids repeating suitable connection setup for every request. A client pool owns reusable connections and schedules work onto them. **A socket limit is not a request-admission or queue limit.** Bound application work, keep deadlines through queued/connect/body phases, consume or cancel responses, and dispose of the owner. **Connection reuse does not make an uncertain write safe to retry.**

</div>

<span class="notes-section-label">**Separate the mechanisms**</span>

HTTP keep-alive permits successive exchanges over a suitable connection. TCP keepalive probes have a different purpose; they are not request deadlines. Node's `http.Agent` manages classic HTTP client sockets; `https.Agent` adds TLS-aware connection identity/options. Node fetch uses Undici's dispatcher machinery, so an `http.Agent` is not its fetch pool configuration. Browsers manage their own connections; application JavaScript cannot set a Node agent there.

| Control | What it bounds | What it does not prove |
|---|---|---|
| `maxSockets` | Agent sockets per origin key | Number of waiting application requests |
| `maxTotalSockets` | Agent sockets across origins | Global capacity across process replicas |
| `maxFreeSockets` | Idle retained sockets per origin | A total work deadline or cache freshness |
| Application admission | Accepted active/queued operations | Dependency capacity is sufficient |
| Full-operation deadline | Local wait including queue and body | Remote side effects were undone |
| Consume/cancel body | Complete or release response ownership | The response satisfies its schema |

More connections can overwhelm a dependency. Measure admission rejection, queue wait, connect/TLS time, header/body time, errors and recovery. A long streaming response occupies capacity differently from a short JSON read. Reuse can retain a connection to an old DNS destination; DNS changes do not retroactively move established sockets. HTTP/2 multiplexing has different stream/session limits and needs its own design.

<span class="notes-section-label">**Worked owned HTTP/1.1 client**</span>

This client targets only an owned loopback fixture, accepts at most two outstanding calls, and uses one socket so queueing is observable. It is not an outbound URL authorization template. Save as `pooled-client.mjs`:

```js
// file: pooled-client.mjs
import { Agent, get } from 'node:http';
import { once } from 'node:events';
export function createPooledClient(port) {
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new TypeError('Invalid fixture port');
  const agent = new Agent({ keepAlive: true, maxSockets: 1,
    maxTotalSockets: 1, maxFreeSockets: 1, scheduling: 'lifo' });
  const requests = new Set();
  let active = 0, closed = false;
  return Object.freeze({
    async read(path = '/ok', timeoutMs = 1000) {
      if (closed) throw new Error('Client closed');
      if (typeof path !== 'string' || !/^\/[a-z-]{1,30}$/.test(path) ||
          !Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 60_000) {
        throw new TypeError('Invalid path or deadline');
      }
      if (active >= 2) throw new Error('Client overloaded');
      active++;
      let request, timer, complete = false, settled = false, requestClosed = false;
      const release = () => {
        if (settled && requestClosed) { active--; settled = false; }
      };
      try {
        request = get({ hostname: '127.0.0.1', port, path, agent });
        requests.add(request);
        request.once('close', () => { requests.delete(request); requestClosed = true; release(); });
        request.on('error', () => {}); // once owns pre-header errors; body iteration owns later failures.
        const abort = new AbortController();
        const headers = once(request, 'response', { signal: abort.signal });
        timer = setTimeout(() => {
          abort.abort(new Error('Request deadline')); request.destroy(abort.signal.reason);
        }, timeoutMs);
        const [response] = await headers;
        if (response.statusCode !== 200) { response.destroy(); throw new Error('Unexpected status'); }
        const chunks = []; let bytes = 0;
        for await (const chunk of response) {
          bytes += chunk.length;
          if (bytes > 1024) throw new Error('Body limit');
          chunks.push(chunk);
        }
        if (!response.complete) throw new Error('Incomplete response');
        complete = true;
        return Buffer.concat(chunks, bytes).toString('utf8');
      } finally {
        clearTimeout(timer);
        if (!complete) request?.destroy();
        if (!request) requestClosed = true;
        settled = true; release();
      }
    },
    pending() { return active; },
    close() {
      if (closed) return;
      closed = true;
      for (const request of requests) request.destroy(new Error('Client closed'));
      agent.destroy();
    }
  });
}
```

A successful body is consumed fully and its reusable socket is left with the agent; unconditionally destroying every successful request would defeat that policy. Failed/status/oversized reads are aborted rather than draining arbitrary content indefinitely. The deadline starts before waiting for socket assignment and stays active through body completion.

The header wait has its own abort signal because destroying an Agent-queued request can defer its error event until socket assignment. The caller can stop waiting at its deadline, while the admission slot remains owned until both the operation settles and Node closes its request. This prevents repeatedly timed-out queued requests from bypassing the outstanding-work cap. Timers are cleared in `finally`; `pending()` counts these resource-owning slots, not only unresolved caller promises.

`close()` is deliberately **abortive**, not a graceful wait: it stops admission, destroys tracked active/queued requests and agent sockets, and is idempotent. Callers must still observe/settle their returned promises. A graceful application shutdown would first stop new callers, drain work under a budget, then destroy leftovers. Neither API should change a global agent owned by unrelated components.

The fixture returns bounded text, not validated general JSON. TLS, destination policy, media/schema validation, redirects and safe retries remain separate controls. An idle server may close a pooled socket, producing a reset race even under a correct client. A limited replay-safe GET retry can be appropriate under a total budget; do not add an unlimited retry or assume a POST failed merely because its reused socket reset.

<span class="notes-section-label">**Common mistakes and debugging**</span>

Creating one agent per request prevents meaningful reuse. Increasing maxSockets can move saturation downstream. Forgetting bodies or retaining pending operations indefinitely makes a small pool look mysteriously slow. Inspect agent queue/socket metrics read-only; do not mutate their internal collections. If latency rises before a socket is assigned, distinguish queue starvation from server processing. Compare sequential socket reuse with simultaneous demand rather than claim a universal latency improvement from a local fixture.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Why can one socket still permit two admitted operations?**</span> One is active and one may wait for assignment; the application admission cap bounds both together.
2. <span class="notes-section-label">**Does maxFreeSockets limit the request queue?**</span> No. It concerns idle reusable connections, not pending operations.
3. <span class="notes-section-label">**Can a consumed200 body still be invalid?**</span> Yes. Representation/schema/business validation remains after transport completion.

::: tip Key takeaway
Pool connections deliberately, bound work separately, and supervise every request until its body and cleanup settle.
:::

<span class="notes-section-label">**Practice — learner work still required**</span>

Use a controlled server that counts accepted sockets. Verify two sequential reads reuse one socket. Hold one response, queue another with a short deadline and reject a third at admission; then release the hold and demonstrate recovery. Test headers-then-stall, oversized/non200/truncated bodies and close during active work. Acceptance: every promise settles, no owned socket/timer remains, and socket capacity is distinguished from queue/admission. Repeat under the actual TLS/proxy topology before claiming deployment behavior.

<span class="notes-section-label">**Official references**</span>

[Node24.18 HTTP Agent and lifecycle](https://nodejs.org/download/release/v24.18.0/docs/api/http.html#class-httpagent), [HTTPS Agent](https://nodejs.org/download/release/v24.18.0/docs/api/https.html#class-httpsagent), [Node fetch dispatcher](https://nodejs.org/download/release/v24.18.0/docs/api/globals.html#fetch). These examples explicitly configure their agent instead of relying on global-agent defaults, which vary across versions.

## Revision {#group-8-revision}

Network layers have different contracts: DNS names endpoints, TCP transports ordered bytes, UDP carries unreliable datagrams, TLS authenticates/protects a channel, HTTP defines requests/responses, and real-time protocols add ongoing message delivery.

Keep HTTP/HTTPS as the primary API and add a transport only when its interaction and recovery contract is justified. Socket.IO and WebSocket remain distinct choices with different clients and deployment requirements.

<span class="notes-section-label">**Learner checklist and integrated exercise**</span>

- [ ] Complete transport, TLS and DNS transport/TLS/DNS exercises with owned fixtures and retained failure evidence.
- [ ] Compare polling, SSE and bidirectional messaging for a concrete product, including one rejected alternative and its cost.
- [ ] Run the ws lab on loopback; test text/binary/schema/payload errors, close cleanup and a controlled slow-consumer policy. Add real authentication/authorization and heartbeat under an owned lifecycle before adapting it to private data.
- [ ] Run compatible Socket.IO4 server/client with acknowledged valid/invalid events, refused authentication, disconnect/reconnect and duplicate attempts. Implement durable idempotency separately before claiming side-effect safety.
- [ ] Test feed duplicate/gap/epoch/resync and old-session replacement, then exercise the intended proxy/multiple-node topology before claiming deployment behaviour.

- [ ] Run the two-origin browser lab and distinguish CORS/preflight, HTTP, decoding/schema and cancellation outcomes. Explain credential/cookie/CSRF limits separately.
- [ ] Verify pooled sequential reuse, queued deadlines/admission, body failures and cleanup against a controlled server.

Acceptance: assert protocol outcomes, close/error paths, bounded completion, zero owned clients/listeners/timers and explicit untested infrastructure. Do not expose these unauthenticated/synthetic-token local labs. Writing and author-checking the notes does not complete learner practice or demonstrate professional readiness.

<span class="notes-section-label">**Mixed practice — attempt all first**</span>

1. A WebSocket send callback succeeds, then the connection drops before a business acknowledgement. Is the command known to have committed?
2. Can a browser-compatible WebSocket connect to a Socket.IO event server without implementing its protocol?
3. Socket.IO retries a write after an ack is lost. Which application property prevents a duplicate business effect?
4. An adapter shares broadcasts across nodes while polling is enabled. What other routing requirement remains?
5. The SSE client reconnects with an ID older than retained history. What should happen?
6. The transport is healthy but a user loses resource access. Can the old subscription remain authorized automatically?

<span class="notes-section-label">**Practice answers**</span>

1. No. Transport acceptance is not application commit; reconcile the outcome using a command ID/outcome protocol.
2. No. They are not wire-compatible at the application protocol level.
3. A durable idempotency/outcome record atomically aligned with the effect, including conflict handling for reused IDs.
4. Session affinity/compatible routing for related polling requests, unless the chosen deployment deliberately removes that transport or supplies equivalent session handling.
5. Follow an explicit reset/snapshot protocol rather than pretending replay is complete.
6. No. Recheck/revoke subscriptions under the application's authorization/session-lifetime policy.

Additional official references checked2026-11-04: Node24.18 [WebSocket client](https://nodejs.org/download/release/v24.18.0/docs/api/globals.html#class-websocket), ws [server/authentication/heartbeat examples](https://github.com/websockets/ws#readme); Socket.IO4 [introduction](https://socket.io/docs/v4/), [delivery guarantees](https://socket.io/docs/v4/delivery-guarantees/), [middleware](https://socket.io/docs/v4/middlewares/), [multiple nodes](https://socket.io/docs/v4/using-multiple-nodes/), [server options](https://socket.io/docs/v4/server-options/); OWASP [WebSocket security](https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html). Library installation/version and actual runtime checks are recorded in progress; local tests do not validate a production deployment.

<span id="next-batch-checkpoint"></span>

