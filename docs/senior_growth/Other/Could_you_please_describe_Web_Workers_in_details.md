# 🔹 Web Workers

**Web Workers** are a browser feature that allows **JavaScript to run in background threads** separate from the main execution thread (UI thread). This is useful for **offloading heavy computations**, so the UI remains responsive.

---

## 1️⃣ Key Concepts

- JavaScript is **single-threaded** by default. Heavy computations can **block the main thread**, causing laggy UI.
- **Web Workers** run in a **separate thread**, meaning they **don’t block the main thread**.
- Communication between the main thread and workers happens via **message passing** (`postMessage`).

---

## 2️⃣ Types of Web Workers

1. **Dedicated Worker**
   - Only accessible by the script that created it.
   - Most common type.

2. **Shared Worker**
   - Can be accessed by **multiple scripts**, even from different browser windows (same origin).

3. **Service Worker**
   - Special worker for **network interception, caching, and offline support**.
   - Registration can outlive a page; the browser starts/stops the event-driven worker. It is not a persistent daemon.

---

## 3️⃣ Creating a Dedicated Web Worker

### worker.js
```javascript
// Heavy computation example
self.onmessage = function(event) {
  const data = event.data;
  if (!Number.isSafeInteger(data) || data < 0 || data > 1000000) throw new Error('Invalid work budget');
  let result = 0;
  for (let i = 0; i < data; i++) {
    result += i;
  }
  self.postMessage(result);
};
```

### main.js

```javascript
const worker = new Worker('worker.js');

worker.postMessage(1000000); // Toy bounded input; install all handlers before sending in real code.

worker.onmessage = function(event) {
  console.log('Result from worker:', event.data);
};

worker.onerror = function(error) {
  console.error('Worker error:', error.message);
};
```

---

## 4️⃣ Key Characteristics

* **No access to DOM**: Workers cannot manipulate the DOM directly.
* **Isolated global scope**: They run in their own scope (`self` instead of `window`).
* **Communication via messages**: `postMessage()` and `onmessage`.
* **Imports depend on worker type**: classic workers can use `importScripts`; module workers use standard `import` and must be created with `{type: 'module'}`.
* **Runs asynchronously**: Non-blocking for the main thread.

---

## 5️⃣ Benefits

* **Non-blocking UI** → smooth interactions and animations.
* **Parallel processing** → can handle heavy computations efficiently.
* **Ideal for data processing** → large loops, sorting, compression, image processing.

---

## 6️⃣ Limitations

* **Cannot access DOM** → cannot directly update the UI.
* **Overhead of message passing** → copying large objects can be expensive.
* **Browser support** → verify the precise dedicated/shared/module/service-worker features against target browsers; a historical basic-worker support claim does not cover every API.
* **Lifecycle management** → must terminate worker when done (`worker.terminate()`).

---

## 7️⃣ Use Cases

| Use Case                 | Explanation                                   |
| ------------------------ | --------------------------------------------- |
| Image processing         | Resize, filter, or manipulate large images    |
| Large array computations | Sorting, summing, or statistical calculations |
| Data fetching / parsing  | Parsing large JSON or CSV files               |
| Real-time analytics      | Processing streaming data without blocking UI |
| Encryption / decryption  | CPU-intensive cryptography                    |

---

### ✅ Best Practices

* **Terminate workers** when they are no longer needed.
* Use **Transferable objects** (`ArrayBuffer`) to avoid copying large data.
* Avoid **frequent message passing** for tiny data; batch messages if possible.
* Combine **Web Workers** with **UI optimization techniques** (requestAnimationFrame, debouncing) for responsive apps.

---

### ✅ Summary

* **Web Workers** = background threads for JS → keeps UI thread free.
* **Main thread ↔ Worker** communication via **postMessage/onmessage**.
* Great for **heavy computation, data processing, and maintaining responsive UI**.
* Cannot access DOM, has message passing overhead, but very powerful for parallelism in web apps.

> 💡 Senior Tip:
> Consider **Web Workers** when you notice UI freezes or long-running tasks. Use **Transferable objects** and terminate workers when done to optimize memory and performance.


## Worked ownership transfer, deadline and cancellation

