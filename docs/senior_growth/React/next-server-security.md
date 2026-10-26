# Next.js Server Security: Sessions, Data Access and Mutations

Target: senior frontend boundary design and intermediate backend implementation. Continues [App Router foundations](./next-app-router.md). Baseline: patched Next.js16.4.2/React19, Node runtime and PostgreSQL with node-postgres; docs checked2026-10-20. This is a worked integration lesson, not a deployed authentication system. Login/provider integration, database provisioning, rate limits and real browser/security tests remain explicit exercise work.

## Trust boundaries and private data

Authentication identifies the caller; authorization decides which resource/action they may access. Hiding a button, redirecting a page, a Proxy check or an unguessable Server Action identifier does not authorize a subsequent direct request. Recheck the session and resource rule at each data-access/mutation boundary. Server Actions are remotely callable entry points. A Server Component can accidentally leak private values through returned HTML/RSC/props even though its implementation is server-only.

Use a server-only DAL, parameterized queries and minimal DTOs. Do not spread an ORM user/entity into props. Read queries need owner/tenant predicates just as writes do. A shared cache is another data boundary: no public catalog cache for session-specific profile data. Per-request memoization is different from caching one user's result across requests. Never trust a client-supplied userId, role, price or ownership flag.

## Opaque-session contract and concrete database boundary

A proven authentication library/provider is the preferred login/session integration. This example demonstrates the verification contract with an existing opaque session, so the data-access rules can be independently understood. After a successful authenticated login, a session issuer must generate32cryptographically random bytes, send the base64url token only in a Secure/HttpOnly/Path=/ cookie named __Host-session (no Domain, appropriate SameSite), and persist only its SHA256 hash with user/expiry/revocation state. Rotate on privilege/login transitions and revoke on logout. Do not build a password login merely by setting an arbitrary user ID cookie.

```sql
-- Integration schema; app_user is supplied by the chosen authentication integration.
CREATE TABLE app_session (
  token_hash text PRIMARY KEY CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  user_id uuid NOT NULL REFERENCES app_user(id),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz
);
CREATE TABLE private_note (
  id uuid PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES app_user(id),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0)
);
CREATE INDEX private_note_owner_idx ON private_note(owner_id);
```

```ts
// lib/db.ts — Node runtime, provision DATABASE_URL outside source control.
import 'server-only';
import { Pool } from 'pg';
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL required');
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5, connectionTimeoutMillis: 3000, statement_timeout: 3000
});
```

Pool size is a workload/deployment budget, not5per-instance everywhere. Reuse one pool per production process; a dev HMR strategy may reuse it through a guarded global. Use the provider's verified TLS configuration, never disable certificate verification to “fix” connectivity. A one-off script closes its pool in finally; a server pool lives until process shutdown. Serverless instance counts can exhaust database limits; use appropriate pooling/proxy configuration and measure.

```ts
// lib/session.ts
import 'server-only';
import { createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import { pool } from './db';
export async function currentActor(): Promise<{ id: string } | null> {
  const token = (await cookies()).get('__Host-session')?.value;
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const hash = createHash('sha256').update(token).digest('hex');
  const result = await pool.query<{ user_id: string }>(
    `SELECT user_id FROM app_session
     WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > now()`, [hash]
  );
  return result.rows[0] ? { id: result.rows[0].user_id } : null;
}
```

The session issuer is deliberately outside this verifier; seed a fixture session through a test-only setup in the separate exercise application, then integrate a real provider. Hashing a high-entropy opaque token is different from password hashing: passwords need an adaptive password hash. HttpOnly limits script access to the cookie, but XSS can still issue authenticated actions. SameSite is useful defense-in-depth, not a complete CSRF policy. Local HTTP development cannot be assumed to behave like deployed HTTPS secure cookies.

## Validation and conditional authorization: one write

```ts
// lib/note-input.ts — pure boundary parser, reusable by handler and action.
export type RenameInput = { id: string; title: string; version: number };
export function parseRename(value: unknown): RenameInput | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (Object.keys(record).some(key => !['id', 'title', 'version'].includes(key))) return null;
  const { id, title, version } = record;
  if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null;
  if (typeof title !== 'string' || !Number.isInteger(version) || (version as number) < 1 || (version as number) > 2147483646) return null;
  const normalized = title.trim();
  if (normalized.length < 1 || normalized.length > 100) return null;
  return { id, title: normalized, version: version as number };
}
```

