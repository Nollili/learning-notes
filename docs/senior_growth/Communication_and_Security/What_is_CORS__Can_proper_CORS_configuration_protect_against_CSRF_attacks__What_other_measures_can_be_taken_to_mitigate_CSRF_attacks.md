# 🌐 CORS and CSRF — Understanding the Difference and Mitigation

---

## 1️⃣ What is CORS?

**CORS (Cross-Origin Resource Sharing)** is a **browser security mechanism** that controls when browser JavaScript may read a cross-origin response.  

- **Origin:** combination of protocol + domain + port (e.g., `https://example.com:443`)  
- Browsers restrict cross-origin response reads; some cross-origin requests can still reach the server without CORS permission. Nonbrowser clients do not enforce this browser policy.

### How it works:
1. Browser sends a **request with `Origin` header**.
2. Server responds with **`Access-Control-Allow-Origin`** header to allow or deny the request.
3. Requests outside the CORS-safelisted method/header rules generally need a preflight OPTIONS. Safelisted methods include GET, HEAD and POST; allowed Content-Type values include application/x-www-form-urlencoded, multipart/form-data and text/plain under additional restrictions. application/json or a custom X-CSRF-Token header generally causes preflight.

**Example:**
```http
Request:
GET /api/data HTTP/1.1
Origin: https://frontend.com

Response:
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://frontend.com
```

**Key Headers:**

* `Access-Control-Allow-Origin` → which origins are allowed
* `Access-Control-Allow-Methods` → allowed HTTP methods
* `Access-Control-Allow-Headers` → allowed custom headers
* `Access-Control-Allow-Credentials` → allows a credentialed response to be shared when client credentials mode and other rules also permit it

---

## 2️⃣ Can CORS Protect Against CSRF?

**No, not fully.**

* **CSRF (Cross-Site Request Forgery)** occurs when a malicious website tricks a user’s browser into making **authenticated requests** to your site (e.g., using cookies or browser sessions).
* CORS **does not prevent CSRF by itself**, because:

    * Cookie sending depends on domain/path/Secure/SameSite, credentials mode and browser policy. A cross-site form can send an eligible cookie even when the attacker cannot read the response.
    * Wildcard ACAO cannot share credentialed responses with credentials mode include; it still does not establish that a state-changing request was rejected before side effects.

**Takeaway:**
CORS is primarily about **cross-origin data sharing**, not about preventing CSRF.

---

## 3️⃣ Measures to Mitigate CSRF

### a) **Use SameSite Cookies**

* Set session/auth cookies with **`SameSite=Strict`** or **`Lax`**.

```http
Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Strict
```

* `Strict` → restricts cross-site cookie sending. Site is not origin: https://app.example.com and https://other.example.com are cross-origin but same-site.
* `Lax` → permits eligible cookies on some cross-site safe top-level navigations; same-site requests follow normal cookie rules. Do not put writes behind GET.

### b) **CSRF Tokens**

* Server generates a unique token for each session/form.
* Token is sent with requests (usually in headers or hidden form fields).
* Server validates token before processing request.

```js
fetch('/api/transfer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
    body: JSON.stringify({ amount: 100 })
});
```

### c) **Double Submit Cookies**

* Store token in **cookie** and **request header**.
* Prefer a signed token cryptographically bound to the authenticated session, validated in both locations. A naive equality-only cookie/header pair can be vulnerable to cookie injection. Use the framework's maintained implementation rather than inventing signing/parsing rules.

### d) **Check Origin and Referer Headers**

* Validate `Origin` or `Referer` headers on **state-changing requests** (POST, PUT, PATCH, DELETE), with an explicit fail-closed policy for missing/null/untrusted provenance where appropriate.

### e) **Use SameSite + Anti-CSRF tokens**

* Modern best practice combines **SameSite cookies** with **CSRF tokens**.

---

## 4️⃣ Summary Table

| Security Concept         | Purpose                         | Protection Against                                  | Notes                                 |
| ------------------------ | ------------------------------- | --------------------------------------------------- | ------------------------------------- |
| **CORS**                 | Allow cross-origin requests     | Not CSRF; controls which origins can read responses | Only affects browser’s read access    |
| **SameSite Cookies**     | Restrict cross-site cookie sending | CSRF                                                | Recommended for all session cookies   |
| **CSRF Token**           | Unique per session/form         | CSRF                                                | Server-side validation required       |
| **Origin/Referer Check** | Validate request source         | CSRF                                                | Extra layer of defense                |
| **Double Submit Cookie** | Token in header + cookie        | CSRF                                                | Use signed/session-bound pattern and cookie-injection defenses |

---

### ✅ Key Takeaways

1. **CORS ≠ CSRF protection** — it controls cross-origin **read access**, not whether cookies are sent.
2. To prevent CSRF:

     * Use **SameSite cookies**
     * Use **anti-CSRF tokens**
     * Optionally validate **Origin/Referer headers**
3. Always combine multiple layers for robust protection in modern web apps.



## Read permission and write acceptance are separate decisions

For credentialed CORS responses, allow a specific trusted origin and Access-Control-Allow-Credentials:true, with a client credentials mode that permits cookies. Do not reflect arbitrary Origin. If response headers vary by Origin, merge Vary:Origin on every cacheable origin-dependent variant, including denied/no-origin variants as required by the cache design; do not overwrite existing Vary entries. Preflight policy must agree with the actual method/header/credential contract. A CORS error is not an HTTP authorization response the script can inspect.

| Browser scenario | Can request reach the server? | Required server decision |
|---|---|---|
| Cross-site form POST with safelisted content type and eligible session cookie | Yes, without preflight; attacker may be unable to read response | Reject invalid/missing CSRF proof before mutation |
| Cross-origin JSON fetch with custom CSRF header | Normally only after successful preflight | Validate session, CSRF token, origin policy, schema and ownership on actual request |
| Same-site sibling origin compromised | SameSite may still permit cookies | Exact trusted-origin policy and CSRF validation; same-site is not trusted-origin proof |
| Script running through XSS on the trusted origin | Can make authenticated requests and often obtain CSRF tokens | Prevent XSS and constrain impact; CSRF tokens/HttpOnly do not provide XSS immunity |

Use an existing framework's synchronizer token or signed/session-bound double-submit implementation. Keep tokens out of URLs/logs; bind/rotate them with the authenticated session and compare using the framework's safe validation. Origin/Referer and Fetch Metadata checks can add defense in depth but need an explicit supported-client/missing-header policy. CORS alone and SameSite alone are insufficient blanket policies for every application.

**Exercise acceptance:** in an isolated two-origin HTTPS lab, show a denied response read while a safelisted form request still reaches a harmless test endpoint; verify the protected write rejects it without state change. Test allowed/disallowed/null origins, missing/invalid/session-mismatched CSRF tokens, JSON preflight, credentialed wildcard failure and same-site sibling-origin behavior. Inspect server-side mutation counts, not only browser console errors. Include missing provenance and nonbrowser clients in the policy tests. No browser-network enforcement, production CSRF middleware or learner practice is proven by these request descriptions.

References checked2026-10-22: [Fetch CORS/credentials](https://fetch.spec.whatwg.org/#http-cors-protocol), [OWASP CSRF and signed double-submit](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html). Use the fuller Node networking/authentication material for server implementations and preserve task template configuration.
