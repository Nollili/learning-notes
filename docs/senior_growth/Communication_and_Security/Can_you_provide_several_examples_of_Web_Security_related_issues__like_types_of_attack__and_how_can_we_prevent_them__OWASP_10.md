# Web Security — Common Vulnerabilities & Prevention (OWASP Top 10 Overview) {#%F0%9F%8C%90-web-security-%E2%80%94-common-vulnerabilities-prevention-owasp-top-10-overview}

As a **senior front-end developer**, it’s critical to understand **web security risks**, common **attack vectors**, and how to mitigate them — both in the frontend and backend integration.

---

## Historical OWASP Top 10 (2021 Edition)

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

## Current awareness baseline: OWASP Top 10:2025

The 2021 table is retained for historical mapping. The 2025 edition lists A01 Broken Access Control, A02 Security Misconfiguration, A03 Software Supply Chain Failures, A04 Cryptographic Failures, A05 Injection, A06 Insecure Design, A07 Authentication Failures, A08 Software or Data Integrity Failures, A09 Security Logging and Alerting Failures, and A10 Mishandling of Exceptional Conditions. IDs change between editions; record the edition rather than silently relabel old findings. This is an awareness list, not a complete control or verification standard. [Official2025 release](https://top10.owasp.org/2025/), checked 2026-10-22.

## Common Web Security Attacks & Prevention {#%E2%9A%94%EF%B8%8F-common-web-security-attacks-prevention}

### **Cross-Site Scripting (XSS)** {#_1-cross-site-scripting-xss}
**Attack:**  
An attacker injects malicious JavaScript into a trusted site (e.g., through user input or query params).  
**Impact:**  
Steal cookies, tokens, or perform actions as the user.

**Prevention:**
- Put plain text through a safe text sink such as textContent or ordinary JSX string children; encode other contexts deliberately.
- Use Content Security Policy (CSP) headers.
- Validate domain values; use a maintained sanitizer with a defined policy only when intentionally supporting HTML.
- React automatically escapes JSX → XSS harder but still possible via `dangerouslySetInnerHTML`.

```jsx
// Risky
<div dangerouslySetInnerHTML={{ __html: userComment }} />

// Safe
<div>{userComment}</div>
```

---

### **Cross-Site Request Forgery (CSRF)** {#_2-cross-site-request-forgery-csrf}

**Attack:**
An attacker tricks a logged-in user into sending a forged request (e.g., through hidden forms or images).

**Prevention:**

* Use **CSRF tokens** in POST requests.
* Use **SameSite cookies** (`SameSite=Lax` or `Strict`).
* Validate origin and referrer headers on backend.
* Explicit fetch credentials do not supply CSRF protection. Validate the selected CSRF contract on the server for state-changing requests.

---

### **SQL / NoSQL Injection** {#_3-sql-nosql-injection}

**Attack:**
Malicious input manipulates a database query.

**Example:**
`" OR 1=1; DROP TABLE users;--"`

**Prevention:**

* Bind data values with parameterized queries; an ORM can still expose unsafe raw/interpolated SQL. Allowlist dynamic identifiers/order choices separately.
* Validate and sanitize user inputs.
* Never concatenate user input directly in queries.

---

### **Clickjacking** {#_4-clickjacking}

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

### **Man-in-the-Middle (MITM)** {#_5-man-in-the-middle-mitm}

**Attack:**
Intercepting and altering data between client and server.

**Prevention:**

* Always use **HTTPS** (HSTS headers).
* Verify SSL/TLS certificates.
* Avoid sending tokens or credentials over plain HTTP.

---

### **Insecure Deserialization** {#_6-insecure-deserialization}

**Attack:**
Untrusted serialized data causes remote code execution when deserialized on backend.

**Prevention:**

* Validate input before deserialization.
* Never use eval to parse data. JSON.parse alone does not execute embedded JavaScript, but syntax/size/schema errors, subsequent unsafe sinks and prototype-polluting merges still need handling. Project allowed fields rather than blindly merging parsed objects.

---

### **Sensitive Data Exposure** {#_7-sensitive-data-exposure}

**Attack:**
Personal data (like tokens or passwords) exposed through logs, URLs, or localStorage.

**Prevention:**

* Never store tokens in `localStorage` (use `HttpOnly` cookies if possible).
* Use **HTTPS** and **encryption at rest**.
* Mask sensitive fields in logs.

---

### **Denial of Service (DoS / DDoS)** {#_8-denial-of-service-dos-ddos}

**Attack:**
Overwhelming a server or client app with excessive requests or heavy computation.

**Prevention:**

* Rate limiting, caching, request throttling.
* On frontend: avoid heavy loops, memory leaks, or oversized bundle execution.

---

### **Open Redirects** {#_9-open-redirects}

**Attack:**
User is redirected to a malicious site via a crafted URL (e.g., `/redirect?to=http://evil.com`).

**Prevention:**

* Validate and whitelist redirect URLs.
* Never trust redirect targets from query parameters.

---

### **Supply Chain Attacks** {#_10-supply-chain-attacks}

**Attack:**
Malicious dependency or compromised CI/CD pipeline injects unwanted code.

**Prevention:**

* Use `npm audit`, `Snyk`, or GitHub Dependabot.
* Pin dependency versions.
* Use signed packages and secure CI/CD secrets.

---

## Frontend Developer Security Practices {#%F0%9F%A7%B1-frontend-developer-security-practices}

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

## Summary {#%F0%9F%A7%A0-summary}

* OWASP Top 10 is a must-know foundation for secure web apps.
* Security should be baked into the **design and development**, not an afterthought.
* As a **senior developer**, you’re expected to:

    * Identify risks early.
    * Review code for security issues.
    * Set up security in CI/CD and frontend configurations.

---

**Key Takeaway:**

> Security = Prevention (architecture) + Detection (monitoring) + Reaction (logging & updates)


## Worked threat model: private note title

**Scope:** an authenticated owner renames one private note in one tenant. The server's verified principal/current membership is trusted input to the use case; browser state, URL IDs, request bodies and stored strings are untrusted. Assets are note confidentiality, title integrity, session credentials and availability. The browser→HTTP boundary and application→database boundary must each enforce their contract. A compromised same-origin script can issue authenticated actions, so an HttpOnly cookie is not an XSS cure.

| Abuse case | Required control and negative evidence |
|---|---|
| Alter URL/body tenant or owner | Derive both from verified identity; scope the actual conditional write by ID+tenant+owner |
| Replay stale edit | Include expected version in that same write; no matching row must not overwrite newer data |
| SQL-shaped title | Bind as a value, never splice into SQL; schema bounds do not replace parameterization |
| Extra isAdmin/owner fields | Reject unrecognized command fields; do not bind them to authorization |
| Cross-site mutation | Enforce the deployed session/CSRF policy before invoking the use case |
| Injected markup | Render returned title as text; no HTML interpretation, including after storage restoration |
| Storage/log leak | Persist only justified public drafts; omit private contents/credentials from telemetry |
| Denial/timeout/exception | Bound body/work, preserve safe error behavior and avoid an ambiguous automatic write retry |

### Deterministic query-plan boundary

This isolated TypeScript5.9.3 helper builds a fixed PostgreSQL query; it is not a complete HTTP endpoint. Principal comes from verified server authentication, never req.body or the UI gate. The caller must enforce body limits and the session/CSRF policy first.

<<< ../../workbench/engineering/security/rename-plan.ts{ts}

Execute through a maintained PostgreSQL adapter with values passed separately. Use the [primary server conditional-write example](../../node-js/module-09-authentication-authorization.md#ownership-and-attribute-based-access-control) for integration; MikroORM uses its own parameter placeholder conventions. A plan assertion proves fixed query text and parameter order, not live row isolation, deployed sessions or CSRF. The notes table/schema/version policy and zero-row conflict/not-found response must be implemented consistently. Avoid a second unscoped write after checking a row; map inaccessible objects consistently without revealing their contents.


References checked 2026-10-22: [OWASP authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html), [parameterized SQL](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html), [DOM XSS](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html), [CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/security/Can_you_provide_several_examples_of_Web_Security_related_issues__like_types_of_attack__and_how_can_we_prevent_them__OWASP_10.md). All learner practice remains outstanding.