This intentionally uses a conservative100UTF16-code-unit UI bound, which is stricter than PostgreSQL's character count for supplementary characters. Decide normalization/grapheme policy for the product; validation is not HTML escaping or a replacement for output-context safety. Reject unknown JSON fields to prevent silent mass assignment; use a schema library when more fields/cross-field rules justify it.

```ts
// lib/notes.ts
import 'server-only';
import { pool } from './db';
import type { RenameInput } from './note-input';
export async function renameOwned(actorId: string, input: RenameInput) {
  const result = await pool.query<{ id: string; title: string; version: number }>(
    `UPDATE private_note SET title = $1, version = version + 1
     WHERE id = $2 AND owner_id = $3 AND version = $4
     RETURNING id, title, version`,
    [input.title, input.id, actorId, input.version]
  );
  return result.rows[0] ?? null;
}
```

Ownership/version predicates participate in the write rather than a separate check-then-update race. Concurrent edits with the same version cannot both win. A null result intentionally does not distinguish absent, unauthorized and stale-version resources; the UI can request an authorized refresh rather than exposing ownership. For tenant/role policies, encode the relevant predicates/transaction rules too. Session revocation mid-request has a policy window; high-risk operations may require transaction-bound session/permission revalidation or step-up authentication.

A version check is not general idempotency. A lost response after commit means replaying the same version fails safely but does not return the original success. Payments/job creation need a durable idempotency record with caller/key/request fingerprint, atomic claim and stored result. Disabling a button is only a UI affordance, not a server duplicate-execution guarantee.

## Route Handler: explicit HTTP boundary and CSRF policy

Route Handlers use Web Request/Response APIs; do not put page.tsx and route.ts at the same route path. This cookie-authenticated browser endpoint requires an exact configured source Origin; missing/null/mismatched origins fail closed. Non-browser clients use a separately designed authentication/CSRF contract rather than bypassing this check. Keep GET/HEAD free of state changes.

```ts
// lib/http-input.ts
export class InputError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export async function readSmallJson(request: Request, limit = 4096, timeoutMs = 3000): Promise<unknown> {
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    throw new InputError(415, 'JSON required');
  }
  if (!request.body) throw new InputError(400, 'Body required');
  const reader = request.body.getReader();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new InputError(408, 'Body deadline exceeded')), timeoutMs);
  });
  try {
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    while (true) {
      const part = await Promise.race([reader.read(), deadline]);
      if (part.done) break;
      bytes += part.value.byteLength;
      if (bytes > limit) throw new InputError(413, 'Body too large');
      chunks.push(part.value);
    }
    const joined = new Uint8Array(bytes);
    let offset = 0;
    for (const chunk of chunks) { joined.set(chunk, offset); offset += chunk.byteLength; }
    try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(joined)); }
    catch { throw new InputError(400, 'Invalid JSON'); }
  } finally {
    clearTimeout(timer);
    void reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
```

The limit counts received bytes rather than trusting Content-Length. Configure ingress/runtime body/time/concurrency limits too; one received chunk may already have been allocated before this reader rejects it. Rejected async cleanup is consumed, not used as an unlimited wait. Stream/body cancellation and platform request lifetimes need integration tests under the actual deployment.

```ts
// app/api/notes/route.ts
import { currentActor } from '../../../lib/session';
import { parseRename } from '../../../lib/note-input';
import { renameOwned } from '../../../lib/notes';
import { InputError, readSmallJson } from '../../../lib/http-input';
export const runtime = 'nodejs';
function reply(status: number, body: unknown) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });
}
export async function PATCH(request: Request) {
  try {
    const origin = process.env.APP_ORIGIN;
    if (!origin) throw new Error('APP_ORIGIN required'); // Exact canonical HTTPS origin in production.
    if (request.headers.get('origin') !== origin) return reply(403, { error: 'Request origin denied' });
    const actor = await currentActor();
    if (!actor) return reply(401, { error: 'Sign in required' });
    const input = parseRename(await readSmallJson(request));
    if (!input) return reply(400, { error: 'Invalid note edit' });
    const updated = await renameOwned(actor.id, input);
    return updated ? reply(200, updated) : reply(409, { error: 'Unavailable or changed; refresh your notes' });
  } catch (error) {
    if (error instanceof InputError) return reply(error.status, { error: error.message });
    // Server observability records a safe correlation ID; never credentials/raw bodies.
    return reply(500, { error: 'Unable to save note' });
  }
}
```

