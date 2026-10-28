# OIDC Login Transactions and Signed CSRF Tokens

This intermediate Node.js lab extends [Module 9](./module-09-authentication-authorization.md). Keep the runnable application's database session and synchronizer-token flow as the primary browser design. OIDC is an optional external login; signed double-submit is a separate CSRF alternative. They address different threats.

Verified 2026-10-25 against Node24.18.0, TypeScript5.9.3 and `openid-client`6.8.8. In an isolated ESM lab install `openid-client@6.8.8`, TypeScript and Node24 types. Pin the resolved dependency tree. This example has no Passport dependency; the chapter's Passport sketch describes an alternative integration shape, not a second required stack.

## Bind a login to the browser that started it

An authorization code alone is not an authenticated local session. `state` binds a response to one login transaction; PKCE binds code redemption to the private verifier; OIDC `nonce` binds the ID token to that transaction. Each value is unpredictable and has its own role. A server-side anonymous session supplies the private browser binding. Do not accept that binding from a query parameter or use a public user ID as a substitute.

Create the provider configuration once from trusted deployment settings:

```ts
import * as oidc from 'openid-client';
const clientSecret = process.env.OIDC_CLIENT_SECRET;
if (!clientSecret) throw new Error('Missing OIDC client secret');
const config = await oidc.discovery(
  new URL('https://id.example.test'), // replace with an explicitly trusted issuer
  'registered-client-id',
  clientSecret, // use a secret manager in deployment
  undefined,
  { timeout: 5 },
);
```

Register exactly `https://app.example.test/login/callback` with that provider. Use its supported client authentication method; the secret shorthand selects the library default, not every provider's requirement. Never discover a user-supplied issuer or redirect: discovery is server-side network access. Restrict outbound destinations, enforce HTTPS and configure timeouts. This lab deliberately enables library JWS verification as well as its normal token claim checks; do not disable TLS verification or skip state/nonce checks to make a failing login pass.

Save a server-side transaction before redirecting. A shared store must atomically take a transaction only when the current session binding matches and its five-minute deadline has not passed. Wrong-browser requests must not consume another browser's transaction. Consume before the network exchange: a lost response or provider error starts a fresh login rather than replaying the old code. Keep verifier/nonce/session binding out of URLs, telemetry and client storage. Store credentials with restricted access and delete expired transactions. Limit pending starts per session and globally; five-minute expiry alone does not bound storage or provider traffic.

The following is executable protocol and HMAC code. `Transactions` is an explicit persistence port, not a production in-memory store.

