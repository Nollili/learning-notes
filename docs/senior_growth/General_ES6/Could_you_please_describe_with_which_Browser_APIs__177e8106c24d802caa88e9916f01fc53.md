### Could you please describe with which Browser APIs you've already worked with?

As a JavaScript developer, you would likely encounter and interact with a variety of **Browser APIs** depending on the type of web application you're building. Browser APIs provide functionality that allows JavaScript to interact with the web page and browser features, such as the Document Object Model (DOM), asynchronous operations, and browser-specific features.

The following examples introduce common Browser APIs and their use cases. They are study material; their presence is not evidence of personal implementation experience.

---

### **1. DOM (Document Object Model) API**

The **DOM API** allows you to interact with the structure of an HTML document (the web page) as a tree of objects.

- **Manipulating Elements**: You can select, modify, create, or remove HTML elements.
    - `document.getElementById()`
    - `document.querySelector()`
    - `document.createElement()`
    - `element.appendChild()`
- **Event Handling**: Attach event listeners to elements for user interactions.
    - `element.addEventListener()`
    - `element.removeEventListener()`

Example:

```jsx
const button = document.getElementById('myButton');
button.addEventListener('click', function() {
  alert('Button clicked!');
});
```

---

### **2. Fetch API**

The **Fetch API** provides an interface for making HTTP requests to servers. It replaces the older `XMLHttpRequest` and returns **Promises**, making it easier to handle asynchronous operations.

- **Making GET and POST requests** to retrieve or send data.
- **Promise-based** syntax for handling responses.

Example:

```jsx
fetch('https://api.example.com/data')
  .then(async response => {
    if (!response.ok) { await response.body?.cancel(); throw new Error(`HTTP ${response.status}`); }
    return response.json();
  })
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

---

### **3. Geolocation API**

The **Geolocation API** allows you to access the geographical location of the user's device. This is useful for applications that need to access the user's location, such as maps, weather apps, or location-based services.

- **Get User's Location**:
    - `navigator.geolocation.getCurrentPosition()`
    - `navigator.geolocation.watchPosition()` (for continuous updates)

Example:

```jsx
navigator.geolocation.getCurrentPosition(function(position) {
  console.log('Latitude: ' + position.coords.latitude);
  console.log('Longitude: ' + position.coords.longitude);
}, error => console.error('Location unavailable:', error.code), { timeout: 5_000, maximumAge: 60_000 });
```

---

### **4. LocalStorage and SessionStorage API**

Both **LocalStorage** and **SessionStorage** are part of the **Web Storage API**, which allows you to store data in the browser persistently (LocalStorage) or temporarily (SessionStorage).

- **LocalStorage**: Normally survives reload/reopen, subject to user clearing, privacy policy, eviction and access failures; it is not guaranteed durable or secret.
    - `localStorage.setItem()`
    - `localStorage.getItem()`
- **SessionStorage**: Scoped to an origin and top-level browsing context/page session; survives reload. Tab/session restoration can affect its lifetime; do not treat browser close as a security deletion guarantee.
    - `sessionStorage.setItem()`
    - `sessionStorage.getItem()`

Example:

```jsx
localStorage.setItem('username', 'JohnDoe');
let username = localStorage.getItem('username');
console.log(username); // Output: JohnDoe
```

---

### **5. Canvas API**

The **Canvas API** is used for drawing graphics and images directly onto the web page. It’s useful for games, data visualizations, image manipulation, and more.

- **Drawing Shapes and Images**: You can draw on a `<canvas>` element.
    - `getContext('2d')` for 2D graphics
    - `drawImage()`, `fillRect()`, `stroke()`, etc.

Example:

```jsx
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'blue';
ctx.fillRect(0, 0, 150, 75);  // Draw a blue rectangle
```

---

### **6. WebSockets API**

The **WebSockets API** provides a way to open a full-duplex communication channel between the client (browser) and a server, allowing real-time data exchange.

- **Real-time communication** for things like live chat, notifications, or multiplayer games.

Example:

```jsx
const socket = new WebSocket('wss://example.com/socket');
socket.onopen = function() {
  socket.send('Hello, Server!');
};
socket.onmessage = function(event) {
  console.log('Message from server: ' + event.data); // Parse/validate if a structured protocol is expected.
};
socket.onerror = () => console.error('Socket unavailable');
// Owner cleanup: socket.close(1000, 'View closed');
```

---

### **7. Service Workers API**

**Service Workers** allow you to run background scripts that can intercept network requests, cache resources, and enable **offline functionality**.

- **Caching** assets for offline use.
- **Push notifications** for users.
- Background data synchronization.

Example:

```jsx
navigator.serviceWorker.register('/service-worker.js')
  .then(function(registration) {
    console.log('Service Worker registered with scope:', registration.scope);
  })
  .catch(function(error) {
    console.log('Service Worker registration failed:', error);
  });
