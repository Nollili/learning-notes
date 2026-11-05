---
outline: [2, 3]
---

# Security for Node.js services

These eight questions target independent implementation and Level 4 design reasoning. The primary stack remains Node.js 24, Express 5, PostgreSQL and the existing Argon2id/session implementation. Examples are bounded teaching fixtures, not an assurance that a deployed application is secure. Official security guidance checked 2026-11-05.

## How do you turn a threat model into enforceable controls? {#t14-q01}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Identify assets, callers, entry points, trust boundaries and abuse cases; assign a control and a verification method to each risk. **Security is enforced at every authoritative boundary**, including jobs and internal routes, not only the public controller.

</div>

For a Products API, assets include tenant records, credentials, administrator actions and report files. Trace browser→proxy→Express→database/object store, plus queue consumers and deployment identity. The proxy's forwarded headers, a signed user's resource IDs and a previously stored document have different trust levels. Authentication does not make every field safe.

| Abuse case | Control | Evidence |
|---|---|---|
| Read another tenant's product | Per-action authorization and scoped SQL predicate | Two-tenant denial test |
| Exhaust parsing/hash/DB capacity | Byte/count limits, bounded admission and quotas | Oversize/concurrent failure checks |
| Steal credential from diagnostics | Redaction, least-privilege log access and retention | Inspect representative failure logs |
| Compromise one dependency | Narrow runtime authority, reviewed updates and monitoring | Dependency path and reachable-code analysis |

Prioritize impact and plausibility, define an owner and retain residual risk. OWASP Top 10 is an awareness taxonomy; ASVS offers more concrete verification requirements. Neither a checklist nor one scanner covers your application's business abuse rules. Rate limiting needs a trusted client identity/proxy policy and shared state across replicas; unlimited in-memory keys can themselves become a memory attack.

<span class="notes-section-label">**Practice and acceptance**</span>

