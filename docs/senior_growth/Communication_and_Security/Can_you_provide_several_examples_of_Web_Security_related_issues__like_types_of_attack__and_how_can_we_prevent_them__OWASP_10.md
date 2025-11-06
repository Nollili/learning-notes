# 🌐 Web Security — Common Vulnerabilities & Prevention (OWASP Top 10 Overview)

As a **senior front-end developer**, it’s critical to understand **web security risks**, common **attack vectors**, and how to mitigate them — both in the frontend and backend integration.

---

## 🔟 OWASP Top 10 (2021 Edition)

| # | Category | Description |
|---|-----------|-------------|
| **A01** | **Broken Access Control** | Unauthorized access to data or actions (e.g., normal user accessing admin endpoints). |
| **A02** | **Cryptographic Failures** | Sensitive data exposed due to weak or missing encryption. |
| **A03** | **Injection** | Unvalidated input alters commands or queries (e.g., SQL Injection, NoSQL, LDAP). |
| **A04** | **Insecure Design** | Missing security patterns at design level (e.g., insecure workflows). |
| **A05** | **Security Misconfiguration** | Misconfigured headers, open ports, exposed stack traces. |
| **A06** | **Vulnerable & Outdated Components** | Using outdated libraries or frameworks with known vulnerabilities. |
| **A07** | **Identification & Authentication Failures** | Weak login flows, session hijacking, poor password handling. |
| **A08** | **Software & Data Integrity Failures** | Untrusted CI/CD pipelines, tampered dependencies. |
| **A09** | **Security Logging & Monitoring Failures** | No logs or delayed detection of breaches. |
| **A10** | **Server-Side Request Forgery (SSRF)** | Server fetches malicious external resources on attacker’s behalf. |

---

## ⚔️ Common Web Security Attacks & Prevention

### 1. **Cross-Site Scripting (XSS)**
**Attack:**  
An attacker injects malicious JavaScript into a trusted site (e.g., through user input or query params).  
**Impact:**  
Steal cookies, tokens, or perform actions as the user.

**Prevention:**
- Escape user input before rendering (`innerText`, not `innerHTML`).
- Use Content Security Policy (CSP) headers.
- Sanitize input on backend and frontend.
- React automatically escapes JSX → XSS harder but still possible via `dangerouslySetInnerHTML`.

```jsx
// ❌ Risky
<div dangerouslySetInnerHTML={{ __html: userComment }} />

// ✅ Safe
<div>{userComment}</div>
```

---

### 2. **Cross-Site Request Forgery (CSRF)**

**Attack:**
An attacker tricks a logged-in user into sending a forged request (e.g., through hidden forms or images).

**Prevention:**

* Use **CSRF tokens** in POST requests.
* Use **SameSite cookies** (`SameSite=Lax` or `Strict`).
* Validate origin and referrer headers on backend.
* Prefer `fetch` with explicit credentials handling.

---

### 3. **SQL / NoSQL Injection**

**Attack:**
Malicious input manipulates a database query.

**Example:**
`" OR 1=1; DROP TABLE users;--"`

**Prevention:**

* Always use **parameterized queries** or ORM libraries.
* Validate and sanitize user inputs.
* Never concatenate user input directly in queries.

---

### 4. **Clickjacking**

**Attack:**
An attacker overlays a transparent iframe of your site to trick users into clicking hidden buttons.

**Prevention:**

* Add security headers:

    ```http
    X-Frame-Options: DENY
    ```

    or

    ```http
    Content-Security-Policy: frame-ancestors 'none';
    ```

---

### 5. **Man-in-the-Middle (MITM)**

**Attack:**
Intercepting and altering data between client and server.

**Prevention:**

* Always use **HTTPS** (HSTS headers).
* Verify SSL/TLS certificates.
* Avoid sending tokens or credentials over plain HTTP.

---

### 6. **Insecure Deserialization**

**Attack:**
Untrusted serialized data causes remote code execution when deserialized on backend.

**Prevention:**

* Validate input before deserialization.
* Avoid using unsafe deserialization in frontend storage (e.g., `eval` or parsing user-controlled strings).

---

### 7. **Sensitive Data Exposure**

**Attack:**
Personal data (like tokens or passwords) exposed through logs, URLs, or localStorage.

**Prevention:**

* Never store tokens in `localStorage` (use `HttpOnly` cookies if possible).
* Use **HTTPS** and **encryption at rest**.
* Mask sensitive fields in logs.

---

### 8. **Denial of Service (DoS / DDoS)**

**Attack:**
Overwhelming a server or client app with excessive requests or heavy computation.

**Prevention:**

* Rate limiting, caching, request throttling.
* On frontend: avoid heavy loops, memory leaks, or oversized bundle execution.

---

### 9. **Open Redirects**

**Attack:**
User is redirected to a malicious site via a crafted URL (e.g., `/redirect?to=http://evil.com`).

**Prevention:**

* Validate and whitelist redirect URLs.
* Never trust redirect targets from query parameters.

---

### 10. **Supply Chain Attacks**

**Attack:**
Malicious dependency or compromised CI/CD pipeline injects unwanted code.

**Prevention:**

* Use `npm audit`, `Snyk`, or GitHub Dependabot.
* Pin dependency versions.
* Use signed packages and secure CI/CD secrets.

---

## 🧱 Frontend Developer Security Practices

| Area             | Best Practice                                                         |
| ---------------- | --------------------------------------------------------------------- |
| Input Handling   | Sanitize and validate user input (client + server)                    |
| Output Rendering | Escape dynamic values in templates                                    |
| Authentication   | Use JWT or OAuth securely, never expose secrets                       |
| Storage          | Prefer cookies with `HttpOnly` and `Secure` flags over `localStorage` |
| Requests         | Use HTTPS, CSRF tokens, and CORS restrictions                         |
| Headers          | Apply CSP, X-Frame-Options, X-Content-Type-Options                    |
| Dependencies     | Audit and update packages regularly                                   |
| Error Handling   | Don’t expose internal messages or stack traces                        |
| Build Chain      | Sign releases, verify integrity, and use CI/CD secret management      |

---

## 🧠 Summary

* OWASP Top 10 is a must-know foundation for secure web apps.
* Security should be baked into the **design and development**, not an afterthought.
* As a **senior developer**, you’re expected to:

    * Identify risks early.
    * Review code for security issues.
    * Set up security in CI/CD and frontend configurations.

---

**Key Takeaway:**

> 🧩 Security = Prevention (architecture) + Detection (monitoring) + Reaction (logging & updates)