```

---

### **8. Web Audio API**

The **Web Audio API** provides the ability to process and generate audio directly in the browser. This is useful for building sound effects, music synthesis, and other interactive audio experiences.

- **Processing Audio** with nodes and audio graphs.
- **Generating Sound** from scratch, adding effects, and even analyzing audio data.

Example:

```jsx
// Invoke inside an explicit user gesture; autoplay policy can require resume().
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const oscillator = audioContext.createOscillator();
oscillator.type = 'sine';
oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // 440Hz (A note)
oscillator.connect(audioContext.destination);
oscillator.start();
oscillator.stop(audioContext.currentTime + 0.2);
oscillator.onended = () => { oscillator.disconnect(); void audioContext.close().catch(console.error); };
```

---

### **9. Notification API**

The **Notification API** allows web pages to display native system notifications outside the browser window.

- Useful for sending **push notifications** or **alerts** when the user is not actively using the site.

Example:

```jsx
// Invoke this block only from an explicit notification opt-in action.
if ('Notification' in window && Notification.permission === 'granted') {
  new Notification('Hello, this is a notification!');
} else if ('Notification' in window && Notification.permission !== 'denied') {
  Notification.requestPermission().then(function(permission) {
    if (permission === 'granted') {
      new Notification('Hello, this is a notification!');
    }
  });
}
```

---

### **10. File API**

The **File API** allows web applications to access files on the client’s device, such as uploading files or reading them in JavaScript.

- **FileReader**: Read the contents of files.
- **File API**: Handle file uploads.

Example:

```jsx
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', function() {
  const file = fileInput.files?.[0];
  if (!file) return; // User cancelled/cleared selection.
  if (file.size > 1_000_000) { console.error('File too large'); return; }
  const reader = new FileReader();
  reader.onload = function(e) {
    console.log('File content:', e.target.result);
  };
  reader.onerror = () => console.error('File read failed');
  reader.onabort = () => console.log('File read cancelled');
  reader.readAsText(file); // Treat content as untrusted data; never inject as HTML.
  // Owner cleanup during an active read: reader.abort().
});
```

---

### **11. Intersection Observer API**

The **Intersection Observer API** provides a way to observe changes in the intersection of an element with the viewport (or another element). It's useful for tasks like lazy loading images, infinite scrolling, or animations when elements come into view.

- **Detecting when elements enter or exit the viewport**.

Example:

```jsx
const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log('Element is in the viewport!');
    }
  });
}, { threshold: 0.5 });

