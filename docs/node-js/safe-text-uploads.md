# A Bounded Text Upload and Its Threat Model

This Node 24/Express 5/PostgreSQL 16/Zod 4 lab accepts only small UTF-8 text files. The server generates a storage key, keeps the file private and checks current access before returning it as a fixed text attachment. The base endpoint does not accept multipart data, images, PDFs, archives, remote URLs or executable-content processing. The separate multipart variant below accepts only the same size-limited text format. **Changing a MIME string does not make a new format safe to process.** Other formats need their own maintained parsers, inspection and isolation rules.

## Assets, boundaries and abuse cases

Assets are private uploaded bytes, metadata/ownership, session credentials, server files, storage capacity and trustworthy operation state. The browser/body/headers are untrusted. The guard owns current identity, permission and cookie-CSRF checks; PostgreSQL owns metadata state; a private application-owned directory owns bytes. The HTTP response/log boundary must never reveal another owner's content or raw storage errors.

| Abuse case | Control in this flow | Verification / residual risk |
|---|---|---|
| Anonymous or cross-user download | Guard plus tenant/subject predicates on every metadata query | Unknown/foreign/expired IDs get the same404; in-flight authorized requests cannot be retroactively undone |
| Cookie-based cross-site upload | Existing session/Origin/CSRF middleware before body parsing | Guard adapter must implement it; a text parser or valid session alone is not CSRF protection |
| Traversal/overwrite through filename | No caller filename/path; random UUID storage key; exclusive create | Hostile filename headers cannot select storage; trusted root/parents must not be attacker-writable |
| Large/compressed/malformed bytes |8KiB parser limit, no inflation, strict UTF-8/control policy | Upstream request/rate/concurrency/storage quotas still required; this is not flood protection |
| HTML/script content | Never interpret it; fixed text/plain attachment and nosniff | Safe use depends on download headers and UI text rendering; do not embed uploaded HTML |
| Partial write or ambiguous finalization | Pending reservation, ready-only download, owner status/reconciliation | Crash cleanup/TTL needed; DB+filesystem are not an atomic commit |
| Stale/corrupted bytes | Expected byte count and SHA256 checked before response | Hash is integrity metadata, not authorization or protection from a compromised server/root |
| Parser exploit/remote fetch | No complex parser, subprocess or URL fetch exists | A later image/PDF feature needs a new threat model and isolated processing |

The table records a concrete design and residual risks, not certification or an observed security incident. Revisit when adding formats, public sharing, CDN delivery, scanners, quotas, object storage or a new identity/tenant policy. Assign a real owner/review date before deploying; keep controls linked to tests rather than mark every threat “solved.”

## Metadata states before exposing bytes

Use an isolated scratch database and directory. A trusted upload guard returns a small actor only after authentication and per-intent permission checks; for browser cookies it must also verify CSRF/Origin on write. The runnable application supplies that primary session design. The guard below is an integration port, not a second fake login implementation. SQL binds the actual actor, never a body/header owner field.

```sql
CREATE TABLE text_uploads (
  id uuid PRIMARY KEY,
  tenant text NOT NULL,
  subject text NOT NULL,
  storage_key uuid NOT NULL UNIQUE,
  bytes integer NOT NULL CHECK (bytes BETWEEN 1 AND 8192),
  sha256 text NOT NULL CHECK (sha256 ~ '^[a-f0-9]{64}$'),
  state text NOT NULL CHECK (state IN ('pending','ready')),
  expires_at timestamptz NOT NULL
);
```

<<< ../workbench/node-js/security/uploads/text-upload-app.ts

## What the state machine guarantees—and what it leaves open

The database reservation starts as pending before file work begins. A file becomes ready only after writing and closing succeed. Download requires ready, unexpired metadata belonging to the current owner. The read allocates no more than 8,193 bytes and checks for truncation, extra bytes and checksum mismatch before sending. **Uploaded text is never rendered as HTML.** Filename headers are ignored, and HTML-looking text remains attachment bytes. This checks size-limited valid text and permitted controls; it is not malware scanning or proof that any named file format is safe.

The root/parent tree is private and not attacker-writable; files are server-created and immutable. This is not an attacker-writable filesystem sandbox. Do not expose arbitrary roots, symlinks, file names or paths through the API. A compromised server/root is outside this fixture's guarantee. A real storage adapter may use no-follow/open-relative primitives or versioned object storage under a stronger threat model. Current actor values come only from the guard; do not deserialize an actor from a source/body/model response.

A missing reserve/finalize acknowledgement does not prove the database write failed. The code returns a server-generated ID with a controlled pending outcome instead of blindly deleting bytes that may belong to a committed ready row. **Use the authenticated status route to resolve an uncertain outcome.** Missing, pending and ready states require different UI recovery. A crash can leave a pending row and file, so cleanup and monitoring must cover partial and abandoned files as well as ready ones.

