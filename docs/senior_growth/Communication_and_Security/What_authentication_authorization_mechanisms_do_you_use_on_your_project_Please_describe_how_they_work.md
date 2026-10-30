# Authentication and Authorization Mechanisms in Modern Web Apps {#%F0%9F%94%90-authentication-and-authorization-mechanisms-in-modern-web-apps}

In modern frontend-backend architectures, **authentication** and **authorization** are separate concerns:

- **Authentication:** Verifying **who the user is**.  
- **Authorization:** Determining **what the user is allowed to do**.

Here’s a detailed overview of commonly used mechanisms and how they work.

---

## JWT (JSON Web Tokens) {#_1%EF%B8%8F%E2%83%A3-jwt-json-web-tokens}

### What It Is {#%F0%9F%94%91-what-it-is}
- JWT is a compact claims format. A signed token provides integrity under a verified key/algorithm; ordinary signed payloads are readable, and the format alone is not an authentication or authorization system.
- Contains:
    - Header (algorithm)
    - Payload (user info, roles)
    - Signature/MAC (for example HMAC, RSA or an appropriate elliptic-curve algorithm under a fixed verified policy)

**Example payload:**
```json
{
    "sub": "12345",
    "name": "Alice",
    "role": "admin",
    "exp": 1719993600
}
```

### How It Works {#%F0%9F%94%A7-how-it-works}

1. User logs in → server verifies credentials.
2. Server generates JWT and sends it to client.
3. Choose a transport contract. A JavaScript-held access token can be attached as a Bearer header; a HttpOnly cookie is sent by browser cookie rules and cannot be read by JavaScript to construct that header.
4. For the JavaScript-held Bearer alternative only:

```http
Authorization: Bearer <JWT>
```

5. Server validates an allowlisted algorithm/key, issuer, audience, time/required application claims and intended token purpose; then separately authorizes this action/resource/tenant. Decoding is not verification.
6. Optionally, use **refresh tokens** to issue new JWTs when expired.

### Pros {#%E2%9C%85-pros}

* Local signature verification can avoid a session lookup, but revocation, rotation and current permissions may still need server state.
* Scales well across distributed systems.
* Can include roles/permissions in payload.

### Cons {#%E2%9D%8C-cons}

* Long-lived tokens can be stolen if not stored securely.
* Choose expiration, reauthentication and optional refresh/revocation policies. A refresh mechanism is not universally mandatory.

---

## Session-Based Authentication {#_2%EF%B8%8F%E2%83%A3-session-based-authentication}

### What It Is {#%F0%9F%94%91-what-it-is-1}

* Traditional approach using **server-side sessions**.
* Server keeps a **session store** (memory, database, Redis) mapping session ID → user info.

### How It Works {#%F0%9F%94%A7-how-it-works-1}

1. User logs in → server creates session → stores session ID in server-side store.
2. Session ID is sent to client as a **cookie** (`HttpOnly`, `Secure`).
3. Browser sends an eligible cookie according to domain/path/Secure/SameSite, credentials mode and browser policy.
4. Server checks session ID → validates user and permissions.

### Pros {#%E2%9C%85-pros-1}

* Can support secure sessions with proper lifecycle, cookie scope, CSRF/XSS defenses and authorization; two cookie flags alone do not establish security.
* Can easily revoke sessions server-side.
* Works well with sensitive data.

### Cons {#%E2%9D%8C-cons-1}

* Stateful → requires server session management.
* Harder to scale across distributed servers (needs shared session store).

---

## OAuth 2.0 {#_3%EF%B8%8F%E2%83%A3-oauth-2-0}

### What It Is {#%F0%9F%94%91-what-it-is-2}

* Standard **authorization framework** for delegating access.
* OAuth delegates API access. For standardized user login use OpenID Connect (OIDC), an identity layer on OAuth2; do not treat an arbitrary access token as a login assertion.
* Components:

    * **Resource Owner:** User
    * **Client:** Your app
    * **Authorization Server:** Issues access tokens
    * **Resource Server:** Protects APIs

### How It Works {#%F0%9F%94%A7-how-it-works-2}

1. User authorizes your app → app receives **authorization code**.
2. App exchanges code for **access token** (and optionally refresh token).
3. Client uses **access token** to access protected API.
4. Access tokens may be opaque or structured. The resource server follows the issuer's validation/introspection contract; the client must not assume every token is a JWT.

### Pros {#%E2%9C%85-pros-2}

* Standardized, widely supported.
* OIDC adds standardized identity/login semantics that can support SSO.
* Access tokens can be scoped and short-lived.

### Cons {#%E2%9D%8C-cons-2}

* More complex to implement.
* Requires secure storage of tokens and HTTPS.

---

## Role-Based Access Control (RBAC) & Permissions {#_4%EF%B8%8F%E2%83%A3-role-based-access-control-rbac-permissions}

### What It Is {#%F0%9F%94%91-what-it-is-3}