Produce a one-page data-flow model with five abuse cases, owners, controls and tests. Accept only when alternate routes and a background worker receive the same authorization scrutiny, and limits include both per-request size and concurrent work. Reference: [OWASP threat modeling](https://owasp.org/www-community/Threat_Modeling), [ASVS](https://owasp.org/www-project-application-security-verification-standard/).

---

## How do validation, output encoding, SQL binding and CSRF defenses differ? {#t14-q02}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Validate the input contract, bind SQL values, encode output for its destination and protect browser mutations against forged requests. **There is no universal “sanitize everything” function.** Each defense addresses a different boundary.

</div>

Validate types, permitted keys, lengths, ranges and business relationships before expensive work. In Express, limit JSON bodies and reject unsupported content types; schema validation after parsing does not bound parsing itself. Copy allowed fields into a DTO rather than mass-assigning the body into an entity or merging arbitrary keys into configuration.

```js [validated-product.mjs]
import assert from 'node:assert/strict';
export function parseProduct(value) {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    Object.keys(value).some((key) => !['name', 'priceCents'].includes(key)) ||
    typeof value.name !== 'string' ||
    value.name.trim().length < 1 ||
    value.name.length > 80 ||
    !Number.isSafeInteger(value.priceCents) ||
    value.priceCents < 0 ||
    value.priceCents > 1_000_000
  ) {
    throw new TypeError('invalid product');
  }
  return { name: value.name.trim(), priceCents: value.priceCents };
}
assert.deepEqual(parseProduct({ name: ' Pen ', priceCents: 200 }), {
  name: 'Pen',
  priceCents: 200,
});
assert.throws(() => parseProduct({ name: 'Pen', priceCents: '200' }));
assert.throws(() => parseProduct({ name: 'Pen', priceCents: 200, isAdmin: true }));
assert.throws(() =>
  parseProduct(JSON.parse('{"name":"Pen","priceCents":200,"__proto__":{}}')),
);
```

A product name containing `<` can be legitimate data. Render it through the UI framework's text escaping; do not insert it into `innerHTML`, inline script or an unvalidated URL. HTML, attribute, JavaScript and URL contexts need different handling. If rich HTML is a real requirement, use a maintained allowlist sanitizer and review its configuration. CSP is defense in depth, not a replacement for safe sinks.

SQL values use driver parameters; identifier/sort choices use fixed allowlisted SQL fragments. See the [real bound SQL fixture](./17-databases.md#t17-q03). Parameters do not add tenant authorization. Cookie-authenticated mutations need the [session-bound CSRF token and origin policy](./13-authentication-and-authorization.md#t13-q02); do not put state-changing actions behind GET. SameSite and CORS alone are not the entire CSRF design.

<span class="notes-section-label">**Practice and acceptance**</span>

Test extra fields, wrong types, oversize JSON, injection-shaped text, unsafe rich HTML and a cross-origin mutation. Accept when valid literal text survives, SQL/schema remain intact, browser execution does not occur and CSRF denial does not rely on hiding a button. References: [OWASP input validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html), [XSS contexts](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html), [CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).

---

## How do you prevent SSRF in an outbound HTTP feature? {#t14-q03}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Prefer server-selected destinations over arbitrary user URLs, and enforce the destination policy at the actual connection boundary. **Parsing an HTTPS URL does not prove it reaches an allowed public service.** Redirects, DNS changes and alternate address forms matter.

</div>

For a report source, accept a provider ID and map it to a fixed reviewed origin/path rather than accepting a complete URL. If arbitrary destinations are unavoidable, define allowed schemes/hosts/ports, resolve and validate all relevant IPv4/IPv6 addresses, prevent resolution-to-connect gaps, bound redirects and revalidate each hop. Deny loopback/private/link-local/metadata paths as applicable and enforce network egress policy as another boundary. Do not invent a few regexes and call them a complete IP policy.

```js [fixed-provider.mjs]
import assert from 'node:assert/strict';
export function providerRequest(provider, reportId) {
  if (
    provider !== 'catalogue' ||
    typeof reportId !== 'string' ||
    !/^[a-z0-9-]{1,40}$/.test(reportId)
  )
    throw new TypeError('invalid source');
  return new URL(
    `/reports/${encodeURIComponent(reportId)}`,
    'https://catalogue.example',
  );
}
assert.equal(
  providerRequest('catalogue', 'r-1').href,
  'https://catalogue.example/reports/r-1',
);
assert.throws(() => providerRequest('http://127.0.0.1', 'r-1'));
assert.throws(() => providerRequest('catalogue', '../admin'));
```

The reserved `.example` host deliberately performs no request. A real adapter uses a configured trusted destination, disables unexpected redirects (`redirect: 'error'` for fetch), verifies TLS and bounds total time and streamed response bytes. Never attach a broad bearer credential to a caller-selected destination. A timeout must own/cancel the request and observe late errors; a `Promise.race` alone only stops waiting. Limit decompressed content too when response handling can expand it.

<span class="notes-section-label">**Practice and acceptance**</span>

Use only owned mock destinations: verify rejected provider/path, redirect to a forbidden destination, excessive response and stalled headers/body. Accept when the forbidden server observes zero requests, credentials never cross the boundary and no operation remains active after the deadline. Reference: [OWASP SSRF prevention](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html), [owned HTTP request examples](./08-networking.md).

---

## What do TLS, secret management and authenticated encryption each protect? {#t14-q04}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

TLS authenticates and encrypts a channel when certificate verification is correct. Secret management controls key/credential access and rotation. Authenticated encryption protects stored ciphertext integrity and confidentiality. **Encryption does not authorize the caller or repair leaked keys.**

</div>

Use supported TLS, not obsolete SSL protocols. Verify the server certificate chain and hostname, track CA/certificate expiry and rotate deliberately. In a proxy deployment, document where TLS terminates and which downstream hops need TLS or mTLS. HSTS tells supporting browsers to use HTTPS; it does not encrypt an arbitrary database socket. For PostgreSQL, retain the [CA/hostname-verified driver configuration](./17-databases.md#t17-q02) and separate app/migration privileges.

Never commit a connection URI or put secrets in browser bundles, image layers, build arguments or logs. Load them through a controlled runtime provider, minimize copies and plan overlap/reconnection during rotation. Environment variables are an injection mechanism, not an access-control system. A leaked secret needs revocation/rotation plus investigation; deleting a line from Git is insufficient.

The bounded fixture below demonstrates AES-256-GCM on Node.js 24. It uses a new random key only for the test; production uses managed key/version storage and a format/retention design. Never reuse a nonce under the same GCM key.

```js [authenticated-envelope.mjs]
import assert from 'node:assert/strict';
import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';
const key = randomBytes(32);
const aad = Buffer.from('products-report:v1:tenant-a');
const nonce = randomBytes(12);
const cipher = createCipheriv('aes-256-gcm', key, nonce);
cipher.setAAD(aad);
const plaintext = Buffer.from('owned report');
const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
const tag = cipher.getAuthTag();
function open(data, authTag, context = aad) {
  const decipher = createDecipheriv('aes-256-gcm', key, nonce);
  decipher.setAAD(context);
  decipher.setAuthTag(authTag);
  // Do not release update() output before final() verifies authenticity.
  return Buffer.concat([decipher.update(data), decipher.final()]);
}
assert.deepEqual(open(ciphertext, tag), plaintext);
const changed = Buffer.from(ciphertext);
changed[0] ^= 1;
assert.throws(() => open(changed, tag));
assert.throws(() => open(ciphertext, tag, Buffer.from('tenant-b')));
```

Hashing, HMAC, encryption and password hashing have different purposes. AAD binds authenticated context but is not encrypted. Persist an algorithm/version/key ID, nonce, tag and ciphertext under a reviewed envelope; bound/validate all decoded fields before decryption and map failure to a generic error. The fixture is not a complete key-management protocol or streaming decryptor.

<span class="notes-section-label">**Practice and acceptance**</span>

Verify trusted/untrusted/wrong-host TLS fixtures; test credential rotation and corrupted ciphertext/tag/context. Accept only when every invalid case fails closed, plaintext is withheld until authentication completes and no secret is logged. References: [Node24 TLS](https://nodejs.org/docs/latest-v24.x/api/tls.html), [crypto AEAD API](https://nodejs.org/docs/latest-v24.x/api/crypto.html), [OWASP secret management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html).

---

## How do you store passwords and resist authentication abuse? {#t14-q05}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Use a maintained password-hashing implementation with a unique salt and reviewed cost, then bound verification concurrency and abuse attempts. **Fast hashes and reversible encryption are unsuitable password storage.** Recovery, enumeration and credential stuffing belong to the same threat model.

</div>

Argon2id is the primary algorithm in the existing application. Its encoded hash carries the salt and cost parameters; verify with the library and rehash after successful login when policy changes. OWASP currently gives an Argon2id baseline of 19 MiB memory, two iterations and parallelism one; choose parameters using current guidance and measured service capacity, never weaken them merely to pass a tiny benchmark.

```js [password-hash.mjs]
import assert from 'node:assert/strict';
import argon2 from 'argon2'; // existing application pin: 0.44.0
const options = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};
const a = await argon2.hash('example-only-passphrase', options);
const b = await argon2.hash('example-only-passphrase', options);
assert.notEqual(a, b);
assert.equal(await argon2.verify(a, 'example-only-passphrase'), true);
assert.equal(await argon2.verify(a, 'wrong-passphrase'), false);
assert.equal(argon2.needsRehash(a, options), false);
```

Do not log the example's real-world equivalents. Accept long passphrases under a deliberate byte limit, avoid silent truncation, reject known-compromised choices under a privacy-reviewed policy, and prefer MFA for sensitive access. Rate limits should combine account and trusted network/device signals without enabling trivial account-lockout denial of service. Generic failure text reduces enumeration but does not establish identical timing.

Scrypt is a memory-hard alternative when Argon2id is unavailable; bcrypt has legacy length limits; PBKDF2 can fit specific compliance requirements. A pepper is a separately held secret with rotation/recovery consequences, not a replacement for a salt. Do not migrate hashes by attempting to decrypt them: verify the old format on login and rehash with the new policy.

Use the [existing single-use reset and credential-version workflow](../module-09-authentication-authorization.md), including session/refresh revocation. Recovery codes are credentials; store/expire/consume them deliberately. A password reset cannot undo already authorized in-flight operations.

<span class="notes-section-label">**Practice and acceptance**</span>

Verify distinct salts, correct/wrong/malformed hashes, controlled rehash, bounded parallel login and single-use recovery under concurrency. Accept with measured memory/latency and no raw secret in diagnostics. References: [OWASP password storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html), [node-argon2](https://github.com/ranisalt/node-argon2).

---

## How do npm audit and other security scanners fit a release? {#t14-q06}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Use dependency, static, secret and dynamic checks for different evidence; triage findings by reachability, impact and fix risk. **A clean scanner result does not prove security**, and an automatic breaking upgrade is not a reviewed remediation.

</div>

In the actual application directory, run `npm audit --json` and inspect the dependency path, affected versions, advisory and available fix. `npm audit --omit=dev` answers a narrower runtime-tree question; build-tool compromise still matters. Registry access, submitted dependency metadata and the selected registry are part of the workflow. Do not send a private dependency inventory to an unreviewed service.

An audit can fail because vulnerabilities exist or because the registry/report failed; distinguish the exit/output before labeling the release. `npm audit fix` changes the lock/tree, and `--force` can cross compatibility boundaries. Prefer a minimal reviewed update with build/test/artifact checks and a time-bounded exception owner when no safe fix exists. Do not edit protected tests to make an upgrade appear compatible.

SAST tools such as CodeQL inspect code paths but need configuration/triage. SCA services such as Dependabot or Snyk compare dependency inventories. Secret scanning detects selected credential patterns, while DAST such as OWASP ZAP exercises a running application. None reliably discovers every tenant-authorization or workflow defect. Use a sandbox for active scanning, narrow its scope and avoid destructive requests against production.

<span class="notes-section-label">**Practice and acceptance**</span>

Analyze one advisory's direct/transitive path and write a minimal fix or a justified expiring exception; review one static and one dynamic finding in an owned app. Accept with evidence of actual report acquisition, affected-code reasoning, regression checks and residual limits. References: [npm audit](https://docs.npmjs.com/cli/v11/commands/npm-audit/), [GitHub code scanning](https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning), [OWASP ZAP](https://www.zaproxy.org/docs/).

---

## What does Helmet protect, and how do you test framework hardening? {#t14-q07}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Helmet supplies browser-facing response-header defenses; configure them for the actual document/API and deployment. **Headers do not validate input, authenticate callers or authorize records.** Express security also includes parsing, proxy trust, cookies, errors and resource limits.

</div>

This integration fragment uses Helmet 8.1.0 with Express 5.1.0; the rest of the application supplies authenticated routes and final error middleware:

```js [helmet-configuration.mjs]
app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'none'"],
      },
    },
    referrerPolicy: { policy: 'no-referrer' },
  }),
);
app.use(express.json({ limit: '16kb', strict: true }));
```

The CSP extends Helmet's defaults rather than replacing every directive. Test the effective header and your real frontend assets; strict policy may block inline scripts/styles or third-party assets. Use a generated per-response nonce when a reviewed inline-script requirement exists, never a fixed nonce. A report-only rollout can reveal violations before enforcement. Do not disable the entire policy merely to make an error disappear.

HSTS and upgrade directives assume an HTTPS deployment; avoid learning a localhost exception as a production setting. Configure proxy trust for known topology before relying on client IP or Secure cookies. Never expose stack traces, inspector ports or administrative diagnostics publicly. Bound request/header/body time and upload/decompression sizes in the correct layer; a body limit does not bound CPU-heavy work after parsing.

<span class="notes-section-label">**Practice and acceptance**</span>

Use a real loopback request to check CSP, nosniff, referrer policy and removal of X-Powered-By on success and errors. Verify an oversize body rejects and an owned HTML page renders under its policy. Accept only with tests of actual response headers plus independent authorization/CSRF tests. References: [Helmet reference](https://helmet.js.org/), [Express production security](https://expressjs.com/en/advanced/best-practice-security.html).

---

## Is node:vm, a worker or a container a safe sandbox for untrusted code? {#t14-q08}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

`node:vm` is not a security boundary for hostile code. Workers and child processes also need an explicit authority/resource isolation design. **A separate JavaScript context or PID is not sufficient containment.** Prefer avoiding arbitrary execution or using a reviewed dedicated isolation service.

</div>

A process can inherit filesystem access, environment credentials and network authority. A timeout does not stop every native/child operation, and a worker shares process-wide native failure/resource pressure. Node's permission model can reduce accessible capabilities for a trusted program under its documented limits; do not treat it as a complete malicious-code sandbox.

A stronger execution design separates the trust domain: unprivileged identity, no host socket/mounts/secrets, deny-by-default network, bounded CPU/memory/PIDs/output/time, read-only base, explicit ephemeral storage, syscall/runtime policy and an external kill/reap owner. A container shares a kernel boundary and still needs patching/configuration; a dedicated VM or specialist sandbox may be justified for hostile tenants. Review side channels, escape history, dependency trust and cleanup, not only API convenience.

For user-defined reports, prefer a bounded data DSL over JavaScript. Permit a small set of operations, validate depth/count/value size and interpret without eval/Function. The [worked Interpreter](./patterns/behavioral-data.md#t18-q17) demonstrates bounded grammar mechanics; it is not an isolated arbitrary-code runtime.

<span class="notes-section-label">**Practice and acceptance**</span>

Write an execution authority matrix and a rejection/cleanup plan. Test a bounded DSL against excess depth, cycles, invalid operators and excessive output. If arbitrary execution is required, use an independently reviewed isolation environment and prove denied file/network/credential access plus process-tree cleanup; do not run hostile demonstrations on your workstation. References: [Node24 vm warning](https://nodejs.org/download/release/v24.18.0/docs/api/vm.html), [permission model limits](https://nodejs.org/docs/latest-v24.x/api/permissions.html), [OWASP Node security](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html).

## Revision and mixed practice

1. An HTTPS route uses Helmet and escapes HTML but still reads another tenant's record. Which control is missing?
2. A dependency fix changes a major version and breaks the artifact's startup. May a clean audit report bypass the failure?

<span class="notes-section-label">**Answer guide — attempt both cases first**</span>

1. Resource authorization and scoped persistence. Transport, browser headers and encoding do not grant tenant authority.
2. No. Review compatibility, fix the integration or document a bounded exception; the actual release must still pass its required checks.

Each question's exercise remains learner work. Exact local fixture checks and their limitations are recorded in the combined progress tracker.
