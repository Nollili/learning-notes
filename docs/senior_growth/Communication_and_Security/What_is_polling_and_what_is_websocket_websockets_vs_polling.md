# 🔄 Polling vs WebSockets — Real-Time Communication

Modern web apps often need to **receive updates from the server in real-time**. Two common approaches are **polling** and **WebSockets**.

---

## 1️⃣ Polling

### 🔑 What It Is
Polling is a technique where the client **repeatedly sends HTTP requests** to the server at regular intervals to check for updates.

**Example:**
```js
setInterval(async () => {
    const response = await fetch('/api/notifications');
    const data = await response.json();
    updateUI(data);
}, 5000); // every 5 seconds
```

### ✅ Advantages

* Simple to implement.
* Works with **all browsers** and standard HTTP.
* No special server setup required.

### ❌ Disadvantages

* High overhead → repeated HTTP headers, multiple connections.
* Latency → updates are only received on the next poll.
* Wastes server and network resources if data rarely changes.
* Does not scale well for many users.

---

## 2️⃣ WebSockets

### 🔑 What It Is

WebSockets provide a **persistent, full-duplex TCP connection** between client and server.

* Client initiates handshake:

```js
const ws = new WebSocket('wss://example.com/updates');
ws.onmessage = event => updateUI(JSON.parse(event.data));
```

* Server can push updates **instantly** whenever they occur.

### ✅ Advantages

* Low latency → instant updates.
* Bi-directional → client and server can send messages any time.
* Efficient → single connection, no repeated headers.
* Scales better for real-time applications.

### ❌ Disadvantages

* More complex to implement on backend.
* Stateful → harder to scale horizontally.
* Some proxies/firewalls may block persistent connections.
* Requires HTTPS (`wss://`) for security.

---

## ⚖️ Polling vs WebSockets — Comparison Table

| Feature         | Polling                    | WebSockets                                  |
| --------------- | -------------------------- | ------------------------------------------- |
| Connection      | Short-lived per request    | Persistent                                  |
| Communication   | Client → Server only       | Bi-directional                              |
| Latency         | High (depends on interval) | Low (real-time)                             |
| Efficiency      | Low — repeated requests    | High — single connection                    |
| Complexity      | Simple                     | More complex                                |
| Scalability     | Poor for many users        | Better with proper backend                  |
| Browser Support | Universal                  | Modern browsers                             |
| Security        | HTTPS optional             | WSS recommended                             |
| Use Cases       | Non-critical updates       | Chat, live dashboards, notifications, games |

---

## 🧠 Best Practices

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