```ts
import * as oidc from 'openid-client';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
export type Transaction = { binding: string; verifier: string; nonce: string; expires: number };
export interface Transactions {
  put(state: string, transaction: Transaction): Promise<void>;
  // Atomic: match binding and expires > now, delete and return; otherwise undefined.
  take(state: string, binding: string, now: number): Promise<Transaction | undefined>;
}
export function loginFlow(config: oidc.Configuration, redirect: URL, store: Transactions) {
  if (redirect.protocol !== 'https:' || redirect.search || redirect.hash || redirect.username || redirect.password)
    throw new Error('Invalid registered redirect');
  const callback = redirect.href;
  oidc.enableNonRepudiationChecks(config);
  return {
    async start(binding: string, now = Date.now()) {
      if (!binding) throw new Error('Missing session binding');
      const state = oidc.randomState();
      const verifier = oidc.randomPKCECodeVerifier();
      const nonce = oidc.randomNonce();
      const challenge = await oidc.calculatePKCECodeChallenge(verifier);
      await store.put(state, { binding, verifier, nonce, expires: now + 300_000 });
      return oidc.buildAuthorizationUrl(config, { redirect_uri: callback, scope: 'openid',
        code_challenge: challenge, code_challenge_method: 'S256', state, nonce });
    },
    async finish(current: URL, binding: string, now = Date.now()) {
      if (current.origin !== redirect.origin || current.pathname !== redirect.pathname || current.hash ||
          current.username || current.password) throw new Error('Invalid callback');
      const states = current.searchParams.getAll('state');
      const state = states[0];
      if (states.length !== 1 || !state || !/^[A-Za-z0-9_-]{43}$/.test(state))
        throw new Error('Invalid login transaction');
      const tx = await store.take(state, binding, now);
      if (!tx) throw new Error('Invalid login transaction');
      const tokens = await oidc.authorizationCodeGrant(config, current, {
        expectedState: state, expectedNonce: tx.nonce, pkceCodeVerifier: tx.verifier,
        idTokenExpected: true,
      });
      const claims = tokens.claims();
      if (!claims) throw new Error('Missing identity');
      return { issuer: claims.iss, subject: claims.sub };
    },
  };
}
// Alternative to synchronizer CSRF tokens. Never send the session binding itself.
export function signedCsrf(key: Buffer) {
  if (key.length < 32) throw new Error('CSRF key needs at least 32 random bytes');
  const secret = Buffer.from(key);
  const pattern = /^[a-f0-9]{64}\.[a-f0-9]{64}$/;
  function mac(binding: string, nonce: string) {
    if (!binding || Buffer.byteLength(binding) > 1024) throw new Error('Invalid binding');
    const message = `${Buffer.byteLength(binding)}!${binding}!${nonce.length}!${nonce}`;
    return createHmac('sha256', secret).update(message).digest('hex');
  }
  return {
    issue(binding: string) {
      const nonce = randomBytes(32).toString('hex');
      return `${nonce}.${mac(binding, nonce)}`;
    },
    valid(binding: string, cookies: readonly string[], headers: readonly string[]) {
      const cookie = cookies[0], header = headers[0];
      if (cookies.length !== 1 || headers.length !== 1 || !cookie || !header ||
          cookie.length !== 129 || header.length !== 129 || !pattern.test(cookie) || !pattern.test(header) || !binding || Buffer.byteLength(binding) > 1024)
        return false;
      if (!timingSafeEqual(Buffer.from(cookie), Buffer.from(header))) return false;
      const [nonce, signature] = cookie.split('.');
      return !!nonce && !!signature && timingSafeEqual(Buffer.from(signature, 'hex'),
        Buffer.from(mac(binding, nonce), 'hex'));
    },
  };
}
```

For PostgreSQL, a transaction table can hold `state text PRIMARY KEY`, `binding text NOT NULL`, `verifier text NOT NULL`, `nonce text NOT NULL`, `expires_at timestamptz NOT NULL`. Insert with parameters; random-state collision is an error. Implement `take` as one statement, mapping its returned row to `Transaction`:

```sql
DELETE FROM oidc_transactions
WHERE state = $1 AND binding = $2 AND expires_at > $3::timestamptz
RETURNING binding, verifier, nonce, expires_at;
```

Use a trusted server clock and convert epoch milliseconds to a timestamp deliberately. Concurrent matching callbacks can return at most one row. A scheduled bounded expiry sweep and per-session admission policy remain required. The offline validation below uses an atomic single-process map fixture; this SQL adapter and its concurrent database behavior are learner integration work, not a measured production guarantee.

## Connect the result to the existing session

1. Start from an existing anonymous server session. Save its binding/session before sending the authorization redirect. Protect a sign-in initiation POST with the existing Origin and CSRF guards; rate-limit it. For the query-mode callback, a host-only Secure/HttpOnly/SameSite=Lax session cookie supports the top-level provider redirect. A cross-site `form_post` response has different cookie behavior and is outside this example.
2. Construct the callback URL from the configured origin/path plus the actual raw query. Do not derive the trusted origin from arbitrary Host or forwarded headers. Configure reverse-proxy trust narrowly. Reject duplicate parameters through the maintained client and the explicit state check; do not silently flatten the query into an object.
3. Pass the current anonymous session binding to `finish`. On failure show a fixed sign-in failure and restart; never echo codes, tokens or raw provider errors. Record only safe outcome categories. The client verifies claims/signature; it cannot decide your account-linking policy.
4. Resolve the returned `(issuer, subject)` through a unique local identity mapping. Account creation and explicit linking need separate policy and transactional uniqueness. Do not silently merge accounts by email, even when the provider says the email is verified.
5. Regenerate the local session ID, set the authorized local user, rotate the primary CSRF token, and save the new session before returning success. Reuse the runnable application's existing session store and logout invalidation. Check current local suspension/permissions rather than copy permanent roles from an ID token. A valid external identity does not override a disabled local account.