This endpoint is not idempotent across new POSTs: an automatic retry can create another object. Add a durable caller-operation policy before promising duplicate-upload prevention, as explained in the [approved-write recovery lesson](../python-for-ai/approved-writes.md).

The table here is distinct from the generic retention fixture. Integrate its pending/ready metadata and private keys into the [retention/deletion adapter](./retention-and-deletion.md) explicitly; copying that sweeper without changing its table does not clean these uploads. Authentication expires access immediately; cleanup deletes owned bytes/metadata and retries safely. Do not orphan files by deleting metadata first. Record only safe counts/state/error categories, not raw text, tokens, actor credentials or absolute paths.

An 8 KiB request limit does not impose disk quotas per user or tenant, limit all concurrent uploads or prevent a service-wide flood. Authenticate and limit admission before parsing. Deployment still needs database/file deadlines, storage quotas, cleanup and expiry indexes. Upload permission is checked when work is accepted; sensitive revocation during active work needs a stronger transaction/current-membership rule. **Download permission is checked again on every request.** This lab provides neither public sharing nor arbitrary deletion.

## Practice and acceptance

[Exercises and learner checklist](../practice/node-js/safe-text-uploads.md).

## Complete multipart variant with atomic PostgreSQL storage

For small notes, storing the bytes and ownership in one PostgreSQL row avoids the database/filesystem finalization gap. This variant accepts one `note` file part with a declared text/plain type, then validates actual bytes as nonblank strict UTF-8 without forbidden controls. MIME is an admission hint, never evidence of safe content. Original filenames are ignored, including traversal-like names. Text resembling HTML is served only as a fixed attachment with nosniff. This deliberately remains an8KiB text feature; PDF/image/archive validation and malware scanning are different projects.

Source: `docs/workbench/node-js/security/upload-lab/multipart.mjs`. Copy it into an isolated ESM exercise with Node24, Express5.3.0, Busboy1.6.0 and pg8.23.1. Create an owned PostgreSQL16 database, execute the exported `schema` once as a migration, create a bounded `pg.Pool` with connection/statement deadlines, and pass it plus the trusted session/CSRF guard to `multipartApp`. Close HTTP then the pool using the existing lifecycle owner. Do not change Autocode-supplied database credentials or tests.

<<< ../workbench/node-js/security/upload-lab/multipart.mjs

The parser limits total parsing time to five seconds, file content to 8 KiB and the full multipart request to 16 KiB. It rejects fields, multiple files and unsupported compression, and waits for all parts before inserting the row. Busboy emits `partsLimit` when the configured count is reached. Its cap is therefore 2, while the application still accepts exactly one file and forbids other fields. A cap of 1 incorrectly rejected the valid single-part test; that was corrected and retested. **The wire-byte limit covers multipart framing as well as file content.**

The installed Busboy1.6 source uses an internal header-pair bound; this example deliberately avoids an ineffective per-parser headerPairs override and requires ingress header limits as well. Its pipeline may destroy a malformed/oversized request socket; clients must handle a disconnected upload as well as a controlled400. Do not promise a JSON error after a destroyed connection.

**Abandoned work:** no row or private file exists during parsing, so cancellation, timeout and parser failure leave no persisted artifact. The INSERT stores bytes/metadata together. A lost response after commit is still ambiguous: query a durable client-operation receipt if adding automatic retry, or explicitly warn that a fresh POST may duplicate the note. The sample does not claim idempotency.

Expiry immediately denies downloads. `sweepExpired` locks/deletes at most100 expired rows atomically; repeated sweeps are safe and concurrent sweepers skip locked rows. No filesystem orphan can exist in this storage variant. Large objects belong in a separately designed object-store flow with pending state and reconciliation; bytea is appropriate only under this narrow size/rate budget.

Authorization occurs before expensive parsing and on every download. The guard must supply current tenant/subject and write permission; a cookie client must also pass the existing Origin/CSRF policy. Never implement that guard by trusting an actor header in a real app. The validation fixture uses an explicitly synthetic header only to exercise storage scoping. Global concurrent-admission limits, tenant quotas, storage budget, TLS and ingress request/header limits remain deployment obligations; a per-request cap does not replace them.

**Validation performed2026-10-26:** real parser accepted Unicode and ignored a hostile filename; rejected oversize, invalid UTF-8, controls, blank text, wrong part name and malformed framing. Actual local Express/PostgreSQL16 checks verified201, exact inert attachment bytes, nosniff, owner200/foreign404/anonymous401, expiry404, one deleted row and idempotent empty cleanup. Pool/server closed. No scanner, image decoder, native-browser attachment observation or real session middleware integration is claimed.

[Related practice](../practice/node-js/safe-text-uploads.md).

Official references: [Busboy limits and stream consumption](https://github.com/mscdex/busboy), [OWASP upload controls](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html), [Node stream pipeline](https://nodejs.org/api/stream.html#streampipelinesource-transforms-destination-callback), [PostgreSQL locking](https://www.postgresql.org/docs/16/sql-select.html#SQL-FOR-UPDATE-SHARE).