const target = document.querySelector('#myElement');
if (target) observer.observe(target);
// Owner cleanup: observer.disconnect();
```

---

### **12. Vibration API**

The **Vibration API** allows you to make the device vibrate, which can be used for notifications, haptic feedback, or in games.

Example:

```jsx
navigator.vibrate([200, 100, 200]);  // Vibrate for 200ms, pause for 100ms, then vibrate for 200ms.
```

---

### **Conclusion**

These are examples of Browser APIs to practice, and each provides unique functionality for interacting with the browser environment. Depending on your application’s needs, you may find yourself using various combinations of these APIs to enhance user experience and interactivity.

If you’re building a specific type of web application, some APIs (like **WebRTC** for real-time communication, **WebGL** for 3D graphics, or **Push API** for notifications) may be particularly useful to explore as well!
## DOM collections, mutation and ownership

querySelector returns one Element or null. querySelectorAll returns a static NodeList snapshot; getElementsByClassName returns a live HTMLCollection; childNodes is a live NodeList and includes text/comment nodes. Do not infer liveness from the word NodeList alone. Removing items while indexing a live collection can skip entries; snapshot it with Array.from before mutation or deliberately consume its first item repeatedly.

```js
const list = document.querySelector('#tasks');
if (!list) throw new Error('Expected task list');
const live = list.getElementsByClassName('task');
const snapshot = list.querySelectorAll('.task');
const row = document.createElement('li');
row.className = 'task';
row.dataset.row = 'new';
row.textContent = 'Untrusted <img onerror=...> stays text';
list.append(row);
console.log(live.length, snapshot.length); // Live grows; static snapshot retains original membership.
for (const task of Array.from(live)) task.classList.add('ready');
```

textContent creates text rather than parsing markup; innerHTML is an injection sink for untrusted input. Build nodes or use a reviewed sanitizer for intentionally permitted rich HTML. Assigning a URL still needs a scheme/origin/domain policy: text escaping alone does not make javascript URLs safe. cloneNode does not copy listeners registered by addEventListener. Replacing nodes can lose focus/selection/listener state; preserve identity when a user is editing.

## Capture, target, bubble and default action

A bubbling click travels through ancestors in capture, reaches the target, then traverses ancestors in bubble. target identifies the dispatched/retargeted source; currentTarget is the listener owner during its callback. A capture listener uses `{capture:true}`. Not all events bubble (focus/blur and pointerenter/leave are examples); focusin/focusout or a capture strategy may suit delegation.

```js
const owner = new AbortController();
const outer = document.querySelector('#outer');
const inner = document.querySelector('#inner');
if (!outer || !inner) throw new Error('Expected event fixture');
outer.addEventListener('click', () => console.log('outer capture'), { capture: true, signal: owner.signal });
inner.addEventListener('click', () => console.log('target'), { signal: owner.signal });
outer.addEventListener('click', () => console.log('outer bubble'), { signal: owner.signal });
// Clicking inner logs outer capture, target, outer bubble (absent other intervening listeners).
// Dispose this fixture's listeners: owner.abort();
```

preventDefault cancels a cancelable default action; it does not stop propagation. A passive listener cannot cancel the default. stopPropagation stops traversal to later targets but not other listeners already scheduled on the same target; stopImmediatePropagation also prevents later listeners on that target. Avoid blanket propagation suppression: it can break composition, analytics and keyboard behavior. Native buttons/links already provide default keyboard activation; do not recreate every key handler on a div.

## Delegation with a bounded action contract

```html
<ul id="task-actions">
  <li data-row="a">Draft <button type="button" data-action="remove"><span>Remove draft</span></button></li>