Use a module worker for a bounded byte-sum job. The caller deliberately gives up ownership of an **ArrayBuffer**, not an arbitrary typed-array view. Transfer detaches that buffer and every caller view backed by it; do not reuse them. Copy explicitly when the caller still needs the bytes, and measure that cost. This example caps input at1MiB and creates one worker per call; a real high-frequency workload may justify a bounded pool instead.

`sum-worker.mjs`:

```js
self.onmessage = ({data}) => {
  if (data?.version !== 1 || !(data.buffer instanceof ArrayBuffer) || data.buffer.byteLength > 1024 * 1024) {
    self.postMessage({version: 1, error: 'Invalid job'}); return;
  }
  let sum = 0;
  for (const byte of new Uint8Array(data.buffer)) sum += byte;
  self.postMessage({version: 1, sum});
};
```

`sum-client.mjs`:

```js
export function sumBytes(buffer, {signal, timeoutMs = 2000,
  createWorker = () => new Worker(new URL('./sum-worker.mjs', import.meta.url), {type: 'module'})} = {}) {
  return new Promise((resolve, reject) => {
    if (!(buffer instanceof ArrayBuffer) || buffer.byteLength > 1024 * 1024) throw new RangeError('Owned buffer budget');
    if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 10000) throw new RangeError('Deadline budget');
    if (signal?.aborted) { reject(signal.reason); return; }
    const size = buffer.byteLength, worker = createWorker();
    let settled = false;
    const finish = outcome => {
      if (settled) return;
      settled = true; clearTimeout(timer); signal?.removeEventListener('abort', onAbort);
      worker.terminate();
      if (outcome.ok) resolve(outcome.sum); else reject(outcome.reason);
    };
    const onAbort = () => finish({ok: false, reason: signal.reason});
    const timer = setTimeout(() => finish({ok: false, reason: new Error('Worker deadline')}), timeoutMs);
    worker.addEventListener('message', ({data}) => {
      if (data?.version !== 1 || !Number.isSafeInteger(data.sum) || data.sum < 0 || data.sum > size * 255) {
        finish({ok: false, reason: new Error('Invalid worker result')}); return;
      }
      finish({ok: true, sum: data.sum});
    });
    worker.addEventListener('error', () => finish({ok: false, reason: new Error('Worker failed')}));
    worker.addEventListener('messageerror', () => finish({ok: false, reason: new Error('Worker message failed')}));
    signal?.addEventListener('abort', onAbort, {once: true});
    if (signal?.aborted) {onAbort(); return;}
    try { worker.postMessage({version: 1, buffer}, [buffer]); }
    catch { finish({ok: false, reason: new Error('Worker transfer failed')}); }
  });
}
```

Call with an owned buffer, for example `await sumBytes(new Uint8Array([1,2,255]).buffer, {signal})`. Listeners and a finite deadline are installed before transfer. Cancellation/timeout/error/success settle once, clear the timer/remove the abort listener and terminate the owned worker. A pre-aborted call starts no worker and retains the buffer. Falsy cancellation reasons such as `null` are preserved instead of accidentally treated as success. `createWorker` is a trusted test seam, not a factory to accept from untrusted message data.

Hard termination suits this isolated pure CPU job. It does not run arbitrary worker finally blocks or compensate external side effects. For cooperative cancellation messages, remember a worker stuck in a synchronous loop cannot process the cancel message until it yields. Abort/worker termination also cannot promise a remote write did not happen. Keep sensitive network/database work behind an explicit recovery contract.

**Actual local validation:** the same browser-shaped worker code ran through an owned Node24 worker_threads adapter. Tests proved transfer detachment, sum258, empty input, cancellation with null reason, pre-abort/no launch/no transfer, input/deadline rejection and termination of every owned Node worker. A controlled non-cooperative adapter verified the deadline. This verifies computation/ownership/lifetime under that adapter, not browser Worker loading, UI responsiveness or browser termination timing. The separate [service-worker policy lesson](../EngX_Quality/Rendering_and_Capability_Workflows.md#worked-public-offline-fallback) covers the distinct offline lifecycle.


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/specialists/Could_you_please_describe_Web_Workers_in_details.md). All learner practice remains outstanding.
