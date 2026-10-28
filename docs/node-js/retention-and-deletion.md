# Retention, Expiry and Enforced Deletion

Continue the primary Node24/PostgreSQL16 stack. A retention policy needs a named data class, start event, duration/expiry, owner, access rule, deletion mechanism and evidence of deletion/failure. “We rotate logs” or “tokens expire” does not establish removal from databases, uploads, indexes, caches, replicas, exports or backups. Inventory derivatives and providers explicitly; never promise deletion from systems this application does not control.

## A deliberately small policy

The following durations are **teaching product choices**, not legal requirements or recommended universal periods. A real product owner must justify necessity, security, contractual/legal constraints and exceptions before deployment.

| Class | Fixture expiry event | Access and deletion rule |
|---|---|---|
| Temporary demo data | Creation+30days | Reads exclude expired records; sweeper physically removes eligible rows |
| Projected operational logs | Event+7days | No raw secrets/payloads; remove eligible log rows and separately configure hosted sink/export retention |
| Opaque session record | Issuance+15minutes | Authentication rejects expired/revoked session immediately, regardless of sweep timing; retain only reviewed hashes/metadata, never raw tokens |
| Temporary upload | Creation+24hours | Expired file unavailable through the application; delete owned bytes and metadata under the same eligibility policy |

Store explicit expires_at from a trusted server clock/policy version; a model/client may not extend it. JWT verification must enforce its own signature/issuer/audience/exp/revocation policy independently of database cleanup. Keeping a record for an approved hold never makes an expired token valid. This fixture's legal_hold flag represents an authorized retention exception, not a legal analysis: audit who can set/clear it, why, expiry/review and access restrictions. A normal user or injected source cannot toggle it.

## One PostgreSQL metadata table and an owned file root

Initialize only an isolated scratch database. A real application should use reviewed migrations, explicit non-null/foreign keys/business schemas and least-privilege roles instead of treating this generic table as the entire domain model.

```sql
CREATE TABLE retention_items (
  id uuid PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN ('data','log','session','upload')),
  expires_at timestamptz NOT NULL,
  legal_hold boolean NOT NULL DEFAULT false,
  storage_key text,
  payload jsonb NOT NULL DEFAULT '{}',
  CHECK ((kind = 'upload' AND storage_key IS NOT NULL AND storage_key ~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$')
      OR (kind <> 'upload' AND storage_key IS NULL))
);
CREATE INDEX retention_due ON retention_items (expires_at, id) WHERE NOT legal_hold;
```

payload holds synthetic fixture data only. Production data classes need reviewed field-level minimization/encryption/access controls; a JSON column is not permission to store tokens or arbitrary request bodies. Upload keys are opaque server-assigned immutable identifiers, never client filenames/paths. Put files directly under a private application-owned root, outside static hosting. Allocate a new nonreused key and exclusive file creation, record its metadata and enforce authenticated current access before download. Deny expired records at read time; cleanup lag must not extend availability.

```ts
// retention-sweep.ts
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod';
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const Item = z.object({ id: z.string().regex(uuid),
  kind: z.enum(['data', 'log', 'session', 'upload']), storage_key: z.string().regex(uuid).nullable() }).strict();
type Client = {
  query(sql: string, parameters?: unknown[]): Promise<{ rows: unknown[] }>;
  release(): void;
};
export async function purgeExpired(pool: { connect(): Promise<Client> }, ownedRoot: string,
  now: Date, batch = 10): Promise<number> {
  if (!Number.isFinite(now.getTime()) || !Number.isInteger(batch) || batch < 1 || batch > 100)
    throw new TypeError('Invalid sweep policy');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(`SELECT id::text,kind,storage_key FROM retention_items
      WHERE expires_at <= $1::timestamptz AND NOT legal_hold
      ORDER BY expires_at,id LIMIT $2 FOR UPDATE SKIP LOCKED`, [now.toISOString(), batch]);
    for (const raw of result.rows) {
      const item = Item.parse(raw);
      if (item.kind === 'upload') {
        if (item.storage_key === null) throw new Error('Invalid upload metadata');
        try { await unlink(join(ownedRoot, `${item.storage_key}.bin`)); }
        catch (error) {
          if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error;
        }
      } else if (item.storage_key !== null) throw new Error('Invalid retention metadata');
      await client.query('DELETE FROM retention_items WHERE id=$1::uuid', [item.id]);
    }
    await client.query('COMMIT');
    return result.rows.length;
  } catch (error) {
    try { await client.query('ROLLBACK'); }
    catch (rollbackError) { throw new AggregateError([error, rollbackError], 'Retention rollback failed'); }
    throw error;
  } finally { client.release(); }
}
```

