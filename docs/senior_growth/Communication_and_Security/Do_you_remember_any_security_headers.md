# 🔐 Important Web Security Headers

Security headers are HTTP response headers that instruct browsers how to handle content, reducing the risk of attacks such as **XSS, clickjacking, or data injection**. As a senior front-end developer, knowing the most important headers is essential.

---

## 1. **Content Security Policy (CSP)**
- **Header:** `Content-Security-Policy`
- **Purpose:** Restricts which resources can be loaded/executed.
- **Protects against:** XSS, data injection, mixed content.
- **Example:**
```http
Content-Security-Policy: default-src 'self'; img-src https://images.example.com; script-src 'self' 'sha256-AbCd...'
```
* Only allows scripts from own domain and specific trusted sources.
* Can whitelist fonts, media, frames, and restrict inline scripts.

---

## 2. **Strict-Transport-Security (HSTS)**
* **Header:** `Strict-Transport-Security`
* **Purpose:** Forces browser to use HTTPS for all requests.
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
Referrer-Policy: no-referrer-when-downgrade
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
* **Purpose:** Controls which domains can access your resources.
* **Protects against:** Unauthorized cross-origin requests.
* **Example:**
```http
Access-Control-Allow-Origin: https://trusted.example.com
```

---

## 8. **Set-Cookie Security Attributes**
* Not exactly a header, but part of `Set-Cookie`.
* **HttpOnly** → JS cannot access cookie (protects against XSS)
* **Secure** → Cookie only sent over HTTPS
* **SameSite** → Protects against CSRF
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
| `Access-Control-Allow-Origin`           | Control cross-origin requests | Unauthorized API access     |
| `Set-Cookie` + HttpOnly/Secure/SameSite | Secure session storage        | XSS, CSRF                   |

---

> **Tip for Frontend Developers:**
> Even though most headers are configured on the backend, you must **understand their purpose**, test their effect in DevTools, and ensure your app is compatible with strict policies (like CSP or HSTS).

```markdown
### 🔒 Web Security Headers — How They Protect Your App (Diagram)

Here’s a simplified diagram showing **how key security headers protect the browser and frontend app**:

```
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
Browser Processes Headers:

1️⃣ HTTPS & HSTS

* Forces encrypted connection
* Prevents MITM / SSL stripping

2️⃣ CSP

* Only allows scripts/styles/images from trusted sources
* Prevents XSS & malicious content injection

3️⃣ X-Frame-Options

* Blocks framing of site
* Prevents clickjacking

4️⃣ X-Content-Type-Options

* Stops MIME sniffing
* Prevents browser from executing untrusted content

5️⃣ HttpOnly + Secure + SameSite Cookies

* HttpOnly: JS cannot access tokens → protects from XSS
* Secure: sent only over HTTPS
* SameSite: reduces CSRF attacks

Result: ✅ Browser renders page safely
```

**Summary:**  
- Each header layer protects against a specific threat (XSS, CSRF, clickjacking, MITM, MIME attacks).  
- Combined, they **create a strong defense-in-depth** for your frontend app.  

> Tip: Always test in **Chrome DevTools → Security tab** to ensure headers are effective.
