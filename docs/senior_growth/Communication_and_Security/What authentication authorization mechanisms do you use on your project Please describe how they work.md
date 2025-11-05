# 🔐 Authentication and Authorization Mechanisms in Modern Web Apps

In modern frontend-backend architectures, **authentication** and **authorization** are separate concerns:

- **Authentication:** Verifying **who the user is**.  
- **Authorization:** Determining **what the user is allowed to do**.

Here’s a detailed overview of commonly used mechanisms and how they work.

---

## 1️⃣ JWT (JSON Web Tokens)

### 🔑 What It Is
- JWT is a **stateless, compact token** format for securely transmitting information between client and server.
- Contains:
    - Header (algorithm)
    - Payload (user info, roles)
    - Signature (HMAC or RSA to prevent tampering)

**Example payload:**
```json
{
    "sub": "12345",
    "name": "Alice",
    "role": "admin",
    "exp": 1719993600
}
```

### 🔧 How It Works

1. User logs in → server verifies credentials.
2. Server generates JWT and sends it to client.
3. Client stores JWT (preferably in **HttpOnly cookie** or memory).
4. For API calls, client sends JWT in **Authorization header**:

```http
Authorization: Bearer <JWT>
```

5. Server verifies signature and extracts user info → grants access.
6. Optionally, use **refresh tokens** to issue new JWTs when expired.

### ✅ Pros

* Stateless → no server session storage needed.
* Scales well across distributed systems.
* Can include roles/permissions in payload.

### ❌ Cons

* Long-lived tokens can be stolen if not stored securely.
* Must implement refresh mechanism for security.

---

## 2️⃣ Session-Based Authentication

### 🔑 What It Is

* Traditional approach using **server-side sessions**.
* Server keeps a **session store** (memory, database, Redis) mapping session ID → user info.

### 🔧 How It Works

1. User logs in → server creates session → stores session ID in server-side store.
2. Session ID is sent to client as a **cookie** (`HttpOnly`, `Secure`).
3. For subsequent requests, browser automatically sends cookie.
4. Server checks session ID → validates user and permissions.

### ✅ Pros

* Secure if cookies are `HttpOnly` and `Secure`.
* Can easily revoke sessions server-side.
* Works well with sensitive data.

### ❌ Cons

* Stateful → requires server session management.
* Harder to scale across distributed servers (needs shared session store).

---

## 3️⃣ OAuth 2.0

### 🔑 What It Is

* Standard **authorization framework** for delegating access.
* Commonly used for login via Google, Facebook, or internal APIs.
* Components:

    * **Resource Owner:** User
    * **Client:** Your app
    * **Authorization Server:** Issues access tokens
    * **Resource Server:** Protects APIs

### 🔧 How It Works

1. User authorizes your app → app receives **authorization code**.
2. App exchanges code for **access token** (and optionally refresh token).
3. Client uses **access token** to access protected API.
4. Tokens often JWTs → stateless verification.

### ✅ Pros

* Standardized, widely supported.
* Works for **single sign-on (SSO)**.
* Access tokens can be scoped and short-lived.

### ❌ Cons

* More complex to implement.
* Requires secure storage of tokens and HTTPS.

---

## 4️⃣ Role-Based Access Control (RBAC) & Permissions

### 🔑 What It Is

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

### 🔧 How It Works

1. Backend checks user role/permissions before allowing an action.
2. Frontend can **conditionally render UI** based on permissions.

---

## 5️⃣ Practical Implementation in Projects

* **Frontend:**

    * Login form → sends credentials to API.
    * Store **access token in memory** (or HttpOnly cookie).
    * Include token in API requests (`Authorization: Bearer ...`).
    * Handle **token refresh** automatically via refresh token.

* **Backend:**

    * Verify JWT signature or session ID.
    * Check **roles/permissions** for protected endpoints.
    * Return 401 (unauthenticated) or 403 (unauthorized) if invalid.

* **Security Best Practices:**

    * Always use **HTTPS**
    * **HttpOnly + Secure cookies** for sensitive tokens
    * Implement **CSRF protection** if using cookies
    * Keep **access tokens short-lived** and use refresh tokens

---

### 🧠 Summary

| Mechanism        | Authentication | Authorization | Storage                   | Pros                        | Cons                             |
| ---------------- | -------------- | ------------- | ------------------------- | --------------------------- | -------------------------------- |
| JWT              | ✅              | ✅ (roles)     | Memory / HttpOnly cookie  | Stateless, scalable         | Token theft risk                 |
| Session          | ✅              | ✅             | HttpOnly cookie           | Secure, revocable           | Stateful, scaling requires store |
| OAuth2           | ✅ (delegated)  | ✅             | Token / Cookie            | SSO, standardized           | Complex, token management        |
| RBAC/Permissions | ❌              | ✅             | Combined with JWT/session | Fine-grained access control | Needs server enforcement         |

---

> **Rule of Thumb:**
> Use **JWT + RBAC** for stateless APIs and scalable SPAs.
> Use **sessions** for sensitive data or traditional apps.
> Use **OAuth2** for third-party logins or delegated access.

