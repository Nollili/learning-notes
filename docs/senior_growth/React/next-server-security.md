# Next.js Server Security: Sessions, Data Access and Mutations

Target: senior frontend boundary design and intermediate backend implementation. Continues [App Router foundations](./next-app-router.md). Baseline: patched Next.js16.4.3/React19, Node runtime and PostgreSQL with node-postgres; docs checked2026-10-27. This is a worked integration lesson, not a deployed authentication system. Login/provider integration, database provisioning, rate limits and real browser/security tests remain explicit exercise work.

## Trust boundaries and private data

Authentication identifies the caller; authorization decides which resource/action they may access. Hiding a button, redirecting a page, a Proxy check or an unguessable Server Action identifier does not authorize a subsequent direct request. Recheck the session and resource rule at each data-access/mutation boundary. Server Actions are remotely callable entry points. A Server Component can accidentally leak private values through returned HTML/RSC/props even though its implementation is server-only.

Use a server-only DAL, parameterized queries and minimal DTOs. Do not spread an ORM user/entity into props. Read queries need owner/tenant predicates just as writes do. A shared cache is another data boundary: no public catalog cache for session-specific profile data. Per-request memoization is different from caching one user's result across requests. Never trust a client-supplied userId, role, price or ownership flag.

## Opaque-session contract and concrete database boundary

A proven authentication library/provider is the preferred login/session integration. This example demonstrates the verification contract with an existing opaque session, so the data-access rules can be independently understood. After a successful authenticated login, a session issuer must generate32cryptographically random bytes, send the base64url token only in a Secure/HttpOnly/Path=/ cookie named __Host-session (no Domain, appropriate SameSite), and persist only its SHA256 hash with user/expiry/revocation state. Rotate on privilege/login transitions and revoke on logout. Do not build a password login merely by setting an arbitrary user ID cookie.

<<< ../../workbench/frontend/next/security-fragments/schema.sql{sql}

<<< ../../workbench/frontend/next/security-fragments/lib/db.ts{ts}

Pool size is a workload/deployment budget, not5per-instance everywhere. Reuse one pool per production process; a dev HMR strategy may reuse it through a guarded global. Use the provider's verified TLS configuration, never disable certificate verification to “fix” connectivity. A one-off script closes its pool in finally; a server pool lives until process shutdown. Serverless instance counts can exhaust database limits; use appropriate pooling/proxy configuration and measure.

<<< ../../workbench/frontend/next/security-fragments/lib/session.ts{ts}

The session issuer is deliberately outside this verifier; seed a fixture session through a test-only setup in the separate exercise application, then integrate a real provider. Hashing a high-entropy opaque token is different from password hashing: passwords need an adaptive password hash. HttpOnly limits script access to the cookie, but XSS can still issue authenticated actions. SameSite is useful defense-in-depth, not a complete CSRF policy. Local HTTP development cannot be assumed to behave like deployed HTTPS secure cookies.

## Validation and conditional authorization: one write

<<< ../../workbench/frontend/next/security-fragments/lib/note-input.ts{ts}

This intentionally uses a conservative100UTF16-code-unit UI bound, which is stricter than PostgreSQL's character count for supplementary characters. Decide normalization/grapheme policy for the product; validation is not HTML escaping or a replacement for output-context safety. Reject unknown JSON fields to prevent silent mass assignment; use a schema library when more fields/cross-field rules justify it.

<<< ../../workbench/frontend/next/security-fragments/lib/notes.ts{ts}

Ownership/version predicates participate in the write rather than a separate check-then-update race. Concurrent edits with the same version cannot both win. A null result intentionally does not distinguish absent, unauthorized and stale-version resources; the UI can request an authorized refresh rather than exposing ownership. For tenant/role policies, encode the relevant predicates/transaction rules too. Session revocation mid-request has a policy window; high-risk operations may require transaction-bound session/permission revalidation or step-up authentication.

A version check is not general idempotency. A lost response after commit means replaying the same version fails safely but does not return the original success. Payments/job creation need a durable idempotency record with caller/key/request fingerprint, atomic claim and stored result. Disabling a button is only a UI affordance, not a server duplicate-execution guarantee.

## Route Handler: explicit HTTP boundary and CSRF policy

Route Handlers use Web Request/Response APIs; do not put page.tsx and route.ts at the same route path. This cookie-authenticated browser endpoint requires an exact configured source Origin; missing/null/mismatched origins fail closed. Non-browser clients use a separately designed authentication/CSRF contract rather than bypassing this check. Keep GET/HEAD free of state changes.

<<< ../../workbench/frontend/next/security-fragments/lib/http-input.ts{ts}

The limit counts received bytes rather than trusting Content-Length. Configure ingress/runtime body/time/concurrency limits too; one received chunk may already have been allocated before this reader rejects it. Rejected async cleanup is consumed, not used as an unlimited wait. Stream/body cancellation and platform request lifetimes need integration tests under the actual deployment.

<<< ../../workbench/frontend/next/security-fragments/app/api/notes/route.ts{ts}

Do not derive trusted target origin from arbitrary forwarded headers. Configure the canonical origin from trusted deployment settings and test every ingress path. Strict JSON plus same-origin policy reduces CSRF exposure; CORS is not authentication and should not allow arbitrary credentialed origins. Where browser workflows cannot supply trusted origin information, use a designed token defense instead of accepting missing headers. HTTP failures such as database unavailability must not become401 “bad credentials.”

## Server Action: the same trust boundary, another transport

<<< ../../workbench/frontend/next/security-fragments/app/notes/actions.ts{ts}

Build a labeled native form with hidden id/version plus title and submit; use action-state/pending UI to render expected validation/conflict results. Hidden/bound fields are untrusted inputs. Framework action origin checks and POST handling are additional CSRF defenses, not authorization. Configure allowed origins narrowly for trusted proxies; do not assume custom Route Handlers inherit all Server Action protections. Unexpected action failures should reach safe error handling/server diagnostics; expected user errors return data. No automatic infinite retry and no redirect swallowed inside a broad catch.

## Environment and secret management

DATABASE_URL/provider credentials stay server-side in a secret store/environment, never committed .env files or public props. NEXT_PUBLIC values are browser-visible and normally inlined at build time; promoting one built artifact does not magically replace its public values at runtime. A server-only import guards module misuse, not every serialization/logging leak. Validate required variables at the intended lifecycle (build versus runtime) and fail safely without dumping secrets. Source maps, build logs, error payloads, analytics and cache keys also require review. Rotate exposed credentials and rebuild/redeploy affected client artifacts; deleting a source literal does not revoke a secret.

## Practice and acceptance evidence

Use the [separate practice requirements and observation ledger](../../practice/frontend/react/next-server-security.md). All learner work remains outstanding.

## Official references

Checked2026-10-27: [Next authentication](https://nextjs.org/docs/app/guides/authentication), [data security and action protections](https://nextjs.org/docs/app/guides/data-security), [Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route), [environment variables](https://nextjs.org/docs/app/guides/environment-variables), [node-postgres parameterized queries](https://node-postgres.com/features/queries), [OWASP CSRF prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html), [OWASP session management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).