* Authorization mechanism controlling **what users can do** based on **roles** or **permissions**.
* Often combined with JWT or session-based auth.

**Example:**

```json
{
    "sub": "12345",
    "role": "admin",
    "permissions": ["read_users", "edit_users", "delete_users"]
}
```

### How It Works {#%F0%9F%94%A7-how-it-works-3}

1. Backend checks user role/permissions before allowing an action.
2. Frontend can **conditionally render UI** based on permissions.

---

## Practical Implementation in Projects {#_5%EF%B8%8F%E2%83%A3-practical-implementation-in-projects}

* **Frontend:**

    * Login form → sends credentials to API.
    * In a cookie-session design, use the eligible HttpOnly session cookie and CSRF protection; JavaScript does not read the cookie.
    * In the separate Bearer design, keep the short-lived token in memory and explicitly attach it to the intended API.
    * Implement reauthentication or optional controlled refresh according to the session policy; never blindly replay arbitrary writes.

* **Backend:**

    * Validate the full JWT application contract or a current, unexpired, nonrevoked session record.
    * Check **roles/permissions** for protected endpoints.
    * Return 401 (unauthenticated) or 403 (unauthorized) if invalid.

* **Security Best Practices:**

    * Always use **HTTPS**
    * **HttpOnly + Secure cookies** for sensitive tokens
    * Implement **CSRF protection** if using cookies
    * Keep access credentials suitably short-lived; if refresh is used, protect its rotation/reuse-detection/revocation lifecycle

---

### Summary {#%F0%9F%A7%A0-summary}

| Mechanism        | Authentication | Authorization | Storage                   | Pros                        | Cons                             |
| ---------------- | -------------- | ------------- | ------------------------- | --------------------------- | -------------------------------- |
| JWT | Claims format, not a login protocol | Claims inform separate server decisions | Depends on transport | Local verification possible | Validation, theft/revocation policy |
| Session          | Yes | Yes | HttpOnly cookie           | Secure, revocable           | Stateful, scaling requires store |
| OAuth2 / OIDC | OAuth alone: no standardized identity; OIDC: yes | Delegated scopes plus API policy | Protocol/design dependent | Standard federation | Callback/token/session validation |
| RBAC/Permissions | No | Yes | Combined with JWT/session | Fine-grained access control | Needs server enforcement         |

---

> Choose session/transport/protocol from the application's trust boundaries, not from a slogan that JWT is always more scalable or sessions are only for sensitive apps. Roles in a signed token can become stale; enforce ownership/tenant checks on every protected server operation.

## One coherent browser flow, with explicit alternatives

For the same-origin learning app, a server-backed cookie session is a straightforward primary browser boundary. An OIDC login handled on the backend can keep provider access/refresh tokens out of JavaScript and establish a local opaque session. The dedicated Node authentication chapter's JWT API examples remain a separate valid API-token exercise; do not combine cookie storage with a client read-to-Bearer step.

For OIDC, use a maintained integration and authorization-code flow with PKCE as supported/required by the client profile. Bind the redirect to the initiating transaction using the library's state/nonce/PKCE checks; enforce registered redirect URLs. Validate ID-token signature, issuer, audience, expiration and applicable nonce before creating a session. Identify a provider account using issuer plus subject, not a mutable email alone. An ID token is for the client; an access token is for its resource server. A successful provider login does not assign application admin rights.

Rotate the local session identifier at authentication/privilege changes, enforce idle/absolute expiry and invalidate it server-side on logout. Cookie deletion alone does not invalidate a stolen session. Authorization dependencies failing should yield a controlled service failure, not a fabricated invalid-token verdict or fail-open access. Decide what logout means for local sessions, outstanding API tokens and the upstream provider; they are different lifecycles.

If refresh is required, implement the provider's current protected refresh policy (including rotation/reuse detection or sender constraints as appropriate) through a maintained library/service. Coordinate concurrent refreshes and bound retries. Never put client secrets in a browser bundle, log token values or silently replay an uncertain non-idempotent write after401. Reauthentication is a legitimate alternative for short sessions.

**Worked decision:** the browser sends a cookie-authenticated PATCH to /api/profile with a session-bound CSRF token. The server resolves the session, validates provenance/CSRF/schema, derives the principal and allows only that user's editable profile fields. A role or userId submitted in the body cannot promote the caller or choose another owner. No provider token is required in the browser for this local operation. The adjacent token-storage note shows this transport as runnable JavaScript; the Node module contains the fuller server boundary.


Authoritative references checked2026-10-22: [OIDC Core1.0](https://openid.net/specs/openid-connect-core-1_0.html), [OAuth security BCP RFC9700](https://www.rfc-editor.org/rfc/rfc9700.html), [JWT BCP RFC8725](https://www.rfc-editor.org/rfc/rfc8725.html), [OWASP session lifecycle](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/security/What_authentication_authorization_mechanisms_do_you_use_on_your_project_Please_describe_how_they_work.md). All learner practice remains outstanding.
