# Verify signed webhooks before applying effects

A webhook is an untrusted HTTP request until its required verification succeeds. HMAC shows that the sender knows a shared secret and that the signed bytes were not changed. **It neither encrypts the data nor proves the business claims are true.** Use a maintained SDK for a real provider. This local protocol does not become compatible with Stripe or another provider simply because both use signatures.

## Define the protocol and persistence boundary

Node24/Express5.3/Zod4.6/pg8.23/PostgreSQL16. A trusted catalogue provider sends one each of `X-Hook-Key`, `X-Hook-Time` and `X-Hook-Signature`, plus an application/json body. The key ID selects a deployment-owned active key; it is not a URL or path. Time is exactly10 decimal Unix seconds. The signature is lowercase hex HMAC-SHA256 over the ASCII timestamp, a dot and **the exact raw request bytes**. Reject a timestamp more than300seconds in the past or future; synchronize server clocks and monitor skew. The body limit is16KiB with compression disabled. Rate/concurrency/header limits belong at ingress too.

The event schema is `{id: UUID, kind: 'catalogue.updated', entity: UUID}`. A fixed integration owns its own authorized catalogue scope. In a multi-tenant integration resolve provider/account→tenant through server configuration and include that tenant in effect queries; never accept arbitrary signed tenant IDs as global authority. The small effect table below models a local projection only.

Source in `docs/workbench/node-js/security/webhook-lab/webhook.mjs`:

<<< ../workbench/node-js/security/webhook-lab/webhook.mjs

Copy this into an isolated ESM exercise, install the pinned dependencies and execute `schema` in a disposable database. Generate each key with `randomBytes(32)`; load real keys from a secret manager and never commit/print them. Instantiate `webhookApp(pool, new Map([['current',key]]))`, listen on loopback, and close the HTTP server and bounded pool when done. Set connection/statement deadlines, as in the other PostgreSQL labs. Mount this raw parser before any global JSON parser at the webhook route. `JSON.stringify(JSON.parse(body))` is not the original signed byte sequence: whitespace and key order can change it.

Reject missing or repeated signature headers before framework parsing can hide duplicates. Also reject unknown keys, invalid hexadecimal digests, stale/future timestamps and bad signatures. `timingSafeEqual` compares only equal-length decoded digests; the surrounding parsing and key lookup are not promised to take constant time. **Verify the signature before interpreting JSON**, then validate the event schema. Return fixed errors without signatures, bodies, keys or raw database errors. Parser 415/413 errors differ from authentication 401; correctly signed but invalid business JSON returns 400.

## Rotation, duplicates and recovery

During rotation keep current and previous trusted keys for a bounded overlap agreed with the provider, then remove the previous key and monitor failure categories. A request-selected key ID cannot add a key. Emergency revocation may deliberately break old retries. Use a different secret per integration/environment; a global shared secret expands the blast radius. If the provider's official SDK signs a different timestamp/header structure, follow that exact contract instead of reusing this example.

A timestamp window rejects old captured requests, but not two copies inside that window or a later provider retry with a fresh timestamp. **Save a durable `(source,eventID)` receipt in the same transaction as the local effect.** Concurrent duplicates coordinate through uniqueness and return 204 without applying the effect again. Reusing an ID with different bytes returns 409 for investigation. This example deliberately treats differently serialized bodies as different, even if their JSON meaning is equal. Follow the real provider's identity rules when those differ.

If commit succeeds and the response is lost, the provider retries; the receipt makes the local effect safe. If the transaction fails, it rolls back and503 permits bounded provider retry. Acknowledging before the durable commit loses work. For an external email/payment, persist an outbox intent in this transaction, return quickly and let an idempotent worker execute/reconcile it. Do not claim this local transaction covers an external network effect.

Keep receipts at least as long as the provider's documented event-ID replay/redelivery horizon and your restoration window; unlimited receipt retention is simple but needs a budget. Deleting receipts blindly after300seconds defeats long-lived ID deduplication.

A webhook path is not a browser cookie endpoint and normally uses its provider signature instead of browser CSRF. Do not globally disable CSRF on unrelated routes. Restrict accepted provider integrations, current business authority, TLS, request budgets and alerts separately. A provider IP allowlist can be defense in depth; it is not signature verification.

## Run the checks, then extend the integration

The persisted `webhook-lab/check.mjs` recreates only its study tables and requires `STUDY_DATABASE_URL` pointing to a disposable database. Run it from an isolated directory beside `webhook.mjs`. It starts a loopback HTTP server and closes that server/pool.

**Actually checked2026-10-26:** successful request; repeated/concurrent delivery with one effect per event; altered raw whitespace with old signature rejected; past/future301second skew rejected; valid previous key during overlap then rejected after removal; unknown key denied; signed malformed JSON400; same-ID/different-body409. These are real HTTP/PostgreSQL checks, not a real provider delivery or TLS deployment. No live provider account was used.

[Related practice](../practice/node-js/signed-webhooks.md).

Official references checked2026-10-26: [Stripe raw-body signature guidance](https://docs.stripe.com/webhooks/signature), [Node HMAC/timing-safe comparison](https://nodejs.org/api/crypto.html), [PostgreSQL uniqueness and ON CONFLICT](https://www.postgresql.org/docs/16/sql-insert.html). Stripe is an authoritative example of provider-specific raw-body requirements, not this fixture's protocol.
