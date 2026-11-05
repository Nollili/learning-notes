---
outline: [2, 3]
---

# Advanced real-time, native modules and WebAssembly

These specialist extensions build on [real-time foundations](./08-networking.md#t08-q06), [concurrency](./09-concurrency.md) and [performance measurement](./12-performance-and-v8.md). Use Node.js 24 for the worked examples; the real-time discussion uses Socket.IO 4.x. Native build commands below are explicitly macOS/arm64 study commands, not a portable release pipeline. References checked 2026-11-05.

## How do authenticated real-time sessions work across multiple servers? {#t08-q12}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Authenticate connection setup, authorize every protected action/subscription and maintain an explicit revocation policy. Multi-server deployments also need transport affinity where applicable and cross-server delivery. **A connected socket or room membership is not permanent authorization.**

</div>

A connection can outlive a token, role or tenant membership. Validate credentials at entry, attach a narrow server-owned identity, enforce permissions on each action and expire/disconnect or refresh sessions under a stated policy. Derive room names from authorized server state; never let a caller join arbitrary tenant rooms. Recheck permissions during reconnect/recovery and before sending protected data when membership changes. A client-supplied user ID is not identity proof.

For browser connections, validate the expected Origin and authentication transport. CORS config alone is not a universal WebSocket authorization mechanism; native clients can forge Origin. Cookie-based sessions also need a cross-site WebSocket hijacking defense. Do not put bearer tokens in query strings that proxies/access logs retain. TLS protects transport, not application permissions.

Socket.IO multi-node operation has two separate needs:

- **Affinity for long-polling sessions:** repeated HTTP requests must reach the owning server. A WebSocket-only connection removes this polling-affinity requirement but gives up polling fallback; reconnect can still land elsewhere.
- **An adapter for broadcasts across servers:** an in-memory adapter only knows local sockets. A compatible shared adapter transports cross-node events; it does not automatically share your application session store or implement durable business replay.

Choose the adapter by actual guarantees. Redis Pub/Sub forwarding differs from a persistent stream. Socket.IO connection-state recovery has adapter-specific support and a bounded retention window; recovery may fail. With recovery configured, consider `skipMiddlewares:false` so a resumed session is not accepted using obsolete credentials. Even a successful handshake recheck does not replace per-action authorization.

<span class="notes-section-label">**Practice and acceptance**</span>

Run two owned instances behind a local proxy. Test polling and WebSocket-only transports, cross-instance room delivery, token expiry, membership revocation and adapter loss. Accept with no cross-tenant delivery and a documented fallback when recovery is unavailable. References: [multiple nodes](https://socket.io/docs/v4/using-multiple-nodes/), [connection-state recovery](https://socket.io/docs/v4/connection-state-recovery/), [OWASP WebSocket security](https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html).

---

## How do slow consumers and replay cursors change a real-time design? {#t08-q13}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Bound message sizes, per-client buffers, fan-out work and retained history. Define ordered replay within a specific stream and fall back to an authorized snapshot when history is unavailable. **A gap must trigger recovery rather than silently advancing the cursor.**

</div>

A socket accepting writes does not mean its user has processed them. Measure buffered bytes, oldest pending age and application acknowledgments separately. Bound subscriptions per user and broadcasting work per turn. Disconnect/resynchronize a persistently slow consumer; coalesce replaceable state updates only when intermediate transitions are irrelevant. Payments, audit events and commands cannot be dropped as if they were cursor-position updates.

This pure reducer extends the foundation's duplicate/gap model with a stream epoch. A snapshot establishes a cursor; a new epoch requires a fresh snapshot. The `stream` comes from authenticated subscription state. This example accepts only one bounded integer value per update; real payload schemas remain domain-specific.

```js [replay-state.mjs]
import assert from "node:assert/strict";
function snapshot(stream, epoch, seq, value) {
  if (
    ![stream, epoch].every(
      (x) => typeof x === "string" && /^[a-z0-9-]{1,40}$/.test(x),
    ) ||
    !Number.isSafeInteger(seq) ||
    seq < 0 ||
    !Number.isSafeInteger(value)
  )
    throw new TypeError("invalid snapshot");
  return Object.freeze({ stream, epoch, seq, value });
}
function apply(state, event) {
  if (
    !event ||
    typeof event !== "object" ||
    !Number.isSafeInteger(event.seq) ||
    event.seq < 1 ||
    !Number.isSafeInteger(event.value)
  )
    throw new TypeError("invalid event");
  if (event.stream !== state.stream) throw new Error("wrong subscription");
  if (event.epoch !== state.epoch) return { kind: "snapshot-required", state };
  if (event.seq <= state.seq) return { kind: "duplicate", state };
  if (state.seq === Number.MAX_SAFE_INTEGER || event.seq !== state.seq + 1)
    return { kind: "snapshot-required", state };
  return {
    kind: "applied",
    state: snapshot(state.stream, state.epoch, event.seq, event.value),
  };
}
const initial = snapshot("tenant-a", "epoch-1", 4, 10);
const applied = apply(initial, {
  stream: "tenant-a",
  epoch: "epoch-1",
  seq: 5,
  value: 11,
});
assert.equal(applied.state.seq, 5);
assert.equal(initial.seq, 4);
assert.equal(
  apply(applied.state, {
    stream: "tenant-a",
    epoch: "epoch-1",
    seq: 5,
    value: 99,
  }).kind,
  "duplicate",
);
assert.equal(
  apply(initial, { stream: "tenant-a", epoch: "epoch-1", seq: 6, value: 99 })
    .kind,
  "snapshot-required",
);
assert.equal(
  apply(initial, { stream: "tenant-a", epoch: "epoch-2", seq: 5, value: 99 })
    .kind,
  "snapshot-required",
);
assert.throws(() =>
  apply(initial, { stream: "tenant-b", epoch: "epoch-1", seq: 5, value: 99 }),
);
assert.throws(() =>
  apply(initial, { stream: "tenant-a", epoch: "epoch-1", seq: NaN, value: 99 }),
);
```

A duplicate here is ignored under an assumption that the authoritative producer never assigns two different events to the same epoch/sequence. If that assumption can fail, detect conflicting event identity and resynchronize rather than calling it harmless. A cursor is not an authorization token. Validate an opaque/signed cursor's size, version, stream binding and expiry before using it for a database query; a signed cursor still needs current permissions.

Avoid the snapshot/subscription race: obtain a consistent snapshot with its high-water mark, then replay retained events after that mark before live delivery, or buffer live events while snapshotting with a strict bound. Define what happens when retention expires during recovery. Global ordering across independent streams is a separate, expensive requirement; do not promise it because TCP orders bytes on one connection.

<span class="notes-section-label">**Practice and acceptance**</span>

Extend the feed with bounded history and a deliberately slow client. Accept when duplicate/gap/epoch/expired cursor cases are tested, memory stays within a stated budget and authorization is rechecked for the snapshot/replay. Reference: [Socket.IO delivery guarantees](https://socket.io/docs/v4/delivery-guarantees/), [Node stream backpressure](https://nodejs.org/en/learn/modules/backpressuring-in-streams).

---

## How do you diagnose reconnect storms and shut down real-time services? {#t08-q14}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Separate liveness detection, reconnect admission and application recovery. Stop accepting work before bounded drain, then close remaining connections under an explicit deadline. **A reconnected transport does not prove missed application state was recovered.**

</div>

Use library-supported ping/pong and proxy idle settings consistently. A heartbeat timeout can reflect congestion, a blocked event loop or a sleeping client; it is not proof of malicious behavior. Client reconnects need capped exponential backoff with jitter and server-side admission limits so a rolling restart does not synchronize every client. Retry only classified transient failures; repeatedly retrying revoked credentials wastes capacity.

An operational sequence is: mark unready, stop new subscriptions/upgrades, advertise a drain hint if your protocol supports it, stop new job admission, finish or checkpoint bounded active work, close sockets, then terminate remaining owned work at a deadline. Account for upgraded sockets separately from an HTTP server's ordinary request lifecycle. Clear heartbeat timers, reconnect timers and adapter connections; closing one layer does not necessarily close the others.

| Symptom | First evidence | Decision to test |
|---|---|---|
| Frequent disconnects at a fixed interval | Proxy idle timeout, heartbeat timings, event-loop delay | Align idle/heartbeat policy; fix stalls before enlarging every timeout |
| Duplicate notifications after reconnect | Operation IDs, producer retry and replay offsets | Idempotent effect + correct cursor; acknowledgments may be lost |
| Room delivery works on one instance only | Adapter health, local membership, transport affinity | Configure cross-node forwarding independently of load balancing |
| Memory rises with slow clients | Per-client buffered bytes/age, subscriber counts | Bound/coalesce/disconnect; do not just raise heap size |

Use bounded metric labels for disconnect class/transport, and safe IDs in logs/traces for a particular session. A room containing ten thousand sockets makes one broadcast a fan-out capacity problem. Load-test the selected distribution and recovery strategy; an echo fixture does not measure it.

<span class="notes-section-label">**Practice and acceptance**</span>

Extend the [existing networking fixtures](./08-networking.md#t08-q07) with owned proxy restart, adapter loss, slow client and rolling shutdown. Accept when no stale session receives protected events, recovery/fallback is explicit, buffers and drain time are bounded and every owned handle closes. References: [Socket.IO troubleshooting](https://socket.io/docs/v4/troubleshooting-connection-issues/), [delivery guarantees](https://socket.io/docs/v4/delivery-guarantees/).

---

## What does a native Node-API module add, and what can go wrong? {#t12-q08}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

A native addon exposes compiled code to JavaScript. Node-API provides a stable ABI boundary for compatible Node-API versions, whereas direct V8/internal APIs carry different compatibility risks. **Native code executes with the host process's privileges and can crash or corrupt it.**

</div>

Use a native dependency for an existing system library, specialized hardware or a measured hot path. It adds compiler/toolchain, OS/architecture/libc and transitive-library compatibility work. Node-API ABI stability does not produce one binary for every operating system or guarantee a third-party library's ABI. Check the target Node-API version, packaging/prebuild matrix and fallback build before release. `node-addon-api` is a C++ wrapper over Node-API, not the same thing as direct V8 bindings.

This intentionally small C++ addon checks inputs before adding two bounded integers. Every Node-API result used by the example is checked; error returns stop execution. Put this in an owned study directory:

```cpp [study.cc]
#include <node_api.h>
#include <cmath>

static napi_value Add(napi_env env, napi_callback_info info) {
  size_t argc = 3;
  napi_value args[3];
  if (napi_get_cb_info(env, info, &argc, args, nullptr, nullptr) != napi_ok) {
    napi_throw_error(env, nullptr, "cannot read arguments"); return nullptr;
  }
  if (argc != 2) {
    napi_throw_type_error(env, nullptr, "expected two numbers"); return nullptr;
  }
  double a, b;
  if (napi_get_value_double(env, args[0], &a) != napi_ok ||
      napi_get_value_double(env, args[1], &b) != napi_ok) {
    napi_throw_type_error(env, nullptr, "expected numbers"); return nullptr;
  }
  if (!std::isfinite(a) || !std::isfinite(b) || std::trunc(a) != a || std::trunc(b) != b ||
      std::abs(a) > 1000000 || std::abs(b) > 1000000) {
    napi_throw_range_error(env, nullptr, "integers outside study range"); return nullptr;
  }
  napi_value result;
  if (napi_create_double(env, a + b, &result) != napi_ok) {
    napi_throw_error(env, nullptr, "cannot create result"); return nullptr;
  }
  return result;
}
static napi_value Init(napi_env env, napi_value exports) {
  napi_value fn;
  if (napi_create_function(env, "add", NAPI_AUTO_LENGTH, Add, nullptr, &fn) != napi_ok ||
      napi_set_named_property(env, exports, "add", fn) != napi_ok) {
    napi_throw_error(env, nullptr, "cannot initialize addon"); return nullptr;
  }
  return exports;
}
NAPI_MODULE(study_addon, Init)
```

For the macOS/arm64 lab with Homebrew Node headers and Command Line Tools, the direct compile command is:

```sh
c++ -std=c++17 -shared -fPIC -undefined dynamic_lookup \
  -I/opt/homebrew/include/node study.cc -o study.node
```

The include path and linker flags are platform-specific. A normal cross-platform addon uses a reviewed `binding.gyp`/node-gyp or CMake setup and per-platform release checks. Compilation can run arbitrary dependency lifecycle scripts; review the source/package rather than enabling builds indiscriminately.

```js [native-check.mjs]
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const { add } = createRequire(import.meta.url)("./study.node");
assert.equal(add(20, 22), 42);
for (const args of [
  [],
  [1],
  [1, 2, 3],
  ["1", 2],
  [NaN, 2],
  [Infinity, 2],
  [0.5, 2],
  [1000001, 2],
])
  assert.throws(() => add(...args));
```

This tiny synchronous function is bounded; a long native computation would still block its calling thread. Async native work requires correct ownership, completion/cancellation and safe JavaScript-thread interaction. Node-API async work can contend with the libuv pool; arbitrary native threads cannot call ordinary JavaScript APIs directly. Thread-safe functions have lifecycle and queue limits. A worker thread isolates an event loop, not native memory corruption from the process; a separate process gives a stronger crash boundary.

<span class="notes-section-label">**Practice and acceptance**</span>

Compile/run this study addon, then design the lifetime/cancellation contract for a slower operation without implementing unsafe background callbacks. Accept with negative input tests, checked native statuses, a supported-platform matrix and a clear reason to prefer native code over JavaScript/worker/process alternatives. References: [Node-API](https://nodejs.org/api/n-api.html), [ABI stability](https://nodejs.org/en/learn/modules/abi-stability), [node-gyp](https://github.com/nodejs/node-gyp).

---

## How does WebAssembly exchange values and memory with Node.js? {#t12-q09}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

WebAssembly runs a compiled module with explicit imports/exports and linear-memory conventions. Validate JavaScript inputs and model boundary conversions. **Wasm integer behavior and memory views do not automatically match JavaScript Number semantics.**

</div>

This text representation declares one exported i32 addition function:

```text
(module
  (func (export "add") (param i32 i32) (result i32)
    local.get 0
    local.get 1
    i32.add))
```

The matching binary below avoids requiring a WAT compiler for the first experiment. The sections describe the function type, function, export and code. Real projects normally compile source/WAT with a pinned toolchain and verify the artifact, rather than hand-editing bytes.

```js [wasm-check.mjs]
import assert from "node:assert/strict";
const bytes = Uint8Array.from([
  0, 97, 115, 109, 1, 0, 0, 0, 1, 7, 1, 96, 2, 127, 127, 1, 127, 3, 2, 1, 0, 7,
  7, 1, 3, 97, 100, 100, 0, 0, 10, 9, 1, 7, 0, 32, 0, 32, 1, 106, 11,
]);
const { instance } = await WebAssembly.instantiate(bytes, {});
function add(a, b) {
  if (
    ![a, b].every(
      (n) => Number.isInteger(n) && n >= -2147483648 && n <= 2147483647,
    )
  )
    throw new TypeError("expected signed i32 inputs");
  return instance.exports.add(a, b);
}
assert.equal(add(20, 22), 42);
assert.equal(add(2147483647, 1), -2147483648);
assert.throws(() => add("1", 2));
assert.throws(() => add(2 ** 32, 2));
await assert.rejects(WebAssembly.compile(Uint8Array.from([0, 1, 2])));
const memory = new WebAssembly.Memory({ initial: 1, maximum: 2 });
const oldView = new Uint8Array(memory.buffer);
oldView[0] = 42;
memory.grow(1);
assert.equal(oldView.byteLength, 0);
const currentView = new Uint8Array(memory.buffer);
assert.equal(currentView[0], 42);
assert.equal(currentView.byteLength, 131072);
assert.throws(() => memory.grow(1), RangeError);
```

`i32.add` wraps modulo 2³²; JavaScript Number addition is not a drop-in oracle at overflow. i64 boundaries generally use BigInt. Strings/arrays require an agreed encoding, allocation, pointer/length and ownership contract. Validate bounds and avoid stale views after growth: the demonstration uses **unshared memory**, whose old buffer detaches on growth. Shared-memory behavior differs. Linear memory pages are 64KiB; a maximum bounds this memory, not all compilation/host resource costs.

Imports grant capabilities. A module without file/network imports does not thereby gain them, but imported JavaScript can expose them. Wasm does not automatically enforce execution deadlines or protect availability from infinite loops, huge compilation work or excessive host calls. WASI is a separate system-interface contract with its own capability/runtime limitations; it is not ordinary browser-style Wasm or a complete hostile-code sandbox.

<span class="notes-section-label">**Practice and acceptance**</span>

Compile an owned numeric function from WAT or a source language, compare boundary/overflow results with a deliberate reference and add a validated memory-transfer example. Accept with documented encoding/ownership, refreshed views and malformed-module/input tests. References: [Node with WebAssembly](https://nodejs.org/en/learn/getting-started/nodejs-with-webassembly), [WebAssembly specification](https://webassembly.github.io/spec/), [Node WASI security](https://nodejs.org/api/wasi.html).

---

## How do you choose and operate a specialist execution boundary? {#t12-q10}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Choose the simplest boundary that meets measured requirements, then validate its failure, deployment and resource contract. **Neither native code nor WebAssembly guarantees faster end-to-end requests or safe execution of hostile input.**

</div>

| Choice | Good reason | Cost/risk to investigate |
|---|---|---|
| JavaScript on main thread | Small bounded work | Event-loop latency if work grows |
| Worker thread | CPU work with manageable structured clone/transfer | Startup, queue bounds, memory and cancellation; shared process |
| Native Node-API addon | Required native library/hardware or measured hot path | Build/ABI/platform matrix, native crashes and lifecycle |
| WebAssembly | Portable computation with explicit imports and data boundary | Compilation, copying/encoding, host calls, integer/memory semantics |
| Separate process/service | Stronger crash boundary or distinct runtime | IPC/serialization, supervision, partial failure and deployment |

Benchmark the full path: cold compile/load, warm-up, useful work, data encoding/copying, queue time, concurrency, latency distribution and resident memory. Compare equivalent algorithms/results under the same workload. A million tiny cross-boundary calls can cost more than one batched operation. Measure batching against memory/latency constraints rather than removing all limits for a faster benchmark.

Use trusted artifacts and verify integrity/provenance, supported versions and deployment architecture. Test invalid inputs, oversized work, cancellation, initialization failure, shutdown during active work and missing incompatible binaries. In a process model, the supervisor owns deadline, kill and reaping; an ignored Promise timeout does not stop computation. A worker/process is not by itself a permissions sandbox: choose OS/container restrictions and narrow capabilities for the actual threat model.

<span class="notes-section-label">**Practice and acceptance**</span>

Add one justified specialist feature to the products service: bounded image/numeric processing or a real library integration. Keep a reference implementation, test equivalent results, measure end-to-end behavior and define rollback/fallback. Accept only with reproducible evidence, bounded queues/time/memory, clean shutdown and a release matrix. Advanced native threading, custom Wasm runtimes and multi-region real-time recovery may remain optional after this introductory implementation; record the limit rather than claiming mastery.

## Revision and mixed practice

1. Does a Redis adapter give a disconnected client durable replay automatically?
2. Does a Node-API binary built for macOS run unchanged on Linux?
3. Can a timed-out Promise stop a Wasm infinite loop on the main thread?

<span class="notes-section-label">**Answer guide — attempt the scenarios first**</span>

1. No. Check the selected adapter's persistence/recovery contract and provide authorized snapshot/replay fallback.
2. No. Stable Node-API does not erase OS, architecture, linker and external-library differences.
3. No. A blocked thread cannot run the timeout callback; use a controlled execution boundary and external termination where appropriate.