Do not derive trusted target origin from arbitrary forwarded headers. Configure the canonical origin from trusted deployment settings and test every ingress path. Strict JSON plus same-origin policy reduces CSRF exposure; CORS is not authentication and should not allow arbitrary credentialed origins. Where browser workflows cannot supply trusted origin information, use a designed token defense instead of accepting missing headers. HTTP failures such as database unavailability must not become401 “bad credentials.”

## Server Action: the same trust boundary, another transport

```ts
// app/notes/actions.ts
'use server';
import { currentActor } from '../../lib/session';
import { parseRename } from '../../lib/note-input';
import { renameOwned } from '../../lib/notes';
import { revalidatePath } from 'next/cache';
export async function renameNote(form: FormData) {
  const actor = await currentActor(); // Recheck inside action, even if page redirects unauthenticated users.
  if (!actor) return { ok: false, error: 'Sign in required' };
  const rawVersion = form.get('version');
  const input = parseRename({
    id: form.get('id'), title: form.get('title'),
    version: typeof rawVersion === 'string' && /^[1-9][0-9]{0,9}$/.test(rawVersion) ? Number(rawVersion) : NaN
  });
  if (!input) return { ok: false, error: 'Invalid note edit' };
  const updated = await renameOwned(actor.id, input);
  if (!updated) return { ok: false, error: 'Unavailable or changed; refresh your notes' };
  revalidatePath('/notes'); // Fixed application-owned path, after the write succeeds.
  return { ok: true, note: updated };
}
```

Build a labeled native form with hidden id/version plus title and submit; use action-state/pending UI to render expected validation/conflict results. Hidden/bound fields are untrusted inputs. Framework action origin checks and POST handling are additional CSRF defenses, not authorization. Configure allowed origins narrowly for trusted proxies; do not assume custom Route Handlers inherit all Server Action protections. Unexpected action failures should reach safe error handling/server diagnostics; expected user errors return data. No automatic infinite retry and no redirect swallowed inside a broad catch.

## Environment and secret management

DATABASE_URL/provider credentials stay server-side in a secret store/environment, never committed .env files or public props. NEXT_PUBLIC values are browser-visible and normally inlined at build time; promoting one built artifact does not magically replace its public values at runtime. A server-only import guards module misuse, not every serialization/logging leak. Validate required variables at the intended lifecycle (build versus runtime) and fail safely without dumping secrets. Source maps, build logs, error payloads, analytics and cache keys also require review. Rotate exposed credentials and rebuild/redeploy affected client artifacts; deleting a source literal does not revoke a secret.

## Practice and acceptance evidence

Implement this in the separate pinned Next/PostgreSQL exercise application with two users/notes and valid, expired and revoked fixture sessions; integrate the chosen authentication provider before calling it a usable login system. Apply migrations/test fixtures outside this notes repository and outside any protected src/tests directory.

Acceptance: malformed/no cookie fails; owner can edit; another owner/forged userId cannot; two simultaneous same-version writes produce exactly one success; stale retries cannot duplicate a write; extra JSON fields/malformed UTF8/oversized/stalled bodies fail within limits; missing/null/cross-site origin fails; database outage yields safe operational failure; no raw session token/secret/private data in HTML/RSC/client bundle/logs/shared caches. Verify cookie attributes over HTTPS and server-action direct invocation. Test pending/error/focus recovery without relying on a disabled button for integrity. Record actual typecheck, tests, production build/start, DB concurrency and browser results.

The notes provide material and worked boundaries; no live provider, database migration, Next build, CSRF attack simulation or learner evidence has been executed here. Mocked reader/query checks are useful contract checks but do not establish deployment security or professional readiness.

## Official references

Checked2026-10-20: [Next authentication](https://nextjs.org/docs/app/guides/authentication), [data security and action protections](https://nextjs.org/docs/app/guides/data-security), [Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route), [environment variables](https://nextjs.org/docs/app/guides/environment-variables), [node-postgres parameterized queries](https://node-postgres.com/features/queries), [OWASP CSRF prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html), [OWASP session management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).
