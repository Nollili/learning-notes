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

---

## How do you bind an OIDC callback to the browser that started login? {#t13-q06}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Keep a short-lived, single-use login transaction bound to the initiating browser and configured issuer/redirect. Let a maintained OIDC client validate the protocol. **A callback with a code is not yet an authenticated application session.**

</div>

For authorization-code login, generate independent random state, nonce and PKCE verifier. Store them server-side under the browser's anonymous session with creation/expiry and a safe local return destination. Send the S256 challenge, state and nonce to the configured issuer. On callback, atomically consume the matching transaction, verify the exact callback/issuer and pass the stored verifier/nonce into the OIDC client's code exchange/validation. Do not accept a return URL, issuer or redirect selected by callback input.

The following pure fixture models the binding/one-use decision only. Its in-memory mutation is **not** a multi-replica session store or an OIDC implementation. Production needs an atomic shared-store operation and a reviewed strategy/client with code/ID-token validation.

```js [login-transaction.mjs]
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
function transaction(browserSession, now) {
  return {
    browserSession,
    state: randomBytes(32).toString('base64url'),
    expiresAt: now + 120_000,
    used: false,
    returnPath: '/products',
  };
}
function consume(tx, browserSession, state, now) {
  if (
    !tx ||
    tx.used ||
    tx.expiresAt <= now ||
    tx.browserSession !== browserSession ||
    typeof state !== 'string' ||
    state !== tx.state
  )
    throw new Error('invalid login transaction');
  tx.used = true;
  return tx.returnPath;
}
const now = 1000,
  tx = transaction('anonymous-a', now);
assert.throws(() => consume(tx, 'anonymous-b', tx.state, now));
assert.throws(() => consume(tx, 'anonymous-a', 'wrong', now));
assert.equal(consume(tx, 'anonymous-a', tx.state, now), '/products');
assert.throws(() => consume(tx, 'anonymous-a', tx.state, now));
const expired = transaction('anonymous-a', now);
assert.throws(() => consume(expired, 'anonymous-a', expired.state, now + 120_000));
```

State binds the authorization response to its transaction; PKCE binds code redemption to the verifier; OIDC nonce binds the ID token to the request. They are related defenses, not interchangeable names. Keep each value out of shared logs. Multiple browser tabs need distinct transactions and a deliberate bounded store policy; overwriting one global state field causes intermittent failures.

After protocol verification, map `(issuer,subject)` to the local account, apply current tenant/account policy, regenerate the application session and save it before redirecting to the validated local path. A provider email is not enough proof to link accounts. A failed exchange consumes this attempt; let the user start a new login rather than replaying a stale code indefinitely.

<span class="notes-section-label">**Debugging and acceptance**</span>

