# Where do you prefer to store auth token? Where is it most secure?

# 🔐 Storing Authentication Tokens — Best Practices

Choosing **where to store auth tokens** (like JWTs or session tokens) is critical for **security, XSS/CSRF protection, and performance**.

---

## ⚙️ Common Storage Options

| Storage Location           | Description | Pros | Cons / Risks |
|----------------------------|------------|------|--------------|
| **LocalStorage**           | Browser key-value store | Easy to use, persists across tabs | Vulnerable to **XSS** (attacker can read/write token) |
| **SessionStorage**         | Browser key-value store per tab | Easy to use, cleared on tab close | Vulnerable to **XSS**, not shared across tabs |
| **Cookies (HttpOnly, Secure)** | Sent automatically with requests | Cookie value is unreadable to JS; works with backend sessions, but XSS can still act as the user | Cookie-authenticated writes need a CSRF policy; SameSite is defense in depth, with cookie size/scope limits |
| **In-memory (JS variable / Redux store)** | Stored only in runtime memory | Not persisted; explicit Bearer transport avoids automatic cookie attachment, but storage alone does not determine CSRF exposure | Lost on page reload / tab close; vulnerable if XSS can access memory |

---

## 🔑 Security Considerations

### 1. XSS (Cross-Site Scripting)
- If token is accessible via JS (`localStorage`, `sessionStorage`, in-memory), malicious scripts can steal it.
- Mitigation:
    - HttpOnly prevents JavaScript cookie reads; it does not prevent injected code from issuing authenticated requests.
    - Use contextual output encoding, safe DOM APIs and appropriate rich-content sanitization; validate inputs and apply a tested CSP as defense in depth.

### 2. CSRF (Cross-Site Request Forgery)
- Eligible cookies can accompany attacker-triggered requests; scope, SameSite, credentials mode and browser policy determine sending.
- Mitigation:
    - Use `SameSite=Lax` or `Strict` on cookies.
    - Use CSRF tokens for state-changing requests.
    - Consider sending tokens in **Authorization headers** instead of cookies for APIs.

### 3. Persistence & Tab Sharing
- Cookies persist across tabs; localStorage persists even after browser close.
- SessionStorage only lasts as long as the tab.

### 4. Token Lifetime
- Short-lived tokens reduce risk if stolen.
- Use **refresh tokens** securely (preferably in HttpOnly cookies).

---

## 🔧 Recommended Approaches

### **A. Primary same-origin browser design: cookie session**
- Keep an opaque session identifier in a host-scoped HttpOnly, Secure cookie; resolve authorization on the server.
- If federation needs provider refresh tokens, a backend session design can keep them server-side.
- Set `SameSite` to `Strict` or `Lax`.

```http
Set-Cookie: __Host-session=<opaque-random-session-id>; HttpOnly; Secure; SameSite=Lax; Path=/
```

* This placeholder represents a cryptographically random server-issued session ID. Omit Domain for the __Host- prefix; cookie sending still follows scope/credentials/SameSite/browser rules.
* Hides the cookie value from JavaScript, while XSS can still make authenticated calls. Protect writes against CSRF and prevent XSS independently.

---

### **B. For Single-Page Apps with APIs**

* **Access token in memory** (JS variable) — lost on refresh, reduces XSS exposure.
* A refresh endpoint may use a separate protected cookie/session policy; that endpoint itself needs CSRF/provenance, rotation/reuse handling and bounded concurrency. Reauthentication is an alternative.
* Combine with HTTPS → prevents MITM attacks.

---

### **C. Avoid**

* Storing tokens in localStorage if sensitive actions are protected only via token.
* Treating memory as an XSS boundary, or adding refresh merely to avoid a deliberate reauthentication policy.

---

## 🔑 Summary Table

| Storage         | XSS Risk | CSRF Risk | Persistence     | Best Use Case                        |
| --------------- | -------- | --------- | --------------- | ------------------------------------ |
| LocalStorage | JS-readable/exfiltratable | Determined by transport, not storage | Persistent | Prefer for nonsensitive app preferences, not session identifiers |
| SessionStorage | JS-readable/exfiltratable | Determined by transport | Tab scoped (restore behavior varies) | Temporary nonsensitive data |
| HttpOnly Cookie | Value hidden; XSS actions remain | Automatic eligible-cookie transport needs CSRF defenses | Session/expiry policy | Opaque server session |
| In-memory | XSS can use/exfiltrate accessible tokens | Explicit Bearer differs from automatic cookies | Lost on reload | Short-lived API-token alternative |

---

## Storage is not transport or authorization

No location makes an application immune to XSS. Keep token values out of Redux/devtools persistence, URLs, analytics and error logs. A cookie-session boundary reduces JavaScript token exposure but requires session/CSRF lifecycle management. A memory Bearer design avoids persisting the token across reloads but still trusts executing origin scripts. Choose one documented primary flow instead of copying pieces from both.

<<< ../../workbench/engineering/security/cookie-profile.mjs{js}

The session cookie is attached by the browser; this function neither reads document.cookie nor creates an Authorization header. Obtain the session-bound CSRF token through the application's trusted bootstrap/framework flow and keep it out of logs/URLs. The request owner supplies an AbortSignal/deadline and handles errors; canceling a request does not undo a server write. A204 is the expected endpoint contract, not proof from client code that authorization/CSRF checks happened.

The server must enforce every rule independently. Do not automatically retry after a timeout or401 without reconciling the mutation/session state.

For a separately designed cross-origin API, credentials:include alone is insufficient: eligible cookie attributes, exact credentialed CORS policy and browser third-party-cookie restrictions also apply. SameSite=None requires Secure in modern browsers, but does not override browser blocking/partitioning. A same-origin backend-for-frontend can avoid some cross-site cookie dependencies, at the cost of owning session storage/proxy security. Memory tokens and refresh cookies still create two distinct transport/lifecycle boundaries.


References checked2026-10-22: [OWASP browser storage](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html), [session lifecycle/cookies](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [Fetch credentials/CORS](https://fetch.spec.whatwg.org/#http-cors-protocol). Applicable browser versions/policies must be included in the hands-on evidence.


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/security/Where_do_you_prefer_to_store_auth_token__Where_is_it_most_secure.md). All learner practice remains outstanding.
