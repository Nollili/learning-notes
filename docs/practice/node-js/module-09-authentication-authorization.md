# Authentication and Authorization — practice

**Learner status: still required.** These tasks were separated from the textbook; no completion is credited.

[Textbook explanation](../../node-js/module-09-authentication-authorization.md) · [Node.js practice map](./index.md)

## Graduated practice: identity and access

### Worked example {#_1-worked-example}

Follow the browser-session walkthrough near the start of this chapter: anonymous CSRF bootstrap, registration, session regeneration on login, an owner-scoped write and logout. Compare every expected status and cookie change.

### Guided build {#_2-guided-build}

Use the retained session application with two independent cookie jars. Hint: a session identifies the caller; the `owner_id` predicate authorizes the task. **Success:** the owner can update, another signed-in user gets the same 404 as a missing task, and a missing CSRF token returns 403.

### Independent task {#_3-independent-task}

Add an authenticated endpoint that renames a task using an allowlisted title. Keep ownership in the UPDATE predicate. **Success:** a hostile title is stored as text, an unknown field is rejected, and another user cannot rename the task even if they know its ID.

### Optional depth: JWT and concurrent access boundaries {#_4-optional-depth-jwt-and-concurrent-access-boundaries}

Use Node 24, TypeScript 5.9, Express 5 and jsonwebtoken 9.0.3 (lock exact resolved versions). Put the verifier, header parser and middleware in separate typed modules and wire the principal adapter shown above. Keep test fixtures outside any Autocode-owned src/tests directory. No actual key or provider credential belongs in the notes.

**Acceptance:** a valid signed 15-minute access token works with Bearer/bearer/BEARER and multiple ASCII spaces while token case remains intact. Reject missing exp/iat/role/purpose, invalid role, malformed subject, future iat/nbf, expired token, wrong issuer/audience/algorithm/key, excessive lifetime and refresh-purpose token. Test the exact expiry and five-second tolerance boundary. Missing/invalid credentials and known disabled users return 401 with the challenge; a thrown verification configuration error or rejected account-store call reaches next(error), never 401 and never the protected handler. Do not log raw credentials. Document revocation/role-change staleness for the chosen lookup policy.

In an isolated PostgreSQL database create two tenants and owners, perform the conditional update, change ownership between a prior read and write, then prove the old owner cannot update. Other-tenant/missing IDs produce the same no-row result; hostile name text stays a bound value; authorized changes return only id/name. For operations with extra invariants use a conditional version/state predicate or an explicit transaction/lock and test interleavings; authorization does not exempt stock/payment invariants. Record the observed interleavings and results before marking the exercise complete.

References checked 2026-10-21: [jsonwebtoken verification/options/errors](https://github.com/auth0/node-jsonwebtoken), [HTTP authentication scheme case](https://www.rfc-editor.org/rfc/rfc9110.html#section-11.1), [Bearer syntax](https://www.rfc-editor.org/rfc/rfc6750.html#section-2.1), [OWASP authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html), [PostgreSQL Read Committed](https://www.postgresql.org/docs/16/transaction-iso.html#XACT-READ-COMMITTED). The runnable application supplies the session/CSRF and reset workflow. OIDC federation and upload pipelines are separate advanced integrations; this JWT lab does not implement those protocols.

---

## Final review checklist {#_16-final-review-checklist}

### Fundamentals

- [ ] Distinguish authentication from authorization.
- [ ] Explain why missing/invalid credentials normally produce `401` and insufficient permission produces `403`.
- [ ] Compare sessions, signed tokens, OIDC, and API keys.
- [ ] Explain why bearer credentials must be protected from theft and replay.

### JWTs and token lifecycle

- [ ] Identify JWT header, payload, and signature.
- [ ] Explain why signing is not encryption.
- [ ] Validate algorithm, signature, issuer, audience, expiration, and application claims.
- [ ] Keep claims minimal and non-secret.
- [ ] Explain access-token expiry, refresh rotation, revocation, and replay detection.
- [ ] Describe when server-side session/token state is worth the cost.

### Passwords

- [ ] Use a password-specific adaptive hashing function.
- [ ] Explain salts, optional peppers, and work parameters.
- [ ] Know why raw SHA-256 and MD5 are inappropriate for passwords.
- [ ] Hash exactly once and never expose the stored hash.
- [ ] Rate-limit credential endpoints and avoid account-enumeration responses.

### Express implementation

- [ ] Validate login and registration input.
- [ ] Assign privileged fields on the server, not from public input.
- [ ] Attach a small trusted principal to the request.
- [ ] Apply authentication before authorization.
- [ ] Enforce ownership/tenant filters at the data or use-case boundary.
- [ ] Keep public response objects separate from persistence entities.

### OAuth and browser security

- [ ] Distinguish OAuth authorization from OIDC authentication.
- [ ] Use Authorization Code flow with PKCE and validate state/nonce as applicable.
- [ ] Link external accounts by stable issuer and subject.
- [ ] Understand the XSS/CSRF trade-offs of browser token storage.
- [ ] Configure secure cookies deliberately.

### Application and supply-chain security

- [ ] Map only allowed public fields instead of assigning an entire request body.
- [ ] Keep caller-controlled paths inside an approved root or generate server-side names.
- [ ] Avoid shell interpretation and validate subprocess arguments and resources.
- [ ] Reject unknown and dangerous object keys before merging data.
- [ ] Restrict outbound URLs and enforce network-level egress controls where possible.
- [ ] Limit and isolate uploads, parsers, regular expressions, and other resource-heavy input.
- [ ] Allowlist redirect destinations.
- [ ] Keep secrets out of builds, source maps, logs, images, and browser bundles.
- [ ] Review dependency and lockfile changes, scan for known risks, and remove unused packages.
- [ ] Trace untrusted data through every privileged sink.

**Check yourself:** explain why deleting only the browser cookie does not revoke a stolen session identifier, why the login POST also needs CSRF protection, and why a session alone does not authorize a task ID.

**Guided exercise:** obtain a recovery token, use it twice, and attempt login with the old and new passwords. **Expected:** first reset 204; second reset 400; old password 401; new password 200; existing session and refresh credentials unusable. Repeat after expiring the reset row in a disposable database. The acceptance runner also races two completions and requires one winner.

**Guided verification:** run the acceptance suite against a disposable PostgreSQL database. It races two calls, requires exactly one fulfillment, then checks that the winner's replacement is rejected and the family remains revoked after both transactions finish. A mock repository cannot demonstrate row locking or commit behavior.
