# Deterministic Cursor Pagination

Use keyset pagination for a growing ordered feed when “continue after this row” matters more than “jump to page37.” OFFSET is simpler for small/admin result sets and arbitrary page numbers, but skipped rows still cost work and concurrent inserts can shift page boundaries. Neither approach automatically creates a snapshot across HTTP requests.

This worked path uses Node24, TypeScript5.9, Express5.3, Zod4.6 and MikroORM7.2/PostgreSQL16. It extends the [SQL workbench](../workbench/node-js/database/sql-queries.md) with a tenant-scoped orders API. The server must authorize reading that tenant's orders; a cursor is never an access credential.

## Contract and data model

The API accepts only status=paid/draft/cancelled, sort=newest, limit1–100 and an optional opaque cursor. Unsupported query keys, duplicate values and other sorts are rejected. A different sort needs its own SQL predicate/index/cursor contract, not a user-controlled ORDER BY string.

```sql
CREATE TABLE feed_orders (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  status text NOT NULL CHECK (status IN ('paid', 'draft', 'cancelled')),
  total_cents integer NOT NULL CHECK (total_cents >= 0),
  created_at timestamptz NOT NULL
);
CREATE INDEX feed_orders_page_idx
  ON feed_orders(tenant_id, status, created_at DESC, id DESC);
```

Use actual tenant foreign keys in the complete domain. ID and created_at are immutable ordering keys under the write policy. Both are non-null. Descending continuation uses `(created_at,id) < (cursor_time,cursor_id)`, matching ORDER BY created_at DESC,id DESC. ID breaks timestamp ties. Mixed-direction sorts require a different comparison, and nullable keys need explicit handling.

PostgreSQL timestamps can retain microseconds; JavaScript Date retains milliseconds. Converting a database position to Date and back can skip or repeat rows. The SQL below projects exactly six fractional digits in UTC as text and the codec keeps that text intact. The example bounds dates to ordinary four-digit AD years rather than PostgreSQL's entire date range.

## Signed scoped cursor and query boundary

<<< ../workbench/node-js/database/pagination/order-pages.ts

The cursor's HMAC binds the position to the tenant, filter and sort. It protects integrity, not confidentiality: the Base64URL body is readable. Never place secrets or sensitive row data in it. The tenant remains derived from authenticated membership on every request. Replaying a cursor cannot widen the SQL tenant predicate. Page size may change between requests; its cap is always revalidated. A cursor-key rotation invalidates old cursors with400; clients restart the feed.

Use a separate randomly generated secret loaded from validated configuration, not a password/default or the access-token key. A production rotation policy can retain a small allowlisted set of key IDs with an explicit retirement period.

The decoder bounds input before decoding, verifies the signature before trusting JSON and rejects unknown versions/shapes/scopes. A successful signature is not sufficient without schema validation. This cursor has no expiry; that is acceptable for this read continuation contract, provided authorization/filter/size checks always run. Add a bounded expiry if retention/privacy/product rules require one. Do not log full cursor/query strings.

## Express and request-scoped ORM wiring

<<< ../workbench/node-js/database/pagination/order-router.ts

The required authorization middleware must authenticate and authorize reading tenant orders before tenantFor returns a context. Reuse the [authentication boundary](./module-09-authentication-authorization.md); these injected adapters make the trust dependency explicit. Do not replace the middleware with a check that an Authorization header merely exists. Use the production request logging/error handler and database deadlines from [production lifecycle](./module-10-production-ready-applications.md). Successful responses contain only ID, timestamp, amount and continuation; permission/tenant metadata is absent.

The API fetches limit+1 rows to decide whether another page exists, returns only limit rows and places the cursor after the last returned row, not the extra row. This bounds materialized results to101. A database adapter must honor the SQL LIMIT; schema validation alone does not stop an arbitrary adapter from allocating unbounded data before returning.

## What concurrent changes mean

This is a live descending feed under ordinary statement snapshots. After page1, a newer insert sorts before its cursor and will appear on refresh, not page2. Inserts with older keys can appear on later pages; deletions disappear. Immutable keys prevent an existing row moving across the boundary, but changes to eligibility/status can still affect which rows appear. Document that behavior rather than promise a frozen export.

For a consistent export, use an owned server-side snapshot/export job or materialized result with expiry and storage limits. Keeping a database transaction open across interactive HTTP page requests ties up resources and conflicts with failover/connection pooling; a cursor alone does not preserve that transaction's snapshot. An as-of timestamp can bound new keys but does not reconstruct historical updates/deletes without versioned data.

On the client, changing sort/filter resets the cursor chain and aborts/ignores stale requests. Preserve a bounded page window for infinite scrolling and support keyboard/focus behavior; see the [large-data UI lesson](../senior_growth/React/complex-forms-and-data.md). A signed cursor does not solve frontend race conditions.

## Practice and acceptance

[Exercises and learner checklist](../practice/node-js/cursor-pagination.md).