Tokens stay on the server. This flow returns only stable identity fields, not an ID/access token to browser JavaScript. If external API access is needed later, design minimal scopes, token storage/rotation/revocation separately. Local logout does not automatically revoke provider sessions; provider logout is another explicit feature.

## Signed double-submit as an alternative

The HMAC binds a random nonce to the current private server session binding. Length prefixes avoid ambiguous concatenation. The session binding itself never appears in the token. Merely signing a random value without binding it to the session still permits token injection/reuse across sessions in vulnerable cookie setups. A plain equality check between an attacker-set cookie and header is insufficient.

On HTTPS set the issued value as `__Host-csrf`, with `Secure`, `Path=/`, no `Domain`, and `SameSite=Lax`. It may be JavaScript-readable when the UI reads that cookie to send `X-CSRF-Token`; the separate authentication cookie remains HttpOnly. Alternatively return the token through an authenticated same-origin JSON endpoint. Never put it in URLs or logs. Session regeneration changes the binding and invalidates old CSRF tokens. Keep the HMAC key separate from cookie signing/provider secrets, random, server-only and shared across instances; key rotation needs an explicit transition policy or reissue/relogin.

Before each unsafe request, authenticate the session, require the exact trusted Origin, and call `valid` with **all** occurrences of this cookie and header. Reject duplicate names/headers before a framework parser collapses them. Do not split a merged header and pick a convenient value. Enforce ingress header-size limits. Reject malformed/missing tokens with403 before business logic, including login and logout where applicable. Safe GET/HEAD endpoints must not mutate state. Cross-origin API clients need their own explicit authentication policy rather than globally skipping browser checks.

`valid` is the bounded cryptographic core, not Express middleware or a cookie parser. The current Task Board already supplies a tested synchronizer-token implementation; do not install both approaches merely to satisfy an exercise. Prefer maintained framework protection when it meets your session contract. SameSite and CORS are additional browser controls, not replacements for this decision. XSS can read a JavaScript-readable token and submit requests as the user; prevent injection and apply the [CSP design](./browser-csp.md) as defense in depth.

## Debugging and practice acceptance

A callback that fails before exchange usually points to lost anonymous-session state, mismatched redirect, expired/consumed transaction or state duplication. A token rejection points to nonce, issuer/client registration, clock, algorithm/JWKS/key rotation or provider configuration. Diagnose these categories without logging raw credentials. A provider outage should terminate promptly with a recoverable sign-in failure, not hang requests or loop retries.

[Independent integration exercise](../practice/node-js/oidc-and-csrf-lab.md).

**Validation performed:** exact TypeScript source compiled under strict, noUncheckedIndexedAccess and exactOptionalPropertyTypes. `skipLibCheck` was required because openid-client6.8.8's declaration of optional `Configuration.timeout` conflicts with exact optional property checking; application checking remained enabled. Offline tests exercised the real client with controlled HTTPS fetch responses, an RSA-signed ID token and JWKS: successful identity, PKCE verifier/challenge, state duplication, wrong session, expiry, replay, wrong callback origin/path, provider error, and invalid nonce/issuer/audience/token expiry/signature.

HMAC tests covered valid/random tokens, cross-session use, duplicates, missing/malformed/tampered/forged values and short keys. No live provider, real cookie middleware, PostgreSQL adapter, proxy, browser or end-to-end session establishment was tested here. Learner practice remains required.

References: [openid-client API and examples](https://github.com/panva/openid-client), [OIDC Core](https://openid.net/specs/openid-connect-core-1_0.html), [OAuth security best current practice](https://www.rfc-editor.org/rfc/rfc9700.html), [OWASP CSRF prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html), [OWASP session management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).
