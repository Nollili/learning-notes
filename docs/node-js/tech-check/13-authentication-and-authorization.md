---
outline: [2, 3]
---

# Authentication and authorization

Use the existing Express 5/PostgreSQL application as the primary browser-session implementation. This chapter adds examination questions and bounded token examples on Node.js 24; it does not introduce a second identity platform. Security references were checked on 2026-11-05. The [full authentication module](../module-09-authentication-authorization.md) contains the session, password-reset and refresh-family implementation.

## How do authentication and authorization differ? {#t13-q01}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Authentication establishes a trusted identity. Authorization decides whether that identity may perform this action on this resource. **A valid login is not permission to access every object.** Check tenant, ownership, operation and relevant state at the server boundary.

</div>

A role groups permissions; an attribute-based rule also considers tenant, ownership, resource status or time. Deny by default and evaluate each operation, including background tasks and alternate API routes. Hiding a button helps usability, not enforcement. A resource ID is an identifier, not proof of authority.

```js [ownership-policy.mjs]
import assert from 'node:assert/strict';

function mayEdit(actor, product) {
  return Boolean(
    actor &&
      product &&
      actor.tenantId === product.tenantId &&
      Array.isArray(actor.permissions) &&
      actor.permissions.includes('products:write') &&
      product.status !== 'archived',
  );
}
const actor = { tenantId: 'a', permissions: ['products:write'] };
assert.equal(mayEdit(actor, { tenantId: 'a', status: 'active' }), true);
assert.equal(mayEdit(actor, { tenantId: 'b', status: 'active' }), false);
assert.equal(mayEdit(actor, { tenantId: 'a', status: 'archived' }), false);
assert.equal(mayEdit(null, { tenantId: 'a' }), false);
```

Treat `actor` as trusted only after credential verification and server-side mapping. In the real adapter, use `WHERE id=$1 AND tenant_id=$2` to avoid a check-then-use gap or cross-tenant lookup. If permissions can change concurrently, sensitive mutations need the relevant check within their consistency boundary.

Return 401 for absent/unusable authentication, normally with the API's `WWW-Authenticate` challenge; 403 for a known caller without permission. A consistent 404 policy can conceal object existence. Do not turn a database outage into “invalid password”; operational errors need a separate path without leaking details.

<span class="notes-section-label">**Practice and acceptance**</span>

Create two tenants and test read/update/delete using the other's IDs, including a direct service call. Accept only with zero cross-tenant disclosure/mutation and a deliberate 401/403/404 policy. Reference: [OWASP authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).

---

## When should a browser use a session rather than a JWT? {#t13-q02}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

An opaque server-side session is a practical default for this browser application. A signed token is useful for separately verifiable API credentials. **Choose from revocation, client and trust-boundary requirements**, rather than assuming tokens are always more scalable or secure.

</div>

A session cookie carries a random identifier; the shared store owns account binding, expiry and revocation. Multiple replicas need the same store and signing configuration, not separate in-memory sessions. Regenerate the ID after login/privilege changes to prevent fixation; persist it before responding. Logout destroys server state and clears the cookie with matching path/domain options.

For HTTPS deployment, use an appropriate `Secure`, `HttpOnly`, `SameSite` cookie policy; a host-only `__Host-` name additionally requires Secure, path `/` and no Domain attribute. Configure Express proxy trust for the actual trusted proxy chain rather than trusting all forwarded input. `HttpOnly` blocks JavaScript cookie reads but does not stop XSS from making authenticated requests.

Cookie credentials are attached automatically by the browser. Protect unsafe methods with a session-bound CSRF token and trusted-origin checks; choose SameSite as another defense, not the entire policy. Cross-site `SameSite=None` requires Secure and stronger attention to browser cookie rules. CORS controls browser access to responses, not authentication or CSRF by itself.

A bearer access token can be replayed by whoever holds it. Keep it short-lived; do not log it or put it in URLs. Browser local storage is readable by injected scripts. A backend-for-frontend can keep provider tokens on the server and expose only its session to the browser.

Refresh credentials need longer-lived server state, hashed storage where appropriate, rotation, reuse detection and family revocation. Two simultaneous refreshes need a defined atomic policy; “generate another token” is insufficient. Revocation cannot undo already authorized in-flight work. Use idle and absolute session expiry, and revoke on password reset/account disable.

<span class="notes-section-label">**Practice and acceptance**</span>