</ul>
```

```js
function installTaskActions(root) {
  const owner = new AbortController();
  root.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest('button[data-action]');
    if (!button || !root.contains(button) || button.disabled) return;
    if (button.dataset.action !== 'remove') return; // Explicit allowlist; no eval/dynamic global lookup.
    const row = button.closest('[data-row]');
    if (!row || !root.contains(row)) return;
    row.remove(); // Local demonstration only; real persistence requires server authorization.
  }, { signal: owner.signal });
  return () => owner.abort();
}
// const dispose = installTaskActions(document.querySelector('#task-actions'));
// Validate root exists at setup, then call dispose when the feature unmounts.
```

Delegation supports dynamically added rows and clicks on the nested span; matching only event.target would miss those. Nested independent widgets require an ownership boundary so the outer delegate does not also handle inner actions. In Shadow DOM, event retargeting/composed boundaries change visible targets; use intentional public CustomEvents and inspect composedPath where appropriate, not assumptions about private internal nodes.


**Capability failure checklist:** feature-detect optional APIs; permissions require a user-initiated product reason and denial/error UI; geolocation needs secure context and finite timeout; watchPosition needs clearWatch; audio/notification behavior depends on activation/platform; service workers can be terminated and must persist necessary state; storage can throw/be evicted. Never interpret API presence as guaranteed permission or durable storage.

Official references: [WHATWG DOM events/collections](https://dom.spec.whatwg.org/), [HTML storage](https://html.spec.whatwg.org/multipage/webstorage.html), [OWASP DOM XSS prevention](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html). Checked2026-10-20; examples target current evergreen browsers with AbortSignal listener support; verify the declared compatibility matrix.

## Same-origin policy: which boundary is being protected?

An ordinary web origin is scheme+host+effective port. Paths do not separate authority; https://app.example/a and /admin share an origin, while https://api.example is different even if both services belong to one organization. Same-site cookie rules use a different concept (including the registrable-domain/site relationship); same-site does not imply same-origin DOM access. Some documents have opaque origins, serialized as `null`, such as certain sandbox/data contexts. Do not allow every `null` origin because one expected embedded document uses it.

| Operation | Cross-origin behavior/decision |
|---|---|
| Read another iframe/window's DOM | Generally blocked with a SecurityError; CORS does not grant DOM access |
| Hold an iframe/popup reference | A restricted WindowProxy can remain available; allowed operations do not imply full document access |
| Fetch another origin | CORS controls browser script response access; many requests can still be sent, so server auth/CSRF remain necessary |
| Embed image/script/frame | Separate loading/CSP/framing/CORP rules apply; successful embedding is not permission to read all contents |
| Draw an unapproved cross-origin image into canvas | Can taint the canvas and block pixel export/readback; verify the image/CORS setup |
| Read localStorage/IndexedDB from another origin | Not shared by default; embedded contexts may also be partitioned/blocked by browser privacy policy |
| Cookie storage/delivery | Domain/path/Secure/SameSite/HttpOnly and browser policy apply; cookie scope is not a universal DOM origin grant |
| postMessage | Deliberate message channel with sender/receiver validation; it does not lift general DOM/storage restrictions |

A cross-origin WindowProxy can survive navigation while its underlying document changes. event.source alone is therefore insufficient: verify the sender origin too. event.origin describes the sender at message-send time; do not assume it guarantees the referenced window is still showing that document later. Cross-Origin-Opener-Policy can sever opener relationships, and sandbox flags/CSP frame-ancestors change whether a frame can load or what authority it has. document.domain relaxation is obsolete/deprecated and constrained by modern origin isolation; do not adopt it as the primary integration strategy. postMessage or a server-mediated API provides an explicit contract.

Storage is not automatically an authentication boundary against same-origin JavaScript/XSS. localStorage commonly persists across reloads, but eviction/private mode/user clearing/policy can remove it; access may throw. sessionStorage is also tied to the page session/top-level context. Third-party partitioning/storage-access behavior depends on browser and embedding context; do not promise an origin has one universally shared bucket across every top-level site. Keep credential/session policy server-owned, validate restored values and never infer login merely from an editable storage flag.

### A narrow parent/iframe request-response protocol

The example requests a light/dark **display preference**, not a token or privileged action. Both origins are trusted application configuration. The parent permits one request at a time with a random correlation ID, timeout and navigation/disposal cleanup. It validates exact origin, expected window, protocol type and payload. The nonce prevents accidental stale response matching; it does not authenticate a compromised trusted origin.

```js
// Parent app, after locating the iframe; no DOM access inside the child is attempted.
export function createThemeFrameClient(frame, childOrigin, timeoutMs = 2_000) {
  const parsed = new URL(childOrigin);
  if (!['https:', 'http:'].includes(parsed.protocol) || parsed.origin !== childOrigin ||
      !Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30_000)
    throw new TypeError('Expected an exact trusted origin and finite timeout');
  let pending = null;
  let disposed = false;
  const failPending = error => {
    if (!pending) return;
    const current = pending; pending = null;
    clearTimeout(current.timer); current.reject(error);
  };
  const onMessage = event => {
    if (event.origin !== childOrigin || event.source !== frame.contentWindow || !pending) return;
    const value = event.data;
    if (!value || typeof value !== 'object' || Array.isArray(value) ||
        value.type !== 'theme-result' || value.id !== pending.id ||
        !['light', 'dark'].includes(value.theme) ||
        Object.keys(value).some(key => !['type', 'id', 'theme'].includes(key))) return;
    const current = pending; pending = null; clearTimeout(current.timer);
    current.resolve(value.theme);
  };
  const onLoad = () => failPending(new Error('Frame navigated; request again after readiness'));
  window.addEventListener('message', onMessage);
  frame.addEventListener('load', onLoad);
  return {
    requestTheme() {
      if (disposed) return Promise.reject(new Error('Frame client disposed'));
      if (pending) return Promise.reject(new Error('A theme request is already pending'));
      const target = frame.contentWindow;
      if (!target) return Promise.reject(new Error('Frame window unavailable'));
      return new Promise((resolve, reject) => {
        const id = crypto.randomUUID();
        const timer = setTimeout(() => failPending(new Error('Theme request timed out')), timeoutMs);
        pending = { id, timer, resolve, reject };
        try { target.postMessage({ type: 'get-theme', id }, childOrigin); }
        catch (error) { failPending(error); }
      });
    },
    dispose() {
      if (disposed) return;
      disposed = true; failPending(new Error('Frame client disposed'));
      window.removeEventListener('message', onMessage);
      frame.removeEventListener('load', onLoad);
    }
  };
}
```

```js
// Child application at its configured origin. parentOrigin is trusted deployment config.
export function installThemeResponder(parentOrigin, readTheme) {
  const parsed = new URL(parentOrigin);
  if (!['https:', 'http:'].includes(parsed.protocol) || parsed.origin !== parentOrigin)
    throw new TypeError('Expected an exact parent origin');
  const onMessage = event => {
    if (event.origin !== parentOrigin || event.source !== window.parent) return;
    const value = event.data;
    if (!value || typeof value !== 'object' || Array.isArray(value) ||
        value.type !== 'get-theme' || typeof value.id !== 'string' ||
        !/^[0-9a-f-]{36}$/i.test(value.id) ||
        Object.keys(value).some(key => !['type', 'id'].includes(key))) return;
    let theme;
    try { theme = readTheme(); } catch { return; } // Caller times out; no thrown message handler.
    if (!['light', 'dark'].includes(theme)) return;
    // Exact destination even if the parent has navigated since sending the request.
    window.parent.postMessage({ type: 'theme-result', id: value.id, theme }, parentOrigin);
  };
  window.addEventListener('message', onMessage);
  return () => window.removeEventListener('message', onMessage);
}
```

Install the child listener before initiating the request; a ready handshake can make this explicit when startup is asynchronous. The parent should call after frame load/readiness and dispose on owner unmount. Ignore unexpected/late messages; never render message data with innerHTML, eval it or navigate to an arbitrary supplied URL. Structured clone supports objects without manual JSON transport, but it is not schema validation. Do not send secrets with targetOrigin:'*'. Transferred MessagePorts/ArrayBuffers have separate ownership and authorization contracts.

The responder contains a readTheme failure by declining a response, so the parent reaches its bounded timeout; add safe diagnostics/error UI to the real integration. readTheme is synchronous, and a real service also needs rate/capacity policy. For state-changing operations, authorize the requested action server-side and add replay/idempotency controls; this benign preference protocol is not a login/payment bridge. Same-origin compromise can send convincing messages because all code at that origin shares its authority. frame sandboxing must preserve only the capabilities the integration needs; do not add broad allow flags to bypass a failed check.


References checked2026-10-21: [HTML origins/browsing contexts](https://html.spec.whatwg.org/multipage/browsers.html), [cross-document messaging](https://html.spec.whatwg.org/multipage/web-messaging.html), [WindowProxy](https://html.spec.whatwg.org/multipage/nav-history-apis.html), [Storage Standard](https://storage.spec.whatwg.org/), [Fetch CORS](https://fetch.spec.whatwg.org/#http-cors-protocol).


## Browser storage budgets and recoverable persistence

Choose storage by data and failure semantics. Web Storage is synchronous string key/value storage; large serialization or repeated writes can block an interaction. IndexedDB provides asynchronous structured-clone records, transactions and indexes. Cache API stores request/response representations under a separate cache policy; it is not interchangeable with a queryable draft database. These stores can share origin-level storage pressure and may be partitioned by embedding/privacy policy. Avoid fixed “every browser gives exactly X MB” promises.

navigator.storage.estimate() reports estimates, not a reservation or guarantee that the next write succeeds. A storage write can fail with QuotaExceededError; a getter/open can fail due to policy/security, and JSON.stringify/parse can fail before/after the storage API. Cycles/BigInt, malformed JSON, unknown future schema and values exceeding application size limits need explicit handling. Project only supported fields, validate restored unknown values and keep data-format versions separate from the IndexedDB database schema version.

Best-effort data can be evicted under browser/device policy. navigator.storage.persist() requests persistence where supported; a returned false is a valid denial, not an exception to ignore. Persistent status is not a backup and does not prevent user clearing or authorize sensitive storage. If a local draft is the user's only copy, communicate its save state and offer a deliberate export/server-sync recovery path. Do not “repair” a quota error by clearing all site data and discarding the user's work.

Remove bounded disposable cache entries first, preserve unsynced drafts, and keep editing in memory when possible. Logout/account changes require explicit local data ownership/deletion policy; client-side storage cannot authorize a server action.

### Reuse one versioned Web Storage owner

The [preference codec and persistence owner](../React/React_state_management_and_tools.md#versioned-persistence-is-a-boundary-not-a-dump-of-the-store) already provide the primary worked small-string example: v1migration/v2projection,2048character parse limit, unknown/corrupt schema failure, initial read before writes and memory-only recovery on access/serialization/quota failure. Keep one owner instead of copying another incompatible codec into this API overview. Access window.localStorage inside try/catch before passing it to the owner; that getter can throw too.

The storage event fires in other documents sharing the relevant storage area, not the document that performed the write. localStorage can notify other same-origin tabs subject to storage partitioning; sessionStorage is tied to the same top-level browsing context, so it is not a general cross-tab channel. key=null means a clear event; removeItem produces newValue=null. Events are notifications, not an atomic cross-tab compare-and-set or locking protocol.

Re-read the current value when processing a delayed event and suppress echo writes while applying remote state. Own-document state changes should update its store directly; manually firing a storage event does not create native synchronization guarantees.

**Worked race:** tabA writes light, then tabB writes dark before tabA processes the first notification. Applying an old event payload and persisting it can restore light incorrectly. The shared owner now rereads the current stored dark snapshot and does not write while applying it. A queued clear event followed by a newer write similarly rereads the newer state rather than blindly resetting it. This still implements last-write-wins preferences, not conflict-free editing or atomic multi-tab transactions; multi-step document drafts need a stronger version/conflict policy.


Storage references checked2026-10-22: [HTML Web Storage and events](https://html.spec.whatwg.org/multipage/webstorage.html), [Storage Standard quota/persistence model](https://storage.spec.whatwg.org/), [IndexedDB transactions/schema](https://www.w3.org/TR/IndexedDB/). The linked IndexedDB3 document is a working draft; this course uses established API mechanisms and must separately test deployment support. Continue with the [versioned IndexedDB and offline draft lesson](./Browser_Storage_and_Offline_Drafts.md) for schema upgrades, transaction completion, local revision conflicts and the server-sync recovery exercise.


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/general_es6/Could_you_please_describe_with_which_Browser_APIs__177e8106c24d802caa88e9916f01fc53.md). All learner practice remains outstanding; the worked examples above are explanatory material.