The pool/client port adapts the actual pg driver; SQL values are parameterized and driver/server statement/acquisition timeouts remain mandatory. Use a role allowed to delete only these owned classes and a deployment-specific trusted root. The function is not a multi-tenant public deletion API; scheduled cleanup is a privileged service job with a global policy. User-triggered deletion requires a separate authenticated tenant/resource query and appropriate audit/confirmation policy.

The root and its parent directory tree are application-controlled and cannot be replaced by an untrusted user. A UUID leaf contains no separator; unlink removes that leaf (including a symlink itself) rather than following its target. This is not a general path sandbox for attacker-writable parent directories. Do not accept ownedRoot from a request/model/tool or expose the directory through static hosting. Keys must be immutable and never reassigned to a new file during delayed cleanup/retry; versioned object IDs/tombstones are a production alternative when reuse is possible.

## Expiry is immediate; physical cleanup is retryable

The transaction locks eligible rows and skips rows another worker currently owns. A bounded batch avoids loading every record, and an index helps find due work. A held row is excluded; an authorized hold update competing with a locked row must wait and verify whether it still exists. It cannot retroactively restore a file deleted before the hold was accepted. Record/update holds through an explicit privileged workflow. Do not advertise a deletion guarantee while a hold or unavailable storage legitimately prevents completion.

For this small local-file fixture, the DB row lock is held while unlink executes. That simplifies ownership but increases lock duration and does not make filesystem+DB one atomic transaction. If a later row fails, DB deletes roll back but already removed expired files stay gone. The application denies expired objects regardless, and retry treats ENOENT as already removed and then deletes metadata. A crash after unlink/before commit similarly recovers.

A real object-store/network deletion should use a durable deletion/outbox state machine, bounded retries/deadlines and versioned object IDs rather than keep a database transaction open across remote calls.

Never catch every unlink error and mark deletion successful: permission/disk/I/O failure leaves metadata for diagnosis/retry and produces a failing sweep. Log only a fixed failure category and safe counts in routine telemetry, not payload/path/token. Monitor oldest eligible age, eligible/deleted/failed counts, held records, batch duration and repeated failure. An empty batch is not proof that every provider/cache/backup copy was erased. A request timeout or crashed worker cannot be declared successful without authoritative state reconciliation.

Schedule through the application's owned jobs lifecycle: stop intake at shutdown, await the active batch before closing the pool and keep a final deadline. Do not start an unowned setInterval(async...) that overlaps batches forever. Limit per-run batches/elapsed time, then reschedule with monitored lag; SKIP LOCKED alone does not impose aggregate rate or prevent starvation. Test a locked old row and ensure later sweeps eventually revisit it.

## Derivatives, backups and policy changes

Data deletion must include dependent rows, search chunks/vectors, summaries/caches, upload variants and approved exports under their own ownership. Revoke access immediately while physical cleanup proceeds; invalidate old cache/index references. Backups may expire on a separate reviewed rotation, with restricted access and a restore process that reapplies deletion/revocation records. Do not promise instant byte erasure from immutable backups or managed provider logs without verifying their actual contract. The sample implements only table rows and local files; it supplies no provider/backend backup guarantee.

When shortening a period, backfill existing expires_at under reviewed scope/rate controls and observe deletion lag. When extending it, do not resurrect already deleted/revoked objects or silently retain more private data without the required product policy. Clock skew, time zones and timestamp conversion matter: persist UTC instants and use the database/server-owned time contract consistently. Review active/held/failed records against a policy version rather than only a global constant in a codebase.

## Practice and acceptance

[Exercises and learner checklist](../practice/node-js/retention-and-deletion.md).