Use the [existing session workbench](../module-09-authentication-authorization.md#_2-choosing-an-authentication-approach). Prove login rotates the ID, mutation without a CSRF token fails, logout invalidates replay and two replicas share the session. Test refresh reuse separately if you choose the token path. References: [OWASP sessions](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [express-session](https://expressjs.com/en/resources/middleware/session/).

---

## What must a JWT verifier actually verify? {#t13-q03}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Verify a signature with trusted keys and an explicit algorithm policy, then validate issuer, audience, time and application claims. **Decoding a JWT is not verification; a signed JWT is not encrypted.** A valid token still needs resource authorization.

</div>

A JWS compact token has encoded header, payload and signature. The header is untrusted input until verification. Never select arbitrary algorithms or fetch a URL supplied by the token. `kid` selects from a configured issuer's trusted keys; it is not a filesystem path or arbitrary network destination. Cache and bound JWKS refresh, and distinguish unknown keys/rotation from accepting unsigned input.

The following standalone fixture uses `jose` 6.1.3 and Node.js 24. Generate local keys only for the demonstration; real services load a reviewed issuer configuration and protected signing keys. Install in a disposable example directory, not the docs root: `npm install --save-exact jose@6.1.3`.

```js [verified-token.mjs]
import assert from 'node:assert/strict';
import { generateKeyPair, SignJWT, jwtVerify } from 'jose';

const { privateKey, publicKey } = await generateKeyPair('RS256');
const issuer = 'https://issuer.example';
const audience = 'products-api';
const now = Math.floor(Date.now() / 1000);
async function issue(aud = audience, expires = now + 120) {
  return new SignJWT({ tenant: 'acme', scope: 'products:read' })
    .setProtectedHeader({ alg: 'RS256', typ: 'at+jwt' })
    .setIssuer(issuer)
    .setAudience(aud)
    .setSubject('user-1')
    .setIssuedAt(now)
    .setExpirationTime(expires)
    .sign(privateKey);
}
async function verify(token) {
  const { payload } = await jwtVerify(token, publicKey, {
    algorithms: ['RS256'],
    issuer,
    audience,
    typ: 'at+jwt',
    requiredClaims: ['sub', 'iat', 'exp'],
    clockTolerance: 5,
  });
  if (
    typeof payload.sub !== 'string' ||
    !payload.sub ||
    typeof payload.tenant !== 'string' ||
    !payload.tenant ||
    typeof payload.scope !== 'string'
  ) {
    throw new TypeError('invalid application claims');
  }
  return Object.freeze({
    id: payload.sub,
    tenantId: payload.tenant,
    permissions: Object.freeze(payload.scope.split(' ').filter(Boolean)),
  });
}
assert.equal((await verify(await issue())).id, 'user-1');
await assert.rejects(verify(await issue('other-api')));
await assert.rejects(verify(await issue(audience, now - 60)));
const token = await issue();
const [header, body, signature] = token.split('.');
const modified = Buffer.from(JSON.stringify({ sub: 'admin' })).toString('base64url');
await assert.rejects(verify(`${header}.${modified}.${signature}`));
```

The fixed type is a local contract with this issuer; not all providers use `at+jwt`. Validate their actual access-token profile. ID tokens authenticate a login to their client; do not substitute them for resource-server access tokens. Signed claims can become stale: account disable, key compromise and immediate logout may require introspection or server-side revocation/version checks. Clock tolerance is small deliberate skew, not permission to ignore expiry.

<span class="notes-section-label">**Practice and acceptance**</span>

Add wrong issuer/key, missing expiry, future `nbf`, malformed claims and revoked-account cases. Accept only when all reject without exposing raw tokens in logs, while a known good access token reaches a separate permission check. References: [jose APIs](https://github.com/panva/jose), [JWT security BCP](https://www.rfc-editor.org/rfc/rfc8725.html), [OWASP REST security](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html).

---

## Where do authentication middleware and Passport strategies fit? {#t13-q04}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Middleware verifies a credential and attaches a narrow trusted principal. Passport delegates a particular credential mechanism to a strategy. **Passport authentication does not replace application authorization**, session-store ownership or secure strategy configuration.

</div>

An Express pipeline typically applies a bounded body parser, session/credential middleware, authentication, input validation and use-case authorization before handling the request. Error middleware stays last. Order matters: `passport.session()` requires session middleware first; a route registered before its guard is not protected retroactively.

The integration shape below assumes an existing injected `passport` instance with a reviewed local strategy and configured session serialization, plus `csrfGuard`, `allowProductRead` and a router. It is not a complete runnable server:

```js [passport-wiring.mjs]
app.use(sessionMiddleware); // shared store, production cookie policy
app.use(passport.initialize());
app.use(passport.session()); // restores an existing login session
app.post('/login', csrfGuard, passport.authenticate('local'), (req, res) => {
  res.sendStatus(204);
});
app.use('/products', requireSessionUser, allowProductRead, productsRouter);
```

A local strategy receives credentials and calls its completion callback exactly once: error for an operational failure, `false` for unusable credentials, or a public account identity for success. Catch rejected async password verification and call `done(error)`; do not let it escape from a callback API. Use an established password-hashing implementation such as Argon2id with reviewed parameters, generic failures and abuse controls. Do not store plaintext or fast SHA hashes of passwords.

Serialize a stable account ID, not a password hash or entire account object. Deserialize to current allowed account state, with a deliberate cache/revocation policy. For bearer APIs, disable Passport login-session creation where the strategy supports `{ session: false }`. Local, OIDC and bearer strategies solve different wire protocols; choose the maintained strategy matching your requirement rather than installing all of them.

<span class="notes-section-label">**Debugging and acceptance**</span>

An endlessly redirecting callback can mean the cookie was not stored, proxy trust is wrong, session save failed or callback configuration differs. Inspect sanitized status/correlation logs, not credential contents. Exercise missing/invalid credentials, a failed store, a disabled account and a route mounted before guards. Accept only with bounded failures and no successful unguarded path. References: [Passport overview](https://www.passportjs.org/concepts/authentication/), [strategy contract](https://www.passportjs.org/concepts/authentication/strategies/), [Passport sessions](https://www.passportjs.org/concepts/authentication/sessions/).

---

## How do third-party login and service-to-service identity work? {#t13-q05}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Use OpenID Connect for federated login and OAuth access tokens for delegated API access. Independently deployed services verify the credential intended for them and enforce local permissions. **Trust an explicit issuer and audience, not a caller-supplied identity header.**

</div>

For this project's optional federation path, put authorization-code login in the backend-for-frontend, using a maintained OIDC client, PKCE, an exact registered redirect URI, state/transaction binding and nonce validation where required by the chosen OIDC flow. Exchange the code on the server, validate the returned identity and create the existing application session. Do not hand-code the protocol or use the legacy implicit/password grant as a new default.

Map identities using the stable `(issuer, subject)` pair. Email alone can collide or change; account linking is a security-sensitive action requiring proof, not an automatic merge. A provider authenticates its user but does not decide your tenant membership, product ownership or administrator permissions. Compare managed identity services on supported protocols, MFA/recovery, data residency, outage behavior, cost and migration/export before committing.

For a machine job, use a workload identity/client-credentials flow with narrow scopes and short lifetime. A gateway may authenticate at the edge, but downstream services still need a trusted propagation contract and local authorization. Strip spoofed identity headers at the trusted boundary. Either verify an appropriately audience-bound token downstream or exchange it for a narrower one; blindly forwarding a broad token everywhere expands the blast radius.

mTLS authenticates a transport peer and protects its channel; application authorization still determines which operation that peer may perform. Rotate credentials, bound key-cache refresh and fail closed when authenticity cannot be established. An identity-provider outage may allow existing valid sessions under your expiry policy; it must not switch protected routes into anonymous success.

<span class="notes-section-label">**Practice and acceptance**</span>

Draw browser→backend→provider and service→service trust boundaries. In an isolated test tenant, prove state/redirect mismatch rejection, wrong-audience downstream denial and disabled local membership despite a valid provider login. Record provider outage and cleanup behavior. These real-provider checks remain learner work. References: [OAuth security BCP](https://www.rfc-editor.org/rfc/rfc9700.html), [OIDC Core validation](https://openid.net/specs/openid-connect-core-1_0.html#IDTokenValidation), [OWASP OAuth guidance](https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html).

## Revision and practical checkpoint

For one mutation explain credential verification, account state, permission/tenant predicate, CSRF policy, expiry and audit logging. Then demonstrate denial as carefully as success. Keep raw passwords, cookies and tokens out of logs. Local policy and JWT fixture checks support the material; they do not prove the entire deployed authentication system is secure or complete your practice.

### Mixed practice

1. A JWT signature is valid but its audience is another API. May this route accept it?
2. An authenticated tenant A user sends a tenant B product ID with a valid CSRF token. What must reject it?

<span class="notes-section-label">**Answer guide — read after attempting both cases**</span>

1. No. Signature authenticity alone does not establish intended recipient, time validity, token profile or current permission. Reject at credential validation.
2. The server-side resource authorization and tenant-scoped persistence predicate. CSRF protection proves neither ownership nor permission; test every alternate route too.
