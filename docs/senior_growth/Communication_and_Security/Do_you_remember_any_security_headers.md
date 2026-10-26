# 🔐 Important Web Security Headers

Security headers are HTTP response headers that instruct browsers how to handle content, reducing the risk of attacks such as **XSS, clickjacking, or data injection**. As a senior front-end developer, knowing the most important headers is essential.

---

## 1. **Content Security Policy (CSP)**
- **Header:** `Content-Security-Policy`
- **Purpose:** Restricts which resources can be loaded/executed.
- **Protects against:** XSS, data injection, mixed content.
- **Example:**
```http
Content-Security-Policy: default-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'
```
* This introductory same-origin allowlist is not a strict script policy; the worked nonce policy below narrows script execution. Never deploy a placeholder hash.
* Can whitelist fonts, media, frames, and restrict inline scripts.

---

## 2. **Strict-Transport-Security (HSTS)**
* **Header:** `Strict-Transport-Security`
* **Purpose:** Tells browsers to upgrade future requests to the HSTS host for the policy lifetime; accepted over HTTPS.
* **Protects against:** Man-in-the-middle attacks, SSL stripping.
* **Example:**
```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

---

## 3. **X-Content-Type-Options**
* **Header:** `X-Content-Type-Options`
* **Purpose:** Prevents MIME type sniffing.
* **Protects against:** Attacks where the browser interprets files incorrectly.
* **Example:**
```http
X-Content-Type-Options: nosniff
```

---

## 4. **X-Frame-Options**
* **Header:** `X-Frame-Options`
* **Purpose:** Prevents your site from being embedded in an iframe.
* **Protects against:** Clickjacking attacks.
* **Values:**
    * `DENY` → Never allow framing.
    * `SAMEORIGIN` → Allow framing only from same origin.
```http
X-Frame-Options: DENY
```

---

## 5. **Referrer-Policy**
* **Header:** `Referrer-Policy`
* **Purpose:** Controls what referrer info is sent with requests.
* **Protects privacy:** Prevents leaking sensitive URL info.
* **Example:**
```http
Referrer-Policy: strict-origin-when-cross-origin
```

---

## 6. **Permissions-Policy** (Formerly Feature-Policy)
* **Header:** `Permissions-Policy`
* **Purpose:** Controls which browser APIs/features are allowed (geolocation, camera, microphone, etc.).
* **Example:**
```http
Permissions-Policy: geolocation=(self), camera=()
```
* Only allows geolocation for own origin, disables camera access entirely.

---

## 7. **Cross-Origin Resource Sharing (CORS)**
* **Header:** `Access-Control-Allow-Origin`
* **Purpose:** Controls which origins browser JavaScript may read through CORS.
* **Protects against:** Unapproved cross-origin response reads; not server authorization or universal request blocking.
* **Example:**
```http
Access-Control-Allow-Origin: https://trusted.example.com
```

---

## 8. **Set-Cookie Security Attributes**
* Not exactly a header, but part of `Set-Cookie`.
* **HttpOnly** → JS cannot read this cookie; XSS can still perform authenticated actions
* **Secure** → Cookie only sent over HTTPS
* **SameSite** → Restricts cross-site cookie sending; defense in depth, not a complete CSRF policy
```http
Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Strict
```

---

## 🧠 Summary Table

| Header                                  | Purpose                       | Protects Against            |
| --------------------------------------- | ----------------------------- | --------------------------- |
| `Content-Security-Policy`               | Resource restrictions         | XSS, mixed content          |
| `Strict-Transport-Security`             | Force HTTPS                   | MITM attacks                |
| `X-Content-Type-Options`                | Prevent MIME sniffing         | Malicious content execution |
| `X-Frame-Options`                       | Block framing                 | Clickjacking                |
| `Referrer-Policy`                       | Control referrer info         | Privacy leaks               |
| `Permissions-Policy`                    | Control browser features      | API misuse                  |
| `Access-Control-Allow-Origin`           | Browser response-read policy | Unapproved cross-origin reads |
| `Set-Cookie` + HttpOnly/Secure/SameSite | Cookie confidentiality/transport/send restrictions | Some token theft/CSRF paths; not XSS immunity |

---

> **Tip for Frontend Developers:**
> Even though most headers are configured on the backend, you must **understand their purpose**, test their effect in DevTools, and ensure your app is compatible with strict policies (like CSP or HSTS).

### 🔒 Web Security Headers — How They Protect Your App (Diagram)

Here’s a simplified diagram showing **how key security headers protect the browser and frontend app**:

```md
User Browser
|
|  HTTPS Request
v
Server Response:
• Content-Security-Policy: default-src 'self'
• Strict-Transport-Security: max-age=31536000; includeSubDomains
• X-Frame-Options: DENY
• X-Content-Type-Options: nosniff
• Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Strict
|
v
```
**Browser Processes Headers:**

1️⃣ **HTTPS & HSTS**

* Forces encrypted connection
* Prevents MITM / SSL stripping

2️⃣ **CSP**

* Only allows scripts/styles/images from trusted sources
* Restricts execution/loading under its actual policy; does not sanitize injected content

3️⃣ **X-Frame-Options**

* Blocks framing of site
* Prevents clickjacking

4️⃣ **X-Content-Type-Options**

* Stops MIME sniffing
* Prevents browser from executing untrusted content

5️⃣ **HttpOnly + Secure + SameSite Cookies**

* HttpOnly: JS cannot read that cookie; injected script can still act as the user
* Secure: sent only over HTTPS
* SameSite: reduces CSRF attacks

**Result:** browser enforces supported, correctly delivered policies; application security still needs validation and testing.

**Summary:**  
- Each header layer protects against a specific threat (XSS, CSRF, clickjacking, MITM, MIME attacks).  
- Combined, they **create a strong defense-in-depth** for your frontend app.  

> Inspect actual response headers, browser console/policy violations and network behavior; a green Security tab alone does not establish CSP/CORS/CSRF correctness.


## A real nonce, matching markup and deliberate rollout

A CSP nonce must be unpredictable and generated anew per HTML response, then used in both that response's script-src and the intended script element. Do not reuse a static nonce, interpolate untrusted script/HTML or add unsafe-inline to silence violations. This Node24.18.0 stand-alone example uses only fixed markup and a generated base64 value; a real template still needs contextual escaping for every external value.

```js
// nonce-document.mjs
import { randomBytes } from 'node:crypto';
export function nonceDocument(reportOnly = true) {
  const nonce = randomBytes(24).toString('base64');
  const policy = `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'self'; img-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'`;
  return {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Content-Type-Options': 'nosniff',
      [reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy']: policy,
    },
    body: `<!doctype html><html lang="en"><meta charset="utf-8"><title>Nonce lab</title><body><p id="message"></p><script nonce="${nonce}">document.getElementById('message').textContent = 'Ready';</script></body></html>`,
  };
}
```

Start a controlled rollout in Report-Only to discover incompatible loading/execution paths; that mode does not block violations, including framing. Inspect violations and design a bounded, privacy-aware reporting endpoint/Reporting-Endpoints+report-to deployment separately; this function does not configure report delivery. Then enable enforcement and test allowed and blocked cases. Do not permit arbitrary origins or unsafe-eval merely to suppress reports. Framework streaming/SSR and caches must deliver matching nonce/header/markup per response; this simple example uses no-store rather than claiming compatibility with shared HTML caching.

A strict script policy limits XSS impact but does not replace safe DOM APIs, contextual encoding, sanitization of intentional rich HTML or dependency hygiene. frame-ancestors in the enforced response controls embedding; X-Frame-Options is a compatible fallback where appropriate. HSTS includeSubDomains/preload require all affected hosts to support HTTPS and a reviewed recovery plan; preload is not enabled merely by writing the token without list enrollment. Do not copy a long-lived HSTS policy onto unprepared subdomains.

strict-origin-when-cross-origin sends the full referrer for same-origin requests, origin-only cross-origin where permitted, and no referrer on HTTPS→HTTP downgrade. The older no-referrer-when-downgrade can disclose a full URL to another HTTPS origin. Use no-referrer when no referrer information should leave the document; keep secrets out of URLs regardless. Header availability/behavior must be tested against the browser support matrix.

**Exercise acceptance:** generate two responses and verify different nonces, exactly matching script/header values, fixed safe markup and selected report-only/enforced header. In an HTTPS browser lab, demonstrate intended script execution, a script without the nonce blocked under enforcement, report-only nonblocking behavior and allowed/denied framing. Inspect cross-origin referrer values without real secrets. Retain a rollout/rollback plan and assess third-party scripts, style policy and CSP reporting privacy. Node string checks do not prove browser enforcement or learner completion.

Authoritative references checked2026-10-22: [OWASP CSP](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html), [Referrer Policy specification](https://w3c.github.io/webappsec-referrer-policy/), [Fetch CORS](https://fetch.spec.whatwg.org/#http-cors-protocol). Cookie/CSRF boundaries are expanded in the adjacent CORS lesson.