Check callback URI/proxy origin, transaction cookie scope/SameSite, expired state, nonce and PKCE mismatch separately. Never “fix” a callback loop by disabling validation. Exercise wrong browser, replay, expiry, parallel tabs, provider error and local disabled account. Accept only with the real configured client/strategy denying invalid cases and the application creating exactly one rotated session. References: [OIDC code flow](https://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth), [OAuth security BCP](https://www.rfc-editor.org/rfc/rfc9700.html), [Passport strategy boundary](https://www.passportjs.org/concepts/authentication/strategies/).

---

## How do key rotation and token profiles avoid confused trust? {#t13-q07}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Bind accepted keys to a configured issuer and token profile, validate recipient/time/application claims and plan a bounded rotation window. **A token's kid is a selector within trusted keys, not permission to fetch arbitrary keys.** Unknown authenticity fails closed.

</div>

This jose6.1.3 fixture models trusted key-set replacement locally; it makes no HTTP/JWKS request. New tokens use the new key while the verifier temporarily accepts the old key for already issued, still-valid tokens. Removing an old key rejects its tokens; emergency compromise response may require earlier removal plus explicit revocation/reconciliation.

```js [rotating-token-keys.mjs]
import assert from 'node:assert/strict';
import {
  generateKeyPair,
  exportJWK,
  SignJWT,
  createLocalJWKSet,
  jwtVerify,
} from 'jose';
const old = await generateKeyPair('RS256'),
  fresh = await generateKeyPair('RS256');
async function publicJwk(pair, kid) {
  return { ...(await exportJWK(pair.publicKey)), kid, alg: 'RS256', use: 'sig' };
}
const oldJwk = await publicJwk(old, 'old'),
  newJwk = await publicJwk(fresh, 'new');
async function issue(pair, kid, aud = 'products-api') {
  return new SignJWT({ tenant: 'a', scope: 'products:read' })
    .setProtectedHeader({ alg: 'RS256', typ: 'at+jwt', kid })
    .setIssuer('https://issuer.example')
    .setAudience(aud)
    .setSubject('u1')
    .setIssuedAt()
    .setExpirationTime('2m')
    .sign(pair.privateKey);
}
const verify = (token, keys) =>
  jwtVerify(token, createLocalJWKSet({ keys }), {
    issuer: 'https://issuer.example',
    audience: 'products-api',
    algorithms: ['RS256'],
    typ: 'at+jwt',
    requiredClaims: ['sub', 'iat', 'exp'],
    maxTokenAge: '3m',
    clockTolerance: 5,
  });
const previous = await issue(old, 'old'),
  current = await issue(fresh, 'new');
await verify(previous, [oldJwk, newJwk]);
await verify(current, [oldJwk, newJwk]);
await assert.rejects(verify(current, [oldJwk]));
await assert.rejects(verify(previous, [newJwk]));
await assert.rejects(verify(await issue(fresh, 'new', 'other-api'), [newJwk]));
await assert.rejects(verify(await issue(fresh, 'unknown'), [newJwk]));
```

Real remote JWKS resolution needs a fixed issuer/discovery trust policy, TLS verification, bounded fetch time/size, cache lifetime and refresh cooldown to avoid attacker-driven fetch storms. Preserve only valid cached keys under the explicit outage policy; do not accept an unknown key because the identity provider is down. Monitor key errors without recording tokens. Key rotation and per-account logout/revocation are different mechanisms.

A resource server accepts its **access-token** profile, not whatever signed token is convenient. An ID token's audience is the OIDC client, and its purpose is login verification. Never substitute it for an API credential. The earlier [application-claim validation](#t13-q03) still applies after this signature/registered-claim fixture. For internal calls, authenticate the service and preserve a constrained delegation contract; do not turn any gateway header into unrestricted user authority.

<span class="notes-section-label">**Practice and acceptance**</span>

Test overlapping/retired keys, wrong issuer/audience/type/algorithm, missing time claims, future nbf, stale issuance and malformed tenant/scope. Simulate bounded JWKS outage/unknown-kid traffic only against owned endpoints. Accept with no invalid-token success, no uncontrolled refresh and a documented compromise/revocation policy. References: [jose key-set resolver](https://github.com/panva/jose/blob/main/docs/jwks/local/functions/createLocalJWKSet.md), [JWT security BCP](https://www.rfc-editor.org/rfc/rfc8725.html).

---

## How do refresh rotation, revocation and sensitive writes survive races? {#t13-q08}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Persist refresh-family state and serialize its transitions; make reuse handling and account-version checks explicit. **A successful signature check cannot detect every later account or credential change.** Revocation affects subsequent checks, not already committed effects.

</div>

Use the existing [account/refresh/reset implementation](../module-09-authentication-authorization.md) as the owner. A server stores only a digest of a high-entropy refresh credential plus account/family, expiry, consumed/revoked state and replacement relationship. Hashing an unpredictable token for lookup differs from password hashing a human secret. Raw credentials travel only through the reviewed client/cookie channel.

A rotation transaction locks the family/account state in a consistent order, checks current credential version and family status, consumes the presented unused token and inserts its replacement before committing. A unique digest and conditional update prevent two winners. If a consumed credential reappears, apply the defined family-revocation policy and commit that revocation before reporting denial; throwing inside a transaction and rolling back the revocation defeats the policy.

```sql [refresh-transition.sql]
-- Integration predicate within the locked family/account transaction.
-- $1 is a server-computed token digest; $2 is the current family ID.
UPDATE refresh_credentials
SET consumed_at = clock_timestamp()
WHERE digest=$1 AND family_id=$2
  AND consumed_at IS NULL AND revoked_at IS NULL
  AND expires_at > clock_timestamp()
RETURNING account_id, family_id;
```

The predicate is not the complete workflow: a zero-row result still needs safe lookup/reuse classification, replacement insertion and final commit under the same owner. Do not implement the family as two independent pool queries. A lost response after a successful rotation leaves the client uncertain. A strict replay policy may revoke a family after a benign duplicate; document this trade-off and serialize client refresh attempts. A grace window must retain proof/binding and avoid allowing an attacker to mint unlimited replacements.

For sensitive writes, stale session permissions can be insufficient. Recheck current membership/credential version within the business transaction where the invariant requires it; otherwise document the maximum stale authorization window. Add recent-auth/MFA requirements for account linking, credential changes or destructive administration. Step-up authentication is a scoped time-limited property, not a permanent admin role.

Service-to-service access has another axis: identify the workload, limit audience/scopes and authorize current resource ownership. Token exchange can narrow delegation. mTLS proves the connecting peer under its trust configuration; it does not independently prove end-user permission. Keep audit records of safe actor/operation/resource/result IDs, never the refresh credential.

<span class="notes-section-label">**Practice and acceptance**</span>

Run two concurrent refreshes, replay the consumed token, reset the password during an active session and inject a response loss after commit. Accept with one rotation winner, observed committed revocation, no stale-version sensitive mutation and a deliberate client recovery policy. Local token fixtures do not prove these database/provider races; they remain separate integration/learner tasks. References: [OAuth refresh-token protection](https://www.rfc-editor.org/rfc/rfc9700.html#section-4.14), [OWASP session lifecycle](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [transaction isolation](https://www.postgresql.org/docs/18/transaction-iso.html).

## Revision and practical checkpoint

For one mutation explain credential verification, account state, permission/tenant predicate, CSRF policy, expiry and audit logging. Then demonstrate denial as carefully as success. Keep raw passwords, cookies and tokens out of logs. Local policy and JWT fixture checks support the material; they do not prove the entire deployed authentication system is secure or complete your practice.

### Mixed practice

1. A JWT signature is valid but its audience is another API. May this route accept it?
2. An authenticated tenant A user sends a tenant B product ID with a valid CSRF token. What must reject it?

<span class="notes-section-label">**Answer guide — read after attempting both cases**</span>

1. No. Signature authenticity alone does not establish intended recipient, time validity, token profile or current permission. Reject at credential validation.
2. The server-side resource authorization and tenant-scoped persistence predicate. CSRF protection proves neither ownership nor permission; test every alternate route too.
